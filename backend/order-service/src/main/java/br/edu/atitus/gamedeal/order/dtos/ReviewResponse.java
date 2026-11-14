package br.edu.atitus.gamedeal.order.dtos;

import br.edu.atitus.gamedeal.order.entities.ReviewEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record ReviewResponse(Long id, Long orderId, Long sellerId, Long buyerId, String buyerName, Integer rating,
                             String comment, List<String> tags, LocalDateTime createdAt) {

    public static ReviewResponse from(ReviewEntity r) {
        List<String> tags = (r.getTags() == null || r.getTags().isBlank())
                ? List.of()
                : Arrays.stream(r.getTags().split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList();
        return new ReviewResponse(r.getId(), r.getOrder().getId(), r.getSellerId(), r.getBuyerId(), r.getBuyerName(),
                r.getRating(), r.getComment(), tags, r.getCreatedAt());
    }
}
