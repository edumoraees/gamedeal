package br.edu.atitus.gamedeal.catalog.clients;

import br.edu.atitus.gamedeal.catalog.dtos.RateResponse;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/** Cliente declarativo do currency-service. O endereço é resolvido pelo Consul (lb://currency-service). */
@HttpExchange("/currencies")
public interface CurrencyClient {

    @GetExchange("/rate")
    RateResponse getRate(@RequestParam("source") String source, @RequestParam("target") String target);
}
