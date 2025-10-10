package com.everlake.api.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "line_items")
@Getter
@Setter
public class LineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private Double unitPrice;

    private String unit; // ex: m², pièce, jour, etc.

    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devis_id", nullable = false)
    private Devis devis;

    // Optionnel : un getter pour calculer le total d'une ligne
    public Double getTotal() {
        if (unitPrice == null || quantity == null) return 0.0;
        return unitPrice * quantity;
    }
}
