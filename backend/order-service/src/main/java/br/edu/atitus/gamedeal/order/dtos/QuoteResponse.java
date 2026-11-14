package br.edu.atitus.gamedeal.order.dtos;

import java.math.BigDecimal;

/** Resumo exibido na tela de finalização ("Secured Transaction Receipt") antes de confirmar a compra. */
public record QuoteResponse(
        Long listingId,
        String title,
        String image,
        String sellerName,
        String gameName,
        BigDecimal unitPrice,
        Integer quantity,
        Integer available,
        BigDecimal subtotal,
        BigDecimal serviceFee,
        BigDecimal serviceFeeRate,
        BigDecimal total
) {
}
