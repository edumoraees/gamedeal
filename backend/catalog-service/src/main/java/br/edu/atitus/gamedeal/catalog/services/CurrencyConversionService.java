package br.edu.atitus.gamedeal.catalog.services;

import br.edu.atitus.gamedeal.catalog.clients.CurrencyClient;
import br.edu.atitus.gamedeal.catalog.dtos.RateResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

/**
 * Comunicação catalog-service -> currency-service.
 * Timeout (no RestClient), Retry e Circuit Breaker (instância "currency-service" no Consul KV).
 * Se falhar, quem chama mostra o preço em BRL: a vitrine continua funcionando.
 */
@Component
public class CurrencyConversionService {

    private final CurrencyClient client;

    public CurrencyConversionService(CurrencyClient client) {
        this.client = client;
    }

    @Retry(name = "currency-service")
    @CircuitBreaker(name = "currency-service")
    public RateResponse getRate(String source, String target) {
        return client.getRate(source, target);
    }
}
