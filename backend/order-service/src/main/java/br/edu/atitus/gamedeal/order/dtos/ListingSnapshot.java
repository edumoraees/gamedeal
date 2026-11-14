package br.edu.atitus.gamedeal.order.dtos;

import java.math.BigDecimal;
import java.util.List;

/** Dados do anúncio recebidos do catalog-service (somente os campos usados aqui). */
public record ListingSnapshot(
        Long id,
        Long sellerId,
        String sellerName,
        String title,
        String category,
        Game game,
        BigDecimal price,
        Integer quantity,
        String status,
        List<String> images
) {
    public record Game(Long id, String name) {
    }

    public String firstImage() {
        return (images == null || images.isEmpty()) ? null : images.getFirst();
    }
}
