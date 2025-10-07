package com.everlake.api.repositories;

import com.everlake.api.entities.LineItem;
import com.everlake.api.entities.Devis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LineItemRepository extends JpaRepository<LineItem, Long> {

    // Récupérer toutes les lignes d’un devis
    List<LineItem> findByDevis(Devis devis);

    // Variante : récupérer toutes les lignes par ID du devis
    List<LineItem> findByDevisId(Long devisId);
}
