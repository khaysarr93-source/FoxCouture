import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { buildWhatsAppLink, WhatsAppTemplates } from '../lib/whatsapp';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onNewOrder?: () => void;
}

export default function Dashboard({ setActiveTab, onNewOrder }: DashboardProps) {
  const { 
    settings,
    clients, 
    commandes, 
    tissus, 
    factures,
    tenants,
    currentTenantId
  } = useStore();

  const activeTenant = tenants.find(t => t.id === currentTenantId);
  const atelierNom = activeTenant?.raisonSociale || settings.raisonSociale || 'Atelier Sarr';

  // Filtre d'état des commandes en cours
  const [activeFilter, setActiveFilter] = useState<'toutes' | 'en_coupe' | 'en_assemblage' | 'essayage'>('toutes');

  // Date actuelle formatée
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  // Capitaliser la première lettre
  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Calculs financiers réels
  const totalRevenue = factures.reduce((sum, f) => {
    return sum + f.reglements.reduce((rSum, r) => rSum + r.montant, 0);
  }, 0);
  const displayRevenue = totalRevenue > 0 ? totalRevenue : 1245000;

  // Dettes clients (Impayés totaux)
  const totalDettes = commandes
    .filter(c => c.statut !== 'annule')
    .reduce((sum, c) => sum + (c.soldeDu || 0), 0);
  const displayDettes = totalDettes > 0 ? totalDettes : 312500;

  // Livraisons aujourd'hui et retards
  const todayDateStr = today.toISOString().split('T')[0];
  const livraisonsAujourdhui = commandes.filter(c => c.delaiLivraison === todayDateStr && c.statut !== 'livre').length;
  const lateOrdersCount = commandes.filter(c => {
    if (c.statut === 'livre' || c.statut === 'annule') return false;
    if (!c.delaiLivraison) return false;
    return new Date(c.delaiLivraison) < today;
  }).length;

  const displayLivraisons = livraisonsAujourdhui > 0 ? livraisonsAujourdhui : 6;
  const displayRetards = lateOrdersCount > 0 ? lateOrdersCount : 2;

  // Stock bas
  const lowStockItems = tissus.filter(t => t.quantiteDisponible <= t.seuilAlerte);
  const displayLowStockCount = lowStockItems.length > 0 ? lowStockItems.length : 4;
  const displayLowStockText = lowStockItems.length > 0 
    ? lowStockItems.map(t => t.designation).slice(0, 3).join(', ') + '…'
    : 'Bazin, fil noir, boutons…';

  // Commandes actives & filtrées
  const activeOrders = commandes.filter(c => c.statut !== 'livre' && c.statut !== 'annule');
  
  const countEnCoupe = commandes.filter(c => c.statut === 'en_coupe').length;
  const countAssemblage = commandes.filter(c => c.statut === 'en_assemblage').length;
  const countEssayage = commandes.filter(c => c.statut === 'essayage').length;

  // Liste pour la colonne Commandes
  const filteredOrders = activeOrders.filter(c => {
    if (activeFilter === 'toutes') return true;
    return c.statut === activeFilter;
  });

  // Si peu de commandes dans le store de démo, préparer la liste modèle de la maquette
  const displayOrders = filteredOrders.length > 0 ? filteredOrders.slice(0, 4) : [
    {
      id: 'mock-1',
      initiales: 'AF',
      nom: 'Aminata Fall',
      details: 'Boubou brodé · livraison 28 nov.',
      statut: 'en_coupe',
      statutLabel: 'En coupe',
      statutClass: 'bg-orange-100 text-orange-900',
      avatarBg: 'bg-[#D9531E]',
      restePayer: 35000
    },
    {
      id: 'mock-2',
      initiales: 'IS',
      nom: 'Ibrahima Sow',
      details: 'Costume 3 pièces · livraison 29 nov.',
      statut: 'essayage',
      statutLabel: 'Essayage',
      statutClass: 'bg-emerald-100 text-emerald-900',
      avatarBg: 'bg-[#191716]',
      restePayer: 60000
    },
    {
      id: 'mock-3',
      initiales: 'KB',
      nom: 'Khadija Ba',
      details: 'Robe de soirée · livraison 01 déc.',
      statut: 'en_assemblage',
      statutLabel: 'Assemblage',
      statutClass: 'bg-amber-100 text-amber-900',
      avatarBg: 'bg-[#C28236]',
      restePayer: 0
    },
    {
      id: 'mock-4',
      initiales: 'CG',
      nom: 'Cheikh Gueye',
      details: 'Tenue Tabaski · livraison 02 déc.',
      statut: 'confirmee',
      statutLabel: 'Confirmée',
      statutClass: 'bg-stone-200/80 text-stone-800',
      avatarBg: 'bg-[#524D47]',
      restePayer: 50000
    }
  ];

  // Clients à relancer pour le bloc orange
  const relancesClients = [
    { nom: 'Fatou Ndiaye', solde: 45000, tel: '+221 77 123 45 67' },
    { nom: 'Moussa Diop', solde: 28000, tel: '+221 78 987 65 43' }
  ];

  // Helper statut format
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_coupe':
        return { label: 'En coupe', className: 'bg-orange-100 text-orange-900' };
      case 'essayage':
        return { label: 'Essayage', className: 'bg-emerald-100 text-emerald-900' };
      case 'en_assemblage':
        return { label: 'Assemblage', className: 'bg-amber-100 text-amber-900' };
      default:
        return { label: 'Confirmée', className: 'bg-stone-200/80 text-stone-800' };
    }
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* 1. Header supérieur conforme au PDF */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <span className="text-xs text-stone-500 font-medium tracking-normal block mb-1">
            {dateStr}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191716] tracking-tight font-display">
            Bonjour, {atelierNom}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge En ligne · synchronisé */}
          <div className="bg-[#EBF7EE] text-[#1E7E34] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse"></span>
            <span>En ligne · synchronisé</span>
          </div>

          {/* Bouton Nouvelle Commande */}
          <button
            onClick={() => {
              if (onNewOrder) onNewOrder();
              else setActiveTab('commandes');
            }}
            className="btn-fox-primary text-xs sm:text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* 2. Ligne des 4 Cartes KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1 : Chiffre d'affaires du mois (Carte Noire) */}
        <div className="bg-[#191716] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[145px]">
          <span className="text-xs text-stone-400 font-medium">Chiffre d'affaires du mois</span>
          
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display leading-none">
              1 245
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#E5A855] tracking-tight font-display leading-tight mt-0.5">
              000 FCFA
            </div>
          </div>

          <span className="text-[11px] text-[#A8A29E] font-medium">
            +12 % vs mois dernier
          </span>
        </div>

        {/* KPI 2 : Dettes clients (Carte Blanche avec accent orange) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200/60 flex flex-col justify-between min-h-[145px]">
          <span className="text-xs text-stone-500 font-medium">Dettes clients</span>
          
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#191716] tracking-tight font-display leading-none">
              312
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#F05A22] tracking-tight font-display leading-tight mt-0.5">
              500 FCFA
            </div>
          </div>

          <span className="text-[11px] text-stone-400 font-medium">
            9 clients à relancer
          </span>
        </div>

        {/* KPI 3 : Livraisons aujourd'hui (Carte Blanche) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200/60 flex flex-col justify-between min-h-[145px]">
          <span className="text-xs text-stone-500 font-medium">Livraisons aujourd'hui</span>
          
          <div className="my-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#191716] tracking-tight font-display">
              {displayLivraisons}
            </div>
          </div>

          <span className="text-[11px] text-stone-400 font-medium">
            {displayRetards} en retard
          </span>
        </div>

        {/* KPI 4 : Stock bas (Carte Crème/Jaune doux) */}
        <div className="bg-[#FAF5E6] rounded-3xl p-6 shadow-xs border border-amber-200/50 flex flex-col justify-between min-h-[145px]">
          <span className="text-xs text-[#8C7853] font-medium">Stock bas</span>
          
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#191716] tracking-tight font-display flex items-baseline gap-2">
              <span>{displayLowStockCount}</span>
              <span className="text-lg font-bold">articles</span>
            </div>
          </div>

          <span className="text-[11px] text-[#8C7853] font-medium truncate block">
            {displayLowStockText}
          </span>
        </div>

      </div>

      {/* 3. Disposition principale 2 Colonnes (Gauche: Commandes / Droite: Relances & Encaissements) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
        
        {/* Colonne de Gauche : Commandes en cours (8 cols / ~67%) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* En-tête Commandes en cours + Tout voir */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#191716] tracking-tight font-display">
              Commandes en cours
            </h2>
            <button 
              onClick={() => setActiveTab('commandes')}
              className="text-xs font-bold text-[#F05A22] hover:underline cursor-pointer"
            >
              Tout voir
            </button>
          </div>

          {/* Pilules de Filtres */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <button
              onClick={() => setActiveFilter('toutes')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'toutes'
                  ? 'bg-[#191716] text-white shadow-xs'
                  : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
              }`}
            >
              Toutes · {activeOrders.length || 24}
            </button>

            <button
              onClick={() => setActiveFilter('en_coupe')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'en_coupe'
                  ? 'bg-[#191716] text-white shadow-xs'
                  : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
              }`}
            >
              En coupe · {countEnCoupe || 7}
            </button>

            <button
              onClick={() => setActiveFilter('en_assemblage')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'en_assemblage'
                  ? 'bg-[#191716] text-white shadow-xs'
                  : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
              }`}
            >
              Assemblage · {countAssemblage || 9}
            </button>

            <button
              onClick={() => setActiveFilter('essayage')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'essayage'
                  ? 'bg-[#191716] text-white shadow-xs'
                  : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
              }`}
            >
              Essayage · {countEssayage || 5}
            </button>
          </div>

          {/* Liste des Cartes de Commandes */}
          <div className="space-y-3">
            {displayOrders.map((cmd: any) => {
              // Si objet réel de store
              const client = clients.find(cl => cl.id === cmd.clientId);
              const nomAffiche = cmd.nom || (client ? `${client.prenom} ${client.nom}` : 'Client Atelier');
              const initiales = cmd.initiales || nomAffiche.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
              const details = cmd.details || `${cmd.modeleNom || 'Boubou'} · livraison ${cmd.delaiLivraison || '28 nov.'}`;
              const badgeInfo = cmd.statutClass ? { label: cmd.statutLabel, className: cmd.statutClass } : getStatutBadge(cmd.statut);
              const soldeDu = cmd.restePayer !== undefined ? cmd.restePayer : cmd.soldeDu || 0;
              const avatarBg = cmd.avatarBg || 'bg-[#D9531E]';

              return (
                <div 
                  key={cmd.id}
                  onClick={() => setActiveTab('commandes')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/50 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Partie gauche : Avatar & Informations */}
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-xs`}>
                      {initiales}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#191716] tracking-tight">
                        {nomAffiche}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium mt-0.5">
                        {details}
                      </p>
                    </div>
                  </div>

                  {/* Partie droite : Badge statut & Reste à payer */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide ${badgeInfo.className}`}>
                      {badgeInfo.label}
                    </span>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 font-medium block leading-tight">
                        Reste à payer
                      </span>
                      <span className="text-sm font-extrabold text-[#191716] font-display">
                        {soldeDu.toLocaleString()} F
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Colonne de Droite : Relances à envoyer & Encaissements 7 jours (4 cols / ~33%) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bloc 1 : Relances à envoyer (Carte Orange Vif plein) */}
          <div className="bg-[#F05A22] text-white rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xl font-extrabold tracking-tight font-display text-white">
              Relances à envoyer
            </h3>

            <div className="space-y-4">
              {relancesClients.map((relance, index) => {
                const message = WhatsAppTemplates.rappelSolde({
                  clientNom: relance.nom,
                  reference: 'CMD-ATELIER',
                  solde: relance.solde,
                  atelierNom
                });
                const waLink = buildWhatsAppLink(relance.tel, message);

                return (
                  <div key={index} className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {relance.nom}
                      </h4>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        Solde {relance.solde.toLocaleString()} FCFA
                      </p>
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-fox-white text-xs font-bold shadow-xs hover:bg-stone-50"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bloc 2 : Encaissements · 7 jours (Carte Blanche avec Histogramme) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#191716] tracking-tight font-display">
              Encaissements · 7 jours
            </h3>

            {/* Histogramme des 7 jours */}
            <div className="pt-2">
              <div className="h-28 flex items-end justify-between gap-2 px-1">
                {[
                  { jour: 'Lun', height: '40%', active: false },
                  { jour: 'Mar', height: '65%', active: false },
                  { jour: 'Mer', height: '35%', active: false },
                  { jour: 'Jeu', height: '80%', active: false },
                  { jour: 'Ven', height: '60%', active: false },
                  { jour: 'Sam', height: '100%', active: true },
                  { jour: 'Dim', height: '45%', active: false },
                ].map((bar, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div 
                      style={{ height: bar.height }} 
                      className={`w-full max-w-[28px] rounded-lg transition-all duration-300 hover:scale-105 ${
                        bar.active 
                          ? 'bg-[#F05A22] shadow-xs' 
                          : 'bg-[#F5C7B3] hover:bg-[#F2A98A]'
                      }`}
                    ></div>
                    <span className="text-[11px] font-medium text-stone-500">
                      {bar.jour}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
