package br.edu.atitus.gamedeal.currency.clients;

import br.edu.atitus.gamedeal.currency.dtos.BcbResponse;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/** Cliente declarativo da API PTAX do Banco Central do Brasil (serviço externo). */
@HttpExchange
public interface BcbClient {

    @GetExchange("/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)")
    BcbResponse getQuotes(@RequestParam("@moeda") String currency,
                          @RequestParam("@dataInicial") String startDate,
                          @RequestParam("@dataFinalCotacao") String endDate,
                          @RequestParam("$format") String format);
}
