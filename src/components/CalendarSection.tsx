/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { RendezVous, TypeRendezVous, StatutRendezVous } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';

export default function CalendarSection() {
  const { 
    rendezVous, 
    clients, 
    commandes, 
    addRendezVous, 
    updateRendezVous, 
    deleteRendezVous 
  } = useStore();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 5)); // July 5, 2026 (matching our workspace date)
  const [selectedDay, setSelectedDay] = useState<number | null>(6); // Default July 6 (has a fitting!)
  const [activeMobileView, setActiveMobileView] = useState<'calendar' | 'details'>('calendar');
  
  // Appointment Form Modal States
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [commandeId, setCommandeId] = useState('');
  const [rdvDate, setRdvDate] = useState('2026-07-06');
  const [rdvHeure, setRdvHeure] = useState('10:30');
  const [rdvType, setRdvType] = useState<TypeRendezVous>('essayage');
  const [rdvNotes, setRdvNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar Grid helper
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, ...
  
  // Align grid (starting on Monday is standard in Europe/Africa)
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getAppointmentsForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return rendezVous.filter(r => r.date === formattedDate);
  };

  // Build grid arrays
  const blanks = Array(adjustedFirstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...blanks, ...days];

  const selectedDayDateString = selectedDay 
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const selectedDayAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : [];

  const handleCreateRdv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !rdvDate || !rdvHeure) {
      alert('Veuillez spécifier un client, une date et une heure.');
      return;
    }

    addRendezVous({
      clientId,
      commandeId: commandeId || undefined,
      date: rdvDate,
      heure: rdvHeure,
      type: rdvType,
      notes: rdvNotes
    });

    setIsRdvModalOpen(false);
    
    // Auto-focus on scheduled day
    const scheduledDateObj = new Date(rdvDate);
    if (scheduledDateObj.getFullYear() === year && scheduledDateObj.getMonth() === month) {
      setSelectedDay(scheduledDateObj.getDate());
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile view tabs selector */}
      <div className="flex lg:hidden bg-white p-1 rounded-2xl border border-stone-200/60 shadow-xs">
        <button
          onClick={() => setActiveMobileView('calendar')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'calendar' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Calendrier Mensuel
        </button>
        <button
          onClick={() => setActiveMobileView('details')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'details' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Rendez-vous {selectedDay ? `(Jour ${selectedDay})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" id="rendezvous-calendar-section">
        {/* Column 1 & 2: Monthly Calendar Grid */}
        <div className={`lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/60 shadow-xs flex flex-col h-[700px] justify-between ${
          activeMobileView === 'calendar' ? 'flex' : 'hidden lg:flex'
        }`}>
        <div className="space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#191716] text-white rounded-2xl shadow-xs">
                <Calendar className="h-5 w-5 text-[#F05A22]" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#191716] tracking-tight font-display">
                  {monthNames[month]} {year}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Planification des essayages et des livraisons de l'atelier</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-stone-200/80 rounded-xl hover:bg-stone-50 text-stone-700 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(2026, 6, 5))}
                className="px-3 py-2 border border-stone-200/80 text-xs font-bold rounded-xl hover:bg-stone-50 text-stone-700 transition cursor-pointer"
              >
                Aujourd'hui
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border-2 border-black rounded-none hover:bg-black hover:text-white transition cursor-pointer"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Days of week labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="h-16 bg-white rounded-none border border-black/20"></div>;
              }

              const dayAppts = getAppointmentsForDay(day);
              const isSelected = selectedDay === day;
              
              // Highlight today (July 5, 2026)
              const isToday = day === 5 && month === 6 && year === 2026;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => {
                    setSelectedDay(day);
                    setActiveMobileView('details');
                  }}
                  className={`h-16 rounded-none border-2 flex flex-col justify-between p-2 relative group transition cursor-pointer ${
                    isSelected ? 'bg-atelier-beige border-black text-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
                    isToday ? 'bg-black border-black text-white' :
                    'bg-white border-zinc-200 hover:border-black hover:bg-zinc-100'
                  }`}
                >
                  <span className={`text-xs font-black font-mono ${
                    isSelected ? 'text-black font-extrabold' : isToday ? 'text-atelier-gold' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  
                  {/* Miniature appointment tags indicator */}
                  {dayAppts.length > 0 && (
                    <div className="flex gap-1 overflow-hidden w-full mt-1">
                      {dayAppts.slice(0, 3).map(apt => (
                        <span 
                          key={apt.id} 
                          className={`w-2.5 h-2.5 rounded-none border border-black inline-block ${
                            apt.type === 'essayage' ? 'bg-indigo-500' :
                            apt.type === 'mesure' ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          title={`${apt.type.toUpperCase()} : ${apt.heure}`}
                        ></span>
                      ))}
                      {dayAppts.length > 3 && (
                        <span className="text-[7px] font-black text-slate-800 leading-none">+{dayAppts.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Small legend */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600 border-t-2 border-black pt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-none border border-black bg-amber-500 inline-block"></span> Mesure
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-none border border-black bg-indigo-500 inline-block"></span> Essayage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-none border border-black bg-emerald-500 inline-block"></span> Livraison
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <span className="inline-block w-3 h-3 border-2 border-black bg-atelier-beige rounded-none"></span> Sélectionné
          </span>
        </div>
      </div>

      {/* Column 3: Day Appointments details & Add Action */}
      <div className={`lg:col-span-1 bg-white rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[700px] justify-between ${
        activeMobileView === 'details' ? 'flex' : 'hidden lg:flex'
      }`}>
        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Back Button on Mobile */}
          <div className="block lg:hidden mb-4">
            <button
              onClick={() => setActiveMobileView('calendar')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              ← Retour au calendrier mensuel
            </button>
          </div>
          {/* Day Title */}
          <div className="flex justify-between items-center pb-3 border-b-2 border-black">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950 font-display">
                {selectedDay 
                  ? `Le ${String(selectedDay).padStart(2, '0')} / ${String(month + 1).padStart(2, '0')}` 
                  : 'SÉLECTIONNEZ'}
              </h3>
              <p className="text-xs font-serif italic text-slate-500">
                {selectedDayAppointments.length} RDV programmés
              </p>
            </div>
            
            <button 
              onClick={() => {
                if(selectedDay) {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                  setRdvDate(dateStr);
                }
                setClientId(clients[0]?.id || '');
                setCommandeId('');
                setRdvHeure('10:30');
                setRdvType('essayage');
                setRdvNotes('');
                setIsRdvModalOpen(true);
              }}
              className="p-2.5 bg-atelier-gold text-slate-950 rounded-none border-2 border-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="Planifier un rendez-vous"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Appointments list */}
          {selectedDay && selectedDayAppointments.length > 0 ? (
            <div className="space-y-4">
              {selectedDayAppointments.map(appt => {
                const client = clients.find(c => c.id === appt.clientId);
                const order = appt.commandeId ? commandes.find(c => c.id === appt.commandeId) : null;
                
                return (
                  <div key={appt.id} className="p-4 rounded-none border-2 border-black bg-white space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-black" />
                        <span className="text-xs font-black font-mono text-slate-950">{appt.heure}</span>
                      </div>
                      
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none border border-black ${
                        appt.type === 'essayage' ? 'bg-indigo-600 text-white' :
                        appt.type === 'mesure' ? 'bg-amber-500 text-slate-950' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {appt.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-display">
                        {client ? `${client.prenom} ${client.nom}` : 'Client Inconnu'}
                      </h4>
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                        {client?.telephone}
                      </p>
                      {order && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider text-slate-950 bg-white border border-black px-1.5 py-0.5 rounded-none mt-1">
                          Commande : {order.reference} ({order.modeleNom})
                        </span>
                      )}
                    </div>

                    {appt.notes && (
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-none border border-black leading-relaxed italic font-serif">
                        "{appt.notes}"
                      </p>
                    )}

                    {/* Change Status & Actions of appointment */}
                    <div className="pt-2.5 border-t border-dashed border-black/40 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        {appt.statut === 'planifie' ? (
                          <>
                            <button
                              onClick={() => updateRendezVous({ ...appt, statut: 'effectue' })}
                              className="px-2 py-1 bg-emerald-500 text-white hover:bg-black rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-0.5 border border-black cursor-pointer"
                            >
                              <CheckCircle className="h-3 w-3" /> Effectué
                            </button>
                            <button
                              onClick={() => updateRendezVous({ ...appt, statut: 'annule' })}
                              className="px-2 py-1 bg-white text-slate-950 hover:bg-black hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-0.5 border border-black cursor-pointer"
                            >
                              <XCircle className="h-3 w-3" /> Annuler
                            </button>
                          </>
                        ) : (
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none border border-black ${
                            appt.statut === 'effectue' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {appt.statut === 'effectue' ? 'Effectué' : 'Annulé'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Supprimer ce rendez-vous de l\'agenda ?')) deleteRendezVous(appt.id);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-black hover:text-white rounded-none border border-transparent hover:border-black transition cursor-pointer"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-black rounded-none bg-white">
              <Calendar className="h-9 w-9 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-black uppercase tracking-widest">Aucun rendez-vous</p>
              <p className="text-[10px] font-serif italic text-slate-500 mt-1">Planifiez-en un avec le "+" ci-dessus.</p>
            </div>
          )}
        </div>

        {/* Small tips panel */}
        <div className="p-3.5 rounded-none bg-atelier-beige border-2 border-black mt-4 flex items-start gap-2.5">
          <Info className="h-4.5 w-4.5 text-slate-950 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] font-serif italic text-slate-800 leading-relaxed">
            Astuce : Les notifications automatiques rappellent aux clients leurs essayages par SMS/E-mail 24h avant le rendez-vous.
          </p>
        </div>
      </div>

      {/* MODAL: APPOINTMENT CREATE FORM */}
      {isRdvModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-md w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-6 font-display">
              Planifier un Rendez-vous Client
            </h3>

            <form onSubmit={handleCreateRdv} className="space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Sélectionner un Client *</label>
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

              {/* Related Order link */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Commande concernée (Optionnel)</label>
                <select
                  value={commandeId}
                  onChange={(e) => setCommandeId(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none"
                >
                  <option value="">Aucune commande ou prise de mesure initiale</option>
                  {commandes
                    .filter(c => c.clientId === clientId && c.statut !== 'livre')
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.modeleNom.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date & Hour row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={rdvDate}
                    onChange={(e) => setRdvDate(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Heure *</label>
                  <input
                    type="time"
                    required
                    value={rdvHeure}
                    onChange={(e) => setRdvHeure(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Appointment Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Type de rendez-vous *</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'mesure', label: 'Prise Mesure' },
                    { key: 'essayage', label: 'Essayage' },
                    { key: 'livraison', label: 'Livraison' }
                  ] as { key: TypeRendezVous; label: string }[]).map(type => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setRdvType(type.key)}
                      className={`p-2 text-center rounded-none text-[10px] font-black uppercase tracking-widest border-2 border-black transition cursor-pointer ${
                        rdvType === type.key 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white border-black text-slate-950 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Instructions / Observations</label>
                <input
                  type="text"
                  value={rdvNotes}
                  onChange={(e) => setRdvNotes(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Prendre l'acompte restant dû de 150,000 FCFA..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsRdvModalOpen(false)}
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
    </div>
  );
}
