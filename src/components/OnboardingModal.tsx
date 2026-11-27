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
import FoxLogo from './FoxLogo';

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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#161412] text-white p-6 border-b border-stone-800 flex justify-between items-center">
          <div className="flex items-center gap-3.5">
            <FoxLogo size={42} showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-[#F05A22]">Fox Couture</span>
                <span className="text-[10px] bg-white/10 text-stone-300 px-2.5 py-0.5 rounded-full font-medium">Étape {step} sur 3</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Configuration de votre atelier</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition p-2 rounded-xl hover:bg-white/10"
            title="Passer pour le moment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator bar */}
        <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-200/80 text-center text-xs font-semibold">
          <div className={`p-3 border-r border-stone-200/80 flex items-center justify-center gap-2 transition-colors ${
            step === 1 ? 'bg-[#F05A22]/10 text-[#F05A22]' : step > 1 ? 'bg-emerald-50 text-emerald-700' : 'text-stone-400'
          }`}>
            {step > 1 ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="w-5 h-5 rounded-full bg-[#F05A22] text-white text-[10px] flex items-center justify-center font-bold">1</span>}
            <span>Identité</span>
          </div>
          <div className={`p-3 border-r border-stone-200/80 flex items-center justify-center gap-2 transition-colors ${
            step === 2 ? 'bg-[#F05A22]/10 text-[#F05A22]' : step > 2 ? 'bg-emerald-50 text-emerald-700' : 'text-stone-400'
          }`}>
            {step > 2 ? <Check className="w-4 h-4 text-emerald-600" /> : <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${step === 2 ? 'bg-[#F05A22] text-white' : 'bg-stone-200 text-stone-600'}`}>2</span>}
            <span>Spécialités</span>
          </div>
          <div className={`p-3 flex items-center justify-center gap-2 transition-colors ${
            step === 3 ? 'bg-[#F05A22]/10 text-[#F05A22]' : 'text-stone-400'
          }`}>
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${step === 3 ? 'bg-[#F05A22] text-white' : 'bg-stone-200 text-stone-600'}`}>3</span>
            <span>Caisse & WhatsApp</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-[#F05A22]/5 border border-[#F05A22]/20 p-4 rounded-2xl text-xs text-stone-700 flex gap-3">
                <Sparkles className="w-5 h-5 text-[#F05A22] flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Bienvenue sur <strong>Fox Couture</strong>, la solution pensée pour les créateurs et ateliers de confection. Renseignez les coordonnées de votre atelier pour personnaliser automatiquement vos reçus, devis et fiches de mesures.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nom de l'atelier ou maison de couture *
                  </label>
                  <input
                    type="text"
                    value={atelierNom}
                    onChange={(e) => setAtelierNom(e.target.value)}
                    placeholder="Ex: Maison Fox Couture, Atelier Sarr..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-[#FBF8F3] text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Slogan ou spécialité
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ex: Haute Confection & Modèles Africains"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-[#FBF8F3] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Téléphone WhatsApp principal *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 bg-[#FBF8F3] text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                      />
                    </div>
                    <span className="text-[11px] text-stone-400 mt-1 block">Avec indicatif pays (ex: +221 pour le Sénégal)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Devise monétaire
                    </label>
                    <select
                      value={devise}
                      onChange={(e) => setDevise(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-[#FBF8F3] text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    >
                      <option value="FCFA">FCFA (XOF / XAF)</option>
                      <option value="GNF">GNF — Franc Guinéen</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="USD">USD ($) — Dollar US</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Adresse ou quartier
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Ex: Médina, Dakar, Sénégal"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 bg-[#FBF8F3] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-0.5">
                  Vos créations et tenues phares
                </h3>
                <p className="text-xs text-stone-500">
                  Fox Couture pré-charge automatiquement les gabarits de mesures adaptés à votre atelier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'grand_boubou',
                    nom: 'Grand Boubou 3 Pièces',
                    desc: 'Bazin riche, sous-boubou et pantalon',
                    genre: 'Homme & Cérémonie',
                    mesures: 'Encolure, Longueur boubou, Tour de bras'
                  },
                  {
                    id: 'kaftan',
                    nom: 'Kaftan Traditionnel',
                    desc: 'Kaftan moderne ou traditionnel 1 ou 2 pièces',
                    genre: 'Mixte',
                    mesures: 'Épaule, Poitrine, Manches, Longueur'
                  },
                  {
                    id: 'taille_basse',
                    nom: 'Taille Basse',
                    desc: 'Jupe cintrée et corsage avec broderie fine',
                    genre: 'Femme',
                    mesures: 'Tour de taille, Bassin, Longueur jupe'
                  },
                  {
                    id: 'ndokette',
                    nom: 'Ndokette / Marinière',
                    desc: 'Robe ample traditionnelle fluide',
                    genre: 'Femme & Cérémonie',
                    mesures: 'Carrure, Poitrine, Longueur robe'
                  },
                  {
                    id: 'costume',
                    nom: 'Costume & Veste',
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
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        selected 
                          ? 'border-[#F05A22] bg-[#F05A22]/5 shadow-sm' 
                          : 'border-stone-200/80 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected ? 'bg-[#F05A22] text-white border-[#F05A22]' : 'border-stone-300 bg-white'
                      }`}>
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{item.nom}</h4>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium shrink-0">{item.genre}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{item.desc}</p>
                        <span className="text-[10px] text-[#F05A22] font-medium block mt-1">Mesures: {item.mesures}</span>
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
                <h3 className="text-sm font-bold text-stone-900 mb-0.5">
                  Caisse journalière & WhatsApp
                </h3>
                <p className="text-xs text-stone-500">
                  Activez vos modes de paiement et communiquez en direct avec vos clients via WhatsApp.
                </p>
              </div>

              {/* Modes de paiement */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 block">
                  Modes de paiement acceptés
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'wave', label: 'Wave', color: 'bg-sky-50 text-sky-900 border-sky-200' },
                    { key: 'orange_money', label: 'Orange Money', color: 'bg-orange-50 text-orange-900 border-orange-200' },
                    { key: 'especes', label: 'Espèces', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                    { key: 'virement', label: 'Carte / Virement', color: 'bg-stone-50 text-stone-900 border-stone-200' },
                  ].map((m) => {
                    const active = (modesPaiement as any)[m.key];
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setModesPaiement(prev => ({ ...prev, [m.key]: !active }))}
                        className={`p-3 rounded-2xl border text-xs text-center transition-all flex flex-col items-center gap-1 ${
                          active ? `${m.color} border-[#F05A22] shadow-sm font-bold` : 'border-stone-200 bg-white text-stone-400 font-medium'
                        }`}
                      >
                        <span className="text-xs">{m.label}</span>
                        <span className="text-[10px] opacity-80">{active ? '✓ Activé' : 'Désactivé'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp toggle */}
              <div className="rounded-2xl border border-emerald-200 p-4 bg-emerald-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Notifications WhatsApp</span>
                      <span className="text-[11px] text-emerald-700">Envoi en 1 clic des reçus et invitations d'essayage</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAuto}
                    onChange={(e) => setWhatsappAuto(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Résumé de validation */}
              <div className="bg-[#FBF8F3] rounded-2xl border border-stone-200/80 p-4 text-xs text-stone-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Atelier :</span>
                  <span className="font-bold text-stone-900">{atelierNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contact :</span>
                  <span className="font-semibold text-stone-800">{telephone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Spécialités :</span>
                  <span className="font-semibold text-[#F05A22]">{specialites.length} modèles sélectionnés</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex justify-between items-center gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 font-semibold text-xs text-stone-700 bg-white hover:bg-stone-100 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 font-medium text-xs underline cursor-pointer"
            >
              Passer la configuration
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="btn-fox-primary flex items-center gap-2"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-fox-primary flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ouvrir mon atelier</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
