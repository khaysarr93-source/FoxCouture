/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Tissu, Fournisseur } from '../types';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit, 
  User, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Search, 
  Sparkles, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUpRight 
} from 'lucide-react';

export default function StockSection() {
  const { 
    tissus, 
    fournisseurs, 
    addTissu, 
    updateTissu, 
    deleteTissu, 
    adjustTissuStock,
    addFournisseur,
    updateFournisseur,
    deleteFournisseur,
    formatPrice
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'tissus' | 'fournisseurs'>('tissus');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Tissu Form States
  const [isTissuModalOpen, setIsTissuModalOpen] = useState(false);
  const [editingTissu, setEditingTissu] = useState<Tissu | null>(null);
  const [tissuRef, setTissuRef] = useState('');
  const [designation, setDesignation] = useState('');
  const [couleur, setCouleur] = useState('');
  const [quantiteDisponible, setQuantiteDisponible] = useState<number>(10);
  const [seuilAlerte, setSeuilAlerte] = useState<number>(5);
  const [prixAchat, setPrixAchat] = useState<number>(10000);
  const [fournisseurId, setFournisseurId] = useState('');
  const [categorie, setCategorie] = useState<'tissu' | 'bouton' | 'fermeture' | 'fil' | 'elastic' | 'accessoire_divers'>('tissu');
  const [unite, setUnite] = useState('m');

  // Fournisseur Form States
  const [isFournModalOpen, setIsFournModalOpen] = useState(false);
  const [editingFourn, setEditingFourn] = useState<Fournisseur | null>(null);
  const [fournNom, setFournNom] = useState('');
  const [fournContact, setFournContact] = useState('');
  const [fournPhone, setFournPhone] = useState('');
  const [fournEmail, setFournEmail] = useState('');
  const [fournAdresse, setFournAdresse] = useState('');

  // Search and Category filters
  const filteredTissus = tissus.filter(t => {
    const matchesSearch = 
      t.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.couleur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const itemCategory = t.categorie || 'tissu';
    const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const filteredFournisseurs = fournisseurs.filter(f => 
    f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTissuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tissuRef || !designation || !couleur || !fournisseurId) {
      alert('Veuillez remplir toutes les informations requises.');
      return;
    }

    const payload = {
      reference: tissuRef,
      designation,
      couleur,
      quantiteDisponible: Number(quantiteDisponible),
      unite: unite || 'm',
      seuilAlerte: Number(seuilAlerte),
      prixAchat: Number(prixAchat),
      fournisseurId,
      categorie: categorie || 'tissu'
    };

    if (editingTissu) {
      updateTissu({
        ...editingTissu,
        ...payload
      });
    } else {
      addTissu(payload);
    }
    setIsTissuModalOpen(false);
  };

  const handleFournSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournNom || !fournPhone) {
      alert('Veuillez remplir le nom du fournisseur et son téléphone.');
      return;
    }

    const payload = {
      nom: fournNom,
      contact: fournContact,
      telephone: fournPhone,
      email: fournEmail,
      adresse: fournAdresse
    };

    if (editingFourn) {
      updateFournisseur({
        ...editingFourn,
        ...payload
      });
    } else {
      addFournisseur(payload);
    }
    setIsFournModalOpen(false);
  };

  const formatFCFA = (val: number) => {
    return formatPrice(val);
  };

  return (
    <div className="space-y-6" id="stock-supp-section">
      {/* Sub Tabs Controller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs">
        <div className="flex items-center gap-1.5 bg-[#FBF8F3] p-1.5 rounded-2xl border border-stone-200/60">
          <button
            onClick={() => { setActiveSubTab('tissus'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeSubTab === 'tissus' ? 'bg-[#191716] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            Tissus & Fournitures ({tissus.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('fournisseurs'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeSubTab === 'fournisseurs' ? 'bg-[#191716] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            Fournisseurs ({fournisseurs.length})
          </button>
        </div>

        {/* Search and Action Row */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
            <input 
              type="text"
              placeholder={activeSubTab === 'tissus' ? 'Rechercher tissu, réf...' : 'Rechercher fournisseur...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
            />
          </div>

          {activeSubTab === 'tissus' ? (
            <button
              onClick={() => {
                setEditingTissu(null);
                setTissuRef('');
                setDesignation('');
                setCouleur('');
                setQuantiteDisponible(15);
                setSeuilAlerte(5);
                setPrixAchat(12000);
                setFournisseurId(fournisseurs[0]?.id || '');
                setCategorie('tissu');
                setUnite('m');
                setIsTissuModalOpen(true);
              }}
              className="btn-fox-primary text-xs"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Nouveau Tissu
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingFourn(null);
                setFournNom('');
                setFournContact('');
                setFournPhone('');
                setFournEmail('');
                setFournAdresse('');
                setIsFournModalOpen(true);
              }}
              className="btn-fox-primary text-xs"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Nouveau Fournisseur
            </button>
          )}
        </div>
      </div>

      {/* TISSUS TAB PANEL */}
      {activeSubTab === 'tissus' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 border border-stone-200/60 rounded-2xl shadow-xs">
            <span className="text-xs font-semibold text-stone-400 mr-2 block w-full sm:w-auto">Filtrer :</span>
            {[
              { id: 'all', label: 'Tout' },
              { id: 'tissu', label: 'Tissus' },
              { id: 'bouton', label: 'Boutons' },
              { id: 'fermeture', label: 'Fermetures' },
              { id: 'fil', label: 'Fils' },
              { id: 'elastic', label: 'Élastiques' },
              { id: 'accessoire_divers', label: 'Autres' }
            ].map(cat => {
              const count = cat.id === 'all' 
                ? tissus.length 
                : tissus.filter(t => (t.categorie || 'tissu') === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    categoryFilter === cat.id 
                      ? 'bg-stone-900 text-white shadow-xs' 
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {filteredTissus.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-stone-200 text-center shadow-xs">
              <p className="text-xs font-semibold text-stone-500">Aucun élément trouvé pour cette catégorie ou recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTissus.map(t => {
                const lowStock = t.quantiteDisponible <= t.seuilAlerte;
                const supplier = fournisseurs.find(f => f.id === t.fournisseurId);
                const itemCategory = t.categorie || 'tissu';
                
                // Percentage visual calculation for graphic progress bar
                const maxScale = itemCategory === 'tissu' ? 30 : 150; // Adjust standard cap for progress display based on type
                const progressPercent = Math.min(100, (t.quantiteDisponible / maxScale) * 100);

                return (
                  <div key={t.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-4">
                      {/* Badge & Ref */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                            REF: {t.reference}
                          </span>
                          <span className="text-[10px] font-semibold bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-full text-stone-600">
                            {itemCategory === 'bouton' ? 'Bouton' :
                             itemCategory === 'fermeture' ? 'Fermeture' :
                             itemCategory === 'fil' ? 'Fil' :
                             itemCategory === 'elastic' ? 'Élastique' :
                             itemCategory === 'accessoire_divers' ? 'Accessoire' : 'Tissu'}
                          </span>
                        </div>
                        
                        {lowStock ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <AlertTriangle className="h-3 w-3" /> Stock bas
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          {t.designation}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">Teinte / Spécif. : <span className="font-semibold text-stone-800">{t.couleur}</span></p>
                      </div>

                      {/* Stock level bar */}
                      <div className="space-y-2 bg-[#FBF8F3] p-3.5 rounded-2xl border border-stone-200/60">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-stone-500">Stock dispo :</span>
                          <span className={`font-mono font-bold ${lowStock ? 'text-rose-600' : 'text-stone-900'}`}>
                            {t.quantiteDisponible} {t.unite || 'm'}
                          </span>
                        </div>
                        
                        <div className="h-2 w-full bg-stone-200/70 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressPercent}%` }} 
                            className={`h-full rounded-full transition-all duration-300 ${
                              lowStock ? 'bg-rose-500' : 'bg-[#F05A22]'
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-stone-500">
                          <span>Seuil : {t.seuilAlerte} {t.unite || 'm'}</span>
                          <span>Prix : {formatFCFA(t.prixAchat)} / {t.unite || 'm'}</span>
                        </div>
                      </div>

                      {/* Supplier link */}
                      {supplier && (
                        <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                          <Briefcase className="h-3.5 w-3.5 text-stone-400" /> {supplier.nom}
                        </div>
                      )}
                    </div>

                    {/* Micro Adjust Stock Action */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustTissuStock(t.id, -1)}
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title={`Retirer 1 ${t.unite || 'm'}`}
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => adjustTissuStock(t.id, 1)}
                          className="p-1 text-stone-500 hover:text-[#F05A22] hover:bg-orange-50 rounded-lg transition cursor-pointer"
                          title={`Ajouter 1 ${t.unite || 'm'}`}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Edit Deletes */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingTissu(t);
                            setTissuRef(t.reference);
                            setDesignation(t.designation);
                            setCouleur(t.couleur);
                            setQuantiteDisponible(t.quantiteDisponible);
                            setSeuilAlerte(t.seuilAlerte);
                            setPrixAchat(t.prixAchat);
                            setFournisseurId(t.fournisseurId);
                            setCategorie(t.categorie || 'tissu');
                            setUnite(t.unite || 'm');
                            setIsTissuModalOpen(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Modifier l'article"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Voulez-vous supprimer cet article du stock ?')) deleteTissu(t.id);
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Supprimer l'article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FOURNISSEURS TAB PANEL */}
      {activeSubTab === 'fournisseurs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFournisseurs.map(f => (
            <div key={f.id} className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-stone-900">
                    {f.nom}
                  </h3>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingFourn(f);
                        setFournNom(f.nom);
                        setFournContact(f.contact);
                        setFournPhone(f.telephone);
                        setFournEmail(f.email);
                        setFournAdresse(f.adresse);
                        setIsFournModalOpen(true);
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if(window.confirm('Supprimer ce fournisseur ?')) deleteFournisseur(f.id);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {f.contact && (
                  <p className="text-xs text-stone-500">Contact : <span className="font-semibold text-stone-800">{f.contact}</span></p>
                )}

                {/* Details Contacts */}
                <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2 text-stone-600 font-mono">
                    <Phone className="h-3.5 w-3.5 text-[#F05A22]" />
                    <a href={`tel:${f.telephone}`} className="font-semibold hover:underline text-stone-800">{f.telephone}</a>
                  </div>
                  {f.email && (
                    <div className="flex items-center gap-2 text-stone-600 font-mono">
                      <Mail className="h-3.5 w-3.5 text-[#F05A22]" />
                      <span>{f.email}</span>
                    </div>
                  )}
                  {f.adresse && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <MapPin className="h-3.5 w-3.5 text-[#F05A22] shrink-0" />
                      <span className="truncate">{f.adresse}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: TISSU FORM */}
      {isTissuModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-5">
              {editingTissu ? "Modifier l'article" : 'Enregistrer un tissu ou une fourniture'}
            </h3>

            <form onSubmit={handleTissuSubmit} className="space-y-4">
              {/* Category & Unit Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Catégorie *</label>
                  <select
                    value={categorie}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setCategorie(val);
                      // Auto-suggestion of unit
                      if (val === 'tissu' || val === 'elastic') {
                        setUnite('m');
                      } else if (val === 'bouton' || val === 'fermeture') {
                        setUnite('pièces');
                      } else if (val === 'fil') {
                        setUnite('bobines');
                      } else {
                        setUnite('pièces');
                      }
                    }}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    required
                  >
                    <option value="tissu">Tissu (Mètres)</option>
                    <option value="bouton">Boutons</option>
                    <option value="fermeture">Fermetures Éclair</option>
                    <option value="fil">Fils de couture</option>
                    <option value="elastic">Bandes Élastiques</option>
                    <option value="accessoire_divers">Autres Fournitures</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Unité de mesure *</label>
                  <input
                    type="text"
                    required
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="ex: m, pièces, bobines..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Référence SKU *</label>
                  <input
                    type="text"
                    required
                    value={tissuRef}
                    onChange={(e) => setTissuRef(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="BAZ-099"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Désignation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="Nom du tissu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Teinte / Spécif. *</label>
                  <input
                    type="text"
                    required
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="Bleu Royal, Doré..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Prix Achat ({unite || 'unité'})
                  </label>
                  <input
                    type="number"
                    value={prixAchat}
                    onChange={(e) => setPrixAchat(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Qté disponible ({unite || 'unité'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quantiteDisponible}
                    onChange={(e) => setQuantiteDisponible(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Alerte seuil ({unite || 'unité'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={seuilAlerte}
                    onChange={(e) => setSeuilAlerte(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
              </div>

              {/* Supplier Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Fournisseur d'achat *</label>
                <select
                  value={fournisseurId}
                  onChange={(e) => setFournisseurId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  required
                >
                  <option value="">Sélectionner un fournisseur...</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsTissuModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-fox-primary !py-2.5"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FOURNISSEUR FORM */}
      {isFournModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-5">
              {editingFourn ? 'Modifier le fournisseur' : 'Créer un nouveau fournisseur'}
            </h3>

            <form onSubmit={handleFournSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Nom d'entreprise *</label>
                <input
                  type="text"
                  required
                  value={fournNom}
                  onChange={(e) => setFournNom(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="Établissements Diallo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Interlocuteur de contact</label>
                <input
                  type="text"
                  value={fournContact}
                  onChange={(e) => setFournContact(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="Moustapha Diallo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={fournPhone}
                    onChange={(e) => setFournPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="+221 77 543 21"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Adresse email</label>
                  <input
                    type="email"
                    value={fournEmail}
                    onChange={(e) => setFournEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="contact@diallotissus.sn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Adresse de l'entrepôt</label>
                <input
                  type="text"
                  value={fournAdresse}
                  onChange={(e) => setFournAdresse(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="Marché Sandaga, Dakar"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFournModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-fox-primary !py-2.5"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
