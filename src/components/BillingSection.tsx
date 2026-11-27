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
  SlidersHorizontal
} from 'lucide-react';

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
      <div className="bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[750px] overflow-hidden">
        
        <div className="p-5 border-b-2 border-black bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-950" /> Facturation & Devis
            </h3>
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="px-2 py-1 bg-atelier-gold text-slate-950 rounded-none border-2 border-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Directe 🧾
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="RECHERCHER N° DE FACTURE, CLIENT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none py-2.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
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
                className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border-2 border-black cursor-pointer transition ${
                  filterStatut === tab.key 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-slate-950 border-black hover:bg-black hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of bills */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map(facture => {
              const client = clients.find(cl => cl.id === facture.clientId);
              const order = commandes.find(co => co.id === facture.commandeId);

              return (
                <div 
                  key={facture.id}
                  onClick={() => setSelectedFactureId(facture.id)}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition ${
                    selectedFactureId === facture.id ? 'bg-atelier-beige border-l-8 border-black' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-black text-slate-500">
                      {facture.numero}
                    </span>
                    
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-none border border-black ${
                      facture.statut === 'paye' ? 'bg-emerald-500 text-white' :
                      facture.statut === 'partiel' ? 'bg-indigo-600 text-white' :
                      'bg-rose-600 text-white'
                    }`}>
                      {facture.statut === 'paye' ? 'Réglée' :
                       facture.statut === 'partiel' ? 'Acompte' : 'Impayée'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 font-display">
                      {client ? `${client.prenom} ${client.nom}` : 'Client Inconnu'}
                    </h4>
                    <p className="text-[10px] font-serif italic text-slate-500 truncate mt-0.5">
                      {facture.designationDirecte ? `Prestation : ${facture.designationDirecte}` : `Vêtement : ${order ? order.modeleNom : 'Sur-mesure'}`}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-1.5 pt-1.5 border-t border-zinc-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Total : {formatFCFA(facture.montantTotal)}</span>
                    <strong className="text-slate-950 font-mono font-black">
                      Dû: {formatFCFA(facture.soldeDu)}
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 bg-white">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-black uppercase tracking-widest">Aucune facture trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Detailed Receipt and actions */}
      <div className="lg:col-span-2 space-y-6">
        {selectedFacture ? (
          <>
            {/* Visual Header invoice detail card */}
            <div className="bg-white rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-black bg-atelier-gold text-slate-950 px-2.5 py-1 border-2 border-black uppercase">
                      {selectedFacture.numero}
                    </span>
                    <span className="text-xs text-slate-600 font-serif italic">
                      Date : {selectedFacture.dateEmission.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 font-display">
                    Récépissé de Caisse Officiel
                  </h2>
                  {selectedFacture.designationDirecte ? (
                    <p className="text-xs text-slate-700 mt-2 font-black uppercase tracking-wider bg-slate-100 px-3 py-1.5 border border-black inline-block">
                      ⚡ PRESTATION : {selectedFacture.designationDirecte}
                    </p>
                  ) : invoiceOrder ? (
                    <p className="text-xs text-slate-700 mt-2 font-serif italic">
                      Commande : <strong className="font-sans uppercase font-black text-slate-950">{invoiceOrder.modeleNom}</strong> ({invoiceOrder.reference})
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={printReceipt}
                    className="px-4 py-3 bg-white text-slate-950 rounded-none border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Facture A4 / PDF
                  </button>

                  <button 
                    onClick={printThermalTicket}
                    className="px-4 py-3 bg-slate-900 text-white rounded-none border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-amber-500" /> Ticket Caisse 🎫
                  </button>
                  
                  {selectedFacture.statut !== 'paye' && (
                    <button 
                      onClick={() => {
                        setPaymentAmount(selectedFacture.soldeDu);
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-4 py-3 bg-atelier-gold text-slate-950 rounded-none border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" /> Versement
                    </button>
                  )}
                </div>
              </div>

              {/* Invoice details body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Débiteur (Client)</h3>
                  <div className="bg-atelier-beige p-4 rounded-none border-2 border-black space-y-2">
                    <span className="font-black text-slate-950 text-base font-display block uppercase">
                      {invoiceClient ? `${invoiceClient.prenom} ${invoiceClient.nom}` : 'N/A'}
                    </span>
                    <p className="text-xs text-slate-700 font-mono flex items-center gap-1">
                      Téléphone : <span className="font-black text-black">{invoiceClient?.telephone}</span>
                    </p>
                    <p className="text-xs text-slate-700 font-serif italic">
                      Adresse : {invoiceClient?.adresse || 'Dakar'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">État de la Balance</h3>
                  <div className="bg-white p-4 rounded-none border-2 border-black space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Réglé ({Math.round(((selectedFacture.montantTotal - selectedFacture.soldeDu) / selectedFacture.montantTotal) * 100)}%) :</span>
                      <span className="text-slate-950 font-mono font-black">{formatFCFA(selectedFacture.montantTotal - selectedFacture.soldeDu)} / {formatFCFA(selectedFacture.montantTotal)}</span>
                    </div>

                    <div className="h-4 w-full bg-slate-100 rounded-none border border-black overflow-hidden">
                      <div 
                        style={{ width: `${((selectedFacture.montantTotal - selectedFacture.soldeDu) / selectedFacture.montantTotal) * 100}%` }}
                        className="h-full bg-emerald-500"
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-600">Solde Restant Dû :</span>
                      <span className={selectedFacture.soldeDu > 0 ? 'text-rose-600 font-mono font-black text-base' : 'text-emerald-600 font-mono font-black text-base'}>
                        {formatFCFA(selectedFacture.soldeDu)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments History ledger */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Historique des Acomptes Reçus</h3>
                
                {selectedFacture.reglements.length > 0 ? (
                  <div className="border-2 border-black rounded-none overflow-hidden divide-y-2 divide-black">
                    {selectedFacture.reglements.map((payment, idx) => (
                      <div key={payment.id} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-atelier-gold text-slate-950 rounded-none border border-black">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-black text-slate-950 block uppercase tracking-wider text-[10px]">Tranche n°{idx + 1} ({payment.mode === 'mobile_money' ? 'MOBILE MONEY' : payment.mode === 'especes' ? 'ESPÈCES' : payment.mode === 'carte' ? 'CARTE' : 'VIREMENT'})</span>
                            <span className="text-[9px] text-slate-500 font-serif italic">Versement enregistré le {payment.date.split('-').reverse().join('/')}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className="text-slate-950 font-black font-mono text-sm">{formatFCFA(payment.montant)}</strong>
                          {payment.reference && <p className="text-[9px] font-mono text-slate-500 mt-0.5">Réf: {payment.reference}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-black rounded-none text-slate-500 bg-slate-50">
                    <Coins className="h-6 w-6 mx-auto mb-1 opacity-60" />
                    <p className="text-xs font-black uppercase tracking-widest">Aucun acompte encaissé sur cette facture.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-none p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950">Aucune Facture Sélectionnée</h3>
            <p className="text-xs font-serif italic mt-1 text-slate-600">Veuillez sélectionner une facture ou un règlement dans l'annuaire de gauche.</p>
          </div>
        )}
      </div>

      {/* MODAL: NEW PAYMENT VERSEMENT */}
      {isPaymentModalOpen && selectedFacture && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-sm w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-2 font-display">
              Enregistrer un Versement
            </h3>
            <p className="text-xs text-slate-600 mb-5 font-serif italic">
              Facture : <span className="font-black text-slate-950">{selectedFacture.numero}</span> | Solde dû : <span className="font-black text-rose-600">{formatFCFA(selectedFacture.soldeDu)}</span>
            </p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Montant du versement (FCFA) *</label>
                <input
                  type="number"
                  required
                  max={selectedFacture.soldeDu}
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm font-mono font-black text-slate-950 focus:outline-none"
                />
              </div>

              {/* Payment Channel */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Mode de paiement d'encaissement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as ModePaiement)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                >
                  <option value="mobile_money">WAVE / ORANGE MONEY</option>
                  <option value="especes">ESPÈCES CASH</option>
                  <option value="virement">VIREMENT BANCAIRE</option>
                  <option value="carte">CARTE BANCAIRE</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Référence de transaction</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Ex: Tx Wave #8392193"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-md w-full p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 mb-2 font-display">
              Créer une Facture Directe 🧾
            </h3>
            <p className="text-xs text-slate-600 mb-5 font-serif italic">
              Émettez instantanément une facture ou un devis pour une prestation sur-mesure ou un service hors commande.
            </p>

            <form onSubmit={handleCreateDirectInvoice} className="space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Sélectionner un Client *</label>
                {clients.length > 0 ? (
                  <select
                    required
                    value={newInvoiceClientId}
                    onChange={(e) => setNewInvoiceClientId(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
                  >
                    <option value="">-- CHOISIR UN CLIENT --</option>
                    {clients.map(cli => (
                      <option key={cli.id} value={cli.id}>
                        {cli.prenom.toUpperCase()} {cli.nom.toUpperCase()} ({cli.telephone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-500 text-[11px] text-red-700 font-serif">
                    Aucun client enregistré ! Veuillez d'abord en créer un dans l'onglet <strong>Clients</strong>.
                  </div>
                )}
              </div>

              {/* Designation of service */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Libellé / Désignation de la prestation *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceDesignation}
                  onChange={(e) => setNewInvoiceDesignation(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-black focus:outline-none"
                  placeholder="Ex: Confection Robe de Mariée, Tissu fourni"
                />
              </div>

              {/* Montant Total */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Montant Total de la Prestation (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newInvoiceAmount || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setNewInvoiceAmount(val);
                  }}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm font-mono font-black text-slate-950 focus:outline-none"
                  placeholder="Ex: 150000"
                />
              </div>

              {/* Optional Deposit / Acompte */}
              <div className="p-3 bg-atelier-beige border border-black space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-950">💰 Enregistrer un acompte initial ?</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block">Montant Acompte (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      max={newInvoiceAmount}
                      value={newInvoiceAcompte || ''}
                      onChange={(e) => setNewInvoiceAcompte(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-black rounded-none px-2 py-1.5 text-xs font-mono font-black focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block">Mode de Règlement</label>
                    <select
                      value={newInvoiceAcompteMode}
                      onChange={(e) => setNewInvoiceAcompteMode(e.target.value as ModePaiement)}
                      className="w-full bg-white border border-black rounded-none px-1 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                    >
                      <option value="especes">ESPÈCES CASH</option>
                      <option value="mobile_money">WAVE / OM</option>
                      <option value="virement">VIREMENT</option>
                      <option value="carte">CARTE BANCAIRE</option>
                    </select>
                  </div>
                </div>

                {newInvoiceAcompte > 0 && (
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block">Référence de paiement</label>
                    <input
                      type="text"
                      value={newInvoiceAcompteRef}
                      onChange={(e) => setNewInvoiceAcompteRef(e.target.value)}
                      className="w-full bg-white border border-black rounded-none px-2 py-1 text-xs focus:outline-none"
                      placeholder="Ex: Acompte initial en espèces"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={clients.length === 0}
                  className="flex-1 py-2.5 rounded-none bg-black text-white border-2 border-black hover:bg-atelier-gold hover:text-black font-black uppercase tracking-widest text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer Facture 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
