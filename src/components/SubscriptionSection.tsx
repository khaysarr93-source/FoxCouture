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
      <div className="card-fox p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Abonnement de l'Atelier</span>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2 mt-1">
            <Building className="h-5 w-5 text-[#F05A22]" /> {activeTenant.raisonSociale}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">{activeTenant.secteur} — {activeTenant.adresse}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTenant.statut === 'actif' && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold text-xs flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Abonnement actif
            </span>
          )}
          {activeTenant.statut === 'essai' && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Essai gratuit : {diffDays} jours restants
            </span>
          )}
          {activeTenant.statut === 'suspendu' && (
            <span className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-semibold text-xs flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-bounce" /> Accès restreint
            </span>
          )}
          {activeTenant.statut === 'resilie' && (
            <span className="px-3 py-1.5 bg-stone-100 text-stone-800 border border-stone-200 rounded-full font-semibold text-xs flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-stone-500" /> Abonnement résilié
            </span>
          )}
        </div>
      </div>

      {/* Subscription Warnings / Suspended Screens */}
      {isExpired && (
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 space-y-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-7 w-7 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-rose-950 text-sm">Période d'essai expirée ou paiement manquant !</h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                L'accès complet de votre atelier <strong>{activeTenant.raisonSociale}</strong> a été restreint. Afin de continuer à enregistrer vos clients, modifier les fiches de mesures, ou planifier les essayages, veuillez souscrire à une formule payante ci-dessous.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPaymentPeriod('mensuel');
              setIsPayModalOpen(true);
            }}
            className="btn-fox-primary"
          >
            S'abonner maintenant (à partir de 4 000 FCFA)
          </button>
        </div>
      )}

      {/* Grid of pricing options & statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Subscription state card */}
        <div className="card-fox p-6 space-y-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">Formule de Facturation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Current details */}
            <div className="space-y-3 bg-[#FBF8F3] p-4.5 rounded-2xl border border-stone-200/70">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">Détails actuels</span>
              
              <div className="space-y-0.5">
                <span className="text-xs text-stone-500 block">Formule active :</span>
                <span className="text-sm font-bold text-stone-900 block font-mono">
                  {activeTenant.formule === 'essai' ? 'Essai gratuit 15 jours' : activeTenant.formule === 'annuel' ? 'Abonnement Annuel' : 'Abonnement Mensuel'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-stone-500 block">Prochaine échéance :</span>
                <span className="text-sm font-bold text-stone-900 block font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#F05A22]" /> {activeTenant.dateExpiration}
                  {diffDays > 0 && (
                    <span className="text-xs text-stone-500 font-normal">({diffDays} jours)</span>
                  )}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-stone-500 block">Date d'inscription :</span>
                <span className="text-xs text-stone-700 block font-mono">{activeTenant.dateInscription}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col justify-between p-4.5 rounded-2xl border border-dashed border-stone-300 bg-white">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">Actions rapides</span>
              
              <div className="space-y-2 mt-4 md:mt-0">
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="btn-fox-primary !w-full !py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Wallet className="h-4 w-4" /> Recharger / Payer
                </button>

                {activeTenant.statut === 'essai' && (
                  <button
                    onClick={handleExtendTrial}
                    disabled={hasRequestedExtension}
                    className="w-full px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {hasRequestedExtension ? 'Extension déjà utilisée' : "Étendre l'essai (+7 jours)"}
                  </button>
                )}

                {activeTenant.formule === 'mensuel' && (
                  <button
                    onClick={() => handleChangeFormuleDirect('annuel')}
                    className="w-full px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Passer à l'Annuel (Économisez 20 000 FCFA)
                  </button>
                )}

                {activeTenant.formule === 'annuel' && (
                  <button
                    onClick={() => handleChangeFormuleDirect('mensuel')}
                    className="w-full px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Repasser au Mensuel
                  </button>
                )}

                <button
                  onClick={handleResilier}
                  className="w-full text-center text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer underline hover:no-underline pt-1"
                >
                  Résilier l'abonnement
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Pricing Guide Panel */}
        <div className="bg-[#191716] text-[#FAF8F5] p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <Sparkles className="h-5 w-5 text-[#F05A22]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">Formules Fox Couture</h3>
            </div>
            
            <div className="space-y-3">
              {/* Essentiel */}
              <div 
                onClick={() => {
                  setSelectedTier('essentiel');
                  setIsPayModalOpen(true);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${selectedTier === 'essentiel' ? 'border-[#F05A22] bg-stone-900' : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-200">Essentiel</span>
                  <span className="font-mono text-sm font-bold text-white">4 000 FCFA <span className="text-xs font-normal text-stone-400">/mois</span></span>
                </div>
                <p className="text-xs text-stone-400 mt-1">Tailleur indépendant, clients illimités & WhatsApp standard.</p>
              </div>

              {/* Pro */}
              <div 
                onClick={() => {
                  setSelectedTier('pro');
                  setIsPayModalOpen(true);
                }}
                className="p-3.5 bg-[#F05A22] text-white rounded-2xl relative overflow-hidden cursor-pointer hover:bg-[#d94e1b] transition shadow-md"
              >
                <div className="absolute top-2 right-2 bg-white text-[#F05A22] font-bold text-[9px] px-2 py-0.5 rounded-full">
                  Recommandé
                </div>
                <div className="flex justify-between items-center pr-20">
                  <span className="text-xs font-bold">Pro Atelier</span>
                  <span className="font-mono text-sm font-bold">10 000 FCFA <span className="text-xs font-normal opacity-90">/mois</span></span>
                </div>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  Multi-utilisateurs (Tailleur, Coupeur, Caisse), Caisse tactile Wave/OM & Alertes stock.
                </p>
              </div>

              {/* Entreprise */}
              <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl text-stone-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-300">Entreprise</span>
                  <span className="font-mono text-xs font-bold text-[#F05A22]">Sur devis</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Réseau multi-boutiques & support WhatsApp dédié 7j/7.</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-400 pt-4 leading-relaxed">
            Note: Paiement instantané via Wave, Orange Money ou Espèces. Aucune carte bancaire obligatoire.
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
          <div className="card-fox rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div className="space-y-3.5">
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">Solo / Indépendant</span>
              <div>
                <h4 className="text-xl font-bold text-stone-900">4 000 FCFA <span className="text-xs font-normal text-stone-500">/mois</span></h4>
                <span className="text-xs text-stone-500 font-medium">ou 40 000 FCFA/an (-2 mois)</span>
              </div>
              <p className="text-xs text-stone-600">Idéal pour le tailleur artisan travaillant seul dans son atelier.</p>
              <ul className="text-xs space-y-2 text-stone-700 pt-3 border-t border-stone-100">
                <li className="flex items-center gap-2">✓ Clients & Mesures illimités</li>
                <li className="flex items-center gap-2">✓ WhatsApp direct (reçus & avis)</li>
                <li className="flex items-center gap-2">✓ Gestion des commandes & devis</li>
                <li className="flex items-center gap-2">✓ Alertes essayages</li>
                <li className="text-stone-400 flex items-center gap-2">✗ Multi-utilisateurs</li>
                <li className="text-stone-400 flex items-center gap-2">✗ Caisse & stocks avancés</li>
              </ul>
            </div>
            <div className="pt-5">
              <button
                onClick={() => {
                  setSelectedTier('essentiel');
                  setIsPayModalOpen(true);
                }}
                className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-xl border border-stone-200/80 transition cursor-pointer shadow-xs"
              >
                Choisir Essentiel
              </button>
            </div>
          </div>

          {/* 3. Pro */}
          <div className="card-fox rounded-3xl p-6 shadow-card flex flex-col justify-between relative border-2 border-[#F05A22]">
            <div className="absolute -top-3 right-4 bg-[#F05A22] text-white font-semibold text-[10px] px-3 py-0.5 rounded-full shadow-xs">
              Le plus populaire
            </div>
            <div className="space-y-3.5">
              <span className="text-[11px] font-semibold text-[#F05A22] bg-[#FDF4EE] px-2.5 py-0.5 rounded-full border border-[#F05A22]/20">Atelier & Équipe</span>
              <div>
                <h4 className="text-xl font-bold text-stone-900">10 000 FCFA <span className="text-xs font-normal text-stone-500">/mois</span></h4>
                <span className="text-xs text-emerald-600 font-semibold">ou 100 000 FCFA/an (-2 mois offerts)</span>
              </div>
              <p className="text-xs text-stone-600">Pour l'atelier avec couturiers, chef d'atelier et vendeurs.</p>
              <ul className="text-xs space-y-2 text-stone-800 pt-3 border-t border-stone-100">
                <li className="flex items-center gap-2 font-medium">✓ Tout Essentiel inclus</li>
                <li className="flex items-center gap-2">✓ Multi-utilisateurs (5 rôles)</li>
                <li className="flex items-center gap-2">✓ Caisse tactile & Wave/OM</li>
                <li className="flex items-center gap-2">✓ Gestion stocks bazin & fils</li>
                <li className="flex items-center gap-2">✓ Tableaux de bord & Relances</li>
                <li className="flex items-center gap-2">✓ Synchronisation sécurisée</li>
              </ul>
            </div>
            <div className="pt-5">
              <button
                onClick={() => {
                  setSelectedTier('pro');
                  setIsPayModalOpen(true);
                }}
                className="w-full py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
              >
                Activer Formule Pro ★
              </button>
            </div>
          </div>

          {/* 4. Entreprise */}
          <div className="bg-[#161412] text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div className="space-y-3.5">
              <span className="text-[11px] font-semibold text-stone-300 bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-700">Réseau multi-ateliers</span>
              <h4 className="text-xl font-bold text-[#F05A22]">Sur Devis</h4>
              <p className="text-xs text-stone-300">Réseaux d'ateliers, franchises & maisons de couture internationales.</p>
              <ul className="text-xs space-y-2 text-stone-300 pt-3 border-t border-stone-800">
                <li className="flex items-center gap-2">✓ Multi-ateliers isolés</li>
                <li className="flex items-center gap-2">✓ Support WhatsApp prioritaire 7j/7</li>
                <li className="flex items-center gap-2">✓ Formation équipe sur place</li>
                <li className="flex items-center gap-2">✓ Catalogue & migration sur-mesure</li>
                <li className="flex items-center gap-2">✓ SLA personnalisé</li>
              </ul>
            </div>
            <div className="pt-5">
              <a
                href="https://wa.me/221770000000?text=Bonjour%20Tech%20Fox%2C%20je%20souhaite%20un%20devis%20pour%20la%20formule%20Entreprise%20FoxCouture"
                target="_blank"
                rel="noreferrer"
                className="w-full block text-center py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Demander un devis WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Transaction History Log */}
      <div className="card-fox rounded-3xl p-6 shadow-card space-y-4">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            Historique des paiements d'abonnement
          </h3>
          <span className="text-xs text-stone-500 font-medium">({activeTenant.paiements.length} transaction{activeTenant.paiements.length > 1 ? 's' : ''})</span>
        </div>

        {activeTenant.paiements.length > 0 ? (
          <div className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF8F3] text-stone-500 font-semibold text-[11px] border-b border-stone-200/80">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Référence</th>
                  <th className="p-3.5">Facture</th>
                  <th className="p-3.5">Moyen</th>
                  <th className="p-3.5">Montant</th>
                  <th className="p-3.5 text-center">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeTenant.paiements.map((pay) => (
                  <tr key={pay.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 text-stone-600">{pay.date}</td>
                    <td className="p-3.5 font-semibold text-stone-900">{pay.reference}</td>
                    <td className="p-3.5 text-stone-600">#{pay.factureNumero}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBF8F3] text-stone-700 border border-stone-200/80">
                        {pay.moyen.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">{pay.montant} FCFA</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDownloadReceipt(pay)}
                        className="py-1 px-3 hover:bg-stone-50 border border-stone-200/80 rounded-xl text-stone-700 cursor-pointer transition inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-[#F05A22]" /> Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl border border-dashed border-stone-200 bg-[#FBF8F3] text-stone-500 text-xs">
            Aucun paiement enregistré pour l'instant. Vous êtes actuellement en période d'essai gratuit.
          </div>
        )}
      </div>

      {/* MODAL / BOTTOM SHEET FOR PAYMENT SIMULATION */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl border border-stone-200/80 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-stone-500 block mb-0.5">Activation immédiate</span>
                <h3 className="text-base font-semibold text-stone-900">
                  S'abonner à Fox Couture
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsPayModalOpen(false);
                  setPaymentSuccess(false);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="space-y-4 text-center py-5">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                <h4 className="font-semibold text-base text-stone-900">Paiement validé avec succès !</h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Votre transaction pour la formule <strong>{TIER_PRICES[selectedTier].nom}</strong> ({paymentPeriod === 'mensuel' ? 'Mensuel' : 'Annuel'}) d'un montant de <strong>{getPlanPrice()} FCFA</strong> a été enregistrée sous la référence <strong>{generatedRef}</strong>.
                  Votre atelier est désormais <strong>Actif</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsPayModalOpen(false);
                      setPaymentSuccess(false);
                    }}
                    className="px-6 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Fermer et continuer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs font-semibold">
                
                {/* Mode and Pricing Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Formule</label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as any)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-hidden focus:border-[#F05A22]"
                    >
                      <option value="essentiel">Essentiel (4k / mois)</option>
                      <option value="pro">Pro Atelier (10k / mois)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Période</label>
                    <select
                      value={paymentPeriod}
                      onChange={(e) => setPaymentPeriod(e.target.value as any)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-hidden focus:border-[#F05A22]"
                    >
                      <option value="mensuel">Mensuel ({TIER_PRICES[selectedTier].mensuel} FCFA)</option>
                      <option value="annuel">Annuel ({TIER_PRICES[selectedTier].annuel} FCFA - 2 mois offerts)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Moyen de paiement</label>
                    <select
                      value={paymentMoyen}
                      onChange={(e) => setPaymentMoyen(e.target.value as any)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-hidden focus:border-[#F05A22]"
                    >
                      <option value="mobile_money">Wave / Orange Money</option>
                      <option value="carte">Carte Bancaire (CB)</option>
                      <option value="virement">Virement Bancaire</option>
                    </select>
                  </div>
                </div>

                {/* Simulated Field Input based on Mode */}
                {paymentMoyen === 'mobile_money' && (
                  <div className="space-y-1.5 bg-[#FBF8F3] p-3.5 rounded-2xl border border-stone-200/60">
                    <label className="text-xs font-semibold text-stone-700 block">Numéro Mobile Money</label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                    />
                    <span className="text-[11px] text-stone-500 font-normal">Saisissez votre numéro pour recevoir l'invite de validation sur votre téléphone.</span>
                  </div>
                )}

                {paymentMoyen === 'carte' && (
                  <div className="space-y-3 bg-[#FBF8F3] p-3.5 rounded-2xl border border-stone-200/60">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 block">Numéro de carte</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700">Titulaire</label>
                        <input
                          type="text"
                          required
                          placeholder="Nom complet"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-white border border-stone-200/80 p-2 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-700">Expiration</label>
                          <input type="text" required placeholder="MM/AA" className="w-full bg-white border border-stone-200/80 p-2 rounded-xl text-xs text-center font-medium" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-700">CVC</label>
                          <input type="password" required maxLength={3} placeholder="•••" className="w-full bg-white border border-stone-200/80 p-2 rounded-xl text-xs text-center font-medium" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMoyen === 'virement' && (
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60 space-y-2">
                    <p className="text-xs text-amber-900 leading-relaxed font-normal">
                      Effectuez le virement vers le compte bancaire Fox Couture :
                      <br /><strong className="font-mono font-semibold">IBAN: SN92 3000 1000 4567 8901 2345 67</strong>
                      <br />Indiquez le nom de votre atelier comme référence de paiement.
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 block">Référence de virement</label>
                      <input
                        type="text"
                        required
                        placeholder="REF-VIR-XXXXXX"
                        className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl text-xs font-medium text-stone-900"
                      />
                    </div>
                  </div>
                )}

                {/* Code Promo Block */}
                <div className="space-y-1 bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/60">
                  <label className="text-xs font-semibold text-stone-700 block">Code Promo / Réduction</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: BIENVENUE15, VIP50"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-white border border-stone-200/80 p-2 rounded-xl text-xs font-medium uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3.5 py-2 bg-[#161412] hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      Appliquer
                    </button>
                  </div>
                  {appliedPromo && (
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                      ✓ Code {appliedPromo} appliqué (-{promoDiscount * 100}%) !
                    </span>
                  )}
                  {promoError && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ✗ {promoError}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-stone-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400 font-medium">Total à débiter</span>
                    <span className="text-xs text-stone-600">
                      {promoDiscount > 0 ? (
                        <>
                          <span className="line-through text-stone-400 mr-1.5 font-medium">
                            {paymentPeriod === 'mensuel' ? TIER_PRICES[selectedTier].mensuel : TIER_PRICES[selectedTier].annuel} FCFA
                          </span>
                          <strong className="text-emerald-600 text-sm font-bold">
                            {getPlanPrice()} FCFA
                          </strong>
                        </>
                      ) : (
                        <strong className="text-stone-900 text-sm font-bold">
                          {getPlanPrice()} FCFA
                        </strong>
                      )}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" /> Confirmer le règlement
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
