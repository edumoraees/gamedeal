package br.edu.atitus.gamedeal.order.services;

import br.edu.atitus.gamedeal.order.clients.CatalogClient;
import br.edu.atitus.gamedeal.order.dtos.ListingSnapshot;
import br.edu.atitus.gamedeal.order.dtos.ReserveRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

/**
 * Comunicação order-service -> catalog-service com resiliência (instâncias configuradas no Consul KV):
 *  - Timeout: no RestClient (CatalogClientConfig).
 *  - Retry: só em operações idempotentes (consulta e devolução de estoque).
 *  - Circuit Breaker: em todas. Com o circuito aberto, as chamadas falham na hora (CallNotPermittedException)
 *    em vez de esperar o timeout, protegendo o order-service.
 * Erros 4xx do catálogo (404, 409) são regras de negócio e estão em ignore-exceptions: não contam como falha.
 */
@Component
public class CatalogGateway {

    private final CatalogClient client;

    public CatalogGateway(CatalogClient client) {
        this.client = client;
    }

    @Retry(name = "catalog-service")
    @CircuitBreaker(name = "catalog-service")
    public ListingSnapshot findListing(Long listingId) {
        return client.findById(listingId);
    }

    /** Sem Retry: reservar estoque não é idempotente (uma repetição poderia reservar em dobro). */
    @CircuitBreaker(name = "catalog-service")
    public ListingSnapshot reserve(Long listingId, int quantity) {
        return client.reserve(listingId, new ReserveRequest(quantity));
    }

    @Retry(name = "catalog-service")
    @CircuitBreaker(name = "catalog-service")
    public void release(Long listingId, int quantity) {
        client.release(listingId, new ReserveRequest(quantity));
    }
}
