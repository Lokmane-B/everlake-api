package com.everlake.ingestion.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "etablissement", schema = "sirene")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class EtablissementEntity {

    // SIRET généré côté DB (computed column)
    @Id
    @Column(name = "siret", length = 14, insertable = false, updatable = false)
    private String siret;

    @Column(name = "siren", length = 9, nullable = false)
    private String siren;

    @Column(name = "nic", length = 5, nullable = false)
    private String nic;

    @Column(name = "etablissement_siege")
    private Boolean etablissementSiege;

    @Column(name = "etat_administratif")
    private String etatAdministratif;

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_dernier_traitement")
    private OffsetDateTime dateDernierTraitement;

    // Enseignes & denom
    @Column(name = "enseigne1")
    private String enseigne1;

    @Column(name = "enseigne2")
    private String enseigne2;

    @Column(name = "enseigne3")
    private String enseigne3;

    @Column(name = "denomination_usuelle")
    private String denominationUsuelle;

    // Adresse
    @Column(name = "complement_adresse")
    private String complementAdresse;

    @Column(name = "numero_voie")
    private String numeroVoie;

    @Column(name = "type_voie")
    private String typeVoie;

    @Column(name = "libelle_voie")
    private String libelleVoie;

    @Column(name = "code_postal")
    private String codePostal;

    @Column(name = "libelle_commune")
    private String libelleCommune;

    @Column(name = "code_commune")
    private String codeCommune;

    @Column(name = "code_cedex")
    private String codeCedex;

    @Column(name = "libelle_cedex")
    private String libelleCedex;

    @Column(name = "pays_code")
    private String paysCode;

    @Column(name = "pays_libelle")
    private String paysLibelle;

    // Codes activité/effectifs
    @Column(name = "activite_principale", length = 6)
    private String activitePrincipale;

    @Column(name = "nomenclature_activite", length = 10)
    private String nomenclatureActivite;

    @Column(name = "tranche_effectifs", length = 3)
    private String trancheEffectifs;

    @Column(name = "annee_effectifs")
    private Integer anneeEffectifs;

    // Brut
    @Column(name = "raw", columnDefinition = "jsonb")
    private String raw;
}
