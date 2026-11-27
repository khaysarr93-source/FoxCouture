import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Building, 
  Phone, 
  MapPin, 
  User, 
  Mail, 
  Lock, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  Clock, 
  ArrowRight, 
  Upload, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  Inbox,
  X,
  FileText
} from 'lucide-react';
import { Tenant, SaasAdmin } from '../types';

interface RegisterScreenProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (tenantId: string, adminEmail: string) => void;
}

export default function RegisterScreen({ onBackToLogin, onRegisterSuccess }: RegisterScreenProps) {
  const { tenants, registerTenant, updateTenant } = useStore();

  // Onboarding Step Views
  // 'form' = Form inputs, 'verify' = Wait for email confirmation, 'welcome' = Account activated and welcome
  const [step, setStep] = useState<'form' | 'verify' | 'welcome'>('form');

  // Form Fields
  const [raisonSociale, setRaisonSociale] = useState('');
  const [secteur, setSecteur] = useState('atelier_couture');
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  
  const [adminNom, setAdminNom] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Errors & Validation States
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  // File Upload Drag & Drop State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Simulated Tenant
  const [pendingTenant, setPendingTenant] = useState<Tenant | null>(null);

  // Interactive Simulated Inbox State
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxEmails, setInboxEmails] = useState<Array<{
    id: string;
    from: string;
    subject: string;
    time: string;
    read: boolean;
    bodyType: 'activation' | 'welcome';
  }>>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // 1. Live Field Validations
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};

    // Company Name
    if (raisonSociale.trim().length > 0 && raisonSociale.trim().length < 3) {
      newErrors.raisonSociale = 'Le nom de la société doit comporter au moins 3 caractères.';
    } else if (raisonSociale.trim().length > 100) {
      newErrors.raisonSociale = 'Le nom de la société ne peut pas dépasser 100 caractères.';
    }

    // Phone
    const cleanPhone = telephone.replace(/\s+/g, '');
    if (cleanPhone && !/^\+?[0-9]{6,15}$/.test(cleanPhone)) {
      newErrors.telephone = 'Format de téléphone invalide (ex: +221771234567 ou 771234567).';
    }

    // Admin Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (adminEmail && !emailRegex.test(adminEmail)) {
      newErrors.adminEmail = "L'adresse email saisie est invalide.";
    } else if (adminEmail) {
      const emailLower = adminEmail.trim().toLowerCase();
      const emailExists = tenants.some(t => t.admin.email.toLowerCase() === emailLower);
      if (emailExists) {
        newErrors.adminEmail = 'Cette adresse e-mail est déjà utilisée par un autre atelier.';
      }
    }

    // Admin Password
    if (adminPassword) {
      if (adminPassword.length < 8) {
        newErrors.adminPassword = 'Le mot de passe doit contenir au moins 8 caractères.';
      } else {
        const hasUpper = /[A-Z]/.test(adminPassword);
        const hasDigit = /[0-9]/.test(adminPassword);
        if (!hasUpper || !hasDigit) {
          newErrors.adminPassword = 'Recommandation : inclure au moins une majuscule et un chiffre.';
        }
      }
    }

    // Confirm Password
    if (confirmPassword && confirmPassword !== adminPassword) {
      newErrors.confirmPassword = 'Les deux mots de passe ne correspondent pas.';
    }

    setErrors(newErrors);
  }, [raisonSociale, telephone, adminEmail, adminPassword, confirmPassword, tenants]);

  // Rate Limiting (Anti-Abuse Block Timer)
  useEffect(() => {
    if (blockTimer > 0) {
      const timer = setTimeout(() => setBlockTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (blockTimer === 0 && isBlocked) {
      setIsBlocked(false);
      setSubmitAttempts(0);
    }
  }, [blockTimer, isBlocked]);

  // Cooldown timer for resending verification email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 2. Password Strength Evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Aucun', width: '0%', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pass.length < 6) return { label: 'Faible', width: '25%', color: 'bg-rose-500', text: 'text-rose-500' };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) {
      return { label: 'Faible', width: '35%', color: 'bg-rose-500', text: 'text-rose-500' };
    } else if (score === 2 || score === 3) {
      return { label: 'Moyen', width: '65%', color: 'bg-amber-500', text: 'text-amber-500' };
    } else {
      return { label: 'Fort', width: '100%', color: 'bg-emerald-500', text: 'text-emerald-500' };
    }
  };

  const pwdStrength = getPasswordStrength(adminPassword);

  // 3. File Drag-and-Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB max

    if (!isImage) {
      alert('Veuillez sélectionner un fichier image au format JPG ou PNG.');
      return;
    }

    if (!isValidSize) {
      alert('La taille maximale du logo est de 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // 4. Form Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) return;

    // Check errors
    const formHasErrors = Object.keys(errors).length > 0;
    const requiredFieldsFilled = raisonSociale && adresse && telephone && adminNom && adminEmail && adminPassword && confirmPassword && acceptTerms;

    if (formHasErrors || !requiredFieldsFilled) {
      const nextAttempts = submitAttempts + 1;
      setSubmitAttempts(nextAttempts);
      
      // Trigger touched on all fields
      const allTouched = {
        raisonSociale: true,
        adresse: true,
        telephone: true,
        adminNom: true,
        adminEmail: true,
        adminPassword: true,
        confirmPassword: true,
      };
      setTouched(allTouched);

      if (nextAttempts >= 5) {
        setIsBlocked(true);
        setBlockTimer(10); // 10 seconds anti-abuse lockout
      }
      return;
    }

    // Valid parameters - Create Pending Tenant in 'en_attente' status
    const newTenantData = {
      raisonSociale,
      secteur: secteur === 'atelier_couture' ? 'Atelier de Couture' : secteur === 'maison_tailleur' ? 'Maison de Tailleur' : 'Autre',
      adresse,
      logo,
      statut: 'en_attente' as const,
      dateExpiration: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      formule: 'essai' as const,
      admin: {
        nom: adminNom,
        email: adminEmail,
        motDePasse: adminPassword
      }
    };

    // Save in state & Register the tenant with pending status
    const created = registerTenant(newTenantData);
    setPendingTenant(created);

    // Prepare simulated inbox with Activation email
    const activationEmail = {
      id: 'email-act-' + Math.random().toString(36).substr(2, 5),
      from: 'onboarding@foxcouture.sn',
      subject: `🔑 Confirmation d'inscription : ${raisonSociale}`,
      time: 'À l\'instant',
      read: false,
      bodyType: 'activation' as const
    };

    setInboxEmails([activationEmail]);
    setStep('verify');
    setIsInboxOpen(true); // Proactively open mailbox to delight user
    setSelectedEmailId(activationEmail.id);
  };

  // 5. Simulated Actions in Verification Page
  const handleResendEmail = () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30s cooldown

    const newResendEmail = {
      id: 'email-resend-' + Date.now(),
      from: 'onboarding@foxcouture.sn',
      subject: `🔄 Renvoyé : Activez votre espace de travail ${raisonSociale}`,
      time: 'À l\'instant',
      read: false,
      bodyType: 'activation' as const
    };

    setInboxEmails(prev => [newResendEmail, ...prev]);
    setSelectedEmailId(newResendEmail.id);
    setIsInboxOpen(true);
  };

  // Confirm Activation
  const handleConfirmActivation = () => {
    if (!pendingTenant) return;

    // Change status in the store to 'essai'
    const activatedTenant: Tenant = {
      ...pendingTenant,
      statut: 'essai'
    };
    updateTenant(activatedTenant);
    setPendingTenant(activatedTenant);

    // Mark current email as read and push Welcome Email to simulated inbox
    setInboxEmails(prev => prev.map(em => em.id === selectedEmailId ? { ...em, read: true } : em));

    const welcomeEmail = {
      id: 'email-wel-' + Math.random().toString(36).substr(2, 5),
      from: 'relations-clients@foxcouture.sn',
      subject: `🎉 Bienvenue chez Fox Couture - Guide de démarrage !`,
      time: 'À l\'instant',
      read: false,
      bodyType: 'welcome' as const
    };

    setInboxEmails(prev => [welcomeEmail, ...prev]);
    setSelectedEmailId(welcomeEmail.id);
    setStep('welcome');
  };

  const handleFinishOnboarding = () => {
    if (pendingTenant) {
      onRegisterSuccess(pendingTenant.id, pendingTenant.admin.email);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col p-4 md:p-8 justify-center items-center transition-colors duration-300 font-sans">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 flex items-center justify-center mx-auto mb-2 shadow-[4px_4px_0px_0px_rgba(255,122,26,1)] rounded-none">
          <Scissors className="h-7 w-7 text-atelier-gold animate-bounce" />
        </div>
        <h1 className="font-display font-black text-2.5xl tracking-tighter text-slate-950 dark:text-white">
          FOX <span className="text-atelier-gold">COUTURE</span>
        </h1>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Création d'Espace de Travail SaaS Autonome
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl w-full">
        
        {/* Step Contents Column */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border-4 border-black dark:border-zinc-800 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: REGISTRATION FORM */}
            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="register-form-step"
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b-2 border-black dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-atelier-gold" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">
                      Inscription Nouvelle Société
                    </span>
                  </div>
                  <button 
                    onClick={onBackToLogin}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Retour
                  </button>
                </div>

                {isBlocked && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-600 p-4 text-xs font-bold text-rose-950 dark:text-rose-200 flex gap-2.5 rounded-none animate-pulse">
                    <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <h5 className="font-black uppercase text-[10px] tracking-wider mb-0.5">SÉCURITÉ ANTI-ABUS ACTVÉE</h5>
                      <p className="leading-relaxed">
                        Trop d'échecs de validation consécutifs. Formulaire bloqué temporairement pour <strong>{blockTimer} secondes</strong>. Veuillez réviser vos entrées.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  
                  {/* Row 1: Company details */}
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-zinc-800 pb-1.5">1. Informations de la Société</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Nom de la société */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Nom de l'atelier *</label>
                      <input
                        type="text"
                        required
                        disabled={isBlocked}
                        value={raisonSociale}
                        onBlur={() => handleBlur('raisonSociale')}
                        onChange={(e) => setRaisonSociale(e.target.value)}
                        className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none px-3 py-2 text-xs focus:outline-none ${
                          touched.raisonSociale && errors.raisonSociale ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                        }`}
                        placeholder="Ex: Tailleur de l'Élégance"
                      />
                      {touched.raisonSociale && errors.raisonSociale && (
                        <p className="text-[10px] text-rose-600 font-bold">{errors.raisonSociale}</p>
                      )}
                    </div>

                    {/* Secteur d'activité */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Secteur d'activité *</label>
                      <select
                        value={secteur}
                        disabled={isBlocked}
                        onChange={(e) => setSecteur(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="atelier_couture">Atelier de Couture</option>
                        <option value="maison_tailleur">Maison de Tailleur / Haute Couture</option>
                        <option value="autre">Autre Confection Textile</option>
                      </select>
                    </div>

                  </div>

                  {/* Row 2: Contact & Adresse */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Téléphone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Téléphone de l'atelier *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          disabled={isBlocked}
                          value={telephone}
                          onBlur={() => handleBlur('telephone')}
                          onChange={(e) => setTelephone(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none ${
                            touched.telephone && errors.telephone ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                      {touched.telephone && errors.telephone && (
                        <p className="text-[10px] text-rose-600 font-bold">{errors.telephone}</p>
                      )}
                    </div>

                    {/* Adresse */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Adresse Physique *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          disabled={isBlocked}
                          value={adresse}
                          onBlur={() => handleBlur('adresse')}
                          onChange={(e) => setAdresse(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none ${
                            touched.adresse && errors.adresse ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="Avenue Cheikh Anta Diop, Dakar"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Logo Upload Drag & Drop */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Logo de l'atelier (Optionnel)</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed p-4 rounded-none text-center cursor-pointer transition relative ${
                        dragActive 
                          ? 'border-atelier-gold bg-amber-50/20' 
                          : logo 
                            ? 'border-emerald-500 bg-emerald-50/5' 
                            : 'border-slate-300 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500'
                      }`}
                      onClick={triggerFileSelect}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                        className="hidden" 
                      />
                      
                      {logo ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="w-12 h-12 border border-black object-cover" />
                            <div className="text-left">
                              <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Logo chargé avec succès
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">Image enregistrée localement</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogo(undefined);
                            }}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-300 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">
                            Glisser-déposer votre logo ici ou <span className="text-atelier-gold underline">parcourir</span>
                          </p>
                          <p className="text-[9px] text-slate-400">Format JPG, PNG • Max 2Mo</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Admin User Setup */}
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-zinc-800 pt-3 pb-1.5">2. Compte Administrateur (Gérant d'Atelier)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Nom administrateur */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">Nom Complet de l'administrateur *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          disabled={isBlocked}
                          value={adminNom}
                          onBlur={() => handleBlur('adminNom')}
                          onChange={(e) => setAdminNom(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none ${
                            touched.adminNom && !adminNom ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="Mamadou Diallo"
                        />
                      </div>
                    </div>

                    {/* Email administrateur */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300">E-mail de l'administrateur *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={isBlocked}
                          value={adminEmail}
                          onBlur={() => handleBlur('adminEmail')}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none ${
                            touched.adminEmail && errors.adminEmail ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="m.diallo@votreatelier.sn"
                        />
                      </div>
                      {touched.adminEmail && errors.adminEmail && (
                        <p className="text-[10px] text-rose-600 font-bold leading-tight">{errors.adminEmail}</p>
                      )}
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Mot de Passe *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          disabled={isBlocked}
                          value={adminPassword}
                          onBlur={() => handleBlur('adminPassword')}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-10 py-2 text-xs focus:outline-none ${
                            touched.adminPassword && errors.adminPassword ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="8 caractères min."
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-black dark:hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password strength meter */}
                      {adminPassword && (
                        <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                            <span>Sécurité :</span>
                            <span className={pwdStrength.text}>{pwdStrength.label}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 border border-black dark:border-zinc-700">
                            <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: pwdStrength.width }}></div>
                          </div>
                        </div>
                      )}

                      {touched.adminPassword && errors.adminPassword && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-tight">{errors.adminPassword}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Confirmer le Mot de Passe *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          disabled={isBlocked}
                          value={confirmPassword}
                          onBlur={() => handleBlur('confirmPassword')}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 rounded-none pl-9 pr-10 py-2 text-xs focus:outline-none ${
                            touched.confirmPassword && errors.confirmPassword ? 'border-rose-600' : 'border-black dark:border-zinc-700'
                          }`}
                          placeholder="Repéter le mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-black dark:hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-[10px] text-rose-600 font-bold">{errors.confirmPassword}</p>
                      )}
                    </div>

                  </div>

                  {/* Terms check */}
                  <div className="pt-2 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      required
                      disabled={isBlocked}
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 border-2 border-black rounded-none bg-slate-50 accent-atelier-gold cursor-pointer"
                    />
                    <label htmlFor="acceptTerms" className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal select-none">
                      J'accepte les <span className="underline hover:text-black dark:hover:text-white cursor-pointer font-bold">Conditions Générales d'Utilisation</span> et la <span className="underline hover:text-black dark:hover:text-white cursor-pointer font-bold">Politique de Confidentialité</span> de la Suite SaaS Fox Couture. *
                    </label>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isBlocked}
                    className="w-full py-3 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Lancer mon Essai Gratuit de 15 jours</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                </form>

                <p className="text-center text-[10px] text-slate-400">
                  Pas de carte de crédit requise. Accès immédiat de 15 jours dès validation.
                </p>

              </motion.div>
            )}

            {/* STEP 2: EMAIL VERIFICATION */}
            {step === 'verify' && pendingTenant && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="verify-email-step"
                className="space-y-6"
              >
                <div className="pb-3 border-b-2 border-black dark:border-zinc-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-atelier-gold animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">
                    Vérification d'Adresse E-mail
                  </span>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/10 border-2 border-amber-500 p-5 rounded-none space-y-3">
                  <h4 className="font-black text-slate-950 dark:text-white text-sm uppercase tracking-tight flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-atelier-gold" /> Lien d'Activation Envoyé
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-serif leading-relaxed">
                    Un e-mail de confirmation a été envoyé à l'adresse <strong>{adminEmail}</strong>. 
                    Veuillez cliquer sur le lien d'activation contenu dans cet e-mail sous 24 heures pour débloquer définitivement votre espace d'atelier.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Vous n'avez pas reçu l'e-mail ? Vérifiez vos spams ou utilisez le bouton ci-dessous pour renvoyer le lien.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendEmail}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-black text-slate-950 hover:text-white border-2 border-black font-black uppercase tracking-widest text-[10px] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Renvoyer ({resendCooldown}s)</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Renvoyer l'e-mail d'activation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Manual activation as fallback / SuperAdmin power
                        handleConfirmActivation();
                      }}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-black text-white hover:text-white border-2 border-black font-black uppercase tracking-widest text-[10px] transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>Validation d'Urgence (Simulé)</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setIsInboxOpen(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-widest font-black"
                    >
                      Modifier mes informations d'inscription
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* STEP 3: WELCOME & CONNECT */}
            {step === 'welcome' && pendingTenant && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="welcome-step"
                className="space-y-6"
              >
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
                    <Sparkles className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-950 dark:text-white uppercase tracking-tight">
                    Félicitations, Votre Atelier est Prêt !
                  </h3>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-4 py-1.5 border border-emerald-300 dark:border-emerald-800 inline-block">
                    Période d'Essai de 15 Jours Activée
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rappel de vos paramètres d'accès</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-zinc-800 pb-1.5">
                      <span className="text-slate-500 uppercase tracking-tight font-bold text-[10px]">Société / Tenant :</span>
                      <span className="font-black text-slate-950 dark:text-white">{raisonSociale}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-zinc-800 pb-1.5">
                      <span className="text-slate-500 uppercase tracking-tight font-bold text-[10px]">Identifiant Email :</span>
                      <span className="font-mono text-slate-950 dark:text-white font-bold">{adminEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 dark:border-zinc-800 pb-1.5">
                      <span className="text-slate-500 uppercase tracking-tight font-bold text-[10px]">Code d'accès :</span>
                      <span className="font-mono text-slate-950 dark:text-white font-bold">{adminPassword}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-slate-500 uppercase tracking-tight font-bold text-[10px]">Fin d'essai gratuit :</span>
                      <span className="text-rose-600 dark:text-rose-400 font-black uppercase tracking-wider">{pendingTenant.dateExpiration.split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100/50 dark:bg-zinc-800/30 p-4 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 font-serif leading-relaxed">
                  <strong>Guide de démarrage rapide :</strong> Pour débuter, nous avons préconfiguré pour vous les devises standards en FCFA, la langue française et les modèles de mesures anatomiques. Ajoutez vos premiers couturiers dans l'onglet Équipe et importez ou créez vos fiches clients de mesures !
                </div>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full py-3.5 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none border-2 border-black flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>S'authentifier & Accéder à l'Atelier</span>
                </button>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Simulated Inbox / Interactive Sandbox Column */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Email Inbox Simulator Widget */}
          <div className="bg-black text-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex flex-col h-[500px]">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Inbox className="h-4.5 w-4.5 text-atelier-gold animate-pulse" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">
                  Boîte de Réception ({inboxEmails.filter(e => !e.read).length})
                </h3>
              </div>
              <span className="text-[8px] bg-amber-500 text-black font-black px-1.5 py-0.5 uppercase tracking-wider">
                Simulation Live
              </span>
            </div>

            {inboxEmails.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                <Mail className="h-10 w-10 text-zinc-700" />
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Boîte aux lettres vide</h5>
                  <p className="text-[10px] text-zinc-600 mt-1 font-serif leading-relaxed italic">
                    Les notifications d'inscription et de bienvenue s'afficheront ici en temps réel pour validation directe.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Email List */}
                <div className="h-1/3 overflow-y-auto border-b border-zinc-800 pb-2 space-y-1.5 pr-1">
                  {inboxEmails.map(em => (
                    <div
                      key={em.id}
                      onClick={() => setSelectedEmailId(em.id)}
                      className={`p-2.5 cursor-pointer text-left transition relative border ${
                        selectedEmailId === em.id 
                          ? 'bg-zinc-900 border-atelier-gold text-white' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                      } ${!em.read ? 'font-bold text-white border-l-4 border-l-atelier-gold' : ''}`}
                    >
                      <div className="flex justify-between items-start text-[9px] mb-1">
                        <span className="text-zinc-400 font-mono">{em.from}</span>
                        <span className="text-[8px] text-zinc-500">{em.time}</span>
                      </div>
                      <h4 className="text-[10px] tracking-tight truncate leading-tight">{em.subject}</h4>
                    </div>
                  ))}
                </div>

                {/* Email Body Preview */}
                <div className="flex-1 overflow-y-auto pt-3 bg-zinc-950 p-3 border border-zinc-800 text-zinc-100 font-sans mt-2 text-[11px] leading-relaxed relative">
                  
                  {selectedEmailId ? (
                    (() => {
                      const emailObj = inboxEmails.find(e => e.id === selectedEmailId);
                      if (!emailObj) return <p className="text-zinc-500 italic text-center pt-8">Sélectionner un e-mail.</p>;

                      if (emailObj.bodyType === 'activation') {
                        return (
                          <div className="space-y-4">
                            <div className="pb-2 border-b border-zinc-900">
                              <p><span className="text-zinc-500 font-mono">De:</span> <strong className="text-white">onboarding@foxcouture.sn</strong></p>
                              <p><span className="text-zinc-500 font-mono">À:</span> <strong className="text-white">{adminEmail || 'vous'}</strong></p>
                              <p><span className="text-zinc-500 font-mono">Sujet:</span> <strong className="text-atelier-gold">{emailObj.subject}</strong></p>
                            </div>

                            <div className="space-y-3 font-serif italic text-zinc-300">
                              <p>Bonjour {adminNom || 'Administrateur'},</p>
                              <p>
                                Merci pour votre inscription sur <strong>Fox Couture SaaS</strong>.
                                Pour finaliser la création de l'espace isolé de l'atelier <strong>{raisonSociale || 'votre société'}</strong>, 
                                démarrer votre période d'essai de 15 jours et valider votre adresse e-mail, veuillez cliquer sur le lien d'activation ci-dessous :
                              </p>
                            </div>

                            {/* Verification Button */}
                            <div className="py-2 text-center">
                              <button
                                type="button"
                                onClick={handleConfirmActivation}
                                className="inline-flex px-4 py-2 bg-atelier-gold hover:bg-white text-black font-black uppercase tracking-widest text-[9px] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                              >
                                Activer mon atelier et démarrer l'essai 🚀
                              </button>
                            </div>

                            <div className="space-y-1.5 text-[9px] text-zinc-500 font-mono">
                              <p>Ce lien est à usage unique et expirera sous 24h.</p>
                              <p>Identifiants de secours : {adminEmail} / {adminPassword}</p>
                              <p>Atelier Fox Couture Dakar S.N. — Solutions Numériques Tailleur.</p>
                            </div>
                          </div>
                        );
                      }

                      if (emailObj.bodyType === 'welcome') {
                        return (
                          <div className="space-y-4">
                            <div className="pb-2 border-b border-zinc-900">
                              <p><span className="text-zinc-500 font-mono">De:</span> <strong className="text-white">relations-clients@foxcouture.sn</strong></p>
                              <p><span className="text-zinc-500 font-mono">À:</span> <strong className="text-white">{adminEmail || 'vous'}</strong></p>
                              <p><span className="text-zinc-500 font-mono">Sujet:</span> <strong className="text-emerald-500">{emailObj.subject}</strong></p>
                            </div>

                            <div className="space-y-3 font-serif italic text-zinc-300">
                              <p>Bienvenue chez Fox Couture, {adminNom} !</p>
                              <p>
                                L'adresse de votre société a été confirmée et l'espace de données sécurisé pour <strong>{raisonSociale}</strong> a été initialisé avec succès.
                              </p>
                              <p>
                                Votre abonnement d'essai gratuit de 15 jours se terminera le <strong>{pendingTenant?.dateExpiration.split('-').reverse().join('/')}</strong>. 
                                Vous avez un accès complet à l'ensemble des modules : Clients & Mesures, Suivi d'atelier, Facturation, Agenda et Équipe.
                              </p>
                            </div>

                            <div className="p-2.5 bg-zinc-900 border border-zinc-800 space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Liens Utiles :</span>
                              <div className="text-[10px] space-y-1">
                                <p className="text-atelier-gold hover:underline cursor-pointer flex items-center gap-1">📘 Guide de prise en main rapide.pdf</p>
                                <p className="text-atelier-gold hover:underline cursor-pointer flex items-center gap-1">💬 Support et Chat d'atelier Foxfy.url</p>
                              </div>
                            </div>

                            <div className="text-[9px] text-zinc-500 font-mono">
                              <p>Pour toute assistance technique : support@foxfy.sn</p>
                              <p>Fox Couture OS — SAS au capital de 5 000 000 FCFA, Dakar.</p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })()
                  ) : (
                    <div className="text-center pt-16 text-zinc-600 font-serif italic">
                      Veuillez soumettre le formulaire ou sélectionner un e-mail reçu pour afficher son contenu.
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Info Side help */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-4 space-y-2 text-xs">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-atelier-gold" /> Pourquoi un Espace Isolé (Tenant) ?
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-serif italic">
              Fox Couture utilise un partitionnement strict de base de données. Chaque nouvel atelier possède sa propre isolation locale (stockage isolé en cache navigateur par tenant-id) pour garantir la confidentialité absolue des mensurations de ses clients.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
