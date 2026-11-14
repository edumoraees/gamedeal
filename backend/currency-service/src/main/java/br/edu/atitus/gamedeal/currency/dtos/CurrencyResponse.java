package br.edu.atitus.gamedeal.currency.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Taxa de conversão de {@code source} para {@code target}.
 * provider indica a origem: SAME (mesma moeda), BCB (Banco Central) ou CACHE (último valor salvo no banco).
 */
public record CurrencyResponse(String source, String target, BigDecimal rate, String provider,
                               LocalDateTime timestamp) {
}
