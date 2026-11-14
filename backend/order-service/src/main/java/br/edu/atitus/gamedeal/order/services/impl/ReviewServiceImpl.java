package br.edu.atitus.gamedeal.order.services.impl;

import br.edu.atitus.gamedeal.order.dtos.ReviewRequest;
import br.edu.atitus.gamedeal.order.dtos.ReviewResponse;
import br.edu.atitus.gamedeal.order.dtos.SellerSummaryResponse;
import br.edu.atitus.gamedeal.order.entities.OrderStatus;
import br.edu.atitus.gamedeal.order.entities.ReviewEntity;
import br.edu.atitus.gamedeal.order.exceptions.ApiException;
import br.edu.atitus.gamedeal.order.repositories.OrderRepository;
import br.edu.atitus.gamedeal.order.repositories.ReviewRepository;
import br.edu.atitus.gamedeal.order.services.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public ReviewResponse review(Long buyerId, String buyerName, Long orderId, ReviewRequest request) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        if (!order.getBuyerId().equals(buyerId))
            throw new ApiException(HttpStatus.FORBIDDEN, "Somente o comprador pode avaliar este pedido");
        if (order.getStatus() != OrderStatus.COMPLETED)
            throw new ApiException(HttpStatus.CONFLICT, "Confirme o recebimento antes de avaliar o vendedor");
        if (reviewRepository.existsByOrderId(orderId))
            throw new ApiException(HttpStatus.CONFLICT, "Este pedido já foi avaliado");

        var review = new ReviewEntity();
        review.setOrder(order);
        review.setSellerId(order.getSellerId());
        review.setBuyerId(buyerId);
        review.setBuyerName(buyerName);
        review.setRating(request.rating());
        review.setComment(request.comment() == null ? null : request.comment().trim());
        review.setTags(request.tags() == null ? null : request.tags().stream()
                .map(String::trim).filter(t -> !t.isEmpty()).map(t -> t.replace(",", " "))
                .distinct().collect(Collectors.joining(",")));

        var saved = reviewRepository.save(review);
        log.info("Avaliação registrada order={} seller={} nota={}", orderId, order.getSellerId(), request.rating());
        return ReviewResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> sellerReviews(Long sellerId) {
        return reviewRepository.findTop20BySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(ReviewResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SellerSummaryResponse sellerSummary(Long sellerId) {
        long count = reviewRepository.countBySellerId(sellerId);
        Double avg = reviewRepository.averageRating(sellerId);
        long positive = reviewRepository.countBySellerIdAndRatingGreaterThanEqual(sellerId, 4);

        BigDecimal average = avg == null ? BigDecimal.ZERO : BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);
        BigDecimal positivePercent = count == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(positive * 100.0 / count).setScale(1, RoundingMode.HALF_UP);
        long completedSales = orderRepository.countBySellerIdAndStatus(sellerId, OrderStatus.COMPLETED);
        return new SellerSummaryResponse(sellerId, average, count, positivePercent, completedSales);
    }
}
