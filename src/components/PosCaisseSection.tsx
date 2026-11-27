/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { ModePaiement, TicketCaisse, SortieCaisse, SessionCaisse, Facture } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Coins,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  Ban,
  Check,
  CheckCircle,
  FileText,
  Printer,
  Search,
  AlertCircle,
  Lock,
  Unlock,
  Calendar,
  User,
  Scissors,
  Wrench,
  Smartphone,
  CreditCard,
  CreditCard as CardIcon,
  Barcode,
  Trash2,
  ShoppingBag,
  UserPlus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Upload,
  Sparkles,
  Plus
} from 'lucide-react';

interface POSCategory {
  id: string;
  label: string;
  bg: string;
  text: string;
  img: string;
}

interface POSProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem {
  product: POSProduct;
  quantity: number;
}

const POS_CATEGORIES: POSCategory[] = [
  { id: 'CREATION_FEMME', label: 'CRÉATIONS FEMME', bg: 'bg-[#FFD3D3]', text: 'text-[#4E1E1E]', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&auto=format&fit=crop&q=60' },
  { id: 'CREATION_HOMME', label: 'CRÉATIONS HOMME', bg: 'bg-[#B1E1E1]', text: 'text-[#1F3D3D]', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&auto=format&fit=crop&q=60' },
  { id: 'RETOUCHES', label: 'RETOUCHES & SAV', bg: 'bg-[#FFEBA2]', text: 'text-[#4A3D0B]', img: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=100&auto=format&fit=crop&q=60' },
  { id: 'TISSUS_PREMIUM', label: 'TISSUS PREMIUM', bg: 'bg-[#CBE4B4]', text: 'text-[#2D3E1A]', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=60' },
  { id: 'MERCERIE', label: 'MERCERIE & ACCS', bg: 'bg-[#D2C8F9]', text: 'text-[#2D2254]', img: 'https://images.unsplash.com/photo-1520004481444-a95e04e9c716?w=100&auto=format&fit=crop&q=60' }
];

const POS_PRODUCTS: POSProduct[] = [
  // CRÉATIONS FEMME
  { id: 'pf1', name: 'ROBE DE MARIÉE SUR-MESURE', price: 450000, category: 'CREATION_FEMME', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop&q=60' },
  { id: 'pf2', name: 'ROBE DE SOIREE SUR-MESURE', price: 180000, category: 'CREATION_FEMME', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&auto=format&fit=crop&q=60' },
  { id: 'pf3', name: 'TAILLEUR JUPE / PANTALON', price: 120000, category: 'CREATION_FEMME', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&auto=format&fit=crop&q=60' },
  { id: 'pf4', name: 'GRAND BOUBOU CRÉATIF', price: 95000, category: 'CREATION_FEMME', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=60' },
  { id: 'pf5', name: 'ENSEMBLE WAX DESIGN', price: 75000, category: 'CREATION_FEMME', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60' },

  // CRÉATIONS HOMME
  { id: 'pm1', name: 'COSTUME TROIS PIÈCES GRANDE MESURE', price: 350000, category: 'CREATION_HOMME', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&auto=format&fit=crop&q=60' },
  { id: 'pm2', name: 'VESTE BLAZER HAUT DE GAMME', price: 150000, category: 'CREATION_HOMME', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=60' },
  { id: 'pm3', name: 'CHEMISE SUR-MESURE COL OFFICIER', price: 45000, category: 'CREATION_HOMME', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=60' },
  { id: 'pm4', name: 'PANTALON À PINCE DESIGN', price: 60000, category: 'CREATION_HOMME', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&auto=format&fit=crop&q=60' },
  { id: 'pm5', name: 'TISSUE TUNIQUE TRADITIONNELLE', price: 85000, category: 'CREATION_HOMME', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=60' },

  // RETOUCHES
  { id: 'pr1', name: 'OURLET SIMPLE PANTALON', price: 5000, category: 'RETOUCHES', image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200&auto=format&fit=crop&q=60' },
  { id: 'pr2', name: 'AJUSTEMENT / CINTRE DES TAILLES', price: 12000, category: 'RETOUCHES', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=200&auto=format&fit=crop&q=60' },
  { id: 'pr3', name: 'CHANGEMENT FERMETURE ÉCLAIR', price: 7500, category: 'RETOUCHES', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=60' },
  { id: 'pr4', name: 'RÉDUCTION DES MANCHES VESTE', price: 15000, category: 'RETOUCHES', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=200&auto=format&fit=crop&q=60' },
  { id: 'pr5', name: 'RÉFECTION COMPLÈTE DE ROBE', price: 25000, category: 'RETOUCHES', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop&q=60' },

  // TISSUS PREMIUM
  { id: 'pt1', name: 'TISSU WAX HOLLANDAIS (MÈTRE)', price: 12000, category: 'TISSUS_PREMIUM', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=60' },
  { id: 'pt2', name: 'TISSU BROCARD DE LUXE (MÈTRE)', price: 35000, category: 'TISSUS_PREMIUM', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=60' },
  { id: 'pt3', name: 'BASIN RICHE ORIGINAL (MÈTRE)', price: 25000, category: 'TISSUS_PREMIUM', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=60' },
  { id: 'pt4', name: 'SOIE NATURELLE ITALIENNE (MÈTRE)', price: 40000, category: 'TISSUS_PREMIUM', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&auto=format&fit=crop&q=60' },
  { id: 'pt5', name: 'LIN CRU PREMIUM (MÈTRE)', price: 18000, category: 'TISSUS_PREMIUM', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&auto=format&fit=crop&q=60' },

  // MERCERIE
  { id: 'pa1', name: 'BOUTONS DE LUXE EN NACRE (X6)', price: 8000, category: 'MERCERIE', image: 'https://images.unsplash.com/photo-1520004481444-a95e04e9c716?w=200&auto=format&fit=crop&q=60' },
  { id: 'pa2', name: 'CRAVATE EN SOIE FAITE MAIN', price: 22000, category: 'MERCERIE', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=200&auto=format&fit=crop&q=60' },
  { id: 'pa3', name: 'NŒUD PAPILLON EN WAX EXCLUSIF', price: 15000, category: 'MERCERIE', image: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=200&auto=format&fit=crop&q=60' },
  { id: 'pa4', name: 'POCHETTE EN SOIE DOUBLE-FACE', price: 10000, category: 'MERCERIE', image: 'https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=200&auto=format&fit=crop&q=60' },
  { id: 'pa5', name: 'BOBINE FIL ULTRA-RÉSISTANT (X3)', price: 3500, category: 'MERCERIE', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=60' }
];

export default function PosCaisseSection() {
  const {
    settings,
    clients,
    factures,
    commandes,
    retouches,
    sessionsCaisse,
    ticketsCaisse,
    sortiesCaisse,
    sessionCaisseActive,
    ouvrirSessionCaisse,
    cloturerSessionCaisse,
    addTicketCaisse,
    annulerTicketCaisse,
    addSortieCaisse,
    addFacture,
    addReglement,
    formatPrice
  } = useStore();

  // Navigation sub-tabs inside PosCaisseSection
  const [subTab, setSubTab] = useState<'active' | 'history'>('active');

  // Search and filter states
  const [searchTicketTerm, setSearchTicketTerm] = useState('');
  const [searchFactureTerm, setSearchFactureTerm] = useState('');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');

  // Modals / Dialog states
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isOutflowModalOpen, setIsOutflowModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedZReport, setSelectedZReport] = useState<SessionCaisse | null>(null);
  const [selectedTicketToPrint, setSelectedTicketToPrint] = useState<TicketCaisse | null>(null);

  // Form states
  const [initialFund, setInitialFund] = useState<number>(50000);

  useEffect(() => {
    if (settings.posFondDeCaisseDefaut !== undefined) {
      setInitialFund(settings.posFondDeCaisseDefaut);
    }
  }, [settings.posFondDeCaisseDefaut]);

  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [outflowAmount, setOutflowAmount] = useState<number>(0);
  const [outflowMotif, setOutflowMotif] = useState('');
  const [outflowJustif, setOutflowJustif] = useState('');

  // Ticket Form states
  const [ticketType, setTicketType] = useState<'invoice' | 'grouped' | 'free'>('invoice');
  const [selectedFactureId, setSelectedFactureId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<ModePaiement>('especes');

  useEffect(() => {
    if (settings.posModesPaiementActifs) {
      if (settings.posModesPaiementActifs.especes) {
        setPaymentMode('especes');
      } else if (settings.posModesPaiementActifs.mobile_money) {
        setPaymentMode('mobile_money');
      } else if (settings.posModesPaiementActifs.carte) {
        setPaymentMode('carte');
      } else if (settings.posModesPaiementActifs.virement) {
        setPaymentMode('virement');
      }
    }
  }, [settings.posModesPaiementActifs]);

  const [ticketAmount, setTicketAmount] = useState<number>(0);
  const [isMixedPayment, setIsMixedPayment] = useState(false);
  
  // Mixed payment breakdowns
  const [mixedEspeces, setMixedEspeces] = useState<number>(0);
  const [mixedElectronic, setMixedElectronic] = useState<number>(0);

  // Free sale states (vente libre)
  const [freeSaleClient, setFreeSaleClient] = useState<string>('');
  const [freeSaleDescription, setFreeSaleDescription] = useState('');
  const [freeSaleAmount, setFreeSaleAmount] = useState<number>(0);

  // Grouped payment states
  const [groupedClientId, setGroupedClientId] = useState<string>('');
  const [groupedAllocations, setGroupedAllocations] = useState<{[factureId: string]: number}>({});

  // Ticket cancellation state
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);
  const [cancellationMotif, setCancellationMotif] = useState('');

  // Modern Tactile POS States
  const [posMode, setPosMode] = useState<'tactile' | 'invoices'>('tactile');
  const [selectedCategory, setSelectedCategory] = useState<string>('CREATION_FEMME');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearchTerm, setPosSearchTerm] = useState<string>('');
  const [cartClientId, setCartClientId] = useState<string>('');
  const [cartNote, setCartNote] = useState<string>('');
  const [isTactileCheckoutOpen, setIsTactileCheckoutOpen] = useState<boolean>(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(0);
  const [mobilePosTab, setMobilePosTab] = useState<'cart' | 'catalog'>('catalog');

  // Current session calculations
  const activeSessionTickets = useMemo(() => {
    if (!sessionCaisseActive) return [];
    return ticketsCaisse.filter(t => t.sessionId === sessionCaisseActive.id);
  }, [ticketsCaisse, sessionCaisseActive]);

  const activeSessionOutflows = useMemo(() => {
    if (!sessionCaisseActive) return [];
    return sortiesCaisse.filter(o => o.sessionId === sessionCaisseActive.id);
  }, [sortiesCaisse, sessionCaisseActive]);

  // Current session live totals
  const sessionTotals = useMemo(() => {
    if (!sessionCaisseActive) return { cash: 0, electronic: 0, outflow: 0, total: 0 };
    
    let cash = 0;
    let electronic = 0;

    activeSessionTickets.forEach(t => {
      if (t.statut !== 'valide') return;
      if (t.detailsMode) {
        cash += t.detailsMode.especes || 0;
        electronic += (t.detailsMode.mobile_money || 0) + (t.detailsMode.virement || 0) + (t.detailsMode.carte || 0);
      } else {
        if (t.modePaiement === 'especes') {
          cash += t.montant;
        } else {
          electronic += t.montant;
        }
      }
    });

    const outflow = activeSessionOutflows.reduce((acc, o) => acc + o.montant, 0);

    return {
      cash,
      electronic,
      outflow,
      total: sessionCaisseActive.fondInitial + cash - outflow
    };
  }, [sessionCaisseActive, activeSessionTickets, activeSessionOutflows]);

  // Outstanding unpaid/partially paid invoices list for ticket selection
  const unpaidInvoices = useMemo(() => {
    return factures.filter(f => f.statut !== 'paye');
  }, [factures]);

  // Filtered lists
  const filteredUnpaidInvoices = useMemo(() => {
    if (!searchFactureTerm) return unpaidInvoices;
    const term = searchFactureTerm.toLowerCase();
    return unpaidInvoices.filter(f => {
      const client = clients.find(c => c.id === f.clientId);
      const name = client ? `${client.prenom} ${client.nom}`.toLowerCase() : '';
      const order = f.commandeId ? commandes.find(c => c.id === f.commandeId) : null;
      const model = order ? order.nomModele.toLowerCase() : '';
      return (
        f.numero.toLowerCase().includes(term) ||
        name.includes(term) ||
        model.includes(term) ||
        (f.designationDirecte && f.designationDirecte.toLowerCase().includes(term))
      );
    });
  }, [unpaidInvoices, searchFactureTerm, clients, commandes]);

  // Tactile POS Helper Memos & Functions
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const filteredPOSProducts = useMemo(() => {
    let prods = POS_PRODUCTS;
    if (selectedCategory && posSearchTerm.trim() === '') {
      prods = prods.filter(p => p.category === selectedCategory);
    }
    if (posSearchTerm.trim() !== '') {
      const s = posSearchTerm.toLowerCase();
      prods = POS_PRODUCTS.filter(p => p.name.toLowerCase().includes(s));
    }
    return prods;
  }, [selectedCategory, posSearchTerm]);

  const handleAddToCart = (product: POSProduct) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveOneFromCart = (productId: string) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter(item => item.product.id !== productId);
    });
  };

  const handleDeleteFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCartNote('');
  };

  const printThermalTicketDirectly = (ticket: TicketCaisse) => {
    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open('about:blank', uniqueName, 'left=50,top=50,width=400,height=600,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up.');
      return;
    }

    const paperWidth = settings.ticketLargeur === '58mm' ? '58mm' : '80mm';

    const headerHtml = `
      <div style="border-bottom: 2px dashed #000; padding-bottom: 10px; text-align: center; margin-bottom: 10px;">
        ${settings.ticketEnTete ? `<span style="font-size: 8px; text-transform: uppercase; color: #555; background: #eee; padding: 2px 4px; display: inline-block; margin-bottom: 5px;">${settings.ticketEnTete}</span>` : ''}
        <h2 style="font-size: 1.4em; font-weight: bold; margin: 2px 0; text-transform: uppercase;">${settings.raisonSociale}</h2>
        ${(settings.ticketAfficherSlogan ?? true) && settings.slogan ? `<p style="font-size: 0.9em; margin: 2px 0; text-transform: uppercase;">${settings.slogan}</p>` : ''}
        <p style="margin: 2px 0; font-size: 0.85em; color: #333;">${settings.adresse}</p>
        <p style="margin: 2px 0; font-size: 0.85em; color: #333;">Tél: ${settings.telephone}</p>
        ${(settings.ticketAfficherNinea ?? true) && settings.ninea ? `<p style="margin: 2px 0; font-size: 0.85em; color: #333;">Ninea: ${settings.ninea}</p>` : ''}
      </div>
    `;

    const detailsHtml = `
      <div style="border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; font-size: 0.9em; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between;"><span>TICKET N°:</span><span><strong>${ticket.numero}</strong></span></div>
        <div style="display: flex; justify-content: space-between;"><span>DATE:</span><span>${new Date(ticket.dateHeure).toLocaleString('fr-FR')}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>CAISSIER:</span><span>RESPONSABLE POS</span></div>
        <div style="display: flex; justify-content: space-between;"><span>STATUT:</span><span><strong>${ticket.statut === 'valide' ? 'VALIDÉ / PAYÉ' : 'ANNULÉ'}</strong></span></div>
      </div>
    `;

    const txType = ticket.typeVente === 'commande_acompte' ? 'ACOMPTE SUR COMMANDE'
      : ticket.typeVente === 'commande_solde' ? 'SOLDE DE COMMANDE'
      : ticket.typeVente === 'retouche' ? 'SAV / RETOUCHE' : 'VENTE DIRECTE COMPTOIR';

    const transHtml = `
      <div style="border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; font-size: 0.9em;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${txType}</span>
          <span>1x</span>
        </div>
        ${ticket.descriptionLibre ? `<p style="margin: 4px 0 0 0; font-style: italic; font-size: 0.85em; color: #444;">« ${ticket.descriptionLibre} »</p>` : ''}
      </div>
    `;

    const totalHtml = `
      <div style="font-size: 0.95em; line-height: 1.4; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px;">
          <span>NET À PAYER :</span>
          <span>${formatPrice(ticket.montant)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>MODE RÈGLEMENT:</span>
          <span><strong>${ticket.detailsMode ? 'PAIEMENT MIXTE' : ticket.modePaiement.toUpperCase()}</strong></span>
        </div>
        ${ticket.detailsMode ? `
          <div style="background: #f9f9f9; padding: 4px; border: 1px solid #ddd; font-size: 0.85em; margin-top: 4px;">
            <div style="display: flex; justify-content: space-between;"><span>• Espèces reçues:</span><span>${formatPrice(ticket.detailsMode.especes || 0)}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>• Part électronique:</span><span>${formatPrice(ticket.montant - (ticket.detailsMode.especes || 0))}</span></div>
          </div>
        ` : ''}
      </div>
    `;

    const footerHtml = `
      <div style="border-top: 2px dashed #000; padding-top: 8px; text-align: center; font-size: 0.85em; line-height: 1.3; color: #333;">
        <p style="font-weight: bold; margin: 2px 0;">${settings.ticketRemerciement || 'MERCI DE VOTRE CONFIANCE !'}</p>
        ${settings.ticketBasPage ? `<p style="margin: 2px 0; font-style: italic;">${settings.ticketBasPage}</p>` : ''}
        <p style="font-size: 0.75em; margin: 4px 0 0 0; color: #777;">Logiciel Foxfy Services v2.1</p>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${ticket.numero}</title>
          <style>
            @page { size: ${paperWidth} auto; margin: 0; }
            body { font-family: 'Courier New', Courier, monospace; color: #000; background: #FFF; margin: 4mm; padding: 0; width: calc(${paperWidth} - 8mm); box-sizing: border-box; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${headerHtml}
          ${detailsHtml}
          ${transHtml}
          ${totalHtml}
          ${footerHtml}
        </body>
      </html>
    `);
  };

  const exportZReportToCSV = (report: SessionCaisse) => {
    const reportTickets = ticketsCaisse.filter(t => t.sessionId === report.id);
    const reportOutflows = sortiesCaisse.filter(o => o.sessionId === report.id);
    
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'RAPPORT DE CAISSE Z (COMPTABLE)\n';
    csv += `Société;${settings.raisonSociale}\n`;
    csv += `ID Session;${report.id.toUpperCase()}\n`;
    csv += `Date Ouverture;${new Date(report.dateOuverture).toLocaleString('fr-FR')}\n`;
    csv += `Date Clôture;${report.dateCloture ? new Date(report.dateCloture).toLocaleString('fr-FR') : 'Non clôturée'}\n`;
    csv += `Statut;${report.statut === 'ouverte' ? 'OUVERTE' : 'CLOTUREE'}\n\n`;
    
    csv += 'SOLDE FINANCIER\n';
    csv += `Fond initial;${report.fondInitial}\n`;
    if (report.recapModes) {
      csv += `Total Espèces;${report.recapModes.especes}\n`;
      csv += `Total Mobile Money;${report.recapModes.mobile_money}\n`;
      csv += `Total Carte Bancaire;${report.recapModes.carte}\n`;
      csv += `Total Virement;${report.recapModes.virement}\n`;
    }
    const totalOut = reportOutflows.reduce((acc, o) => acc + o.montant, 0);
    csv += `Total Sorties de Caisse (Dépenses);${totalOut}\n`;
    csv += `Solde Théorique Attendu;${report.montantTheorique}\n`;
    csv += `Solde Physique Compté;${report.montantCompte !== undefined ? report.montantCompte : 'N/A'}\n`;
    csv += `Écart de Caisse;${report.ecart !== undefined ? report.ecart : 'N/A'}\n\n`;
    
    csv += 'DETAIL DES TICKETS DE CAISSE ENCAISSES\n';
    csv += 'Ticket N°;Date;Type Vente;Description;Mode Règlement;Montant\n';
    reportTickets.forEach(t => {
      const typeStr = t.typeVente === 'commande_acompte' ? 'Acompte'
        : t.typeVente === 'commande_solde' ? 'Solde'
        : t.typeVente === 'retouche' ? 'Retouche' : 'Vente Comptoir';
      const desc = t.descriptionLibre ? t.descriptionLibre.replace(/;/g, ' ') : '';
      const mode = t.detailsMode ? 'Paiement Mixte' : t.modePaiement.toUpperCase();
      csv += `${t.numero};${new Date(t.dateHeure).toLocaleDateString('fr-FR')};${typeStr};${desc};${mode};${t.montant}\n`;
    });
    csv += '\n';
    
    csv += 'DETAIL DES SORTIES DE CAISSE (DEPENSES)\n';
    csv += 'Date;Motif/Justification;Montant\n';
    reportOutflows.forEach(o => {
      const motif = o.motif.replace(/;/g, ' ');
      csv += `${new Date(o.dateHeure).toLocaleDateString('fr-FR')};${motif};${o.montant}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Rapport_Z_Caisse_${report.id.slice(0,8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppTicket = (ticket: TicketCaisse) => {
    let client: any = null;
    let detailsLabel = '';

    // 1. Resolve client via invoice
    if (ticket.factureId) {
      const fact = factures.find(f => f.id === ticket.factureId);
      if (fact) {
        client = clients.find(c => c.id === fact.clientId);
        detailsLabel = `Facture ${fact.numero}`;
      }
    }
    // 2. Resolve client via command if not found
    if (!client && ticket.commandeId) {
      const cmd = commandes.find(c => c.id === ticket.commandeId);
      if (cmd) {
        client = clients.find(c => c.id === cmd.clientId);
        detailsLabel = `Commande ${cmd.reference}`;
      }
    }

    // fallback descriptive label
    if (!detailsLabel) {
      detailsLabel = ticket.descriptionLibre || 'Achat boutique';
    }

    // Build receipt message
    let msg = `*REÇU DE CAISSE - ${settings.raisonSociale.toUpperCase()}*\n`;
    msg += `----------------------------------------\n`;
    msg += `Ticket N° : ${ticket.numero}\n`;
    msg += `Date/Heure : ${new Date(ticket.dateHeure).toLocaleString('fr-FR')}\n`;
    msg += `Objet/Détail : ${detailsLabel}\n`;
    msg += `Montant Payé : ${formatPrice(ticket.montant)}\n`;
    
    if (ticket.detailsMode) {
      msg += `Mode de règlement (Mixte) :\n`;
      if (ticket.detailsMode.especes) msg += `- Espèces : ${formatPrice(ticket.detailsMode.especes)}\n`;
      if (ticket.detailsMode.mobile_money) msg += `- Mobile Money : ${formatPrice(ticket.detailsMode.mobile_money)}\n`;
      if (ticket.detailsMode.carte) msg += `- Carte Bancaire : ${formatPrice(ticket.detailsMode.carte)}\n`;
      if (ticket.detailsMode.virement) msg += `- Virement : ${formatPrice(ticket.detailsMode.virement)}\n`;
    } else {
      const modeLabels: Record<string, string> = {
        especes: 'Espèces',
        mobile_money: 'Mobile Money',
        carte: 'Carte Bancaire',
        virement: 'Virement'
      };
      msg += `Mode de règlement : ${modeLabels[ticket.modePaiement] || ticket.modePaiement}\n`;
    }
    
    msg += `----------------------------------------\n`;
    msg += `Merci pour votre confiance !\n`;
    msg += `Contact : ${settings.telephone || ''}\n`;
    msg += `Adresse : ${settings.adresse || ''}`;

    let phone = '';
    if (client) {
      phone = client.telephone;
    } else {
      // Prompt for phone number if not found
      const response = window.prompt("Entrez le numéro de téléphone WhatsApp du client (ex: 22177xxxxxxx) :", "");
      if (response === null) return; // user cancelled
      phone = response;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const finalPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
    
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || customItemPrice <= 0) return;
    const customProd: POSProduct = {
      id: `custom-${Date.now()}`,
      name: customItemName.toUpperCase(),
      price: customItemPrice,
      category: 'ENTREE',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=60'
    };
    handleAddToCart(customProd);
    setCustomItemName('');
    setCustomItemPrice(0);
    setIsCustomItemModalOpen(false);
  };

  const handleConfirmTactileCheckout = (mode: ModePaiement, isMixed: boolean, cashVal: number, elecVal: number, elecMode: ModePaiement) => {
    if (cart.length === 0) return;

    // 1. Choose a client (defaults to first client if not specified, or fallback)
    const clientToUse = cartClientId || (clients[0]?.id || '');
    if (!clientToUse) {
      alert('Veuillez ajouter un client ou en configurer un par défaut.');
      return;
    }

    // 2. Build full description of items
    const itemsDescription = cart.map(item => `${item.product.name} (x${item.quantity})`).join(', ');
    const finalDescription = cartNote ? `Vente tactile: ${itemsDescription}. Note: ${cartNote}` : `Vente tactile: ${itemsDescription}`;

    // 3. Create simplified invoice in database
    const newFact = addFacture({
      clientId: clientToUse,
      montantTotal: cartTotal,
      designationDirecte: finalDescription
    });

    // 4. Create details mode if mixed payment
    const detailsMode = isMixed ? {
      especes: cashVal,
      mobile_money: elecMode === 'mobile_money' ? elecVal : undefined,
      carte: elecMode === 'carte' ? elecVal : undefined,
      virement: elecMode === 'virement' ? elecVal : undefined,
    } : undefined;

    // 5. Add cash register ticket
    const newTkt = addTicketCaisse({
      montant: cartTotal,
      modePaiement: isMixed ? 'especes' : mode,
      detailsMode,
      factureId: newFact.id,
      caissierId: 'emp-1',
      typeVente: 'vente_libre',
      descriptionLibre: finalDescription
    });

    // 6. Show printer success, clear cart and note, close checkout modal
    setSelectedTicketToPrint(newTkt);
    setCart([]);
    setCartNote('');
    setCartClientId('');
    setIsTactileCheckoutOpen(false);
  };

  const filteredActiveTickets = useMemo(() => {
    const term = searchTicketTerm.toLowerCase();
    return activeSessionTickets.filter(t => {
      return (
        t.numero.toLowerCase().includes(term) ||
        t.typeVente.toLowerCase().includes(term) ||
        (t.descriptionLibre && t.descriptionLibre.toLowerCase().includes(term))
      );
    });
  }, [activeSessionTickets, searchTicketTerm]);

  const filteredSessionHistory = useMemo(() => {
    const term = searchHistoryTerm.toLowerCase();
    return sessionsCaisse.filter(s => {
      return (
        s.id.toLowerCase().includes(term) ||
        s.statut.toLowerCase().includes(term) ||
        s.dateOuverture.toLowerCase().includes(term)
      );
    }).sort((a, b) => b.dateOuverture.localeCompare(a.dateOuverture));
  }, [sessionsCaisse, searchHistoryTerm]);

  // Handler functions
  const handleOpenCaisse = (e: React.FormEvent) => {
    e.preventDefault();
    ouvrirSessionCaisse(initialFund, 'emp-1'); // emp-1 as placeholder for current user session
    setIsOpeningModalOpen(false);
  };

  const handleCloseCaisse = (e: React.FormEvent) => {
    e.preventDefault();
    cloturerSessionCaisse(actualCashCounted);
    setIsClosingModalOpen(false);
  };

  const handleAddOutflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (outflowAmount <= 0 || !outflowMotif) {
      alert('Veuillez spécifier un montant supérieur à 0 et un motif de sortie de caisse.');
      return;
    }
    addSortieCaisse({
      montant: outflowAmount,
      motif: outflowMotif,
      justificatif: outflowJustif || undefined,
      responsableId: 'emp-1'
    });
    setOutflowAmount(0);
    setOutflowMotif('');
    setOutflowJustif('');
    setIsOutflowModalOpen(false);
  };

  const handleGroupedClientChange = (clientId: string) => {
    setGroupedClientId(clientId);
    const invoices = factures.filter(f => f.clientId === clientId && f.statut !== 'paye');
    const initialAllocs: {[id: string]: number} = {};
    let totalAllocs = 0;
    invoices.forEach(f => {
      initialAllocs[f.id] = f.soldeDu;
      totalAllocs += f.soldeDu;
    });
    setGroupedAllocations(initialAllocs);
    setTicketAmount(totalAllocs);

    if (isMixedPayment) {
      const half = Math.floor(totalAllocs / 2);
      setMixedEspeces(half);
      setMixedElectronic(totalAllocs - half);
    }
  };

  const handleAllocationChange = (factureId: string, amount: number) => {
    const updated = { ...groupedAllocations, [factureId]: amount };
    setGroupedAllocations(updated);
    
    // Calculate total ticket amount
    const total = (Object.values(updated) as number[]).reduce((sum, val) => sum + val, 0);
    setTicketAmount(total);

    // If mixed payment, recalculate half-half
    if (isMixedPayment) {
      const half = Math.floor(total / 2);
      setMixedEspeces(half);
      setMixedElectronic(total - half);
    }
  };

  const handleOpenTicketModal = (facture?: Facture) => {
    if (facture) {
      setTicketType('invoice');
      setSelectedFactureId(facture.id);
      setTicketAmount(facture.soldeDu);
    } else {
      setTicketType('invoice');
      setSelectedFactureId('');
      setTicketAmount(0);
    }
    setFreeSaleDescription('');
    setFreeSaleAmount(0);
    if (clients.length > 0) {
      setFreeSaleClient(clients[0].id);
      setGroupedClientId(clients[0].id);
      handleGroupedClientChange(clients[0].id);
    }
    setIsMixedPayment(false);
    setMixedEspeces(0);
    setMixedElectronic(0);
    setPaymentMode('especes');
    setIsTicketModalOpen(true);
  };

  const handleFactureSelectionChange = (factId: string) => {
    setSelectedFactureId(factId);
    const fact = factures.find(f => f.id === factId);
    if (fact) {
      setTicketAmount(fact.soldeDu);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (ticketType === 'invoice') {
      const fact = factures.find(f => f.id === selectedFactureId);
      if (!fact) {
        alert('Veuillez sélectionner une facture.');
        return;
      }
      if (ticketAmount <= 0) {
        alert('Veuillez saisir un montant de règlement valide supérieur à 0.');
        return;
      }
      if (ticketAmount > fact.soldeDu) {
        alert(`Erreur : Le règlement (${formatPrice(ticketAmount)}) dépasse le solde restant dû de la facture (${formatPrice(fact.soldeDu)}).`);
        return;
      }

      const client = clients.find(c => c.id === fact.clientId);
      const isAcompte = fact.reglements.length === 0;

      const detailsMode = isMixedPayment ? {
        especes: mixedEspeces,
        mobile_money: paymentMode === 'mobile_money' ? mixedElectronic : undefined,
        carte: paymentMode === 'carte' ? mixedElectronic : undefined,
        virement: paymentMode === 'virement' ? mixedElectronic : undefined,
      } : undefined;

      const newTkt = addTicketCaisse({
        montant: ticketAmount,
        modePaiement: isMixedPayment ? 'especes' : paymentMode, // Primary mode
        detailsMode,
        factureId: fact.id,
        commandeId: fact.commandeId,
        caissierId: 'emp-1',
        typeVente: isAcompte ? 'commande_acompte' : 'commande_solde',
      });

      setSelectedTicketToPrint(newTkt);
      setIsTicketModalOpen(false);

    } else if (ticketType === 'grouped') {
      const client = clients.find(c => c.id === groupedClientId);
      if (!client) {
        alert('Veuillez choisir un client.');
        return;
      }
      if (ticketAmount <= 0) {
        alert('Veuillez allouer au moins un montant supérieur à 0.');
        return;
      }

      // Validate allocations are not exceeding soldeDu
      const invalidAlloc = Object.entries(groupedAllocations).find(([fId, amt]) => {
        const fact = factures.find(f => f.id === fId);
        return fact && (amt as number) > fact.soldeDu;
      });
      if (invalidAlloc) {
        const fact = factures.find(f => f.id === invalidAlloc[0]);
        alert(`Le montant alloué à la facture #${fact?.numero} dépasse son solde restant dû (${formatPrice(fact?.soldeDu || 0)}).`);
        return;
      }

      // Generate description string for audit trail
      const detailsArray: string[] = [];
      Object.entries(groupedAllocations).forEach(([fId, amt]) => {
        const numAmt = amt as number;
        if (numAmt <= 0) return;
        const fact = factures.find(f => f.id === fId);
        if (fact) {
          detailsArray.push(`#${fact.numero} (${formatPrice(numAmt)})`);
        }
      });
      const detailsString = detailsArray.join(', ');

      const detailsMode = isMixedPayment ? {
        especes: mixedEspeces,
        mobile_money: paymentMode === 'mobile_money' ? mixedElectronic : undefined,
        carte: paymentMode === 'carte' ? mixedElectronic : undefined,
        virement: paymentMode === 'virement' ? mixedElectronic : undefined,
      } : undefined;

      // 1. Add unified ticket as vente_libre for totals calculation
      const newTkt = addTicketCaisse({
        montant: ticketAmount,
        modePaiement: isMixedPayment ? 'especes' : paymentMode,
        detailsMode,
        caissierId: 'emp-1',
        typeVente: 'vente_libre',
        descriptionLibre: `Règlement groupé client: ${client.prenom.toUpperCase()} ${client.nom.toUpperCase()}. Factures: ${detailsString}`
      });

      // 2. Add individual reglements to each invoice
      Object.entries(groupedAllocations).forEach(([fId, amt]) => {
        const numAmt = amt as number;
        if (numAmt <= 0) return;
        addReglement(fId, {
          montant: numAmt,
          mode: isMixedPayment ? 'especes' : paymentMode,
          reference: newTkt.numero
        });
      });

      setSelectedTicketToPrint(newTkt);
      setIsTicketModalOpen(false);

    } else {
      // Vente libre / Vente d'accessoires sans commande initiale
      if (!freeSaleClient) {
        alert('Veuillez choisir un client pour cette vente libre.');
        return;
      }
      if (!freeSaleDescription || freeSaleAmount <= 0) {
        alert('Veuillez saisir une description et un montant valide.');
        return;
      }

      // 1. Generate simplified invoice automatically (as mandated by rule)
      const newFact = addFacture({
        clientId: freeSaleClient,
        montantTotal: freeSaleAmount,
        designationDirecte: `Vente Comptoir : ${freeSaleDescription}`
      });

      // 2. Add ticket linked to the new invoice
      const detailsMode = isMixedPayment ? {
        especes: mixedEspeces,
        mobile_money: paymentMode === 'mobile_money' ? mixedElectronic : undefined,
        carte: paymentMode === 'carte' ? mixedElectronic : undefined,
        virement: paymentMode === 'virement' ? mixedElectronic : undefined,
      } : undefined;

      const newTkt = addTicketCaisse({
        montant: freeSaleAmount,
        modePaiement: isMixedPayment ? 'especes' : paymentMode,
        detailsMode,
        factureId: newFact.id,
        caissierId: 'emp-1',
        typeVente: 'vente_libre',
        descriptionLibre: freeSaleDescription
      });

      setSelectedTicketToPrint(newTkt);
      setIsTicketModalOpen(false);
    }
  };

  const handleCancelTicketClick = (id: string) => {
    setCancellingTicketId(id);
    setCancellationMotif('');
  };

  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingTicketId || !cancellationMotif) return;
    annulerTicketCaisse(cancellingTicketId, cancellationMotif);
    setCancellingTicketId(null);
  };

  return (
    <div className="space-y-6" id="pos_caisse_workspace">
      {/* Visual Workspace Hero Banner */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black text-atelier-gold border-2 border-black">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tight text-slate-950 dark:text-white">
              Caisse & Point de Vente (POS)
            </h2>
            <p className="font-serif text-xs text-slate-500 mt-1">
              Gérez efficacement les encaissements au comptoir, l'émission de tickets, les dépenses courantes et les rapports Z de clôture.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 border border-black max-w-xs shrink-0 self-start md:self-center">
          <button
            onClick={() => setSubTab('active')}
            className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider text-center transition cursor-pointer ${
              subTab === 'active'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'text-slate-600 hover:text-black dark:text-zinc-400'
            }`}
          >
            Session Active
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider text-center transition cursor-pointer ${
              subTab === 'history'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'text-slate-600 hover:text-black dark:text-zinc-400'
            }`}
          >
            Historique & rapports
          </button>
        </div>
      </div>

      {subTab === 'active' && (
        !sessionCaisseActive ? (
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto text-center my-10">
            <div className="inline-flex p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 mb-4 rounded-none">
              <Lock className="h-10 w-10 animate-bounce" />
            </div>
            <h4 className="font-display font-black text-slate-950 dark:text-white uppercase text-base tracking-wider">Session de caisse fermée</h4>
            <p className="text-xs text-slate-500 font-serif mt-2 max-w-sm mx-auto leading-relaxed">
              Une session de caisse doit être obligatoirement ouverte au démarrage de l'activité pour encaisser des tickets comptoir, utiliser le Point de Vente tactile ou enregistrer des dépenses.
            </p>
            
            <button
              onClick={() => setIsOpeningModalOpen(true)}
              className="mt-6 w-full py-2.5 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Unlock className="h-4 w-4" /> Ouvrir la session de caisse
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Touch POS Header Bar - Replicating User Screenshot */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left Tabs & Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 border border-black rounded-none">
                  <button
                    onClick={() => setPosMode('tactile')}
                    className={`py-1.5 px-4 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                      posMode === 'tactile'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'text-slate-600 hover:text-black dark:text-zinc-400'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Caisse (Tactile)
                  </button>
                  <button
                    onClick={() => setPosMode('invoices')}
                    className={`py-1.5 px-4 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                      posMode === 'invoices'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'text-slate-600 hover:text-black dark:text-zinc-400'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" /> Commandes / Factures
                  </button>
                </div>

                <button
                  onClick={handleClearCart}
                  className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-300 transition cursor-pointer"
                  title="Réinitialiser / Nouveau Ticket"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <div className="px-3 py-1.5 bg-[#E6FFFA] text-[#006D5B] border border-[#00A389]/20 font-mono font-black text-xs uppercase tracking-widest">
                  Table / Ticket #1005
                </div>
              </div>

              {/* Right Search, Barcode & Register settings */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {posMode === 'tactile' && (
                  <div className="relative max-w-xs w-full sm:w-60">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={posSearchTerm}
                      onChange={(e) => setPosSearchTerm(e.target.value)}
                      placeholder="Rechercher des produits..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-black focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 border border-black hover:bg-slate-200 transition cursor-pointer" title="Lecteur Code Barre Simulé">
                  <Barcode className="h-4 w-4 text-black dark:text-white" />
                </div>

                {/* Session Manager Mini control */}
                <div className="flex items-center gap-1">
                  <div className="hidden lg:flex flex-col text-right pr-2 border-r border-dashed border-black/20">
                    <span className="text-[8px] font-black uppercase text-slate-400">Solde Caisse</span>
                    <strong className="text-xs font-mono font-black text-emerald-600">{formatPrice(sessionTotals.total)}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setActualCashCounted(sessionTotals.total);
                      setIsClosingModalOpen(true);
                    }}
                    className="p-1.5 bg-zinc-950 hover:bg-rose-600 text-white transition flex items-center gap-1 text-[10px] uppercase font-black tracking-widest border border-black cursor-pointer"
                    title="Clôturer la journée"
                  >
                    <Lock className="h-3.5 w-3.5 text-atelier-gold" /> Fermer Session
                  </button>
                  <button
                    onClick={() => setIsOutflowModalOpen(true)}
                    className="p-1.5 bg-slate-100 text-black hover:bg-black hover:text-white transition flex items-center gap-1 text-[10px] uppercase font-black tracking-widest border border-black cursor-pointer"
                    title="Enregistrer une dépense courante"
                  >
                    <MinusCircle className="h-3.5 w-3.5 text-rose-500" /> Dépense
                  </button>
                </div>
              </div>
            </div>

            {posMode === 'tactile' ? (
              /* MODERN TACTILE POS VIEW MODE */
              <div className="space-y-4">
                {/* Mobile Tab Selector (only visible below lg) */}
                <div className="flex lg:hidden border-2 border-black">
                  <button
                    type="button"
                    onClick={() => setMobilePosTab('catalog')}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest text-center transition cursor-pointer ${
                      mobilePosTab === 'catalog' ? 'bg-black text-white' : 'bg-white text-black dark:bg-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    🛍️ Catalogue
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobilePosTab('cart')}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest text-center transition border-l border-black cursor-pointer ${
                      mobilePosTab === 'cart' ? 'bg-black text-white' : 'bg-white text-black dark:bg-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    📋 Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: THE SHOPPING CART (cols 4) */}
                  <div className={`lg:col-span-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[620px] ${
                    mobilePosTab === 'cart' ? 'flex' : 'hidden lg:flex'
                  }`}>
                    <div>
                    <div className="flex justify-between items-center pb-3 border-b border-black/10 mb-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-atelier-gold" />
                        <h4 className="font-display font-black text-sm uppercase tracking-wider text-slate-950 dark:text-white">Ticket Courant</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 border border-black/10">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} Article(s)
                      </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-3 max-h-[340px] overflow-y-auto sidebar-scroll pr-1">
                      {cart.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-dashed border-black/20 text-slate-300">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-xs font-serif text-slate-500">Votre panier est vide.</p>
                            <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mt-0.5">Cliquez sur un article à droite pour l'ajouter</p>
                          </div>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-zinc-950 border border-black/10 rounded-none text-xs hover:bg-slate-100/50 transition">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 object-cover border border-black/10"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-black text-[10px] block truncate uppercase text-slate-900 dark:text-zinc-100">{item.product.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{formatPrice(item.product.price)}</span>
                            </div>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRemoveOneFromCart(item.product.id)}
                                className="h-5 w-5 bg-white border border-black flex items-center justify-center font-bold text-xs hover:bg-slate-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-xs w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleAddToCart(item.product)}
                                className="h-5 w-5 bg-white border border-black flex items-center justify-center font-bold text-xs hover:bg-slate-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right pl-1 min-w-[70px]">
                              <span className="font-mono font-black text-[11px] block text-slate-900 dark:text-zinc-100">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteFromCart(item.product.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition ml-1 cursor-pointer"
                              title="Retirer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions & Checkouts on Left Sidebar Bottom */}
                  <div className="pt-4 border-t border-black/10 space-y-3 mt-4 bg-slate-50 dark:bg-zinc-950 p-3 border border-black/5">
                    {/* Client Selection in Cart */}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Rattacher Client</label>
                      <select
                        value={cartClientId}
                        onChange={(e) => setCartClientId(e.target.value)}
                        className="w-full p-1.5 text-xs bg-white dark:bg-zinc-900 border border-black rounded-none font-bold uppercase focus:outline-hidden"
                      >
                        <option value="">👤 CLIENT VENT DIRECT (PASSAGE)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            👤 {c.prenom.toUpperCase()} {c.nom.toUpperCase()} ({c.telephone})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Note input */}
                    <div>
                      <input
                        type="text"
                        value={cartNote}
                        onChange={(e) => setCartNote(e.target.value)}
                        placeholder="Consignes, taille ou remarque (ex: À emporter...)"
                        className="w-full p-1.5 text-xs bg-white dark:bg-zinc-900 border border-black focus:outline-hidden"
                      />
                    </div>

                    {/* Custom sale / quick custom item */}
                    <button
                      onClick={() => {
                        setCustomItemName('');
                        setCustomItemPrice(0);
                        setIsCustomItemModalOpen(true);
                      }}
                      className="w-full py-1 bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-black uppercase tracking-wider border border-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Ajouter un Article personnalisé
                    </button>

                    {/* Subtotals & Actions */}
                    <div className="pt-2 border-t border-dashed border-black/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Montant Total à Payer :</span>
                        <strong className="text-xl font-mono font-black text-slate-950 dark:text-white">
                          {formatPrice(cartTotal)}
                        </strong>
                      </div>

                      <div className="flex gap-2">
                        {/* Clear Cart */}
                        <button
                          onClick={handleClearCart}
                          className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-600 border border-slate-300 hover:border-rose-300 flex items-center justify-center cursor-pointer"
                          title="Vider le panier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {/* Note Toggle Icon (just cosmetic helper) */}
                        <button
                          onClick={() => setCartNote('À Emporter')}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center cursor-pointer"
                          title="Mettre en Note Rapide: À Emporter"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setCartNote('Urgent! couture / retouche')}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center cursor-pointer"
                          title="Plus d'options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Big pay button */}
                        <button
                          disabled={cart.length === 0}
                          onClick={() => {
                            setTicketAmount(cartTotal);
                            const half = Math.floor(cartTotal / 2);
                            setMixedEspeces(half);
                            setMixedElectronic(cartTotal - half);
                            setIsTactileCheckoutOpen(true);
                          }}
                          className={`flex-1 py-2 text-xs font-black uppercase tracking-widest text-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition flex items-center justify-center gap-1.5 ${
                            cart.length === 0
                              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                              : 'bg-atelier-gold text-slate-950 hover:bg-black hover:text-white cursor-pointer'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" /> Payer ({formatPrice(cartTotal)})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: CATEGORY SELECTION & PRODUCT GRID (cols 8) */}
                <div className={`lg:col-span-8 space-y-6 ${mobilePosTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
                  {/* Category Grid from screenshot */}
                  <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">Catégories d'articles</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                      {POS_CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setPosSearchTerm(''); // Clear search on category click to show products
                            }}
                            className={`flex items-center gap-2 p-1.5 transition text-left cursor-pointer border ${cat.bg} ${cat.text} ${
                              isActive
                                ? 'border-2 border-black ring-2 ring-black font-black scale-102 shadow-sm'
                                : 'border-black/20 font-medium hover:scale-101 hover:border-black'
                            }`}
                          >
                            <img
                              src={cat.img}
                              alt={cat.label}
                              referrerPolicy="no-referrer"
                              className="h-7 w-7 rounded-sm object-cover border border-black/10 shrink-0"
                            />
                            <span className="text-[8px] uppercase tracking-wider font-extrabold truncate leading-tight">
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center pb-3 border-b border-black/10 mb-5">
                      <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-500">
                        Articles : {POS_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'RECHERCHE'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {filteredPOSProducts.length} référence(s) disponible(s)
                      </span>
                    </div>

                    {filteredPOSProducts.length === 0 ? (
                      <div className="text-center py-20">
                        <p className="text-xs font-serif text-slate-400">Aucun produit ne correspond à la recherche ou à cette catégorie.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPOSProducts.map((p) => (
                          <motion.div
                            key={p.id}
                            whileHover={{ y: -2 }}
                            onClick={() => handleAddToCart(p)}
                            className="bg-white dark:bg-zinc-950 border border-black/20 hover:border-black p-2 shadow-xs hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] flex flex-col justify-between cursor-pointer group transition-all rounded-none"
                          >
                            <div className="relative aspect-square overflow-hidden mb-2 bg-slate-100">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black block uppercase tracking-tight truncate text-slate-900 dark:text-zinc-100">
                                {p.name}
                              </span>
                              <div className="flex justify-between items-center pt-1 border-t border-dashed border-black/10">
                                <span className="font-mono font-black text-[11px] text-emerald-600">
                                  {formatPrice(p.price)}
                                </span>
                                <span className="text-[8px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1 py-0.2 uppercase font-mono">
                                  + VENDRE
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
              /* ORIGINAL ACTIVE INVOICE BILLING MODE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: SESSION STATUS & CORE CONTROLS (cols 4) */}
                <div className="lg:col-span-4 space-y-6">
            
            {/* Session Card */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Statut de la caisse</span>
              
              {sessionCaisseActive ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="font-black text-emerald-600 text-xs uppercase tracking-wider">Session Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 border border-slate-200">
                      ID: {sessionCaisseActive.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-black/10">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Fond initial</div>
                    <div className="text-xl font-black text-slate-950 dark:text-white font-mono mt-0.5">
                      {formatPrice(sessionCaisseActive.fondInitial)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800">
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <PlusCircle className="h-3 w-3 text-emerald-500" /> Ventes (Espèces)
                      </div>
                      <div className="text-sm font-black text-slate-950 dark:text-white font-mono mt-1">
                        {formatPrice(sessionTotals.cash)}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800">
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MinusCircle className="h-3 w-3 text-rose-500" /> Sorties (Espèces)
                      </div>
                      <div className="text-sm font-black text-slate-950 dark:text-white font-mono mt-1">
                        {formatPrice(sessionTotals.outflow)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Flux électronique (Wave/CB/Vir)</div>
                    <div className="text-base font-black text-slate-950 dark:text-white font-mono mt-0.5">
                      {formatPrice(sessionTotals.electronic)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/20">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">SOLDE ESPÈCES THÉORIQUE</div>
                    <div className="text-2xl font-black text-slate-950 dark:text-white font-mono mt-0.5">
                      {formatPrice(sessionTotals.total)}
                    </div>
                  </div>

                  {/* Actions inside Session */}
                  <div className="pt-4 space-y-2 border-t border-dashed border-black/10">
                    <button
                      onClick={() => setIsOutflowModalOpen(true)}
                      className="w-full py-2 bg-white hover:bg-slate-50 text-slate-950 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition flex items-center justify-center gap-2"
                    >
                      <MinusCircle className="h-4 w-4 text-rose-500" /> Saisir Dépense
                    </button>
                    
                    <button
                      onClick={() => {
                        setActualCashCounted(sessionTotals.total);
                        setIsClosingModalOpen(true);
                      }}
                      className="w-full py-2 bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition flex items-center justify-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-atelier-gold" /> Clôturer la Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-3 text-center">
                  <div className="inline-flex p-4 rounded-none bg-rose-50 text-rose-600 border border-rose-200">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 dark:text-white uppercase text-sm tracking-wider">Session de caisse fermée</h4>
                    <p className="text-xs text-slate-500 font-serif mt-1 max-w-xs mx-auto">
                      Une session de caisse doit être obligatoirement ouverte au démarrage de l'activité pour encaisser des tickets comptoir ou enregistrer des dépenses.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsOpeningModalOpen(true)}
                    className="mt-2 w-full py-2.5 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Unlock className="h-4 w-4" /> Ouvrir la caisse
                  </button>
                </div>
              )}
            </div>

            {/* Quick stats on active session */}
            {sessionCaisseActive && (
              <div className="bg-slate-950 text-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Derniers mouvements</span>
                  <span className="text-[9px] font-mono font-black uppercase text-atelier-gold bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    {activeSessionTickets.length} transaction{activeSessionTickets.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                {activeSessionTickets.length === 0 && activeSessionOutflows.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-serif py-2">Aucun mouvement enregistré pour le moment.</p>
                ) : (
                  <div className="space-y-3.5 max-h-60 overflow-y-auto sidebar-scroll pr-1">
                    {[...activeSessionTickets, ...activeSessionOutflows]
                      .sort((a, b) => b.dateHeure.localeCompare(a.dateHeure))
                      .slice(0, 5)
                      .map((item, idx) => {
                        const isTicket = 'numero' in item;
                        return (
                          <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                            <div>
                              <span className="font-black text-[10px] block font-mono text-zinc-300">
                                {isTicket ? item.numero : 'DÉPENSE'}
                              </span>
                              <span className="text-[10px] text-zinc-400 block truncate max-w-[160px] font-serif">
                                {isTicket 
                                  ? (item.typeVente === 'vente_libre' ? item.descriptionLibre : `Règlement Facture #${item.factureId?.slice(-6).toUpperCase()}`)
                                  : item.motif}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-bold block ${!isTicket ? 'text-rose-400' : (item.statut === 'annule' ? 'text-zinc-500 line-through' : 'text-emerald-400')}`}>
                                {isTicket ? '+' : '-'}{formatPrice(item.montant)}
                              </span>
                              <span className="text-[9px] text-zinc-500 block font-mono">
                                {new Date(item.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: TICKET CREATOR & LIVE BILLING LINKAGE (cols 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Facturation / POS Section */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white">
                    Vente Comptoir & Encaissements
                  </h3>
                  <p className="text-xs font-serif text-slate-500 mt-0.5">
                    Sélectionnez une facture en attente pour encaisser un acompte/solde, ou réalisez une vente libre d'accessoire.
                  </p>
                </div>

                <button
                  disabled={!sessionCaisseActive}
                  onClick={() => handleOpenTicketModal()}
                  className={`py-1.5 px-4 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition inline-flex items-center gap-1.5 ${
                    sessionCaisseActive
                      ? 'bg-atelier-gold text-slate-950 hover:bg-black hover:text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                  title={!sessionCaisseActive ? "Veuillez d'abord ouvrir la caisse" : "Nouvelle vente de comptoir"}
                >
                  <PlusCircle className="h-4 w-4" /> Vente Comptoir Directe
                </button>
              </div>

              {/* Outstanding Invoices Table to collect quickly */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchFactureTerm}
                    onChange={(e) => setSearchFactureTerm(e.target.value)}
                    placeholder="Rechercher une facture impayée (Numéro, client, modèle...)"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 focus:outline-hidden focus:bg-white"
                  />
                </div>

                {filteredUnpaidInvoices.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-black/10">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-black text-slate-900 uppercase">Toutes les factures sont soldées ! 🎉</p>
                    <p className="text-[11px] text-slate-500 font-serif mt-1">Aucun encaissement en attente sur commande.</p>
                  </div>
                ) : (
                  <div className="border-2 border-black dark:border-zinc-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-zinc-800 uppercase text-[9px] font-black tracking-wider border-b-2 border-black">
                        <tr>
                          <th className="p-3">Facture</th>
                          <th className="p-3">Client</th>
                          <th className="p-3">Commande / Modèle</th>
                          <th className="p-3 text-right">Montant Total</th>
                          <th className="p-3 text-right">Reste à Payer (Solde)</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {filteredUnpaidInvoices.map((f) => {
                          const client = clients.find(c => c.id === f.clientId);
                          const order = f.commandeId ? commandes.find(c => c.id === f.commandeId) : null;
                          return (
                            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                              <td className="p-3 font-mono font-bold text-slate-950 dark:text-white">
                                {f.numero}
                              </td>
                              <td className="p-3">
                                {client ? `${client.prenom} ${client.nom}`.toUpperCase() : 'INCONNU'}
                              </td>
                              <td className="p-3 font-serif">
                                {order ? (
                                  <span className="flex items-center gap-1">
                                    <Scissors className="h-3.5 w-3.5 text-rose-500" /> {order.nomModele}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">{f.designationDirecte || 'Vente libre'}</span>
                                )}
                              </td>
                              <td className="p-3 text-right font-mono font-bold">
                                {formatPrice(f.montantTotal)}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-rose-600 bg-rose-50/40 dark:bg-rose-950/20">
                                {formatPrice(f.soldeDu)}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  disabled={!sessionCaisseActive}
                                  onClick={() => handleOpenTicketModal(f)}
                                  className={`py-1 px-2.5 text-[10px] font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition ${
                                    sessionCaisseActive
                                      ? 'bg-black text-white hover:bg-atelier-gold hover:text-black cursor-pointer'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-slate-300'
                                  }`}
                                  title={!sessionCaisseActive ? 'Ouvrir la caisse d\'abord' : 'Enregistrer le règlement'}
                                >
                                  Encaisser
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* List of transactions in active session */}
            {sessionCaisseActive && (
              <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white">
                      Journal des Ventes de la Session
                    </h3>
                    <p className="text-xs font-serif text-slate-500 mt-0.5">
                      Historique chronologique des tickets édités durant cette session.
                    </p>
                  </div>
                  
                  <div className="relative max-w-xs w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchTicketTerm}
                      onChange={(e) => setSearchTicketTerm(e.target.value)}
                      placeholder="Filtrer les tickets..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-black focus:outline-hidden"
                    />
                  </div>
                </div>

                {filteredActiveTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 font-serif py-6 text-center border-2 border-dashed border-black/10">
                    Aucun ticket de caisse émis pour le moment.
                  </p>
                ) : (
                  <div className="border border-black dark:border-zinc-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-zinc-800 uppercase text-[9px] font-black tracking-wider border-b border-black">
                        <tr>
                          <th className="p-3">Numéro</th>
                          <th className="p-3">Heure</th>
                          <th className="p-3">Type Vente</th>
                          <th className="p-3">Client lié</th>
                          <th className="p-3">Mode Paiement</th>
                          <th className="p-3 text-right">Montant</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {filteredActiveTickets.map((t) => {
                          const client = t.factureId 
                            ? clients.find(c => c.id === (factures.find(f => f.id === t.factureId)?.clientId))
                            : null;
                          return (
                            <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${t.statut === 'annule' ? 'opacity-50 bg-slate-100/40' : ''}`}>
                              <td className="p-3 font-mono font-bold">
                                {t.numero}
                                {t.statut === 'annule' && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 font-bold uppercase text-[7px] tracking-wider rounded-sm">
                                    Annulé
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-[10px]">
                                {new Date(t.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3 uppercase text-[9px] font-black tracking-wider">
                                {t.typeVente === 'commande_acompte' ? 'Acompte' : t.typeVente === 'commande_solde' ? 'Solde' : t.typeVente === 'retouche' ? 'Retouche' : 'Vente Libre'}
                              </td>
                              <td className="p-3 truncate max-w-[120px]">
                                {client ? `${client.prenom} ${client.nom}`.toUpperCase() : 'CLIENT VENT DIRECT'}
                              </td>
                              <td className="p-3 uppercase text-[9px] font-black font-mono">
                                {t.detailsMode ? (
                                  <span className="text-amber-600 font-bold" title={`Espèces: ${t.detailsMode.especes}, Électro: ${t.montant - (t.detailsMode.especes || 0)}`}>
                                    Mixed ⚡
                                  </span>
                                ) : (
                                  t.modePaiement === 'especes' ? '💵 ESPÈCES' : t.modePaiement === 'mobile_money' ? '📱 MOBILE MONEY' : t.modePaiement === 'carte' ? '💳 CARTE' : '🏦 VIREMENT'
                                )}
                              </td>
                              <td className="p-3 text-right font-mono font-bold">
                                {formatPrice(t.montant)}
                              </td>
                              <td className="p-3 text-center flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedTicketToPrint(t)}
                                  className="p-1 text-slate-700 hover:text-black hover:bg-slate-100 cursor-pointer border border-transparent hover:border-black transition"
                                  title="Imprimer / Télécharger le Ticket"
                                >
                                  <Printer className="h-4 w-4" />
                                </button>
                                
                                {t.statut === 'valide' && (
                                  <button
                                    onClick={() => handleCancelTicketClick(t.id)}
                                    className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer border border-transparent hover:border-rose-300 transition"
                                    title="Annuler le Ticket"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
)}

      {subTab === 'history' && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">
                Historique des Sessions & rapports Z
              </h3>
              <p className="text-xs font-serif text-slate-500 mt-0.5">
                Rapports financiers non modifiables horodatés générés à la clôture de chaque journée ou service.
              </p>
            </div>
            
            <div className="relative max-w-xs w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchHistoryTerm}
                onChange={(e) => setSearchHistoryTerm(e.target.value)}
                placeholder="Filtrer l'historique par date, statut..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black focus:outline-hidden"
              />
            </div>
          </div>

          <div className="border border-black dark:border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-zinc-800 uppercase text-[9px] font-black tracking-wider border-b-2 border-black">
                <tr>
                  <th className="p-3">Session</th>
                  <th className="p-3">Ouverture</th>
                  <th className="p-3">Clôture</th>
                  <th className="p-3 text-right">Fond Initial</th>
                  <th className="p-3 text-right">Solde Théorique</th>
                  <th className="p-3 text-right">Solde Compté</th>
                  <th className="p-3 text-right">Écart</th>
                  <th className="p-3 text-center">Statut</th>
                  <th className="p-3 text-center">Rapport Z</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-mono">
                {filteredSessionHistory.map((s) => {
                  const hasEcart = s.ecart !== undefined && s.ecart !== 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                      <td className="p-3 font-bold text-slate-950 dark:text-white">
                        {s.id.toUpperCase()}
                      </td>
                      <td className="p-3 text-[10px] font-serif">
                        {new Date(s.dateOuverture).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 text-[10px] font-serif">
                        {s.dateCloture ? new Date(s.dateCloture).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="p-3 text-right">
                        {formatPrice(s.fondInitial)}
                      </td>
                      <td className="p-3 text-right">
                        {formatPrice(s.montantTheorique)}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {s.montantCompte !== undefined ? formatPrice(s.montantCompte) : '—'}
                      </td>
                      <td className={`p-3 text-right font-bold ${hasEcart ? (s.ecart! < 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50') : 'text-slate-500'}`}>
                        {s.ecart !== undefined ? (s.ecart === 0 ? '0' : (s.ecart > 0 ? `+${formatPrice(s.ecart)}` : formatPrice(s.ecart))) : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase tracking-wider border ${
                          s.statut === 'ouverte'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                        }`}>
                          {s.statut === 'ouverte' ? 'Ouverte' : 'Clôturée'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedZReport(s)}
                          className="px-2 py-1 bg-white hover:bg-black text-slate-950 hover:text-white text-[10px] font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" /> Voir Z
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODALS & DIALOGS ===================== */}

      {/* 1. Opening Session Modal */}
      <AnimatePresence>
        {isOpeningModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <Unlock className="h-5 w-5 text-atelier-gold" /> Ouverture de Session Caisse
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4 leading-relaxed">
                Veuillez saisir le montant physique en espèces présent dans le tiroir-caisse pour démarrer la session (fond de caisse).
              </p>

              <form onSubmit={handleOpenCaisse} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Fond de Caisse Initial ( espèces )</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={initialFund}
                      onChange={(e) => setInitialFund(Number(e.target.value))}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border-2 border-black font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2.5 font-mono text-xs font-black">{settings.devise}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpeningModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Confirmer l'ouverture
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Closing Session Modal */}
      <AnimatePresence>
        {isClosingModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-atelier-gold" /> Clôture de Session Caisse
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4 leading-relaxed">
                Veuillez compter physiquement les espèces présentes dans le tiroir-caisse et saisir le montant total ci-dessous. Le système calculera l'écart.
              </p>

              <form onSubmit={handleCloseCaisse} className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-black/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase text-[9px] font-black">Solde théorique attendu:</span>
                    <strong className="font-mono font-black">{formatPrice(sessionTotals.total)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase text-[9px] font-black">Fond de démarrage initial:</span>
                    <span className="font-mono">{formatPrice(sessionCaisseActive?.fondInitial || 0)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Montant Réel Compté ( espèces )</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={actualCashCounted}
                      onChange={(e) => setActualCashCounted(Number(e.target.value))}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border-2 border-black font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2.5 font-mono text-xs font-black">{settings.devise}</span>
                  </div>
                  {actualCashCounted - sessionTotals.total !== 0 && (
                    <span className={`text-[10px] font-black block mt-1 uppercase ${actualCashCounted - sessionTotals.total < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Écart estimé : {actualCashCounted - sessionTotals.total < 0 ? 'Manquant ' : 'Surplus '}{formatPrice(Math.abs(actualCashCounted - sessionTotals.total))}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClosingModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Valider la clôture
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Outflow Modal (Sortie de caisse) */}
      <AnimatePresence>
        {isOutflowModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-rose-500" /> Enregistrer une Sortie de Caisse
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4 leading-relaxed">
                Pour l'achat de petites fournitures urgentes ou menues dépenses d'atelier. Cette somme sera déduite du théorique d'espèces.
              </p>

              <form onSubmit={handleAddOutflow} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Montant à retirer ( espèces )</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={outflowAmount}
                      onChange={(e) => setOutflowAmount(Number(e.target.value))}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border-2 border-black font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2.5 font-mono text-xs font-black">{settings.devise}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Motif de la dépense *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Achat de boutons de rechange et fil doré"
                    value={outflowMotif}
                    onChange={(e) => setOutflowMotif(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Référence du justificatif ( optionnel )</label>
                  <input
                    type="text"
                    placeholder="Ex: Facture #QT-2947"
                    value={outflowJustif}
                    onChange={(e) => setOutflowJustif(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-black"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOutflowModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-rose-600 hover:bg-black text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Confirmer la sortie
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Ticket Generator / POS Modal */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto sidebar-scroll"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <Store className="h-5 w-5 text-atelier-gold" /> Enregistrer une Vente / Émettre Ticket
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4">
                Une fois enregistré, un ticket séquentiel sera créé et le document de facturation lié sera instantanément mis à jour.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                {/* Sale Type Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-zinc-800 border border-black">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('invoice');
                      setSelectedFactureId('');
                      setTicketAmount(0);
                    }}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider text-center transition ${
                      ticketType === 'invoice' ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Facture Unique
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('grouped');
                      if (clients.length > 0) {
                        handleGroupedClientChange(clients[0].id);
                      }
                    }}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider text-center transition ${
                      ticketType === 'grouped' ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Règl. Groupé
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('free');
                      setTicketAmount(0);
                    }}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider text-center transition ${
                      ticketType === 'free' ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Vente Libre
                  </button>
                </div>

                {ticketType === 'invoice' && (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Sélectionner la facture *</label>
                      <select
                        required
                        value={selectedFactureId}
                        onChange={(e) => handleFactureSelectionChange(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black focus:outline-hidden"
                      >
                        <option value="">-- Choisir une Facture --</option>
                        {unpaidInvoices.map((f) => {
                          const cl = clients.find(c => c.id === f.clientId);
                          const clientName = cl ? `${cl.prenom} ${cl.nom}` : 'Client Inconnu';
                          const detailsStr = f.commandeId ? `Facture #${f.numero} (Commande, Reste: ${formatPrice(f.soldeDu)})` : `Facture #${f.numero} (Directe, Reste: ${formatPrice(f.soldeDu)})`;
                          return (
                            <option key={f.id} value={f.id}>
                              {clientName.toUpperCase()} — {detailsStr}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedFactureId && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Montant à Encaisser ({settings.devise})</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="1"
                            value={ticketAmount}
                            onChange={(e) => setTicketAmount(Number(e.target.value))}
                            className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {ticketType === 'grouped' && (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Sélectionner le Client *</label>
                      <select
                        required
                        value={groupedClientId}
                        onChange={(e) => handleGroupedClientChange(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black focus:outline-hidden"
                      >
                        <option value="">-- Choisir un Client --</option>
                        {clients.map((c) => {
                          const unpaidCount = factures.filter(f => f.clientId === c.id && f.statut !== 'paye').length;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.prenom.toUpperCase()} {c.nom.toUpperCase()} ({unpaidCount} facture(s) en attente)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {groupedClientId && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                          Allocation des Montants par Facture :
                        </label>
                        
                        {factures.filter(f => f.clientId === groupedClientId && f.statut !== 'paye').length === 0 ? (
                          <div className="p-3 bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-serif">
                            Aucune facture impayée ou partielle pour ce client.
                          </div>
                        ) : (
                          <div className="space-y-2 border border-black/10 p-2 max-h-48 overflow-y-auto sidebar-scroll bg-slate-50 dark:bg-zinc-950">
                            {factures
                              .filter(f => f.clientId === groupedClientId && f.statut !== 'paye')
                              .map(f => {
                                const allocated = groupedAllocations[f.id] !== undefined ? groupedAllocations[f.id] : 0;
                                return (
                                  <div key={f.id} className="p-2 bg-white dark:bg-zinc-900 border border-black/5 flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-bold">Facture #{f.numero}</span>
                                      <span className="text-slate-500">Reste dû: <strong className="font-bold text-black dark:text-white">{formatPrice(f.soldeDu)}</strong></span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max={f.soldeDu}
                                        value={allocated}
                                        onChange={(e) => handleAllocationChange(f.id, Number(e.target.value))}
                                        className="w-full p-1 bg-white dark:bg-zinc-900 border border-black text-xs font-mono font-bold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAllocationChange(f.id, f.soldeDu)}
                                        className="px-2 py-1 bg-slate-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-wider animate-pulse"
                                      >
                                        Max
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAllocationChange(f.id, 0)}
                                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-wider"
                                      >
                                        Vider
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        <div className="p-3 bg-amber-500/10 border border-black flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Total Encaissé Groupé :</span>
                          <span className="font-mono text-base font-black text-slate-900 dark:text-amber-500">{formatPrice(ticketAmount)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {ticketType === 'free' && (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Client pour la vente libre *</label>
                      <select
                        required
                        value={freeSaleClient}
                        onChange={(e) => setFreeSaleClient(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black focus:outline-hidden"
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.prenom.toUpperCase()} {c.nom.toUpperCase()} ({c.telephone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Description / Désignation des Articles *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Tissu Brocard 5 mètres, boutons argentés..."
                        value={freeSaleDescription}
                        onChange={(e) => setFreeSaleDescription(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Montant Total de la Vente *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="100"
                          value={freeSaleAmount}
                          onChange={(e) => {
                            setFreeSaleAmount(Number(e.target.value));
                            setTicketAmount(Number(e.target.value));
                          }}
                          className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black font-mono font-bold"
                        />
                        <span className="absolute right-3 top-2 font-mono text-xs font-black">{settings.devise}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Mixed Payment Toggle */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-black/10 rounded-none flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">Paiement Mixte (Mixte espèces + électronique)</span>
                    <span className="text-[9px] text-slate-500 font-serif">Permet de payer une moitié en espèces et l'autre via Wave/Orange money.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isMixedPayment}
                    onChange={(e) => {
                      setIsMixedPayment(e.target.checked);
                      if (e.target.checked) {
                        const half = Math.floor(ticketAmount / 2);
                        setMixedEspeces(half);
                        setMixedElectronic(ticketAmount - half);
                      }
                    }}
                    className="w-4 h-4 text-atelier-gold cursor-pointer"
                  />
                </div>

                {isMixedPayment ? (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-amber-500/10 border border-amber-500 text-xs">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Part en Espèces ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        value={mixedEspeces}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMixedEspeces(val);
                          setMixedElectronic(Math.max(0, ticketAmount - val));
                        }}
                        className="w-full p-1.5 bg-white border border-black text-xs font-mono font-black"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Part Électronique ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        value={mixedElectronic}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMixedElectronic(val);
                          setMixedEspeces(Math.max(0, ticketAmount - val));
                        }}
                        className="w-full p-1.5 bg-white border border-black text-xs font-mono font-black animate-pulse"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Mode de règlement de la part électronique</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                        className="w-full p-1.5 bg-white border border-black text-xs"
                      >
                        {(settings.posModesPaiementActifs?.mobile_money ?? true) && (
                          <option value="mobile_money">📱 Mobile Money (Wave, Orange Money)</option>
                        )}
                        {(settings.posModesPaiementActifs?.carte ?? true) && (
                          <option value="carte">💳 Carte bancaire</option>
                        )}
                        {(settings.posModesPaiementActifs?.virement ?? true) && (
                          <option value="virement">🏦 Virement bancaire</option>
                        )}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Mode de Règlement Unique *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black"
                    >
                      {(settings.posModesPaiementActifs?.especes ?? true) && (
                        <option value="especes">💵 Espèces (Cash)</option>
                      )}
                      {(settings.posModesPaiementActifs?.mobile_money ?? true) && (
                        <option value="mobile_money">📱 Mobile Money (Wave, Orange Money)</option>
                      )}
                      {(settings.posModesPaiementActifs?.carte ?? true) && (
                        <option value="carte">💳 Carte bancaire (CB)</option>
                      )}
                      {(settings.posModesPaiementActifs?.virement ?? true) && (
                        <option value="virement">🏦 Virement bancaire</option>
                      )}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Générer & Encaisser
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tactile POS Checkout Modal */}
      <AnimatePresence>
        {isTactileCheckoutOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto sidebar-scroll"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-atelier-gold" /> Finaliser la Vente Tactile
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4">
                Veuillez sélectionner le mode de règlement pour encaisser le ticket et mettre à jour la caisse.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmTactileCheckout(paymentMode, isMixedPayment, mixedEspeces, mixedElectronic, paymentMode);
                }} 
                className="space-y-4"
              >
                {/* Cart summary */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-black/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase text-[9px] font-black">Client :</span>
                    <span className="font-bold">
                      {(() => {
                        const cl = clients.find(c => c.id === cartClientId);
                        return cl ? `${cl.prenom} ${cl.nom}`.toUpperCase() : 'CLIENT DIRECT (PASSAGE)';
                      })()}
                    </span>
                  </div>
                  {cartNote && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[9px] font-black">Note :</span>
                      <span className="italic">« {cartNote} »</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-black/10 pt-1.5 flex justify-between font-black text-sm text-slate-950 dark:text-white">
                    <span>TOTAL À PAYER :</span>
                    <span className="font-mono">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                {/* Mixed Payment Toggle */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-black/10 rounded-none flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">Paiement Mixte (Espèces + Électronique)</span>
                    <span className="text-[9px] text-slate-500 font-serif">Payer une partie en cash et le reste via Mobile Money/Carte.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isMixedPayment}
                    onChange={(e) => {
                      setIsMixedPayment(e.target.checked);
                      if (e.target.checked) {
                        const half = Math.floor(cartTotal / 2);
                        setMixedEspeces(half);
                        setMixedElectronic(cartTotal - half);
                      }
                    }}
                    className="w-4 h-4 text-atelier-gold cursor-pointer"
                  />
                </div>

                {isMixedPayment ? (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-amber-500/10 border border-amber-500 text-xs">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Part en Espèces ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={cartTotal}
                        value={mixedEspeces}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setMixedEspeces(val);
                          setMixedElectronic(Math.max(0, cartTotal - val));
                        }}
                        className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-black text-xs font-mono font-black text-slate-950 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Part Électronique ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={cartTotal}
                        value={mixedElectronic}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setMixedElectronic(val);
                          setMixedEspeces(Math.max(0, cartTotal - val));
                        }}
                        className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-black text-xs font-mono font-black text-slate-950 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 block mb-1">Mode de règlement de la part électronique</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                        className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-black text-xs text-slate-950 dark:text-zinc-100"
                      >
                        {(settings.posModesPaiementActifs?.mobile_money ?? true) && (
                          <option value="mobile_money">📱 Mobile Money (Wave, Orange Money)</option>
                        )}
                        {(settings.posModesPaiementActifs?.carte ?? true) && (
                          <option value="carte">💳 Carte bancaire</option>
                        )}
                        {(settings.posModesPaiementActifs?.virement ?? true) && (
                          <option value="virement">🏦 Virement bancaire</option>
                        )}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Mode de Règlement Unique *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black text-slate-950 dark:text-zinc-100"
                    >
                      {(settings.posModesPaiementActifs?.especes ?? true) && (
                        <option value="especes">💵 Espèces (Cash)</option>
                      )}
                      {(settings.posModesPaiementActifs?.mobile_money ?? true) && (
                        <option value="mobile_money">📱 Mobile Money (Wave, Orange Money)</option>
                      )}
                      {(settings.posModesPaiementActifs?.carte ?? true) && (
                        <option value="carte">💳 Carte bancaire (CB)</option>
                      )}
                      {(settings.posModesPaiementActifs?.virement ?? true) && (
                        <option value="virement">🏦 Virement bancaire</option>
                      )}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTactileCheckoutOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Confirmer le Paiement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Item Modal */}
      <AnimatePresence>
        {isCustomItemModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-slate-950 dark:text-white mb-2 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-atelier-gold" /> Ajouter un Article Personnalisé
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4 leading-relaxed">
                Saisissez un nom d'article et son prix unitaire en FCFA pour l'ajouter au panier courant.
              </p>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Nom de l'article *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tissu Wax client (4 mètres)"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black text-slate-950 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">Prix unitaire ({settings.devise}) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ex: 15000"
                      value={customItemPrice || ''}
                      onChange={(e) => setCustomItemPrice(Number(e.target.value) || 0)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black text-slate-950 dark:text-zinc-100 font-mono font-bold focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 font-mono text-xs font-black">{settings.devise}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomItemModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Ticket Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancellingTicketId !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border-2 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h4 className="font-display font-black text-base uppercase tracking-tight text-rose-600 mb-2 flex items-center gap-2">
                <Ban className="h-5 w-5" /> Annulation d'un Ticket de Caisse
              </h4>
              <p className="text-xs font-serif text-slate-500 mb-4 leading-relaxed">
                Cette opération va annuler la transaction financière, recréditer le reste à payer sur la facture correspondante et ajuster le solde de caisse.
              </p>

              <form onSubmit={handleConfirmCancellation} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-rose-600 block mb-1">Motif d'annulation obligatoire *</label>
                  <textarea
                    required
                    placeholder="Saisissez la raison légitime de l'annulation (erreur saisie, modification client, etc.)"
                    value={cancellationMotif}
                    onChange={(e) => setCancellationMotif(e.target.value)}
                    rows={3}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-950 border-2 border-black focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingTicketId(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-widest border border-slate-300 transition cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                  >
                    Valider l'annulation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Ticket Thermal Print Modal */}
      <AnimatePresence>
        {selectedTicketToPrint && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white text-black w-full border-4 border-black font-mono relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)] ${
                settings.ticketLargeur === '58mm' ? 'max-w-[290px] p-3 text-[10px]' : 'max-w-sm p-5 text-xs'
              }`}
            >
              <button
                onClick={() => setSelectedTicketToPrint(null)}
                className="absolute right-4 top-4 font-black p-1 bg-black text-white cursor-pointer border border-black"
              >
                ✕
              </button>

              {/* Thermal Receipt Visual Template styling */}
              <div className="border-b-2 border-dashed border-black pb-4 text-center space-y-1">
                {settings.ticketEnTete && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-300 inline-block mb-1">
                    {settings.ticketEnTete}
                  </span>
                )}
                <h2 className="font-black text-base tracking-tight uppercase">{settings.raisonSociale}</h2>
                {(settings.ticketAfficherSlogan ?? true) && settings.slogan && (
                  <p className="text-[9px] mt-0.5 uppercase tracking-wider text-slate-700">{settings.slogan}</p>
                )}
                <p className="text-[9px] text-slate-600 mt-1">{settings.adresse}</p>
                <p className="text-[9px] text-slate-600">Tél: {settings.telephone}</p>
                {(settings.ticketAfficherNinea ?? true) && settings.ninea && (
                  <p className="text-[9px] text-slate-600">Ninea: {settings.ninea}</p>
                )}
              </div>

              <div className="py-4 space-y-2 text-xs border-b-2 border-dashed border-black">
                <div className="flex justify-between">
                  <span>TICKET N°:</span>
                  <span className="font-bold">{selectedTicketToPrint.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE/HEURE:</span>
                  <span>{new Date(selectedTicketToPrint.dateHeure).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CAISSIER:</span>
                  <span>RESPONSABLE POS</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUT:</span>
                  <span className="font-bold uppercase text-emerald-700">
                    {selectedTicketToPrint.statut === 'valide' ? 'VALIDÉ / PAYÉ' : 'ANNULÉ'}
                  </span>
                </div>
                {selectedTicketToPrint.motifAnnulation && (
                  <div className="bg-rose-50 p-2 border border-rose-300 text-[10px] mt-1 text-rose-800">
                    Motif Annulation: {selectedTicketToPrint.motifAnnulation}
                  </div>
                )}
              </div>

              <div className="py-4 space-y-2 border-b-2 border-dashed border-black">
                <div className="text-xs font-black uppercase">Détails transaction</div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold">
                    {selectedTicketToPrint.typeVente === 'commande_acompte' 
                      ? 'ACOMPTE SUR COMMANDE' 
                      : selectedTicketToPrint.typeVente === 'commande_solde' 
                      ? 'SOLDE DE COMMANDE' 
                      : selectedTicketToPrint.typeVente === 'retouche' 
                      ? 'SAV / RETOUCHE' 
                      : `VENTE DIRECTE COMPTOIR`}
                  </span>
                  <span>1x</span>
                </div>
                {selectedTicketToPrint.descriptionLibre && (
                  <p className="text-[10px] text-slate-600 italic leading-relaxed">
                    « {selectedTicketToPrint.descriptionLibre} »
                  </p>
                )}
                {selectedTicketToPrint.factureId && (
                  <p className="text-[10px] text-slate-500 uppercase">
                    Rattaché à la Facture #{selectedTicketToPrint.factureId.slice(-6).toUpperCase()}
                  </p>
                )}
              </div>

              <div className="py-4 space-y-1 text-xs">
                <div className="flex justify-between font-black text-sm">
                  <span>NET À PAYER :</span>
                  <span>{formatPrice(selectedTicketToPrint.montant)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>MODE RÈGLEMENT:</span>
                  <span className="font-bold uppercase">
                    {selectedTicketToPrint.detailsMode ? 'PAIEMENT MIXTE' : selectedTicketToPrint.modePaiement}
                  </span>
                </div>
                
                {selectedTicketToPrint.detailsMode && (
                  <div className="bg-slate-50 p-2 border border-black/10 text-[10px] mt-2 space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>• Espèces reçues:</span>
                      <span>{formatPrice(selectedTicketToPrint.detailsMode.especes || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>• Part électronique:</span>
                      <span>{formatPrice(selectedTicketToPrint.montant - (selectedTicketToPrint.detailsMode.especes || 0))}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2 border-dashed border-black text-center text-[9px] text-slate-600 space-y-1">
                <p className="font-black text-black uppercase">{settings.ticketRemerciement || 'MERCI DE VOTRE CONFIANCE !'}</p>
                {settings.ticketBasPage && <p className="italic">{settings.ticketBasPage}</p>}
                <p className="text-[8px] text-slate-400">Logiciel Foxfy Services v2.1</p>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    printThermalTicketDirectly(selectedTicketToPrint);
                  }}
                  className="flex-1 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider cursor-pointer border border-black flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  onClick={() => handleWhatsAppTicket(selectedTicketToPrint)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer border border-black flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  onClick={() => setSelectedTicketToPrint(null)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer border border-slate-300"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Z-Report Modal */}
      <AnimatePresence>
        {selectedZReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-black max-w-md w-full p-6 border-4 border-black font-mono relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => setSelectedZReport(null)}
                className="absolute right-4 top-4 font-black p-1 bg-black text-white cursor-pointer border border-black"
              >
                ✕
              </button>

              <div className="border-b-2 border-dashed border-black pb-3 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 border border-slate-300 mb-2 inline-block">
                  RAPPORT Z DE CAISSE (COMPTABLE)
                </span>
                <h3 className="font-black text-base uppercase mt-1">{settings.raisonSociale}</h3>
                <p className="text-[9px] text-slate-600">ID Session: {selectedZReport.id.toUpperCase()}</p>
              </div>

              <div className="py-4 space-y-2 text-xs border-b border-black/10">
                <div className="flex justify-between">
                  <span>OUVERTURE:</span>
                  <span>{new Date(selectedZReport.dateOuverture).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLÔTURE:</span>
                  <span>{selectedZReport.dateCloture ? new Date(selectedZReport.dateCloture).toLocaleString('fr-FR') : 'SESSION TOUJOURS OUVERTE'}</span>
                </div>
                <div className="flex justify-between">
                  <span>RESPONSABLE:</span>
                  <span>GÉRANT CAISSE</span>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs border-b-2 border-dashed border-black">
                <div className="flex justify-between">
                  <span>FOND INITIAL DE DÉMARRAGE:</span>
                  <span className="font-bold">{formatPrice(selectedZReport.fondInitial)}</span>
                </div>
                
                {/* Mode distribution if closed */}
                {selectedZReport.recapModes && (
                  <div className="bg-slate-50 p-2.5 border border-black/10 text-[10px] space-y-1.5">
                    <div className="text-[9px] font-black uppercase text-slate-400 block mb-1">RÉCAPITULATIF DES ENCAISSEMENTS</div>
                    <div className="flex justify-between text-slate-600">
                      <span>💵 TOTAL ESPÈCES :</span>
                      <strong className="font-bold text-black">{formatPrice(selectedZReport.recapModes.especes)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>📱 MOBILE MONEY (WAVE/OM) :</span>
                      <strong className="font-bold text-black">{formatPrice(selectedZReport.recapModes.mobile_money)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>💳 CARTES BANCAIRES :</span>
                      <strong className="font-bold text-black">{formatPrice(selectedZReport.recapModes.carte)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>🏦 VIREMENTS REÇUS :</span>
                      <strong className="font-bold text-black">{formatPrice(selectedZReport.recapModes.virement)}</strong>
                    </div>
                  </div>
                )}

                {/* Cash outflows summary */}
                <div className="flex justify-between text-rose-600">
                  <span>SORTIES DE CAISSE (DÉPENSES) :</span>
                  <span className="font-bold">- {formatPrice(
                    sortiesCaisse.filter(o => o.sessionId === selectedZReport.id).reduce((acc, o) => acc + o.montant, 0)
                  )}</span>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>SOLDE THÉORIQUE ATTENDU:</span>
                  <span className="font-mono">{formatPrice(selectedZReport.montantTheorique)}</span>
                </div>
                
                <div className="flex justify-between font-black text-sm text-slate-900">
                  <span>SOLDE PHYSIQUE COMPTÉ:</span>
                  <span className="font-mono">{selectedZReport.montantCompte !== undefined ? formatPrice(selectedZReport.montantCompte) : 'NON CLÔTURÉE'}</span>
                </div>

                {selectedZReport.ecart !== undefined && (
                  <div className={`p-3 border-2 text-center text-xs font-black uppercase flex items-center justify-center gap-2 ${
                    selectedZReport.ecart === 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-400' 
                      : 'bg-rose-50 text-rose-700 border-rose-400 animate-pulse'
                  }`}>
                    {selectedZReport.ecart === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4" /> ÉCART DE CAISSE : PARFAIT (0)
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" /> 
                        {selectedZReport.ecart < 0 ? `MANQUANT DE CAISSE : ` : `SURPLUS DE CAISSE : `}
                        {formatPrice(Math.abs(selectedZReport.ecart))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[8px] text-center text-slate-400 pt-3 border-t border-dashed border-black">
                Rapport financier cryptographique certifié Fox Couture - Certificat #Z-{selectedZReport.id.toUpperCase()}
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider cursor-pointer border border-black flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  onClick={() => exportZReportToCSV(selectedZReport)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer border border-black flex items-center justify-center gap-1.5"
                >
                  Exporter CSV
                </button>
                <button
                  onClick={() => setSelectedZReport(null)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer border border-slate-300"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
