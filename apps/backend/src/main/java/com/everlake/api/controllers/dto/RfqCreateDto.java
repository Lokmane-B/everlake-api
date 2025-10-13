package com.everlake.api.controllers.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RfqCreateDto(
        String title,
        String purchaseType,
        String sector,
        String description,
        String cahierDesCharges,
        String quantity,
        String location,
        BigDecimal budget,         // <-- BigDecimal ici
        String contractType,
        String visibility,         // "publique" | "privee"
        String status,             // "Actif" | "Brouillon" | ...
        LocalDate endDate,
        List<String> evaluationCriteria,
        String companyName
) {}
