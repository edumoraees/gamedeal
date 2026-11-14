package br.edu.atitus.gamedeal.currency.configs;

import br.edu.atitus.gamedeal.currency.clients.BcbClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import java.time.Duration;

@Configuration
public class BcbClientConfig {

    @Bean
    BcbClient bcbClient(RestClient.Builder builder,
                        @Value("${app.bcb.base-url}") String baseUrl,
                        @Value("${app.bcb.connect-timeout-ms:2000}") long connectTimeoutMs,
                        @Value("${app.bcb.read-timeout-ms:5000}") long readTimeoutMs) {
        // Timeout: evita que uma lentidão do BCB prenda as threads deste serviço.
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));

        RestClient restClient = builder
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();

        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(BcbClient.class);
    }
}
