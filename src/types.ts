/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  avatarColor: string;
  dateCreation: string;
  preferences: {
    stylesFavoris: string[];
    tissusPreferes: string[];
    remarquesParticulieres: string;
  };
}

export type TypeVetement = 
  | 'grand_boubou_homme' 
  | 'boubou_femme' 
  | 'taille_basse' 
  | 'kaftan_homme' 
  | 'kaftan_femme' 
  | 'mariniere' 
  | 'ndokette' 
  | 'robe_senegalaise' 
  | 'costume_homme' 
  | 'robe_femme' 
  | 'tailleur_femme' 
  | 'chemise_homme' 
  | 'autre';

export type OccasionTenue = 
  | 'tabaski' 
  | 'korite' 
  | 'magal' 
  | 'gamou' 
  | 'mariage' 
  | 'ngente_bapteme' 
  | 'vendredi' 
  | 'quotidien' 
  | 'autre';

export interface ArticleCommande {
  id: string;
  nom: string;
  description?: string;
  quantite: number;
  prixUnitaire: number;
  image?: string;
  tissuNom?: string;
  metrage?: number;
}

export interface FicheMesure {
  id: string;
  clientId: string;
  typeVetement: TypeVetement;
  datePrise: string;
  // Dynamic measurements depending on the clothing type
  mensurations: {
    [key: string]: number; // in cm
  };
  notes?: string;
}

export type StatutCommande = 
  | 'devis' 
  | 'confirmee' 
  | 'en_coupe' 
  | 'en_assemblage' 
  | 'essayage' 
  | 'livre' 
  | 'annule'
  | 'attente' 
  | 'production' 
  | 'pret';

export interface EtapeProduction {
  id: string;
  libelle: string;
  statut: 'a_faire' | 'en_cours' | 'termine';
  dateDebut?: string;
  dateFin?: string;
  responsableId: string; // Employe.id
}

export interface Commande {
  id: string;
  reference: string;
  clientId: string;
  dateCommande: string;
  modeleNom: string;
  modeleCategorie: 'homme' | 'femme' | 'enfant';
  modeleImage?: string;
  tissuNom: string;
  tissuId?: string; // reference in Tissu stock
  metrageRequis: number; // in meters
  ficheMesureId: string; // link to FicheMesure
  delaiLivraison: string; // date string
  statut: StatutCommande;
  montantTotal: number;
  acompteVerse: number;
  soldeDu: number;
  etapesProduction: EtapeProduction[];
  imagesModeles: string[]; // URLs or base64
  remarquesProduction?: string;
  factureId?: string;
  articles?: ArticleCommande[];
  occasion?: OccasionTenue;
  fournituresAssociees?: {
    tissuId: string;
    quantite: number;
  }[];
  coutMainOeuvre?: number;
  stockDeduit?: boolean;
}

export interface Tissu {
  id: string;
  reference: string;
  designation: string;
  couleur: string;
  quantiteDisponible: number; // in meters or units
  unite: string; // default 'm'
  seuilAlerte: number; // in meters or units
  prixAchat: number; // per meter or unit
  fournisseurId: string;
  categorie?: 'tissu' | 'bouton' | 'fermeture' | 'fil' | 'elastic' | 'accessoire_divers';
}

export interface Fournisseur {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
}

export type RoleEmploye = 
  | 'chef_atelier' 
  | 'maitre_tailleur' 
  | 'coupeur' 
  | 'brodeur' 
  | 'couturier' 
  | 'finisseur' 
  | 'repasseur' 
  | 'vendeur';

export interface Employe {
  id: string;
  nom: string;
  prenom: string;
  role?: RoleEmploye;
  specialite: string[]; // e.g. ['Grand Boubou', 'Broderie Cordonnet', 'Taille Basse']
  statut: 'actif' | 'inactif';
  chargeTravail: number; // number of currently assigned active tasks
  avatarColor: string;
  telephone?: string;
  email?: string;
  motDePasse?: string;
  derniereConnexion?: string;
  roleSaaS?: 'tenant_admin' | 'couturier' | 'chef_atelier' | 'vendeur' | 'coupeur';
  accesActif?: boolean;
}

export type TypeRendezVous = 'mesure' | 'essayage' | 'livraison';
export type StatutRendezVous = 'planifie' | 'effectue' | 'annule';

export interface RendezVous {
  id: string;
  clientId: string;
  commandeId?: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:MM
  type: TypeRendezVous;
  statut: StatutRendezVous;
  notes?: string;
}

export type ModePaiement = 'wave' | 'orange_money' | 'especes' | 'free_money' | 'virement' | 'carte' | 'mobile_money';
export type StatutPaiement = 'paye' | 'partiel' | 'impaye';

