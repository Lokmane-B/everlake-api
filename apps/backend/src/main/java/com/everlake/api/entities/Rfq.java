package com.everlake.api.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rfqs")
@Getter
@Setter
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Titre de la demande
    @Column(nullable = false)
    private String title;

    // "produits" | "services" | "produits-et-services"
    @Column(name = "purchase_type")
    private String purchaseType;

    // Secteur (valeurs libres côté front)
    private String sector;

    // Descriptions longues -> TEXT
    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "cahier_des_charges", columnDefinition = "text")
    private String cahierDesCharges;

    // Quantité libre (ex: "10 palettes", "3 lots", etc.)
    private String quantity;

    // Département / ville
    private String location;

    // Budget numérique; garde BigDecimal pour éviter les erreurs d'arrondi
    @Column(precision = 19, scale = 2)
    private BigDecimal budget;

    // Type de contrat (valeurs libres)
    @Column(name = "contract_type")
    private String contractType;

    // "publique" | "privee" (on garde String pour rester cohérent avec Devis.status)
    private String visibility;

    // "Actif" | "Brouillon" (String pour cohérence avec Devis)
    private String status;

    // Date limite (le front envoie un YYYY-MM-DD)
    @Column(name = "end_date")
    private LocalDate endDate;

    // Délais d'exécution (texte libre)
    @Column(name = "delais_execution")
    private String delaisExecution;

    // Critères d'évaluation: collection simple -> table "rfq_evaluation_criteria"
    @ElementCollection
    @CollectionTable(
            name = "rfq_evaluation_criteria",
            joinColumns = @JoinColumn(name = "rfq_id")
    )
    @Column(name = "criterion", nullable = false)
    private List<String> evaluationCriteria = new ArrayList<>();

    // Société (si tu veux afficher l’émetteur côté front)
    @Column(name = "company_name")
    private String companyName;

    // Auteur
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Devis> devis;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
