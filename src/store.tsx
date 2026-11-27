/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  FicheMesure,
  Commande,
  Tissu,
  Fournisseur,
  Employe,
  RendezVous,
  Facture,
  Retouche,
  AppNotification,
  TypeVetement,
  StatutCommande,
  EtapeProduction,
  Reglement,
  ModePaiement,
  StatutPaiement,
  Tenant,
  SaasPaiement,
  FormuleSaaS,
  StatutSaaS,
  MoyenPaiementSaaS,
  StatutPaiementSaaS,
  PromoCode,
  AppSettings,
  SessionCaisse,
  TicketCaisse,
  SortieCaisse
} from './types';

interface AtelierStore {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  formatPrice: (amount: number) => string;
  clients: Client[];
  ficheMesures: FicheMesure[];
  commandes: Commande[];
  tissus: Tissu[];
  fournisseurs: Fournisseur[];
  employes: Employe[];
  rendezVous: RendezVous[];
  factures: Facture[];
  retouches: Retouche[];
  notifications: AppNotification[];
  
  // Point de Vente (POS) & Gestion de Caisse
  sessionsCaisse: SessionCaisse[];
  ticketsCaisse: TicketCaisse[];
  sortiesCaisse: SortieCaisse[];
  sessionCaisseActive: SessionCaisse | null;
  ouvrirSessionCaisse: (fondInitial: number, responsableId: string) => SessionCaisse;
  cloturerSessionCaisse: (montantCompte: number) => void;
  addTicketCaisse: (ticket: Omit<TicketCaisse, 'id' | 'numero' | 'dateHeure' | 'statut' | 'sessionId'>) => TicketCaisse;
  annulerTicketCaisse: (ticketId: string, motif: string) => void;
  addSortieCaisse: (sortie: Omit<SortieCaisse, 'id' | 'dateHeure' | 'sessionId'>) => SortieCaisse;
  
  // Actions Clients
  addClient: (client: Omit<Client, 'id' | 'dateCreation' | 'avatarColor'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  // Actions Mesures
  addFicheMesure: (mesure: Omit<FicheMesure, 'id' | 'datePrise'>) => FicheMesure;
  updateFicheMesure: (mesure: FicheMesure) => void;
  deleteFicheMesure: (id: string) => void;
  
  // Actions Commandes
  addCommande: (commande: Omit<Commande, 'id' | 'reference' | 'dateCommande' | 'soldeDu' | 'etapesProduction'>) => Commande;
  updateCommande: (commande: Commande) => void;
  updateCommandeStatut: (id: string, statut: StatutCommande) => void;
  updateEtapeProduction: (commandeId: string, etapeId: string, updates: Partial<EtapeProduction>) => void;
  deleteCommande: (id: string) => void;
  
  // Actions Stock / Tissus
  addTissu: (tissu: Omit<Tissu, 'id'>) => Tissu;
  updateTissu: (tissu: Tissu) => void;
  deleteTissu: (id: string) => void;
  adjustTissuStock: (id: string, change: number) => void;
  
  // Actions Fournisseurs
  addFournisseur: (fournisseur: Omit<Fournisseur, 'id'>) => Fournisseur;
  updateFournisseur: (fournisseur: Fournisseur) => void;
  deleteFournisseur: (id: string) => void;
  
  // Actions Employés
  addEmploye: (employe: Omit<Employe, 'id' | 'chargeTravail' | 'avatarColor'>) => Employe;
  updateEmploye: (employe: Employe) => void;
  deleteEmploye: (id: string) => void;
  
  // Actions Rendez-vous
  addRendezVous: (rdv: Omit<RendezVous, 'id' | 'statut'>) => RendezVous;
  updateRendezVous: (rdv: RendezVous) => void;
  deleteRendezVous: (id: string) => void;
  
  // Actions Facturation & Règlements
  addReglement: (factureId: string, reglement: Omit<Reglement, 'id' | 'date'>) => void;
  addFacture: (
    facture: Omit<Facture, 'id' | 'numero' | 'dateEmission' | 'soldeDu' | 'reglements' | 'statut'>,
    acompte?: number,
    modeAcompte?: ModePaiement,
    refAcompte?: string
  ) => Facture;
  
  // Actions Retouches
  addRetouche: (retouche: Omit<Retouche, 'id' | 'dateDemande' | 'statut'>) => Retouche;
  updateRetouche: (retouche: Retouche) => void;
  deleteRetouche: (id: string) => void;
  
  // Actions Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  
  // Backup & Reset
  exportDatabase: () => void;
  importDatabase: (jsonString: string) => boolean;
  resetDatabase: () => void;

  // SaaS Multi-Tenant additions
  tenants: Tenant[];
  currentTenantId: string;
  userRole: 'super_admin' | 'tenant_admin' | 'chef_atelier' | 'couturier';
  pricing: { mensuel: number; annuel: number };
  
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  setCurrentTenantId: (id: string) => void;
  setUserRole: (role: 'super_admin' | 'tenant_admin' | 'chef_atelier' | 'couturier') => void;
  updatePricing: (pricing: { mensuel: number; annuel: number }) => void;
  registerTenant: (tenantData: Omit<Tenant, 'id' | 'dateInscription' | 'paiements'>) => Tenant;
  updateTenant: (tenant: Tenant) => void;
  addTenantPayment: (tenantId: string, payment: Omit<SaasPaiement, 'id' | 'date'>) => void;
  
  // Promo code operations
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  deletePromoCode: (codeName: string) => void;
  togglePromoCode: (codeName: string) => void;
}

const StoreContext = createContext<AtelierStore | undefined>(undefined);

// Initial Color Palettes for gorgeous avatars
const AVATAR_COLORS = [
  'bg-emerald-600 text-white',
  'bg-slate-700 text-slate-100',
  'bg-amber-600 text-white',
  'bg-blue-600 text-white',
  'bg-rose-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
  'bg-yellow-700 text-amber-50',
  'bg-purple-600 text-white'
];

// Seed Data
const SEED_FOURNISSEURS: Fournisseur[] = [
  {
    id: 'fourn-1',
    nom: 'Établissements Diallo & Fils',
    contact: 'Moustapha Diallo',
    telephone: '+221 77 543 21 09',
    email: 'contact@diallotissus.sn',
    adresse: 'Marché Sandaga, Allée des Brodeurs, Dakar, Sénégal'
  },
  {
    id: 'fourn-2',
    nom: 'Tissus & Co Paris',
    contact: 'Hélène Dubois',
    telephone: '+33 1 42 68 90 11',
    email: 'commande@tissusandco.fr',
    adresse: '45 Rue du Faubourg Saint-Antoine, 75011 Paris, France'
  }
];

const SEED_TISSUS: Tissu[] = [
  {
    id: 'tissu-1',
    reference: 'BAZ-099',
    designation: 'Bazin Riche Super-Gagnila',
    couleur: 'Bleu Royal Impérial',
    quantiteDisponible: 18.5,
    unite: 'm',
    seuilAlerte: 5,
    prixAchat: 12500, // FCFA per meter
    fournisseurId: 'fourn-1',
    categorie: 'tissu'
  },
  {
    id: 'tissu-2',
    reference: 'LIN-204',
    designation: 'Lin Belge Pur Premium',
    couleur: 'Blanc Ivoire',
    quantiteDisponible: 12.0,
    unite: 'm',
    seuilAlerte: 4,
    prixAchat: 9500,
    fournisseurId: 'fourn-2',
    categorie: 'tissu'
  },
  {
    id: 'tissu-3',
    reference: 'SOI-402',
    designation: 'Soie Duchesse Lourde',
    couleur: 'Rouge Bordeaux Profond',
    quantiteDisponible: 7.2,
    unite: 'm',
    seuilAlerte: 5,
    prixAchat: 18000,
    fournisseurId: 'fourn-2',
    categorie: 'tissu'
  },
  {
    id: 'tissu-4',
    reference: 'TWE-112',
    designation: 'Tweed d\'Hiver Anglais',
    couleur: 'Gris Anthracite Chiné',
    quantiteDisponible: 3.5, // Triggering low stock !
    unite: 'm',
    seuilAlerte: 5,
    prixAchat: 14500,
    fournisseurId: 'fourn-2',
    categorie: 'tissu'
  },
  {
    id: 'tissu-5',
    reference: 'WAX-301',
    designation: 'Wax Hollandais Authentique',
    couleur: 'Motifs Dorés & Vert Émeraude',
    quantiteDisponible: 24.0,
    unite: 'm',
    seuilAlerte: 6,
    prixAchat: 8000,
    fournisseurId: 'fourn-1',
    categorie: 'tissu'
  },
  {
    id: 'tissu-6',
    reference: 'BTN-001',
    designation: 'Boutons Dorés Blazer Haute Couture',
    couleur: 'Or Brillant',
    quantiteDisponible: 120,
    unite: 'pièces',
    seuilAlerte: 20,
    prixAchat: 250,
    fournisseurId: 'fourn-1',
    categorie: 'bouton'
  },
  {
    id: 'tissu-7',
    reference: 'FER-102',
    designation: 'Fermeture Éclair Invisible YKK 50cm',
    couleur: 'Noir',
    quantiteDisponible: 45,
    unite: 'pièces',
    seuilAlerte: 10,
    prixAchat: 600,
    fournisseurId: 'fourn-1',
    categorie: 'fermeture'
  },
  {
    id: 'tissu-8',
    reference: 'FIL-302',
    designation: 'Fil à Coudre Polyester Industriel 5000m',
    couleur: 'Blanc Neige',
    quantiteDisponible: 15,
    unite: 'bobines',
    seuilAlerte: 3,
    prixAchat: 1200,
    fournisseurId: 'fourn-2',
    categorie: 'fil'
  },
  {
    id: 'tissu-9',
    reference: 'ELA-088',
    designation: 'Bande Élastique Souple 25mm',
    couleur: 'Blanc',
    quantiteDisponible: 30,
    unite: 'm',
    seuilAlerte: 5,
    prixAchat: 350,
    fournisseurId: 'fourn-1',
    categorie: 'elastic'
  }
];

const SEED_EMPLOYES: Employe[] = [
  {
    id: 'emp-1',
    nom: 'Fall',
    prenom: 'Cheikh',
    role: 'chef_atelier',
    specialite: ['Costume Homme', 'Grand Boubou', 'Coupe'],
    statut: 'actif',
    chargeTravail: 2,
    avatarColor: 'bg-indigo-600 text-white',
    telephone: '+221 77 123 45 01',
    email: 'cheikh@foxcouture.sn',
    motDePasse: 'cheikh123',
    roleSaaS: 'chef_atelier',
    accesActif: true,
    derniereConnexion: '2026-07-05 10:15'
  },
  {
    id: 'emp-2',
    nom: 'Cissé',
    prenom: 'Aminata',
    role: 'couturier',
    specialite: ['Robe de Soirée', 'Tailleur Femme', 'Finition', 'Perlage'],
    statut: 'actif',
    chargeTravail: 1,
    avatarColor: 'bg-emerald-600 text-white',
    telephone: '+221 77 123 45 02',
    email: 'aminata@foxcouture.sn',
    motDePasse: 'aminata123',
    roleSaaS: 'couturier',
    accesActif: true,
    derniereConnexion: '2026-07-06 08:02'
  },
  {
    id: 'emp-3',
    nom: 'Traoré',
    prenom: 'Moussa',
    role: 'coupeur',
    specialite: ['Montage', 'Couture standard', 'Repassage'],
    statut: 'actif',
    chargeTravail: 1,
    avatarColor: 'bg-amber-600 text-white',
    telephone: '+221 77 123 45 03',
    email: 'moussa@foxcouture.sn',
    motDePasse: 'moussa123',
    roleSaaS: 'couturier',
    accesActif: false,
    derniereConnexion: '—'
  }
];

const SEED_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    nom: 'Sow',
    prenom: 'Awa',
    telephone: '77 123 45 67',
    email: 'awa.sow@gmail.com',
    adresse: 'Almadies, Route du Méridien, Dakar',
    avatarColor: '#BFDBFE', // Pastel Blue
    dateCreation: '2026-05-15',
    preferences: {
      stylesFavoris: ['Taille Basse Bazin brodé', 'Grand Boubou de fête'],
      tissusPreferes: ['Bazin Riche Getzner', 'Voile Suisse'],
      remarquesParticulieres: 'Exige des broderies fines couleur or. Encolure ronde.'
    }
  },
  {
    id: 'cli-2',
    nom: 'Ba',
    prenom: 'Fatou',
    telephone: '77 000 00 00',
    email: 'fatou.ba@outlook.com',
    adresse: 'Sacré-Cœur 3, Immeuble C, Dakar',
    avatarColor: '#FED7AA', // Pastel Orange
    dateCreation: '2026-06-01',
    preferences: {
      stylesFavoris: ['Robe en Wax Vlisco', 'Marinière'],
      tissusPreferes: ['Wax Hollandais Authentique', 'Thioup teinté'],
      remarquesParticulieres: 'Manches trois-quarts amples. Cintrée à la taille.'
    }
  },
  {
    id: 'cli-3',
    nom: 'Diop',
    prenom: 'Mamadou',
    telephone: '77 654 32 10',
    email: 'm.diop@gmail.com',
    adresse: 'Fann Résidence, Villa 42, Dakar',
    avatarColor: '#BBF7D0', // Pastel Green
    dateCreation: '2026-06-18',
    preferences: {
      stylesFavoris: ['Grand Boubou 3 pièces', 'Kaftan Royal col officier'],
      tissusPreferes: ['Bazin Riche Super-Gagnila', 'Lin pur'],
      remarquesParticulieres: 'Finitions impeccables aux poignets. Broderie fil blanc.'
    }
  },
  {
    id: 'cli-4',
    nom: 'Fall',
    prenom: 'Mariama',
    telephone: '78 543 21 00',
    email: 'mariama.fall@gmail.com',
    adresse: 'Mermoz Pyrotechnie, Dakar',
    avatarColor: '#FECDD3', // Pastel Pink
    dateCreation: '2026-06-25',
    preferences: {
      stylesFavoris: ['Ndokette en Soie', 'Taille Basse'],
      tissusPreferes: ['Soie Duchesse', 'Dentelle lourde'],
      remarquesParticulieres: 'Tenues pour cérémonies et mariages.'
    }
  }
];

