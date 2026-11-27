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
                className="p-2 border border-stone-200/80 rounded-xl hover:bg-stone-50 text-stone-700 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-stone-500 font-mono">
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
                return <div key={`blank-${idx}`} className="h-16 bg-stone-50/50 rounded-2xl border border-stone-100"></div>;
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
                  className={`h-16 rounded-2xl border flex flex-col justify-between p-2 relative group transition cursor-pointer ${
                    isSelected ? 'bg-orange-50 border-[#F05A22] text-stone-900 shadow-xs ring-2 ring-[#F05A22]/20' :
                    isToday ? 'bg-stone-900 border-stone-900 text-white' :
                    'bg-white border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-xs font-bold font-mono ${
                    isSelected ? 'text-[#F05A22]' : isToday ? 'text-[#F05A22]' : 'text-stone-700'
                  }`}>
                    {day}
                  </span>
                  
                  {/* Miniature appointment tags indicator */}
                  {dayAppts.length > 0 && (
                    <div className="flex gap-1 overflow-hidden w-full mt-1">
                      {dayAppts.slice(0, 3).map(apt => (
                        <span 
                          key={apt.id} 
                          className={`w-2 h-2 rounded-full inline-block ${
                            apt.type === 'essayage' ? 'bg-indigo-500' :
                            apt.type === 'mesure' ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          title={`${apt.type} : ${apt.heure}`}
                        ></span>
                      ))}
                      {dayAppts.length > 3 && (
                        <span className="text-[9px] font-bold text-stone-700 leading-none">+{dayAppts.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Small legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-500 border-t border-stone-100 pt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Mesure
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Essayage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Livraison
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F05A22]"></span> Sélectionné
          </span>
        </div>
      </div>

      {/* Column 3: Day Appointments details & Add Action */}
      <div className={`lg:col-span-1 bg-white rounded-3xl p-6 border border-stone-200/60 shadow-xs flex flex-col h-[700px] justify-between ${
        activeMobileView === 'details' ? 'flex' : 'hidden lg:flex'
      }`}>
        <div className="space-y-5 flex-1 overflow-y-auto">
          {/* Back Button on Mobile */}
          <div className="block lg:hidden mb-4">
            <button
              onClick={() => setActiveMobileView('calendar')}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
            >
              ← Retour au calendrier mensuel
            </button>
          </div>
          {/* Day Title */}
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {selectedDay 
                  ? `Le ${String(selectedDay).padStart(2, '0')} / ${String(month + 1).padStart(2, '0')}` 
                  : 'Sélectionnez un jour'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedDayAppointments.length} rendez-vous programmé(s)
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
              className="p-2 bg-[#F05A22] text-white rounded-xl hover:bg-[#d94e1b] transition shadow-xs cursor-pointer"
              title="Planifier un rendez-vous"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Appointments list */}
          {selectedDay && selectedDayAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDayAppointments.map(appt => {
                const client = clients.find(c => c.id === appt.clientId);
                const order = appt.commandeId ? commandes.find(c => c.id === appt.commandeId) : null;
                
                return (
                  <div key={appt.id} className="p-4 rounded-2xl border border-stone-200/80 bg-[#FBF8F3] space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#F05A22]" />
                        <span className="text-xs font-bold font-mono text-stone-900">{appt.heure}</span>
                      </div>
                      
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        appt.type === 'essayage' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                        appt.type === 'mesure' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {appt.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {client?.telephone}
                      </p>
                      {order && (
                        <span className="inline-block text-[11px] font-medium text-stone-700 bg-white border border-stone-200/80 px-2 py-0.5 rounded-lg mt-1.5">
                          Commande : {order.reference} ({order.modeleNom})
                        </span>
                      )}
                    </div>

                    {appt.notes && (
                      <p className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/60 leading-relaxed italic">
                        "{appt.notes}"
                      </p>
                    )}

                    {/* Change Status & Actions of appointment */}
                    <div className="pt-2.5 border-t border-stone-200/60 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        {appt.statut === 'planifie' ? (
                          <>
                            <button
                              onClick={() => updateRendezVous({ ...appt, statut: 'effectue' })}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200/80 transition cursor-pointer"
                            >
                              <CheckCircle className="h-3 w-3" /> Effectué
                            </button>
                            <button
                              onClick={() => updateRendezVous({ ...appt, statut: 'annule' })}
                              className="px-2.5 py-1 bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 border border-stone-200/80 transition cursor-pointer"
                            >
                              <XCircle className="h-3 w-3" /> Annuler
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            appt.statut === 'effectue' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {appt.statut === 'effectue' ? 'Effectué' : 'Annulé'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Supprimer ce rendez-vous de l\'agenda ?')) deleteRendezVous(appt.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
            <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200/80 rounded-2xl bg-white">
              <Calendar className="h-9 w-9 mx-auto mb-2 opacity-50 text-stone-300" />
              <p className="text-xs font-semibold text-stone-500">Aucun rendez-vous</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Planifiez-en un avec le bouton "+" ci-dessus.</p>
            </div>
          )}
        </div>

        {/* Small tips panel */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 mt-4 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="h-4 w-4 text-[#F05A22] mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            Astuce : Les notifications automatiques rappellent aux clients leurs essayages par SMS/WhatsApp avant le rendez-vous.
          </p>
        </div>
      </div>

      {/* MODAL: APPOINTMENT CREATE FORM */}
      {isRdvModalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl max-w-md w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-5">
              Planifier un rendez-vous client
            </h3>

            <form onSubmit={handleCreateRdv} className="space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Sélectionner un client *</label>
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

              {/* Related Order link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Commande concernée (Optionnel)</label>
                <select
                  value={commandeId}
                  onChange={(e) => setCommandeId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                >
                  <option value="">Aucune commande ou prise de mesure initiale</option>
                  {commandes
                    .filter(c => c.clientId === clientId && c.statut !== 'livre')
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.modeleNom}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date & Hour row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={rdvDate}
                    onChange={(e) => setRdvDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Heure *</label>
                  <input
                    type="time"
                    required
                    value={rdvHeure}
                    onChange={(e) => setRdvHeure(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>
              </div>

              {/* Appointment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Type de rendez-vous *</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'mesure', label: 'Prise mesure' },
                    { key: 'essayage', label: 'Essayage' },
                    { key: 'livraison', label: 'Livraison' }
                  ] as { key: TypeRendezVous; label: string }[]).map(type => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setRdvType(type.key)}
                      className={`py-2 text-center rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        rdvType === type.key 
                          ? 'bg-stone-900 text-white border-stone-900' 
                          : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Instructions / Observations</label>
                <input
                  type="text"
                  value={rdvNotes}
                  onChange={(e) => setRdvNotes(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="Prendre l'acompte restant dû de 150,000 FCFA..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRdvModalOpen(false)}
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
    </div>
  );
}
