package com.everlake.api.controllers.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RfqSummaryDto(
        Long id,
        String title,
        String sector,
        BigDecimal budget,
        @JsonProperty("end_date") LocalDate endDate,
        String status,
        String visibility,
        long devisCount
) {}
