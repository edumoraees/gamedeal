package br.edu.atitus.gamedeal.order.configs;

import br.edu.atitus.gamedeal.order.clients.CatalogClient;
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
public class CatalogClientConfig {

    /** "http://catalog-service" é resolvido no Consul (Client-side Discovery) e o trace é propagado. */
    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder(RestClientBuilderConfigurer configurer) {
        return configurer.configure(RestClient.builder());
    }

    @Bean
    CatalogClient catalogClient(RestClient.Builder builder,
                                @Value("${app.clients.catalog.connect-timeout-ms:1000}") long connectTimeoutMs,
                                @Value("${app.clients.catalog.read-timeout-ms:3000}") long readTimeoutMs) {
        // Timeout: o pedido falha rápido se o catálogo travar, em vez de prender a thread.
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));

        RestClient restClient = builder.clone()
                .baseUrl("http://catalog-service")
                .requestFactory(requestFactory)
                .build();

        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(CatalogClient.class);
    }
}
