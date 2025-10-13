package com.everlake.api.controllers;

import com.everlake.api.entities.Rfq;
import com.everlake.api.repositories.RfqRepository;
import com.everlake.api.repositories.DevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqRepository rfqRepository;
    private final DevisRepository devisRepository;

    // Créer un RFQ
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Rfq create(@RequestBody Rfq rfq) {
        return rfqRepository.save(rfq);
    }

    // Lister tous les RFQ avec le nombre de devis associés
    @GetMapping
    public List<Map<String, Object>> list() {
        return rfqRepository.findAll().stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("title", r.getTitle());
                    map.put("sector", r.getSector());
                    map.put("budget", r.getBudget());
                    map.put("end_date", r.getEndDate());
                    map.put("status", r.getStatus());
                    map.put("visibility", r.getVisibility());
                    map.put("devisCount", devisRepository.countByRfqId(r.getId()));
                    return map;
                })
                .collect(Collectors.toList());
    }


    // Détail d'un RFQ (inclut devisCount)
    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        Rfq r = rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("title", r.getTitle());
        map.put("sector", r.getSector());
        map.put("budget", r.getBudget());
        map.put("end_date", r.getEndDate());
        map.put("status", r.getStatus());
        map.put("visibility", r.getVisibility());
        map.put("devisCount", devisRepository.countByRfqId(r.getId()));
        return map;
    }

}
