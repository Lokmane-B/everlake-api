package com.everlake.api.repositories;

import com.everlake.api.entities.Devis;
import com.everlake.api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {

    // Récupérer tous les devis créés par un utilisateur donné
    List<Devis> findByCreatedBy(User user);

    // Récupérer tous les devis par statut (ex: "Envoyé", "Accepté")
    List<Devis> findByStatus(String status);

    // Récupérer tous les devis d’un client donné
    List<Devis> findByClient(String client);

    // Récupérer un devis via son numéro unique
    Devis findByNumero(String numero);
}
