// ingestion/src/main/java/com/everlake/ingestion/config/InseeBatchJobConfig.java
package com.everlake.ingestion.config;

import com.everlake.ingestion.csv.UniteLegaleCsv;
import com.everlake.ingestion.model.UniteLegaleEntity;
import com.everlake.ingestion.model.mapper.SireneMappers;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.database.BeanPropertyItemSqlParameterSourceProvider;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
public class InseeBatchJobConfig {

    /* =======================
       READER : CSV UniteLegale
       ======================= */

        // IMPORTANT : les "names" doivent matcher exactement les entêtes du CSV
        // Si le fichier a d’autres colonnes : Spring ignorera celles non listées ici.
        @Bean
        public FlatFileItemReader<UniteLegaleCsv> uniteLegaleReader(
                @Value("${sirene.data-dir}") String dataDir) {

            String path = dataDir + "/StockUniteLegale_utf8.csv";

            // Mapper strict: correspondance EXACTE des noms -> pas de fuzzy matching
            BeanWrapperFieldSetMapper<UniteLegaleCsv> mapper = new BeanWrapperFieldSetMapper<>();
            mapper.setTargetType(UniteLegaleCsv.class);
            mapper.setDistanceLimit(0); // <= important: pas de correspondances "proches"
            mapper.setStrict(false); // ignore les colonnes sans propriété correspondante

            return new FlatFileItemReaderBuilder<UniteLegaleCsv>()
                    .name("uniteLegaleReader")
                    .resource(new FileSystemResource(path))
                    .linesToSkip(1)
                    .encoding("UTF-8")
                    .delimited()
                    .delimiter(",")
                    .quoteCharacter('"')
                    .names(
                            "siren",
                            "statutDiffusionUniteLegale",
                            "unitePurgeeUniteLegale",
                            "dateCreationUniteLegale",
                            "sigleUniteLegale",
                            "sexeUniteLegale",
                            "prenom1UniteLegale",
                            "prenom2UniteLegale",
                            "prenom3UniteLegale",
                            "prenom4UniteLegale",
                            "prenomUsuelUniteLegale",
                            "pseudonymeUniteLegale",
                            "identifiantAssociationUniteLegale",
                            "trancheEffectifsUniteLegale",
                            "anneeEffectifsUniteLegale",
                            "dateDernierTraitementUniteLegale",
                            "nombrePeriodesUniteLegale",
                            "categorieEntreprise",
                            "anneeCategorieEntreprise",
                            "dateDebut",
                            "etatAdministratifUniteLegale",
                            "nomUniteLegale",
                            "nomUsageUniteLegale",
                            "denominationUniteLegale",
                            "denominationUsuelle1UniteLegale",
                            "denominationUsuelle2UniteLegale",
                            "denominationUsuelle3UniteLegale",
                            "categorieJuridiqueUniteLegale",
                            "activitePrincipaleUniteLegale",
                            "nomenclatureActivitePrincipaleUniteLegale",
                            "nicSiegeUniteLegale",
                            "economieSocialeSolidaireUniteLegale",
                            "societeMissionUniteLegale",
                            "caractereEmployeurUniteLegale"
                    )
                    .fieldSetMapper(mapper) // <= la variable existe maintenant :)
                    .strict(false)          // tolère colonnes en plus
                    .build();
        }


    /* ===============================
       PROCESSOR : CSV -> Entity (UL)
       =============================== */
    @Bean
    public ItemProcessor<UniteLegaleCsv, UniteLegaleEntity> ulProcessor() {
        return csv -> SireneMappers.toEntity(csv, /* raw */ null);
    }

    /* ======================================
       WRITER : UPSERT vers Postgres (UNITE_UL)
       ====================================== */
    @Bean
    public JdbcBatchItemWriter<UniteLegaleEntity> ulWriter(DataSource dataSource) {
        JdbcBatchItemWriter<UniteLegaleEntity> writer = new JdbcBatchItemWriter<>();
        writer.setJdbcTemplate(new NamedParameterJdbcTemplate(dataSource));
        writer.setItemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>());

