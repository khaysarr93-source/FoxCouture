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
      <div className="flex lg:hidden bg-white p-1 rounded-2xl border border-stone-200/60 shadow-xs">
        <button
          onClick={() => setActiveMobileView('list')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'list' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Annuaire ({filteredClients.length})
        </button>
        <button
          onClick={() => setActiveMobileView('detail')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeMobileView === 'detail' ? 'bg-[#191716] text-white' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Fiche Client {selectedClient ? `(${selectedClient.prenom})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Column 1: Client Directory List */}
        <div className={`lg:col-span-1 bg-white rounded-3xl border border-stone-200/60 shadow-xs overflow-hidden flex flex-col h-[750px] ${
          activeMobileView === 'list' ? 'flex' : 'hidden lg:flex'
        }`}>
        {/* Header Search & Actions */}
        <div className="p-5 border-b border-stone-100 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#191716] font-display flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-[#F05A22]" /> Annuaire Clients
            </h3>
            <button 
              onClick={openNewClientModal}
              className="btn-fox-primary !p-2 !rounded-xl"
              title="Ajouter un client"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
            </button>
          </div>
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Rechercher nom, téléphone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
            />
          </div>
        </div>

        {/* Directory List Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveMobileView('detail');
                }}
                className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition ${
                  selectedClientId === client.id ? 'bg-[#FFEDE5] border-l-4 border-[#F05A22]' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#191716] text-white flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-xs">
                    {client.prenom[0]}{client.nom[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#191716]">
                      {client.prenom} {client.nom}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">{client.telephone}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-stone-400 transition-transform ${selectedClientId === client.id ? 'translate-x-1 text-[#F05A22]' : ''}`} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-stone-400">
              <User className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">Aucun client trouvé</p>
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
                className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                ← Retour à l'annuaire des clients
              </button>
            </div>

            {/* Client Profile Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/60 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#191716] text-white flex items-center justify-center text-xl font-extrabold font-display shadow-xs flex-shrink-0">
                    {selectedClient.prenom[0]}{selectedClient.nom[0]}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#191716] tracking-tight font-display">
                      {selectedClient.prenom} {selectedClient.nom}
                    </h2>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">
                      Client depuis le {selectedClient.dateCreation ? selectedClient.dateCreation.split('-').reverse().join('/') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Actions buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={buildWhatsAppLink(selectedClient.telephone, `Bonjour ${selectedClient.prenom}, nous vous contactons depuis votre atelier ${settings.raisonSociale}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Contacter sur WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                  <button 
                    onClick={() => openEditClientModal(selectedClient)}
                    className="p-2 rounded-xl border border-stone-200/80 text-stone-700 bg-white hover:bg-stone-50 transition cursor-pointer"
                    title="Modifier le profil"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={printClientMeasurements}
                    className="p-2 rounded-xl border border-stone-200/80 text-stone-700 bg-white hover:bg-stone-50 transition cursor-pointer"
                    title="Imprimer la fiche complète"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 transition cursor-pointer"
                    title="Supprimer le client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Direct Info list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FBF8F3] text-stone-700 border border-stone-200/60">
                    <Phone className="h-4 w-4 text-[#F05A22]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Téléphone</span>
                    <a href={`tel:${selectedClient.telephone}`} className="font-bold text-stone-900 font-mono hover:text-[#F05A22]">
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
            <div className="card-fox p-6 space-y-6">
              <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#F05A22]" /> Préférences & remarques d'atelier
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Preferences lists */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Styles favoris</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.preferences.stylesFavoris.length > 0 ? (
                        selectedClient.preferences.stylesFavoris.map((style, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs font-medium bg-[#191716] text-white px-3 py-1 rounded-full">
                            <Tag className="h-3 w-3 text-[#F05A22]" /> {style}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-400">Aucun style fétiche défini</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Tissus préférés</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.preferences.tissusPreferes.length > 0 ? (
                        selectedClient.preferences.tissusPreferes.map((tis, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                            <BookOpen className="h-3 w-3 text-amber-700" /> {tis}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-400">Aucune préférence de tissu spécifiée</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Atelier Notes */}
                <div className="p-4.5 rounded-2xl bg-[#FBF8F3] border border-stone-200/70">
                  <span className="text-xs font-semibold text-stone-700 block mb-2">
                    Consignes d'atelier particulières (Mesures & Coupe)
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
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
            <div className="card-fox p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Ruler className="h-4.5 w-4.5 text-[#F05A22]" /> Mensurations corporelles
                </h3>
                <button 
                  onClick={openNewMeasureModal}
                  className="btn-fox-primary !py-2 !px-3.5 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Nouvelle fiche
                </button>
              </div>

              {clientMeasures.length > 0 ? (
                <div className="space-y-6">
                  {clientMeasures.map(measure => (
                    <div key={measure.id} className="p-5 rounded-2xl border border-stone-200/70 bg-[#FBF8F3] space-y-4">
                      {/* Sub card title */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-stone-900 bg-stone-200/80 px-2.5 py-1 rounded-lg">
                          {measure.typeVetement.replace('_', ' ')}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-stone-500 font-mono">
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
                              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200 rounded-xl cursor-pointer flex items-center justify-center shadow-xs"
                              title="Partager cette fiche de mesures par WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>

                            <button 
                              onClick={() => printSingleMeasurementSheet(measure)}
                              className="p-2 text-stone-700 hover:bg-stone-200 bg-white transition border border-stone-200 rounded-xl cursor-pointer flex items-center justify-center shadow-xs"
                              title="Imprimer cette fiche de mesures"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            <button 
                              onClick={() => openEditMeasureModal(measure)}
                              className="p-2 text-stone-700 hover:bg-stone-200 bg-white transition border border-stone-200 rounded-xl cursor-pointer shadow-xs"
                              title="Modifier la fiche"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Supprimer cette fiche de mesures ?')) deleteFicheMesure(measure.id);
                              }}
                              className="p-2 text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition rounded-xl cursor-pointer shadow-xs"
                              title="Supprimer la fiche"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Measures values Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(measure.mensurations)
                          .filter(([key]) => isFieldActive(key))
                          .map(([key, value]) => (
                            <div key={key} className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs">
                              <span className="text-[10px] text-stone-500 font-medium block truncate capitalize" title={key}>
                                {(() => {
                                  for (const type of Object.keys(defaultMeasurementKeys)) {
                                    const found = defaultMeasurementKeys[type as TypeVetement].find(item => item.key === key);
                                    if (found) return found.label.replace(' (cm)', '');
                                  }
                                  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                                })()}
                              </span>
                              <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
                                {value} cm
                              </span>
                            </div>
                          ))}
                      </div>

                      {measure.notes && (
                        <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200 mt-2 leading-relaxed">
                          <strong>Note de coupe :</strong> "{measure.notes}"
                        </p>
                      )}

                      {/* AI Tailoring Advice Section */}
                      <div className="mt-4 pt-4 border-t border-stone-200">
                        {aiAdvice[measure.id] ? (
                          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 relative overflow-hidden">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-[#F05A22]" /> Analyse de coupe & style IA
                              </span>
                              <button
                                onClick={() => handleFetchAiSizingAdvice(measure)}
                                disabled={loadingAdvice[measure.id]}
                                className="text-xs font-semibold text-stone-600 hover:text-[#F05A22] cursor-pointer disabled:opacity-50 transition"
                              >
                                {loadingAdvice[measure.id] ? 'Analyse...' : 'Réanalyser'}
                              </button>
                            </div>
                            
                            {renderFormattedAdvice(aiAdvice[measure.id])}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-stone-200/80">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-[#F05A22]" /> Assistant de coupe & stylisme IA
                              </span>
                              <p className="text-xs text-stone-500">
                                Analyse morphologique, conseils d'ajustements d'atelier et suggestions de tissus.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFetchAiSizingAdvice(measure)}
                              disabled={loadingAdvice[measure.id]}
                              className="btn-fox-primary !py-2 !px-3 shrink-0"
                            >
                              {loadingAdvice[measure.id] ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Analyse...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" /> Générer analyse IA
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
                <div className="text-center py-10 bg-[#FBF8F3] rounded-2xl border border-dashed border-stone-300 text-stone-400">
                  <Ruler className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs font-semibold text-stone-600">Aucune mensuration enregistrée</p>
                  <p className="text-xs text-stone-400 mt-1">Créez une fiche pour commencer la fabrication sur-mesure.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card-fox p-12 text-center text-stone-400">
            <User className="h-10 w-10 mx-auto mb-3 text-stone-300" />
            <h3 className="text-base font-bold text-stone-900">Aucun client sélectionné</h3>
            <p className="text-xs text-stone-500 mt-1">Veuillez sélectionner un client dans la liste ou en créer un nouveau.</p>
            <button 
              onClick={openNewClientModal}
              className="btn-fox-primary mt-4"
            >
              Ajouter mon premier client
            </button>
          </div>
        )}
      </div>

      {/* MODAL: CLIENT FORM (CREATE / EDIT) */}
      {isClientFormOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 mb-6">
              {editingClient ? 'Modifier le client' : 'Enregistrer un nouveau client'}
            </h3>
            
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Prénom *</label>
                  <input 
                    type="text" 
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="Mamadou"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Nom de famille *</label>
                  <input 
                    type="text" 
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="Diop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Téléphone *</label>
                  <input 
                    type="text" 
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="+221 77 654 32 10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Adresse email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="m.diop@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Adresse postale / Quartier</label>
                <input 
                  type="text" 
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                  placeholder="Fann Résidence, Villa 42, Dakar"
                />
              </div>

              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-800 mb-3">Préférences du client</h4>

                {/* Styles preference helper */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-stone-600 block">Styles favoris</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newStyleInput}
                      onChange={(e) => setNewStyleInput(e.target.value)}
                      className="flex-1 bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                      placeholder="Ex: Costume croisé, Boubou brodé..."
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        if(newStyleInput.trim()) {
                          setStylesFavoris([...stylesFavoris, newStyleInput.trim()]);
                          setNewStyleInput('');
                        }
                      }}
                      className="px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-[#F05A22] transition cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {stylesFavoris.map((st, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs font-medium bg-[#FBF8F3] text-stone-800 border border-stone-200 px-2.5 py-0.5 rounded-full">
                        {st}
                        <button 
                          type="button" 
                          onClick={() => setStylesFavoris(stylesFavoris.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fabrics preference helper */}
                <div className="space-y-1.5 mt-3">
                  <label className="text-[11px] font-medium text-stone-600 block">Matières / Tissus de choix</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTissuInput}
                      onChange={(e) => setNewTissuInput(e.target.value)}
                      className="flex-1 bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                      placeholder="Ex: Soie, Bazin Riche..."
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if(newTissuInput.trim()) {
                          setTissusPreferes([...tissusPreferes, newTissuInput.trim()]);
                          setNewTissuInput('');
                        }
                      }}
                      className="px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-[#F05A22] transition cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tissusPreferes.map((tis, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {tis}
                        <button 
                          type="button" 
                          onClick={() => setTissusPreferes(tissusPreferes.filter((_, i) => i !== idx))}
                          className="text-amber-600 hover:text-rose-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 mt-3">
                  <label className="text-[11px] font-medium text-stone-600 block">Remarques ou contraintes d'atelier</label>
                  <textarea 
                    value={remarquesParticulieres}
                    onChange={(e) => setRemarquesParticulieres(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F05A22] h-20"
                    placeholder="Épaule droite plus basse de 1cm, attention aux manches..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => setIsClientFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-fox-primary flex-1 !py-2.5"
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
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {editingMeasure ? 'Modifier la fiche de mesures' : 'Saisir de nouvelles mesures'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">Client : <span className="font-semibold text-stone-900">{selectedClient?.prenom} {selectedClient?.nom}</span></p>
            
            <form onSubmit={handleMeasureSubmit} className="space-y-4">
              {/* Garment type selectors */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Type de vêtement</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['costume_homme', 'robe_femme', 'tailleur_femme', 'chemise_homme', 'autre'] as TypeVetement[]).map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => handleMeasureTypeChange(type)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition capitalize cursor-pointer ${
                        measureType === type 
                          ? 'bg-[#191716] text-white shadow-xs' 
                          : 'bg-[#FBF8F3] border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Measurement Form Inputs Grid */}
              <div className="bg-[#FBF8F3] rounded-2xl p-4 border border-stone-200/80 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">
                  Valeurs de mensurations (en cm)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeMeasurementKeys[measureType].map(item => (
                    <div key={item.key} className="space-y-1">
                      <label className="text-[11px] font-medium text-stone-600 block truncate" title={item.label}>
                        {item.label.replace(' (cm)', '')}
                      </label>
                      
                      {/* For text-based general notes in 'autre', else number */}
                      {measureType === 'autre' && item.key === 'remarques' ? (
                        <textarea 
                          value={measureNotes}
                          onChange={(e) => setMeasureNotes(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs h-12 focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
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
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 pr-8 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                          />
                          <span className="absolute right-2.5 top-2.5 text-[10px] font-semibold text-stone-400">cm</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General comment */}
              {measureType !== 'autre' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Note de coupe additionnelle</label>
                  <input 
                    type="text" 
                    value={measureNotes}
                    onChange={(e) => setMeasureNotes(e.target.value)}
                    className="w-full bg-[#FBF8F3] border border-stone-200/80 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F05A22]"
                    placeholder="Prise d'aisance de 2cm sur l'encolure..."
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => setIsMeasureFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-fox-primary flex-1 !py-2.5"
                >
                  Sauvegarder la fiche
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
