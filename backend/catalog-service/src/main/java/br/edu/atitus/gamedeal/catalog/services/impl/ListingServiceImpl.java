package br.edu.atitus.gamedeal.catalog.services.impl;

import br.edu.atitus.gamedeal.catalog.dtos.*;
import br.edu.atitus.gamedeal.catalog.entities.*;
import br.edu.atitus.gamedeal.catalog.exceptions.ApiException;
import br.edu.atitus.gamedeal.catalog.repositories.GameRepository;
import br.edu.atitus.gamedeal.catalog.repositories.ListingRepository;
import br.edu.atitus.gamedeal.catalog.services.CurrencyConversionService;
import br.edu.atitus.gamedeal.catalog.services.ListingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ListingServiceImpl implements ListingService {

    private static final Logger log = LoggerFactory.getLogger(ListingServiceImpl.class);
    private static final String BASE_CURRENCY = "BRL";
    private static final int MAX_PAGE_SIZE = 50;

    private final ListingRepository listingRepository;
    private final GameRepository gameRepository;
    private final CurrencyConversionService currencyService;
    private final BigDecimal platformFeeRate;

    public ListingServiceImpl(ListingRepository listingRepository,
                              GameRepository gameRepository,
                              CurrencyConversionService currencyService,
                              @Value("${app.platform-fee-rate:0.10}") BigDecimal platformFeeRate) {
        this.listingRepository = listingRepository;
        this.gameRepository = gameRepository;
        this.currencyService = currencyService;
        this.platformFeeRate = platformFeeRate;
    }

    // ===================== Consultas públicas =====================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> search(ListingCategory category, Long gameId, Long sellerId,
                                                String subcategory, String search, String currency,
                                                int page, int size, String sort) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), parseSort(sort));
        var result = listingRepository.search(ListingStatus.ACTIVE, category, gameId, sellerId,
                blankToNull(subcategory), blankToNull(search), pageable);

        // Uma única consulta de cotação por requisição, reaproveitada para todos os itens da página.
        BigDecimal rate = resolveRate(currency);
        String displayCurrency = rate == null ? BASE_CURRENCY : currency.toUpperCase();
        var content = result.getContent().stream().map(l -> toResponse(l, rate, displayCurrency)).toList();
        return PageResponse.of(result, content);
    }

    @Override
    @Transactional(readOnly = true)
    public ListingResponse findPublicById(Long id, String currency) {
        var listing = getOrThrow(id);
        if (listing.getStatus() == ListingStatus.REMOVED)
            throw new ApiException(HttpStatus.NOT_FOUND, "Anúncio não encontrado");
        BigDecimal rate = resolveRate(currency);
        return toResponse(listing, rate, rate == null ? BASE_CURRENCY : currency.toUpperCase());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameResponse> listGames() {
        return gameRepository.findAll(Sort.by("name")).stream().map(GameResponse::from).toList();
    }

    // ===================== Área do vendedor =====================

    @Override
    @Transactional
    public ListingResponse create(Long sellerId, String sellerName, ListingRequest request) {
        var listing = new ListingEntity();
        listing.setSellerId(sellerId);
        listing.setSellerName(sellerName);
        apply(listing, request);
        listing.setStatus(ListingStatus.ACTIVE);
        var saved = listingRepository.save(listing);
        log.info("Anúncio criado id={} seller={} categoria={}", saved.getId(), sellerId, saved.getCategory());
        return toResponse(saved, null, BASE_CURRENCY);
    }

    @Override
    @Transactional
    public ListingResponse update(Long sellerId, Long listingId, ListingRequest request) {
        var listing = getOwnedOrThrow(sellerId, listingId);
        apply(listing, request);
        if (listing.getStatus() == ListingStatus.SOLD_OUT && listing.getQuantity() > 0)
            listing.setStatus(ListingStatus.ACTIVE);
        return toResponse(listingRepository.save(listing), null, BASE_CURRENCY);
    }

    @Override
    @Transactional
    public ListingResponse changeStatus(Long sellerId, Long listingId, ListingStatusRequest request) {
        var listing = getOwnedOrThrow(sellerId, listingId);
        var target = request.status();
        if (target == ListingStatus.SOLD_OUT || target == ListingStatus.REMOVED)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use ACTIVE ou PAUSED");
        if (target == ListingStatus.ACTIVE && listing.getQuantity() == 0)
            throw new ApiException(HttpStatus.CONFLICT, "Anúncio sem estoque. Atualize a quantidade antes.");
        listing.setStatus(target);
        return toResponse(listingRepository.save(listing), null, BASE_CURRENCY);
    }

    @Override
    @Transactional
    public void remove(Long sellerId, Long listingId) {
        var listing = getOwnedOrThrow(sellerId, listingId);
        // Exclusão lógica: pedidos antigos continuam apontando para o anúncio.
        listing.setStatus(ListingStatus.REMOVED);
        listingRepository.save(listing);
        log.info("Anúncio removido id={} seller={}", listingId, sellerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListingResponse> findMine(Long sellerId) {
        return listingRepository.findBySellerIdAndStatusNotOrderByCreatedAtDesc(sellerId, ListingStatus.REMOVED)
                .stream().map(l -> toResponse(l, null, BASE_CURRENCY)).toList();
    }

    // ===================== Uso interno (order-service) =====================

    @Override
    @Transactional(readOnly = true)
    public ListingResponse findInternal(Long id) {
        return toResponse(getOrThrow(id), null, BASE_CURRENCY);
    }

    @Override
    @Transactional
    public ListingResponse reserve(Long id, int quantity) {
        var listing = getOrThrow(id);
        if (listing.getStatus() != ListingStatus.ACTIVE)
            throw new ApiException(HttpStatus.CONFLICT, "Anúncio indisponível para compra");

        int updated = listingRepository.reserveStock(id, quantity, ListingStatus.ACTIVE, ListingStatus.SOLD_OUT);
        if (updated == 0)
            throw new ApiException(HttpStatus.CONFLICT, "Estoque insuficiente para a quantidade solicitada");

        log.info("Estoque reservado listing={} qtd={}", id, quantity);
        return toResponse(getOrThrow(id), null, BASE_CURRENCY);
    }

    @Override
    @Transactional
    public void release(Long id, int quantity) {
        getOrThrow(id);
        listingRepository.releaseStock(id, quantity, ListingStatus.ACTIVE, ListingStatus.SOLD_OUT);
        log.warn("Estoque devolvido listing={} qtd={}", id, quantity);
    }

    // ===================== Auxiliares =====================

    private void apply(ListingEntity listing, ListingRequest request) {
        var game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Jogo informado não existe"));
        listing.setTitle(request.title().trim());
        listing.setDescription(request.description().trim());
        listing.setCategory(request.category());
        listing.setSubcategory(blankToNull(request.subcategory()));
        listing.setRarity(blankToNull(request.rarity()));
        listing.setGame(game);
        listing.setPrice(request.price().setScale(2, RoundingMode.HALF_UP));
        listing.setQuantity(request.quantity());
        listing.setImages(request.images() == null ? new ArrayList<>() : new ArrayList<>(request.images()));
    }

    /** Converte BRL -> moeda pedida. Devolve null (mantém BRL) se não pediu moeda ou se o currency-service falhar. */
    private BigDecimal resolveRate(String currency) {
        if (currency == null || currency.isBlank() || BASE_CURRENCY.equalsIgnoreCase(currency)) return null;
        try {
            return currencyService.getRate(BASE_CURRENCY, currency.trim().toUpperCase()).rate();
        } catch (Exception ex) {
            log.warn("currency-service indisponível ({}). Exibindo preços em BRL.", ex.getClass().getSimpleName());
            return null;
        }
    }

    private ListingResponse toResponse(ListingEntity l, BigDecimal rate, String displayCurrency) {
        BigDecimal fee = l.getPrice().multiply(platformFeeRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal displayPrice = rate == null ? l.getPrice() : l.getPrice().multiply(rate).setScale(2, RoundingMode.HALF_UP);
        return new ListingResponse(
                l.getId(), l.getSellerId(), l.getSellerName(), l.getTitle(), l.getDescription(),
                l.getCategory().name(), l.getSubcategory(), l.getRarity(), GameResponse.from(l.getGame()),
                l.getPrice(), l.getQuantity(), l.getSoldCount(), l.getStatus().name(), List.copyOf(l.getImages()),
                fee, l.getPrice().subtract(fee), displayPrice, displayCurrency, l.getCreatedAt());
    }

    private ListingEntity getOrThrow(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Anúncio não encontrado"));
    }

    private ListingEntity getOwnedOrThrow(Long sellerId, Long listingId) {
        var listing = getOrThrow(listingId);
        if (listing.getStatus() == ListingStatus.REMOVED)
            throw new ApiException(HttpStatus.NOT_FOUND, "Anúncio não encontrado");
        if (!listing.getSellerId().equals(sellerId))
            throw new ApiException(HttpStatus.FORBIDDEN, "Você só pode alterar seus próprios anúncios");
        return listing;
    }

    private Sort parseSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular" -> Sort.by(Sort.Direction.DESC, "soldCount");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
