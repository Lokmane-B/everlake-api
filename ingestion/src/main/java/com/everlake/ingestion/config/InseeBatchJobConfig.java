// com.everlake.ingestion.config.InseeBatchJobConfig
package com.everlake.ingestion.config;

import com.everlake.ingestion.model.Entreprise;
import com.everlake.ingestion.service.InseeService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

@Configuration
public class InseeBatchJobConfig {

    // --- Reader: lit une petite liste de SIREN pour démarrer ---
    @Bean
    public ItemReader<String> sirenReader() {
        return new ListItemReader<>(List.of(
                "552100554" // Renault
        ));
    }

    // --- Processor: transforme un SIREN en Entreprise (appelle l’INSEE) ---
    @Bean
    public ItemProcessor<String, Entreprise> sirenProcessor(InseeService inseeService) {
        return siren -> {
            // Appel réel à l’INSEE (ton service retourne un Mono<String>)
            String json = inseeService.getEntrepriseBySiren(siren).block(); // ok ici: batch synchrone
            return new Entreprise(siren, json); // pour l’instant on garde le JSON brut
        };
    }

    // --- Writer: pour l’instant on log ; plus tard -> repository.saveAll(...) ---
    @Bean
    public ItemWriter<Entreprise> entrepriseWriter() {
        return items -> {
            System.out.println("[BATCH] Écriture de " + items.size() + " entreprises");
            items.forEach(e -> System.out.println(" - " + e.siren()));
        };
    }

    // --- Step ---
    @Bean
    public Step fetchEntrepriseStep(JobRepository jobRepository,
                                    PlatformTransactionManager transactionManager,
                                    ItemReader<String> sirenReader,
                                    ItemProcessor<String, Entreprise> sirenProcessor,
                                    ItemWriter<Entreprise> entrepriseWriter) {
        return new StepBuilder("fetchEntrepriseStep", jobRepository)
                .<String, Entreprise>chunk(10, transactionManager)
                .reader(sirenReader)
                .processor(sirenProcessor)
                .writer(entrepriseWriter)
                .build();
    }

    // --- Job ---
    @Bean
    public Job inseeJob(JobRepository jobRepository, Step fetchEntrepriseStep) {
        return new JobBuilder("inseeJob", jobRepository)
                .start(fetchEntrepriseStep)
                .build();
    }
}
