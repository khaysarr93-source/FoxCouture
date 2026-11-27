/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Facture, StatutPaiement, ModePaiement } from '../types';
import { 
  FileText, 
  Printer, 
  PlusCircle, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Coins, 
  User, 
  ChevronRight, 
  Smartphone,
  Check,
  TrendingUp,
  SlidersHorizontal,
  MessageCircle
} from 'lucide-react';
import { buildWhatsAppLink, WhatsAppTemplates } from '../lib/whatsapp';

export default function BillingSection() {
  const { 
    settings,
    factures, 
    clients, 
    commandes, 
    addReglement,
    addFacture,
    formatPrice
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutPaiement | 'all'>('all');
  const [selectedFactureId, setSelectedFactureId] = useState<string | null>(factures[0]?.id || null);

  // New Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<ModePaiement>('mobile_money');
  const [paymentNotes, setPaymentNotes] = useState('');

  // New Direct Standalone Invoice States
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoiceDesignation, setNewInvoiceDesignation] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState<number>(0);
  const [newInvoiceAcompte, setNewInvoiceAcompte] = useState<number>(0);
  const [newInvoiceAcompteMode, setNewInvoiceAcompteMode] = useState<ModePaiement>('especes');
  const [newInvoiceAcompteRef, setNewInvoiceAcompteRef] = useState('');

  // Sync default client selected when opening modal or on mount
  React.useEffect(() => {
    if (clients.length > 0 && !newInvoiceClientId) {
      setNewInvoiceClientId(clients[0].id);
    }
  }, [clients, newInvoiceClientId]);

  const handleCreateDirectInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceClientId || !newInvoiceDesignation || newInvoiceAmount <= 0) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (newInvoiceAcompte > newInvoiceAmount) {
      alert("Le montant de l'acompte ne peut pas dépasser le montant total de la facture !");
      return;
    }

    const newFact = addFacture(
      {
        clientId: newInvoiceClientId,
        montantTotal: newInvoiceAmount,
        designationDirecte: newInvoiceDesignation,
      },
      newInvoiceAcompte,
      newInvoiceAcompteMode,
      newInvoiceAcompteRef
    );

    // Auto select the newly created invoice
    setSelectedFactureId(newFact.id);

    // Reset Form & Close
    setIsNewInvoiceModalOpen(false);
    setNewInvoiceDesignation('');
    setNewInvoiceAmount(0);
    setNewInvoiceAcompte(0);
    setNewInvoiceAcompteRef('');
  };

  const selectedFacture = factures.find(f => f.id === selectedFactureId);
  const invoiceClient = selectedFacture ? clients.find(c => c.id === selectedFacture.clientId) : null;
  const invoiceOrder = selectedFacture ? commandes.find(c => c.id === selectedFacture.commandeId) : null;

  const filteredInvoices = factures.filter(f => {
    const client = clients.find(cl => cl.id === f.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : '';
    const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatut === 'all' || f.statut === filterStatut;
    return matchesSearch && matchesStatus;
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactureId || paymentAmount <= 0 || !selectedFacture) return;

    if (paymentAmount > selectedFacture.soldeDu) {
      alert('Erreur: Le montant du versement dépasse le solde restant dû !');
      return;
    }

    addReglement(selectedFactureId, {
      montant: paymentAmount,
      mode: paymentMethod,
      reference: paymentNotes || undefined
    });

    setIsPaymentModalOpen(false);
    setPaymentAmount(10000);
    setPaymentNotes('');
  };

  const formatFCFA = (val: number) => {
    return formatPrice(val);
  };

  const printReceipt = () => {
    if (!selectedFacture || !invoiceClient) return;

    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open('about:blank', uniqueName, 'left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer.');
      return;
    }

    const payeTotal = selectedFacture.montantTotal - selectedFacture.soldeDu;
    const tvaTaux = settings.tauxTva || 0;
    const mtTotal = selectedFacture.montantTotal;
    const mtHT = tvaTaux > 0 ? mtTotal / (1 + tvaTaux / 100) : mtTotal;
    const mtTVA = mtTotal - mtHT;

    printWindow.document.write(`
      <html>
        <head>
          <title>Facture ${selectedFacture.numero} - ${settings.raisonSociale}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; margin: 40px; line-height: 1.6; background: #FFF; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #FF7A1A; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-container { display: flex; align-items: center; }
            .brand { font-size: 28px; font-weight: 900; letter-spacing: 1px; color: #1A1A1A; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #E85D04; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
            .meta-info { text-align: right; font-size: 13px; }
            .address-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; font-size: 14px; }
            .address-block h3 { margin-top: 0; border-bottom: 1px solid #FF7A1A; padding-bottom: 5px; color: #343A40; font-size: 14px; text-transform: uppercase; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .invoice-table th, .invoice-table td { padding: 12px 15px; border-bottom: 1px solid #eee; text-align: left; }
            .invoice-table th { background-color: #FFF3EA; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #E85D04; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 40px; font-size: 15px; }
            .totals-row { display: flex; width: 300px; justify-content: space-between; padding: 8px 0; }
            .totals-row.grand-total { border-top: 2px solid #FF7A1A; font-weight: bold; font-size: 18px; color: #1A1A1A; padding-top: 12px; }
            .payments-box { background: #FFF9F5; border: 1px solid #FFE4D0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .payments-box h4 { margin-top: 0; color: #E85D04; border-bottom: 1px solid #FFE4D0; padding-bottom: 5px; }
            .payment-item { display: flex; justify-content: space-between; font-size: 13px; border-bottom: 1px dashed #FFE4D0; padding: 6px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header">
            <div class="brand-container">
              <svg viewBox="0 0 100 100" style="width: 50px; height: 50px; fill: none; margin-right: 15px; display: inline-block; vertical-align: middle;">
                <polygon points="50,45 15,15 35,55" fill="#E85D04" />
                <polygon points="50,45 85,15 65,55" fill="#E85D04" />
                <polygon points="50,45 25,25 35,55" fill="#FF7A1A" />
                <polygon points="50,45 75,25 65,55" fill="#FF7A1A" />
                <polygon points="50,15 35,55 50,45" fill="#FF7A1A" />
                <polygon points="50,15 65,55 50,45" fill="#E85D04" />
                <polygon points="50,45 35,55 20,68 50,75" fill="#E85D04" />
                <polygon points="50,45 65,55 80,68 50,75" fill="#FF7A1A" />
                <polygon points="20,68 35,55 35,68" fill="#F8F9FA" />
                <polygon points="80,68 65,55 65,68" fill="#F8F9FA" />
                <polygon points="50,45 35,68 50,85" fill="#FF7A1A" />
                <polygon points="50,45 65,68 50,85" fill="#E85D04" />
                <polygon points="50,85 40,70 50,68" fill="#F8F9FA" />
                <polygon points="50,85 60,70 50,68" fill="#F8F9FA" />
                <polygon points="50,85 45,78 55,78" fill="#1A1A1A" />
                <polygon points="38,58 44,58 41,61" fill="#1A1A1A" />
                <polygon points="62,58 56,58 59,61" fill="#1A1A1A" />
                <path d="M42,88 L50,91 L58,88 L50,95 Z" fill="#E85D04" />
              </svg>
              <div style="display: inline-block; vertical-align: middle;">
                <div class="brand">${settings.raisonSociale}</div>
                <div class="subtitle">${settings.slogan}</div>
                <div style="font-size: 11px; color: #343A40; margin-top: 5px;">${settings.adresse}</div>
              </div>
            </div>
            <div class="meta-info">
              <strong>FACTURE N° : ${selectedFacture.numero}</strong><br>
              Date d'émission : ${selectedFacture.dateEmission.split('-').reverse().join('/')}<br>
              Statut : <span style="text-transform: uppercase; font-weight: bold; color: ${selectedFacture.statut === 'paye' ? '#2E7D32' : selectedFacture.statut === 'partiel' ? '#F9A825' : '#D32F2F'}">${selectedFacture.statut === 'paye' ? 'Réglée' : selectedFacture.statut === 'partiel' ? 'Partiel (Acompte)' : 'Impayée'}</span>
            </div>
          </div>

          <div class="address-grid">
            <div class="address-block">
              <h3>Émetteur</h3>
              <strong>${settings.raisonSociale}</strong><br>
              Téléphone : ${settings.telephone}<br>
              NINEA / RC : ${settings.ninea}
            </div>
            <div class="address-block">
              <h3>Facturé à</h3>
              <strong>${invoiceClient.prenom} ${invoiceClient.nom}</strong><br>
              Téléphone : ${invoiceClient.telephone}<br>
              Adresse : ${invoiceClient.adresse || 'Dakar'}
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Désignation de la commande / Prestation</th>
                <th>Matière & Fourniture</th>
                <th style="text-align: right;">Prix Unitaire</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${selectedFacture.designationDirecte || (invoiceOrder ? invoiceOrder.modeleNom : 'Prestation Sur-mesure')}</strong><br><span style="font-size: 11px; color:#777;">Réf Commande: ${invoiceOrder ? invoiceOrder.reference : 'Facture Standalone / Directe'}</span></td>
                <td>${invoiceOrder ? invoiceOrder.tissuNom : 'Inclus / Fourni'}</td>
                <td style="text-align: right; font-weight: bold;">${new Intl.NumberFormat('fr-FR').format(selectedFacture.montantTotal)} ${settings.devise}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Sous-total HT :</span>
              <span>${new Intl.NumberFormat('fr-FR').format(mtHT)} ${settings.devise}</span>
            </div>
            <div class="totals-row">
              <span>TVA (${tvaTaux}%) :</span>
              <span>${new Intl.NumberFormat('fr-FR').format(mtTVA)} ${settings.devise}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total Net à Payer :</span>
              <span>${new Intl.NumberFormat('fr-FR').format(selectedFacture.montantTotal)} ${settings.devise}</span>
            </div>
          </div>

          <div class="payments-box">
            <h4>Historique des Encaissements (Acomptes Reçus)</h4>
            ${selectedFacture.reglements.length > 0 ? 
              selectedFacture.reglements.map((reg, index) => `
                <div class="payment-item">
                  <span>Tranche n°${index + 1} (${reg.mode === 'mobile_money' ? 'Mobile Money' : reg.mode === 'especes' ? 'Espèces' : reg.mode === 'carte' ? 'Carte' : 'Virement'}) ${reg.reference ? `- Réf: ${reg.reference}` : ''}</span>
                  <strong>${new Intl.NumberFormat('fr-FR').format(reg.montant)} ${settings.devise}</strong>
                </div>
              `).join('') : '<p style="font-size:12px; color:#999; margin:0;">Aucun versement enregistré à ce jour.</p>'
            }
          </div>

          <div style="display:flex; justify-content: space-between; font-size:14px; margin-top:20px; font-weight:bold; background:#f9f9f9; padding:15px; border-radius:8px;">
            <span>TOTAL ENCAISSÉ : ${new Intl.NumberFormat('fr-FR').format(payeTotal)} ${settings.devise}</span>
            <span style="color:#ef4444;">RESTE À DEVOIR : ${new Intl.NumberFormat('fr-FR').format(selectedFacture.soldeDu)} ${settings.devise}</span>
          </div>

          <div class="footer">
            <p>${settings.conditionsFacture}</p>
            <p style="font-size:9px; color:#ccc;">${settings.raisonSociale} - Propulsé par Fox Couture OS</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printThermalTicket = () => {
    if (!selectedFacture || !invoiceClient) return;

    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open('about:blank', uniqueName, 'left=100,top=100,width=400,height=700,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer.');
      return;
    }

    const payeTotal = selectedFacture.montantTotal - selectedFacture.soldeDu;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${selectedFacture.numero}</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              color: #000;
              background: #FFF;
              width: 280px;
              margin: 0 auto;
              padding: 10px 15px 40px 15px;
              font-size: 11px;
              line-height: 1.4;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .brand { font-size: 16px; font-weight: 900; margin-bottom: 2px; }
            .subtitle { font-size: 8px; font-weight: bold; margin-bottom: 4px; }
            .separator { border-top: 1px dashed #000; margin: 8px 0; }
            .double-separator { border-top: 1px double #000; border-bottom: 1px double #000; height: 3px; margin: 8px 0; }
            .flex-row { display: flex; justify-content: space-between; }
            .item-title { font-weight: bold; margin-top: 5px; }
            .item-details { display: flex; justify-content: space-between; margin-bottom: 5px; padding-left: 10px; }
            .total-section { font-size: 12px; margin-top: 8px; }
            .footer { font-size: 8px; text-align: center; margin-top: 25px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="center">
            <div class="brand">${settings.raisonSociale}</div>
            <div class="subtitle">${settings.slogan}</div>
            <div>${settings.adresse}</div>
            <div>Tél: ${settings.telephone}</div>
            <div>NINEA: ${settings.ninea}</div>
          </div>

          <div class="separator"></div>

          <div class="bold">TICKET CAISSE N° : ${selectedFacture.numero}</div>
          <div>Date : ${selectedFacture.dateEmission.split('-').reverse().join('/')}</div>
          <div>Client : ${invoiceClient.prenom.toUpperCase()} ${invoiceClient.nom.toUpperCase()}</div>
          <div>Tél : ${invoiceClient.telephone}</div>

          <div class="double-separator"></div>

          <div class="bold center">DÉSIGNATION / PRESTATION</div>
          
          <div class="item-title">
            ${selectedFacture.designationDirecte || (invoiceOrder ? invoiceOrder.modeleNom : 'Prestation Sur-mesure')}
          </div>
          <div class="item-details">
            <span>1 x service</span>
            <span class="bold">${new Intl.NumberFormat('fr-FR').format(selectedFacture.montantTotal)} ${settings.devise}</span>
          </div>

          <div class="separator"></div>

          <div class="total-section">
            <div class="flex-row bold">
              <span>MONTANT BRUT :</span>
              <span>${new Intl.NumberFormat('fr-FR').format(selectedFacture.montantTotal)} ${settings.devise}</span>
            </div>
            <div class="flex-row">
              <span>Remise / Rabais :</span>
              <span>0 ${settings.devise}</span>
            </div>
            <div class="separator"></div>
            <div class="flex-row bold" style="font-size: 13px;">
              <span>TOTAL NET :</span>
              <span>${new Intl.NumberFormat('fr-FR').format(selectedFacture.montantTotal)} ${settings.devise}</span>
            </div>
          </div>

          <div class="separator"></div>

          <div class="bold">RÈGLEMENTS / ACOMPTES :</div>
          ${selectedFacture.reglements.length > 0 ? 
            selectedFacture.reglements.map((reg, index) => `
              <div class="flex-row" style="font-size: 10px;">
                <span>#${index + 1} (${reg.mode === 'mobile_money' ? 'WAVE/OM' : reg.mode === 'especes' ? 'ESPÈCES' : reg.mode === 'carte' ? 'CARTE' : 'VIR'}) :</span>
                <span class="bold">${new Intl.NumberFormat('fr-FR').format(reg.montant)} ${settings.devise}</span>
              </div>
            `).join('') : '<div>Aucun versement enregistré.</div>'
          }

          <div class="double-separator"></div>

          <div class="flex-row bold" style="font-size: 12px;">
            <span>TOTAL ENCAISSÉ :</span>
            <span>${new Intl.NumberFormat('fr-FR').format(payeTotal)} ${settings.devise}</span>
          </div>
          <div class="flex-row bold" style="font-size: 12px;">
            <span>RESTE À PAYER :</span>
            <span>${new Intl.NumberFormat('fr-FR').format(selectedFacture.soldeDu)} ${settings.devise}</span>
          </div>

          <div class="separator"></div>

          <div class="footer">
            <p class="bold">Merci pour votre confiance !</p>
            <p>${settings.conditionsFacture}</p>
            <p>${settings.raisonSociale}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Metrics for billing
  const totalInvoiced = factures.reduce((sum, f) => sum + f.montantTotal, 0);
  const totalCollected = factures.reduce((sum, f) => sum + (f.montantTotal - f.soldeDu), 0);
  const totalOutstanding = factures.reduce((sum, f) => sum + f.soldeDu, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="billing-payments-section">
      
      {/* Column 1: Invoice index selection */}
      <div className="card-fox flex flex-col h-[750px] overflow-hidden">
        
        <div className="p-5 border-b border-stone-100 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-[#F05A22]" /> Facturation & devis
            </h3>
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="btn-fox-primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Directe 🧾
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="N° de facture, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
            />
          </div>

          {/* Quick Filter tabs */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {([
              { key: 'all', label: 'Toutes' },
              { key: 'impaye', label: 'Impayées' },
              { key: 'partiel', label: 'Partielles' },
              { key: 'paye', label: 'Payées' }
            ] as { key: StatutPaiement | 'all'; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatut(tab.key)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                  filterStatut === tab.key 
                    ? 'bg-[#191716] text-white shadow-xs' 
                    : 'bg-[#EDE8E0] text-stone-700 hover:bg-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of bills */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map(facture => {
              const client = clients.find(cl => cl.id === facture.clientId);
              const order = commandes.find(co => co.id === facture.commandeId);

              return (
                <div 
                  key={facture.id}
                  onClick={() => setSelectedFactureId(facture.id)}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition ${
                    selectedFactureId === facture.id ? 'bg-[#FDF4EE] border-l-4 border-[#F05A22]' : 'hover:bg-stone-50/70'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-semibold text-stone-500">
                      {facture.numero}
                    </span>
                    
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      facture.statut === 'paye' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      facture.statut === 'partiel' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {facture.statut === 'paye' ? 'Réglée' :
                       facture.statut === 'partiel' ? 'Acompte' : 'Impayée'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {client ? `${client.prenom} ${client.nom}` : 'Client Inconnu'}
                    </h4>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {facture.designationDirecte ? `Prestation : ${facture.designationDirecte}` : `Modèle : ${order ? order.modeleNom : 'Sur-mesure'}`}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-1 pt-1.5 border-t border-stone-200/60 font-medium">
                    <span className="text-stone-500">Total : {formatFCFA(facture.montantTotal)}</span>
                    <strong className="text-stone-900 font-mono font-bold">
                      Dû: {formatFCFA(facture.soldeDu)}
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-stone-400">
              <FileText className="h-8 w-8 mx-auto mb-2 text-stone-300" />
              <p className="text-xs font-medium">Aucune facture trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Detailed Receipt and actions */}
      <div className="lg:col-span-2 space-y-6">
        {selectedFacture ? (
          <>
            {/* Visual Header invoice detail card */}
            <div className="card-fox p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold bg-[#191716] text-[#FAF8F5] px-2.5 py-0.5 rounded-lg">
                      {selectedFacture.numero}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Date : {selectedFacture.dateEmission.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Récépissé de caisse officiel
                  </h2>
                  {selectedFacture.designationDirecte ? (
                    <p className="text-xs text-stone-800 mt-2 font-semibold bg-[#FBF8F3] px-3 py-1.5 rounded-xl border border-stone-200 inline-block">
                      ⚡ Prestation : {selectedFacture.designationDirecte}
                    </p>
                  ) : invoiceOrder ? (
                    <p className="text-xs text-stone-600 mt-2">
                      Commande : <strong className="font-bold text-stone-900">{invoiceOrder.modeleNom}</strong> ({invoiceOrder.reference})
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={printReceipt}
                    className="px-3.5 py-2 bg-white text-stone-800 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Facture A4
                  </button>

                  <button 
                    onClick={printThermalTicket}
                    className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-[#F05A22] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-[#F05A22]" /> Ticket caisse 🎫
                  </button>

                  {invoiceClient && (
                    <a
                      href={buildWhatsAppLink(
                        invoiceClient.telephone,
                        WhatsAppTemplates.recuCommande({
                          clientNom: `${invoiceClient.prenom} ${invoiceClient.nom}`,
                          reference: selectedFacture.numero,
                          modele: selectedFacture.designationDirecte || (invoiceOrder ? invoiceOrder.modeleNom : 'Prestation Sur-mesure'),
                          total: selectedFacture.montantTotal,
                          acompte: selectedFacture.montantTotal - selectedFacture.soldeDu,
                          solde: selectedFacture.soldeDu,
                          atelierNom: settings.raisonSociale
                        })
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                      title="Envoyer le reçu officiel sur WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      Reçu WhatsApp
                    </a>
                  )}
                  
                  {selectedFacture.statut !== 'paye' && (
                    <button 
                      onClick={() => {
                        setPaymentAmount(selectedFacture.soldeDu);
                        setIsPaymentModalOpen(true);
                      }}
                      className="btn-fox-primary !py-2 !px-3.5 flex items-center gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" /> Versement
                    </button>
                  )}
                </div>
              </div>

              {/* Invoice details body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Débiteur (Client)</h3>
                  <div className="bg-[#FBF8F3] p-4.5 rounded-2xl border border-stone-200/70 space-y-1.5">
                    <span className="font-bold text-stone-900 text-base block">
                      {invoiceClient ? `${invoiceClient.prenom} ${invoiceClient.nom}` : 'N/A'}
                    </span>
                    <p className="text-xs text-stone-600 font-mono flex items-center gap-1">
                      Téléphone : <span className="font-semibold text-stone-900">{invoiceClient?.telephone}</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      Adresse : {invoiceClient?.adresse || 'Dakar'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">État de la balance</h3>
                  <div className="bg-[#FBF8F3] p-4.5 rounded-2xl border border-stone-200/70 space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-stone-600">
                      <span>Réglé ({Math.round(((selectedFacture.montantTotal - selectedFacture.soldeDu) / selectedFacture.montantTotal) * 100)}%) :</span>
                      <span className="text-stone-900 font-mono font-bold">{formatFCFA(selectedFacture.montantTotal - selectedFacture.soldeDu)} / {formatFCFA(selectedFacture.montantTotal)}</span>
                    </div>

                    <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${((selectedFacture.montantTotal - selectedFacture.soldeDu) / selectedFacture.montantTotal) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold pt-1">
                      <span className="text-stone-600">Solde restant dû :</span>
                      <span className={selectedFacture.soldeDu > 0 ? 'text-[#F05A22] font-mono font-bold text-base' : 'text-emerald-700 font-mono font-bold text-base'}>
                        {formatFCFA(selectedFacture.soldeDu)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments History ledger */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Historique des acomptes reçus</h3>
                
                {selectedFacture.reglements.length > 0 ? (
                  <div className="border border-stone-200/70 rounded-2xl overflow-hidden divide-y divide-stone-100 bg-white">
                    {selectedFacture.reglements.map((payment, idx) => (
                      <div key={payment.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-stone-50/60 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#FBF8F3] border border-stone-200 flex items-center justify-center text-stone-700">
                            <Smartphone className="h-4 w-4 text-[#F05A22]" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block text-xs">Tranche n°{idx + 1} ({payment.mode === 'mobile_money' ? 'Mobile Money' : payment.mode === 'especes' ? 'Espèces' : payment.mode === 'carte' ? 'Carte' : 'Virement'})</span>
                            <span className="text-[11px] text-stone-400">Versement enregistré le {payment.date.split('-').reverse().join('/')}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className="text-stone-900 font-bold font-mono text-sm">{formatFCFA(payment.montant)}</strong>
                          {payment.reference && <p className="text-[10px] font-mono text-stone-400 mt-0.5">Réf: {payment.reference}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-stone-300 rounded-2xl text-stone-400 bg-[#FBF8F3]">
                    <Coins className="h-6 w-6 mx-auto mb-1 text-stone-300" />
                    <p className="text-xs font-medium">Aucun acompte encaissé sur cette facture.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="card-fox p-12 text-center text-stone-400">
            <FileText className="h-10 w-10 mx-auto mb-3 text-stone-300" />
            <h3 className="text-base font-bold text-stone-900">Aucune facture sélectionnée</h3>
            <p className="text-xs text-stone-500 mt-1">Veuillez sélectionner une facture dans la liste de gauche.</p>
          </div>
        )}
      </div>

      {/* MODAL: NEW PAYMENT VERSEMENT */}
      {isPaymentModalOpen && selectedFacture && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Enregistrer un versement
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Facture : <span className="font-semibold text-stone-900">{selectedFacture.numero}</span> | Solde dû : <span className="font-bold text-[#F05A22]">{formatFCFA(selectedFacture.soldeDu)}</span>
            </p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Montant du versement (FCFA) *</label>
                <input
                  type="number"
                  required
                  max={selectedFacture.soldeDu}
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                />
              </div>

              {/* Payment Channel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Mode de paiement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as ModePaiement)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                >
                  <option value="wave">Wave Sénégal 🌊</option>
                  <option value="orange_money">Orange Money 🟠</option>
                  <option value="especes">Espèces (Cash) 💵</option>
                  <option value="free_money">Free Money 📱</option>
                  <option value="virement">Virement bancaire 🏦</option>
                  <option value="carte">Carte bancaire 💳</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Référence de transaction</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  placeholder="Ex: Tx Wave #8392193"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-fox-primary flex-1 !py-2.5"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: NEW DIRECT INVOICE */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Créer une facture directe 🧾
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Émettez instantanément une facture ou un devis pour une prestation sur-mesure ou un service hors commande.
            </p>

            <form onSubmit={handleCreateDirectInvoice} className="space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Sélectionner un client *</label>
                {clients.length > 0 ? (
                  <select
                    required
                    value={newInvoiceClientId}
                    onChange={(e) => setNewInvoiceClientId(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  >
                    <option value="">-- Choisir un client --</option>
                    {clients.map(cli => (
                      <option key={cli.id} value={cli.id}>
                        {cli.prenom} {cli.nom} ({cli.telephone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    Aucun client enregistré ! Veuillez d'abord en créer un dans l'onglet <strong>Clients</strong>.
                  </div>
                )}
              </div>

              {/* Designation of service */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Libellé / Désignation de la prestation *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceDesignation}
                  onChange={(e) => setNewInvoiceDesignation(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  placeholder="Ex: Confection robe de mariée, tissu fourni"
                />
              </div>

              {/* Montant Total */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Montant total (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newInvoiceAmount || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setNewInvoiceAmount(val);
                  }}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  placeholder="Ex: 150000"
                />
              </div>

              {/* Optional Deposit / Acompte */}
              <div className="p-4 bg-[#FBF8F3] border border-stone-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">💰 Enregistrer un acompte initial ?</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500 block">Montant acompte (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      max={newInvoiceAmount}
                      value={newInvoiceAcompte || ''}
                      onChange={(e) => setNewInvoiceAcompte(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500 block">Mode de règlement</label>
                    <select
                      value={newInvoiceAcompteMode}
                      onChange={(e) => setNewInvoiceAcompteMode(e.target.value as ModePaiement)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    >
                      <option value="wave">Wave Sénégal 🌊</option>
                      <option value="orange_money">Orange Money 🟠</option>
                      <option value="especes">Espèces (Cash) 💵</option>
                      <option value="virement">Virement bancaire 🏦</option>
                      <option value="carte">Carte bancaire 💳</option>
                    </select>
                  </div>
                </div>

                {newInvoiceAcompte > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500 block">Référence de paiement</label>
                    <input
                      type="text"
                      value={newInvoiceAcompteRef}
                      onChange={(e) => setNewInvoiceAcompteRef(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                      placeholder="Ex: Acompte initial en espèces"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={clients.length === 0}
                  className="btn-fox-primary flex-1 !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer facture 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