const SEED_FICHE_MESURES: FicheMesure[] = [
  {
    id: 'mesure-1',
    clientId: 'cli-1',
    typeVetement: 'costume_homme',
    datePrise: '2026-05-15',
    mensurations: {
      encolure: 41,
      poitrine: 104,
      taille: 92,
      bassin: 108,
      manche: 65,
      longueurVeste: 76,
      longueurPantalon: 105,
      cuisse: 58,
      genou: 23,
      basPantalon: 19
    },
    notes: 'Prise par Cheikh. Épaule droite -1cm appliquée.'
  },
  {
    id: 'mesure-2',
    clientId: 'cli-2',
    typeVetement: 'robe_femme',
    datePrise: '2026-06-01',
    mensurations: {
      poitrine: 92,
      taille: 70,
      bassin: 96,
      epauleAepaule: 38,
      manche: 58,
      longueurRobe: 102,
      hauteurPoitrine: 25
    },
    notes: 'Prise par Aminata. Robe de soirée drapée en soie.'
  },
  {
    id: 'mesure-3',
    clientId: 'cli-3',
    typeVetement: 'chemise_homme',
    datePrise: '2026-06-18',
    mensurations: {
      encolure: 42,
      poitrine: 108,
      taille: 98,
      manche: 66,
      longueurDos: 78
    },
    notes: 'Prise par Cheikh. Chemise décontractée en lin.'
  },
  {
    id: 'mesure-4',
    clientId: 'cli-4',
    typeVetement: 'tailleur_femme',
    datePrise: '2026-06-25',
    mensurations: {
      poitrine: 96,
      taille: 76,
      bassin: 102,
      epauleAepaule: 40,
      manche: 60,
      longueurVeste: 62,
      longueurJupe: 58
    },
    notes: 'Prise par Aminata. Tailleur veste + jupe cintrée.'
  }
];

const SEED_COMMANDES: Commande[] = [
  {
    id: 'cmd-1',
    reference: 'CMD-2026-001',
    clientId: 'cli-1',
    dateCommande: '2026-08-01',
    modeleNom: 'Taille Basse Bazin Brodé Or',
    modeleCategorie: 'femme',
    tissuNom: 'Bazin Riche Super-Gagnila - Bleu Royal',
    tissuId: 'tissu-1',
    metrageRequis: 4.0,
    ficheMesureId: 'mesure-1',
    delaiLivraison: '2026-08-15',
    statut: 'production',
    montantTotal: 45000, // FCFA
    acompteVerse: 25000,
    soldeDu: 20000,
    occasion: 'tabaski',
    articles: [
      {
        id: 'art-1',
        nom: 'Taille Basse Bazin Brodé Or',
        quantite: 1,
        prixUnitaire: 45000,
        tissuNom: 'Bazin Riche Super-Gagnila'
      }
    ],
    etapesProduction: [
      { id: 'et-1-1', libelle: 'coupe', statut: 'termine', dateDebut: '2026-08-02', dateFin: '2026-08-02', responsableId: 'emp-3' },
      { id: 'et-1-2', libelle: 'broderie', statut: 'en_cours', dateDebut: '2026-08-03', responsableId: 'emp-1' },
      { id: 'et-1-3', libelle: 'montage', statut: 'a_faire', responsableId: 'emp-2' },
      { id: 'et-1-4', libelle: 'finition', statut: 'a_faire', responsableId: 'emp-2' },
      { id: 'et-1-5', libelle: 'repassage', statut: 'a_faire', responsableId: 'emp-3' }
    ],
    imagesModeles: [],
    remarquesProduction: 'Broderie cordonnet dorée au col et aux poignets.',
    factureId: 'fact-1'
  },
  {
    id: 'cmd-2',
    reference: 'CMD-2026-002',
    clientId: 'cli-2',
    dateCommande: '2026-08-02',
    modeleNom: 'Robe en Wax Vlisco & Dentelle',
    modeleCategorie: 'femme',
    tissuNom: 'Wax Hollandais Authentique',
    tissuId: 'tissu-5',
    metrageRequis: 3.0,
    ficheMesureId: 'mesure-2',
    delaiLivraison: '2026-08-10',
    statut: 'pret',
    montantTotal: 35000,
    acompteVerse: 35000,
    soldeDu: 0,
    occasion: 'mariage',
    articles: [
      {
        id: 'art-2',
        nom: 'Robe en Wax Vlisco',
        quantite: 1,
        prixUnitaire: 35000,
        tissuNom: 'Wax Hollandais Authentique'
      }
    ],
    etapesProduction: [
      { id: 'et-2-1', libelle: 'coupe', statut: 'termine', dateDebut: '2026-08-02', dateFin: '2026-08-03', responsableId: 'emp-3' },
      { id: 'et-2-2', libelle: 'montage', statut: 'termine', dateDebut: '2026-08-03', dateFin: '2026-08-05', responsableId: 'emp-2' },
      { id: 'et-2-3', libelle: 'essayage', statut: 'termine', dateDebut: '2026-08-06', dateFin: '2026-08-06', responsableId: 'emp-2' },
      { id: 'et-2-4', libelle: 'finition', statut: 'termine', dateDebut: '2026-08-06', dateFin: '2026-08-07', responsableId: 'emp-2' },
      { id: 'et-2-5', libelle: 'repassage', statut: 'termine', dateDebut: '2026-08-07', dateFin: '2026-08-07', responsableId: 'emp-3' }
    ],
    imagesModeles: [],
    remarquesProduction: 'Finition soignée avec fermeture invisible au dos.',
    factureId: 'fact-2'
  },
  {
    id: 'cmd-3',
    reference: 'CMD-2026-003',
    clientId: 'cli-3',
    dateCommande: '2026-06-20',
    modeleNom: 'Grand Boubou Brodé Traditionnel',
    modeleCategorie: 'homme',
    tissuNom: 'Bazin Riche Super-Gagnila - Bleu Royal',
    tissuId: 'tissu-1',
    metrageRequis: 7.0,
    ficheMesureId: 'mesure-3',
    delaiLivraison: '2026-07-28',
    statut: 'attente',
    montantTotal: 180000,
    acompteVerse: 100000,
    soldeDu: 80000,
    etapesProduction: [
      { id: 'et-3-1', libelle: 'coupe', statut: 'a_faire', responsableId: 'emp-1' },
      { id: 'et-3-2', libelle: 'montage', statut: 'a_faire', responsableId: 'emp-3' },
      { id: 'et-3-3', libelle: 'finition', statut: 'a_faire', responsableId: 'emp-1' },
      { id: 'et-3-4', libelle: 'repassage', statut: 'a_faire', responsableId: 'emp-3' }
    ],
    imagesModeles: [],
    remarquesProduction: 'Broderies or au col et poches.',
    factureId: 'fact-3'
  }
];

