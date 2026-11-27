import React, { useState } from 'react';
import { 
  Building2, 
  Scissors, 
  MessageCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Phone,
  MapPin,
  Wallet,
  CheckCircle2,
  X
} from 'lucide-react';
import { useStore } from '../store';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { settings, updateSettings, tenants, currentTenantId, updateTenant } = useStore();
  const activeTenant = tenants.find(t => t.id === currentTenantId);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [atelierNom, setAtelierNom] = useState(activeTenant?.raisonSociale || settings.raisonSociale || 'Maison Fox Couture');
  const [slogan, setSlogan] = useState(settings.slogan || 'Haute Confection & Modèles Sénégalais');
  const [telephone, setTelephone] = useState(settings.telephone || '+221 77 000 00 00');
  const [adresse, setAdresse] = useState(settings.adresse || 'Médina, Dakar, Sénégal');
  const [devise, setDevise] = useState(settings.devise || 'FCFA');

  // Modèles sénégalais favoris
  const [specialites, setSpecialites] = useState<string[]>([
    'grand_boubou',
    'kaftan',
    'taille_basse',
    'ndokette'
  ]);

  // Moyens de paiement
  const [modesPaiement, setModesPaiement] = useState({
    wave: true,
    orange_money: true,
    especes: true,
    virement: false
  });

  const [whatsappAuto, setWhatsappAuto] = useState(true);

  if (!isOpen) return null;

  const toggleSpecialite = (id: string) => {
    setSpecialites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    // 1. Sauvegarder dans settings
    updateSettings({
      ...settings,
      raisonSociale: atelierNom,
      slogan,
      telephone,
      adresse,
      devise,
      posModesPaiementActifs: {
        especes: modesPaiement.especes,
        mobile_money: modesPaiement.wave || modesPaiement.orange_money,
        virement: modesPaiement.virement,
        carte: true
      }
    });

    // 2. Mettre à jour le tenant actuel
    if (activeTenant) {
      updateTenant({
        ...activeTenant,
        raisonSociale: atelierNom,
        adresse
      });
    }

    // 3. Marquer l'onboarding comme complété
    localStorage.setItem('fox_couture_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-black text-white p-6 border-b-2 border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-atelier-gold text-black flex items-center justify-center font-black text-lg border-2 border-white">
              FC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-atelier-gold">Foxe'Couture Afrique</span>
                <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">Étape {step} sur 3</span>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight">Configuration de Votre Atelier</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition p-1"
            title="Passer pour le moment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator bar */}
        <div className="grid grid-cols-3 bg-zinc-100 border-b-2 border-black text-center text-[10px] font-black uppercase tracking-wider">
          <div className={`p-2.5 border-r border-black flex items-center justify-center gap-1.5 ${step === 1 ? 'bg-atelier-gold text-black' : step > 1 ? 'bg-emerald-100 text-emerald-900' : 'text-zinc-500'}`}>
            {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1.'} Identité Atelier
          </div>
          <div className={`p-2.5 border-r border-black flex items-center justify-center gap-1.5 ${step === 2 ? 'bg-atelier-gold text-black' : step > 2 ? 'bg-emerald-100 text-emerald-900' : 'text-zinc-500'}`}>
            {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2.'} Spécialités & Mesures
          </div>
          <div className={`p-2.5 flex items-center justify-center gap-1.5 ${step === 3 ? 'bg-atelier-gold text-black' : 'text-zinc-500'}`}>
            3. Caisse & WhatsApp
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-none text-xs text-amber-900 flex gap-3">
                <Sparkles className="w-5 h-5 text-atelier-gold-dark flex-shrink-0 mt-0.5" />
                <p>
                  Bienvenue sur <strong>Foxe'Couture</strong>, la solution tout-en-un pensée pour les tailleurs et créateurs en Afrique de l'Ouest. Définissez les coordonnées de votre atelier pour personnaliser vos reçus et fiches de mesures.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Nom de l'Atelier / Maison de Couture *
                  </label>
                  <input
                    type="text"
                    value={atelierNom}
                    onChange={(e) => setAtelierNom(e.target.value)}
                    placeholder="Ex: Maison Sarr Couture, Dakar Élégance..."
                    className="w-full px-3 py-2.5 border-2 border-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-atelier-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Slogan ou Spécialité
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ex: Haute Couture Sénégalaise & Confection Bazin"
                    className="w-full px-3 py-2 border-2 border-black text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-atelier-gold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      Téléphone WhatsApp Principal *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-atelier-gold"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 italic mt-0.5 block">Format avec indicatif pays (+221 pour le Sénégal)</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      Devise Monétaire
                    </label>
                    <select
                      value={devise}
                      onChange={(e) => setDevise(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-atelier-gold bg-white"
                    >
                      <option value="FCFA">FCFA (XOF / XAF) — Afrique de l'Ouest</option>
                      <option value="GNF">GNF — Franc Guinéen</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="USD">USD ($) — Dollar US</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Adresse / Quartier / Ville
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Ex: Rue 10 x Blaise Diagne, Médina, Dakar"
                      className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-atelier-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  Sélectionnez vos modèles & tenues phares
                </h3>
                <p className="text-xs text-slate-600 font-serif">
                  Foxe'Couture pré-remplit les gabarits de mesures adaptés aux standards sénégalais et africains.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'grand_boubou',
                    nom: 'Grand Boubou 3 Pièces',
                    desc: 'Bazin riche, sous-boubou & pantalon thiaya',
                    genre: 'Homme & Cérémonie',
                    mesures: 'Encolure, Longueur boubou, Tour de bras'
                  },
                  {
                    id: 'kaftan',
                    nom: 'Kaftan Sénégalais',
                    desc: 'Kaftan moderne ou traditionnel 1 ou 2 pièces',
                    genre: 'Homme & Mixte',
                    mesures: 'Épaule, Poitrine, Manches, Longueur'
                  },
                  {
                    id: 'taille_basse',
                    nom: 'Taille Basse Sénégalaise',
                    desc: 'Jupe serrée & corsage avec broderie fine',
                    genre: 'Femme',
                    mesures: 'Tour de taille, Hanches, Longueur jupe'
                  },
                  {
                    id: 'ndokette',
                    nom: 'Ndokette / Marinière',
                    desc: 'Robe ample traditionnelle élégante',
                    genre: 'Femme & Cérémonie',
                    mesures: 'Carrure, Poitrine, Longueur robe'
                  },
                  {
                    id: 'costume',
                    nom: 'Costume Africain / Veste',
                    desc: 'Veste cintrée tissu wax ou laine, col mao',
                    genre: 'Homme / Femme',
                    mesures: 'Épaule, Poitrine, Longueur veste, Pantalon'
                  },
                  {
                    id: 'robe_soiree',
                    nom: 'Robe Soirée & Gala',
                    desc: 'Confection fluide, soies, velours et perlage',
                    genre: 'Femme',
                    mesures: 'Poitrine, Taille, Bassin, Longueur sol'
                  }
                ].map((item) => {
                  const selected = specialites.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSpecialite(item.id)}
                      className={`p-3 border-2 cursor-pointer transition flex items-start gap-3 select-none ${
                        selected 
                          ? 'border-black bg-amber-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                          : 'border-slate-300 hover:border-black bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 mt-0.5 border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-black text-white border-black' : 'border-slate-400 bg-white'
                      }`}>
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-slate-900">{item.nom}</h4>
                          <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 text-slate-800 font-bold uppercase">{item.genre}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                        <span className="text-[9px] text-amber-900 font-mono block mt-1">Mesures: {item.mesures}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  Caisse Journalière & Notifications WhatsApp
                </h3>
                <p className="text-xs text-slate-600 font-serif">
                  Activez vos modes de paiement locaux favoris et communiquez en direct avec vos clients via WhatsApp.
                </p>
              </div>

              {/* Modes de paiement */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                  Moyens de paiement acceptés à l'Atelier
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'wave', label: 'Wave', color: 'bg-sky-50 border-sky-400 text-sky-900' },
                    { key: 'orange_money', label: 'Orange Money', color: 'bg-orange-50 border-orange-400 text-orange-900' },
                    { key: 'especes', label: 'Espèces (Cash)', color: 'bg-emerald-50 border-emerald-400 text-emerald-900' },
                    { key: 'virement', label: 'Virement / Carte', color: 'bg-purple-50 border-purple-400 text-purple-900' },
                  ].map((m) => {
                    const active = (modesPaiement as any)[m.key];
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setModesPaiement(prev => ({ ...prev, [m.key]: !active }))}
                        className={`p-3 border-2 font-black uppercase text-xs text-center transition flex flex-col items-center gap-1 ${
                          active ? `${m.color} border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        <span className="text-xs">{m.label}</span>
                        <span className="text-[9px] font-normal">{active ? '✓ Activé' : 'Désactivé'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp-First toggle */}
              <div className="border-2 border-black p-4 bg-emerald-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-black uppercase text-emerald-950">WhatsApp-First Activé</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAuto}
                    onChange={(e) => setWhatsappAuto(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-emerald-900 font-serif">
                  Permet en un clic d'envoyer le reçu de caisse, l'invitation à l'essayage, l'avis de tenue prête et la relance du solde dû directement sur le WhatsApp du client.
                </p>
              </div>

              {/* Résumé de validation */}
              <div className="bg-slate-50 border border-slate-300 p-3 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Atelier :</span>
                  <span className="font-black text-black">{atelierNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Contact :</span>
                  <span className="font-mono text-black">{telephone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Spécialités :</span>
                  <span className="text-black font-semibold">{specialites.length} modèles actifs</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t-2 border-black flex justify-between items-center gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-wider bg-white hover:bg-slate-100 transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Précédent
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-black font-black uppercase text-[10px] tracking-wider underline cursor-pointer"
            >
              Passer la configuration
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2 bg-black text-white hover:bg-atelier-gold hover:text-black border-2 border-black font-black uppercase text-[10px] tracking-widest transition flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Suivant <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-black font-black uppercase text-[10px] tracking-widest transition flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Ouvrir mon Atelier
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
