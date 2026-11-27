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
import { formatPhoneNumberForWhatsApp, buildWhatsAppLink } from '../lib/whatsapp';

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

    const waUrl = buildWhatsAppLink(phone, msg);
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
      <div className="card-fox p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0">
            <Store className="h-6 w-6 text-[#F05A22]" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-stone-900 tracking-tight">
              Caisse & Point de Vente (POS)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Encaissements au comptoir, tickets de caisse, dépenses et rapports de clôture.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#EDE8E0] p-1 rounded-full shrink-0 self-start md:self-center">
          <button
            onClick={() => setSubTab('active')}
            className={`py-1.5 px-4 text-xs font-semibold rounded-full transition cursor-pointer ${
              subTab === 'active'
                ? 'bg-[#191716] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Session active
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`py-1.5 px-4 text-xs font-semibold rounded-full transition cursor-pointer ${
              subTab === 'history'
                ? 'bg-[#191716] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Historique & rapports
          </button>
        </div>
      </div>

      {subTab === 'active' && (
        !sessionCaisseActive ? (
          <div className="card-fox p-8 max-w-md mx-auto text-center my-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 mx-auto flex items-center justify-center">
              <Lock className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Session de caisse fermée</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Ouvrez une session de caisse pour commencer les encaissements au comptoir, utiliser le Point de Vente tactile ou enregistrer des dépenses.
            </p>
            
            <button
              onClick={() => setIsOpeningModalOpen(true)}
              className="btn-fox-primary !w-full !py-2.5 flex items-center justify-center gap-2"
            >
              <Unlock className="h-4 w-4" /> Ouvrir la session de caisse
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Touch POS Header Bar */}
            <div className="card-fox p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left Tabs & Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex bg-[#EDE8E0] p-1 rounded-full">
                  <button
                    onClick={() => setPosMode('tactile')}
                    className={`py-1.5 px-4 text-xs font-semibold rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                      posMode === 'tactile'
                        ? 'bg-[#191716] text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Caisse tactile
                  </button>
                  <button
                    onClick={() => setPosMode('invoices')}
                    className={`py-1.5 px-4 text-xs font-semibold rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                      posMode === 'invoices'
                        ? 'bg-[#191716] text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" /> Commandes & factures
                  </button>
                </div>

                <button
                  onClick={handleClearCart}
                  className="p-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 rounded-xl transition cursor-pointer"
                  title="Réinitialiser / Nouveau Ticket"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-mono text-xs font-semibold border border-emerald-200">
                  Ticket #1005
                </div>
              </div>

              {/* Right Search, Barcode & Register settings */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {posMode === 'tactile' && (
                  <div className="relative max-w-xs w-full sm:w-60">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={posSearchTerm}
                      onChange={(e) => setPosSearchTerm(e.target.value)}
                      placeholder="Rechercher des produits..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    />
                  </div>
                )}

                <div className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 transition cursor-pointer text-stone-700" title="Lecteur Code Barre Simulé">
                  <Barcode className="h-4 w-4" />
                </div>

                {/* Session Manager Mini control */}
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col text-right pr-2 border-r border-stone-200">
                    <span className="text-[10px] text-stone-400 font-medium">Solde caisse</span>
                    <strong className="text-xs font-mono font-bold text-emerald-700">{formatPrice(sessionTotals.total)}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setActualCashCounted(sessionTotals.total);
                      setIsClosingModalOpen(true);
                    }}
                    className="px-3 py-2 bg-stone-900 hover:bg-rose-600 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Clôturer la journée"
                  >
                    <Lock className="h-3.5 w-3.5 text-[#F05A22]" /> Fermer session
                  </button>
                  <button
                    onClick={() => setIsOutflowModalOpen(true)}
                    className="px-3 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
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
                <div className="flex lg:hidden bg-[#EDE8E0] p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMobilePosTab('catalog')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                      mobilePosTab === 'catalog' ? 'bg-[#191716] text-white shadow-xs' : 'text-stone-700'
                    }`}
                  >
                    🛍️ Catalogue
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobilePosTab('cart')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                      mobilePosTab === 'cart' ? 'bg-[#191716] text-white shadow-xs' : 'text-stone-700'
                    }`}
                  >
                    📋 Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: THE SHOPPING CART (cols 4) */}
                  <div className={`lg:col-span-4 card-fox p-5 flex flex-col justify-between min-h-[620px] ${
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
                  <div className="pt-4 border-t border-stone-100 space-y-3 mt-4 bg-[#FBF8F3] p-4 rounded-2xl border border-stone-200/80">
                    {/* Client Selection in Cart */}
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">Rattacher un client</label>
                      <select
                        value={cartClientId}
                        onChange={(e) => setCartClientId(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-stone-200/80 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      >
                        <option value="">👤 Client direct (comptoir)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            👤 {c.prenom} {c.nom} ({c.telephone})
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
                        className="w-full p-2 text-xs bg-white border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      />
                    </div>

                    {/* Custom sale / quick custom item */}
                    <button
                      onClick={() => {
                        setCustomItemName('');
                        setCustomItemPrice(0);
                        setIsCustomItemModalOpen(true);
                      }}
                      className="w-full py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#F05A22]" /> Article personnalisé
                    </button>

                    {/* Subtotals & Actions */}
                    <div className="pt-3 border-t border-dashed border-stone-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-stone-600">Total à payer :</span>
                        <strong className="text-xl font-semibold text-stone-900">
                          {formatPrice(cartTotal)}
                        </strong>
                      </div>

                      <div className="flex gap-2">
                        {/* Clear Cart */}
                        <button
                          onClick={handleClearCart}
                          className="p-2.5 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200/80 rounded-xl flex items-center justify-center cursor-pointer transition shadow-xs"
                          title="Vider le panier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {/* Note Toggle */}
                        <button
                          onClick={() => setCartNote('À Emporter')}
                          className="p-2.5 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 rounded-xl flex items-center justify-center cursor-pointer transition shadow-xs"
                          title="Note rapide : À Emporter"
                        >
                          <Upload className="h-4 w-4" />
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
                          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                            cart.length === 0
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'btn-fox-primary'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" /> Encaisser ({formatPrice(cartTotal)})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: CATEGORY SELECTION & PRODUCT GRID (cols 8) */}
                <div className={`lg:col-span-8 space-y-6 ${mobilePosTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
                  {/* Category Grid */}
                  <div className="card-fox rounded-3xl p-5 shadow-card">
                    <span className="text-xs font-semibold text-stone-500 block mb-3">Catégories d'articles</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
                      {POS_CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setPosSearchTerm('');
                            }}
                            className={`flex items-center gap-2 p-2 rounded-2xl transition text-left cursor-pointer border ${
                              isActive
                                ? 'border-[#F05A22] bg-[#FDF4EE] text-[#F05A22] font-semibold shadow-xs'
                                : 'border-stone-200/70 bg-white hover:border-stone-300 text-stone-700'
                            }`}
                          >
                            <img
                              src={cat.img}
                              alt={cat.label}
                              referrerPolicy="no-referrer"
                              className="h-8 w-8 rounded-xl object-cover shrink-0"
                            />
                            <span className="text-[11px] font-semibold truncate leading-tight">
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="card-fox rounded-3xl p-6 shadow-card">
                    <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-5">
                      <h4 className="text-sm font-semibold text-stone-800">
                        Articles : {POS_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Recherche'}
                      </h4>
                      <span className="text-xs text-stone-500 font-medium">
                        {filteredPOSProducts.length} référence(s)
                      </span>
                    </div>

                    {filteredPOSProducts.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-xs text-stone-400">Aucun produit ne correspond à cette recherche ou catégorie.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPOSProducts.map((p) => (
                          <motion.div
                            key={p.id}
                            whileHover={{ y: -2 }}
                            onClick={() => handleAddToCart(p)}
                            className="bg-white rounded-2xl border border-stone-200/80 hover:border-[#F05A22]/50 p-2.5 shadow-xs hover:shadow-card flex flex-col justify-between cursor-pointer group transition-all"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-stone-100">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold block truncate text-stone-800">
                                {p.name}
                              </span>
                              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-stone-100">
                                <span className="font-semibold text-xs text-emerald-600">
                                  {formatPrice(p.price)}
                                </span>
                                <span className="text-[10px] bg-[#FDF4EE] text-[#F05A22] font-semibold px-2 py-0.5 rounded-full">
                                  + Vendre
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
            <div className="card-fox rounded-3xl p-5 shadow-card">
              <span className="text-xs font-semibold text-stone-500 block mb-3">Statut de la caisse</span>
              
              {sessionCaisseActive ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-semibold text-emerald-600 text-xs">Session active</span>
                    </div>
                    <span className="text-[11px] font-medium text-stone-500 bg-[#FBF8F3] px-2.5 py-0.5 rounded-full border border-stone-200/80">
                      ID: {sessionCaisseActive.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-500 font-medium">Fond initial</div>
                    <div className="text-xl font-bold text-stone-900 mt-0.5">
                      {formatPrice(sessionCaisseActive.fondInitial)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/60">
                      <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
                        <PlusCircle className="h-3.5 w-3.5 text-emerald-500" /> Espèces
                      </div>
                      <div className="text-sm font-bold text-stone-900 mt-1">
                        {formatPrice(sessionTotals.cash)}
                      </div>
                    </div>
                    <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/60">
                      <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
                        <MinusCircle className="h-3.5 w-3.5 text-rose-500" /> Sorties
                      </div>
                      <div className="text-sm font-bold text-stone-900 mt-1">
                        {formatPrice(sessionTotals.outflow)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-stone-500 font-medium">Flux électronique (Wave, OM, CB)</div>
                    <div className="text-base font-semibold text-stone-800 mt-0.5">
                      {formatPrice(sessionTotals.electronic)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <div className="text-xs font-semibold text-stone-500">Solde espèces théorique</div>
                    <div className="text-2xl font-bold text-[#F05A22] mt-0.5">
                      {formatPrice(sessionTotals.total)}
                    </div>
                  </div>

                  {/* Actions inside Session */}
                  <div className="pt-3 space-y-2 border-t border-stone-100">
                    <button
                      onClick={() => setIsOutflowModalOpen(true)}
                      className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 cursor-pointer transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MinusCircle className="h-4 w-4 text-rose-500" /> Saisir une dépense
                    </button>
                    
                    <button
                      onClick={() => {
                        setActualCashCounted(sessionTotals.total);
                        setIsClosingModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-[#161412] hover:bg-stone-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Lock className="h-4 w-4 text-[#F05A22]" /> Clôturer la session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-amber-50 text-[#F05A22] border border-amber-200/50">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">Session de caisse fermée</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      Une session de caisse doit être ouverte pour encaisser des tickets comptoir ou enregistrer des dépenses.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsOpeningModalOpen(true)}
                    className="mt-2 w-full py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Unlock className="h-4 w-4" /> Ouvrir la caisse
                  </button>
                </div>
              )}
            </div>

            {/* Quick stats on active session */}
            {sessionCaisseActive && (
              <div className="bg-[#161412] text-white rounded-3xl p-5 shadow-card">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-stone-400 block">Derniers mouvements</span>
                  <span className="text-[11px] font-semibold text-[#F05A22] bg-[#221F1D] px-2.5 py-0.5 rounded-full border border-stone-800">
                    {activeSessionTickets.length} transaction{activeSessionTickets.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                {activeSessionTickets.length === 0 && activeSessionOutflows.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3">Aucun mouvement enregistré pour le moment.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto sidebar-scroll pr-1">
                    {[...activeSessionTickets, ...activeSessionOutflows]
                      .sort((a, b) => b.dateHeure.localeCompare(a.dateHeure))
                      .slice(0, 5)
                      .map((item, idx) => {
                        const isTicket = 'numero' in item;
                        return (
                          <div key={idx} className="flex justify-between items-start gap-2 text-xs border-b border-stone-800/60 pb-2">
                            <div>
                              <span className="font-semibold text-[11px] block text-stone-200">
                                {isTicket ? item.numero : 'Dépense'}
                              </span>
                              <span className="text-[11px] text-stone-400 block truncate max-w-[160px]">
                                {isTicket 
                                  ? (item.typeVente === 'vente_libre' ? item.descriptionLibre : `Facture #${item.factureId?.slice(-6).toUpperCase()}`)
                                  : item.motif}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`font-semibold block ${!isTicket ? 'text-rose-400' : (item.statut === 'annule' ? 'text-stone-500 line-through' : 'text-emerald-400')}`}>
                                {isTicket ? '+' : '-'}{formatPrice(item.montant)}
                              </span>
                              <span className="text-[10px] text-stone-500 block">
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
            <div className="card-fox rounded-3xl p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    Vente comptoir & encaissements
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Sélectionnez une facture en attente pour encaisser un solde, ou réalisez une vente directe.
                  </p>
                </div>

                <button
                  disabled={!sessionCaisseActive}
                  onClick={() => handleOpenTicketModal()}
                  className={`py-2 px-4 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 ${
                    sessionCaisseActive
                      ? 'btn-fox-primary cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  title={!sessionCaisseActive ? "Veuillez d'abord ouvrir la caisse" : "Nouvelle vente de comptoir"}
                >
                  <PlusCircle className="h-4 w-4" /> Vente comptoir directe
                </button>
              </div>

              {/* Outstanding Invoices Table to collect quickly */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchFactureTerm}
                    onChange={(e) => setSearchFactureTerm(e.target.value)}
                    placeholder="Rechercher une facture (Numéro, client, modèle...)"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                  />
                </div>

                {filteredUnpaidInvoices.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-stone-200 bg-[#FBF8F3]">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-800">Toutes les factures sont soldées ! 🎉</p>
                    <p className="text-xs text-stone-500 mt-1">Aucun encaissement en attente sur commande.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FBF8F3] text-stone-500 font-semibold text-[11px] border-b border-stone-200/80">
                        <tr>
                          <th className="p-3.5">Facture</th>
                          <th className="p-3.5">Client</th>
                          <th className="p-3.5">Commande / Modèle</th>
                          <th className="p-3.5 text-right">Montant Total</th>
                          <th className="p-3.5 text-right">Reste à Payer</th>
                          <th className="p-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredUnpaidInvoices.map((f) => {
                          const client = clients.find(c => c.id === f.clientId);
                          const order = f.commandeId ? commandes.find(c => c.id === f.commandeId) : null;
                          return (
                            <tr key={f.id} className="hover:bg-stone-50/70 transition">
                              <td className="p-3.5 font-semibold text-stone-900">
                                #{f.numero}
                              </td>
                              <td className="p-3.5 font-medium text-stone-800">
                                {client ? `${client.prenom} ${client.nom}` : 'Client Inconnu'}
                              </td>
                              <td className="p-3.5 text-stone-600">
                                {order ? (
                                  <span className="flex items-center gap-1.5 font-medium text-stone-800">
                                    <Scissors className="h-3.5 w-3.5 text-[#F05A22]" /> {order.nomModele}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 italic">{f.designationDirecte || 'Vente directe'}</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right font-medium text-stone-700">
                                {formatPrice(f.montantTotal)}
                              </td>
                              <td className="p-3.5 text-right font-semibold text-[#F05A22]">
                                {formatPrice(f.soldeDu)}
                              </td>
                              <td className="p-3.5 text-center">
                                <button
                                  disabled={!sessionCaisseActive}
                                  onClick={() => handleOpenTicketModal(f)}
                                  className={`py-1.5 px-3 text-[11px] font-semibold rounded-lg transition ${
                                    sessionCaisseActive
                                      ? 'btn-fox-primary cursor-pointer'
                                      : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
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
              <div className="card-fox rounded-3xl p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Journal des ventes de la session
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Historique chronologique des tickets édités durant cette session.
                    </p>
                  </div>
                  
                  <div className="relative max-w-xs w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchTicketTerm}
                      onChange={(e) => setSearchTicketTerm(e.target.value)}
                      placeholder="Filtrer les tickets..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                    />
                  </div>
                </div>

                {filteredActiveTickets.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center rounded-2xl border border-dashed border-stone-200 bg-[#FBF8F3]">
                    Aucun ticket de caisse émis pour le moment.
                  </p>
                ) : (
                  <div className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FBF8F3] text-stone-500 font-semibold text-[11px] border-b border-stone-200/80">
                        <tr>
                          <th className="p-3.5">Numéro</th>
                          <th className="p-3.5">Heure</th>
                          <th className="p-3.5">Type de vente</th>
                          <th className="p-3.5">Client</th>
                          <th className="p-3.5">Mode de paiement</th>
                          <th className="p-3.5 text-right">Montant</th>
                          <th className="p-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredActiveTickets.map((t) => {
                          const client = t.factureId 
                            ? clients.find(c => c.id === (factures.find(f => f.id === t.factureId)?.clientId))
                            : null;
                          return (
                            <tr key={t.id} className={`hover:bg-stone-50/70 transition ${t.statut === 'annule' ? 'opacity-50 bg-stone-50' : ''}`}>
                              <td className="p-3.5 font-semibold text-stone-900">
                                #{t.numero}
                                {t.statut === 'annule' && (
                                  <span className="ml-2 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[10px] rounded-full">
                                    Annulé
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-stone-500">
                                {new Date(t.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3.5 font-medium text-stone-700">
                                {t.typeVente === 'commande_acompte' ? 'Acompte' : t.typeVente === 'commande_solde' ? 'Solde' : t.typeVente === 'retouche' ? 'Retouche' : 'Vente directe'}
                              </td>
                              <td className="p-3.5 text-stone-800 truncate max-w-[140px]">
                                {client ? `${client.prenom} ${client.nom}` : 'Client comptoir'}
                              </td>
                              <td className="p-3.5">
                                {t.detailsMode ? (
                                  <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-[11px]" title={`Espèces: ${t.detailsMode.especes}, Électro: ${t.montant - (t.detailsMode.especes || 0)}`}>
                                    Mixte ⚡
                                  </span>
                                ) : (
                                  <span className="text-stone-600 font-medium text-[11px]">
                                    {t.modePaiement === 'especes' ? '💵 Espèces' : t.modePaiement === 'mobile_money' ? '📱 Mobile Money' : t.modePaiement === 'carte' ? '💳 Carte' : '🏦 Virement'}
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right font-semibold text-stone-900">
                                {formatPrice(t.montant)}
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setSelectedTicketToPrint(t)}
                                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer transition"
                                    title="Imprimer / Télécharger le Ticket"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </button>
                                  
                                  {t.statut === 'valide' && (
                                    <button
                                      onClick={() => handleCancelTicketClick(t.id)}
                                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                                      title="Annuler le Ticket"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
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
        <div className="card-fox rounded-3xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">
                Historique des sessions & rapports Z
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Rapports financiers horodatés générés à la clôture de chaque service.
              </p>
            </div>
            
            <div className="relative max-w-xs w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchHistoryTerm}
                onChange={(e) => setSearchHistoryTerm(e.target.value)}
                placeholder="Filtrer l'historique par date, statut..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF8F3] text-stone-500 font-semibold text-[11px] border-b border-stone-200/80">
                <tr>
                  <th className="p-3.5">Session</th>
                  <th className="p-3.5">Ouverture</th>
                  <th className="p-3.5">Clôture</th>
                  <th className="p-3.5 text-right">Fond Initial</th>
                  <th className="p-3.5 text-right">Solde Théorique</th>
                  <th className="p-3.5 text-right">Solde Compté</th>
                  <th className="p-3.5 text-right">Écart</th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-center">Rapport Z</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSessionHistory.map((s) => {
                  const hasEcart = s.ecart !== undefined && s.ecart !== 0;
                  return (
                    <tr key={s.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-3.5 font-semibold text-stone-900">
                        #{s.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {new Date(s.dateOuverture).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {s.dateCloture ? new Date(s.dateCloture).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="p-3.5 text-right text-stone-700">
                        {formatPrice(s.fondInitial)}
                      </td>
                      <td className="p-3.5 text-right text-stone-700">
                        {formatPrice(s.montantTheorique)}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-stone-900">
                        {s.montantCompte !== undefined ? formatPrice(s.montantCompte) : '—'}
                      </td>
                      <td className={`p-3.5 text-right font-semibold ${hasEcart ? (s.ecart! < 0 ? 'text-rose-600' : 'text-emerald-600') : 'text-stone-400'}`}>
                        {s.ecart !== undefined ? (s.ecart === 0 ? '0' : (s.ecart > 0 ? `+${formatPrice(s.ecart)}` : formatPrice(s.ecart))) : '—'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] border ${
                          s.statut === 'ouverte'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {s.statut === 'ouverte' ? 'Ouverte' : 'Clôturée'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedZReport(s)}
                          className="px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200/80 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#F05A22]" /> Rapport Z
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-sm w-full p-6 shadow-2xl"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <Unlock className="h-5 w-5 text-[#F05A22]" /> Ouverture de session de caisse
              </h4>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Saisissez le montant physique en espèces présent dans le tiroir-caisse pour démarrer la session (fond de caisse).
              </p>

              <form onSubmit={handleOpenCaisse} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Fond de caisse initial (espèces)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={initialFund}
                      onChange={(e) => setInitialFund(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-500">{settings.devise}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpeningModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-sm w-full p-6 shadow-2xl"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#F05A22]" /> Clôture de session de caisse
              </h4>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Comptez les espèces présentes dans le tiroir-caisse et saisissez le montant total.
              </p>

              <form onSubmit={handleCloseCaisse} className="space-y-4">
                <div className="p-3 bg-[#FBF8F3] rounded-2xl border border-stone-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Solde théorique attendu:</span>
                    <strong className="font-semibold text-stone-900">{formatPrice(sessionTotals.total)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Fond de démarrage:</span>
                    <span className="text-stone-700">{formatPrice(sessionCaisseActive?.fondInitial || 0)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Montant réel compté (espèces)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={actualCashCounted}
                      onChange={(e) => setActualCashCounted(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-500">{settings.devise}</span>
                  </div>
                  {actualCashCounted - sessionTotals.total !== 0 && (
                    <span className={`text-[11px] font-semibold block mt-1.5 ${actualCashCounted - sessionTotals.total < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Écart estimé : {actualCashCounted - sessionTotals.total < 0 ? 'Manquant ' : 'Surplus '}{formatPrice(Math.abs(actualCashCounted - sessionTotals.total))}
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClosingModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#161412] hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-sm w-full p-6 shadow-2xl"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-rose-500" /> Sortie de caisse (Dépense)
              </h4>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Achat de fournitures urgentes ou dépenses de fonctionnement. Cette somme sera déduite du solde d'espèces.
              </p>

              <form onSubmit={handleAddOutflow} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Montant à retirer ({settings.devise})</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={outflowAmount}
                      onChange={(e) => setOutflowAmount(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-500">{settings.devise}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Motif de la dépense *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Achat de fils dorés et boutons"
                    value={outflowMotif}
                    onChange={(e) => setOutflowMotif(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Référence du justificatif (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Reçu #2947"
                    value={outflowJustif}
                    onChange={(e) => setOutflowJustif(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOutflowModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto sidebar-scroll"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <Store className="h-5 w-5 text-[#F05A22]" /> Enregistrer une vente / Ticket
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Un ticket sera généré et le document de facturation lié sera instantanément mis à jour.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                {/* Sale Type Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FBF8F3] rounded-2xl border border-stone-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('invoice');
                      setSelectedFactureId('');
                      setTicketAmount(0);
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                      ticketType === 'invoice' ? 'bg-[#161412] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Facture unique
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('grouped');
                      if (clients.length > 0) {
                        handleGroupedClientChange(clients[0].id);
                      }
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                      ticketType === 'grouped' ? 'bg-[#161412] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Règlement groupé
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketType('free');
                      setTicketAmount(0);
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl text-center transition cursor-pointer ${
                      ticketType === 'free' ? 'bg-[#161412] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Vente libre
                  </button>
                </div>

                {ticketType === 'invoice' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Sélectionner la facture *</label>
                      <select
                        required
                        value={selectedFactureId}
                        onChange={(e) => handleFactureSelectionChange(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      >
                        <option value="">-- Choisir une facture --</option>
                        {unpaidInvoices.map((f) => {
                          const cl = clients.find(c => c.id === f.clientId);
                          const clientName = cl ? `${cl.prenom} ${cl.nom}` : 'Client Inconnu';
                          const detailsStr = f.commandeId ? `Facture #${f.numero} (Reste: ${formatPrice(f.soldeDu)})` : `Facture #${f.numero} (Directe, Reste: ${formatPrice(f.soldeDu)})`;
                          return (
                            <option key={f.id} value={f.id}>
                              {clientName} — {detailsStr}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedFactureId && (
                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">Montant à encaisser ({settings.devise})</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="1"
                            value={ticketAmount}
                            onChange={(e) => setTicketAmount(Number(e.target.value))}
                            className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {ticketType === 'grouped' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Sélectionner le client *</label>
                      <select
                        required
                        value={groupedClientId}
                        onChange={(e) => handleGroupedClientChange(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      >
                        <option value="">-- Choisir un client --</option>
                        {clients.map((c) => {
                          const unpaidCount = factures.filter(f => f.clientId === c.id && f.statut !== 'paye').length;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.prenom} {c.nom} ({unpaidCount} facture(s) en attente)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {groupedClientId && (
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-stone-700 block">
                          Allocation des montants par facture :
                        </label>
                        
                        {factures.filter(f => f.clientId === groupedClientId && f.statut !== 'paye').length === 0 ? (
                          <div className="p-3 bg-[#FBF8F3] rounded-xl border border-stone-200/80 text-center text-xs text-stone-500">
                            Aucune facture impayée pour ce client.
                          </div>
                        ) : (
                          <div className="space-y-2 border border-stone-200/80 rounded-2xl p-2.5 max-h-48 overflow-y-auto sidebar-scroll bg-[#FBF8F3]">
                            {factures
                              .filter(f => f.clientId === groupedClientId && f.statut !== 'paye')
                              .map(f => {
                                const allocated = groupedAllocations[f.id] !== undefined ? groupedAllocations[f.id] : 0;
                                return (
                                  <div key={f.id} className="p-2.5 bg-white rounded-xl border border-stone-200/60 flex flex-col gap-1.5 shadow-xs">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-semibold text-stone-800">Facture #{f.numero}</span>
                                      <span className="text-stone-500">Reste dû: <strong className="font-semibold text-[#F05A22]">{formatPrice(f.soldeDu)}</strong></span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max={f.soldeDu}
                                        value={allocated}
                                        onChange={(e) => handleAllocationChange(f.id, Number(e.target.value))}
                                        className="w-full p-2 bg-[#FBF8F3] rounded-lg border border-stone-200/80 text-xs font-semibold text-stone-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAllocationChange(f.id, f.soldeDu)}
                                        className="px-2.5 py-1.5 bg-[#161412] hover:bg-stone-800 text-white text-[10px] font-semibold rounded-lg transition"
                                      >
                                        Max
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAllocationChange(f.id, 0)}
                                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold rounded-lg transition"
                                      >
                                        Vider
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        <div className="p-3 bg-[#FDF4EE] rounded-xl border border-[#F05A22]/20 flex justify-between items-center">
                          <span className="text-xs font-semibold text-stone-700">Total encaissé groupé :</span>
                          <span className="text-base font-bold text-[#F05A22]">{formatPrice(ticketAmount)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {ticketType === 'free' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Client pour la vente libre *</label>
                      <select
                        required
                        value={freeSaleClient}
                        onChange={(e) => setFreeSaleClient(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.prenom} {c.nom} ({c.telephone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Description des articles *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Tissu Brocard 5 mètres, boutons argentés..."
                        value={freeSaleDescription}
                        onChange={(e) => setFreeSaleDescription(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Montant total de la vente *</label>
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
                          className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-500">{settings.devise}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Mixed Payment Toggle */}
                <div className="p-3 bg-[#FBF8F3] rounded-2xl border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">Paiement mixte (Espèces + Électronique)</span>
                    <span className="text-[11px] text-stone-500">Payer une partie en cash et le reste via Wave/OM/Carte.</span>
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
                    className="w-4 h-4 text-[#F05A22] accent-[#F05A22] cursor-pointer"
                  />
                </div>

                {isMixedPayment ? (
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FDF4EE] rounded-2xl border border-[#F05A22]/20 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Part en espèces ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        value={mixedEspeces}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMixedEspeces(val);
                          setMixedElectronic(Math.max(0, ticketAmount - val));
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Part électronique ({settings.devise})</label>
                      <input
                        type="number"
                        required
                        value={mixedElectronic}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMixedElectronic(val);
                          setMixedEspeces(Math.max(0, ticketAmount - val));
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs font-semibold text-[#F05A22]"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Moyen de règlement électronique</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs text-stone-800"
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
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Mode de règlement *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                      className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800"
                    >
                      {(settings.posModesPaiementActifs?.especes ?? true) && (
                        <option value="especes">💵 Espèces (Cash)</option>
                      )}
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
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto sidebar-scroll"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#F05A22]" /> Finaliser la vente tactile
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Sélectionnez le mode de règlement pour encaisser le panier.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmTactileCheckout(paymentMode, isMixedPayment, mixedEspeces, mixedElectronic, paymentMode);
                }} 
                className="space-y-4"
              >
                {/* Cart summary */}
                <div className="p-3.5 bg-[#FBF8F3] rounded-2xl border border-stone-200/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Client :</span>
                    <span className="font-semibold text-stone-900">
                      {(() => {
                        const cl = clients.find(c => c.id === cartClientId);
                        return cl ? `${cl.prenom} ${cl.nom}` : 'Client direct (comptoir)';
                      })()}
                    </span>
                  </div>
                  {cartNote && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Note :</span>
                      <span className="italic text-stone-700">« {cartNote} »</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between font-bold text-sm text-stone-900">
                    <span>Total à payer :</span>
                    <span className="text-[#F05A22]">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                {/* Mixed Payment Toggle */}
                <div className="p-3 bg-[#FBF8F3] rounded-2xl border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">Paiement mixte (Espèces + Électronique)</span>
                    <span className="text-[11px] text-stone-500">Payer une partie en cash et le reste via Mobile Money/Carte.</span>
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
                    className="w-4 h-4 text-[#F05A22] accent-[#F05A22] cursor-pointer"
                  />
                </div>

                {isMixedPayment ? (
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FDF4EE] rounded-2xl border border-[#F05A22]/20 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Part en espèces ({settings.devise})</label>
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
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs font-semibold text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Part électronique ({settings.devise})</label>
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
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs font-semibold text-[#F05A22] focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">Mode de règlement de la part électronique</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200/80 text-xs text-stone-800"
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
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Mode de règlement *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as ModePaiement)}
                      className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800"
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

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTactileCheckoutOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Confirmer le paiement
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-sm w-full p-6 shadow-2xl"
            >
              <h4 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#F05A22]" /> Article personnalisé
              </h4>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Saisissez un nom d'article et son prix unitaire en FCFA pour l'ajouter au panier.
              </p>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Nom de l'article *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tissu Wax client (4 mètres)"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-[#F05A22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Prix unitaire ({settings.devise}) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ex: 15000"
                      value={customItemPrice || ''}
                      onChange={(e) => setCustomItemPrice(Number(e.target.value) || 0)}
                      className="w-full p-2.5 text-sm bg-[#FBF8F3] border border-stone-200/80 rounded-xl font-semibold text-stone-900 focus:outline-hidden focus:border-[#F05A22]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-500">{settings.devise}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomItemModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 btn-fox-primary text-xs font-semibold rounded-xl cursor-pointer"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-fox rounded-3xl border border-stone-200/80 max-w-sm w-full p-6 shadow-2xl"
            >
              <h4 className="text-base font-semibold text-rose-600 mb-1 flex items-center gap-2">
                <Ban className="h-5 w-5" /> Annulation d'un ticket de caisse
              </h4>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Cette opération va annuler la transaction financière, recréditer le reste à payer sur la facture liée et déduire le montant du solde de caisse.
              </p>

              <form onSubmit={handleConfirmCancellation} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-rose-600 block mb-1">Motif d'annulation *</label>
                  <textarea
                    required
                    placeholder="Saisissez la raison de l'annulation (ex: erreur de saisie, désistement client...)"
                    value={cancellationMotif}
                    onChange={(e) => setCancellationMotif(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 text-xs bg-[#FBF8F3] border border-stone-200/80 rounded-xl text-stone-800 focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingTicketId(null)}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl border border-stone-200/80 font-mono relative shadow-2xl ${
                settings.ticketLargeur === '58mm' ? 'max-w-[320px] p-5 text-[11px]' : 'max-w-sm p-6 text-xs'
              }`}
            >
              <button
                onClick={() => setSelectedTicketToPrint(null)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>

              {/* Thermal Receipt Visual Template styling */}
              <div className="border-b border-dashed border-stone-300 pb-4 text-center space-y-1">
                {settings.ticketEnTete && (
                  <span className="text-[10px] font-semibold text-stone-500 bg-[#FBF8F3] px-2.5 py-0.5 rounded-full border border-stone-200 inline-block mb-1">
                    {settings.ticketEnTete}
                  </span>
                )}
                <h2 className="font-bold text-base tracking-tight text-stone-900">{settings.raisonSociale}</h2>
                {(settings.ticketAfficherSlogan ?? true) && settings.slogan && (
                  <p className="text-[10px] text-stone-600">{settings.slogan}</p>
                )}
                <p className="text-[10px] text-stone-500 mt-1">{settings.adresse}</p>
                <p className="text-[10px] text-stone-500">Tél: {settings.telephone}</p>
                {(settings.ticketAfficherNinea ?? true) && settings.ninea && (
                  <p className="text-[10px] text-stone-500">Ninea: {settings.ninea}</p>
                )}
              </div>

              <div className="py-3.5 space-y-1.5 text-xs border-b border-dashed border-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-500">Ticket n°:</span>
                  <span className="font-bold text-stone-900">#{selectedTicketToPrint.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date/Heure:</span>
                  <span className="text-stone-700">{new Date(selectedTicketToPrint.dateHeure).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Statut:</span>
                  <span className={`font-semibold ${selectedTicketToPrint.statut === 'valide' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedTicketToPrint.statut === 'valide' ? 'Payé' : 'Annulé'}
                  </span>
                </div>
                {selectedTicketToPrint.motifAnnulation && (
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 text-[10px] mt-1 text-rose-700">
                    Motif: {selectedTicketToPrint.motifAnnulation}
                  </div>
                )}
              </div>

              <div className="py-3.5 space-y-1.5 border-b border-dashed border-stone-300">
                <div className="text-[11px] font-semibold text-stone-500">Détails de la vente</div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-900">
                    {selectedTicketToPrint.typeVente === 'commande_acompte' 
                      ? 'Acompte commande' 
                      : selectedTicketToPrint.typeVente === 'commande_solde' 
                      ? 'Solde commande' 
                      : selectedTicketToPrint.typeVente === 'retouche' 
                      ? 'Retouche' 
                      : 'Vente directe'}
                  </span>
                  <span className="text-stone-500">1x</span>
                </div>
                {selectedTicketToPrint.descriptionLibre && (
                  <p className="text-[11px] text-stone-600 italic">
                    « {selectedTicketToPrint.descriptionLibre} »
                  </p>
                )}
                {selectedTicketToPrint.factureId && (
                  <p className="text-[10px] text-stone-400">
                    Facture #{selectedTicketToPrint.factureId.slice(-6).toUpperCase()}
                  </p>
                )}
              </div>

              <div className="py-3.5 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-sm text-stone-900">
                  <span>Net à payer :</span>
                  <span className="text-[#F05A22]">{formatPrice(selectedTicketToPrint.montant)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Règlement :</span>
                  <span className="font-semibold text-stone-700">
                    {selectedTicketToPrint.detailsMode ? 'Paiement mixte' : selectedTicketToPrint.modePaiement}
                  </span>
                </div>
                
                {selectedTicketToPrint.detailsMode && (
                  <div className="bg-[#FBF8F3] p-2 rounded-xl border border-stone-200/80 text-[10px] mt-2 space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Espèces :</span>
                      <span>{formatPrice(selectedTicketToPrint.detailsMode.especes || 0)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Électronique :</span>
                      <span>{formatPrice(selectedTicketToPrint.montant - (selectedTicketToPrint.detailsMode.especes || 0))}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-dashed border-stone-300 text-center text-[10px] text-stone-500 space-y-1">
                <p className="font-semibold text-stone-800">{settings.ticketRemerciement || 'Merci de votre confiance !'}</p>
                {settings.ticketBasPage && <p className="italic">{settings.ticketBasPage}</p>}
                <p className="text-[9px] text-stone-400">Fox Couture Atelier</p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    printThermalTicketDirectly(selectedTicketToPrint);
                  }}
                  className="flex-1 py-2.5 bg-[#161412] hover:bg-stone-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  onClick={() => handleWhatsAppTicket(selectedTicketToPrint)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Smartphone className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  onClick={() => setSelectedTicketToPrint(null)}
                  className="py-2.5 px-3.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 cursor-pointer transition"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-stone-200/80 max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedZReport(null)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>

              <div className="border-b border-stone-200 pb-3 text-center">
                <span className="text-[10px] font-semibold text-stone-600 bg-[#FBF8F3] px-3 py-1 rounded-full border border-stone-200 mb-2 inline-block">
                  Rapport Z de caisse (Comptable)
                </span>
                <h3 className="font-semibold text-base text-stone-900 mt-1">{settings.raisonSociale}</h3>
                <p className="text-[10px] text-stone-400">ID Session: #{selectedZReport.id.slice(-6).toUpperCase()}</p>
              </div>

              <div className="py-3.5 space-y-1.5 text-xs border-b border-stone-100">
                <div className="flex justify-between">
                  <span className="text-stone-500">Ouverture :</span>
                  <span className="text-stone-800">{new Date(selectedZReport.dateOuverture).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Clôture :</span>
                  <span className="text-stone-800">{selectedZReport.dateCloture ? new Date(selectedZReport.dateCloture).toLocaleString('fr-FR') : 'Session toujours ouverte'}</span>
                </div>
              </div>

              <div className="py-3.5 space-y-2 text-xs border-b border-stone-100">
                <div className="flex justify-between">
                  <span className="text-stone-600">Fond initial :</span>
                  <span className="font-semibold text-stone-900">{formatPrice(selectedZReport.fondInitial)}</span>
                </div>
                
                {/* Mode distribution if closed */}
                {selectedZReport.recapModes && (
                  <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/80 text-xs space-y-1.5">
                    <div className="text-[10px] font-semibold text-stone-500 block mb-1">Récapitulatif des encaissements</div>
                    <div className="flex justify-between text-stone-600">
                      <span>💵 Espèces :</span>
                      <strong className="font-semibold text-stone-900">{formatPrice(selectedZReport.recapModes.especes)}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>📱 Mobile Money :</span>
                      <strong className="font-semibold text-stone-900">{formatPrice(selectedZReport.recapModes.mobile_money)}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>💳 Carte bancaire :</span>
                      <strong className="font-semibold text-stone-900">{formatPrice(selectedZReport.recapModes.carte)}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>🏦 Virement :</span>
                      <strong className="font-semibold text-stone-900">{formatPrice(selectedZReport.recapModes.virement)}</strong>
                    </div>
                  </div>
                )}

                {/* Cash outflows summary */}
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Dépenses / Sorties :</span>
                  <span>- {formatPrice(
                    sortiesCaisse.filter(o => o.sessionId === selectedZReport.id).reduce((acc, o) => acc + o.montant, 0)
                  )}</span>
                </div>
              </div>

              <div className="py-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Solde théorique attendu :</span>
                  <span className="font-semibold text-stone-800">{formatPrice(selectedZReport.montantTheorique)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-sm text-stone-900">
                  <span>Solde réel compté :</span>
                  <span className="text-[#F05A22]">{selectedZReport.montantCompte !== undefined ? formatPrice(selectedZReport.montantCompte) : 'Non clôturée'}</span>
                </div>

                {selectedZReport.ecart !== undefined && (
                  <div className={`p-3 rounded-xl border text-center text-xs font-semibold flex items-center justify-center gap-2 ${
                    selectedZReport.ecart === 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedZReport.ecart === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4" /> Écart de caisse : Parfait (0 FCFA)
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" /> 
                        {selectedZReport.ecart < 0 ? `Manquant : ` : `Surplus : `}
                        {formatPrice(Math.abs(selectedZReport.ecart))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-[#161412] hover:bg-stone-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button
                  onClick={() => exportZReportToCSV(selectedZReport)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  Exporter CSV
                </button>
                <button
                  onClick={() => setSelectedZReport(null)}
                  className="py-2.5 px-3.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 cursor-pointer transition"
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
