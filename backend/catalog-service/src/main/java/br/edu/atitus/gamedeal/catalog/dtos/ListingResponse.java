package br.edu.atitus.gamedeal.catalog.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Anúncio devolvido pela API.
 * price está sempre em BRL. displayPrice/displayCurrency trazem o valor convertido
 * quando o cliente pede outra moeda (via currency-service).
 * platformFee e sellerReceives correspondem à tela "Revisar Anúncio" (taxa de 10%).
 */
public record ListingResponse(
        Long id,
        Long sellerId,
        String sellerName,
        String title,
        String description,
        String category,
        String subcategory,
        String rarity,
        GameResponse game,
        BigDecimal price,
        Integer quantity,
        Integer soldCount,
        String status,
        List<String> images,
        BigDecimal platformFee,
        BigDecimal sellerReceives,
        BigDecimal displayPrice,
        String displayCurrency,
        LocalDateTime createdAt
) {
}
