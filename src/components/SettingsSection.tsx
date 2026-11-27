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
  Store
} from 'lucide-react';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-4 gap-4 bg-white p-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-950 font-display flex items-center gap-2">
            ⚙️ Configuration Globale
          </h2>
          <p className="text-xs font-serif italic text-slate-500 mt-1">
            Gérez et personnalisez l'intégralité des paramètres de votre atelier Fox Couture.
          </p>
        </div>
        
        {successMsg && (
          <div className="px-4 py-2 bg-emerald-100 border-2 border-emerald-500 text-emerald-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce">
            <Check className="h-4 w-4" /> {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Subtabs */}
        <div className="flex flex-col gap-2 md:col-span-1">
          {tabsConfig.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`p-3 text-left border-2 border-black text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition cursor-pointer ${
                activeSubTab === subTab.id 
                  ? 'bg-black text-white shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1' 
                  : 'bg-white text-slate-950 hover:bg-atelier-beige shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5'
              }`}
            >
              {subTab.icon}
              <span>{subTab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Panel Box */}
        <form onSubmit={handleSave} className="md:col-span-3 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6 flex flex-col justify-between min-h-[500px]">
          
          <div className="flex-1">
            {/* SUBTAB: PROFILE */}
            {activeSubTab === 'profile' && (
              <div className="space-y-4">
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Building className="h-4.5 w-4.5 text-atelier-gold" /> Identité & Informations de l'Atelier
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Ces informations apparaissent sur vos factures, devis, fiches clients et reçus thermiques.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Nom de l'Atelier / Raison Sociale *</label>
                    <input
                      type="text"
                      required
                      value={formState.raisonSociale}
                      onChange={(e) => handleFieldChange('raisonSociale', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. FOX COUTURE"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Slogan / Description d'En-tête</label>
                    <input
                      type="text"
                      value={formState.slogan}
                      onChange={(e) => handleFieldChange('slogan', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. HAUTE COUTURE SUR-MESURE"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Numéro de Téléphone *</label>
                    <input
                      type="text"
                      required
                      value={formState.telephone}
                      onChange={(e) => handleFieldChange('telephone', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. +221 33 824 00 00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Numéro de Registre de Commerce / NINEA</label>
                    <input
                      type="text"
                      value={formState.ninea}
                      onChange={(e) => handleFieldChange('ninea', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. NINEA 004819472 M2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Adresse Email de l'Atelier</label>
                    <input
                      type="email"
                      value={formState.emailAtelier || ''}
                      onChange={(e) => handleFieldChange('emailAtelier', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. CONTACT@FOX-COUTURE.COM"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Site Internet / Instagram de l'Atelier</label>
                    <input
                      type="text"
                      value={formState.siteWebAtelier || ''}
                      onChange={(e) => handleFieldChange('siteWebAtelier', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. WWW.FOX-COUTURE.COM"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Adresse Physique de l'Atelier *</label>
                    <textarea
                      required
                      rows={2}
                      value={formState.adresse}
                      onChange={(e) => handleFieldChange('adresse', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50 resize-none"
                      placeholder="E.G. AVENUE CHEIKH ANTA DIOP, DAKAR, SÉNÉGAL"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: BILLING */}
            {activeSubTab === 'billing' && (
              <div className="space-y-4">
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Coins className="h-4.5 w-4.5 text-atelier-gold" /> Configurations de Facturation & Devises
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Adaptez la monnaie locale, l'application des taxes et les mentions légales obligatoires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Devise de l'Atelier (Symbole / Code) *</label>
                    <select
                      value={formState.devise}
                      onChange={(e) => handleFieldChange('devise', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none"
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
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Taux de TVA Applicable (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={formState.tauxTva}
                      onChange={(e) => handleFieldChange('tauxTva', Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. 18"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Acompte Requis par Défaut (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={formState.acomptePourcentDefaut ?? 30}
                      onChange={(e) => handleFieldChange('acomptePourcentDefaut', Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="E.G. 30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Moyen de Paiement Préféré *</label>
                    <select
                      value={formState.moyenPaiementDefaut || 'espèces'}
                      onChange={(e) => handleFieldChange('moyenPaiementDefaut', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none"
                    >
                      <option value="espèces">Espèces / Cash</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="wave">Wave Money</option>
                      <option value="virement">Virement Bancaire</option>
                      <option value="carte">Carte de Crédit</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Conditions Générales de Vente (Pied de Facture / Reçu) *</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.conditionsFacture}
                      onChange={(e) => handleFieldChange('conditionsFacture', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50 resize-none"
                      placeholder="Mentions légales à imprimer sur le ticket de caisse..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: MEASUREMENTS */}
            {activeSubTab === 'measurements' && (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Scissors className="h-4.5 w-4.5 text-atelier-gold" /> Mesures & Pipeline de Production
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Personnalisez les mensurations corporelles et les étapes du processus de confection.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* COLUMN 1: MEASUREMENTS */}
                  <div className="space-y-4">
                    <div className="bg-atelier-beige p-3 border-2 border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">
                        📐 Mensurations Corporelles Actives
                      </span>
                    </div>

                    <div className="bg-white p-4 border-2 border-black grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {Object.keys(formState.champsMesuresActifs).map((fieldKey) => {
                        const isChecked = formState.champsMesuresActifs[fieldKey];
                        const labelClean = fieldKey.replace(/_/g, ' ');
                        return (
                          <label 
                            key={fieldKey} 
                            className={`p-2 border-2 border-black flex items-center gap-2 cursor-pointer text-[9px] font-black uppercase tracking-wider transition ${
                              isChecked ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMeasureToggle(fieldKey)}
                              className="accent-black h-3.5 w-3.5 shrink-0"
                            />
                            <span className="truncate">{labelClean}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* ADD CUSTOM FIELD FORM */}
                    <div className="p-4 border-2 border-black bg-slate-50 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 block">
                        ➕ Créer un champ de mesure personnalisé
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomMeasureKey}
                          onChange={(e) => setNewCustomMeasureKey(e.target.value)}
                          placeholder="Ex: Longueur Gilet, Carrure Dos"
                          className="flex-1 bg-white border-2 border-black px-2.5 py-1.5 text-xs font-black uppercase tracking-widest focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomMeasureKey}
                          className="px-4 py-1.5 bg-black text-white border-2 border-black text-[9px] font-black uppercase tracking-wider hover:bg-atelier-gold hover:text-black transition cursor-pointer"
                        >
                          Créer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: DEFAULT PRODUCTION STEPS */}
                  <div className="space-y-4">
                    <div className="bg-atelier-beige p-3 border-2 border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">
                        ⚙️ Pipeline de Production par Défaut
                      </span>
                    </div>

                    <p className="text-[9px] font-serif text-slate-500">
                      Définissez la suite ordonnée des étapes pour chaque nouvelle commande créée.
                    </p>

                    <div className="border-2 border-black divide-y-2 divide-black max-h-[250px] overflow-y-auto bg-white">
                      {(formState.etapesDefaut && formState.etapesDefaut.length > 0) ? (
                        formState.etapesDefaut.map((step, idx) => (
                          <div key={idx} className="p-2 flex items-center justify-between bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-none bg-black text-white flex items-center justify-center text-[9px]">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkflowStep(idx)}
                              className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-2 border-transparent hover:border-black transition rounded-none cursor-pointer"
                              title="Retirer cette étape"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-[10px] text-slate-400 font-serif">
                          Aucune étape définie. Les commandes seront créées sans pipeline.
                        </div>
                      )}
                    </div>

                    {/* ADD WORKFLOW STEP FORM */}
                    <div className="p-4 border-2 border-black bg-slate-50 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 block">
                        ➕ Ajouter une étape de production
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newWorkflowStep}
                          onChange={(e) => setNewWorkflowStep(e.target.value)}
                          placeholder="Ex: Broderie, Perlage, Finitions"
                          className="flex-1 bg-white border-2 border-black px-2.5 py-1.5 text-xs font-black uppercase tracking-widest focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddWorkflowStep}
                          className="px-4 py-1.5 bg-black text-white border-2 border-black text-[9px] font-black uppercase tracking-wider hover:bg-atelier-gold hover:text-black transition cursor-pointer"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-amber-400 text-[10px] text-slate-800 font-serif flex gap-2 items-start mt-2">
                  <HelpCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    La désactivation de champs ou le retrait d'étapes ne modifient pas vos données déjà existantes en base, mais régissent les formulaires et créations futures pour coller à l'évolution de votre activité Fox Couture.
                  </span>
                </div>
              </div>
            )}

            {/* SUBTAB: SMS TEMPLATES */}
            {activeSubTab === 'sms' && (
              <div className="space-y-4">
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-atelier-gold" /> Modèles de Notifications SMS & WhatsApp
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Personnalisez les messages pré-rédigés pour un envoi instantané en un clic à vos clients.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">SMS : Création de Commande / Reçu Acompte</label>
                      <span className="text-[9px] font-mono text-slate-400">Variables: {`{client}`}, {`{reference}`}, {`{modele}`}, {`{montant}`}, {`{acompte}`}, {`{atelier}`}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsCommande || ''}
                      onChange={(e) => handleFieldChange('templateSmsCommande', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                      placeholder="Bonjour {client}, nous confirmons la création de votre commande {reference}..."
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">SMS : Vêtement Prêt en Boutique</label>
                      <span className="text-[9px] font-mono text-slate-400">Variables: {`{client}`}, {`{reference}`}, {`{modele}`}, {`{atelier}`}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsPret}
                      onChange={(e) => handleFieldChange('templateSmsPret', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">SMS : Rappel de Rendez-vous / Essayage</label>
                      <span className="text-[9px] font-mono text-slate-400">Variables: {`{client}`}, {`{type}`}, {`{date}`}, {`{heure}`}, {`{atelier}`}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.templateSmsRdv}
                      onChange={(e) => handleFieldChange('templateSmsRdv', e.target.value)}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: CAISSE & POINT DE VENTE */}
            {activeSubTab === 'pos' && (
              <div className="space-y-6">
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Store className="h-4.5 w-4.5 text-atelier-gold" /> Configurations Point de Vente & Caisse
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Personnalisez le fonctionnement de vos caisses tactiles et des encaissements physiques.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default starting fund */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Fond de caisse initial par défaut ({formState.devise}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formState.posFondDeCaisseDefaut ?? 50000}
                      onChange={(e) => handleFieldChange('posFondDeCaisseDefaut', Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50 font-mono font-bold"
                    />
                  </div>

                  {/* Auto print */}
                  <div className="p-4 bg-slate-50 border-2 border-black flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">Impression automatique du ticket</span>
                      <span className="text-[9px] text-slate-500 font-serif">Ouvre automatiquement la boîte de dialogue d'impression après encaissement.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.posImpressionAutoTicket ?? true}
                      onChange={(e) => handleFieldChange('posImpressionAutoTicket', e.target.checked)}
                      className="accent-black h-4 w-4 cursor-pointer"
                    />
                  </div>

                  {/* Allowed payment methods checkboxes */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="bg-atelier-beige p-3 border-2 border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">
                        💳 Modes de Règlement Acceptés au POS
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Cash */}
                      <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                        (formState.posModesPaiementActifs?.especes ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.especes ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, especes: e.target.checked });
                          }}
                          className="accent-black h-4 w-4 shrink-0"
                        />
                        <span>💵 Espèces</span>
                      </label>

                      {/* Mobile money */}
                      <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                        (formState.posModesPaiementActifs?.mobile_money ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.mobile_money ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, mobile_money: e.target.checked });
                          }}
                          className="accent-black h-4 w-4 shrink-0"
                        />
                        <span>📱 Mobile Money</span>
                      </label>

                      {/* Carte */}
                      <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                        (formState.posModesPaiementActifs?.carte ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.carte ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, carte: e.target.checked });
                          }}
                          className="accent-black h-4 w-4 shrink-0"
                        />
                        <span>💳 Carte Bancaire</span>
                      </label>

                      {/* Virement */}
                      <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                        (formState.posModesPaiementActifs?.virement ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formState.posModesPaiementActifs?.virement ?? true}
                          onChange={(e) => {
                            const current = formState.posModesPaiementActifs || { especes: true, mobile_money: true, virement: true, carte: true };
                            handleFieldChange('posModesPaiementActifs', { ...current, virement: e.target.checked });
                          }}
                          className="accent-black h-4 w-4 shrink-0"
                        />
                        <span>🏦 Virement</span>
                      </label>
                    </div>
                  </div>

                  {/* Ticket Customizations Section */}
                  <div className="md:col-span-2 space-y-3 pt-4 border-t border-dashed border-black/10">
                    <div className="bg-atelier-beige p-3 border-2 border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">
                        🎫 Personnalisation du Ticket Thermique
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ticket Header text */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Message d'En-tête (Bienvenue)</label>
                        <input
                          type="text"
                          value={formState.ticketEnTete || ''}
                          onChange={(e) => handleFieldChange('ticketEnTete', e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                          placeholder="BIENVENUE CHEZ FOX COUTURE"
                        />
                      </div>

                      {/* Ticket Remerciement */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Message de Remerciement (Pied)</label>
                        <input
                          type="text"
                          value={formState.ticketRemerciement || ''}
                          onChange={(e) => handleFieldChange('ticketRemerciement', e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                          placeholder="MERCI DE VOTRE CONFIANCE !"
                        />
                      </div>

                      {/* Ticket BasPage */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Message de Bas de Page (Slogan du Ticket)</label>
                        <input
                          type="text"
                          value={formState.ticketBasPage || ''}
                          onChange={(e) => handleFieldChange('ticketBasPage', e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                          placeholder="Maison Fox Couture, l'élégance à l'état pur."
                        />
                      </div>

                      {/* Ticket Width */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Largeur du Papier Thermique</label>
                        <select
                          value={formState.ticketLargeur || '80mm'}
                          onChange={(e) => handleFieldChange('ticketLargeur', e.target.value)}
                          className="w-full bg-white border-2 border-black p-2.5 text-xs font-black uppercase tracking-widest focus:outline-none"
                        >
                          <option value="80mm">80 mm (Format standard large)</option>
                          <option value="58mm">58 mm (Format compact étroit)</option>
                        </select>
                      </div>

                      {/* Show/Hide checks */}
                      <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2">
                        <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                          (formState.ticketAfficherNinea ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formState.ticketAfficherNinea ?? true}
                            onChange={(e) => handleFieldChange('ticketAfficherNinea', e.target.checked)}
                            className="accent-black h-4 w-4 shrink-0"
                          />
                          <span>Afficher le NINEA sur le ticket</span>
                        </label>

                        <label className={`p-3 border-2 border-black flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider transition ${
                          (formState.ticketAfficherSlogan ?? true) ? 'bg-amber-100/40' : 'bg-white text-zinc-400'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formState.ticketAfficherSlogan ?? true}
                            onChange={(e) => handleFieldChange('ticketAfficherSlogan', e.target.checked)}
                            className="accent-black h-4 w-4 shrink-0"
                          />
                          <span>Afficher le Slogan sur le ticket</span>
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
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-atelier-gold" /> Sauvegarde & Maintenance des Données
                  </h3>
                  <p className="text-[10px] font-serif text-slate-500 mt-0.5">Gérez la sécurité de votre base de données locale (exportations sécurisées, réinitialisations).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Export */}
                  <div className="p-4 border-2 border-black bg-white flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                        <Download className="h-4 w-4" /> Exportation JSON
                      </h4>
                      <p className="text-[10px] font-serif text-slate-500 mt-1">Générez un fichier complet contenant l'ensemble de vos données (clients, mesures, commandes, factures).</p>
                    </div>
                    <button
                      type="button"
                      onClick={exportDatabase}
                      className="w-full py-2 bg-slate-900 text-white rounded-none border-2 border-black text-[9px] font-black uppercase tracking-widest hover:bg-black transition cursor-pointer"
                    >
                      Exporter les données
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-4 border-2 border-black bg-white flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                        <Upload className="h-4 w-4" /> Importer une Sauvegarde
                      </h4>
                      <p className="text-[10px] font-serif text-slate-500 mt-1">Restaurer des données Fox Couture précédemment enregistrées à partir d'un fichier .json valide.</p>
                    </div>
                    <label className="w-full py-2 bg-atelier-gold text-slate-950 rounded-none border-2 border-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white text-center cursor-pointer transition">
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
                  <div className="p-4 border-2 border-red-500 bg-red-50 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                        <RotateCcw className="h-4 w-4" /> Remise à Zéro
                      </h4>
                      <p className="text-[10px] font-serif text-red-600 mt-1">Efface l'intégralité des données actuelles et rétablit les données de démonstration d'usine.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-2 bg-red-600 text-white rounded-none border-2 border-black text-[9px] font-black uppercase tracking-widest hover:bg-red-800 transition cursor-pointer"
                    >
                      Réinitialiser la base
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer (except on database tab, where actions are independent buttons) */}
          {activeSubTab !== 'database' && (
            <div className="pt-4 border-t-2 border-black flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(232,93,4,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition cursor-pointer flex items-center gap-2"
              >
                <Save className="h-4.5 w-4.5 text-atelier-gold" /> Enregistrer les Configurations
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
