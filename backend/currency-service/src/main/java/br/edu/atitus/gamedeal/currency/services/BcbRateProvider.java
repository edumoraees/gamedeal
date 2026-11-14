package br.edu.atitus.gamedeal.currency.services;

import br.edu.atitus.gamedeal.currency.clients.BcbClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Busca a cotação de venda mais recente no Banco Central.
 * Retry (tentativas) e Circuit Breaker configurados no Consul KV com a instância "bcb".
 * Quem chama trata a falha e usa o último valor salvo no banco.
 */
@Component
public class BcbRateProvider {

    private static final Logger log = LoggerFactory.getLogger(BcbRateProvider.class);
    private static final DateTimeFormatter BCB_DATE = DateTimeFormatter.ofPattern("MM-dd-yyyy");

    private final BcbClient client;

    public BcbRateProvider(BcbClient client) {
        this.client = client;
    }

    @Retry(name = "bcb")
    @CircuitBreaker(name = "bcb")
    public BigDecimal fetchRateToBrl(String currencyCode) {
        // Busca os últimos 7 dias para cobrir fins de semana e feriados (sem cotação).
        LocalDate today = LocalDate.now();
        String start = "'" + today.minusDays(7).format(BCB_DATE) + "'";
        String end = "'" + today.format(BCB_DATE) + "'";
        log.info("Consultando BCB para {}", currencyCode);

        var response = client.getQuotes("'" + currencyCode + "'", start, end, "json");
        if (response == null || response.value() == null || response.value().isEmpty()) {
            throw new IllegalStateException("BCB não retornou cotação para " + currencyCode);
        }
        return response.value().getLast().cotacaoVenda();
    }
}
