package br.edu.atitus.gamedeal.currency.dtos;

import br.edu.atitus.gamedeal.currency.entities.CurrencyEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CurrencyInfoResponse(String code, String name, BigDecimal rateToBrl, LocalDateTime updatedAt) {

    public static CurrencyInfoResponse from(CurrencyEntity e) {
        return new CurrencyInfoResponse(e.getCode(), e.getName(), e.getRateToBrl(), e.getUpdatedAt());
    }
}
