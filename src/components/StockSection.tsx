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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-none border-2 border-black">
          <button
            onClick={() => { setActiveSubTab('tissus'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-none transition cursor-pointer ${
              activeSubTab === 'tissus' ? 'bg-black text-white border-2 border-black' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tissus & Fournitures ({tissus.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('fournisseurs'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-none transition cursor-pointer ${
              activeSubTab === 'fournisseurs' ? 'bg-black text-white border-2 border-black' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Fournisseurs ({fournisseurs.length})
          </button>
        </div>

        {/* Search and Action Row */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-black" />
            <input 
              type="text"
              placeholder={activeSubTab === 'tissus' ? 'RECHERCHER TISSU, REF...' : 'RECHERCHER FOURNISSEUR...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none py-2 pl-9 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none"
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
              className="px-3.5 py-2 bg-atelier-gold text-slate-950 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-4 w-4" /> Enregistrer Tissu/Fourniture
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
              className="px-3.5 py-2 bg-atelier-gold text-slate-950 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-4 w-4" /> Nouveau Fournisseur
            </button>
          )}
        </div>
      </div>

      {/* TISSUS TAB PANEL */}
      {activeSubTab === 'tissus' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 block w-full sm:w-auto">Filtrer par catégorie :</span>
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
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black transition cursor-pointer ${
                    categoryFilter === cat.id 
                      ? 'bg-black text-white' 
                      : 'bg-transparent text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {filteredTissus.length === 0 ? (
            <div className="bg-white rounded-none p-12 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">Aucun élément trouvé pour cette catégorie ou recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTissus.map(t => {
                const lowStock = t.quantiteDisponible <= t.seuilAlerte;
                const supplier = fournisseurs.find(f => f.id === t.fournisseurId);
                const itemCategory = t.categorie || 'tissu';
                
                // Percentage visual calculation for graphic progress bar
                const maxScale = itemCategory === 'tissu' ? 30 : 150; // Adjust standard cap for progress display based on type
                const progressPercent = Math.min(100, (t.quantiteDisponible / maxScale) * 100);

                return (
                  <div key={t.id} className="bg-white rounded-none p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition">
                    <div className="space-y-4">
                      {/* Badge & Ref */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-mono font-black bg-black text-atelier-gold px-2 py-1 rounded-none border border-black">
                            REF: {t.reference}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-black px-1.5 py-0.5 text-slate-800">
                            {itemCategory === 'bouton' ? 'Bouton' :
                             itemCategory === 'fermeture' ? 'Fermeture' :
                             itemCategory === 'fil' ? 'Fil' :
                             itemCategory === 'elastic' ? 'Élastique' :
                             itemCategory === 'accessoire_divers' ? 'Accessoire' : 'Tissu'}
                          </span>
                        </div>
                        
                        {lowStock ? (
                          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-rose-600 border border-black px-2 py-0.5 rounded-none flex items-center gap-0.5 shrink-0">
                            <AlertTriangle className="h-3 w-3" /> STOCK BAS !
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-950 bg-emerald-400 border border-black px-2 py-0.5 rounded-none shrink-0">
                            DISP.
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 font-display">
                          {t.designation}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 uppercase font-mono">Teinte / Spécif. : <span className="font-black text-slate-950">{t.couleur}</span></p>
                      </div>

                      {/* Stock level bar */}
                      <div className="space-y-1.5 bg-white p-3 rounded-none border-2 border-black">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-slate-600 font-sans">Stock dispo :</span>
                          <span className={`font-mono font-black ${lowStock ? 'text-rose-600' : 'text-slate-950'}`}>
                            {t.quantiteDisponible} {t.unite || 'm'}
                          </span>
                        </div>
                        
                        <div className="h-3 w-full bg-slate-200 rounded-none border border-black overflow-hidden">
                          <div 
                            style={{ width: `${progressPercent}%` }} 
                            className={`h-full rounded-none transition-all duration-300 ${
                              lowStock ? 'bg-rose-600' : 'bg-atelier-gold'
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-600">
                          <span>Seuil : {t.seuilAlerte} {t.unite || 'm'}</span>
                          <span>Prix : {formatFCFA(t.prixAchat)} / {t.unite || 'm'}</span>
                        </div>
                      </div>

                      {/* Supplier link */}
                      {supplier && (
                        <div className="text-xs text-slate-600 flex items-center gap-1 font-mono uppercase font-black">
                          <Briefcase className="h-3.5 w-3.5 text-black" /> {supplier.nom}
                        </div>
                      )}
                    </div>

                    {/* Micro Adjust Stock Action */}
                    <div className="mt-5 pt-4 border-t-2 border-black flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustTissuStock(t.id, -1)}
                          className="p-1.5 text-black hover:bg-slate-100 transition cursor-pointer"
                          title={`Retirer 1 ${t.unite || 'm'}`}
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => adjustTissuStock(t.id, 1)}
                          className="p-1.5 text-black hover:bg-slate-100 transition cursor-pointer"
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
                          className="p-1.5 text-slate-800 hover:bg-slate-100 transition rounded-none cursor-pointer border border-transparent hover:border-black"
                          title="Modifier l'article"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Voulez-vous supprimer cet article du stock ?')) deleteTissu(t.id);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition rounded-none border border-transparent hover:border-black cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFournisseurs.map(f => (
            <div key={f.id} className="bg-white rounded-none p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 font-display">
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
                      className="p-1.5 text-slate-800 hover:bg-slate-100 rounded-none border border-transparent hover:border-black transition cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if(window.confirm('Supprimer ce fournisseur ?')) deleteFournisseur(f.id);
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none border border-transparent hover:border-black transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {f.contact && (
                  <p className="text-xs font-serif italic text-slate-700">Contact : <span className="font-sans font-black uppercase tracking-wider text-slate-950">{f.contact}</span></p>
                )}

                {/* Details Contacts */}
                <div className="space-y-2 pt-3 border-t-2 border-black text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-black" />
                    <a href={`tel:${f.telephone}`} className="font-bold hover:underline">{f.telephone}</a>
                  </div>
                  {f.email && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-black" />
                      <span>{f.email}</span>
                    </div>
                  )}
                  {f.adresse && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-black flex-shrink-0" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-md w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-6 font-display">
              {editingTissu ? "Modifier l'article" : 'Enregistrer un Tissu ou une Fourniture'}
            </h3>

            <form onSubmit={handleTissuSubmit} className="space-y-4">
              {/* Category & Unit Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Catégorie *</label>
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
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase focus:outline-none"
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Unité de Mesure *</label>
                  <input
                    type="text"
                    required
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none font-black"
                    placeholder="ex: m, pièces, bobines, boîtes..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Référence SKU *</label>
                  <input
                    type="text"
                    required
                    value={tissuRef}
                    onChange={(e) => setTissuRef(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                    placeholder="BAZ-099"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Désignation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                    placeholder="Nom du tissu ou de la fourniture"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Teinte / Spécif. *</label>
                  <input
                    type="text"
                    required
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                    placeholder="Bleu Royal, Doré, Invisible 50cm..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    Prix Achat (par {unite || 'unité'}, FCFA)
                  </label>
                  <input
                    type="number"
                    value={prixAchat}
                    onChange={(e) => setPrixAchat(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    Qté disponible ({unite || 'unité'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quantiteDisponible}
                    onChange={(e) => setQuantiteDisponible(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    Alerte Seuil ({unite || 'unité'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={seuilAlerte}
                    onChange={(e) => setSeuilAlerte(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Supplier Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Fournisseur d'achat *</label>
                <select
                  value={fournisseurId}
                  onChange={(e) => setFournisseurId(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none"
                  required
                >
                  <option value="">SÉLECTIONNER UN FOURNISSEUR...</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsTissuModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-md w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-6 font-display">
              {editingFourn ? 'Modifier le Fournisseur' : 'Créer un Nouveau Fournisseur'}
            </h3>

            <form onSubmit={handleFournSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Nom d'entreprise *</label>
                <input
                  type="text"
                  required
                  value={fournNom}
                  onChange={(e) => setFournNom(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Établissements Diallo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Interlocuteur de contact</label>
                <input
                  type="text"
                  value={fournContact}
                  onChange={(e) => setFournContact(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Moustapha Diallo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={fournPhone}
                    onChange={(e) => setFournPhone(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                    placeholder="+221 77 543 21"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Adresse Email</label>
                  <input
                    type="email"
                    value={fournEmail}
                    onChange={(e) => setFournEmail(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                    placeholder="contact@diallotissus.sn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Adresse de l'entrepôt</label>
                <input
                  type="text"
                  value={fournAdresse}
                  onChange={(e) => setFournAdresse(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Marché Sandaga, Dakar"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsFournModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
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
