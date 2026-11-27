/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import FoxMascot from './FoxMascot';
import FoxLogo from './FoxLogo';
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
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <FoxLogo size={56} showText={false} className="mb-3" />
        <h1 className="text-2xl font-black tracking-tight text-[#161412]">
          Fox <span className="text-[#F05A22]">Couture</span>
        </h1>
        <p className="text-xs font-medium text-stone-500 mt-1">
          Haute confection et gestion d'atelier
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl w-full">
        {/* Main Login Form Column */}
        <div className="lg:col-span-7 card-fox rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl bg-white flex flex-col justify-between">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#F05A22]" /> Connexion Atelier
              </span>
              <select
                value={currentTenantId}
                onChange={(e) => {
                  setCurrentTenantId(e.target.value);
                  setEmailInput('');
                  setPasswordInput('');
                  setErrorMsg('');
                }}
                className="bg-[#FBF8F3] text-stone-800 border border-stone-200 rounded-xl px-3 py-1.5 font-semibold cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.raisonSociale}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs font-medium text-rose-800 flex gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs font-medium text-emerald-800 flex gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Identifiant ou adresse email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#FBF8F3] text-stone-900 border border-stone-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="votre.email@foxcouture.sn"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#FBF8F3] text-stone-900 border border-stone-200/80 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-fox-primary w-full py-3 text-center justify-center font-bold text-sm"
            >
              Se connecter à l'atelier
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-500">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="font-bold text-[#F05A22] hover:underline transition cursor-pointer"
                >
                  Créer un compte atelier (Essai 15j)
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>Sécurité renforcée — Fox Couture © 2026</span>
          </div>
        </div>

        {/* Demo Helper / Accounts Column */}
        <div className="lg:col-span-5 card-fox rounded-3xl border border-stone-200/80 p-6 shadow-xl bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <HelpCircle className="h-4 w-4 text-[#F05A22]" />
            <h3 className="text-xs font-bold text-stone-900">Comptes de démonstration</h3>
          </div>
          
          <p className="text-xs text-stone-500 leading-relaxed">
            Cliquez sur un compte ci-dessous pour pré-remplir instantanément ses identifiants.
          </p>

          <div className="space-y-2.5 pt-1 max-h-[380px] overflow-y-auto pr-1">
            {/* Master Tenant Admin */}
            {activeTenant && (
              <div 
                onClick={() => quickFill(activeTenant.admin.email, activeTenant.admin.motDePasse)}
                className="bg-amber-50/60 hover:bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs cursor-pointer transition-all flex items-start gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-stone-900 block truncate">Admin Atelier ({activeTenant.raisonSociale})</span>
                  <span className="text-[11px] text-stone-500 block truncate">Email : {activeTenant.admin.email}</span>
                  <span className="text-[11px] text-stone-500 block">Passe : {activeTenant.admin.motDePasse}</span>
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
                  className={`border p-3.5 rounded-2xl text-xs cursor-pointer transition-all flex items-start gap-3 shadow-xs ${
                    isBlocked 
                      ? 'bg-rose-50/40 border-rose-200 text-stone-400' 
                      : emp.roleSaaS === 'chef_atelier' 
                        ? 'bg-orange-50/50 hover:bg-orange-50 border-orange-200' 
                        : 'bg-stone-50/60 hover:bg-stone-100 border-stone-200/80'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isBlocked ? 'bg-rose-100 text-rose-600' : emp.roleSaaS === 'chef_atelier' ? 'bg-[#F05A22]/10 text-[#F05A22]' : 'bg-stone-200/70 text-stone-700'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-stone-900 block flex items-center gap-1.5 truncate">
                      {emp.prenom} {emp.nom}
                      <span className="text-[10px] text-stone-400 font-medium">
                        ({emp.roleSaaS === 'chef_atelier' ? 'Chef' : emp.roleSaaS === 'vendeur' ? 'Vendeur' : emp.roleSaaS === 'coupeur' ? 'Coupeur' : 'Couturier'})
                      </span>
                      {isBlocked && <span className="text-[9px] bg-rose-500 text-white font-medium px-1.5 py-0.2 rounded-md">Bloqué</span>}
                    </span>
                    <span className="text-[11px] text-stone-500 block truncate">Email : {emp.email}</span>
                    <span className="text-[11px] text-stone-500 block">Passe : {emp.motDePasse}</span>
                  </div>
                </div>
              );
            })}

            {/* Platform SuperAdmin */}
            <div 
              onClick={() => quickFill('superadmin@foxcouture.sn', 'superadmin123')}
              className="bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs cursor-pointer transition-all flex items-start gap-3 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-stone-900 block">Super-Admin Fox Couture</span>
                <span className="text-[11px] text-stone-500 block">Email : superadmin@foxcouture.sn</span>
                <span className="text-[11px] text-stone-500 block">Passe : superadmin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
