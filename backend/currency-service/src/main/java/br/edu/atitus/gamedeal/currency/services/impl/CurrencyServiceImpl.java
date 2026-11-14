package br.edu.atitus.gamedeal.currency.services.impl;

import br.edu.atitus.gamedeal.currency.dtos.CurrencyInfoResponse;
import br.edu.atitus.gamedeal.currency.dtos.CurrencyResponse;
import br.edu.atitus.gamedeal.currency.entities.CurrencyEntity;
import br.edu.atitus.gamedeal.currency.exceptions.ApiException;
import br.edu.atitus.gamedeal.currency.repositories.CurrencyRepository;
import br.edu.atitus.gamedeal.currency.services.BcbRateProvider;
import br.edu.atitus.gamedeal.currency.services.CurrencyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CurrencyServiceImpl implements CurrencyService {

    private static final Logger log = LoggerFactory.getLogger(CurrencyServiceImpl.class);

    private final CurrencyRepository repository;
    private final BcbRateProvider bcb;

    public CurrencyServiceImpl(CurrencyRepository repository, BcbRateProvider bcb) {
        this.repository = repository;
        this.bcb = bcb;
    }

    @Override
    @Transactional
    public CurrencyResponse getRate(String source, String target) {
        String from = normalize(source);
        String to = normalize(target);

        if (from.equals(to)) {
            return new CurrencyResponse(from, to, BigDecimal.ONE, "SAME", LocalDateTime.now());
        }

        var fromRate = rateToBrl(from);
        var toRate = rateToBrl(to);

        // 1 FROM = fromRate BRL; 1 TO = toRate BRL  =>  1 FROM = fromRate / toRate TO
        BigDecimal rate = fromRate.value().divide(toRate.value(), MathContext.DECIMAL64)
                .setScale(6, RoundingMode.HALF_UP);
        String provider = (fromRate.fromBcb() && toRate.fromBcb()) ? "BCB" : "CACHE";
        return new CurrencyResponse(from, to, rate, provider, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CurrencyInfoResponse> listCurrencies() {
        return repository.findAll().stream().map(CurrencyInfoResponse::from).toList();
    }

    /** Cotação da moeda em reais: tenta o BCB e, se falhar, usa o último valor salvo. */
    private Rate rateToBrl(String code) {
        CurrencyEntity entity = repository.findById(code)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Moeda não suportada: " + code));

        if ("BRL".equals(code)) return new Rate(BigDecimal.ONE, true);

        try {
            BigDecimal fresh = bcb.fetchRateToBrl(code);
            entity.setRateToBrl(fresh);
            entity.setUpdatedAt(LocalDateTime.now());
            repository.save(entity);
            return new Rate(fresh, true);
        } catch (Exception ex) {
            log.warn("BCB indisponível para {} ({}). Usando cotação salva de {}",
                    code, ex.getClass().getSimpleName(), entity.getUpdatedAt());
            return new Rate(entity.getRateToBrl(), false);
        }
    }

    private String normalize(String code) {
        if (code == null || !code.trim().matches("[A-Za-z]{3}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Código de moeda inválido: " + code);
        }
        return code.trim().toUpperCase();
    }

    private record Rate(BigDecimal value, boolean fromBcb) {
    }
}
