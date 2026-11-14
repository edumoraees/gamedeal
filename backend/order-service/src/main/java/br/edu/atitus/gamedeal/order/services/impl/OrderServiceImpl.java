package br.edu.atitus.gamedeal.order.services.impl;

import br.edu.atitus.gamedeal.order.dtos.*;
import br.edu.atitus.gamedeal.order.entities.OrderEntity;
import br.edu.atitus.gamedeal.order.entities.OrderStatus;
import br.edu.atitus.gamedeal.order.exceptions.ApiException;
import br.edu.atitus.gamedeal.order.repositories.OrderRepository;
import br.edu.atitus.gamedeal.order.repositories.ReviewRepository;
import br.edu.atitus.gamedeal.order.services.CatalogGateway;
import br.edu.atitus.gamedeal.order.services.OrderService;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final CatalogGateway catalog;
    private final BigDecimal serviceFeeRate;
    private final BigDecimal platformFeeRate;

    public OrderServiceImpl(OrderRepository orderRepository,
                            ReviewRepository reviewRepository,
                            CatalogGateway catalog,
                            @Value("${app.service-fee-rate:0.025}") BigDecimal serviceFeeRate,
                            @Value("${app.platform-fee-rate:0.10}") BigDecimal platformFeeRate) {
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.catalog = catalog;
        this.serviceFeeRate = serviceFeeRate;
        this.platformFeeRate = platformFeeRate;
    }

    @Override
    public QuoteResponse quote(Long buyerId, Long listingId, int quantity) {
        if (quantity < 1) throw new ApiException(HttpStatus.BAD_REQUEST, "Quantidade mínima é 1");
        var listing = callCatalog(() -> catalog.findListing(listingId));
        validatePurchasable(buyerId, listing, quantity);

        BigDecimal subtotal = money(listing.price().multiply(BigDecimal.valueOf(quantity)));
        BigDecimal fee = money(subtotal.multiply(serviceFeeRate));
        return new QuoteResponse(listing.id(), listing.title(), listing.firstImage(), listing.sellerName(),
                listing.game().name(), listing.price(), quantity, listing.quantity(), subtotal, fee,
                serviceFeeRate, subtotal.add(fee));
    }

    @Override
    @Transactional
    public OrderResponse create(Long buyerId, String buyerName, CreateOrderRequest request) {
        int qty = request.quantity();

        // 1) Consulta o anúncio no catálogo (com Retry/Circuit Breaker) e valida as regras de compra.
        var listing = callCatalog(() -> catalog.findListing(request.listingId()));
        validatePurchasable(buyerId, listing, qty);

        // 2) Reserva o estoque de forma atômica no catálogo.
        var reserved = callCatalog(() -> catalog.reserve(listing.id(), qty));

        // 3) Registra o pedido. Se falhar, devolve o estoque (compensação).
        try {
            BigDecimal subtotal = money(reserved.price().multiply(BigDecimal.valueOf(qty)));
            BigDecimal fee = money(subtotal.multiply(serviceFeeRate));
            BigDecimal sellerNet = money(subtotal.subtract(subtotal.multiply(platformFeeRate)));

            var order = new OrderEntity();
            order.setBuyerId(buyerId);
            order.setBuyerName(buyerName);
            order.setSellerId(reserved.sellerId());
            order.setSellerName(reserved.sellerName());
            order.setListingId(reserved.id());
            order.setListingTitle(reserved.title());
            order.setListingImage(reserved.firstImage());
            order.setCategory(reserved.category());
            order.setGameName(reserved.game().name());
            order.setUnitPrice(reserved.price());
            order.setQuantity(qty);
            order.setSubtotal(subtotal);
            order.setServiceFee(fee);
            order.setTotal(subtotal.add(fee));
            order.setSellerNet(sellerNet);
            order.setStatus(OrderStatus.PAID);

            var saved = orderRepository.saveAndFlush(order);
            log.info("Pedido criado id={} buyer={} listing={} qtd={} total={}",
                    saved.getId(), buyerId, reserved.id(), qty, saved.getTotal());
            return OrderResponse.from(saved, false);
        } catch (RuntimeException ex) {
            log.error("Falha ao gravar pedido; devolvendo estoque do listing={}", listing.id(), ex);
            try {
                catalog.release(listing.id(), qty);
            } catch (Exception releaseEx) {
                log.error("Não foi possível devolver o estoque do listing={}", listing.id(), releaseEx);
            }
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível concluir o pedido");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> myPurchases(Long buyerId) {
        Set<Long> reviewed = new HashSet<>(reviewRepository.findReviewedOrderIdsByBuyer(buyerId));
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream()
                .map(o -> OrderResponse.from(o, reviewed.contains(o.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> mySales(Long sellerId) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(o -> OrderResponse.from(o, reviewRepository.existsByOrderId(o.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findById(Long userId, Long orderId) {
        var order = getOrThrow(orderId);
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId))
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não participa deste pedido");
        return OrderResponse.from(order, reviewRepository.existsByOrderId(orderId));
    }

    @Override
    @Transactional
    public OrderResponse confirmReceipt(Long buyerId, Long orderId) {
        var order = getOrThrow(orderId);
        if (!order.getBuyerId().equals(buyerId))
            throw new ApiException(HttpStatus.FORBIDDEN, "Somente o comprador pode confirmar o recebimento");
        if (order.getStatus() != OrderStatus.PAID)
            throw new ApiException(HttpStatus.CONFLICT, "Este pedido não está aguardando confirmação");

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        log.info("Pedido concluído id={} (valor liberado ao vendedor {})", orderId, order.getSellerId());
        return OrderResponse.from(orderRepository.save(order), false);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse dashboard(Long userId) {
        return new DashboardResponse(
                orderRepository.countBySellerIdAndStatus(userId, OrderStatus.COMPLETED),
                orderRepository.countBySellerIdAndStatus(userId, OrderStatus.PAID),
                orderRepository.sumSellerNet(userId, OrderStatus.COMPLETED),
                orderRepository.sumSellerNet(userId, OrderStatus.PAID),
                orderRepository.countByBuyerIdAndStatus(userId, OrderStatus.COMPLETED));
    }

    // ===================== Auxiliares =====================

    private void validatePurchasable(Long buyerId, ListingSnapshot listing, int quantity) {
        if (listing.sellerId().equals(buyerId))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Você não pode comprar o seu próprio anúncio");
        if (!"ACTIVE".equals(listing.status()))
            throw new ApiException(HttpStatus.CONFLICT, "Anúncio indisponível para compra");
        if (listing.quantity() < quantity)
            throw new ApiException(HttpStatus.CONFLICT, "Estoque insuficiente. Disponível: " + listing.quantity());
    }

    /**
     * Traduz falhas da comunicação com o catálogo em respostas claras para o cliente:
     * erros 4xx do catálogo mantêm o status e a mensagem; indisponibilidade vira 503.
     */
    private <T> T callCatalog(Supplier<T> call) {
        try {
            return call.get();
        } catch (HttpClientErrorException ex) {
            throw new ApiException(HttpStatus.valueOf(ex.getStatusCode().value()), extractMessage(ex));
        } catch (CallNotPermittedException ex) {
            log.warn("Circuit breaker do catalog-service ABERTO: requisição recusada imediatamente");
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Catálogo temporariamente indisponível. Tente novamente em instantes.");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Falha ao chamar catalog-service: {}", ex.toString());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Catálogo temporariamente indisponível. Tente novamente em instantes.");
        }
    }

    private String extractMessage(HttpClientErrorException ex) {
        try {
            var body = ex.getResponseBodyAs(CatalogError.class);
            if (body != null && body.message() != null) return body.message();
        } catch (Exception ignored) {
            // corpo fora do formato esperado
        }
        return ex.getStatusCode().value() == 404 ? "Anúncio não encontrado" : "Requisição recusada pelo catálogo";
    }

    private OrderEntity getOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }

    private static BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    record CatalogError(String message) {
    }
}
