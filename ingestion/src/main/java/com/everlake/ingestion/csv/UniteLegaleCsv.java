package com.everlake.ingestion.csv;

import lombok.Data;

@Data
public class UniteLegaleCsv {
    // Identité
    private String siren;                                // "siren"
    private String statutDiffusionUniteLegale;           // "statutDiffusionUniteLegale"
    private String etatAdministratifUniteLegale;         // "etatAdministratifUniteLegale"
    private String dateCreationUniteLegale;              // "dateCreationUniteLegale" (yyyy-MM-dd)

    // Dénomination / personnes physiques
    private String denominationUniteLegale;              // "denominationUniteLegale"
    private String denominationUsuelle1UniteLegale;      // "denominationUsuelle1UniteLegale"
    private String denominationUsuelle2UniteLegale;      // "denominationUsuelle2UniteLegale"
    private String denominationUsuelle3UniteLegale;      // "denominationUsuelle3UniteLegale"
    private String nomUniteLegale;                       // "nomUniteLegale"
    private String nomUsageUniteLegale;                  // "nomUsageUniteLegale"
    private String sigleUniteLegale;                     // "sigleUniteLegale"
    private String prenom1UniteLegale;
    private String prenom2UniteLegale;
    private String prenom3UniteLegale;
    private String prenom4UniteLegale;

    // Codes UL
    private String categorieJuridiqueUniteLegale;        // "categorieJuridiqueUniteLegale"
    private String activitePrincipaleUniteLegale;        // "activitePrincipaleUniteLegale"
    private String nomenclatureActiviteUniteLegale;      // "nomenclatureActiviteUniteLegale"
    private String trancheEffectifsUniteLegale;          // "trancheEffectifsUniteLegale"
    private String anneeEffectifsUniteLegale;            // "anneeEffectifsUniteLegale"
    private String categorieEntreprise;                  // "categorieEntreprise"
    private String anneeCategorieEntreprise;             // "anneeCategorieEntreprise"

    // Siège / caractéristiques
    private String nicSiegeUniteLegale;                  // "nicSiegeUniteLegale"
    private String economieSocialeSolidaireUniteLegale;  // "economieSocialeSolidaireUniteLegale" (true/false, OUI/NON)
    private String societeMissionUniteLegale;            // "societeMissionUniteLegale"
    private String caractereEmployeurUniteLegale;        // "caractereEmployeurUniteLegale"

    // Traces
    private String dateDernierTraitementUniteLegale;     // "dateDernierTraitementUniteLegale" (timestamp)
    private String dateDebut;                             // selon flux, parfois présent
    private String raw;                                   // optionnel si tu veux mettre la ligne entière
}