export interface Reglement {
  id: string;
  date: string;
  montant: number;
  mode: ModePaiement;
  reference?: string;
}

export interface Facture {
  id: string;
  numero: string;
  commandeId?: string;
  clientId: string;
  dateEmission: string;
  montantTotal: number;
  soldeDu: number;
  statut: StatutPaiement;
  reglements: Reglement[];
  designationDirecte?: string;
}

export type StatutRetouche = 'recu' | 'cours' | 'pret' | 'termine';

export interface Retouche {
  id: string;
  commandeId: string;
  clientId: string;
  description: string;
  dateDemande: string;
  statut: StatutRetouche;
  dateCloture?: string;
  notesTechniques?: string;
  delaiCible?: string;
  coutEstime?: number;
}

export interface AppNotification {
  id: string;
  type: 'stock' | 'rendezvous' | 'production' | 'retard';
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  linkTo?: { tab: string; id?: string };
}

export type StatutSaaS = 'en_attente' | 'essai' | 'actif' | 'suspendu' | 'resilie';
export type FormuleSaaS = 'mensuel' | 'annuel' | 'essai';
export type MoyenPaiementSaaS = 'mobile_money' | 'virement' | 'carte';
export type StatutPaiementSaaS = 'reussi' | 'echoue' | 'en_attente';

export interface SaasAdmin {
  nom: string;
  email: string;
  motDePasse: string;
}

export interface SaasPaiement {
  id: string;
  reference: string;
  date: string;
  montant: number;
  moyen: MoyenPaiementSaaS;
  statut: StatutPaiementSaaS;
  factureNumero: string;
}

export interface Tenant {
  id: string;
  raisonSociale: string;
  secteur: string;
  adresse: string;
  logo?: string;
  statut: StatutSaaS;
  dateInscription: string;
  dateExpiration: string; // date format YYYY-MM-DD
  formule: FormuleSaaS;
  admin: SaasAdmin;
  paiements: SaasPaiement[];
  notes?: string;
}

export interface PromoCode {
  code: string;
  reduction: number; // between 0 and 1, e.g. 0.15 for 15%
  actif: boolean;
  description: string;
}

export interface AppSettings {
  raisonSociale: string;
  slogan: string;
  telephone: string;
  adresse: string;
  ninea: string;
  devise: string;
  tauxTva: number;
  conditionsFacture: string;
  etapesDefaut: string[];
  champsMesuresActifs: {
    poitrine: boolean;
    taille: boolean;
    hanches: boolean;
    longueur_pantalon: boolean;
    longueur_robe: boolean;
    manches: boolean;
    epaule: boolean;
    encolure: boolean;
    tour_bras: boolean;
    tour_cuisse: boolean;
    [key: string]: boolean;
  };
  templateSmsPret: string;
  templateSmsRdv: string;
  acomptePourcentDefaut?: number;
  emailAtelier?: string;
  siteWebAtelier?: string;
  moyenPaiementDefaut?: string;
  templateSmsCommande?: string;
  posFondDeCaisseDefaut?: number;
  posImpressionAutoTicket?: boolean;
  posModesPaiementActifs?: {
    especes: boolean;
    mobile_money: boolean;
    virement: boolean;
    carte: boolean;
  };
  ticketEnTete?: string;
  ticketRemerciement?: string;
  ticketBasPage?: string;
  ticketAfficherNinea?: boolean;
  ticketAfficherSlogan?: boolean;
  ticketLargeur?: '58mm' | '80mm';
}

export interface SessionCaisse {
  id: string;
  dateOuverture: string;
  dateCloture?: string;
  fondInitial: number;
  montantTheorique: number; // calculated: fondInitial + cash_income - cash_outflow
  montantCompte?: number;
  ecart?: number;
  statut: 'ouverte' | 'cloturee';
  responsableId: string;
  recapModes?: {
    especes: number;
    mobile_money: number;
    virement: number;
    carte: number;
  };
}

export interface TicketCaisse {
  id: string;
  numero: string;
  sessionId: string;
  dateHeure: string;
  montant: number;
  modePaiement: ModePaiement;
  detailsMode?: {
    especes?: number;
    mobile_money?: number;
    virement?: number;
    carte?: number;
  }; // For mixed payment mode support
  statut: 'valide' | 'annule';
  motifAnnulation?: string;
  factureId?: string;
  commandeId?: string;
  caissierId: string;
  typeVente: 'commande_acompte' | 'commande_solde' | 'retouche' | 'vente_libre';
  descriptionLibre?: string;
}

export interface SortieCaisse {
  id: string;
  sessionId: string;
  dateHeure: string;
  montant: number;
  motif: string;
  justificatif?: string;
  responsableId: string;
}


