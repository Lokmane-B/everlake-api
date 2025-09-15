package com.everlake.ingestion.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class InseeService {

    private final WebClient inseeWebClient;

    public InseeService(WebClient inseeWebClient) {
        this.inseeWebClient = inseeWebClient;
    }

    /** Récupère l'unité légale par SIREN et renvoie le JSON brut. */
    public Mono<String> getEntrepriseBySiren(String siren) {
        return inseeWebClient.get()
                .uri("/siren/{siren}", siren)
                .retrieve()
                .bodyToMono(String.class);
    }

    /** Récupère un établissement par SIRET (JSON brut). */
    public Mono<String> getEtablissementBySiret(String siret) {
        return inseeWebClient.get()
                .uri("/siret/{siret}", siret)
                .retrieve()
                .bodyToMono(String.class);
    }
}
