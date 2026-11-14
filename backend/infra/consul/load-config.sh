#!/bin/sh
# =============================================================================
# Centralized Configuration: grava no Consul KV todas as configurações dos
# microservices. Cada serviço lê "config/application/*" (comum a todos) e
# "config/<nome-do-serviço>/*" ao iniciar (spring.config.import=consul:).
#
# Segredos (senha do banco e chave JWT) NÃO estão aqui: chegam por variáveis
# de ambiente vindas do arquivo .env (fora do Git).
# =============================================================================
set -eu

: "${DB_USER:?defina DB_USER no .env}"
: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
: "${JWT_SECRET:?defina JWT_SECRET no .env}"

echo "Aguardando o Consul..."
until consul members >/dev/null 2>&1; do sleep 2; done

put() { consul kv put "$1" "$2" >/dev/null; }

echo "Gravando configurações comuns (config/application)..."
A=config/application
# Service Discovery: auto-registro com IP do container e health check do Actuator
put $A/spring.cloud.consul.discovery.prefer-ip-address "true"
put $A/spring.cloud.consul.discovery.instance-id '${spring.application.name}:${random.value}'
put $A/spring.cloud.consul.discovery.health-check-path "/actuator/health"
put $A/spring.cloud.consul.discovery.health-check-interval "10s"
put $A/spring.cloud.consul.discovery.tags "gamedeal,metrics"
# Actuator / métricas
put $A/management.endpoints.web.exposure.include "health,info,prometheus,metrics"
put $A/management.endpoint.health.show-details "always"
put $A/management.metrics.tags.application '${spring.application.name}'
put $A/management.metrics.distribution.percentiles-histogram.http.server.requests "true"
# Tracing (Zipkin) - 100% das requisições para facilitar a demonstração
put $A/management.tracing.sampling.probability "1.0"
put $A/management.tracing.export.zipkin.endpoint "http://zipkin:9411/api/v2/spans"
put $A/management.zipkin.tracing.endpoint "http://zipkin:9411/api/v2/spans"
# Logs com traceId/spanId (correlação logs <-> traces no Grafana)
put $A/logging.include-application-name "false"
put $A/logging.pattern.correlation '[${spring.application.name:},%X{traceId:-},%X{spanId:-}] '
# JPA / Flyway
put $A/spring.jpa.hibernate.ddl-auto "validate"
put $A/spring.jpa.open-in-view "false"
put $A/spring.flyway.enabled "true"
# Taxas do marketplace
put $A/app.platform-fee-rate "0.10"
put $A/app.service-fee-rate "0.025"

# ---------------------------------------------------------------- auth-service
S=config/auth-service
put $S/server.port "8081"
put $S/spring.datasource.url "jdbc:postgresql://auth-db:5432/db_auth"
put $S/spring.datasource.username "$DB_USER"
put $S/spring.datasource.password "$DB_PASSWORD"
put $S/jwt.secret "$JWT_SECRET"
put $S/jwt.expiration-ms "86400000"

# ------------------------------------------------------------- catalog-service
S=config/catalog-service
put $S/server.port "8082"
put $S/spring.datasource.url "jdbc:postgresql://catalog-db:5432/db_catalog"
put $S/spring.datasource.username "$DB_USER"
put $S/spring.datasource.password "$DB_PASSWORD"
put $S/app.images.dir "/data/images"
put $S/spring.servlet.multipart.max-file-size "5MB"
put $S/spring.servlet.multipart.max-request-size "6MB"
# catalog -> currency: Timeout + Retry + Circuit Breaker
put $S/app.clients.currency.connect-timeout-ms "1000"
put $S/app.clients.currency.read-timeout-ms "2000"
put $S/resilience4j.retry.instances.currency-service.max-attempts "3"
put $S/resilience4j.retry.instances.currency-service.wait-duration "500ms"
put $S/resilience4j.retry.instances.currency-service.ignore-exceptions[0] "org.springframework.web.client.HttpClientErrorException"
put $S/resilience4j.retry.instances.currency-service.ignore-exceptions[1] "io.github.resilience4j.circuitbreaker.CallNotPermittedException"
put $S/resilience4j.circuitbreaker.instances.currency-service.sliding-window-type "COUNT_BASED"
put $S/resilience4j.circuitbreaker.instances.currency-service.sliding-window-size "10"
put $S/resilience4j.circuitbreaker.instances.currency-service.minimum-number-of-calls "5"
put $S/resilience4j.circuitbreaker.instances.currency-service.failure-rate-threshold "50"
put $S/resilience4j.circuitbreaker.instances.currency-service.wait-duration-in-open-state "30s"
put $S/resilience4j.circuitbreaker.instances.currency-service.permitted-number-of-calls-in-half-open-state "2"
put $S/resilience4j.circuitbreaker.instances.currency-service.ignore-exceptions[0] "org.springframework.web.client.HttpClientErrorException"
put $S/resilience4j.retry.retry-aspect-order "100"
put $S/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

