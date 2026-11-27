/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import FoxMascot from './FoxMascot';
import RegisterScreen from './RegisterScreen';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Clock, 
  User, 
  AlertTriangle,
  Scissors,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { 
    employes, 
    tenants, 
    currentTenantId, 
    setCurrentTenantId, 
    setUserRole,
    updateEmploye
  } = useStore();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Get active tenant details
  const activeTenant = tenants.find(t => t.id === currentTenantId);

  // Render Register Screen if in registration mode
  if (isRegistering) {
    return (
      <RegisterScreen 
        onBackToLogin={() => setIsRegistering(false)} 
        onRegisterSuccess={(tenantId, adminEmail) => {
          setCurrentTenantId(tenantId);
          setEmailInput(adminEmail);
          setIsRegistering(false);
          setSuccessMsg('Votre atelier a été créé avec succès ! Saisissez votre mot de passe pour y accéder.');
          setPasswordInput('');
        }} 
      />
    );
  }

  // Handle manual login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    // 1. Check SuperAdmin credentials
    if (email === 'superadmin@foxcouture.sn' && password === 'superadmin123') {
      setUserRole('super_admin');
      setSuccessMsg('Connexion réussie en tant que Super-Administrateur !');
      setTimeout(() => {
        onLoginSuccess({
          id: 'super-admin',
          prenom: 'Super',
          nom: 'Administrateur',
          roleSaaS: 'super_admin',
          avatarColor: 'bg-emerald-600 text-white'
        });
      }, 1000);
      return;
    }

    // 2. Check Master Tenant Admin credentials
    if (activeTenant && email === activeTenant.admin.email.toLowerCase() && password === activeTenant.admin.motDePasse) {
      if (activeTenant.statut === 'en_attente') {
        setErrorMsg("Votre adresse e-mail n'a pas encore été confirmée. Veuillez cliquer sur le lien de confirmation envoyé dans votre boîte de réception simulée lors de l'inscription.");
        return;
      }
      setUserRole('tenant_admin');
      setSuccessMsg(`Connexion réussie : Gérant de ${activeTenant.raisonSociale} !`);
      setTimeout(() => {
        onLoginSuccess({
          id: 'tenant-admin-id',
          prenom: activeTenant.admin.nom,
          nom: '(Gérant)',
          roleSaaS: 'tenant_admin',
          avatarColor: 'bg-black text-white'
        });
      }, 1000);
      return;
    }

    // 3. Check Employee credentials (isolated by active tenant)
    const matchedEmployee = employes.find(emp => emp.email?.toLowerCase() === email && emp.motDePasse === password);
    
    if (matchedEmployee) {
      // Check if access is blocked
      if (matchedEmployee.accesActif === false) {
        setErrorMsg('Accès Refusé : Votre compte utilisateur a été bloqué ou désactivé par l\'administrateur.');
        return;
      }

      // Log last login time
      const updated = {
        ...matchedEmployee,
        derniereConnexion: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      updateEmploye(updated);

      // Set user role & login
      const systemRole = matchedEmployee.roleSaaS || 'couturier';
      setUserRole(systemRole);
      setSuccessMsg(`Ravi de vous revoir, ${matchedEmployee.prenom} !`);
      
      setTimeout(() => {
        onLoginSuccess(updated);
      }, 1000);
      return;
    }

    setErrorMsg('Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe pour cet atelier.');
  };

  // Helper to quick fill credentials for testing
  const quickFill = (email: string, pass: string, tenantId?: string) => {
    if (tenantId) {
      setCurrentTenantId(tenantId);
    }
    setEmailInput(email);
    setPasswordInput(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-atelier-cream dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      
      {/* Brand Header with Fox Mascot */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 flex items-center justify-center mx-auto mb-3 shadow-[6px_6px_0px_0px_rgba(255,122,26,1)] rounded-none relative">
          <FoxMascot size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-none border border-black">
            <Scissors className="h-3.5 w-3.5 text-atelier-gold" />
          </div>
        </div>
        <h1 className="font-display font-black text-3.5xl tracking-tighter text-slate-950 dark:text-white">
          FOX <span className="text-atelier-gold">COUTURE</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
          SUITE D'ADMINISTRATION & DE CONFECTION FOXFY
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl w-full">
        {/* Main Login Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border-4 border-black dark:border-zinc-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex flex-col justify-between">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="flex justify-between items-center pb-4 border-b-2 border-black dark:border-zinc-800 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-atelier-gold" /> Authentification Atelier
              </span>
              <select
                value={currentTenantId}
                onChange={(e) => {
                  setCurrentTenantId(e.target.value);
                  setEmailInput('');
                  setPasswordInput('');
                  setErrorMsg('');
                }}
                className="bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-zinc-100 border-2 border-black dark:border-zinc-700 px-2.5 py-1 font-black cursor-pointer text-[10px] uppercase"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.raisonSociale}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-600 p-4 text-xs font-bold text-rose-950 dark:text-rose-200 flex gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 p-4 text-xs font-bold text-emerald-950 dark:text-emerald-200 flex gap-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Identifiant ou Adresse Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-10 pr-3 py-3 text-xs focus:outline-none focus:bg-white"
                  placeholder="votre.email@foxcouture.sn"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Mot de Passe d'Accès *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-10 pr-10 py-3 text-xs focus:outline-none focus:bg-white font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-black dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            >
              Se Connecter à l'Atelier
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-500 font-serif">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="font-black uppercase text-[10px] tracking-wider text-slate-950 dark:text-white underline hover:text-atelier-gold transition cursor-pointer"
                >
                  Inscrivez votre atelier (Essai Gratuit 15j)
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Sécurité renforcée — Maison Fox Couture © 2026</span>
          </div>
        </div>

        {/* Demo Helper / Accounts Column */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none space-y-4">
          <div className="flex items-center gap-1.5 border-b-2 border-black dark:border-zinc-800 pb-2.5">
            <HelpCircle className="h-4.5 w-4.5 text-atelier-gold" />
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-950 dark:text-white">Comptes de Démo (Test)</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 font-serif leading-relaxed italic">
            Cliquer sur l'un des comptes ci-dessous pour remplir instantanément les identifiants d'accès correspondants.
          </p>

          <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
            {/* Master Tenant Admin */}
            {activeTenant && (
              <div 
                onClick={() => quickFill(activeTenant.admin.email, activeTenant.admin.motDePasse)}
                className="bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900/60 p-3 rounded-none text-xs cursor-pointer transition flex items-start gap-2.5"
              >
                <User className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 dark:text-white block">Administrateur d'Atelier ({activeTenant.raisonSociale})</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Email : {activeTenant.admin.email}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Code d'accès : {activeTenant.admin.motDePasse}</span>
                </div>
              </div>
            )}

            {/* Employee Accounts */}
            {employes.filter(e => e.email && e.motDePasse).map(emp => {
              const isBlocked = emp.accesActif === false;
              return (
                <div 
                  key={emp.id}
                  onClick={() => quickFill(emp.email!, emp.motDePasse!)}
                  className={`border-2 p-3 rounded-none text-xs cursor-pointer transition flex items-start gap-2.5 ${
                    isBlocked 
                      ? 'bg-rose-50/30 hover:bg-rose-50/60 border-rose-200 dark:border-rose-900/40 text-slate-400'
                      : emp.roleSaaS === 'chef_atelier' 
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border-slate-300 dark:border-zinc-700'
                  }`}
                >
                  <User className={`h-4 w-4 mt-0.5 ${isBlocked ? 'text-rose-400' : emp.roleSaaS === 'chef_atelier' ? 'text-indigo-600' : 'text-slate-600'}`} />
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 dark:text-white block flex items-center gap-1.5">
                      {emp.prenom} {emp.nom} 
                      <span className="font-mono text-[9px] text-slate-400 font-bold tracking-tight">({emp.roleSaaS === 'chef_atelier' ? 'Chef' : 'Couturier'})</span>
                      {isBlocked && <span className="text-[8px] bg-rose-600 text-white font-mono px-1 py-0.5 ml-1">BLOQUÉ</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">Email : {emp.email}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">Code d'accès : {emp.motDePasse}</span>
                  </div>
                </div>
              );
            })}

            {/* Platform SuperAdmin */}
            <div 
              onClick={() => quickFill('superadmin@foxcouture.sn', 'superadmin123')}
              className="bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900/60 p-3 rounded-none text-xs cursor-pointer transition flex items-start gap-2.5"
            >
              <User className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-slate-900 dark:text-white block">Super-Administrateur SaaS</span>
                <span className="text-[10px] text-slate-500 font-mono block">Email : superadmin@foxcouture.sn</span>
                <span className="text-[10px] text-slate-500 font-mono block">Code d'accès : superadmin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
