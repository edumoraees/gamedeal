package br.edu.atitus.gamedeal.currency.controllers;

import br.edu.atitus.gamedeal.currency.dtos.CurrencyInfoResponse;
import br.edu.atitus.gamedeal.currency.dtos.CurrencyResponse;
import br.edu.atitus.gamedeal.currency.services.CurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/currencies")
public class CurrencyController {

    private final CurrencyService service;

    public CurrencyController(CurrencyService service) {
        this.service = service;
    }

    /** Ex.: GET /currencies/rate?source=BRL&target=USD */
    @GetMapping("/rate")
    public ResponseEntity<CurrencyResponse> rate(@RequestParam String source, @RequestParam String target) {
        return ResponseEntity.ok(service.getRate(source, target));
    }

    @GetMapping
    public ResponseEntity<List<CurrencyInfoResponse>> list() {
        return ResponseEntity.ok(service.listCurrencies());
    }
}
