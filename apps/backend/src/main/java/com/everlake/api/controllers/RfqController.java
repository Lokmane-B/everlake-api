package com.everlake.api.controllers;

import com.everlake.api.controllers.dto.RfqCreateDto;
import com.everlake.api.entities.Rfq;
import com.everlake.api.entities.User;
import com.everlake.api.repositories.DevisRepository;
import com.everlake.api.repositories.RfqRepository;
import com.everlake.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqRepository rfqRepository;
    private final DevisRepository devisRepository;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Rfq create(@RequestBody RfqCreateDto dto, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Rfq rfq = new Rfq();
        rfq.setTitle(dto.title());
        rfq.setPurchaseType(dto.purchaseType());
        rfq.setSector(dto.sector());
        rfq.setDescription(dto.description());
        rfq.setCahierDesCharges(dto.cahierDesCharges());
        rfq.setQuantity(dto.quantity());
        rfq.setLocation(dto.location());
        rfq.setBudget(dto.budget()); // BigDecimal, null-safe
        rfq.setContractType(dto.contractType());
        rfq.setVisibility(dto.visibility());
        rfq.setStatus(dto.status());
        rfq.setEndDate(dto.endDate());
        rfq.setEvaluationCriteria(dto.evaluationCriteria() != null ? dto.evaluationCriteria() : List.of());
        rfq.setCompanyName(dto.companyName());

        rfq.setCreatedBy(user); // <- indispensable

        return rfqRepository.save(rfq);
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return rfqRepository.findAll().stream()
                .map(r -> Map.<String, Object>of(
                        "id", r.getId(),
                        "title", r.getTitle(),
                        "sector", r.getSector(),
                        "budget", r.getBudget(),
                        "end_date", r.getEndDate(),
                        "status", r.getStatus(),
                        "visibility", r.getVisibility(),
                        "devisCount", devisRepository.countByRfq_Id(r.getId())
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        Rfq r = rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        return Map.of(
                "id", r.getId(),
                "title", r.getTitle(),
                "sector", r.getSector(),
                "budget", r.getBudget(),
                "end_date", r.getEndDate(),
                "status", r.getStatus(),
                "visibility", r.getVisibility(),
                "devisCount", devisRepository.countByRfq_Id(r.getId())
        );
    }
}
