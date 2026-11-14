package br.edu.atitus.gamedeal.catalog.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Usado pelo order-service para reservar ou devolver estoque. */
public record ReserveRequest(
        @NotNull @Min(value = 1, message = "Quantidade mínima é 1") @Max(9999) Integer quantity) {
}
