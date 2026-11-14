package br.edu.atitus.gamedeal.catalog.dtos;

import br.edu.atitus.gamedeal.catalog.entities.ListingStatus;
import jakarta.validation.constraints.NotNull;

public record ListingStatusRequest(@NotNull(message = "Status é obrigatório") ListingStatus status) {
}
