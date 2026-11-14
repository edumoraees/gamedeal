package br.edu.atitus.gamedeal.order.services;

import br.edu.atitus.gamedeal.order.dtos.ReviewRequest;
import br.edu.atitus.gamedeal.order.dtos.ReviewResponse;
import br.edu.atitus.gamedeal.order.dtos.SellerSummaryResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse review(Long buyerId, String buyerName, Long orderId, ReviewRequest request);

    List<ReviewResponse> sellerReviews(Long sellerId);

    SellerSummaryResponse sellerSummary(Long sellerId);
}
