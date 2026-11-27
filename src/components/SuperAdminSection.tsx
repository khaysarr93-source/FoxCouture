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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-fox rounded-3xl p-6 border border-stone-200/60 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#F05A22] flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-[#F05A22]" /> Espace Super-Administrateur Plateforme
          </span>
          <h2 className="text-xl font-bold text-stone-900 mt-1">
            Supervision & Contrôle SaaS Global
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">Console d'administration de l'éditeur de solution — Gestion des abonnements et des tarifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTenantFormOpen(true)}
            className="btn-fox-primary text-xs"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Enregistrer un atelier
          </button>
        </div>
      </div>

      {/* Stats Board (Section 3.6 of specs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total revenue */}
        <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
            FCFA
          </div>
          <div>
            <span className="text-xs font-medium text-stone-400 block">CA SaaS Global</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-0.5 block">{totalRevenue.toLocaleString()} FCFA</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Cumulé global</span>
          </div>
        </div>

        {/* MRR Recurring estimate */}
        <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-400 block">MRR Estimé</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-0.5 block">{estimatedMRR.toLocaleString()} FCFA <span className="text-[10px] font-normal text-stone-400">/mois</span></span>
            <span className="text-[11px] text-blue-600 font-medium block mt-0.5">Abonnements actifs</span>
          </div>
        </div>

        {/* Societies count */}
        <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-400 block">Maisons / Ateliers</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-0.5 block">{totalSocieties}</span>
            <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
              {activeCount} act. | {trialCount} essai | {pendingCount} att. | {suspendedCount} susp.
            </span>
          </div>
        </div>

        {/* Conversion & Churn rates */}
        <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-400 block">Entonnoir & Churn</span>
            <span className="text-sm font-bold font-mono text-stone-900 mt-0.5 block">
              Act. {trialConversionRate}% | Pay. {payingConversionRate}%
            </span>
            <span className="text-[11px] text-purple-600 font-medium block mt-0.5">Conversion payante | Churn: {churnRate}%</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Pricing setting & system logs */}
        <div className="space-y-6">
          
          {/* PRICING CONTROL PANELS (Section 4 of specs) */}
          <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-[#F05A22]" /> Configuration Tarifs SaaS
            </h3>

            <form onSubmit={handleUpdatePriceConfig} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600 block">Formule Mensuelle (FCFA / mois)</label>
                <input
                  type="number"
                  value={mensuelPriceInput}
                  onChange={(e) => setMensuelPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600 block">Formule Annuelle (FCFA / an)</label>
                <input
                  type="number"
                  value={annuelPriceInput}
                  onChange={(e) => setAnnuelPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                />
                <span className="text-[11px] text-stone-400 block mt-1">Recommandé: 74 000 FCFA (soit 10 000 FCFA de remise par rapport au cumul mensuel).</span>
              </div>

              <button
                type="submit"
                className="w-full btn-fox-primary !py-2.5 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" /> Mettre à jour la grille
              </button>

              {isPricingSaved && (
                <p className="text-center text-emerald-600 text-xs font-semibold animate-pulse">
                  Tarifs sauvegardés avec succès !
                </p>
              )}
            </form>
          </div>

          {/* Audit Trail System Log (Section 3.6 of specs) */}
          <div className="card-fox rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Journal d'audit SaaS (Temps Réel)
            </h3>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="p-2.5 rounded-xl border border-stone-200/60 bg-[#FBF8F3] text-xs space-y-0.5">
                  <div className="flex justify-between text-stone-400 font-mono text-[10px]">
                    <span>{log.timestamp}</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.5 rounded-md bg-stone-200/70 font-semibold text-stone-600">{log.category}</span>
                  </div>
                  <p className="text-stone-800 font-medium text-xs leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Societies database list (Section 3.6) */}
        <div className="lg:col-span-2 card-fox rounded-3xl p-6 border border-stone-200/60 shadow-xs space-y-5">
          
          {/* Header & CSV export button */}
          <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex bg-stone-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveSubTab('tenants')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeSubTab === 'tenants' 
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ateliers ({filteredTenants.length})
              </button>
              <button
                onClick={() => setActiveSubTab('payments')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeSubTab === 'payments' 
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Règlements ({filteredPayments.length})
              </button>
              <button
                onClick={() => setActiveSubTab('promo_codes')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeSubTab === 'promo_codes' 
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Codes Promo ({promoCodes.length})
              </button>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <FileDown className="h-4 w-4 text-[#F05A22]" /> Exporter base (CSV)
            </button>
          </div>

          {/* Filters controls */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
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
                className="pl-9 w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl p-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
              />
            </div>
            {activeSubTab === 'tenants' && (
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl p-2 text-xs font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_attente">En attente de validation</option>
                  <option value="essai">En période d'essai</option>
                  <option value="actif">Abonnement actif</option>
                  <option value="suspendu">Accès suspendu</option>
                  <option value="resilie">Résilié</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab content 1: Tenants List Grid/Table */}
          {activeSubTab === 'tenants' && (
            <div className="space-y-3.5">
              {filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => {
                  const isCurrent = currentTenantId === tenant.id;
                  return (
                    <div 
                      key={tenant.id}
                      className={`rounded-2xl border p-4 space-y-3 transition ${
                        isCurrent 
                          ? 'bg-orange-50/40 border-[#F05A22]/40 shadow-xs' 
                          : 'bg-white border-stone-200/80 hover:border-stone-300'
                      }`}
                    >
                      {/* Header line of tenant */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 block font-semibold">ID: {tenant.id}</span>
                          <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                            {tenant.raisonSociale}
                            {isCurrent && (
                              <span className="text-[10px] bg-[#F05A22] text-white px-2 py-0.5 rounded-full font-bold">
                                Contexte actif
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-stone-500 mt-0.5 block">{tenant.secteur}</span>
                        </div>

                        {/* Status selectors */}
                        <div>
                          <select
                            value={tenant.statut}
                            onChange={(e) => handleStatusChange(tenant.id, e.target.value as StatutSaaS)}
                            className={`p-1.5 text-xs font-semibold rounded-xl border border-stone-200/80 ${
                              tenant.statut === 'en_attente' ? 'bg-blue-50 text-blue-800' :
                              tenant.statut === 'actif' ? 'bg-emerald-50 text-emerald-800' :
                              tenant.statut === 'essai' ? 'bg-amber-50 text-amber-800' :
                              tenant.statut === 'suspendu' ? 'bg-rose-50 text-rose-800 font-bold' :
                              'bg-stone-100 text-stone-700'
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-stone-100 font-medium text-stone-600">
                        <div>
                          <span className="block text-[10px] text-stone-400">Formule</span>
                          <span className="font-mono text-stone-900 font-bold capitalize">{tenant.formule}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-stone-400">Inscription</span>
                          <span className="font-mono text-stone-900">{tenant.dateInscription}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-stone-400">Échéance</span>
                          <span className="font-mono text-stone-900">{tenant.dateExpiration}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-stone-400">Responsable</span>
                          <span className="text-stone-900 truncate block max-w-[120px]" title={tenant.admin.email}>{tenant.admin.email}</span>
                        </div>
                      </div>

                      {/* Tenant level administrative controls */}
                      <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                        {tenant.statut === 'en_attente' && (
                          <button
                            onClick={() => {
                              handleStatusChange(tenant.id, 'essai');
                              addAuditLog(`Confirmation manuelle de l'e-mail pour '${tenant.raisonSociale}'`, 'tenant');
                              alert(`L'adresse e-mail de l'administrateur (${tenant.admin.email}) a été validée avec succès. L'essai de 15 jours est démarré !`);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition shadow-xs"
                          >
                            Valider l'e-mail (Activer l'atelier)
                          </button>
                        )}
                        <button
                          onClick={() => handleContextSwitch(tenant.id)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold text-xs text-stone-800 cursor-pointer transition"
                        >
                          Basculer vers cet atelier
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Aucun atelier ne correspond à votre recherche.
                </div>
              )}
            </div>
          )}

          {/* Tab content 2: Cross-tenant SaaS Payments Ledger */}
          {activeSubTab === 'payments' && (
            <div className="space-y-4">
              
              {/* Filter total info bar */}
              <div className="bg-[#FBF8F3] border border-stone-200/80 rounded-2xl p-3 text-xs flex justify-between items-center text-stone-700">
                <span>Chiffre d'affaires affiché :</span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  {filteredPayments.reduce((sum, p) => sum + p.montant, 0).toLocaleString()} FCFA
                </span>
              </div>

              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 text-xs font-semibold border-b border-stone-200">
                        <th className="p-3">Atelier</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Référence / Facture</th>
                        <th className="p-3">Moyen</th>
                        <th className="p-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-stone-50/50 text-xs">
                          <td className="p-3 font-bold text-stone-900">{pay.tenantName}</td>
                          <td className="p-3 font-mono text-stone-500">{pay.date}</td>
                          <td className="p-3 font-mono">
                            <div className="font-semibold text-stone-800">{pay.reference}</div>
                            <div className="text-[10px] text-stone-400">{pay.factureNumero}</div>
                          </td>
                          <td className="p-3 capitalize">
                            <span className="px-2 py-0.5 rounded-md border border-stone-200/80 text-[10px] font-semibold bg-stone-50 text-stone-600">
                              {pay.moyen.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-right text-emerald-700">{pay.montant.toLocaleString()} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Aucun règlement n'a été trouvé.
                </div>
              )}
            </div>
          )}

          {/* Tab content 3: Promo Codes Management Panel */}
          {activeSubTab === 'promo_codes' && (
            <div className="space-y-6">
              
              <form onSubmit={handleCreatePromoCode} className="bg-[#FBF8F3] border border-stone-200/80 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-stone-900 block border-b border-stone-200/60 pb-1.5">
                  Créer un nouveau code promo
                </span>
                {promoCodeError && (
                  <p className="text-xs font-semibold text-rose-600">✗ {promoCodeError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">Code (Ex: VIP30) *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: NOEL25" 
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl font-mono uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">Réduction (%) *</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      max="100"
                      placeholder="Ex: 25" 
                      value={newPromoReduction}
                      onChange={(e) => setNewPromoReduction(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">Description / Remarque</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Offre de fin d'année" 
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      className="w-full bg-white border border-stone-200/80 p-2.5 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="btn-fox-primary text-xs"
                  >
                    Ajouter code promo
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Liste des codes promotionnels actifs
                </span>
                {filteredPromoCodes.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 text-xs font-semibold border-b border-stone-200">
                          <th className="p-3">Code</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Réduction</th>
                          <th className="p-3">Statut</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredPromoCodes.map((p) => (
                          <tr key={p.code} className="hover:bg-stone-50/50 text-xs">
                            <td className="p-3 font-mono font-bold text-stone-900 uppercase">{p.code}</td>
                            <td className="p-3 text-stone-600">{p.description}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">-{Math.round(p.reduction * 100)}%</td>
                            <td className="p-3">
                              <button
                                onClick={() => togglePromoCode(p.code)}
                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border cursor-pointer transition ${
                                  p.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'
                                }`}
                              >
                                {p.actif ? 'Actif' : 'Inactif'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Supprimer définitivement le code promo ${p.code} ?`)) {
                                    deletePromoCode(p.code);
                                  }
                                }}
                                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                  <div className="text-center py-8 text-stone-400 text-xs">
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
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl border border-stone-200/80 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-[#F05A22] block">Panel Super-Admin</span>
                <h3 className="text-base font-bold text-stone-900">
                  Créer une nouvelle société (Atelier / Maison)
                </h3>
              </div>
              <button onClick={() => setIsNewTenantFormOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs font-semibold">
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Détails compagnie</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 block">Raison sociale *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Atelier Fanta Couture" 
                      value={newRaison}
                      onChange={(e) => setNewRaison(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 block">Secteur d'activité</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Broderie, Prêt-à-porter" 
                      value={newSecteur}
                      onChange={(e) => setNewSecteur(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-600 block">Adresse physique</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Rue 12, Plateau, Abidjan" 
                    value={newAdresse}
                    onChange={(e) => setNewAdresse(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-100 pt-3">
                <span className="text-xs font-bold text-stone-800 block">Premier compte administrateur (Tenant)</span>
                <div className="space-y-1">
                  <label className="text-xs text-stone-600 block">Nom du gérant principal</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Fanta Sylla" 
                    value={newAdminNom}
                    onChange={(e) => setNewAdminNom(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 block">Adresse Email *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="fanta@couture.ci" 
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 block">Mot de Passe *</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/80">
                <label className="text-xs font-bold text-stone-800 block">Formule d'Onboarding</label>
                <select
                  value={newFormule}
                  onChange={(e) => setNewFormule(e.target.value as FormuleSaaS)}
                  className="w-full bg-white border border-stone-200/80 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none"
                >
                  <option value="essai">Période d'Essai Gratuit (15 jours)</option>
                  <option value="mensuel">Abonnement Mensuel actif ({pricing.mensuel} FCFA)</option>
                  <option value="annuel">Abonnement Annuel actif ({pricing.annuel} FCFA)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewTenantFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-fox-primary text-xs !py-2.5 !px-5"
                >
                  Créer l'espace
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
