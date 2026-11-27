# Foxe'Couture ✂️👗

> **Application de Gestion Professionnelle pour Atelier de Couture, Tailleur & Styliste — Afrique (Sénégal & Sous-Région)**  
> Conçue par **SenServices Technology (SST) / Tech Fox**

[![Stack](https://img.shields.io/badge/Stack-React_19_+_Vite_+_Tailwind_CSS-orange.svg)](#)
[![Backend](https://img.shields.io/badge/Backend-Supabase_(PostgreSQL_+_RLS_+_Auth)-emerald.svg)](#)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-blue.svg)](#)
[![Hébergement](https://img.shields.io/badge/Deploy-Vercel-black.svg)](#)

---

## 📖 Contexte & Vision

Foxe'Couture digitalise l'ensemble des opérations d'un atelier de confection et haute couture :
- **Remplacement des carnets papier** : zéro fiche client ou mensuration égarée.
- **Modèles de mesures anatomiques africains** : gabarits prêts à l'emploi (Grand Boubou 3 pièces, Kaftan, Taille Basse, Robe Marinière, Ndokette, Costumes).
- **Sécurisation de la trésorerie** : gestion des acomptes, soldes restants, relances impayés et caisse journalière (Espèces, Wave, Orange Money).
- **Communication WhatsApp-first (`wa.me`)** : envoi en 1 clic de reçus de commande, invitations aux essayages et avis de mise à disposition.
- **Suivi de production en atelier** : tableau Kanban en 4 étapes clés (*Coupe*, *Assemblage/Couture*, *Essayage Client*, *Prêt pour Retrait*).
- **Fonctionnement Hors-Ligne (PWA)** : continuez à enregistrer vos clients et commandes même sans connexion internet, synchronisation automatique dès le retour du réseau.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend & Base de données** : Supabase (PostgreSQL 15+, Row Level Security, Auth, Storage).
- **PWA** : Service Worker & Manifeste installable sur smartphone (Android / iOS) et ordinateur.
- **Hébergement cible** : Vercel.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- Compte [Supabase](https://supabase.com) (optionnel pour le mode démo local)

### Installation

1. **Cloner le projet :**
   ```bash
   git clone https://github.com/khaysarr93-source/FoxCouture.git
   cd FoxCouture
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement (Supabase) :**
   Copiez `.env.example` en `.env.local` et renseignez vos clés de projet Supabase :
   ```env
   VITE_SUPABASE_URL="https://votre-projet.supabase.co"
   VITE_SUPABASE_ANON_KEY="votre-cle-anon-publique"
   ```
   *(Si ces clés ne sont pas renseignées, l'application fonctionne automatiquement en mode Démo Local sans blocage).*

4. **Initialiser la base de données Supabase :**
   Copiez et exécutez le script SQL complet disponible dans :
   [`supabase/schema.sql`](supabase/schema.sql) directement dans l'éditeur SQL de votre tableau de bord Supabase.

5. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

6. **Compiler pour la production :**
   ```bash
   npm run build
   ```

---

## 📂 Structure du Projet

```text
├── public/                 # Manifeste PWA, Service Worker, Icônes
├── src/
│   ├── components/         # Modules fonctionnels de l'atelier
│   │   ├── AtelierSection.tsx      # Suivi de confection Kanban (4 étapes)
│   │   ├── ClientSection.tsx       # Fiches clients & mensurations avec partage WhatsApp
│   │   ├── OrderSection.tsx        # Commandes, reçus, rappels et devis
│   │   ├── PosCaisseSection.tsx    # Caisse journalière & encaissements POS
│   │   ├── StockSection.tsx        # Gestion des tissus et mercerie
│   │   ├── CalendarSection.tsx     # Planning des livraisons et rendez-vous
│   │   ├── NetworkStatusBadge.tsx  # Indicateur réseau et état de synchronisation
│   │   └── mobile/                 # Vues optimisées pour smartphone
│   ├── lib/
│   │   ├── supabase.ts     # Client Supabase avec détection démo/cloud
│   │   └── whatsapp.ts     # Générateur de liens wa.me et messages types
│   ├── store.tsx           # Gestion d'état et persistance locale/offline
│   ├── types.ts            # Définitions TypeScript (CDC complet)
│   └── App.tsx             # Point d'entrée principal de l'application
└── supabase/
    └── schema.sql          # Schéma PostgreSQL complet avec RLS & Seed
```

---

## 📞 Support & Contact

Développé pour **Foxe'Couture**  
Par **SenServices Technology (SST)**  
- Email : `contact@senservicestechnology.online`  
- Téléphone : `+221 77 595 04 46` / `+221 78 490 46 98`  
- Porteur du projet : **Khaly Sarr**
