package com.everlake.ingestion.model.mapper;

import com.everlake.ingestion.csv.UniteLegaleCsv;
import com.everlake.ingestion.csv.EtablissementCsv;
import com.everlake.ingestion.model.UniteLegaleEntity;
import com.everlake.ingestion.model.EtablissementEntity;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class SireneMappers {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy[-MM[-dd]]"); // tolère yyyy ou yyyy-MM ou yyyy-MM-dd
    private static final DateTimeFormatter TS   = DateTimeFormatter.ofPattern("yyyy-MM-dd['T'HH:mm[:ss][XXX]]");

    private SireneMappers() {}

    public static UniteLegaleEntity toEntity(UniteLegaleCsv c, String rawJson) {
        return UniteLegaleEntity.builder()
                .siren(trim(c.getSiren()))
                .statutDiffusion(trim(c.getStatutDiffusionUniteLegale()))
                .etatAdministratif(trim(c.getEtatAdministratifUniteLegale()))
                .dateCreation(parseDate(c.getDateCreationUniteLegale()))
                .denomination(trim(c.getDenominationUniteLegale()))
                .denominationUsuelle1(trim(c.getDenominationUsuelle1UniteLegale()))
                .denominationUsuelle2(trim(c.getDenominationUsuelle2UniteLegale()))
                .denominationUsuelle3(trim(c.getDenominationUsuelle3UniteLegale()))
                .nom(trim(c.getNomUniteLegale()))
                .nomUsage(trim(c.getNomUsageUniteLegale()))
                .sigle(trim(c.getSigleUniteLegale()))
                .prenom1(trim(c.getPrenom1UniteLegale()))
                .prenom2(trim(c.getPrenom2UniteLegale()))
                .prenom3(trim(c.getPrenom3UniteLegale()))
                .prenom4(trim(c.getPrenom4UniteLegale()))
                .categorieJuridique(trim(c.getCategorieJuridiqueUniteLegale()))
                .activitePrincipale(cleanApe(c.getActivitePrincipaleUniteLegale()))
                .nomenclatureActivite(trim(c.getNomenclatureActiviteUniteLegale()))
                .trancheEffectifs(trim(c.getTrancheEffectifsUniteLegale()))
                .anneeEffectifs(parseInt(c.getAnneeEffectifsUniteLegale()))
                .categorieEntreprise(trim(c.getCategorieEntreprise()))
                .anneeCategorieEntreprise(parseInt(c.getAnneeCategorieEntreprise()))
                .nicSiege(trim(c.getNicSiegeUniteLegale()))
                .ess(parseBool(c.getEconomieSocialeSolidaireUniteLegale()))
                .societeMission(parseBool(c.getSocieteMissionUniteLegale()))
                .caractereEmployeur(parseBool(c.getCaractereEmployeurUniteLegale()))
                .dateDernierTraitement(parseTs(c.getDateDernierTraitementUniteLegale()))
                .dateDebut(parseDate(c.getDateDebut()))
                .raw(rawJson)
                .build();
    }

    public static EtablissementEntity toEntity(EtablissementCsv c, String rawJson) {
        return EtablissementEntity.builder()
                .siren(trim(c.getSiren()))
                .nic(trim(c.getNic()))
                .etablissementSiege(parseBool(c.getEtablissementSiege()))
                .etatAdministratif(trim(c.getEtatAdministratifEtablissement()))
                .dateCreation(parseDate(c.getDateCreationEtablissement()))
                .dateDebut(parseDate(c.getDateDebut()))
                .dateDernierTraitement(parseTs(c.getDateDernierTraitementEtablissement()))
                .enseigne1(trim(c.getEnseigne1Etablissement()))
                .enseigne2(trim(c.getEnseigne2Etablissement()))
                .enseigne3(trim(c.getEnseigne3Etablissement()))
                .denominationUsuelle(trim(c.getDenominationUsuelleEtablissement()))
                .complementAdresse(trim(c.getComplementAdresseEtablissement()))
                .numeroVoie(trim(c.getNumeroVoieEtablissement()))
                .typeVoie(trim(c.getTypeVoieEtablissement()))
                .libelleVoie(trim(c.getLibelleVoieEtablissement()))
                .codePostal(trim(c.getCodePostalEtablissement()))
                .libelleCommune(trim(c.getLibelleCommuneEtablissement()))
                .codeCommune(trim(c.getCodeCommuneEtablissement()))
                .codeCedex(trim(c.getCodeCedexEtablissement()))
                .libelleCedex(trim(c.getLibelleCedexEtablissement()))
                .paysCode(trim(c.getPaysCodeEtrangerEtablissement()))
                .paysLibelle(trim(c.getPaysLibelleEtrangerEtablissement()))
                .activitePrincipale(cleanApe(c.getActivitePrincipaleEtablissement()))
                .nomenclatureActivite(trim(c.getNomenclatureActiviteEtablissement()))
                .trancheEffectifs(trim(c.getTrancheEffectifsEtablissement()))
                .anneeEffectifs(parseInt(c.getAnneeEffectifsEtablissement()))
                .raw(rawJson)
                .build();
    }

    // Helpers ------------------------------------------------------------

    private static String trim(String s) {
        return s == null ? null : s.trim();
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalDate.parse(s.trim(), DATE);
    }

    private static OffsetDateTime parseTs(String s) {
        if (s == null || s.isBlank()) return null;
        // la plupart des flux Sirene sont en UTC sans TZ explicite -> on force +00:00
        String v = s.trim();
        if (!v.contains("T")) v = v + "T00:00:00+00:00";
        if (!v.endsWith("Z") && !v.matches(".*[+-]\\d\\d:\\d\\d$")) v = v + "+00:00";
        return OffsetDateTime.parse(v, TS.withLocale(Locale.ROOT));
    }

    private static Integer parseInt(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Integer.valueOf(s.trim()); } catch (NumberFormatException e) { return null; }
    }

    // OUI/NON, 1/0, VRAI/FAUX, true/false -> boolean
    private static boolean parseBool(String s) {
        if (s == null) return false;
        String v = s.trim().toLowerCase(Locale.ROOT);
        return v.equals("1") || v.equals("true") || v.equals("vrai") || v.equals("oui") || v.equals("o");
    }

    // nettoie les codes NAF genre "62.01Z" -> "6201Z"
    private static String cleanApe(String s) {
        if (s == null) return null;
        return s.replace(".", "").trim();
    }
}
