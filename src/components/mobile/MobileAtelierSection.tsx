import React, { useState } from 'react';
import { useStore } from '../../store';
import { Client, Commande } from '../../types';
import { 
  Search, 
  Bell, 
  Phone, 
  X, 
  Plus, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface MobileAtelierSectionProps {
  onSelectCommande: (commande: Commande) => void;
  onSelectClient?: (client: Client) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MobileAtelierSection: React.FC<MobileAtelierSectionProps> = ({
  onSelectCommande,
  onSelectClient,
  onNavigateToTab
}) => {
  const { clients, commandes, employes, settings } = useStore();
  
  // State for "Choisir une cliente" modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current active artisan/tailor name (e.g. Modou)
  const mainTailor = employes.find(e => e.role === 'coupeur' || e.role === 'maitre_tailleur') || employes[0];
  const tailorName = mainTailor ? mainTailor.prenom : 'Modou';

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) return 'Bonsoir';
    return 'Bonjour';
  };

  const currentDateFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Metrics
  const countEnCours = commandes.filter(c => c.statut === 'production').length;
  const countEssayages = commandes.filter(c => c.statut === 'pret').length;
  const countALivrer = commandes.filter(c => c.statut === 'attente').length;

  // Filter clients for bottom sheet
  const filteredClients = clients.filter(c => 
    `${c.prenom} ${c.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telephone.includes(searchQuery)
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-zinc-950 pb-28 text-slate-900 dark:text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with photo/initials */}
          <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden border-2 border-white dark:border-zinc-700 shadow-xs flex items-center justify-center text-slate-700 font-bold">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
              alt="Tailleur" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              {tailorName.substring(0, 2).toUpperCase()}
            </span>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {settings.raisonSociale || 'ATELIER TERANGA'}
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {getGreeting()}, <span className="font-serif italic text-blue-600 dark:text-blue-400">{tailorName}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
              {currentDateFormatted}
            </div>
          </div>
        </div>

        {/* Action icons: Search & Notifications */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsClientModalOpen(true)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 mt-2">
        {/* Hero Card with Royal Senegalese Kaftan Graphic */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 shadow-lg border border-slate-800 flex items-center justify-between min-h-[150px]">
          <div className="space-y-1.5 z-10 max-w-[60%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest border border-blue-400/30">
              <Sparkles className="w-3 h-3" />
              Haute Couture
            </div>
            <h2 className="text-base font-bold leading-snug">
              Kaftan Royal & Bazin Riche
            </h2>
            <p className="text-[11px] text-slate-300 font-medium">
              Gestion fluide des confections et des acomptes.
            </p>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="mt-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Nouvelle commande
            </button>
          </div>

          {/* Mannequin Graphic illustration */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80" 
              alt="Kaftan"
              className="h-full w-full object-cover object-center opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-950/40 to-slate-900" />
          </div>
        </div>

        {/* 3 Quick Counters */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* En cours */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-slate-100 dark:border-zinc-800 text-center shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              En Cours
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {String(countEnCours).padStart(2, '0')}
            </div>
          </div>

          {/* Essayages */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-slate-100 dark:border-zinc-800 text-center shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Essayages
            </div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {String(countEssayages).padStart(2, '0')}
            </div>
          </div>

          {/* A Livrer */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-slate-100 dark:border-zinc-800 text-center shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              A Livrer
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {String(countALivrer).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Section: Production du jour */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Production du jour
            </h3>
            <button 
              onClick={() => onNavigateToTab?.('catalogue')}
              className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 hover:text-blue-600"
            >
              Tout voir · {commandes.length}
            </button>
          </div>

          <div className="space-y-2.5">
            {commandes.slice(0, 3).map((cmd) => {
              const client = clients.find(c => c.id === cmd.clientId);
              return (
                <div
                  key={cmd.id}
                  onClick={() => onSelectCommande(cmd)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                      {cmd.modeleImage ? (
                        <img src={cmd.modeleImage} alt={cmd.modeleNom} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {cmd.modeleNom.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {cmd.modeleNom}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                        <span>{client ? `${client.prenom} ${client.nom}` : 'Cliente'}</span>
                        <span>·</span>
                        <span className="font-semibold text-emerald-600">
                          {new Intl.NumberFormat('fr-FR').format(cmd.montantTotal)} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cmd.statut === 'production' ? 'bg-blue-50 text-blue-600' :
                      cmd.statut === 'pret' ? 'bg-amber-50 text-amber-600' :
                      cmd.statut === 'livre' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {cmd.statut === 'production' ? 'En cours' :
                       cmd.statut === 'pret' ? 'Prêt' :
                       cmd.statut === 'livre' ? 'Livré' : 'En attente'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sheet Modal: Choisir une cliente (Center screen of mockup) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Choisir une cliente
              </h3>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Client List */}
            <div className="overflow-y-auto space-y-2 flex-1 pt-1 no-scrollbar">
              {filteredClients.map((client) => {
                const initials = `${client.prenom.charAt(0)}${client.nom.charAt(0)}`.toUpperCase();
                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      setIsClientModalOpen(false);
                      onSelectClient?.(client);
                    }}
                    className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar Badge with initials & green dot */}
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white"
                          style={{ backgroundColor: client.avatarColor || '#E2E8F0' }}
                        >
                          {initials}
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute top-0 right-0" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {client.prenom} {client.nom}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{client.telephone}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
