package br.edu.atitus.gamedeal.auth.exceptions;

import java.time.LocalDateTime;
import java.util.List;

/** Formato padrão de erro devolvido por todas as APIs do GameDeal. */
public record ErrorResponse(LocalDateTime timestamp, int status, String error, String message,
                            String path, List<String> details) {
}