const SEED_FACTURES: Facture[] = [
  {
    id: 'fact-1',
    numero: 'FACT-2026-001',
    commandeId: 'cmd-1',
    clientId: 'cli-1',
    dateEmission: '2026-06-10',
    montantTotal: 450000,
    soldeDu: 200000,
    statut: 'partiel',
    reglements: [
      { id: 'reg-1-1', date: '2026-06-10', montant: 250000, mode: 'mobile_money', reference: 'WAVE-1123445' }
    ]
  },
  {
    id: 'fact-2',
    numero: 'FACT-2026-002',
    commandeId: 'cmd-2',
    clientId: 'cli-2',
    dateEmission: '2026-06-02',
    montantTotal: 320000,
    soldeDu: 0,
    statut: 'paye',
    reglements: [
      { id: 'reg-2-1', date: '2026-06-02', montant: 160000, mode: 'carte', reference: 'CB-9921' },
      { id: 'reg-2-2', date: '2026-06-15', montant: 160000, mode: 'especes' }
    ]
  },
  {
    id: 'fact-3',
    numero: 'FACT-2026-003',
    commandeId: 'cmd-3',
    clientId: 'cli-3',
    dateEmission: '2026-06-20',
    montantTotal: 180000,
    soldeDu: 80000,
    statut: 'partiel',
    reglements: [
      { id: 'reg-3-1', date: '2026-06-20', montant: 100000, mode: 'mobile_money', reference: 'OM-455201' }
    ]
  }
];

const SEED_RENDEZVOUS: RendezVous[] = [
  {
    id: 'rdv-1',
    clientId: 'cli-1',
    commandeId: 'cmd-1',
    date: '2026-07-06', // Tomorrow!
    heure: '10:30',
    type: 'essayage',
    statut: 'planifie',
    notes: 'Premier essayage de la veste du costume.'
  },
  {
    id: 'rdv-2',
    clientId: 'cli-2',
    commandeId: 'cmd-2',
    date: '2026-07-08',
    heure: '15:00',
    type: 'livraison',
    statut: 'planifie',
    notes: 'Livraison de la robe de soirée rouge bordeaux.'
  },
  {
    id: 'rdv-3',
    clientId: 'cli-2',
    commandeId: 'cmd-2',
    date: '2026-06-01',
    heure: '14:00',
    type: 'mesure',
    statut: 'effectue',
    notes: 'Prise de mesures complètes.'
  }
];

const SEED_RETOUCHES: Retouche[] = [
  {
    id: 'ret-1',
    commandeId: 'cmd-2',
    clientId: 'cli-2',
    description: 'Bord inférieur de la robe trop long de 1.5 cm. Remonter d\'un pli.',
    dateDemande: '2026-06-20',
    statut: 'termine',
    dateCloture: '2026-06-22',
    notesTechniques: 'Retouche effectuée par Aminata.',
    delaiCible: '2026-06-25',
    coutEstime: 0
  },
  {
    id: 'ret-2',
    commandeId: 'cmd-1',
    clientId: 'cli-1',
    description: 'Ajuster les poignets de la chemise (retirer 1cm de circonférence).',
    dateDemande: '2026-07-04',
    statut: 'cours',
    notesTechniques: 'À faire lors du premier essayage.',
    delaiCible: '2026-07-10',
    coutEstime: 0
  }
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'stock',
    titre: 'Alerte Stock Bas',
    message: 'Le Tweed d\'Hiver Anglais - Gris Anthracite Chiné (3.5 m restants) a franchi le seuil d\'alerte de 5.0 m.',
    date: '2026-07-04T18:00:00Z',
    lue: false,
    linkTo: { tab: 'stocks' }
  },
  {
    id: 'notif-2',
    type: 'rendezvous',
    titre: 'Rendez-vous à venir',
    message: 'Essayage planifié avec Mamadou Diop demain à 10h30.',
    date: '2026-07-05T08:00:00Z',
    lue: false,
    linkTo: { tab: 'calendrier' }
  }
];

const SEED_TENANTS: Tenant[] = [
  {
    id: 'tenant-fox',
    raisonSociale: 'Maison FOX COUTURE',
    secteur: 'Haute Couture Africaine & Européenne',
    adresse: 'Fann Résidence, Boulevard de l\'Impératrice, Dakar, Sénégal',
    statut: 'actif',
    dateInscription: '2026-01-10',
    dateExpiration: '2026-12-31',
    formule: 'annuel',
    admin: { nom: 'Gérant Principal', email: 'gerant@foxcouture.sn', motDePasse: 'gerant123' },
    paiements: [
      { id: 'pay-fox-1', reference: 'REF-TX-2026-102', date: '2026-01-10', montant: 74000, moyen: 'mobile_money', statut: 'reussi', factureNumero: 'FC-SaaS-2026-001' }
    ]
  },
  {
    id: 'tenant-aminata',
    raisonSociale: 'Atelier Aminata',
    secteur: 'Robes de Mariée & Prêt-à-porter',
    adresse: 'Zone B, Rue des Baobabs, Dakar, Sénégal',
    statut: 'suspendu',
    dateInscription: '2026-05-15',
    dateExpiration: '2026-05-30',
    formule: 'essai',
    admin: { nom: 'Aminata Cissé', email: 'aminata@cisse.sn', motDePasse: 'aminata123' },
    paiements: []
  },
  {
    id: 'tenant-elegance',
    raisonSociale: 'Couture Élégance',
    secteur: 'Tailleur Homme',
    adresse: 'Cocody, Boulevard de la République, Abidjan, Côte d\'Ivoire',
    statut: 'essai',
    dateInscription: '2026-07-01',
    dateExpiration: '2026-07-16',
    formule: 'essai',
    admin: { nom: 'Amadou Koné', email: 'contact@elegance.ci', motDePasse: 'elegance123' },
    paiements: []
  }
];

const SEED_PROMO_CODES: PromoCode[] = [
  { code: 'BIENVENUE15', reduction: 0.15, actif: true, description: '15% de réduction de bienvenue pour les nouveaux ateliers' },
  { code: 'SAAS15', reduction: 0.15, actif: true, description: 'Code de parrainage de lancement (15% à vie)' },
  { code: 'VIP50', reduction: 0.50, actif: true, description: 'Remise exceptionnelle de 50% pour nos partenaires VIP' }
];

