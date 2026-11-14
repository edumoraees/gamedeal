package br.edu.atitus.gamedeal.gateway.configs;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Server-side Discovery: o cliente só conhece o Gateway. "lb://nome" é resolvido no Consul
 * e balanceado entre as instâncias registradas.
 * Rotas /ws/** são protegidas pelo AuthFilter. Não existe rota para /internal/**,
 * então os endpoints internos do catálogo não ficam expostos.
 */
@Configuration
public class RoutesConfig {

    @Bean
    RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // auth-service
                .route("auth-public", r -> r.path("/auth/**").uri("lb://auth-service"))
                .route("auth-protected", r -> r.path("/ws/auth/**").uri("lb://auth-service"))

                // catalog-service
                .route("catalog-public", r -> r.path("/listings", "/listings/**", "/games", "/images/**")
                        .uri("lb://catalog-service"))
                .route("catalog-protected", r -> r.path("/ws/listings", "/ws/listings/**")
                        .uri("lb://catalog-service"))

                // order-service
                .route("order-public", r -> r.path("/sellers/**").uri("lb://order-service"))
                .route("order-protected", r -> r.path("/ws/orders", "/ws/orders/**")
                        .uri("lb://order-service"))

                // currency-service
                .route("currency-public", r -> r.path("/currencies", "/currencies/**")
                        .uri("lb://currency-service"))
                .build();
    }
}
