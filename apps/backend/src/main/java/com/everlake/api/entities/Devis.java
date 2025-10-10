package com.everlake.api.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "devis")
@Getter
@Setter
public class Devis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numero;

    private String offreTitle;     // Titre de l'offre / marché
    private String client;         // Nom du client / entreprise
    private String secteur;        // Secteur d’activité / marché
    private String location;       // Localisation éventuelle

    private String status;         // Statut du devis
    private String commentaire;    // Commentaire interne / externe

    // Montants
    private Double totalHT;
    private Double tva;
    private Double totalTTC;

    // Dates
    private LocalDateTime dateEnvoi;
    private LocalDateTime dateExpiration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime marcheEndDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonBackReference
    private User createdBy;


    // Relation avec les lignes de devis
    @OneToMany(mappedBy = "devis", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LineItem> items;
}