const DEFAULT_PRICING = {
  mensuel: 7000,
  annuel: 74000
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    raisonSociale: 'Fox Couture',
    slogan: 'Haute Couture par Foxfy Services',
    telephone: '+221 33 824 00 00',
    adresse: 'Av. Cheikh Anta Diop, Dakar',
    ninea: '004819472 M2',
    devise: 'FCFA',
    tauxTva: 0,
    conditionsFacture: 'Les vêtements non récupérés après 3 mois seront vendus aux enchères conformément au règlement.',
    etapesDefaut: ['Patronage & Coupe', 'Assemblage & Couture', 'Ajustements & Finitions', 'Repassage & Contrôle'],
    champsMesuresActifs: {
      poitrine: true,
      taille: true,
      hanches: true,
      longueur_pantalon: true,
      longueur_robe: true,
      manches: true,
      epaule: true,
      encolure: true,
      tour_bras: true,
      tour_cuisse: true,
    },
    templateSmsPret: 'Bonjour {client}, votre commande {reference} ({modele}) est prête chez {atelier}. À très bientôt !',
    templateSmsRdv: 'Rappel : Bonjour {client}, votre rendez-vous de type {type} est prévu le {date} à {heure} chez {atelier}.',
    acomptePourcentDefaut: 30,
    emailAtelier: 'contact@fox-couture.com',
    siteWebAtelier: 'www.fox-couture.com',
    moyenPaiementDefaut: 'espèces',
    templateSmsCommande: 'Bonjour {client}, nous confirmons la création de votre commande {reference} ({modele}) pour un montant de {montant} avec un acompte reçu de {acompte}. Merci pour votre confiance !',
    posFondDeCaisseDefaut: 50000,
    posImpressionAutoTicket: true,
    posModesPaiementActifs: {
      especes: true,
      mobile_money: true,
      virement: true,
      carte: true,
    },
    ticketEnTete: 'BIENVENUE CHEZ FOX COUTURE',
    ticketRemerciement: 'MERCI DE VOTRE CONFIANCE !',
    ticketBasPage: "Maison Fox Couture, l'élégance à l'état pur.",
    ticketAfficherNinea: true,
    ticketAfficherSlogan: true,
    ticketLargeur: '80mm',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [ficheMesures, setFicheMesures] = useState<FicheMesure[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [tissus, setTissus] = useState<Tissu[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [retouches, setRetouches] = useState<Retouche[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Point de Vente (POS) & Gestion de Caisse States
  const [sessionsCaisse, setSessionsCaisse] = useState<SessionCaisse[]>([]);
  const [ticketsCaisse, setTicketsCaisse] = useState<TicketCaisse[]>([]);
  const [sortiesCaisse, setSortiesCaisse] = useState<SortieCaisse[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // SaaS Tenant & Authentication States
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [currentTenantId, setCurrentTenantIdState] = useState<string>(() => {
    return localStorage.getItem('fox_couture_current_tenant_id') || 'tenant-fox';
  });
  const [userRole, setUserRoleState] = useState<'super_admin' | 'tenant_admin' | 'chef_atelier' | 'couturier'>(() => {
    return (localStorage.getItem('fox_couture_user_role') as any) || 'tenant_admin';
  });
  const [pricing, setPricing] = useState<{ mensuel: number; annuel: number }>(DEFAULT_PRICING);

  const setCurrentTenantId = (id: string) => {
    setCurrentTenantIdState(id);
    localStorage.setItem('fox_couture_current_tenant_id', id);
  };

  const setUserRole = (role: 'super_admin' | 'tenant_admin' | 'chef_atelier' | 'couturier') => {
    setUserRoleState(role);
    localStorage.setItem('fox_couture_user_role', role);
  };

  // 1. Load global SaaS configuration & tenants list on mount
  useEffect(() => {
    const storedTenants = localStorage.getItem('fox_couture_tenants');
    if (storedTenants) {
      setTenants(JSON.parse(storedTenants));
    } else {
      setTenants(SEED_TENANTS);
    }

    const storedPromoCodes = localStorage.getItem('fox_couture_promocodes');
    if (storedPromoCodes) {
      setPromoCodes(JSON.parse(storedPromoCodes));
    } else {
      setPromoCodes(SEED_PROMO_CODES);
    }

    const storedPricing = localStorage.getItem('fox_couture_pricing');
    if (storedPricing) {
      setPricing(JSON.parse(storedPricing));
    } else {
      setPricing(DEFAULT_PRICING);
    }
  }, []);

  // Save global tenants and pricing to localStorage whenever they change
  useEffect(() => {
    if (tenants.length > 0) {
      localStorage.setItem('fox_couture_tenants', JSON.stringify(tenants));
    }
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('fox_couture_promocodes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('fox_couture_pricing', JSON.stringify(pricing));
  }, [pricing]);

  // 2. Load isolated tenant data when currentTenantId changes
  useEffect(() => {
    if (!currentTenantId) return;
    setIsLoaded(false);

    try {
      const storedClients = localStorage.getItem(`fox_couture_${currentTenantId}_clients`);
      const storedMesures = localStorage.getItem(`fox_couture_${currentTenantId}_mesures`);
      const storedCommandes = localStorage.getItem(`fox_couture_${currentTenantId}_commandes`);
      const storedTissus = localStorage.getItem(`fox_couture_${currentTenantId}_tissus`);
      const storedFourn = localStorage.getItem(`fox_couture_${currentTenantId}_fournisseurs`);
      const storedEmp = localStorage.getItem(`fox_couture_${currentTenantId}_employes`);
      const storedRdv = localStorage.getItem(`fox_couture_${currentTenantId}_rendezvous`);
      const storedFact = localStorage.getItem(`fox_couture_${currentTenantId}_factures`);
      const storedRet = localStorage.getItem(`fox_couture_${currentTenantId}_retouches`);
      const storedNotif = localStorage.getItem(`fox_couture_${currentTenantId}_notifications`);
      const storedSettings = localStorage.getItem(`fox_couture_${currentTenantId}_settings`);
      const storedSessions = localStorage.getItem(`fox_couture_${currentTenantId}_sessions_caisse`);
      const storedTickets = localStorage.getItem(`fox_couture_${currentTenantId}_tickets_caisse`);
      const storedSorties = localStorage.getItem(`fox_couture_${currentTenantId}_sorties_caisse`);

      if (storedSettings !== null) {
        setSettings(JSON.parse(storedSettings));
      } else {
        const tenant = SEED_TENANTS.find(t => t.id === currentTenantId) || tenants.find(t => t.id === currentTenantId);
        setSettings({
          raisonSociale: tenant ? tenant.raisonSociale : 'Fox Couture',
          slogan: 'Haute Couture par Foxfy Services',
          telephone: '+221 33 824 00 00',
          adresse: tenant ? tenant.adresse : 'Av. Cheikh Anta Diop, Dakar',
          ninea: '004819472 M2',
          devise: 'FCFA',
          tauxTva: 0,
          conditionsFacture: 'Les vêtements non récupérés après 3 mois seront vendus aux enchères conformément au règlement.',
          etapesDefaut: ['Patronage & Coupe', 'Assemblage & Couture', 'Ajustements & Finitions', 'Repassage & Contrôle'],
          champsMesuresActifs: {
            poitrine: true,
            taille: true,
            hanches: true,
            longueur_pantalon: true,
            longueur_robe: true,
            manches: true,
            epaule: true,
            encolure: true,
            tour_bras: true,
            tour_cuisse: true,
          },
          templateSmsPret: 'Bonjour {client}, votre commande {reference} ({modele}) est prête chez {atelier}. À très bientôt !',
          templateSmsRdv: 'Rappel : Bonjour {client}, votre rendez-vous de type {type} est prévu le {date} à {heure} chez {atelier}.',
          acomptePourcentDefaut: 30,
          emailAtelier: 'contact@fox-couture.com',
          siteWebAtelier: 'www.fox-couture.com',
          moyenPaiementDefaut: 'espèces',
          templateSmsCommande: 'Bonjour {client}, nous confirmons la création de votre commande {reference} ({modele}) pour un montant de {montant} avec un acompte reçu de {acompte}. Merci pour votre confiance !',
          posFondDeCaisseDefaut: 50000,
          posImpressionAutoTicket: true,
          posModesPaiementActifs: {
            especes: true,
            mobile_money: true,
            virement: true,
            carte: true,
          },
          ticketEnTete: 'BIENVENUE CHEZ FOX COUTURE',
          ticketRemerciement: 'MERCI DE VOTRE CONFIANCE !',
          ticketBasPage: "Maison Fox Couture, l'élégance à l'état pur.",
          ticketAfficherNinea: true,
          ticketAfficherSlogan: true,
          ticketLargeur: '80mm',
        });
      }

      if (
        storedClients !== null && storedMesures !== null && storedCommandes !== null && 
        storedTissus !== null && storedFourn !== null && storedEmp !== null && 
        storedRdv !== null && storedFact !== null && storedRet !== null && storedNotif !== null
      ) {
        setClients(JSON.parse(storedClients));
        setFicheMesures(JSON.parse(storedMesures));
        setCommandes(JSON.parse(storedCommandes));
        setTissus(JSON.parse(storedTissus));
        setFournisseurs(JSON.parse(storedFourn));
        setEmployes(JSON.parse(storedEmp));
        setRendezVous(JSON.parse(storedRdv));
        setFactures(JSON.parse(storedFact));
        setRetouches(JSON.parse(storedRet));
        setNotifications(JSON.parse(storedNotif));
      } else {
        // If no data exists yet
        if (currentTenantId === 'tenant-fox') {
          // Maison FOX is pre-seeded
          setClients(SEED_CLIENTS);
          setFicheMesures(SEED_FICHE_MESURES);
          setCommandes(SEED_COMMANDES);
          setTissus(SEED_TISSUS);
          setFournisseurs(SEED_FOURNISSEURS);
          setEmployes(SEED_EMPLOYES);
          setRendezVous(SEED_RENDEZVOUS);
          setFactures(SEED_FACTURES);
          setRetouches(SEED_RETOUCHES);
          setNotifications(SEED_NOTIFICATIONS);
        } else {
          // Other tenants start clean with empty lists
          setClients([]);
          setFicheMesures([]);
          setCommandes([]);
          setTissus([]);
          setFournisseurs([]);
          setEmployes([]);
          setRendezVous([]);
          setFactures([]);
          setRetouches([]);
          setNotifications([]);
        }
      }

      // POS and cash management loading
      if (storedSessions !== null) {
        setSessionsCaisse(JSON.parse(storedSessions));
      } else {
        if (currentTenantId === 'tenant-fox') {
          setSessionsCaisse([
            {
              id: 'session-1',
              dateOuverture: '2026-07-08T08:00:00',
              dateCloture: '2026-07-08T19:00:00',
              fondInitial: 50000,
              montantTheorique: 125000,
              montantCompte: 125000,
              ecart: 0,
              statut: 'cloturee',
              responsableId: 'emp-1',
              recapModes: { especes: 80000, mobile_money: 40000, virement: 0, carte: 0 }
            },
            {
              id: 'session-2',
              dateOuverture: '2026-07-09T08:30:00',
              fondInitial: 60000,
              montantTheorique: 60000,
              statut: 'ouverte',
              responsableId: 'emp-1'
            }
          ]);
        } else {
          setSessionsCaisse([]);
        }
      }

      if (storedTickets !== null) {
        setTicketsCaisse(JSON.parse(storedTickets));
      } else {
        if (currentTenantId === 'tenant-fox') {
          setTicketsCaisse([
            {
              id: 'ticket-1',
              numero: 'TKT-20260708-001',
              sessionId: 'session-1',
              dateHeure: '2026-07-08T10:30:00',
              montant: 45000,
              modePaiement: 'especes',
              statut: 'valide',
              caissierId: 'emp-1',
              typeVente: 'commande_acompte',
              commandeId: 'cmd-1',
              factureId: 'fact-1'
            },
            {
              id: 'ticket-2',
              numero: 'TKT-20260708-002',
              sessionId: 'session-1',
              dateHeure: '2026-07-08T14:15:00',
              montant: 40000,
              modePaiement: 'mobile_money',
              statut: 'valide',
              caissierId: 'emp-1',
              typeVente: 'commande_solde',
              commandeId: 'cmd-2',
              factureId: 'fact-2'
            },
            {
              id: 'ticket-3',
              numero: 'TKT-20260708-003',
              sessionId: 'session-1',
              dateHeure: '2026-07-08T16:45:00',
              montant: 35000,
              modePaiement: 'especes',
              statut: 'valide',
              caissierId: 'emp-1',
              typeVente: 'vente_libre',
              descriptionLibre: 'Vente directe de boutons et chutes de tissus brodés de luxe'
            }
          ]);
        } else {
          setTicketsCaisse([]);
        }
      }

      if (storedSorties !== null) {
        setSortiesCaisse(JSON.parse(storedSorties));
      } else {
        if (currentTenantId === 'tenant-fox') {
          setSortiesCaisse([
            {
              id: 'sortie-1',
              sessionId: 'session-1',
              dateHeure: '2026-07-08T15:00:00',
              montant: 5000,
              motif: 'Achat urgent de fil noir et aiguilles de rechange',
              responsableId: 'emp-1'
            }
          ]);
        } else {
          setSortiesCaisse([]);
        }
      }
    } catch (e) {
      console.error('Error loading isolated tenant data:', e);
    }
    setIsLoaded(true);
  }, [currentTenantId]);

  // 3. Save isolated tenant data back to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded || !currentTenantId) return;
    localStorage.setItem(`fox_couture_${currentTenantId}_clients`, JSON.stringify(clients));
    localStorage.setItem(`fox_couture_${currentTenantId}_mesures`, JSON.stringify(ficheMesures));
    localStorage.setItem(`fox_couture_${currentTenantId}_commandes`, JSON.stringify(commandes));
    localStorage.setItem(`fox_couture_${currentTenantId}_tissus`, JSON.stringify(tissus));
    localStorage.setItem(`fox_couture_${currentTenantId}_fournisseurs`, JSON.stringify(fournisseurs));
    localStorage.setItem(`fox_couture_${currentTenantId}_employes`, JSON.stringify(employes));
    localStorage.setItem(`fox_couture_${currentTenantId}_rendezvous`, JSON.stringify(rendezVous));
    localStorage.setItem(`fox_couture_${currentTenantId}_factures`, JSON.stringify(factures));
    localStorage.setItem(`fox_couture_${currentTenantId}_retouches`, JSON.stringify(retouches));
    localStorage.setItem(`fox_couture_${currentTenantId}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`fox_couture_${currentTenantId}_settings`, JSON.stringify(settings));
    localStorage.setItem(`fox_couture_${currentTenantId}_sessions_caisse`, JSON.stringify(sessionsCaisse));
    localStorage.setItem(`fox_couture_${currentTenantId}_tickets_caisse`, JSON.stringify(ticketsCaisse));
    localStorage.setItem(`fox_couture_${currentTenantId}_sorties_caisse`, JSON.stringify(sortiesCaisse));
  }, [clients, ficheMesures, commandes, tissus, fournisseurs, employes, rendezVous, factures, retouches, notifications, settings, sessionsCaisse, ticketsCaisse, sortiesCaisse, isLoaded, currentTenantId]);

  const updateSettings = (updated: AppSettings) => {
    setSettings(updated);
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          raisonSociale: updated.raisonSociale,
          adresse: updated.adresse
        };
      }
      return t;
    }));
  };

  const sessionCaisseActive = sessionsCaisse.find(s => s.statut === 'ouverte') || null;

  const ouvrirSessionCaisse = (fondInitial: number, responsableId: string): SessionCaisse => {
    const active = sessionsCaisse.find(s => s.statut === 'ouverte');
    if (active) {
      return active;
    }
    const newSession: SessionCaisse = {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      dateOuverture: new Date().toISOString(),
      fondInitial,
      montantTheorique: fondInitial,
      statut: 'ouverte',
      responsableId
    };
    setSessionsCaisse(prev => [...prev, newSession]);
    return newSession;
  };

  const cloturerSessionCaisse = (montantCompte: number) => {
    const active = sessionsCaisse.find(s => s.statut === 'ouverte');
    if (!active) return;

    const sessionTickets = ticketsCaisse.filter(t => t.sessionId === active.id && t.statut === 'valide');
    const sessionOutflows = sortiesCaisse.filter(o => o.sessionId === active.id);

    const cashIncome = sessionTickets.reduce((acc, t) => {
      if (t.detailsMode && t.detailsMode.especes !== undefined) {
        return acc + t.detailsMode.especes;
      }
      return t.modePaiement === 'especes' ? acc + t.montant : acc;
    }, 0);

    const cashOutflow = sessionOutflows.reduce((acc, o) => acc + o.montant, 0);
    const calculatedTheorique = active.fondInitial + cashIncome - cashOutflow;

    const recapModes = {
      especes: cashIncome,
      mobile_money: sessionTickets.reduce((acc, t) => {
        if (t.detailsMode && t.detailsMode.mobile_money !== undefined) return acc + t.detailsMode.mobile_money;
        return t.modePaiement === 'mobile_money' ? acc + t.montant : acc;
      }, 0),
      virement: sessionTickets.reduce((acc, t) => {
        if (t.detailsMode && t.detailsMode.virement !== undefined) return acc + t.detailsMode.virement;
        return t.modePaiement === 'virement' ? acc + t.montant : acc;
      }, 0),
      carte: sessionTickets.reduce((acc, t) => {
        if (t.detailsMode && t.detailsMode.carte !== undefined) return acc + t.detailsMode.carte;
        return t.modePaiement === 'carte' ? acc + t.montant : acc;
      }, 0),
    };

    const ecart = montantCompte - calculatedTheorique;

    setSessionsCaisse(prev => prev.map(s => {
      if (s.id === active.id) {
        return {
          ...s,
          dateCloture: new Date().toISOString(),
          montantTheorique: calculatedTheorique,
          montantCompte,
          ecart,
          statut: 'cloturee',
          recapModes
        };
      }
      return s;
    }));
  };

  const addTicketCaisse = (ticket: Omit<TicketCaisse, 'id' | 'numero' | 'dateHeure' | 'statut' | 'sessionId'>): TicketCaisse => {
    const active = sessionsCaisse.find(s => s.statut === 'ouverte');
    if (!active) {
      throw new Error("Aucune session de caisse active. Veuillez d'abord ouvrir la caisse.");
    }

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayTickets = ticketsCaisse.filter(t => t.numero.includes(`TKT-${todayStr}`));
    const seq = String(todayTickets.length + 1).padStart(3, '0');
    const numero = `TKT-${todayStr}-${seq}`;

    const newTicket: TicketCaisse = {
      ...ticket,
      id: 'ticket-' + Math.random().toString(36).substr(2, 9),
      numero,
      sessionId: active.id,
      dateHeure: new Date().toISOString(),
      statut: 'valide'
    };

    setTicketsCaisse(prev => [...prev, newTicket]);

    if (ticket.factureId) {
      setFactures(prev => prev.map(fact => {
        if (fact.id === ticket.factureId) {
          const updatedSolde = Math.max(0, fact.soldeDu - ticket.montant);
          const updatedStatut: StatutPaiement = updatedSolde === 0 ? 'paye' : (updatedSolde === fact.montantTotal ? 'impaye' : 'partiel');
          
          const isExist = fact.reglements.some(r => r.reference === numero);
          const updatedReglements = isExist ? fact.reglements : [
            ...fact.reglements,
            {
              id: 'reg-' + Math.random().toString(36).substr(2, 9),
              date: new Date().toISOString().split('T')[0],
              montant: ticket.montant,
              mode: ticket.modePaiement,
              reference: numero
            }
          ];

          return {
            ...fact,
            soldeDu: updatedSolde,
            statut: updatedStatut,
            reglements: updatedReglements
          };
        }
        return fact;
      }));

      // Find the associated invoice to update its order
      const factObj = factures.find(f => f.id === ticket.factureId);
      if (factObj && factObj.commandeId) {
        setCommandes(prev => prev.map(cmd => {
          if (cmd.id === factObj.commandeId) {
            const updatedSolde = Math.max(0, cmd.soldeDu - ticket.montant);
            return {
              ...cmd,
              soldeDu: updatedSolde,
              acompteVerse: cmd.acompteVerse + (ticket.typeVente === 'commande_acompte' ? ticket.montant : 0),
            };
          }
          return cmd;
        }));
      }
    }

    setSessionsCaisse(prev => prev.map(s => {
      if (s.id === active.id) {
        const isCash = ticket.modePaiement === 'especes';
        let cashAdd = isCash ? ticket.montant : 0;
        if (ticket.detailsMode && ticket.detailsMode.especes !== undefined) {
          cashAdd = ticket.detailsMode.especes;
        }
        return {
          ...s,
          montantTheorique: s.montantTheorique + cashAdd
        };
      }
      return s;
    }));

    return newTicket;
  };

  const annulerTicketCaisse = (ticketId: string, motif: string) => {
    const ticket = ticketsCaisse.find(t => t.id === ticketId);
    if (!ticket) return;

    setTicketsCaisse(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          statut: 'annule',
          motifAnnulation: motif
        };
      }
      return t;
    }));

    if (ticket.factureId) {
      setFactures(prev => prev.map(fact => {
        if (fact.id === ticket.factureId) {
          const updatedSolde = Math.min(fact.montantTotal, fact.soldeDu + ticket.montant);
          const updatedStatut: StatutPaiement = updatedSolde === 0 ? 'paye' : (updatedSolde === fact.montantTotal ? 'impaye' : 'partiel');
          const updatedReglements = fact.reglements.filter(r => r.reference !== ticket.numero);
          return {
            ...fact,
            soldeDu: updatedSolde,
            statut: updatedStatut,
            reglements: updatedReglements
          };
        }
        return fact;
      }));

      const factObj = factures.find(f => f.id === ticket.factureId);
      if (factObj && factObj.commandeId) {
        setCommandes(prev => prev.map(cmd => {
          if (cmd.id === factObj.commandeId) {
            const updatedSolde = Math.min(cmd.prixTotal, cmd.soldeDu + ticket.montant);
            return {
              ...cmd,
              soldeDu: updatedSolde,
              acompteVerse: Math.max(0, cmd.acompteVerse - (ticket.typeVente === 'commande_acompte' ? ticket.montant : 0))
            };
          }
          return cmd;
        }));
      }
    }

    const active = sessionsCaisse.find(s => s.statut === 'ouverte');
    if (active && ticket.sessionId === active.id) {
      setSessionsCaisse(prev => prev.map(s => {
        if (s.id === active.id) {
          const isCash = ticket.modePaiement === 'especes';
          let cashSubtract = isCash ? ticket.montant : 0;
          if (ticket.detailsMode && ticket.detailsMode.especes !== undefined) {
            cashSubtract = ticket.detailsMode.especes;
          }
          return {
            ...s,
            montantTheorique: Math.max(s.fondInitial, s.montantTheorique - cashSubtract)
          };
        }
        return s;
      }));
    }
  };

  const addSortieCaisse = (sortie: Omit<SortieCaisse, 'id' | 'dateHeure' | 'sessionId'>): SortieCaisse => {
    const active = sessionsCaisse.find(s => s.statut === 'ouverte');
    if (!active) {
      throw new Error("Aucune session de caisse active. Saisir une dépense nécessite une caisse ouverte.");
    }

    const newSortie: SortieCaisse = {
      ...sortie,
      id: 'sortie-' + Math.random().toString(36).substr(2, 9),
      dateHeure: new Date().toISOString(),
      sessionId: active.id
    };

    setSortiesCaisse(prev => [...prev, newSortie]);

    setSessionsCaisse(prev => prev.map(s => {
      if (s.id === active.id) {
        return {
          ...s,
          montantTheorique: s.montantTheorique - sortie.montant
        };
      }
      return s;
    }));

    return newSortie;
  };

  // SaaS Tenant operations
  const registerTenant = (tenantData: Omit<Tenant, 'id' | 'dateInscription' | 'paiements'>) => {
    const id = 'tenant-' + Math.random().toString(36).substr(2, 9);
    const newTenant: Tenant = {
      ...tenantData,
      id,
      dateInscription: new Date().toISOString().split('T')[0],
      paiements: []
    };
    setTenants(prev => [...prev, newTenant]);
    return newTenant;
  };

  const updateTenant = (updated: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const addTenantPayment = (tenantId: string, paymentData: Omit<SaasPaiement, 'id' | 'date'>) => {
    const paymentId = 'pay-' + Math.random().toString(36).substr(2, 9);
    const newPayment: SaasPaiement = {
      ...paymentData,
      id: paymentId,
      date: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          paiements: [newPayment, ...t.paiements]
        };
      }
      return t;
    }));
  };

  const updatePricing = (newPricing: { mensuel: number; annuel: number }) => {
    setPricing(newPricing);
  };

  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [promo, ...prev]);
  };

  const deletePromoCode = (codeName: string) => {
    setPromoCodes(prev => prev.filter(c => c.code !== codeName));
  };

  const togglePromoCode = (codeName: string) => {
    setPromoCodes(prev => prev.map(c => c.code === codeName ? { ...c, actif: !c.actif } : c));
  };

  // Recalculate Employees Workloads whenever production steps change
  useEffect(() => {
    if (!isLoaded || commandes.length === 0) return;
    const taskCounts: { [empId: string]: number } = {};
    employes.forEach(e => { taskCounts[e.id] = 0; });

    commandes.forEach(cmd => {
      if (cmd.statut === 'production' || cmd.statut === 'attente') {
        cmd.etapesProduction.forEach(step => {
          if (step.statut === 'en_cours' && step.responsableId) {
            taskCounts[step.responsableId] = (taskCounts[step.responsableId] || 0) + 1;
          }
        });
      }
    });

    // Update workload
    let hasChanges = false;
    const updatedEmployes = employes.map(emp => {
      const activeCount = taskCounts[emp.id] || 0;
      if (emp.chargeTravail !== activeCount) {
        hasChanges = true;
        return { ...emp, chargeTravail: activeCount };
      }
      return emp;
    });

    if (hasChanges) {
      setEmployes(updatedEmployes);
    }
  }, [commandes, isLoaded]);

  // Create notifications automatically for low stocks
  const triggerStockAlertIfNeeded = (updatedTissus: Tissu[]) => {
    updatedTissus.forEach(tis => {
      if (tis.quantiteDisponible <= tis.seuilAlerte) {
        const alreadyExists = notifications.some(
          n => n.type === 'stock' && n.message.includes(tis.reference) && !n.lue
        );
        if (!alreadyExists) {
          const newNotif: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'stock',
            titre: 'Stock Bas Récurent',
            message: `Le tissu "${tis.designation}" (${tis.reference}) est à ${tis.quantiteDisponible}${tis.unite} (seuil : ${tis.seuilAlerte}${tis.unite}). Veuillez réapprovisionner auprès du fournisseur.`,
            date: new Date().toISOString(),
            lue: false,
            linkTo: { tab: 'stocks' }
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      }
    });
  };

  // CLIENTS CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'dateCreation' | 'avatarColor'>) => {
    const id = `cli-${Date.now()}`;
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newClient: Client = {
      ...clientData,
      id,
      avatarColor,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Remove client's measurements and cancel meetings / orders or keep them orphaned. Let's filter out measures
    setFicheMesures(prev => prev.filter(m => m.clientId !== id));
    setRendezVous(prev => prev.filter(r => r.clientId !== id));
  };

  // MEASUREMENTS CRUD
  const addFicheMesure = (mesureData: Omit<FicheMesure, 'id' | 'datePrise'>) => {
    const id = `mesure-${Date.now()}`;
    const newMesure: FicheMesure = {
      ...mesureData,
      id,
      datePrise: new Date().toISOString().split('T')[0]
    };
    setFicheMesures(prev => [newMesure, ...prev]);
    return newMesure;
  };

  const updateFicheMesure = (updatedMesure: FicheMesure) => {
    setFicheMesures(prev => prev.map(m => m.id === updatedMesure.id ? updatedMesure : m));
  };

  const deleteFicheMesure = (id: string) => {
    setFicheMesures(prev => prev.filter(m => m.id !== id));
  };

  // ORDERS CRUD
  const addCommande = (commandeData: Omit<Commande, 'id' | 'reference' | 'dateCommande' | 'soldeDu' | 'etapesProduction'>) => {
    const id = `cmd-${Date.now()}`;
    // Reference format CMD-2026-XXX
    const year = new Date().getFullYear();
    const count = commandes.length + 1;
    const reference = `CMD-${year}-${String(count).padStart(3, '0')}`;
    const soldeDu = Math.max(0, commandeData.montantTotal - commandeData.acompteVerse);
    
    // Create Default Production Steps based on Settings or Category
    const isHomme = commandeData.modeleCategorie === 'homme';
    const etapes: EtapeProduction[] = (settings.etapesDefaut && settings.etapesDefaut.length > 0)
      ? settings.etapesDefaut.map((libelle, idx) => ({
          id: `et-${id}-${idx + 1}`,
          libelle,
          statut: 'a_faire',
          responsableId: idx % 3 === 0 ? 'emp-1' : idx % 3 === 1 ? 'emp-2' : 'emp-3'
        }))
      : [
          { id: `et-${id}-1`, libelle: 'coupe', statut: 'a_faire', responsableId: 'emp-1' },
          { id: `et-${id}-2`, libelle: 'montage', statut: 'a_faire', responsableId: 'emp-3' },
          { id: `et-${id}-3`, libelle: 'essayage', statut: 'a_faire', responsableId: 'emp-1' },
          { id: `et-${id}-4`, libelle: 'finition', statut: 'a_faire', responsableId: isHomme ? 'emp-1' : 'emp-2' },
          { id: `et-${id}-5`, libelle: 'repassage', statut: 'a_faire', responsableId: 'emp-3' }
        ];

    const newCommande: Commande = {
      ...commandeData,
      id,
      reference,
      dateCommande: new Date().toISOString().split('T')[0],
      soldeDu,
      etapesProduction: etapes,
      factureId: `fact-${id}`
    };

    // La déduction automatique du stock de tissu/fournitures a été déportée lors de la validation de l'étape de "Coupe".


    // Automatically create a matching Facture
    const newFacture: Facture = {
      id: `fact-${id}`,
      numero: `FACT-${year}-${String(count).padStart(3, '0')}`,
      commandeId: id,
      clientId: commandeData.clientId,
      dateEmission: new Date().toISOString().split('T')[0],
      montantTotal: commandeData.montantTotal,
      soldeDu: soldeDu,
      statut: soldeDu === 0 ? 'paye' : commandeData.acompteVerse > 0 ? 'partiel' : 'impaye',
      reglements: commandeData.acompteVerse > 0 ? [
        {
          id: `reg-${id}-initial`,
          date: new Date().toISOString().split('T')[0],
          montant: commandeData.acompteVerse,
          mode: 'especes',
          reference: 'Acompte initial'
        }
      ] : []
    };

    setCommandes(prev => [newCommande, ...prev]);
    setFactures(prev => [newFacture, ...prev]);

    // Push Notification
    const client = clients.find(c => c.id === commandeData.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
    const newNotif: AppNotification = {
      id: `notif-new-${Date.now()}`,
      type: 'production',
      titre: 'Nouvelle commande créée',
      message: `La commande ${reference} (${commandeData.modeleNom}) pour ${clientName} a été enregistrée avec succès.`,
      date: new Date().toISOString(),
      lue: false,
      linkTo: { tab: 'commandes', id }
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newCommande;
  };

  const updateCommande = (updatedCommande: Commande) => {
    // Calculate new solde
    const soldeDu = Math.max(0, updatedCommande.montantTotal - updatedCommande.acompteVerse);
    const finalizedCommande = { ...updatedCommande, soldeDu };
    
    setCommandes(prev => prev.map(c => c.id === updatedCommande.id ? finalizedCommande : c));

    // Update matching invoice
    setFactures(prev => prev.map(f => {
      if (f.commandeId === updatedCommande.id) {
        // Adjust total and recalculate payments
        const totalPaid = f.reglements.reduce((sum, r) => sum + r.montant, 0);
        const newSolde = Math.max(0, updatedCommande.montantTotal - totalPaid);
        return {
          ...f,
          montantTotal: updatedCommande.montantTotal,
          soldeDu: newSolde,
          statut: newSolde === 0 ? 'paye' : totalPaid > 0 ? 'partiel' : 'impaye'
        };
      }
      return f;
    }));
  };

  const updateCommandeStatut = (id: string, statut: StatutCommande) => {
    setCommandes(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, statut };
        // Trigger notification to user on readiness
        if (statut === 'pret') {
          const client = clients.find(cl => cl.id === c.clientId);
          const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
          const newNotif: AppNotification = {
            id: `notif-ready-${Date.now()}`,
            type: 'production',
            titre: 'Vêtement Prêt !',
            message: `Le vêtement "${c.modeleNom}" (${c.reference}) de ${clientName} est prêt pour l'essayage final ou la livraison.`,
            date: new Date().toISOString(),
            lue: false,
            linkTo: { tab: 'commandes', id: c.id }
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
        return updated;
      }
      return c;
    }));
  };

  const updateEtapeProduction = (commandeId: string, etapeId: string, updates: Partial<EtapeProduction>) => {
    setCommandes(prev => prev.map(c => {
      if (c.id === commandeId) {
        let deductStockTriggered = false;
        const steps = c.etapesProduction.map(s => {
          if (s.id === etapeId) {
            const now = new Date().toISOString().split('T')[0];
            const dateDebut = updates.statut === 'en_cours' && s.statut === 'a_faire' ? now : s.dateDebut;
            const dateFin = updates.statut === 'termine' && s.statut !== 'termine' ? now : s.dateFin;
            if (s.libelle === 'coupe' && updates.statut === 'termine' && s.statut !== 'termine' && !c.stockDeduit) {
              deductStockTriggered = true;
            }
            return { ...s, ...updates, dateDebut, dateFin };
          }
          return s;
        });

        if (deductStockTriggered) {
          // Deduct stock of Fabric automatically if provided
          if (c.tissuId && c.metrageRequis > 0) {
            adjustTissuStock(c.tissuId, -c.metrageRequis);
          }

          // Deduct stock of other associated supplies
          if (c.fournituresAssociees && c.fournituresAssociees.length > 0) {
            c.fournituresAssociees.forEach(item => {
              if (item.tissuId && item.quantite > 0) {
                adjustTissuStock(item.tissuId, -item.quantite);
              }
            });
          }
        }

        // Determine overall order status based on steps
        // If all steps finished, mark ready automatically
        const allFinished = steps.every(s => s.statut === 'termine');
        let currentStatut = c.statut;
        if (allFinished && c.statut === 'production') {
          currentStatut = 'pret';
          
          const client = clients.find(cl => cl.id === c.clientId);
          const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
          const newNotif: AppNotification = {
            id: `notif-auto-ready-${Date.now()}`,
            type: 'production',
            titre: 'Production terminée',
            message: `Toutes les étapes de production pour ${c.reference} (${c.modeleNom}) de ${clientName} sont terminées. Vêtement prêt !`,
            date: new Date().toISOString(),
            lue: false,
            linkTo: { tab: 'commandes', id: c.id }
          };
          setNotifications(prev => [newNotif, ...prev]);
        } else if (steps.some(s => s.statut === 'en_cours') && c.statut === 'attente') {
          currentStatut = 'production';
        }

        return { 
          ...c, 
          etapesProduction: steps, 
          statut: currentStatut,
          stockDeduit: deductStockTriggered ? true : c.stockDeduit
        };
      }
      return c;
    }));
  };

  const deleteCommande = (id: string) => {
    setCommandes(prev => prev.filter(c => c.id !== id));
    setFactures(prev => prev.filter(f => f.commandeId !== id));
    setRendezVous(prev => prev.filter(r => r.commandeId !== id));
    setRetouches(prev => prev.filter(rt => rt.commandeId !== id));
  };

  // TISSUS STOCK CRUD
  const addTissu = (tissuData: Omit<Tissu, 'id'>) => {
    const id = `tissu-${Date.now()}`;
    const newTissu: Tissu = { ...tissuData, id };
    setTissus(prev => {
      const list = [newTissu, ...prev];
      triggerStockAlertIfNeeded(list);
      return list;
    });
    return newTissu;
  };

  const updateTissu = (updatedTissu: Tissu) => {
    setTissus(prev => {
      const list = prev.map(t => t.id === updatedTissu.id ? updatedTissu : t);
      triggerStockAlertIfNeeded(list);
      return list;
    });
  };

  const deleteTissu = (id: string) => {
    setTissus(prev => prev.filter(t => t.id !== id));
  };

  const adjustTissuStock = (id: string, change: number) => {
    setTissus(prev => {
      const list = prev.map(t => {
        if (t.id === id) {
          const quantiteDisponible = Math.max(0, Number((t.quantiteDisponible + change).toFixed(2)));
          return { ...t, quantiteDisponible };
        }
        return t;
      });
      triggerStockAlertIfNeeded(list);
      return list;
    });
  };

  // FOURNISSEURS CRUD
  const addFournisseur = (fournisseurData: Omit<Fournisseur, 'id'>) => {
    const id = `fourn-${Date.now()}`;
    const newFourn: Fournisseur = { ...fournisseurData, id };
    setFournisseurs(prev => [newFourn, ...prev]);
    return newFourn;
  };

  const updateFournisseur = (updatedFourn: Fournisseur) => {
    setFournisseurs(prev => prev.map(f => f.id === updatedFourn.id ? updatedFourn : f));
  };

  const deleteFournisseur = (id: string) => {
    setFournisseurs(prev => prev.filter(f => f.id !== id));
  };

  // EMPLOYEES CRUD
  const addEmploye = (employeData: Omit<Employe, 'id' | 'chargeTravail' | 'avatarColor'>) => {
    const id = `emp-${Date.now()}`;
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newEmp: Employe = {
      ...employeData,
      id,
      chargeTravail: 0,
      avatarColor
    };
    setEmployes(prev => [newEmp, ...prev]);
    return newEmp;
  };

  const updateEmploye = (updatedEmp: Employe) => {
    setEmployes(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
  };

  const deleteEmploye = (id: string) => {
    setEmployes(prev => prev.filter(e => e.id !== id));
  };

  // APPOINTMENTS CRUD
  const addRendezVous = (rdvData: Omit<RendezVous, 'id' | 'statut'>) => {
    const id = `rdv-${Date.now()}`;
    const newRdv: RendezVous = {
      ...rdvData,
      id,
      statut: 'planifie'
    };
    setRendezVous(prev => {
      // Sort chronologically
      const list = [...prev, newRdv].sort((a, b) => 
        new Date(`${a.date}T${a.heure}`).getTime() - new Date(`${b.date}T${b.heure}`).getTime()
      );
      return list;
    });
    return newRdv;
  };

  const updateRendezVous = (updatedRdv: RendezVous) => {
    setRendezVous(prev => prev.map(r => r.id === updatedRdv.id ? updatedRdv : r).sort((a, b) => 
      new Date(`${a.date}T${a.heure}`).getTime() - new Date(`${b.date}T${b.heure}`).getTime()
    ));
  };

  const deleteRendezVous = (id: string) => {
    setRendezVous(prev => prev.filter(r => r.id !== id));
  };

  // BILLING & PAYMENTS
  const addReglement = (factureId: string, regData: Omit<Reglement, 'id' | 'date'>) => {
    const id = `reg-${Date.now()}`;
    const newReg: Reglement = {
      ...regData,
      id,
      date: new Date().toISOString().split('T')[0]
    };

    setFactures(prev => prev.map(f => {
      if (f.id === factureId) {
        const reglements = [...f.reglements, newReg];
        const paid = reglements.reduce((sum, r) => sum + r.montant, 0);
        const soldeDu = Math.max(0, f.montantTotal - paid);
        const statut = soldeDu === 0 ? 'paye' : paid > 0 ? 'partiel' : 'impaye';

        // Also update matching Commande's details
        setCommandes(orders => orders.map(c => {
          if (c.id === f.commandeId) {
            return {
              ...c,
              acompteVerse: paid,
              soldeDu: soldeDu
            };
          }
          return c;
        }));

        return {
          ...f,
          reglements,
          soldeDu,
          statut
        };
      }
      return f;
    }));

    // Trigger Success Notification
    const fact = factures.find(f => f.id === factureId);
    if (fact) {
      const client = clients.find(c => c.id === fact.clientId);
      const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
      const formattedMontant = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(regData.montant);
      
      const newNotif: AppNotification = {
        id: `notif-pay-${Date.now()}`,
        type: 'production',
        titre: 'Paiement Enregistré',
        message: `Règlement de ${formattedMontant} reçu de la part de ${clientName} pour la facture ${fact.numero}.`,
        date: new Date().toISOString(),
        lue: false,
        linkTo: { tab: 'comptabilite' }
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const addFacture = (
    factureData: Omit<Facture, 'id' | 'numero' | 'dateEmission' | 'soldeDu' | 'reglements' | 'statut'>,
    acompte?: number,
    modeAcompte?: ModePaiement,
    refAcompte?: string
  ) => {
    const id = `fact-direct-${Date.now()}`;
    const year = new Date().getFullYear();
    const count = factures.length + 1;
    const numero = `FACT-${year}-${String(count).padStart(3, '0')}`;
    const dateEmission = new Date().toISOString().split('T')[0];
    
    const acompteVal = acompte || 0;
    const soldeDu = Math.max(0, factureData.montantTotal - acompteVal);
    
    const reglements: Reglement[] = [];
    if (acompteVal > 0) {
      reglements.push({
        id: `reg-direct-${id}-initial`,
        date: dateEmission,
        montant: acompteVal,
        mode: modeAcompte || 'especes',
        reference: refAcompte || 'Acompte initial'
      });
    }

    const statut: StatutPaiement = soldeDu === 0 ? 'paye' : acompteVal > 0 ? 'partiel' : 'impaye';

    const newFacture: Facture = {
      ...factureData,
      id,
      numero,
      dateEmission,
      soldeDu,
      statut,
      reglements
    };

    setFactures(prev => [newFacture, ...prev]);

    // Push Notification
    const client = clients.find(c => c.id === factureData.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
    const newNotif: AppNotification = {
      id: `notif-fact-new-${Date.now()}`,
      type: 'production',
      titre: 'Nouvelle Facture Directe',
      message: `La facture ${numero} de ${new Intl.NumberFormat('fr-FR').format(factureData.montantTotal)} FCFA pour ${clientName} a été émise.`,
      date: new Date().toISOString(),
      lue: false,
      linkTo: { tab: 'comptabilite' }
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newFacture;
  };

  // ALTERATIONS / SAV CRUD
  const addRetouche = (retData: Omit<Retouche, 'id' | 'dateDemande' | 'statut'>) => {
    const id = `ret-${Date.now()}`;
    const newRet: Retouche = {
      ...retData,
      id,
      dateDemande: new Date().toISOString().split('T')[0],
      statut: 'recu'
    };
    setRetouches(prev => [newRet, ...prev]);

    // Notification
    const client = clients.find(c => c.id === retData.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : 'Client';
    const newNotif: AppNotification = {
      id: `notif-ret-${Date.now()}`,
      type: 'retard', // category for urgency / SAV
      titre: 'Nouvelle Demande Retouche',
      message: `Une retouche a été enregistrée pour ${clientName} : "${retData.description.substring(0, 50)}..."`,
      date: new Date().toISOString(),
      lue: false,
      linkTo: { tab: 'retouches' }
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newRet;
  };

  const updateRetouche = (updatedRetouche: Retouche) => {
    setRetouches(prev => prev.map(rt => {
      if (rt.id === updatedRetouche.id) {
        const isFinished = updatedRetouche.statut === 'termine';
        const dateCloture = isFinished ? new Date().toISOString().split('T')[0] : updatedRetouche.dateCloture;
        return { ...updatedRetouche, dateCloture };
      }
      return rt;
    }));
  };

  const deleteRetouche = (id: string) => {
    setRetouches(prev => prev.filter(rt => rt.id !== id));
  };

  // NOTIFICATIONS Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatPrice = (val: number) => {
    const symbol = settings?.devise || 'FCFA';
    if (symbol === 'FCFA') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val).replace('XOF', 'FCFA');
    }
    if (symbol === 'EUR') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    }
    if (symbol === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val)} ${symbol}`;
  };

  // BACKUPS, JSON EXPORTS, RESET
  const exportDatabase = () => {
    const fullDB = {
      clients,
      ficheMesures,
      commandes,
      tissus,
      fournisseurs,
      employes,
      rendezVous,
      factures,
      retouches,
      notifications,
      exportDate: new Date().toISOString(),
      appName: 'FOX COUTURE'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDB, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FOX_COUTURE_Sauvegarde_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabase = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.appName !== 'FOX COUTURE' && !parsed.clients) {
        return false;
      }
      
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.ficheMesures) setFicheMesures(parsed.ficheMesures);
      if (parsed.commandes) setCommandes(parsed.commandes);
      if (parsed.tissus) setTissus(parsed.tissus);
      if (parsed.fournisseurs) setFournisseurs(parsed.fournisseurs);
      if (parsed.employes) setEmployes(parsed.employes);
      if (parsed.rendezVous) setRendezVous(parsed.rendezVous);
      if (parsed.factures) setFactures(parsed.factures);
      if (parsed.retouches) setRetouches(parsed.retouches);
      if (parsed.notifications) setNotifications(parsed.notifications);
      
      return true;
    } catch (e) {
      console.error('Failed to import database', e);
      return false;
    }
  };

  const resetDatabase = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser Fox Couture ? Toutes vos modifications locales seront écrasées par les données de démonstration.')) {
      if (currentTenantId === 'tenant-fox') {
        setClients(SEED_CLIENTS);
        setFicheMesures(SEED_FICHE_MESURES);
        setCommandes(SEED_COMMANDES);
        setTissus(SEED_TISSUS);
        setFournisseurs(SEED_FOURNISSEURS);
        setEmployes(SEED_EMPLOYES);
        setRendezVous(SEED_RENDEZVOUS);
        setFactures(SEED_FACTURES);
        setRetouches(SEED_RETOUCHES);
        setNotifications(SEED_NOTIFICATIONS);
      } else {
        setClients([]);
        setFicheMesures([]);
        setCommandes([]);
        setTissus([]);
        setFournisseurs([]);
        setEmployes([]);
        setRendezVous([]);
        setFactures([]);
        setRetouches([]);
        setNotifications([]);
      }
      
      localStorage.removeItem('fox_couture_tenants');
      localStorage.removeItem('fox_couture_pricing');
      setTenants(SEED_TENANTS);
      setPricing(DEFAULT_PRICING);
    }
  };

  return (
    <StoreContext.Provider value={{
      settings,
      updateSettings,
      formatPrice,
      clients,
      ficheMesures,
      commandes,
      tissus,
      fournisseurs,
      employes,
      rendezVous,
      factures,
      retouches,
      notifications,
      
      // POS and Cash Management
      sessionsCaisse,
      ticketsCaisse,
      sortiesCaisse,
      sessionCaisseActive,
      ouvrirSessionCaisse,
      cloturerSessionCaisse,
      addTicketCaisse,
      annulerTicketCaisse,
      addSortieCaisse,
      
      addClient,
      updateClient,
      deleteClient,
      
      addFicheMesure,
      updateFicheMesure,
      deleteFicheMesure,
      
      addCommande,
      updateCommande,
      updateCommandeStatut,
      updateEtapeProduction,
      deleteCommande,
      
      addTissu,
      updateTissu,
      deleteTissu,
      adjustTissuStock,
      
      addFournisseur,
      updateFournisseur,
      deleteFournisseur,
      
      addEmploye,
      updateEmploye,
      deleteEmploye,
      
      addRendezVous,
      updateRendezVous,
      deleteRendezVous,
      
      addReglement,
      addFacture,
      
      addRetouche,
      updateRetouche,
      deleteRetouche,
      
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,
      
      exportDatabase,
      importDatabase,
      resetDatabase,

      // SaaS exports
      tenants,
      currentTenantId,
      userRole,
      pricing,
      setTenants,
      setCurrentTenantId,
      setUserRole,
      updatePricing,
      registerTenant,
      updateTenant,
      addTenantPayment,
      
      // Promo code exports
      promoCodes,
      addPromoCode,
      deletePromoCode,
      togglePromoCode
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