# --------------------------------------------------------------- order-service
S=config/order-service
put $S/server.port "8083"
put $S/spring.datasource.url "jdbc:postgresql://order-db:5432/db_order"
put $S/spring.datasource.username "$DB_USER"
put $S/spring.datasource.password "$DB_PASSWORD"
# order -> catalog: Timeout + Retry + Circuit Breaker
put $S/app.clients.catalog.connect-timeout-ms "1000"
put $S/app.clients.catalog.read-timeout-ms "3000"
put $S/resilience4j.retry.instances.catalog-service.max-attempts "3"
put $S/resilience4j.retry.instances.catalog-service.wait-duration "500ms"
put $S/resilience4j.retry.instances.catalog-service.ignore-exceptions[0] "org.springframework.web.client.HttpClientErrorException"
put $S/resilience4j.retry.instances.catalog-service.ignore-exceptions[1] "io.github.resilience4j.circuitbreaker.CallNotPermittedException"
put $S/resilience4j.circuitbreaker.instances.catalog-service.sliding-window-type "COUNT_BASED"
put $S/resilience4j.circuitbreaker.instances.catalog-service.sliding-window-size "10"
put $S/resilience4j.circuitbreaker.instances.catalog-service.minimum-number-of-calls "5"
put $S/resilience4j.circuitbreaker.instances.catalog-service.failure-rate-threshold "50"
put $S/resilience4j.circuitbreaker.instances.catalog-service.wait-duration-in-open-state "30s"
put $S/resilience4j.circuitbreaker.instances.catalog-service.permitted-number-of-calls-in-half-open-state "2"
put $S/resilience4j.circuitbreaker.instances.catalog-service.ignore-exceptions[0] "org.springframework.web.client.HttpClientErrorException"
put $S/resilience4j.retry.retry-aspect-order "100"
put $S/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

# ------------------------------------------------------------ currency-service
S=config/currency-service
put $S/server.port "8084"
put $S/spring.datasource.url "jdbc:postgresql://currency-db:5432/db_currency"
put $S/spring.datasource.username "$DB_USER"
put $S/spring.datasource.password "$DB_PASSWORD"
put $S/app.bcb.base-url "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata"
put $S/app.bcb.connect-timeout-ms "2000"
put $S/app.bcb.read-timeout-ms "5000"
put $S/resilience4j.retry.instances.bcb.max-attempts "2"
put $S/resilience4j.retry.instances.bcb.wait-duration "1s"
put $S/resilience4j.retry.instances.bcb.ignore-exceptions[0] "io.github.resilience4j.circuitbreaker.CallNotPermittedException"
put $S/resilience4j.circuitbreaker.instances.bcb.sliding-window-type "COUNT_BASED"
put $S/resilience4j.circuitbreaker.instances.bcb.sliding-window-size "5"
put $S/resilience4j.circuitbreaker.instances.bcb.minimum-number-of-calls "3"
put $S/resilience4j.circuitbreaker.instances.bcb.failure-rate-threshold "50"
put $S/resilience4j.circuitbreaker.instances.bcb.wait-duration-in-open-state "60s"
put $S/resilience4j.retry.retry-aspect-order "100"
put $S/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

# --------------------------------------------------------------------- gateway
S=config/gateway
put $S/server.port "8080"
put $S/jwt.secret "$JWT_SECRET"
put $S/app.cors.allowed-origins "*"

echo "Configurações carregadas no Consul KV com sucesso."
