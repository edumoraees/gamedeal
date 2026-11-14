package br.edu.atitus.gamedeal.currency.exceptions;

import org.springframework.http.HttpStatus;

/** Erro de negócio com o status HTTP que deve ser devolvido ao cliente. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
