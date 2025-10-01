import { Supplier, AOCriteria } from '@/types/supplier';

// Import logo assets
import batiHexaLogo from '@/assets/logos/batihexa-logo.png';
import energaiaLogo from '@/assets/logos/energaia-logo.png';
import hexatechLogo from '@/assets/logos/hexatech-logo.png';
import medisanteLogo from '@/assets/logos/medisante-logo.png';
import nordisLogo from '@/assets/logos/nordis-logistique-logo.png';

const SECTEUR_SPECIALITES: Record<string, string[]> = {
  'industrie-fabrication': ['Usinage', 'Assemblage', 'Soudure', 'Traitement thermique', 'Contrôle qualité'],
  'btp-construction': ['Gros œuvre', 'Second œuvre', 'Électricité', 'Plomberie', 'Étanchéité'],
  'informatique-numerique': ['Développement web', 'Infrastructure réseau', 'Cybersécurité', 'Cloud computing', 'IA'],
  'energie-environnement': ['Énergie renouvelable', 'Audit énergétique', 'Traitement des déchets', 'Efficacité énergétique'],
  'transport-logistique': ['Transport routier', 'Entreposage', 'Supply chain', 'Logistique internationale'],
  'sante-medico-social': ['Équipements médicaux', 'Services de soins', 'Pharmacie', 'Dispositifs médicaux'],
  'commerce-distribution': ['E-commerce', 'Grande distribution', 'Commerce de détail', 'Marketing digital'],
  'conseil-audit-formation': ['Conseil en management', 'Audit financier', 'Formation professionnelle', 'RH'],
};

const CERTIFICATIONS_PAR_SECTEUR: Record<string, string[]> = {
  'industrie-fabrication': ['ISO 9001', 'ISO 14001', 'IATF 16949', 'CE'],
  'btp-construction': ['RGE', 'Qualibat', 'CSTB', 'NF Habitat'],
  'informatique-numerique': ['ISO 27001', 'CISSP', 'PCI DSS', 'GDPR'],
  'energie-environnement': ['RGE', 'ISO 14001', 'OHSAS 18001'],
  'transport-logistique': ['ATP', 'ISO 9001', 'IATA', 'FIATA'],
};

const NOMS_ENTREPRISES = [
  'Atelier Urbain', 'Axiome Bâtiment', 'NovaLogistique', 'Orion Ingénierie', 'Alpinfo Systèmes',
  'Meridien Travaux', 'Dynamis Transport', 'Voltaire Énergie', 'Praxis Conseil', 'Arkane Industries',
  'Phenix Logistique', 'Sigma Solutions', 'Atlantis Consulting', 'Boreas Construction', 'Zénith Technologies'
];

const VILLES_FR = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier',
  'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne',
  'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'
];

const LOGOS_EXEMPLES = [
  batiHexaLogo,
  energaiaLogo,
  hexatechLogo,
  medisanteLogo,
  nordisLogo
];

function calculateMatchingScore(supplier: Supplier, criteria: AOCriteria): number {
  let score = 0;
  const reasons: string[] = [];

  // Secteur d'activité (40% du score)
  if (supplier.secteurActivite === criteria.secteur) {
    score += 40;
    reasons.push('Secteur d\'activité correspondant');
  }

  // Localisation (30% du score)
  const criteriaDept = criteria.localisation.split(' - ')[0];
  if (supplier.departement.includes(criteriaDept)) {
    score += 30;
    reasons.push('Localisation géographique');
  } else if (supplier.departement.includes('Île-de-France') && criteria.localisation.includes('75')) {
    score += 20;
    reasons.push('Proximité géographique');
  }

  // Spécialités liées au type d'achat (20% du score)
  const typeAchatKeywords = criteria.typeAchat.toLowerCase();
  const hasRelevantSpecialty = supplier.specialites.some(spec => 
    typeAchatKeywords.includes('services') && spec.toLowerCase().includes('service') ||
    typeAchatKeywords.includes('produits') && spec.toLowerCase().includes('produit')
  );
  if (hasRelevantSpecialty) {
    score += 20;
    reasons.push('Spécialité correspondante');
  }

  // Certifications (10% du score)
  if (supplier.certifications.length > 0) {
    score += 10;
    reasons.push('Certifications qualité');
  }

  supplier.matchingReasons = reasons;
  return Math.min(score, 100);
}

