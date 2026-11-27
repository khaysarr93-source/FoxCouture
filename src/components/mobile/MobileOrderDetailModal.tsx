import React, { useState } from 'react';
import { Commande, ModePaiement } from '../../types';
import { useStore } from '../../store';
import { 
  ChevronLeft, 
  Trash2, 
  Edit3, 
  Calendar, 
  Plus, 
  Wallet, 
  CheckCircle,
  X
} from 'lucide-react';

interface MobileOrderDetailModalProps {
  commande: Commande;
  onClose: () => void;
  onDeleteCommande?: (id: string) => void;
}

export const MobileOrderDetailModal: React.FC<MobileOrderDetailModalProps> = ({
  commande,
  onClose,
  onDeleteCommande
}) => {
  const { updateCommande, addReglement, reglements, clients } = useStore();
  const [currentStatut, setCurrentStatut] = useState(commande.statut);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(commande.soldeDu > 0 ? commande.soldeDu : 0);
  const [paymentMode, setPaymentMode] = useState<ModePaiement>('wave');
  const [paymentRef, setPaymentRef] = useState('');

  // Find related client
  const client = clients.find(c => c.id === commande.clientId);

  // Payments for this order
  const orderPayments = reglements.filter(r => r.reference?.includes(commande.reference) || r.id === commande.factureId);

  // Recalculate totals
  const totalPaye = Math.min(commande.montantTotal, commande.acompteVerse);
  const soldeRestant = Math.max(0, commande.montantTotal - totalPaye);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const handleStatutChange = (newStatut: Commande['statut']) => {
    setCurrentStatut(newStatut);
    updateCommande(commande.id, { statut: newStatut });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newAcompte = commande.acompteVerse + paymentAmount;
    const newSolde = Math.max(0, commande.montantTotal - newAcompte);

    // Record payment
    addReglement({
      date: new Date().toISOString().split('T')[0],
      montant: paymentAmount,
      mode: paymentMode,
      reference: `${commande.reference} - ${paymentMode.toUpperCase()} ${paymentRef ? `(${paymentRef})` : ''}`
    });

    // Update order
    updateCommande(commande.id, {
      acompteVerse: newAcompte,
      soldeDu: newSolde,
      statut: newSolde === 0 && currentStatut === 'attente' ? 'production' : currentStatut
    });

    setIsPaymentModalOpen(false);
    setPaymentRef('');
  };

  const statusOptions: { id: Commande['statut']; label: string }[] = [
    { id: 'attente', label: 'En attente' },
    { id: 'production', label: 'En cours' },
    { id: 'pret', label: 'Prete' },
    { id: 'livre', label: 'Livrée' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 overflow-y-auto font-sans text-slate-900 dark:text-zinc-100">
      {/* Top Header */}
      <div className="sticky top-0 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 z-10">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-bold text-slate-900 dark:text-white">
          Commande
        </h1>

        <div className="flex items-center gap-1 -mr-2">
          <button 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Supprimer cette commande ?')) {
                onDeleteCommande?.(commande.id);
                onClose();
              }
            }}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-zinc-400 hover:text-red-600"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-5 space-y-6 pb-32">
        {/* Section: Statut Pills */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Statut
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {statusOptions.map((st) => {
              const isActive = currentStatut === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleStatutChange(st.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Commandée le
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
            {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Section: Articles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Articles
            </h2>
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                {commande.modeleImage ? (
                  <img src={commande.modeleImage} alt={commande.modeleNom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-800 flex items-center justify-center text-white text-[10px] font-bold">
                    {commande.modeleNom.substring(0, 3).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {commande.modeleNom}
                </h3>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                  1 x {formatFCFA(commande.montantTotal)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {formatFCFA(commande.montantTotal)}
              </span>
              <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Paiement Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-3.5">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">
            Paiement
          </h2>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
              <span>Montant total</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatFCFA(commande.montantTotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
              <span>payé</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatFCFA(totalPaye)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
              <span>Solde restant</span>
              <span className={`font-bold font-mono ${soldeRestant > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600'}`}>
                {formatFCFA(soldeRestant)}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Historique Paiements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Paiements
            </h2>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {orderPayments.length === 0 && totalPaye === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 flex items-center gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Aucun paiement enregistré
                </div>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                  Ajoutez un paiement pour suivre les règlements.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {totalPaye > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Acompte initial
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {formatFCFA(totalPaye)}
                  </span>
                </div>
              )}

              {orderPayments.map((p, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-100 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase">
                        {p.mode}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {new Date(p.date).toLocaleDateString('fr-FR')} {p.reference ? `· ${p.reference}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {formatFCFA(p.montant)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Button: + Ajouter un paiement */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800 z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Ajouter un paiement
          </button>
        </div>
      </div>

      {/* Bottom Sheet Modal: Ajouter un Paiement (Wave / Orange Money / Espèces) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enregistrer un règlement
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cliente : {client ? `${client.prenom} ${client.nom}` : 'Cliente'}
                </p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              {/* Payment Mode Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-2">
                  Mode de règlement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Wave */}
                  <button
                    type="button"
                    onClick={() => setPaymentMode('wave')}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMode === 'wave' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold' 
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black">WAVE</div>
                    <div className="text-[10px] text-slate-400">Mobile</div>
                  </button>

                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMode('orange_money')}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMode === 'orange_money' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold' 
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black">ORANGE</div>
                    <div className="text-[10px] text-slate-400">Money</div>
                  </button>

                  {/* Espèces */}
                  <button
                    type="button"
                    onClick={() => setPaymentMode('especes')}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMode === 'especes' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold' 
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black">ESPÈCES</div>
                    <div className="text-[10px] text-slate-400">Cash FCFA</div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Montant à encaisser (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(soldeRestant)}
                    className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg"
                  >
                    Régler tout le solde ({formatFCFA(soldeRestant)})
                  </button>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  N° Transaction / Reçu (facultatif)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ex: Tx Wave 984572..."
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Confirmer l'encaissement de {formatFCFA(paymentAmount || 0)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
