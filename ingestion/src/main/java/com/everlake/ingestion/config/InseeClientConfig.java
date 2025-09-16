// com.everlake.ingestion.config.InseeClientConfig
package com.everlake.ingestion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class InseeClientConfig {

    @Bean(name = "inseeWebClient")
    public WebClient inseeWebClient(
            WebClient.Builder builder,
            @Value("${insee.base-url}") String baseUrl,
            @Value("${insee.api-key}") String apiKey
    ) {
        // petit log (masqué) pour vérifier que la clé est bien chargée
        System.out.println("[INSEE] apiKey loaded? " + (apiKey != null && !apiKey.isBlank()));

        // log minimal des requêtes (on masque la clé dans les logs)
        ExchangeFilterFunction logReq = (req, next) -> {
            System.out.println("=> " + req.method() + " " + req.url());
            return next.exchange(req);
        };

        return builder
                .baseUrl(baseUrl)
                .filter(logReq)
                .defaultHeader("X-INSEE-Api-Key-Integration", apiKey)
                .defaultHeader("Accept", "application/json")
                .build();
    }
}
