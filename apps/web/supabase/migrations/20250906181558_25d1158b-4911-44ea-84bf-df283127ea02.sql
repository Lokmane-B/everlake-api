-- Insérer un appel d'offre complet en exemple (sans created_by pour être visible publiquement)
INSERT INTO public.marches (
  title,
  description,
  sector,
  location,
  budget,
  start_date,
  end_date,
  company_name,
  contract_type,
  quantity,
  cahier_des_charges,
  evaluation_criteria,
  documents,
  visibility,
  status,
  created_at,
  updated_at
) VALUES (
  'Développement d''une Application Mobile de Gestion de Stock',
  'Nous recherchons un prestataire expérimenté pour développer une application mobile native (iOS et Android) destinée à la gestion de stock en temps réel. L''application doit permettre le suivi des inventaires, la gestion des commandes, et l''intégration avec nos systèmes existants. Interface utilisateur moderne et intuitive requise.',
  'Informatique et Numérique',
  'Lyon, France',
  '45000-65000 €',
  '2025-02-01'::date,
  '2025-05-30'::date,
  'TechLogistics SARL',
  'Forfait',
  '1 application complète',
  'L''application doit inclure les fonctionnalités suivantes :

1. AUTHENTIFICATION ET SÉCURITÉ
   - Connexion sécurisée avec authentification à deux facteurs
   - Gestion des rôles utilisateurs (Admin, Manager, Employé)
   - Chiffrement des données sensibles

2. GESTION DES STOCKS
   - Scan de codes-barres et QR codes
   - Ajout/suppression/modification d''articles
   - Suivi des mouvements de stock en temps réel
   - Alertes de stock bas automatiques
   - Historique complet des transactions

3. INTERFACE UTILISATEUR
   - Design responsive et moderne
   - Navigation intuitive
   - Mode sombre/clair
   - Support multilingue (FR/EN)

4. INTÉGRATIONS TECHNIQUES
   - API REST pour synchronisation avec ERP existant
   - Base de données locale avec synchronisation cloud
   - Notifications push
   - Export de rapports (PDF, Excel)

5. FONCTIONNALITÉS AVANCÉES
   - Géolocalisation des stocks
   - Recherche avancée et filtres
   - Tableaux de bord analytiques
   - Sauvegarde automatique

CONTRAINTES TECHNIQUES :
- Développement natif iOS (Swift) et Android (Kotlin)
- Architecture MVVM recommandée
- Tests unitaires et d''intégration obligatoires
- Documentation technique complète
- Code source livré avec licence

LIVRABLES ATTENDUS :
- Applications iOS et Android fonctionnelles
- Code source commenté
- Documentation technique et utilisateur
- Formation de 2 jours pour nos équipes
- 6 mois de maintenance corrective incluse',
  '[
    {
      "criterion": "Expérience technique",
      "weight": 30,
      "description": "Expertise en développement mobile natif, références similaires"
    },
    {
      "criterion": "Qualité de la proposition",
      "weight": 25,
      "description": "Architecture technique, UI/UX, planning détaillé"
    },
    {
      "criterion": "Prix",
      "weight": 20,
      "description": "Rapport qualité-prix, transparence des coûts"
    },
    {
      "criterion": "Délais",
      "weight": 15,
      "description": "Respect du planning, disponibilité équipe"
    },
    {
      "criterion": "Maintenance et support",
      "weight": 10,
      "description": "Engagement post-livraison, réactivité support"
    }
  ]'::jsonb,
  '[
    {
      "name": "Cahier des charges détaillé.pdf",
      "url": "/documents/cdc-app-mobile-2025.pdf",
      "type": "application/pdf",
      "size": "2.3 MB"
    },
    {
      "name": "Maquettes UI existantes.zip",
      "url": "/documents/maquettes-ui.zip", 
      "type": "application/zip",
      "size": "15.7 MB"
    },
    {
      "name": "Spécifications API.pdf",
      "url": "/documents/api-specs.pdf",
      "type": "application/pdf", 
      "size": "856 KB"
    }
  ]'::jsonb,
  'publique',
  'Actif',
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'Rénovation Énergétique d''un Bâtiment Industriel',
  'Appel d''offres pour la rénovation énergétique complète d''un bâtiment industriel de 3000m². Objectif : réduction de 40% de la consommation énergétique. Travaux d''isolation, changement de système de chauffage, installation de panneaux solaires.',
  'BTP et Construction',
  'Marseille, France',
  '180000-220000 €',
  '2025-03-15'::date,
  '2025-08-31'::date,
  'GreenIndustry SA',
  'Entreprise générale',
  '3000 m² de bâtiment',
  'PROJET DE RÉNOVATION ÉNERGÉTIQUE

CONTEXTE :
Bâtiment industriel construit en 1985, nécessitant une mise aux normes énergétiques et une amélioration des performances thermiques.

TRAVAUX À RÉALISER :

1. ISOLATION THERMIQUE
   - Isolation des murs extérieurs (140mm laine de roche)
   - Isolation de la toiture (200mm polyuréthane)
   - Remplacement de 45 fenêtres par du double vitrage
   - Traitement des ponts thermiques

2. SYSTÈME DE CHAUFFAGE
   - Remplacement chaudière gaz par pompe à chaleur industrielle
   - Installation VMC double flux
   - Régulation intelligente par zones
   - Récupération de chaleur sur process industriels

