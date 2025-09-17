package com.everlake.ingestion.csv;

import lombok.Data;

@Data
public class EtablissementCsv {
    private String siret;                       // "siret"
    private String siren;                       // "siren"
    private String nic;                         // "nic"
    private String etablissementSiege;          // "etablissementSiege" (true/false, 1/0, OUI/NON)
    private String etatAdministratifEtablissement;
    private String dateCreationEtablissement;   // yyyy-MM-dd
    private String dateDebut;
    private String dateDernierTraitementEtablissement;

    // Enseignes & denom
    private String enseigne1Etablissement;
    private String enseigne2Etablissement;
    private String enseigne3Etablissement;
    private String denominationUsuelleEtablissement;

    // Adresse
    private String complementAdresseEtablissement;
    private String numeroVoieEtablissement;
    private String typeVoieEtablissement;
    private String libelleVoieEtablissement;
    private String codePostalEtablissement;
    private String libelleCommuneEtablissement;
    private String codeCommuneEtablissement;
    private String codeCedexEtablissement;
    private String libelleCedexEtablissement;
    private String paysCodeEtrangerEtablissement;
    private String paysLibelleEtrangerEtablissement;

    // Codes activité/effectifs
    private String activitePrincipaleEtablissement;   // NAF
    private String nomenclatureActiviteEtablissement;
    private String trancheEffectifsEtablissement;
    private String anneeEffectifsEtablissement;

    private String raw; // optionnel
}
