package com.everlake.api.controllers;

import com.everlake.api.controllers.dto.RfqSummaryDto;
import com.everlake.api.entities.Rfq;
import com.everlake.api.entities.User;
import com.everlake.api.repositories.DevisRepository;
import com.everlake.api.repositories.RfqRepository;
import com.everlake.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqRepository rfqRepository;
    private final DevisRepository devisRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<RfqSummaryDto> list(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return rfqRepository.findByCreatedBy(user).stream()
                .map(r -> new RfqSummaryDto(
                        r.getId(),
                        r.getTitle(),
                        r.getSector(),
                        r.getBudget(),
                        r.getEndDate(),
                        r.getStatus(),
                        r.getVisibility(),
                        devisRepository.countByRfqId(r.getId())
                ))
                .toList();
    }


    @GetMapping("/{id}")
    public RfqSummaryDto get(@PathVariable Long id) {
        Rfq r = rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        return new RfqSummaryDto(
                r.getId(),
                r.getTitle(),
                r.getSector(),
                r.getBudget(),
                r.getEndDate(),
                r.getStatus(),
                r.getVisibility(),
                devisRepository.countByRfqId(r.getId())
        );
    }
}
