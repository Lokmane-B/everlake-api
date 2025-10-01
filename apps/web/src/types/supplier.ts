export interface Supplier {
  id: string;
  nom: string;
  siret?: string;
  adresse: string;
  ville: string;
  departement: string;
  codePostal: string;
  secteurActivite: string;
  specialites: string[];
  taille: 'TPE' | 'PME' | 'ETI' | 'Grand groupe';
  chiffreAffaires?: string;
  nombreEmployes?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  logoUrl?: string;
  certifications: string[];
  description: string;
  matchingScore: number; // Pourcentage de matching (0-100)
  matchingReasons: string[]; // Raisons du matching
  derniereMiseAJour: string;
}

export interface AOCriteria {
  titre: string;
  secteur: string;
  typeAchat: string;
  localisation: string;
  budgetEstime: string;
  description: string;
  cahierDesCharges: string;
}