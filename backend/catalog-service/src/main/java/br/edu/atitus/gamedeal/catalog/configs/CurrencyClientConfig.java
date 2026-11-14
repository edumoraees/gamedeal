package br.edu.atitus.gamedeal.catalog.configs;

import br.edu.atitus.gamedeal.catalog.clients.CurrencyClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.restclient.autoconfigure.RestClientBuilderConfigurer;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import java.time.Duration;

@Configuration
public class CurrencyClientConfig {

    /**
     * Builder com @LoadBalanced: "http://currency-service" é resolvido no Consul (Client-side Discovery).
     * O configurer aplica os customizadores do Boot, incluindo a propagação do trace (Zipkin).
     */
    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder(RestClientBuilderConfigurer configurer) {
        return configurer.configure(RestClient.builder());
    }

    @Bean
    CurrencyClient currencyClient(RestClient.Builder builder,
                                  @Value("${app.clients.currency.connect-timeout-ms:1000}") long connectTimeoutMs,
                                  @Value("${app.clients.currency.read-timeout-ms:2000}") long readTimeoutMs) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));

        RestClient restClient = builder.clone()
                .baseUrl("http://currency-service")
                .requestFactory(requestFactory)
                .build();

        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(CurrencyClient.class);
    }
}
