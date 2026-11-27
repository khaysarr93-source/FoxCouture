/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { AppSettings } from '../types';
import { 
  Building, 
  Coins, 
  MessageSquare, 
  Database, 
  Sliders, 
  Save, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  Scissors,
  HelpCircle,
  Store,
  Cloud,
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { testSupabaseConnection } from '../lib/sync';


export default function SettingsSection() {
  const { 
    settings, 
    updateSettings, 
    exportDatabase, 
    importDatabase, 
    resetDatabase 
  } = useStore();

  const [formState, setFormState] = useState<AppSettings>({ ...settings });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'billing' | 'measurements' | 'sms' | 'database' | 'pos'>('profile');

  // Custom measurement field creation state
  const [newCustomMeasureKey, setNewCustomMeasureKey] = useState('');

  // Workflow step creation state
  const [newWorkflowStep, setNewWorkflowStep] = useState('');

  // Supabase test state
  const [supabaseStatus, setSupabaseStatus] = useState<{ testing: boolean; message: string | null; success: boolean | null }>({
    testing: false,
    message: null,
    success: null
  });

  const handleTestSupabaseConn = async () => {
    setSupabaseStatus({ testing: true, message: null, success: null });
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus({
        testing: false,
        message: res.message,
        success: res.connected
      });
    } catch (e: any) {
      setSupabaseStatus({
        testing: false,
        message: e.message || 'Erreur inconnue',
        success: false
      });
    }
  };


  const handleFieldChange = (key: keyof AppSettings, value: any) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMeasureToggle = (fieldKey: string) => {
    setFormState(prev => ({
      ...prev,
      champsMesuresActifs: {
        ...prev.champsMesuresActifs,
        [fieldKey]: !prev.champsMesuresActifs[fieldKey]
      }
    }));
  };

  const handleAddCustomMeasureKey = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCustomMeasureKey.trim()) return;
    const keyCleaned = newCustomMeasureKey.trim().toLowerCase().replace(/\s+/g, '_');
    setFormState(prev => ({
      ...prev,
      champsMesuresActifs: {
        ...prev.champsMesuresActifs,
        [keyCleaned]: true
      }
    }));
    setNewCustomMeasureKey('');
  };

  const handleAddWorkflowStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newWorkflowStep.trim()) return;
    setFormState(prev => ({
      ...prev,
      etapesDefaut: [...(prev.etapesDefaut || []), newWorkflowStep.trim()]
    }));
    setNewWorkflowStep('');
  };

  const handleRemoveWorkflowStep = (indexToRemove: number) => {
    setFormState(prev => ({
      ...prev,
      etapesDefaut: (prev.etapesDefaut || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSuccessMsg('Configurations enregistrées avec succès !');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const success = importDatabase(event.target.result as string);
          if (success) {
            alert('Base de données importée avec succès ! Les données locales ont été actualisées.');
            window.location.reload();
          } else {
            alert('Erreur: Fichier de sauvegarde invalide.');
          }
        }
      };
    }
  };

  const handleReset = () => {
    resetDatabase();
  };

  const tabsConfig = [
    { id: 'profile', label: 'Profil Atelier', icon: <Building className="h-4 w-4" /> },
    { id: 'billing', label: 'Facturation & Devise', icon: <Coins className="h-4 w-4" /> },
    { id: 'measurements', label: 'Mesures & Production', icon: <Scissors className="h-4 w-4" /> },
    { id: 'pos', label: 'Caisse & Point de Vente', icon: <Store className="h-4 w-4" /> },
    { id: 'sms', label: 'Modèles de Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'database', label: 'Données & Backups', icon: <Database className="h-4 w-4" /> }
  ] as const;

  return (
    <div className="space-y-6" id="settings-section-container">
      {/* Page Title Header */}
      <div className="card-fox p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            ⚙️ Paramètres & configuration
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gérez et personnalisez les réglages de votre atelier Fox Couture.
          </p>
        </div>
        
        {successMsg && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="h-4 w-4" /> {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Subtabs */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          {tabsConfig.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`p-3 text-left rounded-2xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                activeSubTab === subTab.id 
                  ? 'bg-[#191716] text-white shadow-xs' 
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/70'
              }`}
            >
              {subTab.icon}
              <span>{subTab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Panel Box */}
        <form onSubmit={handleSave} className="md:col-span-3 card-fox p-6 space-y-6 flex flex-col justify-between min-h-[500px]">
          
          <div className="flex-1">
            {/* SUBTAB: PROFILE */}
            {activeSubTab === 'profile' && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 pb-3 mb-5">
                  <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    <Building className="h-4.5 w-4.5 text-[#F05A22]" /> Identité & Coordonnées de l'Atelier
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Ces informations apparaissent sur vos factures, devis, fiches clients et reçus de caisse.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Nom de l'atelier / Raison Sociale *</label>
                    <input
                      type="text"
                      required
                      value={formState.raisonSociale}
                      onChange={(e) => handleFieldChange('raisonSociale', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: Fox Couture Dakar"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Slogan / Description</label>
                    <input
                      type="text"
                      value={formState.slogan}
                      onChange={(e) => handleFieldChange('slogan', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: Haute Couture Sur-Mesure"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Numéro de téléphone *</label>
                    <input
                      type="text"
                      required
                      value={formState.telephone}
                      onChange={(e) => handleFieldChange('telephone', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: +221 77 123 45 67"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">NINEA / Registre de commerce</label>
                    <input
                      type="text"
                      value={formState.ninea}
                      onChange={(e) => handleFieldChange('ninea', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: NINEA 004819472 M2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Adresse email de l'atelier</label>
                    <input
                      type="email"
                      value={formState.emailAtelier || ''}
                      onChange={(e) => handleFieldChange('emailAtelier', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: contact@fox-couture.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Site internet / Instagram</label>
                    <input
                      type="text"
                      value={formState.siteWebAtelier || ''}
                      onChange={(e) => handleFieldChange('siteWebAtelier', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: instagram.com/foxcouture"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block">Adresse physique de l'atelier *</label>
                    <textarea
                      required
                      rows={2}
                      value={formState.adresse}
                      onChange={(e) => handleFieldChange('adresse', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22] resize-none"
                      placeholder="Ex: Avenue Cheikh Anta Diop, Dakar, Sénégal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: BILLING */}
            {activeSubTab === 'billing' && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 pb-3 mb-5">
                  <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    <Coins className="h-4.5 w-4.5 text-[#F05A22]" /> Configurations de Facturation & Devises
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Adaptez la monnaie locale, l'application de la TVA et les mentions légales.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Devise de l'atelier *</label>
                    <select
                      value={formState.devise}
                      onChange={(e) => handleFieldChange('devise', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                    >
                      <option value="FCFA">FCFA (Franc CFA)</option>
                      <option value="EUR">€ (Euro - EUR)</option>
                      <option value="USD">$ (Dollar - USD)</option>
                      <option value="GMD">D (Dalasi - GMD)</option>
                      <option value="GNF">FG (Franc Guinéen - GNF)</option>
                      <option value="MAD">DH (Dirham Marocain - MAD)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Taux de TVA (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={formState.tauxTva}
                      onChange={(e) => handleFieldChange('tauxTva', Number(e.target.value))}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: 18"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Acompte requis par défaut (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={formState.acomptePourcentDefaut ?? 30}
                      onChange={(e) => handleFieldChange('acomptePourcentDefaut', Number(e.target.value))}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                      placeholder="Ex: 30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Moyen de paiement favori *</label>
                    <select
                      value={formState.moyenPaiementDefaut || 'espèces'}
                      onChange={(e) => handleFieldChange('moyenPaiementDefaut', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                    >
                      <option value="espèces">Espèces / Cash</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="wave">Wave Money</option>
                      <option value="virement">Virement Bancaire</option>
                      <option value="carte">Carte Bancaire</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block">Conditions générales de vente (Pied de facture / Reçu) *</label>
                    <textarea
                      required
                      rows={3}
                      value={formState.conditionsFacture}
                      onChange={(e) => handleFieldChange('conditionsFacture', e.target.value)}
                      className="w-full bg-[#FBF8F3] border border-stone-200/80 p-2.5 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22] resize-none"
                      placeholder="Mentions légales à imprimer sur les factures et reçus..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: MEASUREMENTS */}
            {activeSubTab === 'measurements' && (
              <div className="space-y-6">
                <div className="border-b border-stone-100 pb-3 mb-5">
                  <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    <Scissors className="h-4.5 w-4.5 text-[#F05A22]" /> Mesures & Pipeline de Production
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Personnalisez les mensurations corporelles et les étapes du processus de confection.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* COLUMN 1: MEASUREMENTS */}
                  <div className="space-y-4">
                    <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/80">
                      <span className="text-xs font-semibold text-stone-800 block">
                        📐 Mensurations Corporelles Actives
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200/80 grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                      {Object.keys(formState.champsMesuresActifs).map((fieldKey) => {
                        const isChecked = formState.champsMesuresActifs[fieldKey];
                        const labelClean = fieldKey.replace(/_/g, ' ');
                        return (
                          <label 
                            key={fieldKey} 
                            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition capitalize ${
                              isChecked ? 'bg-[#FDF4EE] border-[#F05A22]/40 text-[#F05A22] font-semibold' : 'bg-[#FBF8F3] border-stone-200/60 text-stone-500 font-normal'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMeasureToggle(fieldKey)}
                              className="accent-[#F05A22] h-4 w-4 shrink-0 cursor-pointer"
                            />
                            <span className="truncate">{labelClean}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* ADD CUSTOM FIELD FORM */}
                    <div className="p-4 rounded-2xl border border-stone-200/80 bg-[#FBF8F3] space-y-2">
                      <span className="text-xs font-semibold text-stone-800 block">
                        ➕ Créer un champ de mesure personnalisé
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomMeasureKey}
                          onChange={(e) => setNewCustomMeasureKey(e.target.value)}
                          placeholder="Ex: Longueur Gilet, Carrure Dos"
                          className="flex-1 bg-white border border-stone-200/80 px-3 py-2 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomMeasureKey}
                          className="px-4 py-2 bg-[#161412] text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition cursor-pointer shadow-xs"
                        >
                          Créer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: DEFAULT PRODUCTION STEPS */}
                  <div className="space-y-4">
                    <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/80">
                      <span className="text-xs font-semibold text-stone-800 block">
                        ⚙️ Pipeline de Production par Défaut
                      </span>
                    </div>

                    <p className="text-xs text-stone-500">
                      Définissez la suite ordonnée des étapes pour chaque nouvelle commande créée.
                    </p>

                    <div className="rounded-2xl border border-stone-200/80 divide-y divide-stone-100 max-h-[250px] overflow-y-auto bg-white">
                      {(formState.etapesDefaut && formState.etapesDefaut.length > 0) ? (
                        formState.etapesDefaut.map((step, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-stone-50/70 text-xs text-stone-800 font-medium">
                            <div className="flex items-center gap-2.5">
                              <span className="h-6 w-6 rounded-full bg-[#161412] text-white flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkflowStep(idx)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Retirer cette étape"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-stone-400">
                          Aucune étape définie. Les commandes seront créées sans pipeline.
                        </div>
                      )}
                    </div>

                    {/* ADD WORKFLOW STEP FORM */}
                    <div className="p-4 rounded-2xl border border-stone-200/80 bg-[#FBF8F3] space-y-2">
                      <span className="text-xs font-semibold text-stone-800 block">
                        ➕ Ajouter une étape de production
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newWorkflowStep}
                          onChange={(e) => setNewWorkflowStep(e.target.value)}
                          placeholder="Ex: Broderie, Perlage, Finitions"
                          className="flex-1 bg-white border border-stone-200/80 px-3 py-2 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:border-[#F05A22]"
                        />
                        <button
                          type="button"
                          onClick={handleAddWorkflowStep}
                          className="px-4 py-2 bg-[#161412] text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition cursor-pointer shadow-xs"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex gap-2.5 items-start mt-2">
                  <HelpCircle className="h-4 w-4 text-[#F05A22] shrink-0 mt-0.5" />
                  <span>
                    La désactivation de champs ou le retrait d'étapes ne modifient pas vos données déjà existantes en base, mais régissent les formulaires et créations futures pour s'adapter à votre atelier.
                  </span>
                </div>
              </div>
            )}

            {/* SUBTAB: SMS TEMPLATES */}
            {activeSubTab === 'sms' && (
              <div className="space-y-6">
                <div className="border-b border-stone-200/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-[#F05A22]" /> Modèles de notifications SMS & WhatsApp
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Personnalisez les messages pré-rédigés pour un envoi instantané en un clic à vos clients.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-stone-700">Création de commande / Reçu d'acompte</label>
                      <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">Variables: &#123;client&#125;, &#123;reference&#125;, &#123;modele&#125;, &#123;montant&#125;, &#123;acompte&#125;, &#123;atelier&#125;</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsCommande || ''}
                      onChange={(e) => handleFieldChange('templateSmsCommande', e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22] transition leading-relaxed"
                      placeholder="Bonjour {client}, nous confirmons la création de votre commande {reference}..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-stone-700">Vêtement prêt en boutique</label>
                      <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">Variables: &#123;client&#125;, &#123;reference&#125;, &#123;modele&#125;, &#123;atelier&#125;</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsPret}
                      onChange={(e) => handleFieldChange('templateSmsPret', e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22] transition leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="text-xs font-semibold text-stone-700">Rappel de rendez-vous / Essayage</label>
                      <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">Variables: &#123;client&#125;, &#123;type&#125;, &#123;date&#125;, &#123;heure&#125;, &#123;atelier&#125;</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsRdv}
                      onChange={(e) => handleFieldChange('templateSmsRdv', e.target.value)}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22] transition leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: CAISSE & POINT DE VENTE */}
            {activeSubTab === 'pos' && (
              <div className="space-y-6">
                <div className="border-b border-stone-200/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Store className="h-4.5 w-4.5 text-[#F05A22]" /> Configurations point de vente & caisse
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Personnalisez le fonctionnement de vos caisses tactiles et des encaissements physiques.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default starting fund */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Fond de caisse initial par défaut ({formState.devise}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formState.posFondDeCaisseDefaut ?? 50000}
                      onChange={(e) => handleFieldChange('posFondDeCaisseDefaut', Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>

                  {/* Auto print */}
                  <div className="p-4 bg-[#FBF8F3] border border-stone-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-stone-800 block">Impression automatique du ticket</span>
                      <span className="text-[11px] text-stone-500">Ouvre automatiquement la boîte de dialogue d'impression après encaissement.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.posImpressionAutoTicket ?? true}
                      onChange={(e) => handleFieldChange('posImpressionAutoTicket', e.target.checked)}
                      className="accent-[#F05A22] h-4 w-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Allowed payment methods checkboxes */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-xs font-bold text-stone-800 block">
                        Modes de règlement acceptés au POS
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Cash */}
                      <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                        (formState.posModesPaiementActifs?.especes ?? true)
                          ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                          : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.especes ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, especes: e.target.checked });
                          }}
                          className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                        />
                        <span>Espèces</span>
                      </label>

                      {/* Mobile money */}
                      <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                        (formState.posModesPaiementActifs?.mobile_money ?? true)
                          ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                          : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.mobile_money ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, mobile_money: e.target.checked });
                          }}
                          className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                        />
                        <span>Mobile Money</span>
                      </label>

                      {/* Carte */}
                      <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                        (formState.posModesPaiementActifs?.carte ?? true)
                          ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                          : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.carte ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, carte: e.target.checked });
                          }}
                          className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                        />
                        <span>Carte Bancaire</span>
                      </label>

                      {/* Virement */}
                      <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                        (formState.posModesPaiementActifs?.virement ?? true)
                          ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                          : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.virement ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, virement: e.target.checked });
                          }}
                          className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                        />
                        <span>Virement</span>
                      </label>
                    </div>
                  </div>

                  {/* Ticket Customizations Section */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-stone-200/80">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                      <span className="text-xs font-bold text-stone-800 block">
                        Personnalisation du ticket thermique
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ticket Header text */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700">Message d'en-tête (Bienvenue)</label>
                        <input
                          type="text"
                          value={formState.ticketEnTete || ''}
                          onChange={(e) => handleFieldChange('ticketEnTete', e.target.value)}
                          className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                          placeholder="BIENVENUE CHEZ FOX COUTURE"
                        />
                      </div>

                      {/* Ticket Remerciement */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700">Message de remerciement (Pied)</label>
                        <input
                          type="text"
                          value={formState.ticketRemerciement || ''}
                          onChange={(e) => handleFieldChange('ticketRemerciement', e.target.value)}
                          className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                          placeholder="MERCI DE VOTRE CONFIANCE !"
                        />
                      </div>

                      {/* Ticket BasPage */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700">Message de bas de page (Slogan du ticket)</label>
                        <input
                          type="text"
                          value={formState.ticketBasPage || ''}
                          onChange={(e) => handleFieldChange('ticketBasPage', e.target.value)}
                          className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                          placeholder="Maison Fox Couture, l'élégance à l'état pur."
                        />
                      </div>

                      {/* Ticket Width */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700">Largeur du papier thermique</label>
                        <select
                          value={formState.ticketLargeur || '80mm'}
                          onChange={(e) => handleFieldChange('ticketLargeur', e.target.value)}
                          className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                        >
                          <option value="80mm">80 mm (Format standard large)</option>
                          <option value="58mm">58 mm (Format compact étroit)</option>
                        </select>
                      </div>

                      {/* Show/Hide checks */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                          (formState.ticketAfficherNinea ?? true)
                            ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formState.ticketAfficherNinea ?? true}
                            onChange={(e) => handleFieldChange('ticketAfficherNinea', e.target.checked)}
                            className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                          />
                          <span>Afficher le NINEA sur le ticket</span>
                        </label>

                        <label className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-semibold transition ${
                          (formState.ticketAfficherSlogan ?? true)
                            ? 'bg-orange-50/60 border-[#F05A22]/40 text-[#F05A22]'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formState.ticketAfficherSlogan ?? true}
                            onChange={(e) => handleFieldChange('ticketAfficherSlogan', e.target.checked)}
                            className="accent-[#F05A22] h-4 w-4 shrink-0 rounded"
                          />
                          <span>Afficher le slogan sur le ticket</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: DATABASE UTILITIES */}
            {activeSubTab === 'database' && (
              <div className="space-y-4">
                <div className="border-b border-stone-200/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-[#F05A22]" /> Sauvegarde & Synchronisation Cloud
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Gérez la synchronisation Supabase Cloud et la sécurité de votre base de données locale.</p>
                </div>

                {/* SUPABASE CLOUD CARD */}
                <div className="p-5 border border-emerald-200/80 bg-emerald-50/40 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-900">Supabase Cloud</h4>
                          {isSupabaseConfigured ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Configuré & Actif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                              Mode Local
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          Projet : <code className="font-mono text-[11px] text-emerald-900 font-bold">https://ttctagiehgusgoksctxv.supabase.co</code>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestSupabaseConn}
                      disabled={supabaseStatus.testing}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {supabaseStatus.testing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Test en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tester la connexion</span>
                        </>
                      )}
                    </button>
                  </div>

                  {supabaseStatus.message && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      supabaseStatus.success
                        ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{supabaseStatus.message}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">

                  
                  {/* Export */}
                  <div className="p-5 border border-stone-200/80 bg-[#FBF8F3] rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Download className="h-4 w-4 text-[#F05A22]" /> Exportation JSON
                      </h4>
                      <p className="text-xs text-stone-500 mt-1">Générez un fichier complet contenant l'ensemble de vos données (clients, mesures, commandes, factures).</p>
                    </div>
                    <button
                      type="button"
                      onClick={exportDatabase}
                      className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-[#F05A22] transition cursor-pointer"
                    >
                      Exporter les données
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-5 border border-stone-200/80 bg-[#FBF8F3] rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Upload className="h-4 w-4 text-[#F05A22]" /> Importer une sauvegarde
                      </h4>
                      <p className="text-xs text-stone-500 mt-1">Restaurer des données Fox Couture précédemment enregistrées à partir d'un fichier .json valide.</p>
                    </div>
                    <label className="w-full py-2.5 bg-white border border-stone-200 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-50 text-center cursor-pointer transition shadow-xs">
                      Choisir le fichier sauvegarde
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Reset */}
                  <div className="p-5 border border-rose-200 bg-rose-50/50 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <RotateCcw className="h-4 w-4" /> Remise à zéro
                      </h4>
                      <p className="text-xs text-rose-600/80 mt-1">Efface l'intégralité des données actuelles et rétablit les données de démonstration d'usine.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
                    >
                      Réinitialiser la base
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          {activeSubTab !== 'database' && (
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="btn-fox-primary !py-2.5 !px-6 flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Enregistrer les réglages
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
