import React from 'react';
import { useStore } from '../../store';
import { Users, Calendar, ShoppingBag, ArrowDownCircle, Clock, ChevronLeft } from 'lucide-react';

interface MobileStatsSectionProps {
  onBack?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MobileStatsSection: React.FC<MobileStatsSectionProps> = ({ onBack }) => {
  const { clients, commandes, reglements } = useStore();

  // Counts by status
  const countAttente = commandes.filter(c => c.statut === 'attente').length;
  const countProduction = commandes.filter(c => c.statut === 'production').length;
  const countPret = commandes.filter(c => c.statut === 'pret').length;
  const countLivre = commandes.filter(c => c.statut === 'livre').length;
  const countAnnule = commandes.filter(c => c.statut === 'annule').length;

  const totalCommandes = commandes.length || 1;

  // Financial totals in FCFA
  const montantTotalCommande = commandes.reduce((sum, c) => sum + (c.montantTotal || 0), 0);
  const totalEncaisse = reglements.reduce((sum, r) => sum + (r.montant || 0), 0) || 
    commandes.reduce((sum, c) => sum + (c.acompteVerse || 0), 0);
  const soldeRestantDu = Math.max(0, montantTotalCommande - totalEncaisse);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const statItems = [
    {
      label: 'En attente',
      count: countAttente,
      color: 'bg-slate-400',
      barColor: 'bg-slate-300',
      textColor: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-700'
    },
    {
      label: 'En cours',
      count: countProduction,
      color: 'bg-blue-500',
      barColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Prête',
      count: countPret,
      color: 'bg-amber-500',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Livrée',
      count: countLivre,
      color: 'bg-emerald-500',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Annulée',
      count: countAnnule,
      color: 'bg-rose-500',
      barColor: 'bg-rose-500',
      textColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-600'
    }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-zinc-950 pb-28 text-slate-900 dark:text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900 dark:text-white">Stats</h1>
        <div className="w-9" />
      </div>

      <div className="px-6 space-y-6">
        {/* Top 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card Clientes */}
          <div className="bg-[#FFF4EC] dark:bg-amber-950/30 border border-orange-100 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-100/80 dark:bg-amber-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {String(clients.length).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 mt-1">
                Clientes
              </div>
            </div>
          </div>

          {/* Card Commandes */}
          <div className="bg-[#EBFBF5] dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {String(commandes.length).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 mt-1">
                Commandes
              </div>
            </div>
          </div>
        </div>

        {/* Section: Commandes par statut */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">
            Commandes par statut
          </h2>

          <div className="space-y-3.5 pt-1">
            {statItems.map((item, idx) => {
              const percentage = Math.round((item.count / totalCommandes) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 sm:w-32 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, item.count > 0 ? 15 : 0)}%` }}
                        />
                      </div>
                      <span className="w-6 text-center text-[11px] font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 py-0.5 rounded-md">
                        {item.count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Paiements */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">
            Paiements
          </h2>

          <div className="space-y-3.5 pt-1">
            {/* Montant total commandé */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Montant total commandé
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {formatFCFA(montantTotalCommande)}
              </span>
            </div>

            {/* Total encaissé */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/80 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ArrowDownCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Total encaissé
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {formatFCFA(totalEncaisse)}
              </span>
            </div>

            {/* Solde restant dû */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800/80 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Solde restant dû
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {formatFCFA(soldeRestantDu)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
