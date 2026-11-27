/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Client, FicheMesure, TypeVetement } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Plus, 
  Printer, 
  Edit, 
  Trash2, 
  History, 
  Sparkles, 
  Check, 
  Ruler, 
  BookOpen, 
  Tag, 
  UserCheck, 
  TrendingUp, 
  ChevronRight,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { buildWhatsAppLink, WhatsAppTemplates } from '../lib/whatsapp';

export default function ClientSection() {
  const { 
    clients, 
    ficheMesures, 
    commandes, 
    addClient, 
    updateClient, 
    deleteClient, 
    addFicheMesure, 
    updateFicheMesure, 
    deleteFicheMesure,
    settings
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'detail'>('list');
  
  // Modals / Form states
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Client Form inputs
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [stylesFavoris, setStylesFavoris] = useState<string[]>([]);
  const [newStyleInput, setNewStyleInput] = useState('');
  const [tissusPreferes, setTissusPreferes] = useState<string[]>([]);
  const [newTissuInput, setNewTissuInput] = useState('');
  const [remarquesParticulieres, setRemarquesParticulieres] = useState('');

  // Measure Form states
  const [isMeasureFormOpen, setIsMeasureFormOpen] = useState(false);
  const [measureType, setMeasureType] = useState<TypeVetement>('costume_homme');
  const [measureNotes, setMeasureNotes] = useState('');
  const [measurements, setMeasurements] = useState<{ [key: string]: number }>({});
  const [editingMeasure, setEditingMeasure] = useState<FicheMesure | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientMeasures = ficheMesures.filter(m => m.clientId === selectedClientId);
  const clientOrders = commandes.filter(o => o.clientId === selectedClientId);

  // AI Sizing Advice States
  const [aiAdvice, setAiAdvice] = useState<{ [measureId: string]: string }>({});
  const [loadingAdvice, setLoadingAdvice] = useState<{ [measureId: string]: boolean }>({});

  const handleFetchAiSizingAdvice = async (measure: FicheMesure) => {
    if (!selectedClient) return;
    setLoadingAdvice(prev => ({ ...prev, [measure.id]: true }));
    try {
      const response = await fetch('/api/conseil-tailleur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: `${selectedClient.prenom} ${selectedClient.nom}`,
          clientPreferences: selectedClient.preferences,
          typeVetement: measure.typeVetement,
          mensurations: measure.mensurations,
          notes: measure.notes,
        }),
      });
      if (!response.ok) {
        throw new Error('Erreur de communication avec le serveur de coupe IA.');
      }
      const data = await response.json();
      setAiAdvice(prev => ({ ...prev, [measure.id]: data.advice }));
    } catch (error: any) {
      console.error(error);
      setAiAdvice(prev => ({ ...prev, [measure.id]: "Erreur : Impossible d'obtenir des conseils de coupe pour le moment. Veuillez vérifier la clé d'API ou réessayer." }));
    } finally {
      setLoadingAdvice(prev => ({ ...prev, [measure.id]: false }));
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

  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.nom.toLowerCase().includes(term) ||
      c.prenom.toLowerCase().includes(term) ||
      c.telephone.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  const openNewClientModal = () => {
    setEditingClient(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setEmail('');
    setAdresse('');
    setStylesFavoris([]);
    setTissusPreferes([]);
    setRemarquesParticulieres('');
    setIsClientFormOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setNom(client.nom);
    setPrenom(client.prenom);
    setTelephone(client.telephone);
    setEmail(client.email);
    setAdresse(client.adresse);
    setStylesFavoris(client.preferences.stylesFavoris);
    setTissusPreferes(client.preferences.tissusPreferes);
    setRemarquesParticulieres(client.preferences.remarquesParticulieres);
    setIsClientFormOpen(true);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom || !telephone) {
      alert('Veuillez remplir le nom, prénom et téléphone.');
      return;
    }

    const payload = {
      nom,
      prenom,
      telephone,
      email,
      adresse,
      preferences: {
        stylesFavoris,
        tissusPreferes,
        remarquesParticulieres
      }
    };

    if (editingClient) {
      updateClient({
        ...editingClient,
        ...payload
      });
    } else {
      const added = addClient(payload);
      setSelectedClientId(added.id);
    }
    setIsClientFormOpen(false);
  };

  // Measures Form Utilities
  const defaultMeasurementKeys: { [key in TypeVetement]: { key: string; label: string }[] } = {
    grand_boubou_homme: [
      { key: 'encolure', label: 'Tour de cou / Encolure (cm)' },
      { key: 'carrure', label: 'Carrure Épaule à Épaule (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'longueurBoubou', label: 'Longueur Grand Boubou (cm)' },
      { key: 'longueurKaftan', label: 'Longueur Kaftan intérieur (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'tourPoignet', label: 'Tour de poignet (cm)' },
      { key: 'longueurPantalon', label: 'Longueur Pantalon / Thiaya (cm)' },
      { key: 'cuisse', label: 'Tour de cuisse (cm)' },
      { key: 'basPantalon', label: 'Bas de pantalon (cm)' }
    ],
    kaftan_homme: [
      { key: 'encolure', label: 'Tour de cou col officier (cm)' },
      { key: 'carrure', label: 'Carrure Épaule (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'longueurKaftan', label: 'Longueur Kaftan (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'longueurPantalon', label: 'Longueur Pantalon (cm)' },
      { key: 'basPantalon', label: 'Bas de pantalon (cm)' }
    ],
    taille_basse: [
      { key: 'epaule', label: 'Carrure Épaule (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'hauteurPoitrine', label: 'Hauteur de poitrine (cm)' },
      { key: 'sousPoitrine', label: 'Tour sous-poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'longueurTailleBasse', label: 'Longueur haut Taille Basse (cm)' },
      { key: 'bassin', label: 'Tour de bassin / Hanches (cm)' },
      { key: 'longueurJupe', label: 'Longueur de Jupe (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' }
    ],
    boubou_femme: [
      { key: 'longueurBoubou', label: 'Longueur Grand Boubou (cm)' },
      { key: 'encolure', label: 'Encolure brodée (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'longueurRobeInterieure', label: 'Longueur Robe intérieure (cm)' },
      { key: 'manche', label: 'Longueur manche (cm)' }
    ],
    ndokette: [
      { key: 'carrure', label: 'Carrure Épaule (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'longueurNdokette', label: 'Longueur totale Ndokette (cm)' },
      { key: 'manche', label: 'Longueur manche ample (cm)' }
    ],
    mariniere: [
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'longueurMariniere', label: 'Longueur Marinière (cm)' },
      { key: 'manche', label: 'Longueur manche (cm)' }
    ],
    robe_senegalaise: [
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'hauteurPoitrine', label: 'Hauteur poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'bassin', label: 'Tour de bassin (cm)' },
      { key: 'longueurRobe', label: 'Longueur totale robe (cm)' },
      { key: 'manche', label: 'Longueur manche (cm)' }
    ],
    kaftan_femme: [
      { key: 'carrure', label: 'Carrure (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'bassin', label: 'Tour de bassin (cm)' },
      { key: 'longueurKaftan', label: 'Longueur Kaftan (cm)' },
      { key: 'manche', label: 'Longueur manche (cm)' }
    ],
    costume_homme: [
      { key: 'encolure', label: 'Tour de cou / Encolure (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille / Carrure (cm)' },
      { key: 'bassin', label: 'Tour de bassin (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'longueurVeste', label: 'Longueur de veste (cm)' },
      { key: 'longueurPantalon', label: 'Longueur de pantalon (cm)' },
      { key: 'cuisse', label: 'Tour de cuisse (cm)' },
      { key: 'genou', label: 'Tour de genou (cm)' },
      { key: 'basPantalon', label: 'Bas de pantalon (cm)' }
    ],
    robe_femme: [
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'bassin', label: 'Tour de bassin (cm)' },
      { key: 'epauleAepaule', label: 'Carrure épaule à épaule (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'longueurRobe', label: 'Longueur totale robe (cm)' },
      { key: 'hauteurPoitrine', label: 'Hauteur poitrine (cm)' }
    ],
    tailleur_femme: [
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'bassin', label: 'Tour de bassin (cm)' },
      { key: 'epauleAepaule', label: 'Carrure épaule à épaule (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'longueurVeste', label: 'Longueur veste (cm)' },
      { key: 'longueurJupe', label: 'Longueur jupe / pantalon (cm)' }
    ],
    chemise_homme: [
      { key: 'encolure', label: 'Tour de cou / Encolure (cm)' },
      { key: 'poitrine', label: 'Tour de poitrine (cm)' },
      { key: 'taille', label: 'Tour de taille (cm)' },
      { key: 'manche', label: 'Longueur de manche (cm)' },
      { key: 'longueurDos', label: 'Longueur dos chemise (cm)' }
    ],
    autre: [
      { key: 'longueurTotale', label: 'Longueur totale (cm)' },
      { key: 'tourPoitrine', label: 'Tour de poitrine (cm)' },
      { key: 'remarques', label: 'Notes générales de coupe' }
    ]
  };

  // Find any custom measurement keys added in settings
  const customSettingsKeys = Object.keys(settings?.champsMesuresActifs || {}).filter(
    k => k !== 'poitrine' && k !== 'taille' && k !== 'hanches' && k !== 'longueur_pantalon' && k !== 'longueur_robe' && k !== 'manches' && k !== 'epaule' && k !== 'encolure' && k !== 'tour_bras' && k !== 'tour_cuisse'
  );

  const isFieldActive = (key: string): boolean => {
    if (!settings?.champsMesuresActifs) return true;
    
    const mapping: { [key: string]: string } = {
      poitrine: 'poitrine',
      tourPoitrine: 'poitrine',
      hauteurPoitrine: 'poitrine',
      taille: 'taille',
      bassin: 'hanches',
      manche: 'manches',
      longueurPantalon: 'longueur_pantalon',
      longueur_pantalon: 'longueur_pantalon',
      longueurRobe: 'longueur_robe',
      longueur_robe: 'longueur_robe',
      epauleAepaule: 'epaule',
      epaule: 'epaule',
      encolure: 'encolure',
      cuisse: 'tour_cuisse',
      tour_cuisse: 'tour_cuisse',
      tour_bras: 'tour_bras',
    };
    
    const settingsKey = mapping[key];
    if (settingsKey && settings.champsMesuresActifs[settingsKey] !== undefined) {
      return settings.champsMesuresActifs[settingsKey];
    }
    if (settings.champsMesuresActifs[key] !== undefined) {
      return settings.champsMesuresActifs[key];
    }
    return true;
  };

  const activeMeasurementKeys = Object.keys(defaultMeasurementKeys).reduce((acc, key) => {
    const type = key as TypeVetement;
    let filtered = defaultMeasurementKeys[type].filter(item => isFieldActive(item.key));
    
    customSettingsKeys.forEach(customKey => {
      if (settings?.champsMesuresActifs[customKey]) {
        if (!filtered.some(f => f.key === customKey)) {
          const labelFormatted = customKey.replace(/_/g, ' ');
          filtered.push({ key: customKey, label: `${labelFormatted} (cm)` });
        }
      }
    });
    
    acc[type] = filtered;
    return acc;
  }, {} as { [key in TypeVetement]: { key: string; label: string }[] });

  const openNewMeasureModal = () => {
    if (!selectedClientId) return;
    setEditingMeasure(null);
    setMeasureType('costume_homme');
    setMeasureNotes('');
    
    // Seed initial measurement values with zeros or standard sizes
    const initialVals: { [key: string]: number } = {};
    activeMeasurementKeys.costume_homme.forEach(m => {
      initialVals[m.key] = 0;
    });
    setMeasurements(initialVals);
    setIsMeasureFormOpen(true);
  };

  const openEditMeasureModal = (measure: FicheMesure) => {
    setEditingMeasure(measure);
    setMeasureType(measure.typeVetement);
    setMeasureNotes(measure.notes || '');
    setMeasurements(measure.mensurations);
    setIsMeasureFormOpen(true);
  };

  const handleMeasureTypeChange = (type: TypeVetement) => {
    setMeasureType(type);
    const initialVals: { [key: string]: number } = {};
    activeMeasurementKeys[type].forEach(m => {
      // Maintain overlapping fields if possible
      initialVals[m.key] = measurements[m.key] || 0;
    });
    setMeasurements(initialVals);
  };

  const handleMeasureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const payload = {
      clientId: selectedClientId,
      typeVetement: measureType,
      mensurations: measurements,
      notes: measureNotes
    };

    if (editingMeasure) {
      updateFicheMesure({
        ...editingMeasure,
        ...payload
      });
    } else {
      addFicheMesure(payload);
    }
    setIsMeasureFormOpen(false);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ? Toutes ses mesures et rendez-vous associés seront retirés.')) {
      deleteClient(id);
      setSelectedClientId(clients.find(c => c.id !== id)?.id || null);
    }
  };

  const printClientMeasurements = () => {
    const printContent = document.getElementById('printable-client-card');
    if (!printContent) return;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open(windowUrl, uniqueName, 'left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer la fiche.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Fiche de Mesures - FOX COUTURE</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; margin: 40px; line-height: 1.6; background: #FFF; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #FF7A1A; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-container { display: flex; align-items: center; }
            .brand { font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #1A1A1A; }
            .subtitle { font-size: 10px; text-transform: uppercase; color: #E85D04; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
            h2 { color: #E85D04; font-size: 1.1em; border-bottom: 1px solid #FFE4D0; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { font-size: 13px; color: #343A40; }
            .info-item strong { color: #1A1A1A; }
            .measure-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .measure-table th, .measure-table td { border: 1px solid #FFE4D0; padding: 10px; text-align: left; font-size: 13px; }
            .measure-table th { background-color: #FFF3EA; font-weight: bold; color: #E85D04; text-transform: uppercase; font-size: 11px; }
            .notes-box { background-color: #FFF9F5; border-left: 4px solid #FF7A1A; padding: 15px; margin-top: 20px; font-style: italic; font-size: 13px; border-radius: 4px; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header-container">
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
                <div class="brand">FOX COUTURE</div>
                <div class="subtitle">HAUTE COUTURE ET FICHE DE MESURES</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #343A40; font-weight: bold;">
              FOXFY SERVICES OS
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item"><strong>Client :</strong> ${selectedClient?.prenom} ${selectedClient?.nom}</div>
            <div class="info-item"><strong>Téléphone :</strong> ${selectedClient?.telephone}</div>
            <div class="info-item"><strong>Email :</strong> ${selectedClient?.email || 'N/A'}</div>
            <div class="info-item"><strong>Adresse :</strong> ${selectedClient?.adresse || 'N/A'}</div>
          </div>
          
          <h2>Remarques & Préférences Client</h2>
          <p class="info-item"><strong>Styles Favoris :</strong> ${selectedClient?.preferences.stylesFavoris.join(', ') || 'Aucun style favori spécifié.'}</p>
          <p class="info-item"><strong>Tissus Favoris :</strong> ${selectedClient?.preferences.tissusPreferes.join(', ') || 'Aucun tissu favori spécifié.'}</p>
          <div class="notes-box"><strong>Commentaires & Consignes d'Atelier :</strong> ${selectedClient?.preferences.remarquesParticulieres || 'Aucune consigne particulière.'}</div>

          <h2>Détail des Mensurations</h2>
          ${clientMeasures.map(m => `
            <div style="margin-bottom: 30px;">
              <h3 style="text-transform: uppercase; color: #E85D04; font-size: 1.1em; border-bottom: 1px dashed #FF7A1A; padding-bottom: 5px; font-weight: bold;">
                ${m.typeVetement.replace('_', ' ')} (Prise le ${m.datePrise ? m.datePrise.split('-').reverse().join('/') : 'N/A'})
              </h3>
              <table class="measure-table">
                <thead>
                  <tr>
                    <th>Mesure Anatonomique</th>
                    <th>Valeur (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(m.mensurations).map(([key, val]) => `
                    <tr>
                      <td style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}</td>
                      <td><strong>${val} cm</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${m.notes ? `<p style="font-size: 0.9em; color:#343A40; margin-top: 10px;"><em>Consigne de coupe : ${m.notes}</em></p>` : ''}
            </div>
          `).join('')}
          
          <div class="footer">Document d'Atelier Confidentiel — Maison Fox Couture © ${new Date().getFullYear()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printSingleMeasurementSheet = (measure: FicheMesure) => {
    if (!selectedClient) return;

    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open('about:blank', uniqueName, 'left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer.');
      return;
    }

    const measuresHtml = Object.entries(measure.mensurations)
      .filter(([key]) => isFieldActive(key))
      .map(([key, value]) => `
        <div style="border: 1px solid #FFE4D0; padding: 12px 15px; background: #FFF; text-align: center;">
          <span style="font-size: 11px; text-transform: uppercase; color: #777; display: block;">
            ${(() => {
              for (const type of Object.keys(defaultMeasurementKeys)) {
                const found = defaultMeasurementKeys[type as TypeVetement].find(item => item.key === key);
                if (found) return found.label.replace(' (cm)', '');
              }
              return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
            })()}
          </span>
          <strong style="font-size: 16px; color: #1A1A1A; display: block; margin-top: 4px;">${value} cm</strong>
        </div>
      `).join('');

    const formattedAdvice = aiAdvice[measure.id]
      ? aiAdvice[measure.id]
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
      : '<p style="font-size: 11px; color: #999; font-style: italic;">Aucune analyse morphologique ou conseil de coupe n\'a été généré pour cette fiche.</p>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Fiche de Mesure - ${selectedClient.prenom} ${selectedClient.nom}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A1A; margin: 40px; line-height: 1.6; background: #FFF; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #FF7A1A; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-container { display: flex; align-items: center; }
            .brand { font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #1A1A1A; }
            .subtitle { font-size: 10px; text-transform: uppercase; color: #E85D04; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
            h2 { color: #E85D04; font-size: 1.1em; border-bottom: 1px solid #FFE4D0; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { font-size: 13px; color: #343A40; }
            .info-item strong { color: #1A1A1A; }
            .meas-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 12px; margin-top: 15px; }
            .notes-box { background-color: #FFF9F5; border-left: 4px solid #FF7A1A; padding: 15px; margin-top: 20px; font-style: italic; font-size: 13px; border-radius: 4px; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header-container">
            <div class="brand-container">
              <div style="display: inline-block; vertical-align: middle;">
                <div class="brand">FOX COUTURE</div>
                <div class="subtitle">FICHE DE MESURE INDIVIDUELLE</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #343A40; font-weight: bold; text-transform: uppercase;">
              Catégorie : ${measure.typeVetement.replace('_', ' ')}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item"><strong>Client :</strong> ${selectedClient.prenom.toUpperCase()} ${selectedClient.nom.toUpperCase()}</div>
            <div class="info-item"><strong>Téléphone :</strong> ${selectedClient.telephone}</div>
            <div class="info-item"><strong>Email :</strong> ${selectedClient.email || 'N/A'}</div>
            <div class="info-item"><strong>Date de prise :</strong> ${measure.datePrise ? measure.datePrise.split('-').reverse().join('/') : 'N/A'}</div>
          </div>
          
          <h2>Détail des Mensurations (${measure.typeVetement.replace('_', ' ').toUpperCase()})</h2>
          <div class="meas-grid">
            ${measuresHtml}
          </div>

          ${measure.notes ? `
            <h2>Notes & Consignes de coupe</h2>
            <div class="notes-box">${measure.notes}</div>
          ` : ''}

          <h2>Analyse de Coupe & Stylisme IA</h2>
          <div style="background: #FFFDF9; border: 1px solid #FDF3E7; padding: 15px; border-radius: 4px; margin-top: 15px;">
            ${formattedAdvice}
          </div>
          
          <div class="footer">Document d'Atelier Confidentiel — Maison Fox Couture © ${new Date().getFullYear()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };


  return (
    <div className="space-y-6">
      {/* Mobile view tabs selector */}
      <div className="flex lg:hidden border-2 border-black bg-white p-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={() => setActiveMobileView('list')}
          className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-widest rounded-none transition cursor-pointer ${
            activeMobileView === 'list' ? 'bg-black text-white' : 'bg-transparent text-slate-700 hover:bg-slate-100'
          }`}
        >
          Annuaire ({filteredClients.length})
        </button>
        <button
          onClick={() => setActiveMobileView('detail')}
          className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-widest rounded-none transition cursor-pointer ${
            activeMobileView === 'detail' ? 'bg-black text-white' : 'bg-transparent text-slate-700 hover:bg-slate-100'
          }`}
        >
          Fiche Client {selectedClient ? `(${selectedClient.prenom})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Client Directory List */}
        <div className={`lg:col-span-1 bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[750px] ${
          activeMobileView === 'list' ? 'flex' : 'hidden lg:flex'
        }`}>
        {/* Header Search & Actions */}
        <div className="p-5 border-b-2 border-black space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 font-display flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-slate-950" /> Annuaire Clients
            </h3>
            <button 
              onClick={openNewClientModal}
              className="p-2 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white transition flex items-center justify-center cursor-pointer"
              title="Ajouter un client"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="RECHERCHER NOM, TÉLÉPHONE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-slate-50"
            />
          </div>
        </div>

        {/* Directory List Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveMobileView('detail');
                }}
                className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition ${
                  selectedClientId === client.id ? 'bg-atelier-beige border-l-8 border-black' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-none border border-black flex items-center justify-center font-black font-display text-xs ${client.avatarColor}`}>
                    {client.prenom[0]}{client.nom[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-950">
                      {client.prenom} {client.nom}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{client.telephone}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-950 transition-transform ${selectedClientId === client.id ? 'translate-x-1' : ''}`} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <User className="h-10 w-10 mx-auto mb-2 opacity-55" />
              <p className="text-xs font-black uppercase tracking-widest">Aucun client trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Detailed Client Information */}
      <div className={`lg:col-span-2 space-y-8 ${
        activeMobileView === 'detail' ? 'block' : 'hidden lg:block'
      }`}>
        {selectedClient ? (
          <>
            {/* Back Button on Mobile */}
            <div className="block lg:hidden">
              <button
                onClick={() => setActiveMobileView('list')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                ← Retour à l'annuaire des clients
              </button>
            </div>
            {/* Client Profile Header Card */}
            <div className="bg-white rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-none border-2 border-black flex items-center justify-center text-xl font-black font-display ${selectedClient.avatarColor}`}>
                    {selectedClient.prenom[0]}{selectedClient.nom[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 font-display">
                      {selectedClient.prenom} {selectedClient.nom}
                    </h2>
                    <p className="text-xs text-slate-500 font-serif italic mt-1">
                      Client depuis le {selectedClient.dateCreation ? selectedClient.dateCreation.split('-').reverse().join('/') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Actions buttons */}
                <div className="flex gap-2">
                  <a
                    href={buildWhatsAppLink(selectedClient.telephone, `Bonjour ${selectedClient.prenom}, nous vous contactons depuis votre atelier ${settings.raisonSociale}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-none border-2 border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5 font-bold text-xs"
                    title="Contacter sur WhatsApp"
                  >
                    <MessageCircle className="h-4.5 w-4.5 text-emerald-600 group-hover:text-white" />
                    <span className="hidden sm:inline font-sans">WhatsApp</span>
                  </a>
                  <button 
                    onClick={() => openEditClientModal(selectedClient)}
                    className="p-2.5 rounded-none border-2 border-black text-slate-950 bg-white hover:bg-black hover:text-white transition cursor-pointer"
                    title="Modifier le profil"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={printClientMeasurements}
                    className="p-2.5 rounded-none border-2 border-black text-slate-950 bg-white hover:bg-black hover:text-white transition cursor-pointer"
                    title="Imprimer la fiche complète"
                  >
                    <Printer className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="p-2.5 rounded-none border-2 border-rose-600 text-rose-600 bg-white hover:bg-rose-600 hover:text-white transition cursor-pointer"
                    title="Supprimer le client"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Direct Info list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-none border border-black bg-atelier-beige text-slate-950">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Téléphone</span>
                    <a href={`tel:${selectedClient.telephone}`} className="font-black text-slate-950 font-mono hover:underline">
                      {selectedClient.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-none border border-black bg-atelier-beige text-slate-950">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Adresse Email</span>
                    <span className="font-black text-slate-950 truncate block">
                      {selectedClient.email || 'Non spécifié'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-none border border-black bg-atelier-beige text-slate-950">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Adresse domicile</span>
                    <span className="font-black text-slate-950 truncate block">
                      {selectedClient.adresse || 'Non spécifiée'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Segment 2: Custom Preferences */}
            <div className="bg-white rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 border-b-2 border-black pb-3 font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-atelier-gold" /> Préférences & Remarques d'Atelier
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Preferences lists */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Styles Favoris</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.preferences.stylesFavoris.length > 0 ? (
                        selectedClient.preferences.stylesFavoris.map((style, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white px-3 py-1.5 rounded-none border border-black">
                            <Tag className="h-3 w-3 text-atelier-gold" /> {style}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-serif italic">Aucun style fétiche défini</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Tissus Préférés</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.preferences.tissusPreferes.length > 0 ? (
                        selectedClient.preferences.tissusPreferes.map((tis, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-atelier-gold text-slate-950 px-3 py-1.5 rounded-none border-2 border-black">
                            <BookOpen className="h-3 w-3 text-black" /> {tis}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-serif italic">Aucune préférence de tissu spécifiée</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Atelier Notes */}
                <div className="p-4 rounded-none bg-atelier-beige border-2 border-black">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 block mb-2">
                    Consignes d'atelier particulières (Mesures & Coupe)
                  </span>
                  <p className="text-sm text-slate-900 leading-relaxed font-serif italic">
                    {selectedClient.preferences.remarquesParticulieres ? (
                      `"${selectedClient.preferences.remarquesParticulieres}"`
                    ) : (
                      "Aucune consigne d'ajustement ou préférence morphologique enregistrée pour ce client."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Segment 3: Measurements Card */}
            <div className="bg-white rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 font-display flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-slate-950" /> Mensurations corporelles
                </h3>
                <button 
                  onClick={openNewMeasureModal}
                  className="px-4 py-3 bg-slate-950 text-white rounded-none border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Nouvelle Fiche
                </button>
              </div>

              {clientMeasures.length > 0 ? (
                <div className="space-y-6">
                  {clientMeasures.map(measure => (
                    <div key={measure.id} className="p-5 rounded-none border-2 border-black bg-atelier-beige space-y-4">
                      {/* Sub card title */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black tracking-wider text-slate-950 bg-atelier-gold px-2.5 py-1 border-2 border-black uppercase">
                          {measure.typeVetement.replace('_', ' ')}
                        </span>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-slate-600 font-mono uppercase font-black tracking-wider">
                            Saisie le {measure.datePrise ? measure.datePrise.split('-').reverse().join('/') : 'N/A'}
                          </span>
                          
                          <div className="flex gap-1.5">
                            <a 
                              href={buildWhatsAppLink(
                                selectedClient.telephone,
                                WhatsAppTemplates.ficheMesures({
                                  clientNom: `${selectedClient.prenom} ${selectedClient.nom}`,
                                  typeVetement: measure.typeVetement.replace(/_/g, ' ').toUpperCase(),
                                  mensurations: measure.mensurations,
                                  atelierNom: settings.raisonSociale
                                })
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition border border-emerald-600 rounded-none cursor-pointer flex items-center justify-center"
                              title="Partager cette fiche de mesures par WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>

                            <button 
                              onClick={() => printSingleMeasurementSheet(measure)}
                              className="p-1.5 text-slate-950 hover:bg-black hover:text-white transition border border-black rounded-none cursor-pointer flex items-center justify-center"
                              title="Imprimer cette fiche de mesures"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            <button 
                              onClick={() => openEditMeasureModal(measure)}
                              className="p-1.5 text-slate-950 hover:bg-black hover:text-white transition border border-black rounded-none cursor-pointer"
                              title="Modifier la fiche"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Supprimer cette fiche de mesures ?')) deleteFicheMesure(measure.id);
                              }}
                              className="p-1.5 text-rose-600 border border-rose-600 hover:bg-rose-600 hover:text-white transition rounded-none cursor-pointer"
                              title="Supprimer la fiche"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Measures values Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(measure.mensurations)
                          .filter(([key]) => isFieldActive(key))
                          .map(([key, value]) => (
                            <div key={key} className="bg-white p-3 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block truncate" title={key}>
                                {(() => {
                                  for (const type of Object.keys(defaultMeasurementKeys)) {
                                    const found = defaultMeasurementKeys[type as TypeVetement].find(item => item.key === key);
                                    if (found) return found.label.replace(' (cm)', '');
                                  }
                                  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                                })()}
                              </span>
                              <span className="text-sm font-black text-slate-950 font-mono mt-1 block">
                                {value} cm
                              </span>
                            </div>
                          ))}
                      </div>

                      {measure.notes && (
                        <p className="text-xs font-serif italic text-slate-800 bg-white p-3 rounded-none border-2 border-black mt-2 leading-relaxed">
                          <strong>Note de coupe :</strong> "{measure.notes}"
                        </p>
                      )}

                      {/* AI Tailoring Advice Section */}
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-black/20">
                        {aiAdvice[measure.id] ? (
                          <div className="bg-slate-50 p-4 rounded-none border-2 border-black space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-atelier-gold/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="flex justify-between items-center border-b-2 border-black pb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-atelier-gold-dark animate-pulse" /> Analyse de Coupe & Style IA (FOX COUTURE)
                              </span>
                              <button
                                onClick={() => handleFetchAiSizingAdvice(measure)}
                                disabled={loadingAdvice[measure.id]}
                                className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-black hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {loadingAdvice[measure.id] ? 'Analyse...' : 'Réanalyser'}
                              </button>
                            </div>
                            
                            {renderFormattedAdvice(aiAdvice[measure.id])}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-atelier-beige/40 p-4 rounded-none border-2 border-dashed border-black">
                            <div className="space-y-0.5">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-atelier-gold-dark" /> Assistant de Coupe & Stylisme IA
                              </span>
                              <p className="text-[11px] text-slate-600 font-serif italic">
                                Obtenez une analyse morphologique, des conseils d'ajustements d'atelier et des suggestions de tissus par Gemini.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFetchAiSizingAdvice(measure)}
                              disabled={loadingAdvice[measure.id]}
                              className="w-full sm:w-auto px-3.5 py-2 bg-black text-white hover:bg-atelier-gold hover:text-black border-2 border-black rounded-none text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                            >
                              {loadingAdvice[measure.id] ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  ANALYSE...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" /> GÉNÉRER ANALYSE IA
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-none border-2 border-black border-dashed text-slate-500">
                  <Ruler className="h-8 w-8 mx-auto mb-2 opacity-55" />
                  <p className="text-xs font-black uppercase tracking-widest">Aucune mensuration enregistrée</p>
                  <p className="text-xs text-slate-500 font-serif italic mt-1">Créez une fiche pour commencer la fabrication sur-mesure.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-none p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center text-slate-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-55" />
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950">Aucun Client Sélectionné</h3>
            <p className="text-xs font-serif italic mt-1 text-slate-600">Veuillez sélectionner un client dans l'annuaire ou en créer un nouveau.</p>
            <button 
              onClick={openNewClientModal}
              className="mt-4 px-4 py-3 bg-atelier-gold text-slate-950 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition cursor-pointer"
            >
              Ajouter mon premier client
            </button>
          </div>
        )}
      </div>

      {/* MODAL: CLIENT FORM (CREATE / EDIT) */}
      {isClientFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 mb-6 font-display">
              {editingClient ? 'Modifier le Client' : 'Enregistrer un Nouveau Client'}
            </h3>
            
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Prénom *</label>
                  <input 
                    type="text" 
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:bg-slate-50"
                    placeholder="Mamadou"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Nom de famille *</label>
                  <input 
                    type="text" 
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:bg-slate-50"
                    placeholder="Diop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Téléphone *</label>
                  <input 
                    type="text" 
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:bg-slate-50"
                    placeholder="+221 77 654 32 10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Adresse Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none focus:bg-slate-50"
                    placeholder="m.diop@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Adresse Postale / Quartier</label>
                <input 
                  type="text" 
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none focus:bg-slate-50"
                  placeholder="Fann Résidence, Villa 42, Dakar"
                />
              </div>

              <hr className="border-black my-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 border-b-2 border-black pb-1 mb-2">Préférences Clients</h4>

              {/* Styles preference helper */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Styles favoris de vêtements</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newStyleInput}
                    onChange={(e) => setNewStyleInput(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="Ex: Costume croisé, Boubou brodé"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if(newStyleInput.trim()) {
                        setStylesFavoris([...stylesFavoris, newStyleInput.trim()]);
                        setNewStyleInput('');
                      }
                    }}
                    className="px-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-none border-2 border-black hover:bg-white hover:text-black cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {stylesFavoris.map((st, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-zinc-950 text-white px-2.5 py-1 rounded-none border border-black">
                      {st}
                      <button 
                        type="button" 
                        onClick={() => setStylesFavoris(stylesFavoris.filter((_, i) => i !== idx))}
                        className="text-atelier-gold hover:text-white font-bold ml-1.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fabrics preference helper */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Matières / Tissus de choix</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTissuInput}
                    onChange={(e) => setNewTissuInput(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="Ex: Soie, Bazin Riche"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if(newTissuInput.trim()) {
                        setTissusPreferes([...tissusPreferes, newTissuInput.trim()]);
                        setNewTissuInput('');
                      }
                    }}
                    className="px-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-none border-2 border-black hover:bg-white hover:text-black cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tissusPreferes.map((tis, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-atelier-gold text-slate-950 px-2.5 py-1 rounded-none border border-black">
                      {tis}
                      <button 
                        type="button" 
                        onClick={() => setTissusPreferes(tissusPreferes.filter((_, i) => i !== idx))}
                        className="text-black hover:text-rose-600 font-bold ml-1.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Remarques ou Contraintes d'atelier</label>
                <textarea 
                  value={remarquesParticulieres}
                  onChange={(e) => setRemarquesParticulieres(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none focus:bg-slate-50 h-20"
                  placeholder="Épaule droite plus basse de 1cm, attention aux manches..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button 
                  type="button" 
                  onClick={() => setIsClientFormOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
                >
                  {editingClient ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MEASUREMENT FORM */}
      {isMeasureFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 mb-2 font-display">
              {editingMeasure ? 'Modifier la Fiche de Mesures' : 'Saisir de Nouvelles Mesures'}
            </h3>
            <p className="text-xs text-slate-600 mb-6 font-serif italic">Client : <span className="font-black text-slate-950">{selectedClient?.prenom} {selectedClient?.nom}</span></p>
            
            <form onSubmit={handleMeasureSubmit} className="space-y-5">
              {/* Garment type selectors */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Gabarit / Type de vêtement</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['costume_homme', 'robe_femme', 'tailleur_femme', 'chemise_homme', 'autre'] as TypeVetement[]).map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => handleMeasureTypeChange(type)}
                      className={`py-2 px-1 text-center rounded-none text-[10px] font-black uppercase tracking-wider border-2 transition capitalize cursor-pointer ${
                        measureType === type 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white border-black text-slate-700 hover:bg-zinc-100'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Measurement Form Inputs Grid */}
              <div className="bg-atelier-beige rounded-none p-4 border-2 border-black">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 border-b-2 border-black pb-1 block mb-4">
                  Saisie des valeurs d'atelier (en centimètres)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeMeasurementKeys[measureType].map(item => (
                    <div key={item.key} className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block truncate" title={item.label}>
                        {item.label.replace(' (cm)', '')}
                      </label>
                      
                      {/* For text-based general notes in 'autre', else number */}
                      {measureType === 'autre' && item.key === 'remarques' ? (
                        <textarea 
                          value={measureNotes}
                          onChange={(e) => setMeasureNotes(e.target.value)}
                          className="w-full bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs h-12 focus:outline-none"
                        />
                      ) : (
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.1"
                            min="0"
                            required
                            value={measurements[item.key] || ''}
                            onChange={(e) => setMeasurements({
                              ...measurements,
                              [item.key]: parseFloat(e.target.value) || 0
                            })}
                            className="w-full bg-white border-2 border-black rounded-none px-3 py-2 pr-8 text-xs font-black font-mono focus:outline-none"
                          />
                          <span className="absolute right-2 top-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500">cm</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General comment */}
              {measureType !== 'autre' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Note de coupe additionnelle</label>
                  <input 
                    type="text" 
                    value={measureNotes}
                    onChange={(e) => setMeasureNotes(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs focus:outline-none focus:bg-slate-50"
                    placeholder="Prise d'aisance de 2cm sur l'encolure..."
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button 
                  type="button" 
                  onClick={() => setIsMeasureFormOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black text-slate-950 hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-none bg-slate-950 text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase tracking-widest text-xs transition cursor-pointer"
                >
                  Sauvegarder la Fiche
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
