package br.edu.atitus.gamedeal.currency.services;

import br.edu.atitus.gamedeal.currency.dtos.CurrencyInfoResponse;
import br.edu.atitus.gamedeal.currency.dtos.CurrencyResponse;

import java.util.List;

public interface CurrencyService {

    CurrencyResponse getRate(String source, String target);

    List<CurrencyInfoResponse> listCurrencies();
}