        writer.setSql(
                // Remplissage + upsert complet de la table sirene.unite_legale
                "INSERT INTO sirene.unite_legale (" +
                        "siren, statut_diffusion, etat_administratif, date_creation," +
                        "denomination, denomination_usuelle1, denomination_usuelle2, denomination_usuelle3," +
                        "nom, nom_usage, sigle, prenom1, prenom2, prenom3, prenom4," +
                        "categorie_juridique, activite_principale, nomenclature_activite, tranche_effectifs," +
                        "annee_effectifs, categorie_entreprise, annee_categorie_entreprise," +
                        "nic_siege, ess, societe_mission, caractere_employeur," +
                        "date_dernier_traitement, date_debut, raw) " +
                        "VALUES (" +
                        ":siren, :statutDiffusion, :etatAdministratif, :dateCreation," +
                        ":denomination, :denominationUsuelle1, :denominationUsuelle2, :denominationUsuelle3," +
                        ":nom, :nomUsage, :sigle, :prenom1, :prenom2, :prenom3, :prenom4," +
                        ":categorieJuridique, :activitePrincipale, :nomenclatureActivite, :trancheEffectifs," +
                        ":anneeEffectifs, :categorieEntreprise, :anneeCategorieEntreprise," +
                        ":nicSiege, :ess, :societeMission, :caractereEmployeur," +
                        ":dateDernierTraitement, :dateDebut, CAST(:raw AS jsonb)) " +
                        "ON CONFLICT (siren) DO UPDATE SET " +
                        "statut_diffusion = EXCLUDED.statut_diffusion, " +
                        "etat_administratif = EXCLUDED.etat_administratif, " +
                        "date_creation = EXCLUDED.date_creation, " +
                        "denomination = EXCLUDED.denomination, " +
                        "denomination_usuelle1 = EXCLUDED.denomination_usuelle1, " +
                        "denomination_usuelle2 = EXCLUDED.denomination_usuelle2, " +
                        "denomination_usuelle3 = EXCLUDED.denomination_usuelle3, " +
                        "nom = EXCLUDED.nom, " +
                        "nom_usage = EXCLUDED.nom_usage, " +
                        "sigle = EXCLUDED.sigle, " +
                        "prenom1 = EXCLUDED.prenom1, " +
                        "prenom2 = EXCLUDED.prenom2, " +
                        "prenom3 = EXCLUDED.prenom3, " +
                        "prenom4 = EXCLUDED.prenom4, " +
                        "categorie_juridique = EXCLUDED.categorie_juridique, " +
                        "activite_principale = EXCLUDED.activite_principale, " +
                        "nomenclature_activite = EXCLUDED.nomenclature_activite, " +
                        "tranche_effectifs = EXCLUDED.tranche_effectifs, " +
                        "annee_effectifs = EXCLUDED.annee_effectifs, " +
                        "categorie_entreprise = EXCLUDED.categorie_entreprise, " +
                        "annee_categorie_entreprise = EXCLUDED.annee_categorie_entreprise, " +
                        "nic_siege = EXCLUDED.nic_siege, " +
                        "ess = EXCLUDED.ess, " +
                        "societe_mission = EXCLUDED.societe_mission, " +
                        "caractere_employeur = EXCLUDED.caractere_employeur, " +
                        "date_dernier_traitement = EXCLUDED.date_dernier_traitement, " +
                        "date_debut = EXCLUDED.date_debut, " +
                        "raw = EXCLUDED.raw"
        );
        writer.afterPropertiesSet();
        return writer;
    }

    /* ==================
       STEP : UL -> DB
       ================== */
    @Bean
    public Step ulStep(JobRepository jobRepository,
                       PlatformTransactionManager tx,
                       FlatFileItemReader<UniteLegaleCsv> uniteLegaleReader,
                       ItemProcessor<UniteLegaleCsv, UniteLegaleEntity> ulProcessor,
                       JdbcBatchItemWriter<UniteLegaleEntity> ulWriter) {

        return new StepBuilder("ulStep", jobRepository)
                .<UniteLegaleCsv, UniteLegaleEntity>chunk(2000, tx)
                .reader(uniteLegaleReader)
                .processor(ulProcessor)
                .writer(ulWriter)
                .build();
    }

    /* =====
       JOB
       ===== */
    @Bean
    public Job sireneFullLoad(JobRepository repo, Step ulStep) {
        return new JobBuilder("sireneFullLoad", repo)
                .incrementer(new RunIdIncrementer())
                .start(ulStep)
                .build();
    }

    /* ===================================================
       DEV ONLY : stopper tout job en cours au démarrage
       =================================================== */
    @Profile("dev")
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @RequiredArgsConstructor
    public static class StopRunningJobsRunner implements ApplicationRunner {
        private final JobOperator jobOperator;

        @Override
        public void run(ApplicationArguments args) throws Exception {
            String jobName = "sireneFullLoad";
            for (Long execId : jobOperator.getRunningExecutions(jobName)) {
                System.out.println("[BATCH] StopRunningJobsRunner -> stop execId=" + execId);
                jobOperator.stop(execId);
            }
        }
    }

    /* =====================================================
       DEV ONLY : lancer automatiquement le job au démarrage
       ===================================================== */
    @Profile("dev")
    @Order(Ordered.HIGHEST_PRECEDENCE + 1)
    @RequiredArgsConstructor
    public static class LaunchSireneJobRunner implements ApplicationRunner {
        private final JobLauncher jobLauncher;
        private final Job sireneFullLoad;

        @Override
        public void run(ApplicationArguments args) throws Exception {
            var params = new org.springframework.batch.core.JobParametersBuilder()
                    .addLong("ts", System.currentTimeMillis())
                    .toJobParameters();

            System.out.println("[BATCH] LaunchSireneJobRunner -> " + params);
            jobLauncher.run(sireneFullLoad, params);
        }
    }
}
