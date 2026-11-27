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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Wrench className="h-4.5 w-4.5 text-[#F05A22]" /> Service retouches & SAV d'atelier
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gérez les ajustements après-livraison demandés par vos clients et tenez vos engagements de qualité.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-fox-primary text-xs"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Enregistrer une retouche
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200/60 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Rechercher par client ou retouche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl py-2 pl-9 pr-4 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterStatut === tab.key 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs' 
                  : 'bg-stone-50 text-stone-600 border-transparent hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of alteration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRetouches.length > 0 ? (
          filteredRetouches.map(ret => {
            const client = clients.find(cl => cl.id === ret.clientId);
            const order = ret.commandeId ? commandes.find(co => co.id === ret.commandeId) : null;
            const isLate = ret.delaiCible ? (new Date(ret.delaiCible) < new Date() && ret.statut !== 'termine') : false;

            return (
              <div key={ret.id} className="card-fox rounded-3xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-4">
                  {/* Card header status */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      ret.statut === 'termine' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' :
                      ret.statut === 'en_cours' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80' :
                      'bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}>
                      {ret.statut === 'termine' ? 'Ajusté & Prêt' :
                       ret.statut === 'en_cours' ? 'En cours' : 'À faire'}
                    </span>

                    {isLate && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Retard
                      </span>
                    )}
                  </div>

                  {/* Body description */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-stone-900 leading-relaxed italic">
                      "{ret.description}"
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                      <User className="h-3.5 w-3.5 text-stone-400" /> Client : <span className="font-semibold text-stone-800">{client ? `${client.prenom} ${client.nom}` : 'N/A'}</span>
                    </div>

                    {order && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono mt-1">
                        <Scissors className="h-3 w-3 text-stone-400" /> Vêtement : {order.reference} ({order.modeleNom})
                      </div>
                    )}
                  </div>

                  {/* Pricing and deadlines */}
                  <div className="grid grid-cols-2 gap-3 bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/60 text-xs mt-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Coût retouche</span>
                      <strong className="text-stone-900 font-mono font-bold mt-0.5 block">
                        {ret.coutEstime && ret.coutEstime > 0 ? formatFCFA(ret.coutEstime) : 'SAV Gratuit'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block">Livraison cible</span>
                      <strong className="text-stone-900 font-mono font-bold mt-0.5 block">
                        {ret.delaiCible ? ret.delaiCible.split('-').reverse().join('/') : 'Non défini'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Status selector triggers and Delete */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'a_faire')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        ret.statut === 'a_faire' 
                          ? 'bg-stone-900 text-white shadow-xs' 
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      À faire
                    </button>
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'en_cours')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        ret.statut === 'en_cours' 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => updateRetoucheStatut(ret.id, 'termine')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        ret.statut === 'termine' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Prêt
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Retirer cette demande de retouche de l\'atelier ?')) deleteRetouche(ret.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Supprimer la retouche"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-stone-400 bg-white rounded-3xl border border-dashed border-stone-200">
            <Wrench className="h-9 w-9 mx-auto mb-2 opacity-40 text-stone-400" />
            <p className="text-xs font-semibold text-stone-500">Aucune retouche active correspondante</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD RETOUCHE REQUEST */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-5">
              Enregistrer une demande de retouche
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Client concerné *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  required
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom} ({c.telephone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Related order selection if available */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Commande d'origine (Optionnel)</label>
                <select
                  value={commandeId}
                  onChange={(e) => setCommandeId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                >
                  <option value="">Retouche isolée (sans commande)</option>
                  {commandes
                    .filter(c => c.clientId === clientId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.modeleNom}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description Alteration detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Nature des retouches à effectuer *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22] h-20"
                  placeholder="Ex: Raccourcir l'ourlet de la jambe gauche de 2cm, reprendre le cintrage veste..."
                />
              </div>

              {/* Pricing & Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Frais de retouche (FCFA)</label>
                  <input
                    type="number"
                    value={coutEstime}
                    onChange={(e) => setCoutEstime(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="0 pour SAV Garantie"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Échéance de livraison *</label>
                  <input
                    type="date"
                    required
                    value={delaiCible}
                    onChange={(e) => setDelaiCible(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-fox-primary !py-2.5"
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
