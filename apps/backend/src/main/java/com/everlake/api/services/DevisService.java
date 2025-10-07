package com.everlake.api.services;

import com.everlake.api.entities.Devis;
import com.everlake.api.entities.LineItem;
import com.everlake.api.entities.User;
import com.everlake.api.repositories.DevisRepository;
import com.everlake.api.repositories.LineItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DevisService {

    private final DevisRepository devisRepository;
    private final LineItemRepository lineItemRepository;

    public DevisService(DevisRepository devisRepository, LineItemRepository lineItemRepository) {
        this.devisRepository = devisRepository;
        this.lineItemRepository = lineItemRepository;
    }

    /**
     * Crée un nouveau devis avec ses lignes
     */
    public Devis createDevis(Devis devis) {
        // Dates auto
        devis.setCreatedAt(LocalDateTime.now());
        devis.setUpdatedAt(LocalDateTime.now());

        // Calcul totals si items présents
        calculateTotals(devis);

        // Sauvegarde devis et items (cascade ALL gère déjà mais on sécurise)
        Devis saved = devisRepository.save(devis);
        if (devis.getItems() != null) {
            for (LineItem item : devis.getItems()) {
                item.setDevis(saved);
                lineItemRepository.save(item);
            }
        }

        return saved;
    }

    /**
     * Récupère un devis par ID
     */
    public Optional<Devis> getDevisById(Long id) {
        return devisRepository.findById(id);
    }

    /**
     * Récupère tous les devis créés par un utilisateur
     */
    public List<Devis> getDevisByUser(User user) {
        return devisRepository.findByCreatedBy(user);
    }

    /**
     * Récupère tous les devis par statut
     */
    public List<Devis> getDevisByStatus(String status) {
        return devisRepository.findByStatus(status);
    }

    /**
     * Met à jour un devis
     */
    public Devis updateDevis(Long id, Devis updated) {
        return devisRepository.findById(id).map(existing -> {
            existing.setNumero(updated.getNumero());
            existing.setOffreTitle(updated.getOffreTitle());
            existing.setClient(updated.getClient());
            existing.setSecteur(updated.getSecteur());
            existing.setLocation(updated.getLocation());
            existing.setStatus(updated.getStatus());
            existing.setCommentaire(updated.getCommentaire());
            existing.setMarcheEndDate(updated.getMarcheEndDate());
            existing.setUpdatedAt(LocalDateTime.now());

            // Mettre à jour les items
            if (updated.getItems() != null) {
                existing.getItems().clear();
                for (LineItem item : updated.getItems()) {
                    item.setDevis(existing);
                    existing.getItems().add(item);
                }
            }

            // Recalcul totals
            calculateTotals(existing);

            return devisRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Devis non trouvé avec l'id: " + id));
    }

    /**
     * Supprime un devis
     */
    public void deleteDevis(Long id) {
        devisRepository.deleteById(id);
    }

    /**
     * Calcul des totaux HT/TVA/TTC
     */
    private void calculateTotals(Devis devis) {
        if (devis.getItems() == null || devis.getItems().isEmpty()) {
            devis.setTotalHT(0.0);
            devis.setTva(0.0);
            devis.setTotalTTC(0.0);
            return;
        }

        double totalHT = devis.getItems().stream()
                .mapToDouble(LineItem::getTotal)
                .sum();

        devis.setTotalHT(totalHT);

        double tva = devis.getTva() != null ? devis.getTva() : 0.0;
        double totalTTC = totalHT + (totalHT * tva / 100);

        devis.setTotalTTC(totalTTC);
    }
}
