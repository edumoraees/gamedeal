package br.edu.atitus.gamedeal.catalog.dtos;

import br.edu.atitus.gamedeal.catalog.entities.ListingCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/** Dados enviados nas telas "Novo Anúncio" e "Detalhes do Item". */
public record ListingRequest(
        @NotBlank(message = "Nome do item é obrigatório")
        @Size(max = 120, message = "Nome do item deve ter no máximo 120 caracteres")
        String title,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 10, max = 2000, message = "Descrição deve ter entre 10 e 2000 caracteres")
        String description,

        @NotNull(message = "Categoria é obrigatória")
        ListingCategory category,

        @Size(max = 40, message = "Subcategoria deve ter no máximo 40 caracteres")
        String subcategory,

        @Size(max = 30, message = "Raridade deve ter no máximo 30 caracteres")
        String rarity,

        @NotNull(message = "Jogo é obrigatório")
        Long gameId,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
        @Digits(integer = 10, fraction = 2, message = "Preço inválido")
        BigDecimal price,

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        @Max(value = 9999, message = "Quantidade máxima é 9999")
        Integer quantity,

        @Size(max = 3, message = "Envie no máximo 3 fotos")
        List<@NotBlank @Size(max = 500) String> images
) {
}
