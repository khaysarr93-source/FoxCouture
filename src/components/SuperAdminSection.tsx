import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Building, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  FileDown, 
  RefreshCw, 
  Clock, 
  Mail, 
  Lock, 
  ShieldCheck, 
  BarChart2, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Tenant, StatutSaaS, FormuleSaaS } from '../types';

export default function SuperAdminSection() {
  const { 
    tenants, 
    setTenants, 
    pricing, 
    updatePricing, 
    registerTenant, 
    updateTenant,
    currentTenantId,
    setCurrentTenantId,
    promoCodes,
    addPromoCode,
    deletePromoCode,
    togglePromoCode
  } = useStore();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'payments' | 'promo_codes'>('tenants');
  
  // Custom price edit states
  const [mensuelPriceInput, setMensuelPriceInput] = useState(pricing.mensuel);
  const [annuelPriceInput, setAnnuelPriceInput] = useState(pricing.annuel);
  const [isPricingSaved, setIsPricingSaved] = useState(false);

  // Promo code creation state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoReduction, setNewPromoReduction] = useState(15); // percent e.g. 15%
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');

  // Manual society registration form state
  const [isNewTenantFormOpen, setIsNewTenantFormOpen] = useState(false);
  const [newRaison, setNewRaison] = useState('');
  const [newSecteur, setNewSecteur] = useState('');
  const [newAdresse, setNewAdresse] = useState('');
  const [newAdminNom, setNewAdminNom] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newFormule, setNewFormule] = useState<FormuleSaaS>('essai');

  // Audit Logs (Simulated logs for realism and compliance with section 3.6 of specs)
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; action: string; category: string }>>([
    { id: 'log-1', timestamp: '2026-07-06 12:45', action: 'Connexion Super-Administrateur réussie', category: 'auth' },
    { id: 'log-2', timestamp: '2026-07-05 18:22', action: "Alerte automatique de fin d'essai imminente envoyée à Couture Élégance", category: 'notif' },
    { id: 'log-3', timestamp: '2026-07-01 09:00', action: "Création automatique du tenant 'Couture Élégance' suite onboarding en ligne", category: 'tenant' },
    { id: 'log-4', timestamp: '2026-05-30 00:01', action: "Suspension automatique pour défaut de paiement de l'Atelier Aminata", category: 'billing' },
    { id: 'log-5', timestamp: '2026-01-10 10:30', action: "Premier paiement annuel (74000 FCFA) enregistré pour Maison FOX COUTURE", category: 'billing' },
  ]);

  const addAuditLog = (action: string, category: string) => {
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action,
      category
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Calculations for global SaaS Dashboard metrics (Section 3.6 of specs)
  const totalSocieties = tenants.length;
  
  const activeCount = tenants.filter(t => t.statut === 'actif').length;
  const trialCount = tenants.filter(t => t.statut === 'essai').length;
  const pendingCount = tenants.filter(t => t.statut === 'en_attente').length;
  const suspendedCount = tenants.filter(t => t.statut === 'suspendu').length;
  const churnedCount = tenants.filter(t => t.statut === 'resilie').length;

  // Calculate conversion rates (registration -> trial -> paid)
  const totalRegistered = tenants.length;
  const activatedCount = tenants.filter(t => t.statut !== 'en_attente').length;
  const trialConversionRate = totalRegistered > 0 ? Math.round((activatedCount / totalRegistered) * 100) : 0;

  const paidCount = tenants.filter(t => t.formule !== 'essai' && (t.statut === 'actif' || t.statut === 'suspendu')).length;
  const payingConversionRate = activatedCount > 0 ? Math.round((paidCount / activatedCount) * 100) : 0;
  const conversionRate = payingConversionRate; // keep compatibility with existing code if used elsewhere
  
  // Calculate churn rate (canceled compared to total)
  const churnRate = totalSocieties > 0 ? Math.round((churnedCount / totalSocieties) * 100) : 0;

  // Revenue computations
  let totalRevenue = 0;
  tenants.forEach(t => {
    t.paiements.forEach(p => {
      if (p.statut === 'reussi') {
        totalRevenue += p.montant;
      }
    });
  });

  // Monthly Recurring Revenue estimate based on active subscription types
  const estimatedMRR = tenants.reduce((acc, tenant) => {
    if (tenant.statut === 'actif') {
      if (tenant.formule === 'mensuel') return acc + pricing.mensuel;
      if (tenant.formule === 'annuel') return acc + Math.round(pricing.annuel / 12);
    }
    return acc;
  }, 0);

  // Filter tenants list
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.raisonSociale.toLowerCase().includes(search.toLowerCase()) || 
                          tenant.secteur.toLowerCase().includes(search.toLowerCase()) ||
                          tenant.admin.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Flat list of all SaaS payments across all tenants for auditing
  const allSaaSPayments = tenants.flatMap(t => 
    t.paiements.map(p => ({
      ...p,
      tenantId: t.id,
      tenantName: t.raisonSociale
    }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Filtered SaaS payments for the ledger tab
  const filteredPayments = allSaaSPayments.filter(pay => {
    const matchesSearch = pay.reference.toLowerCase().includes(search.toLowerCase()) ||
                          pay.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                          pay.factureNumero.toLowerCase().includes(search.toLowerCase()) ||
                          pay.moyen.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Filtered promo codes list
  const filteredPromoCodes = promoCodes.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleUpdatePriceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricing({
      mensuel: mensuelPriceInput,
      annuel: annuelPriceInput
    });
    setIsPricingSaved(true);
    addAuditLog(`Grille tarifaire mise à jour: Mensuelle: ${mensuelPriceInput} FCFA, Annuelle: ${annuelPriceInput} FCFA`, 'config');
    setTimeout(() => setIsPricingSaved(false), 3000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaison || !newAdminEmail || !newAdminPass) return;

    const expDate = new Date();
    if (newFormule === 'essai') {
      expDate.setDate(expDate.getDate() + 15); // 15 days free trial
    } else if (newFormule === 'mensuel') {
      expDate.setMonth(expDate.getMonth() + 1);
    } else {
      expDate.setFullYear(expDate.getFullYear() + 1);
    }

    const created = registerTenant({
      raisonSociale: newRaison,
      secteur: newSecteur || 'Haute Couture',
      adresse: newAdresse || 'Non renseigné',
      statut: newFormule === 'essai' ? 'essai' : 'actif',
      dateExpiration: expDate.toISOString().split('T')[0],
      formule: newFormule,
      admin: {
        nom: newAdminNom || 'Administrateur',
        email: newAdminEmail,
        motDePasse: newAdminPass
      }
    });

    addAuditLog(`Nouvelle société enregistrée manuellement: ${newRaison}`, 'tenant');
    alert(`La société ${newRaison} a été créée avec succès et rattachée à l'administrateur ${newAdminEmail}.`);
    
    // Reset Form
    setNewRaison('');
    setNewSecteur('');
    setNewAdresse('');
    setNewAdminNom('');
    setNewAdminEmail('');
    setNewAdminPass('');
    setIsNewTenantFormOpen(false);
  };

  const handleStatusChange = (tenantId: string, newStatut: StatutSaaS) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const updated: Tenant = {
      ...tenant,
      statut: newStatut
    };
    updateTenant(updated);
    addAuditLog(`Statut de la société '${tenant.raisonSociale}' modifié manuellement vers : ${newStatut.toUpperCase()}`, 'tenant');
  };

  const handleContextSwitch = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    addAuditLog(`Bascule de contexte administrateur vers le tenant ID: ${tenantId}`, 'auth');
    alert(`Bascule de contexte effectuée ! Vous voyez maintenant les données de l'atelier : ${tenants.find(t => t.id === tenantId)?.raisonSociale}`);
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoCodeError('');
    const code = newPromoCode.trim().toUpperCase();
    if (!code) {
      setPromoCodeError('Le code promotionnel ne peut pas être vide.');
      return;
    }
    
    const existing = promoCodes.find(c => c.code === code);
    if (existing) {
      setPromoCodeError('Ce code promotionnel existe déjà.');
      return;
    }

    addPromoCode({
      code,
      reduction: newPromoReduction / 100,
      actif: true,
      description: newPromoDesc.trim() || `Remise de ${newPromoReduction}%`
    });

    addAuditLog(`Nouveau code promo créé : ${code} (${newPromoReduction}%)`, 'config');
    
    // Reset Form
    setNewPromoCode('');
    setNewPromoReduction(15);
    setNewPromoDesc('');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Raison Sociale,Secteur,Statut,Date Inscription,Date Expiration,Formule,Admin Email\n';
    const rows = tenants.map(t => 
      `"${t.id}","${t.raisonSociale}","${t.secteur}","${t.statut}","${t.dateInscription}","${t.dateExpiration}","${t.formule}","${t.admin.email}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SuperAdmin_Societes_SaaS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('Exportation CSV de la liste des abonnés effectuée', 'export');
  };

  return (
    <div className="space-y-8">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-atelier-gold-dark flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5" /> Espace Super-Administrateur Plateforme
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1 font-display">
            Supervision & Contrôle SaaS Global
          </h2>
          <p className="text-xs text-slate-500 font-serif italic mt-0.5">Console d'administration de l'éditeur de solution — Gestion des abonnements et des tarifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTenantFormOpen(true)}
            className="px-4 py-2 bg-black text-white hover:bg-atelier-gold hover:text-black border-2 border-black font-black uppercase text-[10px] tracking-widest transition cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4" /> ENREGISTRER UN ATELIER
          </button>
        </div>
      </div>

      {/* Stats Board (Section 3.6 of specs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total revenue */}
        <div className="bg-white p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="p-3 bg-emerald-100 border border-emerald-500 text-emerald-950 font-black text-sm">
            FCFA
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Chiffre d'Affaires SaaS</span>
            <span className="text-base font-black font-mono text-slate-950 mt-1 block">{totalRevenue} FCFA</span>
            <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">Cumulé global</span>
          </div>
        </div>

        {/* MRR Recurring estimate */}
        <div className="bg-white p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="p-3 bg-blue-100 border border-blue-500 text-blue-950">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">MRR Estimé</span>
            <span className="text-base font-black font-mono text-slate-950 mt-1 block">{estimatedMRR} FCFA <span className="text-[10px] font-normal text-slate-500">/mois</span></span>
            <span className="text-[9px] text-blue-700 font-bold block mt-0.5">Abonnements actifs proratisés</span>
          </div>
        </div>

        {/* Societies count */}
        <div className="bg-white p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="p-3 bg-amber-100 border border-amber-500 text-amber-950">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Maisons / Ateliers</span>
            <span className="text-base font-black font-mono text-slate-950 mt-1 block">{totalSocieties}</span>
            <span className="text-[9px] text-slate-600 font-bold block mt-0.5">
              {activeCount} act. | {trialCount} essai | {pendingCount} att. | {suspendedCount} susp.
            </span>
          </div>
        </div>

        {/* Conversion & Churn rates */}
        <div className="bg-white p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="p-3 bg-purple-100 border border-purple-500 text-purple-950">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Entonnoir SaaS & Churn</span>
            <span className="text-sm font-black font-mono text-slate-950 mt-1 block">
              Act. {trialConversionRate}% | Pay. {payingConversionRate}%
            </span>
            <span className="text-[9px] text-purple-700 font-bold block mt-0.5">Taux d'activation | Taux de conversion | Churn: {churnRate}%</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Pricing setting & system logs */}
        <div className="space-y-6">
          
          {/* PRICING CONTROL PANELS (Section 4 of specs) */}
          <div className="bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 border-b border-black pb-2 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-atelier-gold-dark" /> Configuration Tarifs SaaS
            </h3>

            <form onSubmit={handleUpdatePriceConfig} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block">Formule Mensuelle (FCFA / mois)</label>
                <input
                  type="number"
                  value={mensuelPriceInput}
                  onChange={(e) => setMensuelPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-black p-2 rounded-none font-mono font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block">Formule Annuelle (FCFA / an)</label>
                <input
                  type="number"
                  value={annuelPriceInput}
                  onChange={(e) => setAnnuelPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-black p-2 rounded-none font-mono font-black"
                />
                <span className="text-[9px] text-slate-500 font-serif italic block mt-1">Recommandé: 74 000 FCFA (soit 10 000 FCFA de remise par rapport au cumul mensuel).</span>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-slate-950 text-white hover:bg-black font-black uppercase text-[10px] tracking-widest border border-black rounded-none cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4 text-atelier-gold" /> METTRE À JOUR LA GRILLE
              </button>

              {isPricingSaved && (
                <p className="text-center text-emerald-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Tarifs sauvegardés avec succès !
                </p>
              )}
            </form>
          </div>

          {/* Audit Trail System Log (Section 3.6 of specs) */}
          <div className="bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 border-b border-black pb-2">
              Journal d'audit SaaS (Temps Réel)
            </h3>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="p-2 border border-slate-200 bg-slate-50 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>{log.timestamp}</span>
                    <span className="uppercase text-[8px] px-1 bg-slate-200 font-black tracking-wider text-slate-600">{log.category}</span>
                  </div>
                  <p className="text-slate-800 font-medium font-serif italic leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Societies database list (Section 3.6) */}
        <div className="lg:col-span-2 bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          
          {/* Header & CSV export button */}
          <div className="border-b-2 border-black pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveSubTab('tenants')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
                  activeSubTab === 'tenants' 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Ateliers ({filteredTenants.length})
              </button>
              <button
                onClick={() => setActiveSubTab('payments')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
                  activeSubTab === 'payments' 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Règlements ({filteredPayments.length})
              </button>
              <button
                onClick={() => setActiveSubTab('promo_codes')}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
                  activeSubTab === 'promo_codes' 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Codes Promo ({promoCodes.length})
              </button>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 border-2 border-black text-[10px] font-black uppercase hover:bg-slate-50 flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <FileDown className="h-3.5 w-3.5" /> EXPORTER BASE (CSV)
            </button>
          </div>

          {/* Filters controls */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'tenants' 
                    ? "Rechercher par nom, secteur, email..." 
                    : activeSubTab === 'payments'
                    ? "Rechercher par référence, atelier, facture..."
                    : "Rechercher par code..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full bg-white border border-black p-2 text-xs rounded-none font-medium"
              />
            </div>
            {activeSubTab === 'tenants' && (
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-black p-2 text-xs rounded-none font-bold"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="en_attente">En attente de validation</option>
                  <option value="essai">En période d'Essai</option>
                  <option value="actif">Abonnement Actif</option>
                  <option value="suspendu">Accès Suspendu</option>
                  <option value="resilie">Résilié</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab content 1: Tenants List Grid/Table */}
          {activeSubTab === 'tenants' && (
            <div className="space-y-4">
              {filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => {
                  const isCurrent = currentTenantId === tenant.id;
                  return (
                    <div 
                      key={tenant.id}
                      className={`border-2 p-4 space-y-3 transition ${
                        isCurrent 
                          ? 'bg-atelier-beige/20 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                          : 'bg-white border-black/20 hover:border-black'
                      }`}
                    >
                      {/* Header line of tenant */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block uppercase font-black">ID: {tenant.id}</span>
                          <h4 className="font-black uppercase text-sm text-slate-950 flex items-center gap-1.5">
                            {tenant.raisonSociale}
                            {isCurrent && (
                              <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded-none font-black tracking-widest uppercase">
                                CONTEXTE ACTIF
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-serif italic mt-0.5 block">{tenant.secteur}</span>
                        </div>

                        {/* Status selectors */}
                        <div>
                          <select
                            value={tenant.statut}
                            onChange={(e) => handleStatusChange(tenant.id, e.target.value as StatutSaaS)}
                            className={`p-1 text-[9px] font-black uppercase tracking-widest border border-black rounded-none ${
                              tenant.statut === 'en_attente' ? 'bg-blue-100 text-blue-800 font-bold animate-pulse' :
                              tenant.statut === 'actif' ? 'bg-emerald-100 text-emerald-800' :
                              tenant.statut === 'essai' ? 'bg-amber-100 text-amber-800' :
                              tenant.statut === 'suspendu' ? 'bg-rose-100 text-rose-800 font-black animate-pulse' :
                              'bg-slate-100 text-slate-800'
                            }`}
                          >
                            <option value="en_attente">En attente</option>
                            <option value="essai">Essai</option>
                            <option value="actif">Actif</option>
                            <option value="suspendu">Suspendu</option>
                            <option value="resilie">Résilié</option>
                          </select>
                        </div>
                      </div>

                      {/* Metadata line of tenant */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] pt-2 border-t border-black/5 font-semibold text-slate-600">
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase font-black">Formule choisie</span>
                          <span className="font-mono text-slate-900 uppercase font-bold">{tenant.formule}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase font-black">Date d'inscription</span>
                          <span className="font-mono text-slate-900">{tenant.dateInscription}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase font-black">Expiration / Échéance</span>
                          <span className="font-mono text-slate-900">{tenant.dateExpiration}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase font-black">Responsable principal</span>
                          <span className="text-slate-900 truncate block max-w-[120px]" title={tenant.admin.email}>{tenant.admin.email}</span>
                        </div>
                      </div>

                      {/* Tenant level administrative controls */}
                      <div className="flex gap-2 justify-end pt-1 border-t border-dashed border-black/10">
                        {tenant.statut === 'en_attente' && (
                          <button
                            onClick={() => {
                              handleStatusChange(tenant.id, 'essai');
                              addAuditLog(`Confirmation manuelle de l'e-mail pour '${tenant.raisonSociale}'`, 'tenant');
                              alert(`L'adresse e-mail de l'administrateur (${tenant.admin.email}) a été validée avec succès. L'essai de 15 jours est démarré !`);
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-black text-white hover:text-white font-black uppercase text-[8px] tracking-wider cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                          >
                            Valider l'E-mail (Activer l'Atelier)
                          </button>
                        )}
                        <button
                          onClick={() => handleContextSwitch(tenant.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-black uppercase text-[8px] tracking-wider text-slate-800 cursor-pointer"
                        >
                          BASCULER VERS CET ATELIER
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 font-serif italic text-xs">
                  Aucun atelier ne correspond à votre recherche.
                </div>
              )}
            </div>
          )}

          {/* Tab content 2: Cross-tenant SaaS Payments Ledger */}
          {activeSubTab === 'payments' && (
            <div className="space-y-4">
              
              {/* Filter total info bar */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-[11px] flex justify-between items-center text-slate-700">
                <span>Chiffre d'affaires affiché :</span>
                <span className="font-mono font-black text-slate-950 text-xs">
                  {filteredPayments.reduce((sum, p) => sum + p.montant, 0)} FCFA
                </span>
              </div>

              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto border border-black/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] border-b border-black">
                        <th className="p-3">Atelier</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Référence / Facture</th>
                        <th className="p-3">Moyen</th>
                        <th className="p-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 text-[11px]">
                          <td className="p-3 font-bold text-slate-900">{pay.tenantName}</td>
                          <td className="p-3 font-mono">{pay.date}</td>
                          <td className="p-3 font-mono">
                            <div>{pay.reference}</div>
                            <div className="text-[9px] text-slate-400">{pay.factureNumero}</div>
                          </td>
                          <td className="p-3 uppercase">
                            <span className="px-1.5 py-0.5 border border-slate-200 text-[9px] font-bold tracking-widest bg-slate-50 text-slate-600">
                              {pay.moyen.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-right text-emerald-700">{pay.montant} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 font-serif italic text-xs">
                  Aucun règlement n'a été trouvé.
                </div>
              )}
            </div>
          )}

          {/* Tab content 3: Promo Codes Management Panel */}
          {activeSubTab === 'promo_codes' && (
            <div className="space-y-6">
              
              <form onSubmit={handleCreatePromoCode} className="bg-slate-50 border-2 border-black p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block border-b border-black/10 pb-1.5 font-display">
                  Créer un Nouveau Code Promo
                </span>
                {promoCodeError && (
                  <p className="text-[10px] font-bold text-rose-600">✗ {promoCodeError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-black">Code (Ex: VIP30) *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: NOEL25" 
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-black">Réduction (%) *</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      max="100"
                      placeholder="Ex: 25" 
                      value={newPromoReduction}
                      onChange={(e) => setNewPromoReduction(Number(e.target.value))}
                      className="w-full bg-white border border-black p-2 rounded-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase font-black">Description / Remarque</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Offre de fin d'année" 
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-black text-white hover:bg-zinc-800 border-2 border-black font-black uppercase text-[9px] tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                  >
                    AJOUTER CODE PROMO
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">
                  Liste des Codes Promotionnels Actifs
                </span>
                {filteredPromoCodes.length > 0 ? (
                  <div className="overflow-x-auto border border-black/10">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] border-b border-black font-black">
                          <th className="p-3">Code</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Réduction</th>
                          <th className="p-3">Statut</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-semibold">
                        {filteredPromoCodes.map((p) => (
                          <tr key={p.code} className="hover:bg-slate-50/50 text-[11px]">
                            <td className="p-3 font-mono font-black text-slate-950 uppercase">{p.code}</td>
                            <td className="p-3 font-serif text-slate-600 italic font-medium">{p.description}</td>
                            <td className="p-3 font-mono font-black text-emerald-700 font-semibold">-{Math.round(p.reduction * 100)}%</td>
                            <td className="p-3">
                              <button
                                onClick={() => togglePromoCode(p.code)}
                                className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border border-black rounded-none cursor-pointer ${
                                  p.actif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {p.actif ? 'ACTIF' : 'INACTIF'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Supprimer définitivement le code promo ${p.code} ?`)) {
                                    deletePromoCode(p.code);
                                  }
                                }}
                                className="text-[9px] font-black uppercase text-rose-600 hover:underline cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 font-serif italic text-xs">
                    Aucun code promotionnel ne correspond à votre recherche.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* REGISTRATION FORM MODAL */}
      {isNewTenantFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b-2 border-black pb-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">PANEL SUPER-ADMIN</span>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 font-display">
                  Créer une nouvelle société (Atelier / Maison)
                </h3>
              </div>
              <button onClick={() => setIsNewTenantFormOpen(false)} className="p-1 border border-black hover:bg-slate-100 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs font-semibold">
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">DÉTAILS COMPAGNIE</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-600 block">Raison sociale *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Atelier Fanta Couture" 
                      value={newRaison}
                      onChange={(e) => setNewRaison(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-600 block">Secteur d'activité</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Broderie, Prêt-à-porter" 
                      value={newSecteur}
                      onChange={(e) => setNewSecteur(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-600 block">Adresse physique</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Rue 12, Plateau, Abidjan" 
                    value={newAdresse}
                    onChange={(e) => setNewAdresse(e.target.value)}
                    className="w-full bg-white border border-black p-2 rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-black/10 pt-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">PREMIER COMPTE ADMINISTRATEUR (TENANT)</span>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-600 block">Nom du gérant principal</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Fanta Sylla" 
                    value={newAdminNom}
                    onChange={(e) => setNewAdminNom(e.target.value)}
                    className="w-full bg-white border border-black p-2 rounded-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-600 block">Adresse Email *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="fanta@couture.ci" 
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-600 block">Mot de Passe *</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full bg-white border border-black p-2 rounded-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 border border-slate-300">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 block">Formule d'Onboarding</label>
                <select
                  value={newFormule}
                  onChange={(e) => setNewFormule(e.target.value as FormuleSaaS)}
                  className="w-full bg-white border border-black p-2 rounded-none font-bold"
                >
                  <option value="essai">Période d'Essai Gratuit (15 jours)</option>
                  <option value="mensuel">Abonnement Mensuel actif ({pricing.mensuel} FCFA)</option>
                  <option value="annuel">Abonnement Annuel actif ({pricing.annuel} FCFA)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTenantFormOpen(false)}
                  className="px-4 py-2 border border-black hover:bg-slate-100 uppercase text-[10px] tracking-widest font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white hover:text-white border-2 border-black font-black uppercase text-[10px] tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  CRÉER L'ESPACE
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
