package br.edu.atitus.gamedeal.order.dtos;

import java.math.BigDecimal;

/** Reputação pública do vendedor (tela de Perfil e Detalhe do item). */
public record SellerSummaryResponse(Long sellerId, BigDecimal averageRating, long reviewCount,
                                    BigDecimal positivePercent, long completedSales) {
}
