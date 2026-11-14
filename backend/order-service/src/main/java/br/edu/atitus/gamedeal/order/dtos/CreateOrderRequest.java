package br.edu.atitus.gamedeal.order.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull(message = "Anúncio é obrigatório") Long listingId,
        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        @Max(value = 99, message = "Quantidade máxima por pedido é 99")
        Integer quantity
) {
}
