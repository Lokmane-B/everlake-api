package com.everlake.api.repositories;

import com.everlake.api.entities.Devis;
import com.everlake.api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {
    List<Devis> findByCreatedBy(User user);
    List<Devis> findByStatus(String status);
    List<Devis> findByClient(String client);
    Devis findByNumero(String numero);

    long countByRfq_Id(Long rfqId);
    List<Devis> findByRfq_Id(Long rfqId);
}

