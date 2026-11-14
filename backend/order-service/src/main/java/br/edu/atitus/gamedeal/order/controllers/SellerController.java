package br.edu.atitus.gamedeal.order.controllers;

import br.edu.atitus.gamedeal.order.dtos.ReviewResponse;
import br.edu.atitus.gamedeal.order.dtos.SellerSummaryResponse;
import br.edu.atitus.gamedeal.order.services.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Reputação pública dos vendedores (rotas públicas). */
@RestController
@RequestMapping("/sellers")
public class SellerController {

    private final ReviewService reviewService;

    public SellerController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{sellerId}/summary")
    public ResponseEntity<SellerSummaryResponse> summary(@PathVariable Long sellerId) {
        return ResponseEntity.ok(reviewService.sellerSummary(sellerId));
    }

    @GetMapping("/{sellerId}/reviews")
    public ResponseEntity<List<ReviewResponse>> reviews(@PathVariable Long sellerId) {
        return ResponseEntity.ok(reviewService.sellerReviews(sellerId));
    }
}
