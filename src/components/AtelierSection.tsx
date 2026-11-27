/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Commande, StatutCommande, Employe } from '../types';
import { 
  Layers, 
  User, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  PlayCircle, 
  Scissors, 
  Cpu, 
  Sparkles,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function AtelierSection() {
  const { 
    commandes, 
    clients, 
    employes, 
    updateEtapeProduction, 
    updateCommandeStatut 
  } = useStore();

  const [tailorFilter, setTailorFilter] = useState<string>('all');

  // Filter orders by active stages (exclude completed / cancelled if wanted, but standard is showing all active confections)
  const activeOrders = commandes.filter(c => c.statut !== 'livre' && c.statut !== 'annule');

  // Kanban Columns definition aligned with Cahier des Charges
  const columns = [
    { 
      key: 'coupe', 
      label: '1. Attente & Coupe', 
      matches: (s: StatutCommande) => s === 'attente' || s === 'devis' || s === 'confirmee' || s === 'en_coupe' 
    },
    { 
      key: 'assemblage', 
      label: '2. Assemblage / Couture', 
      matches: (s: StatutCommande) => s === 'production' || s === 'en_assemblage' 
    },
    { 
      key: 'essayage', 
      label: '3. Essayage Client', 
      matches: (s: StatutCommande) => s === 'essayage' 
    },
    { 
      key: 'pret', 
      label: '4. Confection Prête', 
      matches: (s: StatutCommande) => s === 'pret' 
    }
  ];

  const filteredOrders = activeOrders.filter(order => {
    if (tailorFilter === 'all') return true;
    // Check if the tailor is assigned to any of the order's steps
    return order.etapesProduction.some(step => step.responsableId === tailorFilter);
  });

  const getPercentageCompleted = (order: Commande) => {
    const total = order.etapesProduction.length;
    if (total === 0) return 0;
    const completed = order.etapesProduction.filter(s => s.statut === 'termine').length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6" id="atelier-production-section">
      {/* Upper Panel Filter & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-200/60 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#191716] font-display flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#F05A22]" /> Suivi de l'Atelier en Temps Réel
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">Gérez le plan de charge de vos couturiers et faites avancer les étapes de coupe et de couture</p>
        </div>

        {/* Tailor assignment filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
            <User className="h-4 w-4 text-stone-500" /> Couturier :
          </span>
          <select
            value={tailorFilter}
            onChange={(e) => setTailorFilter(e.target.value)}
            className="bg-[#FBF8F3] border border-stone-200/80 text-stone-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
          >
            <option value="all">TOUS LES COUTURIERS</option>
            {employes.filter(e => e.statut === 'actif').map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.prenom} {emp.nom} ({emp.chargeTravail} tâches)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map(col => {
          const colOrders = filteredOrders.filter(o => col.matches(o.statut));

          return (
            <div key={col.key} className="rounded-3xl p-5 border border-stone-200/60 bg-white shadow-xs flex flex-col min-h-[600px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <span className="text-xs font-extrabold text-[#191716] tracking-tight">
                  {col.label}
                </span>
                <span className="text-xs font-bold bg-[#FFEDE5] text-[#F05A22] px-2.5 py-0.5 rounded-full font-mono">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards List */}
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[580px] pr-1">
                {colOrders.length > 0 ? (
                  colOrders.map(order => {
                    const client = clients.find(c => c.id === order.clientId);
                    const percent = getPercentageCompleted(order);
                    
                    return (
                      <div 
                        key={order.id} 
                        className="bg-[#FBF8F3] hover:bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5 relative group"
                      >
                        {/* Title, Ref */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                              {order.reference}
                            </span>
                            <h4 className="text-xs font-extrabold text-[#191716] font-display mt-0.5">
                              {order.modeleNom}
                            </h4>
                          </div>
                        </div>

                        {/* Client name */}
                        <div className="flex items-center gap-2 text-xs text-slate-950 bg-atelier-beige p-2 rounded-none border border-black">
                          <div className={`w-6 h-6 rounded-none border border-black flex items-center justify-center font-black font-display text-[10px] ${client?.avatarColor}`}>
                            {client ? `${client.prenom[0]}${client.nom[0]}` : '??'}
                          </div>
                          <span className="font-black uppercase tracking-wider text-[10px]">{client ? `${client.prenom} ${client.nom}` : 'Client'}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest">
                            <span>Avancement</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-none border border-black overflow-hidden">
                            <div 
                              style={{ width: `${percent}%` }} 
                              className={`h-full rounded-none transition-all duration-300 ${
                                percent === 100 ? 'bg-emerald-500' : 'bg-atelier-gold'
                              }`}
                            ></div>
                          </div>
                        </div>

                        {/* Interactive Steps Tick List */}
                        <div className="pt-2 border-t-2 border-black space-y-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Étapes de fabrication :</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {order.etapesProduction.map(step => {
                              return (
                                <div
                                  key={step.id}
                                  className={`p-1.5 rounded-none border border-black flex flex-col justify-between h-[64px] transition-all ${
                                    step.statut === 'termine' ? 'bg-emerald-600 text-white' :
                                    step.statut === 'en_cours' ? 'bg-indigo-600 text-white animate-pulse' :
                                    'bg-white text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {/* Status Trigger Click Area */}
                                  <div
                                    onClick={() => {
                                      const nextStatut = 
                                        step.statut === 'a_faire' ? 'en_cours' :
                                        step.statut === 'en_cours' ? 'termine' : 'a_faire';
                                      
                                      updateEtapeProduction(order.id, step.id, { statut: nextStatut });
                                    }}
                                    className="flex-1 cursor-pointer select-none"
                                    title="Changer le statut de l'étape"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="capitalize block font-black leading-none truncate max-w-[80px] text-[9px]">{step.libelle}</span>
                                      <span className="text-[7px] opacity-75 font-mono">
                                        {step.statut === 'termine' ? '✓' : step.statut === 'en_cours' ? '●' : '○'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dropdown to change tailor assignment */}
                                  <select
                                    value={step.responsableId || ''}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      updateEtapeProduction(order.id, step.id, { responsableId: e.target.value });
                                    }}
                                    className={`text-[8px] font-black uppercase tracking-tight bg-transparent focus:outline-none w-full border-t border-dotted mt-1 pt-0.5 outline-none ${
                                      step.statut === 'termine' || step.statut === 'en_cours'
                                        ? 'text-white border-white/30'
                                        : 'text-slate-800 border-slate-300'
                                    }`}
                                  >
                                    <option value="" className="text-slate-950 font-sans">NON ASSIGNÉ</option>
                                    {employes.filter(e => e.statut === 'actif').map(emp => (
                                      <option key={emp.id} value={emp.id} className="text-slate-950 font-sans text-[10px]">
                                        {emp.prenom.toUpperCase()}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fast forward transition controls */}
                        <div className="pt-2 border-t-2 border-black flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono font-black text-[9px] uppercase tracking-wider">
                            Échéance: {order.delaiLivraison ? order.delaiLivraison.split('-').reverse().slice(0, 2).join('/') : 'N/A'}
                          </span>
                          
                          <div className="flex gap-1.5">
                            {(order.statut === 'attente' || order.statut === 'devis' || order.statut === 'confirmee' || order.statut === 'en_coupe') && (
                              <button 
                                onClick={() => updateCommandeStatut(order.id, 'en_assemblage')}
                                className="px-2 py-1 bg-atelier-gold text-slate-950 hover:bg-black hover:text-white border border-black rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
                                title="Passer en couture / assemblage"
                              >
                                Couture <ChevronRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                            {(order.statut === 'production' || order.statut === 'en_assemblage') && (
                              <button 
                                onClick={() => updateCommandeStatut(order.id, 'essayage')}
                                className="px-2 py-1 bg-indigo-600 text-white hover:bg-black border border-black rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
                                title="Convoquer pour essayage"
                              >
                                Essayage <ChevronRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                            {order.statut === 'essayage' && (
                              <button 
                                onClick={() => updateCommandeStatut(order.id, 'pret')}
                                className="px-2 py-1 bg-emerald-600 text-white hover:bg-black border border-black rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
                                title="Confection validée et prête pour retrait"
                              >
                                Prêt <ChevronRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                            {order.statut === 'pret' && (
                              <button 
                                onClick={() => updateCommandeStatut(order.id, 'livre')}
                                className="px-2 py-1 bg-black text-white hover:bg-emerald-600 border border-black rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
                                title="Marquer comme livré au client"
                              >
                                Livré <ChevronRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-black rounded-none bg-white">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-black uppercase tracking-widest">Aucun vêtement à ce stade</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
