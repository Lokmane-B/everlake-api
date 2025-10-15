package com.everlake.api.repositories;

import com.everlake.api.entities.Rfq;
import com.everlake.api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, Long> {

    // Récupérer tous les RFQ créés par un utilisateur
    List<Rfq> findByCreatedBy(User user);

    // Récupérer tous les RFQ par statut (ex: "Actif", "Brouillon")
    List<Rfq> findByStatus(String status);

    // Récupérer tous les RFQ par visibilité (publique / privée)
    List<Rfq> findByVisibility(String visibility);

    // Chercher par secteur
    List<Rfq> findBySector(String sector);

    // Chercher par titre (contient)
    List<Rfq> findByTitleContainingIgnoreCase(String keyword);


}
