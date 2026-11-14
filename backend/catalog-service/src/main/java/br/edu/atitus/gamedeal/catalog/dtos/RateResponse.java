package br.edu.atitus.gamedeal.catalog.dtos;

import java.math.BigDecimal;

/** Resposta do currency-service (somente os campos usados aqui). */
public record RateResponse(String source, String target, BigDecimal rate, String provider) {
}
