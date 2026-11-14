package br.edu.atitus.gamedeal.order.clients;

import br.edu.atitus.gamedeal.order.dtos.ListingSnapshot;
import br.edu.atitus.gamedeal.order.dtos.ReserveRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

/** Cliente declarativo dos endpoints internos do catalog-service (resolvido pelo Consul). */
@HttpExchange("/internal/listings")
public interface CatalogClient {

    @GetExchange("/{id}")
    ListingSnapshot findById(@PathVariable("id") Long id);

    @PostExchange("/{id}/reserve")
    ListingSnapshot reserve(@PathVariable("id") Long id, @RequestBody ReserveRequest request);

    @PostExchange("/{id}/release")
    void release(@PathVariable("id") Long id, @RequestBody ReserveRequest request);
}
