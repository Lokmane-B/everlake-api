package com.everlake.ingestion.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "unite_legale", schema = "sirene")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class UniteLegaleEntity {

    @Id
    @Column(name = "siren", length = 9, nullable = false)
    private String siren;

    // Identité / statut
    @Column(name = "statut_diffusion")
    private String statutDiffusion;

    @Column(name = "etat_administratif")
    private String etatAdministratif;

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    // Dénomination
    @Column(name = "denomination")
    private String denomination;

    @Column(name = "denomination_usuelle1")
    private String denominationUsuelle1;

    @Column(name = "denomination_usuelle2")
    private String denominationUsuelle2;

    @Column(name = "denomination_usuelle3")
    private String denominationUsuelle3;

    @Column(name = "nom")
    private String nom;

    @Column(name = "nom_usage")
    private String nomUsage;

    @Column(name = "sigle")
    private String sigle;

    @Column(name = "prenom1")
    private String prenom1;

    @Column(name = "prenom2")
    private String prenom2;

    @Column(name = "prenom3")
    private String prenom3;

    @Column(name = "prenom4")
    private String prenom4;

    // Codes
    @Column(name = "categorie_juridique", length = 4)
    private String categorieJuridique;

    @Column(name = "activite_principale", length = 6)
    private String activitePrincipale;

    @Column(name = "nomenclature_activite", length = 10)
    private String nomenclatureActivite;

    @Column(name = "tranche_effectifs", length = 3)
    private String trancheEffectifs;

    @Column(name = "annee_effectifs")
    private Integer anneeEffectifs;

    @Column(name = "categorie_entreprise", length = 2)
    private String categorieEntreprise;

    @Column(name = "annee_categorie_entreprise")
    private Integer anneeCategorieEntreprise;

    // Siège / caractéristiques
    @Column(name = "nic_siege", length = 5)
    private String nicSiege;

    @Column(name = "ess", nullable = false)
    private boolean ess;

    @Column(name = "societe_mission", nullable = false)
    private boolean societeMission;

    @Column(name = "caractere_employeur", nullable = false)
    private boolean caractereEmployeur;

    // Traces
    @Column(name = "date_dernier_traitement")
    private OffsetDateTime dateDernierTraitement;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    // Brut
    @Column(name = "raw", columnDefinition = "jsonb")
    private String raw;
}
