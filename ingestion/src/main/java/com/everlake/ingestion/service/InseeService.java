// com.everlake.ingestion.service.InseeService
package com.everlake.ingestion.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class InseeService {

    private final WebClient insee;

    public InseeService(@Qualifier("inseeWebClient") WebClient insee) {
        this.insee = insee;
    }

    public Mono<String> getEntrepriseBySiren(String siren) {
        return insee.get()
                .uri("/siren/{siren}", siren)
                .retrieve()
                // remonte le vrai statut/erreur de l'INSEE au lieu d'un 500 opaque
                .onStatus(s -> s.isError(),
                        resp -> resp.bodyToMono(String.class)
                                .map(body -> new RuntimeException("INSEE " + resp.statusCode() + " - " + body)))
                .bodyToMono(String.class);
    }

}