export function generateSuppliers(criteria: AOCriteria, count: number = 15): Supplier[] {
  const suppliers: Supplier[] = [];
  const secteurSpecialites = SECTEUR_SPECIALITES[criteria.secteur] || ['Services généraux'];
  const secteurCertifications = CERTIFICATIONS_PAR_SECTEUR[criteria.secteur] || ['ISO 9001'];

  // Create varied sectors and locations for realistic score distribution
  const allSecteurs = Object.keys(SECTEUR_SPECIALITES);
  const allDepartements = [
    '75 - Paris', '69 - Rhône', '13 - Bouches-du-Rhône', '31 - Haute-Garonne',
    '06 - Alpes-Maritimes', '44 - Loire-Atlantique', '33 - Gironde', '59 - Nord'
  ];

  for (let i = 0; i < count; i++) {
    const nom = `${NOMS_ENTREPRISES[i % NOMS_ENTREPRISES.length]} ${i > 14 ? i : ''}`.trim();
    const ville = VILLES_FR[i % VILLES_FR.length];
    const tailles: Supplier['taille'][] = ['TPE', 'PME', 'ETI'];
    const taille = tailles[Math.floor(Math.random() * tailles.length)];

    // First 6 suppliers match criteria exactly, others vary for realistic distribution
    const secteurToUse = i < 6 ? criteria.secteur : allSecteurs[Math.floor(Math.random() * allSecteurs.length)];
    const secteurSpecialitesToUse = SECTEUR_SPECIALITES[secteurToUse] || ['Services généraux'];
    const secteurCertificationsToUse = CERTIFICATIONS_PAR_SECTEUR[secteurToUse] || ['ISO 9001'];
    
    // First 6 suppliers match location criteria exactly
    const departementToUse = i < 6 ? (criteria.localisation || '75 - Paris') : allDepartements[Math.floor(Math.random() * allDepartements.length)];

    const supplier: Supplier = {
      id: `supplier-${i + 1}`,
      nom,
      siret: `${Math.random().toString().slice(2, 16)}`,
      adresse: `${Math.floor(Math.random() * 200)} rue de la République`,
      ville,
      departement: departementToUse,
      codePostal: `${Math.floor(10000 + Math.random() * 90000)}`,
      secteurActivite: secteurToUse,
      specialites: secteurSpecialitesToUse.slice(0, 2 + Math.floor(Math.random() * 3)),
      taille,
      chiffreAffaires: taille === 'TPE' ? '< 2M€' : taille === 'PME' ? '2-50M€' : '50-1500M€',
      nombreEmployes: taille === 'TPE' ? '< 10' : taille === 'PME' ? '10-250' : '250-5000',
      telephone: `+33 ${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `contact@${nom.toLowerCase().replace(/\s+/g, '')}.fr`,
      siteWeb: `https://www.${nom.toLowerCase().replace(/\s+/g, '')}.fr`,
      logoUrl: Math.random() > 0.85 ? LOGOS_EXEMPLES[Math.floor(Math.random() * LOGOS_EXEMPLES.length)] : undefined, // Only ~15% have logos
      certifications: secteurCertificationsToUse.slice(0, 1 + Math.floor(Math.random() * 2)),
      description: `Entreprise spécialisée dans ${secteurSpecialitesToUse[0].toLowerCase()} avec ${Math.floor(5 + Math.random() * 20)} ans d'expérience. Notre équipe d'experts vous accompagne sur vos projets les plus exigeants.`,
      matchingScore: 0,
      matchingReasons: [],
      derniereMiseAJour: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    supplier.matchingScore = calculateMatchingScore(supplier, criteria);
    
    // Add some jitter to create more realistic score distribution
    const jitter = Math.floor(Math.random() * 15) - 7; // -7 to +7
    supplier.matchingScore = Math.max(15, Math.min(100, supplier.matchingScore + jitter));
    
    suppliers.push(supplier);
  }

  // Tri par score décroissant
  return suppliers.sort((a, b) => b.matchingScore - a.matchingScore);
}