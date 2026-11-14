package br.edu.atitus.gamedeal.currency.dtos;

import java.math.BigDecimal;
import java.util.List;

/** Resposta da API PTAX do Banco Central (somente os campos usados). */
public record BcbResponse(List<Quote> value) {

    public record Quote(BigDecimal cotacaoVenda, String dataHoraCotacao) {
    }
}
