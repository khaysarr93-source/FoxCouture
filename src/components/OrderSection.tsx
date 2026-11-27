/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Commande, StatutCommande, TypeVetement } from '../types';
import { 
  Scissors, 
  Calendar, 
  User, 
  Info, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertCircle, 
  Layers, 
  PlusCircle, 
  Coins, 
  TrendingUp, 
  FileText, 
  BookOpen,
  DollarSign,
  Sparkles,
  Printer,
  MessageCircle
} from 'lucide-react';
import { buildWhatsAppLink, WhatsAppTemplates } from '../lib/whatsapp';

export default function OrderSection() {
  const { 
    commandes, 
    clients, 
    tissus, 
    ficheMesures, 
    addCommande, 
    updateCommandeStatut, 
    deleteCommande,
    updateEtapeProduction,
    employes,
    settings,
    formatPrice
  } = useStore();

  const getWhatsAppLink = (template: string, order: any, client: any) => {
    if (!client) return '';
    let text = template || '';
    text = text.replace(/{client}/g, `${client.prenom} ${client.nom}`);
    text = text.replace(/{reference}/g, order.idCourt);
    text = text.replace(/{modele}/g, order.nomModele);
    text = text.replace(/{montant}/g, formatPrice(order.prixTotal));
    text = text.replace(/{acompte}/g, formatPrice(order.acompteVerse));
    text = text.replace(/{atelier}/g, settings.raisonSociale);
    
    const phone = client.telephone.replace(/[^0-9+]/g, '');
    const cleanPhone = phone.startsWith('+') ? phone.slice(1) : phone;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getStatusBadge = (statut: StatutCommande) => {
    switch (statut) {
      case 'attente':
      case 'devis':
        return { label: 'En attente', bg: 'bg-stone-100 text-stone-700 border-stone-200' };
      case 'confirmee':
        return { label: 'Confirmée', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'en_coupe':
        return { label: 'En coupe', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'en_assemblage':
      case 'production':
        return { label: 'En couture', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'essayage':
        return { label: 'Essayage', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'pret':
        return { label: 'Prête', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'livre':
        return { label: 'Livrée', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'annule':
        return { label: 'Annulée', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: statut, bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatutCommande | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(commandes[0]?.id || null);
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'detail'>('list');
  
  // Order Creation Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [modeleNom, setModeleNom] = useState('');
  const [modeleCategorie, setModeleCategorie] = useState<'homme' | 'femme' | 'enfant'>('homme');
  const [tissuId, setTissuId] = useState('');
  const [metrageRequis, setMetrageRequis] = useState<number>(2.5);
  const [associatedSupplies, setAssociatedSupplies] = useState<{ tissuId: string; quantite: number }[]>([]);
  const [tempSupplyId, setTempSupplyId] = useState('');
  const [tempSupplyQty, setTempSupplyQty] = useState<number>(1);
  const [ficheMesureId, setFicheMesureId] = useState('');
  const [delaiLivraison, setDelaiLivraison] = useState('');
  const [montantTotal, setMontantTotal] = useState<number>(150000);
  const [acompteVerse, setAcompteVerse] = useState<number>(50000);
  const [remarquesProduction, setRemarquesProduction] = useState('');
  const [coutMainOeuvre, setCoutMainOeuvre] = useState<number>(0);

  // Dynamic Costing & Margin Calculations for new order form
  const fabricCost = (() => {
    const selectedTissu = tissus.find(t => t.id === tissuId);
    return selectedTissu ? (metrageRequis * selectedTissu.prixAchat) : 0;
  })();
  const suppliesCost = associatedSupplies.reduce((sum, item) => {
    const supply = tissus.find(t => t.id === item.tissuId);
    return sum + (item.quantite * (supply?.prixAchat || 0));
  }, 0);
  const totalMaterialsCost = fabricCost + suppliesCost;
  const totalCostOfProduction = totalMaterialsCost + coutMainOeuvre;
  const grossMargin = montantTotal - totalCostOfProduction;
  const marginPercent = montantTotal > 0 ? Math.round((grossMargin / montantTotal) * 100) : 0;

  // AI Confection Advice States
  const [aiAdvice, setAiAdvice] = useState<{ [orderId: string]: string }>({});
  const [loadingAdvice, setLoadingAdvice] = useState<{ [orderId: string]: boolean }>({});

  const handleFetchAiConfectionAdvice = async (order: Commande) => {
    const client = clients.find(c => c.id === order.clientId);
    setLoadingAdvice(prev => ({ ...prev, [order.id]: true }));
    try {
      const response = await fetch('/api/conseil-confection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: order.reference,
          modeleNom: order.modeleNom,
          modeleCategorie: order.modeleCategorie,
          tissuNom: order.tissuNom,
          remarquesProduction: order.remarquesProduction,
          clientName: client ? `${client.prenom} ${client.nom}` : undefined,
          clientPreferences: client?.preferences,
        }),
      });
      if (!response.ok) {
        throw new Error('Erreur de communication avec le serveur de couture.');
      }
      const data = await response.json();
      setAiAdvice(prev => ({ ...prev, [order.id]: data.advice }));
    } catch (error: any) {
      console.error(error);
      setAiAdvice(prev => ({ ...prev, [order.id]: "Erreur : Impossible de générer la notice de confection pour le moment. Veuillez réessayer." }));
    } finally {
      setLoadingAdvice(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const renderFormattedAdvice = (text: string) => {
    if (!text) return null;
    
    // Split text by newlines
    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-serif text-sm text-slate-800 leading-relaxed">
        {lines.map((line, idx) => {
          let cleanLine = line.trim();
          if (!cleanLine) return null;

          // Check if line is a heading e.g. "### Heading" or "**Heading**"
          const isHeading = cleanLine.startsWith('###') || (cleanLine.startsWith('**') && cleanLine.endsWith('**') && !cleanLine.includes(':'));
          
          if (isHeading) {
            const displayTitle = cleanLine.replace(/###/g, '').replace(/\*\*/g, '').trim();
            return (
              <h4 key={idx} className="font-sans font-black uppercase text-[11px] tracking-wider text-slate-900 border-b border-black/10 pb-1 mt-4">
                {displayTitle}
              </h4>
            );
          }

          // Check if line is a bullet point, e.g. starting with "- " or "* " or "1. "
          const isBullet = cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\.\s/.test(cleanLine);
          
          // Bold processing: replace **some text** with <strong>some text</strong>
          const renderWithBold = (txt: string) => {
            const parts = txt.split('**');
            return parts.map((part, pIdx) => {
              if (pIdx % 2 === 1) {
                return <strong key={pIdx} className="font-extrabold text-slate-950">{part}</strong>;
              }
              return part;
            });
          };

          if (isBullet) {
            // strip bullet indicator
            const bulletText = cleanLine.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-atelier-gold-dark font-black mt-1">•</span>
                <span>{renderWithBold(bulletText)}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="not-italic text-slate-700">
              {renderWithBold(cleanLine)}
            </p>
          );
        })}
      </div>
    );
  };

  const selectedOrder = commandes.find(c => c.id === selectedOrderId);
  const orderClient = selectedOrder ? clients.find(cl => cl.id === selectedOrder.clientId) : null;
  const orderMeasure = selectedOrder ? ficheMesures.find(m => m.id === selectedOrder.ficheMesureId) : null;

  // Filter & Search
  const filteredOrders = commandes.filter(o => {
    const matchesSearch = o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.modeleNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (clients.find(c => c.id === o.clientId)?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (clients.find(c => c.id === o.clientId)?.prenom || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !modeleNom || !delaiLivraison || !ficheMesureId) {
      alert('Veuillez remplir tous les champs obligatoires (Client, Modèle, Échéance, Fiche de Mesure).');
      return;
    }

    const selectedTissu = tissus.find(t => t.id === tissuId);
    if (selectedTissu && selectedTissu.quantiteDisponible < metrageRequis) {
      const proceed = window.confirm(`Le tissu sélectionné n'a que ${selectedTissu.quantiteDisponible}m disponibles, mais vous en demandez ${metrageRequis}m. Voulez-vous quand même forcer la commande ?`);
      if (!proceed) return;
    }

    const newOrder = addCommande({
      clientId,
      modeleNom,
      modeleCategorie,
      tissuNom: selectedTissu ? `${selectedTissu.designation} - ${selectedTissu.couleur}` : 'Tissu client ou non spécifié',
      tissuId: tissuId || undefined,
      metrageRequis: Number(metrageRequis),
      ficheMesureId,
      delaiLivraison,
      montantTotal: Number(montantTotal),
      acompteVerse: Number(acompteVerse),
      statut: 'attente',
      imagesModeles: [],
      remarquesProduction,
      fournituresAssociees: associatedSupplies,
      coutMainOeuvre: Number(coutMainOeuvre),
      stockDeduit: false
    });

    setIsOrderModalOpen(false);
    setSelectedOrderId(newOrder.id);
    setAssociatedSupplies([]);
    setTempSupplyId('');
    setTempSupplyQty(1);
  };

  const handleClientChange = (id: string) => {
    setClientId(id);
    // Auto-select the first available measurement sheet for this client
    const measures = ficheMesures.filter(m => m.clientId === id);
    if (measures.length > 0) {
      setFicheMesureId(measures[0].id);
    } else {
      setFicheMesureId('');
    }
  };

  const formatFCFA = (val: number) => {
    return formatPrice(val);
  };

  const printOrderAtelierSheet = () => {
    if (!selectedOrder || !orderClient) return;

    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open('about:blank', uniqueName, 'left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer.');
      return;
    }

    const tissuDetail = selectedOrder.tissuNom;
    const measuresHtml = orderMeasure 
      ? Object.entries(orderMeasure.mensurations)
          .map(([key, value]) => `
            <div style="border: 1px solid #FFE4D0; padding: 8px 12px; background: #FFF; text-align: center;">
              <span style="font-size: 10px; text-transform: uppercase; color: #777; display: block;">${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
              <strong style="font-size: 14px; color: #1A1A1A; display: block; margin-top: 2px;">${value} cm</strong>
            </div>
          `).join('')
      : '<p style="font-size: 12px; color: #999; font-style: italic;">Aucune mesure associée.</p>';

    const stepsHtml = selectedOrder.etapesProduction
      .map((step, idx) => {
        const tailor = employes.find(e => e.id === step.responsableId);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: #FF7A1A; color: white; text-align: center; line-height: 20px; font-weight: bold; font-size: 10px;">${idx + 1}</span>
              <span><strong>${step.libelle}</strong></span>
            </div>
            <div style="color: #555;">
              Tailleur : ${tailor ? `${tailor.prenom} ${tailor.nom}`.toUpperCase() : 'Non assigné'}
              [${step.statut === 'termine' ? '✓ TERMINE' : step.statut === 'en_cours' ? '● EN COURS' : '○ A FAIRE'}]
            </div>
          </div>
        `;
      }).join('');

    const formattedAdvice = aiAdvice[selectedOrder.id]
      ? aiAdvice[selectedOrder.id]
          .split('\n')
          .map(line => {
            const clean = line.trim();
            if (!clean) return '';
            if (clean.startsWith('###') || (clean.startsWith('**') && clean.endsWith('**') && !clean.includes(':'))) {
              return `<h4 style="color: #E85D04; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #FFE4D0; padding-bottom: 3px; margin-top: 15px; margin-bottom: 8px;">${clean.replace(/###/g, '').replace(/\*\*/g, '').trim()}</h4>`;
            }
            const isBullet = clean.startsWith('-') || clean.startsWith('*');
            const renderWithBold = (txt: string) => {
              return txt.split('**').map((part, pIdx) => pIdx % 2 === 1 ? `<strong>${part}</strong>` : part).join('');
            };
            if (isBullet) {
              return `<li style="font-size: 11px; margin-left: 15px; margin-bottom: 4px; color: #444;">${renderWithBold(clean.replace(/^[-*]\s+/, '').trim())}</li>`;
            }
            return `<p style="font-size: 11px; margin-bottom: 6px; color: #444; line-height: 1.4;">${renderWithBold(clean)}</p>`;
          }).join('')
      : '<p style="font-size: 11px; color: #999; font-style: italic;">Aucune notice de stylisme générée. Veuillez la générer dans l\'application pour l\'inclure.</p>';

    const suppliesHtml = selectedOrder.fournituresAssociees && selectedOrder.fournituresAssociees.length > 0
      ? selectedOrder.fournituresAssociees.map(supply => {
          const item = tissus.find(t => t.id === supply.tissuId);
          if (!item) return '';
          return `<span style="display: inline-block; background: #FFF3EA; border: 1px solid #FFE4D0; padding: 4px 8px; font-size: 11px; margin-right: 5px; margin-bottom: 5px; color: #E85D04;"><strong>${item.designation}</strong> (${supply.quantite} ${item.unite || 'pcs'})</span>`;
        }).join('')
      : '<span style="font-size: 11px; color: #999; font-style: italic;">Aucun accessoire rattaché.</span>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Fiche de Fabrication - Commande ${selectedOrder.reference}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; margin: 30px; line-height: 1.5; background: #FFF; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #FF7A1A; padding-bottom: 15px; margin-bottom: 25px; }
            .brand { font-size: 24px; font-weight: 950; color: #1A1A1A; letter-spacing: 0.5px; }
            .subtitle { font-size: 10px; text-transform: uppercase; color: #E85D04; font-weight: bold; letter-spacing: 1px; }
            h2 { color: #E85D04; font-size: 12px; border-bottom: 2px solid #FF7A1A; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #FFF9F5; border: 1px solid #FFE4D0; padding: 15px; }
            .meta-grid strong { color: #E85D04; }
            .meta-item { font-size: 12px; color: #333; }
            .meta-item strong { color: #1A1A1A; }
            .section-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .notes-box { background: #F8F9FA; border-left: 3px solid #FF7A1A; padding: 12px; font-size: 12px; font-style: italic; }
            .footer { text-align: center; font-size: 10px; color: #999; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
            .meas-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header">
            <div>
              <div class="brand">${settings.raisonSociale}</div>
              <div class="subtitle">FICHE DE FABRICATION ATELIER</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <strong>COMMANDE N° : ${selectedOrder.reference}</strong><br>
              Échéance : ${selectedOrder.delaiLivraison.split('-').reverse().join('/')}
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <strong>CLIENT :</strong> ${orderClient.prenom.toUpperCase()} ${orderClient.nom.toUpperCase()}<br>
              <strong>Téléphone :</strong> ${orderClient.telephone}<br>
              <strong>Adresse :</strong> ${orderClient.adresse || 'N/A'}
            </div>
            <div class="meta-item">
              <strong>MODÈLE :</strong> ${selectedOrder.modeleNom.toUpperCase()}<br>
              <strong>Catégorie :</strong> ${selectedOrder.modeleCategorie.toUpperCase()}<br>
              <strong>Date Commande :</strong> ${selectedOrder.dateCommande.split('-').reverse().join('/')}
            </div>
            <div class="meta-item">
              <strong>TISSU :</strong> ${selectedOrder.tissuNom.toUpperCase()}<br>
              <strong>Métrage :</strong> ${selectedOrder.metrageRequis} mètres<br>
              <strong>Accessoires :</strong><br>
              ${suppliesHtml}
            </div>
          </div>

          <h2>Mesures Anatomiques pour la Coupe</h2>
          <div class="meas-grid">
            ${measuresHtml}
          </div>

          <div class="section-grid">
            <div>
              <h2>Suivi de Fabrication</h2>
              <div style="border: 1px solid #eee; background: #FFF;">
                ${stepsHtml}
              </div>
              <br>
              <h2>Consignes initiales</h2>
              <div class="notes-box">
                ${selectedOrder.remarquesProduction || 'Aucune remarque spécifique de production.'}
              </div>
            </div>
            <div>
              <h2>Notice stylisme & Confection IA</h2>
              <div style="background: #FFFDF9; border: 1px solid #FDF3E7; padding: 12px; border-radius: 4px;">
                ${formattedAdvice}
              </div>
            </div>
          </div>

          <div class="footer">
            Document Interne Atelier Fox Couture — Ne pas distribuer au public.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };


  return (
    <div className="space-y-6">
      {/* Mobile view tabs selector */}
      <div className="flex lg:hidden bg-white p-1 rounded-2xl border border-stone-200/60 shadow-xs">
        <button
          onClick={() => setActiveMobileView('list')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'list' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Liste ({filteredOrders.length})
        </button>
        <button
          onClick={() => setActiveMobileView('detail')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'detail' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Détails Commande {selectedOrder ? `(${selectedOrder.reference})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Column 1: Order Listing & Filters */}
        <div className={`lg:col-span-1 flex flex-col h-[750px] bg-white rounded-3xl border border-stone-200/60 shadow-xs overflow-hidden ${
          activeMobileView === 'list' ? 'flex' : 'hidden lg:flex'
        }`}>
        {/* Search, Status Quick Tabs & Creation Button */}
        <div className="p-5 border-b border-stone-100 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#191716] font-display flex items-center gap-2">
              <Scissors className="h-4.5 w-4.5 text-[#F05A22]" /> Commandes Atelier
            </h3>
            <button 
              onClick={() => {
                // Initialize default values for order creation
                setClientId(clients[0]?.id || '');
                if (clients[0]?.id) handleClientChange(clients[0].id);
                setModeleNom('');
                setModeleCategorie('homme');
                setTissuId('');
                setMetrageRequis(2.5);
                setAssociatedSupplies([]);
                setTempSupplyId('');
                setTempSupplyQty(1);
                setDelaiLivraison('');
                setMontantTotal(150000);
                setAcompteVerse(50000);
                setRemarquesProduction('');
                setCoutMainOeuvre(0);
                setIsOrderModalOpen(true);
              }}
              className="btn-fox-primary !p-2 !rounded-xl"
              title="Nouvelle commande"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Réf, client, modèle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
            />
          </div>

          {/* Status Tabs Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {([
              { key: 'all', label: 'Toutes' },
              { key: 'devis', label: 'Devis' },
              { key: 'confirmee', label: 'Confirmées' },
              { key: 'en_coupe', label: 'Coupe' },
              { key: 'en_assemblage', label: 'Assemblage' },
              { key: 'essayage', label: 'Essayages' },
              { key: 'pret', label: 'Prêtes' },
              { key: 'livre', label: 'Livrées' }
            ] as { key: StatutCommande | 'all'; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                  statusFilter === tab.key 
                    ? 'bg-[#191716] text-white shadow-xs' 
                    : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const client = clients.find(c => c.id === order.clientId);
              const badge = getStatusBadge(order.statut);
              
              return (
                <div 
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setActiveMobileView('detail');
                  }}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition ${
                    selectedOrderId === order.id ? 'bg-[#FDF4EE] border-l-4 border-[#F05A22]' : 'hover:bg-stone-50/70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-semibold text-stone-500">
                      {order.reference}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                      {order.modeleNom}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5 font-medium">
                      <User className="h-3 w-3 text-stone-400" /> {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-stone-500 mt-1 pt-2 border-t border-stone-200/60 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" /> {order.delaiLivraison.split('-').reverse().join('/')}
                    </span>
                    <strong className="text-stone-900 font-bold font-mono">
                      {formatFCFA(order.montantTotal)}
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-stone-400">
              <Scissors className="h-8 w-8 mx-auto mb-2 text-stone-300" />
              <p className="text-xs font-medium">Aucune commande répertoriée</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Order Details Page */}
      <div className={`lg:col-span-2 space-y-8 ${
        activeMobileView === 'detail' ? 'block' : 'hidden lg:block'
      }`}>
        {selectedOrder ? (
          <>
            {/* Back Button on Mobile */}
            <div className="block lg:hidden">
              <button
                onClick={() => setActiveMobileView('list')}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                ← Retour à la liste des commandes
              </button>
            </div>
            {/* Header detail */}
            <div className="card-fox p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold bg-[#191716] text-[#FAF8F5] px-2.5 py-0.5 rounded-lg">
                      Réf: {selectedOrder.reference}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Créée le {selectedOrder.dateCommande.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                    {selectedOrder.modeleNom}
                  </h2>
                </div>

                {/* Change Status select */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={printOrderAtelierSheet}
                    className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition cursor-pointer flex items-center justify-center shadow-xs"
                    title="Imprimer la Fiche d'Atelier"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <select
                    value={selectedOrder.statut}
                    onChange={(e) => updateCommandeStatut(selectedOrder.id, e.target.value as StatutCommande)}
                    className="bg-[#FBF8F3] text-stone-800 border border-stone-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F05A22] cursor-pointer"
                  >
                    <option value="devis">1. Devis</option>
                    <option value="confirmee">2. Confirmée</option>
                    <option value="en_coupe">3. En coupe</option>
                    <option value="en_assemblage">4. En assemblage</option>
                    <option value="essayage">5. Essayage client</option>
                    <option value="pret">6. Prêt pour livraison</option>
                    <option value="livre">7. Livré & Clôturé</option>
                    <option value="annule">Annulé</option>
                  </select>

                  <button
                    onClick={() => {
                      if (window.confirm('Confirmez-vous la suppression de cette commande et de sa facture ?')) {
                        deleteCommande(selectedOrder.id);
                        setSelectedOrderId(commandes.find(c => c.id !== selectedOrder.id)?.id || null);
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold transition cursor-pointer"
                    title="Supprimer la commande"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Grid Client, Fabric & Delivery Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                <div className="flex flex-col p-4.5 bg-[#FBF8F3] border border-stone-200/70 rounded-2xl justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#191716] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-[#F05A22]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-stone-400 block uppercase tracking-wider">Client</span>
                      <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                        {orderClient ? `${orderClient.prenom} ${orderClient.nom}` : 'Client inconnu'}
                      </span>
                      <span className="text-xs text-stone-500 font-mono mt-0.5 block">{orderClient?.telephone}</span>
                    </div>
                  </div>
                  {orderClient && (
                    <div className="mt-3.5 pt-3 border-t border-stone-200/60 flex flex-wrap gap-1.5">
                      <a
                        href={buildWhatsAppLink(
                          orderClient.telephone,
                          WhatsAppTemplates.recuCommande({
                            clientNom: `${orderClient.prenom} ${orderClient.nom}`,
                            reference: selectedOrder.reference,
                            modele: selectedOrder.modeleNom,
                            total: selectedOrder.montantTotal,
                            acompte: selectedOrder.acompteVerse,
                            solde: selectedOrder.soldeDu,
                            dateLivraison: selectedOrder.delaiLivraison,
                            atelierNom: settings.raisonSociale
                          })
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 text-[11px] font-semibold rounded-xl border border-stone-200/80 transition inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Envoyer le reçu de commande par WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        Reçu
                      </a>
                      <a
                        href={buildWhatsAppLink(
                          orderClient.telephone,
                          WhatsAppTemplates.invitationEssayage({
                            clientNom: `${orderClient.prenom} ${orderClient.nom}`,
                            reference: selectedOrder.reference,
                            modele: selectedOrder.modeleNom,
                            atelierNom: settings.raisonSociale
                          })
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-orange-50 hover:border-orange-200 text-stone-800 text-[11px] font-semibold rounded-xl border border-stone-200/80 transition inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Inviter le client à l'essayage par WhatsApp"
                      >
                        👗 Essayage
                      </a>
                      <a
                        href={buildWhatsAppLink(
                          orderClient.telephone,
                          WhatsAppTemplates.commandePrete({
                            clientNom: `${orderClient.prenom} ${orderClient.nom}`,
                            reference: selectedOrder.reference,
                            modele: selectedOrder.modeleNom,
                            solde: selectedOrder.soldeDu,
                            atelierNom: settings.raisonSociale
                          })
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 text-[11px] font-semibold rounded-xl border border-stone-200/80 transition inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Avertir que la commande est prête pour livraison par WhatsApp"
                      >
                        📦 Prêt
                      </a>
                      {selectedOrder.soldeDu > 0 && (
                        <a
                          href={buildWhatsAppLink(
                            orderClient.telephone,
                            WhatsAppTemplates.rappelSolde({
                              clientNom: `${orderClient.prenom} ${orderClient.nom}`,
                              reference: selectedOrder.reference,
                              solde: selectedOrder.soldeDu,
                              atelierNom: settings.raisonSociale,
                              moyensPaiement: 'Wave, Orange Money ou Espèces'
                            })
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-center py-1.5 px-2.5 bg-[#FDF4EE] hover:bg-[#FEECE0] text-[#F05A22] text-[11px] font-semibold rounded-xl border border-[#F05A22]/30 transition inline-flex items-center justify-center gap-1 cursor-pointer mt-1"
                          title="Envoyer un rappel de solde restant dû par WhatsApp"
                        >
                          💰 Relance Solde ({formatFCFA(selectedOrder.soldeDu)})
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4.5 bg-[#FBF8F3] border border-stone-200/70 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-[#191716] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4 text-[#F05A22]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block uppercase tracking-wider">Matière & Métrage</span>
                    <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                      {selectedOrder.tissuNom}
                    </span>
                    <span className="text-xs text-stone-500 font-mono mt-0.5 block">Métrage : {selectedOrder.metrageRequis} m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4.5 bg-[#FBF8F3] border border-stone-200/70 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-[#191716] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-[#F05A22]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block uppercase tracking-wider">Livraison Prévue</span>
                    <span className="font-bold text-stone-900 text-xs mt-0.5 block font-mono">
                      {selectedOrder.delaiLivraison.split('-').reverse().join('/')}
                    </span>
                    {new Date(selectedOrder.delaiLivraison) < new Date() && selectedOrder.statut !== 'livre' ? (
                      <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> En retard
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                        À temps
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Associated Accessories Display */}
            {selectedOrder.fournituresAssociees && selectedOrder.fournituresAssociees.length > 0 && (
              <div className="bg-[#FBF8F3] border border-stone-200/80 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-200 pb-2">
                  <Scissors className="h-4 w-4 text-[#F05A22]" /> Accessoires & fournitures associés
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedOrder.fournituresAssociees.map((supply, idx) => {
                    const item = tissus.find(t => t.id === supply.tissuId);
                    if (!item) return null;
                    return (
                      <div key={idx} className="bg-white border border-stone-200/80 rounded-xl p-3 flex justify-between items-center shadow-xs">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-semibold bg-stone-100 text-stone-700 px-1.5 py-0.5 inline-block rounded-md mb-1">
                            {item.categorie === 'bouton' ? 'Bouton' :
                             item.categorie === 'fermeture' ? 'Fermeture' :
                             item.categorie === 'fil' ? 'Fil' :
                             item.categorie === 'elastic' ? 'Élastique' : 'Accessoire'}
                          </span>
                          <span className="text-xs font-semibold text-stone-900 block truncate">
                            {item.designation}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono block">
                            Teinte : {item.couleur}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold bg-[#FBF8F3] border border-stone-200 px-2 py-1 inline-block rounded-lg text-stone-900">
                            {supply.quantite} {item.unite || 'pièces'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Custom Confection & Styling Guide Section */}
            <div className="card-fox p-6 space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#F05A22]" /> Notice de stylisme & confection assistée par IA
              </h3>

              {aiAdvice[selectedOrder.id] ? (
                <div className="bg-[#FBF8F3] p-5 rounded-2xl border border-stone-200/80 space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#F05A22]" /> Recommandation stylistique & technique
                    </span>
                    <button
                      onClick={() => handleFetchAiConfectionAdvice(selectedOrder)}
                      disabled={loadingAdvice[selectedOrder.id]}
                      className="text-xs font-semibold text-stone-600 hover:text-[#F05A22] cursor-pointer disabled:opacity-50 transition"
                    >
                      {loadingAdvice[selectedOrder.id] ? 'Génération...' : 'Réanalyser'}
                    </button>
                  </div>
                  
                  {renderFormattedAdvice(aiAdvice[selectedOrder.id])}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FBF8F3] p-5 rounded-2xl border border-stone-200/80">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#F05A22]" /> Assistant stylisme & coupe
                    </span>
                    <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                      Générez une notice sur-mesure pour ce modèle : accessoires recommandés, particularités techniques d'assemblage pour le tissu {selectedOrder.tissuNom}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFetchAiConfectionAdvice(selectedOrder)}
                    disabled={loadingAdvice[selectedOrder.id]}
                    className="btn-fox-primary !py-2.5 !px-4 shrink-0"
                  >
                    {loadingAdvice[selectedOrder.id] ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Créer notice IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Production steps section */}
            <div className="card-fox p-6 space-y-6">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-[#F05A22]" /> Étapes de confection en atelier
              </h3>

              <div className="space-y-3">
                {selectedOrder.etapesProduction.map((step, idx) => {
                  const tailor = employes.find(e => e.id === step.responsableId);
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition ${
                        step.statut === 'termine' ? 'bg-emerald-50/50 border-emerald-200/80' :
                        step.statut === 'en_cours' ? 'bg-[#FDF4EE] border-[#F05A22]/40' :
                        'bg-[#FBF8F3] border-stone-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          step.statut === 'termine' ? 'bg-emerald-600 text-white' :
                          step.statut === 'en_cours' ? 'bg-[#F05A22] text-white animate-pulse' :
                          'bg-stone-200 text-stone-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">
                            {step.libelle}
                          </h4>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Tailleur : <span className="font-semibold text-stone-700">{tailor ? `${tailor.prenom} ${tailor.nom}` : 'Non assigné'}</span>
                          </p>
                          {(step.dateDebut || step.dateFin) && (
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                              {step.dateDebut && `Début: ${step.dateDebut.split('-').reverse().join('/')}`}
                              {step.dateFin && ` | Fin: ${step.dateFin.split('-').reverse().join('/')}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* State toggles */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => updateEtapeProduction(selectedOrder.id, step.id, { statut: 'a_faire' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            step.statut === 'a_faire' ? 'bg-white text-stone-900 shadow-xs border border-stone-200' : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          À faire
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEtapeProduction(selectedOrder.id, step.id, { statut: 'en_cours' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            step.statut === 'en_cours' ? 'bg-[#F05A22] text-white shadow-xs' : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          En cours
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEtapeProduction(selectedOrder.id, step.id, { statut: 'termine' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            step.statut === 'termine' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Terminé
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial summaries info */}
            <div className="card-fox p-6 space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <Coins className="h-4.5 w-4.5 text-[#F05A22]" /> Règlement & facturation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FBF8F3] p-4.5 rounded-2xl border border-stone-200/70">
                  <span className="text-xs text-stone-500 font-semibold block">Montant Total</span>
                  <span className="text-lg font-bold text-stone-900 font-mono mt-1 block">{formatFCFA(selectedOrder.montantTotal)}</span>
                </div>
                <div className="bg-emerald-50/60 p-4.5 rounded-2xl border border-emerald-200/70">
                  <span className="text-xs text-emerald-700 font-semibold block">Acompte versé</span>
                  <span className="text-lg font-bold text-emerald-950 font-mono mt-1 block">{formatFCFA(selectedOrder.acompteVerse)}</span>
                </div>
                <div className={`${selectedOrder.soldeDu > 0 ? 'bg-[#FDF4EE] border-[#F05A22]/40' : 'bg-emerald-50/60 border-emerald-200/70'} p-4.5 rounded-2xl border`}>
                  <span className="text-xs font-semibold block text-stone-600">Solde restant</span>
                  <span className={`text-lg font-bold font-mono mt-1 block ${selectedOrder.soldeDu > 0 ? 'text-[#F05A22]' : 'text-emerald-700'}`}>
                    {formatFCFA(selectedOrder.soldeDu)}
                  </span>
                </div>
              </div>
            </div>

            {/* Costing & Margins detail */}
            {(() => {
              const selectedTissu = tissus.find(t => t.id === selectedOrder.tissuId);
              const fabricCost = selectedTissu ? (selectedOrder.metrageRequis * selectedTissu.prixAchat) : 0;
              const suppliesCost = (selectedOrder.fournituresAssociees || []).reduce((sum, item) => {
                const supply = tissus.find(t => t.id === item.tissuId);
                return sum + (item.quantite * (supply?.prixAchat || 0));
              }, 0);
              const totalMaterialsCost = fabricCost + suppliesCost;
              const laborCost = selectedOrder.coutMainOeuvre || 0;
              const totalCost = totalMaterialsCost + laborCost;
              const margin = selectedOrder.montantTotal - totalCost;
              const marginPercent = selectedOrder.montantTotal > 0 ? Math.round((margin / selectedOrder.montantTotal) * 100) : 0;

              return (
                <div className="card-fox p-6 space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-[#F05A22]" /> Analyse des coûts & marge bénéficiaire
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-stone-200/70">
                      <span className="text-[11px] text-stone-500 font-medium block">Coût des matières</span>
                      <strong className="font-mono text-base block mt-0.5 text-stone-900">{formatFCFA(totalMaterialsCost)}</strong>
                      <span className="text-[10px] text-stone-400 block mt-1">Tissu: {formatFCFA(fabricCost)} | Fourn.: {formatFCFA(suppliesCost)}</span>
                    </div>
                    <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-stone-200/70">
                      <span className="text-[11px] text-stone-500 font-medium block">Main d'œuvre</span>
                      <strong className="font-mono text-base block mt-0.5 text-stone-900">{formatFCFA(laborCost)}</strong>
                      <span className="text-[10px] text-stone-400 block mt-1">Façonnage atelier</span>
                    </div>
                    <div className="bg-[#191716] text-[#FAF8F5] p-4 rounded-2xl">
                      <span className="text-[11px] text-stone-400 font-medium block">Prix de revient</span>
                      <strong className="font-mono text-base block mt-0.5 text-[#F05A22]">{formatFCFA(totalCost)}</strong>
                      <span className="text-[10px] text-stone-400 block mt-1">Matières + main-d'œuvre</span>
                    </div>
                    <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      margin >= 0 ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="text-[11px] font-medium block">Marge brute</span>
                        <strong className="font-mono text-base block mt-0.5">{formatFCFA(margin)}</strong>
                      </div>
                      <span className="text-xs font-bold mt-1 text-emerald-700">{marginPercent}% de rentabilité</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Display measurements used */}
            {orderMeasure && (
              <div className="card-fox p-6 space-y-4">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
                  <Layers className="h-4.5 w-4.5 text-[#F05A22]" /> Mensurations appliquées
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Object.entries(orderMeasure.mensurations).map(([key, value]) => (
                    <div key={key} className="bg-[#FBF8F3] p-3 rounded-xl border border-stone-200/60 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block capitalize truncate">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">{value} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card-fox p-12 text-center text-stone-400">
            <Scissors className="h-10 w-10 mx-auto mb-3 text-stone-300" />
            <h3 className="text-sm font-bold text-stone-900">Aucune commande sélectionnée</h3>
            <p className="text-xs text-stone-500 mt-1">Sélectionnez une commande dans la liste pour voir les détails.</p>
          </div>
        )}
      </div>

      {/* MODAL: CREATE ORDER */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 mb-6">
              Créer une nouvelle commande
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Client Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Client *</label>
                <select 
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
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

              {/* Model & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Désignation du modèle *</label>
                  <input 
                    type="text"
                    required
                    value={modeleNom}
                    onChange={(e) => setModeleNom(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="Ex: Costume 3 pièces, Robe de soirée, Boubou VIP..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Catégorie *</label>
                  <select
                    value={modeleCategorie}
                    onChange={(e) => setModeleCategorie(e.target.value as any)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  >
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="enfant">Enfant</option>
                  </select>
                </div>
              </div>

              {/* Fiche Mesure selector based on chosen client */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Fiche de mesures à appliquer *</label>
                <select
                  value={ficheMesureId}
                  onChange={(e) => setFicheMesureId(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  required
                >
                  <option value="">Sélectionner une fiche de mesures...</option>
                  {ficheMesures
                    .filter(m => m.clientId === clientId)
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.typeVetement.replace('_', ' ')} (prise le {m.datePrise.split('-').reverse().join('/')})
                      </option>
                    ))}
                </select>
                {clientId && ficheMesures.filter(m => m.clientId === clientId).length === 0 && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    Attention : Ce client n'a pas encore de fiche de mesures. Créez d'abord ses mesures dans le volet Clients.
                  </p>
                )}
              </div>

              {/* Fabric Stock Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Tissu utilisé</label>
                  <select
                    value={tissuId}
                    onChange={(e) => setTissuId(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  >
                    <option value="">Tissu fourni par le client (hors stock)</option>
                    {tissus
                      .filter(t => !t.categorie || t.categorie === 'tissu')
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.designation} ({t.couleur}) — Reste {t.quantiteDisponible} {t.unite || 'm'}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Métrage requis (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={metrageRequis}
                    onChange={(e) => setMetrageRequis(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  />
                </div>
              </div>

              {/* Accessories & Additional Supplies */}
              <div className="border border-stone-200/80 p-4 bg-[#FBF8F3] rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-stone-800 block">
                  Accessoires & fournitures supplémentaires (boutons, zip, fil...)
                </span>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-medium text-stone-500 block">Choisir un accessoire</label>
                    <select
                      value={tempSupplyId}
                      onChange={(e) => setTempSupplyId(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    >
                      <option value="">-- Sélectionner --</option>
                      {tissus
                        .filter(t => t.categorie && t.categorie !== 'tissu')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.designation} ({t.couleur}) — Dispo: {t.quantiteDisponible} {t.unite || 'pièces'}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-24 space-y-1.5">
                    <label className="text-[11px] font-medium text-stone-500 block">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={tempSupplyQty}
                      onChange={(e) => setTempSupplyQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!tempSupplyId) return;
                      const existing = associatedSupplies.find(s => s.tissuId === tempSupplyId);
                      if (existing) {
                        setAssociatedSupplies(
                          associatedSupplies.map(s =>
                            s.tissuId === tempSupplyId
                              ? { ...s, quantite: s.quantite + tempSupplyQty }
                              : s
                          )
                        );
                      } else {
                        setAssociatedSupplies([
                          ...associatedSupplies,
                          { tissuId: tempSupplyId, quantite: tempSupplyQty }
                        ]);
                      }
                      setTempSupplyId('');
                      setTempSupplyQty(1);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-[#F05A22] text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1 shrink-0"
                  >
                    Ajouter
                  </button>
                </div>

                {/* List of associated supplies */}
                {associatedSupplies.length > 0 && (
                  <div className="space-y-2 max-h-36 overflow-y-auto border-t border-stone-200 pt-3">
                    {associatedSupplies.map((supply, idx) => {
                      const item = tissus.find(t => t.id === supply.tissuId);
                      if (!item) return null;
                      return (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md">
                              {item.categorie === 'bouton' ? 'Bouton' :
                               item.categorie === 'fermeture' ? 'Fermeture' :
                               item.categorie === 'fil' ? 'Fil' :
                               item.categorie === 'elastic' ? 'Élastique' : 'Accessoire'}
                            </span>
                            <span className="text-xs font-semibold text-stone-800">{item.designation}</span>
                            <span className="text-[11px] text-stone-500 font-mono">({item.couleur})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold bg-[#FBF8F3] border border-stone-200 px-2 py-0.5 rounded-lg text-stone-800">
                              {supply.quantite} {item.unite || 'pièces'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAssociatedSupplies(associatedSupplies.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price, Deposit & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Montant Total (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={montantTotal}
                    onChange={(e) => setMontantTotal(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Acompte versé</label>
                  <input
                    type="number"
                    required
                    value={acompteVerse}
                    onChange={(e) => setAcompteVerse(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Délai de Livraison *</label>
                  <input
                    type="date"
                    required
                    value={delaiLivraison}
                    onChange={(e) => setDelaiLivraison(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  />
                </div>
              </div>

              {/* Labor Cost row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Coût main-d'œuvre couturiers (FCFA)</label>
                  <input
                    type="number"
                    value={coutMainOeuvre}
                    onChange={(e) => setCoutMainOeuvre(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Profitability live preview card */}
              <div className="bg-[#FBF8F3] border border-stone-200/80 p-4 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-stone-700 block">📊 Analyse prévisionnelle des coûts & marge</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">Matières :</span>
                    <strong>{formatFCFA(totalMaterialsCost)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">Main-d'œuvre :</span>
                    <strong>{formatFCFA(coutMainOeuvre)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">Prix Revient :</span>
                    <strong>{formatFCFA(totalCostOfProduction)}</strong>
                  </div>
                </div>
                <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  grossMargin >= 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span>Marge brute prévisionnelle :</span>
                  <span>{formatFCFA(grossMargin)} ({marginPercent}%)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Remarques ou consignes de couture</label>
                <textarea
                  value={remarquesProduction}
                  onChange={(e) => setRemarquesProduction(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F05A22] h-20"
                  placeholder="Drapé ajusté à la main, broderies dorées au col..."
                />
              </div>

              {/* Actions buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-fox-primary flex-1 !py-2.5"
                >
                  Créer la commande
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
