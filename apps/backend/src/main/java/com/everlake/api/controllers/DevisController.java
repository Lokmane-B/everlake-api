package com.everlake.api.controllers;

import com.everlake.api.entities.Devis;
import com.everlake.api.entities.User;
import com.everlake.api.services.DevisService;
import com.everlake.api.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/devis")
public class DevisController {

    private final DevisService devisService;
    private final UserRepository userRepository;

    public DevisController(DevisService devisService, UserRepository userRepository) {
        this.devisService = devisService;
        this.userRepository = userRepository;
    }

    /**
     * Récupérer tous les devis de l’utilisateur connecté
     */
    @GetMapping
    public ResponseEntity<List<Devis>> getMyDevis(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(devisService.getDevisByUser(user));
    }

    /**
     * Créer un devis pour l’utilisateur connecté
     */
    @PostMapping
    public ResponseEntity<Devis> createDevis(@RequestBody Devis devis, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        devis.setCreatedBy(user); // associer le devis à l’utilisateur connecté
        return ResponseEntity.ok(devisService.createDevis(devis));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Devis> getDevisById(@PathVariable Long id) {
        return devisService.getDevisById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Devis> updateDevis(@PathVariable Long id, @RequestBody Devis devis) {
        return ResponseEntity.ok(devisService.updateDevis(id, devis));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevis(@PathVariable Long id) {
        devisService.deleteDevis(id);
        return ResponseEntity.noContent().build();
    }
}