3. ÉNERGIE RENOUVELABLE  
   - Installation 150 kWc panneaux photovoltaïques
   - Système de stockage batterie 50 kWh
   - Onduleurs et monitoring

4. ÉLECTRICITÉ ET DOMOTIQUE
   - Mise aux normes installation électrique
   - Éclairage LED avec détection présence
   - Système de monitoring énergétique
   - Interface de pilotage connectée

CONTRAINTES :
- Maintien de l''activité industrielle pendant travaux
- Respect normes RT 2012 et futures RE 2020
- Certification Qualibat requise
- Garantie 10 ans sur isolation, 5 ans sur installations

PLANNING :
- Phase 1 (Mars-Avril) : Isolation et menuiseries
- Phase 2 (Mai-Juin) : Chauffage et ventilation  
- Phase 3 (Juillet-Août) : Photovoltaïque et finitions',
  '[
    {
      "criterion": "Qualifications et certifications",
      "weight": 25,
      "description": "RGE, Qualibat, références en rénovation énergétique"
    },
    {
      "criterion": "Solution technique",
      "weight": 30,
      "description": "Performance énergétique, innovation, durabilité"
    },
    {
      "criterion": "Prix et rentabilité",
      "weight": 20,
      "description": "Coût global, retour sur investissement, aides"
    },
    {
      "criterion": "Planning et organisation",
      "weight": 15,
      "description": "Phasage travaux, minimisation nuisances"
    },
    {
      "criterion": "Garanties et SAV",
      "weight": 10,
      "description": "Durée garanties, maintenance préventive"
    }
  ]'::jsonb,
  '[
    {
      "name": "Plans architecte.dwg",
      "url": "/documents/plans-batiment.dwg",
      "type": "application/dwg",
      "size": "4.2 MB"
    },
    {
      "name": "Audit énergétique.pdf", 
      "url": "/documents/audit-energetique.pdf",
      "type": "application/pdf",
      "size": "1.8 MB"
    },
    {
      "name": "Photos bâtiment.zip",
      "url": "/documents/photos-batiment.zip",
      "type": "application/zip",
      "size": "28.5 MB"
    }
  ]'::jsonb,
  'publique',
  'Actif',
  now() - interval '1 day',
  now() - interval '1 day'
),
(
  'Création d''un Site E-commerce Spécialisé',
  'Développement d''une plateforme e-commerce B2B pour la vente d''équipements professionnels. Intégration paiement, gestion stocks, espace client personnalisé, interface d''administration complète.',
  'Informatique et Numérique',
  'Paris, France',
  '25000-35000 €',
  '2025-01-20'::date,
  '2025-04-15'::date,
  'ProEquip Solutions',
  'Développement web',
  '1 site e-commerce complet',
  'CAHIER DES CHARGES E-COMMERCE

FONCTIONNALITÉS FRONT-OFFICE :
- Catalogue produits avec recherche avancée et filtres
- Fiches produits détaillées avec images et documentation
- Panier et tunnel de commande optimisé
- Espace client avec historique commandes
- Devis en ligne et gestion des tarifs B2B
- Système de points de fidélité
- Module de recommandations produits

FONCTIONNALITÉS BACK-OFFICE :
- Gestion catalogue (produits, catégories, stocks)
- Gestion commandes et expéditions
- Gestion clients et tarifs personnalisés
- Statistiques et reporting avancé
- Gestion contenus et actualités
- Système de promotions et codes promo

INTÉGRATIONS REQUISES :
- Paiement sécurisé (CB, virement, chèque)
- ERP existant pour synchronisation stocks
- Transporteurs (Chronopost, DPD, etc.)
- Comptabilité (export factures)
- Newsletter et emailing
- Google Analytics et Search Console

CONTRAINTES TECHNIQUES :
- Responsive design (mobile first)
- Optimisation SEO avancée
- Performance (temps chargement < 3s)
- Sécurité renforcée (SSL, protection données)
- Sauvegarde automatique quotidienne',
  '[
    {
      "criterion": "Expertise e-commerce",
      "weight": 35,
      "description": "Expérience plateformes B2B, références similaires"
    },
    {
      "criterion": "Solution technique",
      "weight": 25,
      "description": "Architecture, performance, sécurité, intégrations"
    },
    {
      "criterion": "Prix",
      "weight": 20,
      "description": "Rapport qualité-prix, coûts détaillés"
    },
    {
      "criterion": "Design et UX",
      "weight": 12,
      "description": "Interface utilisateur, expérience d''achat"
    },
    {
      "criterion": "Support et formation",
      "weight": 8,
      "description": "Formation équipe, documentation, maintenance"
    }
  ]'::jsonb,
  '[
    {
      "name": "Arborescence et wireframes.pdf",
      "url": "/documents/wireframes-ecommerce.pdf",
      "type": "application/pdf",
      "size": "3.1 MB"
    },
    {
      "name": "Charte graphique.zip",
      "url": "/documents/charte-graphique.zip",
      "type": "application/zip",
      "size": "12.4 MB"
    }
  ]'::jsonb,
  'publique',
  'Actif',
  now() - interval '3 days',
  now() - interval '3 days'
);