/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Retouche, StatutRetouche } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  Search, 
  Calendar, 
  Coins,
  AlertCircle,
  Scissors
} from 'lucide-react';

export default function RetoucheSection() {
  const { 
    retouches, 
    clients, 
    commandes, 
    addRetouche, 
    updateRetoucheStatut, 
    deleteRetouche,
    formatPrice
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutRetouche | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [clientId, setClientId] = useState('');
  const [commandeId, setCommandeId] = useState('');
  const [description, setDescription] = useState('');
  const [delaiCible, setDelaiCible] = useState('');
  const [coutEstime, setCoutEstime] = useState<number>(0);

  const filteredRetouches = retouches.filter(r => {
    const client = clients.find(cl => cl.id === r.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : '';
    const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatut === 'all' || r.statut === filterStatut;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !description || !delaiCible) {
      alert('Veuillez remplir les informations obligatoires (Client, Description de retouche, Délai).');
      return;
    }

    addRetouche({
      clientId,
      commandeId: commandeId || undefined,
      description,
      delaiCible,
      coutEstime: Number(coutEstime),
      statut: 'a_faire'
    });

    setIsModalOpen(false);
    setClientId('');
    setCommandeId('');
    setDescription('');
    setDelaiCible('');
    setCoutEstime(0);
  };

  const formatFCFA = (val: number) => {
    return formatPrice(val);
  };

  return (
    <div className="space-y-6" id="retouche-sav-section">
      {/* Header and top stats bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-950 font-display flex items-center gap-2">
            <Wrench className="h-5 w-5 text-slate-950" /> Service Retouches & SAV d'Atelier
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Gérez les ajustements après-livraison demandés par vos clients et tenez vos engagements de qualité
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-atelier-gold text-slate-950 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="h-4.5 w-4.5" /> Enregistrer une Retouche
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-black" />
          <input 
            type="text"
            placeholder="RECHERCHER PAR CLIENT OU RETOUCHE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-none py-2 pl-9 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none"
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 self-start sm:self-auto">
          {([
            { key: 'all', label: 'Toutes' },
            { key: 'a_faire', label: 'À faire' },
            { key: 'en_cours', label: 'En cours' },
            { key: 'termine', label: 'Terminées' }
          ] as { key: StatutRetouche | 'all'; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatut(tab.key)}
              className={`px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-widest border-2 cursor-pointer transition ${
                filterStatut === tab.key 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-slate-500 border-black hover:bg-slate-100 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of alteration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRetouches.length > 0 ? (
          filteredRetouches.map(ret => {
            const client = clients.find(cl => cl.id === ret.clientId);
            const order = ret.commandeId ? commandes.find(co => co.id === ret.commandeId) : null;
            const isLate = ret.delaiCible ? (new Date(ret.delaiCible) < new Date() && ret.statut !== 'termine') : false;

            return (
              <div key={ret.id} className="bg-white rounded-none p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition">
                <div className="space-y-4">
                  {/* Card header status */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-black ${
                      ret.statut === 'termine' ? 'bg-emerald-400 text-slate-950 font-black' :
                      ret.statut === 'en_cours' ? 'bg-indigo-600 text-white font-black' :
                      'bg-slate-200 text-slate-950 font-black'
                    }`}>
                      {ret.statut === 'termine' ? 'Ajusté & Prêt' :
                       ret.statut === 'en_cours' ? 'En cours' : 'À faire'}
                    </span>

                    {isLate && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-white bg-rose-600 border border-black px-2 py-0.5 rounded-none flex items-center gap-0.5 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" /> RETARD !
                      </span>
                    )}
                  </div>

                  {/* Body description */}
                  <div className="space-y-1.5">
                    <p className="text-sm text-slate-950 font-black uppercase tracking-wide leading-relaxed">
                      "{ret.description}"
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-700 font-mono uppercase font-black">
                      <User className="h-4 w-4 text-black" /> Client : <span className="font-black text-slate-950">{client ? `${client.prenom} ${client.nom}` : 'N/A'}</span>
                    </div>

                    {order && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono mt-2 uppercase font-black">
                        <Scissors className="h-3.5 w-3.5 text-black" /> Vêtement : {order.reference} ({order.modeleNom})
                      </div>
                    )}
                  </div>

                  {/* Pricing and deadlines */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-none border-2 border-black text-xs mt-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block font-sans">Coût de retouche</span>
                      <strong className="text-slate-950 font-mono font-black mt-0.5 block">
                        {ret.coutEstime && ret.coutEstime > 0 ? formatFCFA(ret.coutEstime) : 'SAV GRATUIT'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block font-sans">Date de livraison</span>
                      <strong className="text-slate-950 font-mono font-black mt-0.5 block">
                        {ret.delaiCible ? ret.delaiCible.split('-').reverse().join('/') : 'NON DÉFINI'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Status selector triggers and Delete */}
                <div className="mt-5 pt-4 border-t-2 border-black flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'a_faire')}
                      className={`px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                        ret.statut === 'a_faire' ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-black text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      À faire
                    </button>
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'en_cours')}
                      className={`px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                        ret.statut === 'en_cours' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-black text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'termine')}
                      className={`px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                        ret.statut === 'termine' ? 'bg-emerald-400 border-black text-slate-950' : 'bg-white border-black text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Prêt !
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Retirer cette demande de retouche de l\'atelier ?')) deleteRetouche(ret.id);
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none border border-transparent hover:border-black transition cursor-pointer"
                    title="Supprimer la retouche"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Wrench className="h-10 w-10 mx-auto mb-2 opacity-60 text-slate-950" />
            <p className="text-xs font-black uppercase tracking-widest">Aucune retouche active correspondante</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD RETOUCHE REQUEST */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-md w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-6 font-display">
              Enregistrer une Demande de Retouche
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Client concerné *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none"
                  required
                >
                  <option value="">SÉLECTIONNER UN CLIENT...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.prenom.toUpperCase()} {c.nom.toUpperCase()} ({c.telephone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Related order selection if available */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Commande d'origine (Optionnel)</label>
                <select
                  value={commandeId}
                  onChange={(e) => setCommandeId(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none"
                >
                  <option value="">RETOUCHE ISOLÉE (SANS COMMANDE)</option>
                  {commandes
                    .filter(c => c.clientId === clientId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.modeleNom.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description Alteration detail */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Nature des retouches à effectuer *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none h-20"
                  placeholder="Ex: Raccourcir l'ourlet de la jambe gauche de 2cm, reprendre le cintrage veste..."
                />
              </div>

              {/* Pricing & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Frais de retouche (FCFA)</label>
                  <input
                    type="number"
                    value={coutEstime}
                    onChange={(e) => setCoutEstime(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                    placeholder="0 pour SAV Garantie"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Échéance de livraison *</label>
                  <input
                    type="date"
                    required
                    value={delaiCible}
                    onChange={(e) => setDelaiCible(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
