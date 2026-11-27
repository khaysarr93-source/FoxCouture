import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  CreditCard, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  FileText, 
  ArrowRight, 
  ShieldAlert,
  Wallet,
  Building,
  RefreshCw,
  TrendingDown,
  ChevronDown,
  Download
} from 'lucide-react';
import { Tenant, SaasPaiement, MoyenPaiementSaaS } from '../types';

export default function SubscriptionSection() {
  const { 
    tenants, 
    currentTenantId, 
    addTenantPayment, 
    updateTenant, 
    pricing,
    promoCodes
  } = useStore();

  const activeTenant = tenants.find(t => t.id === currentTenantId);

  // Form & modal states
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'essentiel' | 'pro'>('pro');
  const [paymentMoyen, setPaymentMoyen] = useState<MoyenPaiementSaaS>('mobile_money');
  const [paymentPeriod, setPaymentPeriod] = useState<'mensuel' | 'annuel'>('mensuel');
  
  const TIER_PRICES = {
    essentiel: { mensuel: 4000, annuel: 40000, nom: 'Essentiel (Tailleur Indépendant)' },
    pro: { mensuel: 10000, annuel: 100000, nom: 'Pro (Atelier & Confection)' }
  };

  // Dummy payment details
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedRef, setGeneratedRef] = useState('');

  // Promo code feature
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0); // e.g. 0.15 for 15%
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  // Local state or flag for trial extension
  const [hasRequestedExtension, setHasRequestedExtension] = useState(() => {
    return localStorage.getItem(`fox_extended_trial_${activeTenant?.id}`) === 'true';
  });

  if (!activeTenant) {
    return (
      <div className="bg-white rounded-none p-8 border-2 border-black text-center max-w-lg mx-auto">
        <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-black uppercase">Société Non Reconnue</h3>
        <p className="text-xs text-slate-500 mt-2 font-serif">Veuillez vous connecter à un espace de travail valide.</p>
      </div>
    );
  }

  // Calculate remaining days
  const today = new Date();
  const expDate = new Date(activeTenant.dateExpiration);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isExpired = diffDays <= 0 && activeTenant.statut !== 'actif';

  // Calculate price with promo code discount
  const getPlanPrice = () => {
    const tierConfig = TIER_PRICES[selectedTier];
    const base = paymentPeriod === 'mensuel' ? tierConfig.mensuel : tierConfig.annuel;
    if (promoDiscount > 0) {
      return Math.round(base * (1 - promoDiscount));
    }
    return base;
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const matched = promoCodes.find(c => c.code === code && c.actif);
    if (matched) {
      setPromoDiscount(matched.reduction);
      setAppliedPromo(matched.code);
      setPromoInput('');
    } else {
      setPromoError('Code promotionnel invalide, expiré ou inactif.');
    }
  };

  const handleExtendTrial = () => {
    if (hasRequestedExtension) {
      alert("Votre atelier a déjà bénéficié d'une prolongation d'essai exceptionnelle.");
      return;
    }

    if (window.confirm("Demander une prolongation d'essai gratuite de +7 jours pour votre atelier ?")) {
      const currentExp = new Date(activeTenant.dateExpiration);
      // If expired, extend from today, otherwise add to current expiration
      const baseDate = currentExp < today ? today : currentExp;
      const extendedExp = new Date(baseDate);
      extendedExp.setDate(extendedExp.getDate() + 7);

      const updatedTenant: Tenant = {
        ...activeTenant,
        dateExpiration: extendedExp.toISOString().split('T')[0],
        statut: 'essai' // Make sure they are in trial, not suspended
      };

      updateTenant(updatedTenant);
      setHasRequestedExtension(true);
      localStorage.setItem(`fox_extended_trial_${activeTenant.id}`, 'true');
      alert(`Prolongation approuvée ! Votre période d'essai a été prolongée jusqu'au ${updatedTenant.dateExpiration}.`);
    }
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      const txRef = 'TX-SaaS-' + Math.floor(100000 + Math.random() * 900000);
      const amount = getPlanPrice();
      const invoiceNo = 'INV-SaaS-' + Math.floor(100 + Math.random() * 900);

      // Extend expiration date
      const newExp = new Date();
      if (paymentPeriod === 'mensuel') {
        newExp.setMonth(newExp.getMonth() + 1);
      } else {
        newExp.setFullYear(newExp.getFullYear() + 1);
      }

      const updatedTenant: Tenant = {
        ...activeTenant,
        statut: 'actif',
        formule: paymentPeriod,
        dateExpiration: newExp.toISOString().split('T')[0],
      };

      // Add payment to tenant logs
      addTenantPayment(activeTenant.id, {
        reference: txRef,
        montant: amount,
        moyen: paymentMoyen,
        statut: 'reussi',
        factureNumero: invoiceNo
      });

      // Update local tenant store
      updateTenant(updatedTenant);

      setGeneratedRef(txRef);
      setIsProcessing(false);
      setPaymentSuccess(true);
      // Reset promo
      setPromoDiscount(0);
      setAppliedPromo('');
    }, 2000);
  };

  const handleChangeFormuleDirect = (formule: 'mensuel' | 'annuel') => {
    const updatedTenant: Tenant = {
      ...activeTenant,
      formule
    };
    updateTenant(updatedTenant);
    alert(`Votre formule préférée a été mise à jour vers : ${formule === 'annuel' ? 'Annuelle' : 'Mensuelle'}.`);
  };

  const handleResilier = () => {
    if (window.confirm('Êtes-vous sûr de vouloir résilier votre abonnement Fox Couture ? Vos données resteront archivées en lecture seule pendant 30 jours.')) {
      const updatedTenant: Tenant = {
        ...activeTenant,
        statut: 'resilie'
      };
      updateTenant(updatedTenant);
      alert('Votre abonnement a été résilié avec succès. Votre espace est passé en statut résilié.');
    }
  };

  const handleDownloadReceipt = (pay: SaasPaiement) => {
    const receiptContent = `
========================================
           REÇU DE PAIEMENT - SaaS
                 FOX COUTURE
========================================
Date : ${pay.date}
Référence TX : ${pay.reference}
No Facture   : ${pay.factureNumero}
Société      : ${activeTenant.raisonSociale}
Secteur      : ${activeTenant.secteur}
----------------------------------------
Formule      : ${activeTenant.formule === 'annuel' ? 'Annuelle' : 'Mensuelle'}
Montant      : ${pay.montant} FCFA
Moyen        : ${pay.moyen.toUpperCase()}
Statut       : RÉUSSI (PAYÉ)
========================================
Merci pour votre confiance en FOX COUTURE.
L'Atelier Haute Couture sur Nuage.
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RECU_${pay.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Visual Identity Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abonnement de l'Atelier</span>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2 mt-1 font-display">
            <Building className="h-6 w-6 text-atelier-gold-dark" /> {activeTenant.raisonSociale}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-serif italic">{activeTenant.secteur} — {activeTenant.adresse}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTenant.statut === 'actif' && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> ABONNEMENT ACTIF
            </span>
          )}
          {activeTenant.statut === 'essai' && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ESSAI GRATUIT : {diffDays} JOURS RESTANTS
            </span>
          )}
          {activeTenant.statut === 'suspendu' && (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 animate-bounce" /> ACCÈS RESTREINT (SUSPENDU)
            </span>
          )}
          {activeTenant.statut === 'resilie' && (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" /> ABONNEMENT RÉSILIÉ
            </span>
          )}
        </div>
      </div>

      {/* Subscription Warnings / Suspended Screens */}
      {isExpired && (
        <div className="bg-rose-50 p-6 border-2 border-rose-600 space-y-4 animate-pulse">
          <div className="flex gap-3">
            <AlertTriangle className="h-8 w-8 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="font-black text-rose-950 uppercase text-xs tracking-wider">Période d'essai expirée ou paiement manquant !</h4>
              <p className="text-xs text-rose-800 font-serif mt-1">
                L'accès complet de votre atelier <strong>{activeTenant.raisonSociale}</strong> a été restreint. Afin de continuer à enregistrer vos clients, modifier les fiches de mesures, ou planifier les essayages, veuillez souscrire à une formule payante ci-dessous.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPaymentPeriod('mensuel');
              setIsPayModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-black transition cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            S'ABONNER MAINTENANT (À PARTIR DE 7000 FCFA)
          </button>
        </div>
      )}

      {/* Grid of pricing options & statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Subscription state card */}
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 lg:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 border-b border-black pb-2">Formule de Facturation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Current details */}
            <div className="space-y-3 bg-slate-50 p-4 border border-slate-300">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">DÉTAILS ACTUELS</span>
              
              <div className="space-y-1">
                <span className="text-xs text-slate-600 block">Formule active :</span>
                <span className="text-sm font-black uppercase text-slate-900 block font-mono">
                  {activeTenant.formule === 'essai' ? 'Essai gratuit 15 jours' : activeTenant.formule === 'annuel' ? 'Abonnement Annuel' : 'Abonnement Mensuel'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-600 block">Prochaine échéance :</span>
                <span className="text-sm font-black text-slate-900 block font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-600" /> {activeTenant.dateExpiration}
                  {diffDays > 0 && (
                    <span className="text-[9px] font-bold text-slate-500 italic">({diffDays} jours)</span>
                  )}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-600 block">Date d'inscription :</span>
                <span className="text-xs text-slate-700 block font-mono">{activeTenant.dateInscription}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col justify-between p-4 border-2 border-dashed border-black">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">ACTIONS RAPIDES</span>
              
              <div className="space-y-2 mt-4 md:mt-0">
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="w-full px-4 py-2.5 bg-black text-white hover:bg-atelier-gold hover:text-black border-2 border-black font-black uppercase text-[10px] tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Wallet className="h-4 w-4" /> RECHARGER / PAYER
                </button>

                {activeTenant.statut === 'essai' && (
                  <button
                    onClick={handleExtendTrial}
                    disabled={hasRequestedExtension}
                    className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black border-2 border-black font-black uppercase text-[9px] tracking-widest transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {hasRequestedExtension ? 'EXTENSION UTILISÉE' : "EXTENDEZ L'ESSAI (+7J)"}
                  </button>
                )}

                {activeTenant.formule === 'mensuel' && (
                  <button
                    onClick={() => handleChangeFormuleDirect('annuel')}
                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-400 font-bold uppercase text-[9px] tracking-widest transition cursor-pointer"
                  >
                    Passer à l'Annuel (Économisez 10 000 FCFA)
                  </button>
                )}

                {activeTenant.formule === 'annuel' && (
                  <button
                    onClick={() => handleChangeFormuleDirect('mensuel')}
                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-400 font-bold uppercase text-[9px] tracking-widest transition cursor-pointer"
                  >
                    Repasser au Mensuel
                  </button>
                )}

                <button
                  onClick={handleResilier}
                  className="w-full text-center text-rose-600 hover:text-rose-800 font-black uppercase text-[9px] tracking-widest cursor-pointer underline hover:no-underline pt-2"
                >
                  Résilier l'Abonnement
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Pricing Guide Panel */}
        <div className="bg-slate-900 text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Sparkles className="h-5 w-5 text-atelier-gold" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Formules Atelier (CDC)</h3>
            </div>
            
            <div className="space-y-3">
              {/* Essentiel */}
              <div 
                onClick={() => {
                  setSelectedTier('essentiel');
                  setIsPayModalOpen(true);
                }}
                className={`p-3 border-2 cursor-pointer transition ${selectedTier === 'essentiel' ? 'border-atelier-gold bg-zinc-950' : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Essentiel</span>
                  <span className="font-mono text-sm font-black text-white">4 000 FCFA <span className="text-[10px] font-normal text-zinc-400">/mois</span></span>
                </div>
                <p className="text-[10px] text-zinc-400 font-serif italic mt-1">Tailleur indépendant, clients illimités & WhatsApp standard.</p>
              </div>

              {/* Pro */}
              <div 
                onClick={() => {
                  setSelectedTier('pro');
                  setIsPayModalOpen(true);
                }}
                className="p-3 bg-atelier-gold text-slate-950 border-2 border-black rounded-none relative overflow-hidden cursor-pointer hover:bg-yellow-400 transition"
              >
                <div className="absolute top-0 right-0 bg-red-600 text-white font-black uppercase text-[8px] px-2 py-0.5 tracking-wider shadow-sm">
                  RECOMMANDÉ
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">Pro Atelier</span>
                  <span className="font-mono text-sm font-black text-slate-950">10 000 FCFA <span className="text-[10px] font-normal text-slate-800">/mois</span></span>
                </div>
                <p className="text-[10px] text-slate-900 font-serif font-bold mt-1 flex items-center gap-1">
                  Multi-utilisateurs (Chef, Couturier, Coupeur, Vendeur), Caisse & Trésorerie Wave/OM, Alertes stock.
                </p>
              </div>

              {/* Entreprise */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Entreprise</span>
                  <span className="font-mono text-xs font-black text-atelier-gold">Sur Devis</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-serif italic mt-1">Réseau multi-boutiques & support WhatsApp dédié 7j/7.</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 pt-4 font-serif leading-relaxed">
            Note: Paiement instantané via Wave, Orange Money ou virement. Aucune carte bancaire obligatoire.
          </div>
        </div>

      </div>

      {/* Grille Comparatif Détaillé CDC Section 9 */}
      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cahier des Charges — Section 9</span>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mt-0.5">Grille Tarifaire Complète & Services Inclus</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* 1. Découverte */}
          <div className="border-2 border-slate-300 p-4 flex flex-col justify-between bg-slate-50">
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5">DÉCOUVERTE</span>
              <h4 className="text-base font-black text-slate-900">0 FCFA</h4>
              <p className="text-[11px] text-slate-600 font-serif">Pour tester l'application et démarrer en douceur.</p>
              <ul className="text-xs space-y-1.5 text-slate-700 pt-2 border-t border-slate-200">
                <li>✓ Jusqu'à 15 clients</li>
                <li>✓ Modèles sénégalais de base</li>
                <li>✓ 1 seul utilisateur</li>
                <li>✓ Fiches mesures simples</li>
                <li className="text-slate-400">✗ Multi-comptes équipe</li>
                <li className="text-slate-400">✗ Caisse & Trésorerie</li>
              </ul>
            </div>
            <div className="pt-4">
              <span className="w-full block text-center py-2 bg-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                Inclus d'office
              </span>
            </div>
          </div>

          {/* 2. Essentiel */}
          <div className="border-2 border-slate-900 p-4 flex flex-col justify-between bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-800 bg-blue-100 px-2 py-0.5">SOLO / INDÉPENDANT</span>
              <div>
                <h4 className="text-base font-black text-slate-900">4 000 FCFA <span className="text-[10px] font-normal text-slate-500">/mois</span></h4>
                <span className="text-[10px] text-slate-500 font-mono">ou 40 000 FCFA/an (-2 mois)</span>
              </div>
              <p className="text-[11px] text-slate-600 font-serif">Idéal pour le tailleur artisan travaillant seul dans son atelier.</p>
              <ul className="text-xs space-y-1.5 text-slate-700 pt-2 border-t border-slate-200">
                <li>✓ Clients & Mesures illimités</li>
                <li>✓ WhatsApp-First (reçus & avis)</li>
                <li>✓ Gestion des commandes & devis</li>
                <li>✓ Alertes essayages</li>
                <li className="text-slate-400">✗ Gestion d'équipe d'atelier</li>
                <li className="text-slate-400">✗ Caisse & stocks avancés</li>
              </ul>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSelectedTier('essentiel');
                  setIsPayModalOpen(true);
                }}
                className="w-full py-2 bg-black hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-wider cursor-pointer border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Choisir Essentiel
              </button>
            </div>
          </div>

          {/* 3. Pro */}
          <div className="border-2 border-black p-4 flex flex-col justify-between bg-amber-50 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute -top-3 right-3 bg-red-600 text-white font-black uppercase text-[8px] px-2 py-0.5 tracking-wider shadow">
              LE PLUS POPULAIRE
            </div>
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-900 bg-atelier-gold px-2 py-0.5">ATELIER & ÉQUIPE</span>
              <div>
                <h4 className="text-base font-black text-slate-900">10 000 FCFA <span className="text-[10px] font-normal text-slate-500">/mois</span></h4>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">ou 100 000 FCFA/an (-2 mois)</span>
              </div>
              <p className="text-[11px] text-slate-700 font-serif font-medium">Pour l'atelier avec couturiers, chef d'atelier et vendeurs.</p>
              <ul className="text-xs space-y-1.5 text-slate-800 pt-2 border-t border-amber-300">
                <li>✓ Tout Essentiel inclus</li>
                <li>✓ <strong>Multi-utilisateurs</strong> (5 rôles)</li>
                <li>✓ <strong>Caisse Journalière</strong> & Wave/OM</li>
                <li>✓ <strong>Gestion Stocks</strong> bazin, fils</li>
                <li>✓ Tableaux de bord & Retards</li>
                <li>✓ Synchronisation Cloud Supabase</li>
              </ul>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSelectedTier('pro');
                  setIsPayModalOpen(true);
                }}
                className="w-full py-2 bg-atelier-gold hover:bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Activer Formule Pro ★
              </button>
            </div>
          </div>

          {/* 4. Entreprise */}
          <div className="border-2 border-slate-900 p-4 flex flex-col justify-between bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-200 px-2 py-0.5">RÉSEAU MULTI-SITES</span>
              <h4 className="text-base font-black text-atelier-gold">Sur Devis</h4>
              <p className="text-[11px] text-zinc-300 font-serif">Réseaux d'ateliers, franchises & maisons de haute couture internationales.</p>
              <ul className="text-xs space-y-1.5 text-zinc-300 pt-2 border-t border-zinc-700">
                <li>✓ Multi-ateliers isolés</li>
                <li>✓ Support WhatsApp dédié 7j/7</li>
                <li>✓ Formation de l'équipe sur place</li>
                <li>✓ Migration & catalogue sur-mesure</li>
                <li>✓ SLA & Déploiement personnalisé</li>
              </ul>
            </div>
            <div className="pt-4">
              <a
                href="https://wa.me/221770000000?text=Bonjour%20Tech%20Fox%2C%20je%20souhaite%20un%20devis%20pour%20la%20formule%20Entreprise%20FoxCouture"
                target="_blank"
                rel="noreferrer"
                className="w-full block text-center py-2 bg-white hover:bg-zinc-200 text-black font-black uppercase text-[10px] tracking-wider cursor-pointer border border-white"
              >
                Demander un Devis WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Transaction History Log */}
      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 border-b border-black pb-2 flex items-center justify-between">
          <span>Historique des Paiements SaaS</span>
          <span className="text-[10px] font-mono text-slate-500 font-normal">({activeTenant.paiements.length} transactions)</span>
        </h3>

        {activeTenant.paiements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-slate-50">
                  <th className="p-3 font-black uppercase tracking-wider">Date</th>
                  <th className="p-3 font-black uppercase tracking-wider">Référence</th>
                  <th className="p-3 font-black uppercase tracking-wider">Facture</th>
                  <th className="p-3 font-black uppercase tracking-wider">Moyen</th>
                  <th className="p-3 font-black uppercase tracking-wider">Montant</th>
                  <th className="p-3 font-black uppercase tracking-wider text-center">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {activeTenant.paiements.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono">{pay.date}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{pay.reference}</td>
                    <td className="p-3 font-mono">{pay.factureNumero}</td>
                    <td className="p-3 uppercase">
                      <span className="px-2 py-0.5 border border-slate-300 text-[10px] font-bold tracking-widest bg-slate-100 text-slate-700">
                        {pay.moyen.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-slate-900">{pay.montant} FCFA</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDownloadReceipt(pay)}
                        className="p-1.5 hover:bg-slate-200 border border-slate-300 rounded-none text-slate-700 cursor-pointer transition flex items-center gap-1 mx-auto text-[10px] font-bold"
                      >
                        <Download className="h-3 w-3" /> Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 font-serif italic text-xs">
            Aucun paiement enregistré pour l'instant. Vous êtes actuellement en période d'essai gratuit.
          </div>
        )}
      </div>

      {/* MODAL / BOTTOM SHEET FOR PAYMENT SIMULATION */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg p-6 space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b-2 border-black pb-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">SIMULATION DE TRANSACTION</span>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 font-display">
                  S'abonner à FOX COUTURE
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsPayModalOpen(false);
                  setPaymentSuccess(false);
                }}
                className="p-1 border border-black hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="space-y-4 text-center py-4">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black uppercase text-sm text-slate-950">Paiement Validé avec Succès !</h4>
                <p className="text-xs font-serif text-slate-600 max-w-md mx-auto">
                  Votre transaction pour la formule <strong>{TIER_PRICES[selectedTier].nom}</strong> ({paymentPeriod === 'mensuel' ? 'Mensuel' : 'Annuel'}) d'un montant de <strong>{getPlanPrice()} FCFA</strong> a été enregistrée avec succès sous la référence <strong>{generatedRef}</strong>.
                  Votre atelier est désormais <strong>ACTIF</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsPayModalOpen(false);
                      setPaymentSuccess(false);
                    }}
                    className="px-6 py-2 bg-black text-white hover:bg-zinc-800 font-black uppercase text-[10px] tracking-widest border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    FERMER LE GUICHET
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs font-semibold">
                
                {/* Mode and Pricing Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">FORMULE</label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as any)}
                      className="w-full bg-white border-2 border-black p-2 rounded-none font-bold"
                    >
                      <option value="essentiel">Essentiel (4k / mois)</option>
                      <option value="pro">Pro Atelier (10k / mois)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">PÉRIODE</label>
                    <select
                      value={paymentPeriod}
                      onChange={(e) => setPaymentPeriod(e.target.value as any)}
                      className="w-full bg-white border-2 border-black p-2 rounded-none font-bold"
                    >
                      <option value="mensuel">Mensuel ({TIER_PRICES[selectedTier].mensuel} FCFA)</option>
                      <option value="annuel">Annuel ({TIER_PRICES[selectedTier].annuel} FCFA - 2 mois offerts)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">MOYEN DE PAIEMENT</label>
                    <select
                      value={paymentMoyen}
                      onChange={(e) => setPaymentMoyen(e.target.value as any)}
                      className="w-full bg-white border-2 border-black p-2 rounded-none font-bold"
                    >
                      <option value="mobile_money">Wave / Orange Money</option>
                      <option value="carte">Carte Bancaire (VISA / Mastercard)</option>
                      <option value="virement">Virement Bancaire</option>
                    </select>
                  </div>
                </div>

                {/* Simulated Field Input based on Mode */}
                {paymentMoyen === 'mobile_money' && (
                  <div className="space-y-1.5 bg-slate-50 p-4 border border-slate-300">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">NUMÉRO MOBILE MONEY</label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 italic font-serif">Saisissez votre numéro pour recevoir l'invite de validation de paiement.</span>
                  </div>
                )}

                {paymentMoyen === 'carte' && (
                  <div className="space-y-3 bg-slate-50 p-4 border border-slate-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">NUMÉRO DE CARTE</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-black p-2 rounded-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-700">TITULAIRE</label>
                        <input
                          type="text"
                          required
                          placeholder="Nom complet"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-white border border-black p-2 rounded-none uppercase text-[10px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-700">EXP</label>
                          <input type="text" required placeholder="MM/AA" className="w-full bg-white border border-black p-2 rounded-none font-mono text-[10px] text-center" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-700">CVC</label>
                          <input type="password" required maxLength={3} placeholder="•••" className="w-full bg-white border border-black p-2 rounded-none font-mono text-[10px] text-center" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMoyen === 'virement' && (
                  <div className="bg-amber-50 p-4 border border-amber-300 space-y-2">
                    <p className="text-[10px] font-serif italic text-amber-900 leading-relaxed">
                      Pour régler par virement, effectuez l'envoi vers le compte de la plateforme (FOX SAAS) :
                      <br /><strong className="font-mono">IBAN: SN92 3000 1000 4567 8901 2345 67</strong>
                      <br />Indiquez le nom de votre société comme référence. Dès validation, votre espace est automatiquement rechargé.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">RÉFÉRENCE DE LA PREUVE DE VIREMENT</label>
                      <input
                        type="text"
                        required
                        placeholder="REF-VIR-XXXXXX"
                        className="w-full bg-white border border-black p-2 rounded-none font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Code Promo Block */}
                <div className="space-y-1 bg-slate-50 p-3 border border-slate-300">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">Code Promo / Réduction</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: BIENVENUE15, VIP50"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-white border border-black p-1.5 rounded-none font-mono text-[11px] uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-black text-white hover:bg-atelier-gold hover:text-black font-black uppercase text-[9px] tracking-wider border border-black transition cursor-pointer"
                    >
                      Appliquer
                    </button>
                  </div>
                  {appliedPromo && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                      ✓ Code {appliedPromo} appliqué (-{promoDiscount * 100}%) !
                    </span>
                  )}
                  {promoError && (
                    <span className="text-[10px] text-rose-600 font-bold block mt-1">
                      ✗ {promoError}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Total à débiter</span>
                    <span className="text-xs text-slate-600">
                      {promoDiscount > 0 ? (
                        <>
                          <span className="line-through text-slate-400 mr-1.5 font-mono">
                            {paymentPeriod === 'mensuel' ? TIER_PRICES[selectedTier].mensuel : TIER_PRICES[selectedTier].annuel} FCFA
                          </span>
                          <strong className="font-mono text-emerald-600 text-sm">
                            {getPlanPrice()} FCFA
                          </strong>
                        </>
                      ) : (
                        <strong className="font-mono text-slate-900 text-sm">
                          {getPlanPrice()} FCFA
                        </strong>
                      )}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-3 bg-black text-white hover:bg-atelier-gold hover:text-black border-2 border-black font-black uppercase text-[10px] tracking-widest transition cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> SÉCURISATION...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" /> CONFIRMER LE RÈGLEMENT
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
