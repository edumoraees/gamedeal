package br.edu.atitus.gamedeal.gateway.filters;

import br.edu.atitus.gamedeal.gateway.components.JwtValidator;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Autenticação stateless no Gateway.
 * 1) Remove sempre os cabeçalhos de identidade enviados pelo cliente (evita falsificação).
 * 2) Em rotas /ws/**, exige "Authorization: Bearer <jwt>" válido.
 * 3) Repassa a identidade aos microservices em X-User-Id / X-User-Email / X-User-Name / X-User-Type,
 *    sem que eles precisem conhecer a senha ou validar o token de novo.
 */
@Component
public class AuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuthFilter.class);
    private static final String PROTECTED_PREFIX = "/ws/";
    private static final List<String> IDENTITY_HEADERS =
            List.of("X-User-Id", "X-User-Email", "X-User-Name", "X-User-Type");

    private final JwtValidator jwtValidator;

    public AuthFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        ServerHttpRequest sanitized = request.mutate()
                .headers(h -> IDENTITY_HEADERS.forEach(h::remove))
                .build();

        // Rotas públicas e preflight CORS seguem sem identidade.
        if (!path.startsWith(PROTECTED_PREFIX) || HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange.mutate().request(sanitized).build());
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Token de acesso ausente");
        }

        Optional<Claims> claims = jwtValidator.validate(authHeader.substring(7));
        if (claims.isEmpty()) {
            log.warn("JWT inválido ou expirado em {} {}", request.getMethod(), path);
            return unauthorized(exchange, "Token inválido ou expirado");
        }

        Claims c = claims.get();
        Long userId = c.get("id", Long.class);
        String email = c.get("email", String.class);
        String username = c.get("username", String.class);
        String type = c.get("type", String.class);
        if (userId == null || email == null || username == null) {
            return unauthorized(exchange, "Token sem identidade completa");
        }

        ServerHttpRequest authenticated = sanitized.mutate().headers(h -> {
            h.set("X-User-Id", userId.toString());
            h.set("X-User-Email", email);
            h.set("X-User-Name", username);
            h.set("X-User-Type", type == null ? "COMMON" : type);
        }).build();

        return chain.filter(exchange.mutate().request(authenticated).build());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = """
                {"timestamp":"%s","status":401,"error":"Unauthorized","message":"%s","path":"%s","details":[]}"""
                .formatted(LocalDateTime.now(), message, exchange.getRequest().getURI().getPath());
        var buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        // Antes do roteamento para os microservices.
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
