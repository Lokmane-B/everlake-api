package com.everlake.ingestion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class InseeClientConfig {

    @Bean
    public WebClient inseeWebClient(
            WebClient.Builder builder,
            @Value("${insee.base-url}") String baseUrl,
            @Value("${insee.api-key}") String apiKey
    ) {
        // Filtre qui ajoute systématiquement la clé API
        ExchangeFilterFunction apiKeyHeader = (request, next) -> {
            ClientRequest withKey = ClientRequest.from(request)
                    .header("X-INSEE-Api-Key-Integration", apiKey)
                    .header("Accept", "application/json")
                    .build();
            return next.exchange(withKey);
        };

        return builder
                .baseUrl(baseUrl)           // ex: https://api.insee.fr/api-sirene/3.11
                .filter(apiKeyHeader)
                .build();
    }
}
