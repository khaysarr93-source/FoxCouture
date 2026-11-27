/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Employe, RoleEmploye } from '../types';
import { 
  Users, 
  Plus, 
  Phone, 
  Sparkles, 
  Trash2, 
  Briefcase, 
  CheckCircle, 
  Activity, 
  UserPlus, 
  Tag, 
  UserCheck,
  Key,
  Shield,
  ShieldAlert,
  Mail,
  Lock,
  Unlock,
  UserX,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export default function PersonnelSection() {
  const { employes, addEmploye, updateEmploye, deleteEmploye } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'accounts'>('employees');
  
  // Recruitment Form States
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [role, setRole] = useState<RoleEmploye>('couturier');
  const [specialite, setSpecialite] = useState('');
  const [telephone, setTelephone] = useState('');
  const [hasSystemAccess, setHasSystemAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [roleSaaS, setRoleSaaS] = useState<'tenant_admin' | 'chef_atelier' | 'couturier' | 'vendeur' | 'coupeur'>('couturier');

  // Account Modal States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employe | null>(null);
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRoleSaaS, setAccRoleSaaS] = useState<'tenant_admin' | 'chef_atelier' | 'couturier' | 'vendeur' | 'coupeur'>('couturier');
  const [accAccesActif, setAccAccesActif] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Recruitment Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    if (hasSystemAccess) {
      if (!email || !motDePasse) {
        alert('Veuillez renseigner un email et un mot de passe pour activer le compte d\'accès.');
        return;
      }
      // Check duplicate email in this tenant
      const isEmailDuplicate = employes.some(emp => emp.email?.toLowerCase() === email.toLowerCase());
      if (isEmailDuplicate) {
        alert('Cet email d\'accès est déjà utilisé par un autre utilisateur.');
        return;
      }
    }

    addEmploye({
      prenom,
      nom,
      role,
      specialite: specialite ? specialite.split(',').map(s => s.trim()) : ['Général'],
      telephone,
      statut: 'actif',
      ...(hasSystemAccess ? {
        email: email.trim().toLowerCase(),
        motDePasse,
        roleSaaS,
        accesActif: true,
        derniereConnexion: '—'
      } : {})
    });

    setIsModalOpen(false);
    setPrenom('');
    setNom('');
    setSpecialite('');
    setTelephone('');
    setHasSystemAccess(false);
    setEmail('');
    setMotDePasse('');
    setRoleSaaS('couturier');
  };

  const toggleStatut = (emp: Employe) => {
    updateEmploye({
      ...emp,
      statut: emp.statut === 'actif' ? 'inactif' : 'actif'
    });
  };

  const toggleAccesActif = (emp: Employe) => {
    updateEmploye({
      ...emp,
      accesActif: emp.accesActif === undefined ? true : !emp.accesActif
    });
  };

  const openAccountManagement = (emp: Employe) => {
    setSelectedEmp(emp);
    setAccEmail(emp.email || `${emp.prenom.toLowerCase()}.${emp.nom.toLowerCase()}@foxcouture.sn`);
    setAccPassword(emp.motDePasse || 'fox123');
    setAccRoleSaaS(emp.roleSaaS || (emp.role === 'chef_atelier' ? 'chef_atelier' : 'couturier'));
    setAccAccesActif(emp.accesActif !== false);
    setShowPassword(false);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    if (!accEmail || !accPassword) {
      alert('L\'email et le mot de passe sont requis.');
      return;
    }

    // Check duplicate email
    const duplicate = employes.some(emp => emp.id !== selectedEmp.id && emp.email?.toLowerCase() === accEmail.toLowerCase());
    if (duplicate) {
      alert('Cet email d\'accès est déjà associé à un autre membre de l\'équipe.');
      return;
    }

    updateEmploye({
      ...selectedEmp,
      email: accEmail.trim().toLowerCase(),
      motDePasse: accPassword,
      roleSaaS: accRoleSaaS,
      accesActif: accAccesActif
    });

    setIsAccountModalOpen(false);
    setSelectedEmp(null);
  };

  // Stats computation
  const totalStaff = employes.length;
  const activeStaff = employes.filter(e => e.statut === 'actif').length;
  const accountsCreated = employes.filter(e => e.email && e.motDePasse).length;
  const accountsBlocked = employes.filter(e => e.email && e.accesActif === false).length;

  return (
    <div className="space-y-6" id="personnel-roster-section">
      {/* Header and main actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-none border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-950 dark:text-atelier-gold" /> Équipe & Gestion des Utilisateurs
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Supervisez votre personnel d'atelier et contrôlez leurs droits d'accès à la plateforme</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-atelier-gold text-slate-950 border-2 border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <UserPlus className="h-4.5 w-4.5" /> Recruter un Tailleur
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Effectif Total</span>
            <span className="text-xl font-black font-mono tracking-tight text-slate-950 dark:text-white">{totalStaff} tailleurs</span>
          </div>
          <Users className="h-8 w-8 text-slate-300 dark:text-zinc-700" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Disponibles</span>
            <span className="text-xl font-black font-mono tracking-tight text-emerald-600">{activeStaff} actifs</span>
          </div>
          <Activity className="h-8 w-8 text-emerald-200 dark:text-emerald-900" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Comptes d'Accès</span>
            <span className="text-xl font-black font-mono tracking-tight text-indigo-600">{accountsCreated} comptes</span>
          </div>
          <Key className="h-8 w-8 text-indigo-200 dark:text-indigo-900" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Accès Bloqués</span>
            <span className="text-xl font-black font-mono tracking-tight text-rose-600">{accountsBlocked} bloqués</span>
          </div>
          <ShieldAlert className="h-8 w-8 text-rose-200 dark:text-rose-900" />
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b-2 border-black dark:border-zinc-800 gap-1">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-t-2 border-x-2 border-black dark:border-zinc-800 -mb-[2px] transition ${
            activeSubTab === 'employees'
              ? 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border-b-white dark:border-b-zinc-900 z-10'
              : 'bg-slate-100 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer border-b-black dark:border-b-zinc-800'
          }`}
        >
          👥 Membres de l'Équipe
        </button>
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-t-2 border-x-2 border-black dark:border-zinc-800 -mb-[2px] transition ${
            activeSubTab === 'accounts'
              ? 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border-b-white dark:border-b-zinc-900 z-10'
              : 'bg-slate-100 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer border-b-black dark:border-b-zinc-800'
          }`}
        >
          🔑 Comptes & Droits d'Accès
        </button>
      </div>

      {/* TAB 1: EMPLOYEES GRID */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employes.map(emp => {
            const isAtMaxLoad = emp.chargeTravail >= 5;
            const hasAccess = !!(emp.email && emp.motDePasse);

            return (
              <div key={emp.id} className="bg-white dark:bg-zinc-900 rounded-none p-5 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none flex flex-col justify-between transition">
                <div className="space-y-4">
                  {/* Header status */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-black dark:border-zinc-700 ${
                      emp.role === 'chef_atelier' ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200' :
                      emp.role === 'coupeur' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-950 dark:text-indigo-200' :
                      emp.role === 'couturier' ? 'bg-slate-100 dark:bg-zinc-800 text-slate-950 dark:text-zinc-200' :
                      'bg-slate-100 dark:bg-zinc-800 text-slate-700'
                    }`}>
                      {(emp.role || 'couturier').replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      {hasAccess && (
                        <span 
                          className="p-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-none" 
                          title="Possède un compte d'accès système"
                        >
                          <Key className="h-3 w-3" />
                        </span>
                      )}
                      <button
                        onClick={() => toggleStatut(emp)}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none border-2 transition cursor-pointer ${
                          emp.statut === 'actif' 
                            ? 'bg-emerald-400 text-slate-950 border-black dark:border-emerald-500 hover:bg-emerald-500' 
                            : 'bg-rose-500 text-white border-black dark:border-rose-600 hover:bg-rose-600'
                        }`}
                        title="Cliquer pour changer la disponibilité d'atelier"
                      >
                        {emp.statut === 'actif' ? '● ACTIF' : '○ ABSENT'}
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-none border-2 border-black flex items-center justify-center font-black uppercase font-display ${emp.avatarColor || 'bg-slate-300'}`}>
                      {emp.prenom[0]}{emp.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white font-display">
                        {emp.prenom} {emp.nom}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 flex items-center gap-1 font-mono uppercase">
                        <Tag className="h-3.5 w-3.5 text-black dark:text-atelier-gold" /> Spécialité : <span className="font-black text-slate-950 dark:text-zinc-200">{Array.isArray(emp.specialite) ? emp.specialite.join(', ') : emp.specialite}</span>
                      </p>
                    </div>
                  </div>

                  {/* Workload and tasks */}
                  <div className="bg-white dark:bg-zinc-950 p-3 rounded-none border-2 border-black dark:border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-600 dark:text-zinc-400 font-sans">Charge d'atelier :</span>
                      <span className={`font-mono font-black ${isAtMaxLoad ? 'text-rose-600' : 'text-slate-950 dark:text-zinc-100'}`}>
                        {emp.chargeTravail} en cours
                      </span>
                    </div>

                    <div className="h-3 w-full bg-slate-200 dark:bg-zinc-800 rounded-none border border-black dark:border-zinc-700 overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, (emp.chargeTravail / 6) * 100)}%` }} 
                        className={`h-full rounded-none transition-all duration-300 ${
                          isAtMaxLoad ? 'bg-rose-600' : 'bg-atelier-gold'
                        }`}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 dark:text-zinc-500 block">Capacité maximale conseillée : 5 confections</span>
                  </div>
                </div>

                {/* Bottom detail action */}
                <div className="mt-5 pt-4 border-t-2 border-black dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-400 font-mono">
                    <Phone className="h-3.5 w-3.5 text-black dark:text-zinc-350" />
                    <a href={`tel:${emp.telephone}`} className="hover:underline font-bold text-slate-950 dark:text-zinc-100">{emp.telephone}</a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openAccountManagement(emp)}
                      className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-zinc-700 text-[10px] font-black uppercase border border-black dark:border-zinc-700 transition cursor-pointer flex items-center gap-1"
                      title="Gérer les identifiants d'accès"
                    >
                      <Key className="h-3 w-3" /> Accès
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Retirer ${emp.prenom} ${emp.nom} de la liste du personnel ?`)) deleteEmploye(emp.id);
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none border border-transparent hover:border-black transition cursor-pointer"
                      title="Licencier / Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SYSTEM ACCOUNTS & ACCESS RIGHTS */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none overflow-x-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">Identifiants d'accès des Collaborateurs</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Attribuez un rôle logiciel (Administrateur, Chef ou Couturier) pour restreindre l'affichage selon le profil.</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black dark:border-zinc-800 font-mono text-slate-500 uppercase tracking-wider text-[10px] pb-3">
                <th className="py-3 px-2">Collaborateur</th>
                <th className="py-3 px-2">Adresse Email d'Accès</th>
                <th className="py-3 px-2">Rôle Logiciel</th>
                <th className="py-3 px-2">Dernière Connexion</th>
                <th className="py-3 px-2">Statut d'Accès</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {employes.map(emp => {
                const hasAccess = emp.email && emp.motDePasse;
                const isBlocked = emp.accesActif === false;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/40 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center font-black text-[11px] uppercase ${emp.avatarColor || 'bg-slate-300'}`}>
                          {emp.prenom[0]}{emp.nom[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-950 dark:text-white block">{emp.prenom} {emp.nom}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{(emp.role || 'couturier').replace('_', ' ')} d'Atelier</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-2">
                      {hasAccess ? (
                        <div className="flex items-center gap-1.5 font-mono text-slate-950 dark:text-zinc-100 font-black">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{emp.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600 italic">Aucun compte d'accès</span>
                      )}
                    </td>

                    {/* System role */}
                    <td className="py-4 px-2">
                      {hasAccess ? (
                        <span className={`px-2 py-0.5 border border-black dark:border-zinc-700 text-[9px] font-black uppercase tracking-widest ${
                          emp.roleSaaS === 'tenant_admin' ? 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200' :
                          emp.roleSaaS === 'chef_atelier' ? 'bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200' :
                          emp.roleSaaS === 'vendeur' ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200' :
                          emp.roleSaaS === 'coupeur' ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200' :
                          'bg-slate-100 text-slate-950 dark:bg-zinc-800 dark:text-zinc-200'
                        }`}>
                          {emp.roleSaaS === 'tenant_admin' ? 'Admin d\'Atelier' :
                           emp.roleSaaS === 'chef_atelier' ? 'Chef d\'Atelier' :
                           emp.roleSaaS === 'vendeur' ? 'Vendeur / Caissier' :
                           emp.roleSaaS === 'coupeur' ? 'Coupeur' :
                           'Couturier / Artisan'}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600 font-mono">—</span>
                      )}
                    </td>

                    {/* Last login */}
                    <td className="py-4 px-2 font-mono text-slate-600 dark:text-zinc-400 font-bold text-[11px]">
                      {hasAccess ? (emp.derniereConnexion || '—') : <span className="text-slate-400">—</span>}
                    </td>

                    {/* System active toggle status */}
                    <td className="py-4 px-2">
                      {hasAccess ? (
                        <button
                          onClick={() => toggleAccesActif(emp)}
                          className={`px-2.5 py-0.5 rounded-none border-2 font-black text-[9px] tracking-widest uppercase cursor-pointer transition ${
                            !isBlocked 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-400 hover:bg-emerald-200' 
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-400 hover:bg-rose-200'
                          }`}
                          title={isBlocked ? "Débloquer l'accès système" : "Bloquer l'accès système"}
                        >
                          {!isBlocked ? '✓ AUTORISÉ' : '✗ BLOQUÉ'}
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasAccess ? (
                          <>
                            <button
                              onClick={() => openAccountManagement(emp)}
                              className="px-2 py-1 border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-700 transition cursor-pointer text-[10px] font-black uppercase"
                              title="Modifier les identifiants de connexion"
                            >
                              Configurer
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer définitivement le compte d'accès système de ${emp.prenom} ${emp.nom} ? Les données d'atelier de l'employé seront préservées.`)) {
                                  updateEmploye({
                                    ...emp,
                                    email: undefined,
                                    motDePasse: undefined,
                                    roleSaaS: undefined,
                                    accesActif: undefined
                                  });
                                }
                              }}
                              className="p-1 border border-black dark:border-zinc-700 text-rose-600 hover:bg-rose-600 hover:text-white transition rounded-none cursor-pointer"
                              title="Retirer les droits de connexion"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAccountManagement(emp)}
                            className="px-2 py-1 bg-atelier-gold hover:bg-black text-slate-950 hover:text-white transition border border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Créer un Compte
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


      {/* MODAL 1: RECRUIT EMPLOYEE AND OPTIONAL SYSTEM ACCESS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-none max-w-lg w-full p-6 border-4 border-black dark:border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-black">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white font-display">
                Recruter un Membre d'Équipe
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs focus:outline-none"
                    placeholder="Abdoulaye"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Nom *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs focus:outline-none"
                    placeholder="Sarr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Rôle / Poste *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleEmploye)}
                  className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-0"
                >
                  <option value="couturier">Couturier d'Atelier</option>
                  <option value="coupeur">Coupeur de Patronages</option>
                  <option value="chef_atelier">Chef d'Atelier / Maître Tailleur</option>
                  <option value="vendeur">Vendeur / Caissier</option>
                  <option value="finisseur">Finisseur / Repasseur</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Spécialité / Matières</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs focus:outline-none"
                  placeholder="Ex: Broderie or, Costume 3 pièces, Soie"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Téléphone Portable *</label>
                <input
                  type="text"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs font-mono focus:outline-none"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              {/* Collapsible / Optional section: System User account */}
              <div className="pt-4 border-t-2 border-dashed border-black dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSystemAccess}
                    onChange={(e) => setHasSystemAccess(e.target.checked)}
                    className="w-4 h-4 text-atelier-gold accent-black cursor-pointer rounded-none border-2 border-black"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-atelier-gold" /> Créer un compte d'accès système
                  </span>
                </label>
                <p className="text-[10px] text-slate-500 ml-6 mt-1 leading-relaxed font-serif italic">Permet au tailleur de se connecter à l'application avec un accès restreint ou complet.</p>
              </div>

              {hasSystemAccess && (
                <div className="bg-white dark:bg-zinc-950 p-4 border-2 border-black dark:border-zinc-800 space-y-3 animate-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-400 block">Adresse Email de Connexion *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required={hasSystemAccess}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none"
                        placeholder="couturier@foxcouture.sn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-400 block">Mot de Passe *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required={hasSystemAccess}
                          value={motDePasse}
                          onChange={(e) => setMotDePasse(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none font-mono"
                          placeholder="Mot de passe"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-400 block">Niveau d'Accès / Rôle *</label>
                      <select
                        value={roleSaaS}
                        onChange={(e) => setRoleSaaS(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-0"
                      >
                        <option value="couturier">Couturier (Tâches & confection)</option>
                        <option value="coupeur">Coupeur (Découpe & patronages)</option>
                        <option value="vendeur">Vendeur / Caissier (POS & Facturation)</option>
                        <option value="chef_atelier">Chef d'Atelier (Gestion atelier)</option>
                        <option value="tenant_admin">Admin d'Atelier (Propriétaire / Tout voir)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-none border-2 border-black dark:border-zinc-700 text-slate-950 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-zinc-800 font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-xs transition cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 2: MANAGE USER ACCOUNT & CREDENTIALS DETAIL */}
      {isAccountModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-none max-w-sm w-full p-6 border-4 border-black dark:border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-black">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white flex items-center gap-1.5">
                <Key className="h-4.5 w-4.5 text-atelier-gold" /> Accès Système : {selectedEmp.prenom}
              </h3>
              <button 
                onClick={() => {
                  setIsAccountModalOpen(false);
                  setSelectedEmp(null);
                }} 
                className="text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="bg-amber-50 dark:bg-zinc-950 p-3 rounded-none border border-amber-300 dark:border-zinc-800 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center font-black text-xs uppercase ${selectedEmp.avatarColor || 'bg-slate-300'}`}>
                  {selectedEmp.prenom[0]}{selectedEmp.nom[0]}
                </div>
                <div>
                  <span className="font-bold text-[11px] text-slate-950 dark:text-white block">{selectedEmp.prenom} {selectedEmp.nom}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{(selectedEmp.role || 'couturier').replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Adresse Email d'Accès</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none"
                    placeholder="nom@foxcouture.sn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Mot de Passe Système</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={accPassword}
                    onChange={(e) => setAccPassword(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none pl-9 pr-10 py-2 text-xs focus:outline-none font-mono"
                    placeholder="Nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-black dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 block">Rôle / Droits Logiciel</label>
                <select
                  value={accRoleSaaS}
                  onChange={(e) => setAccRoleSaaS(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-950 text-slate-950 dark:text-white border-2 border-black dark:border-zinc-700 rounded-none px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none"
                >
                  <option value="couturier">Couturier (Tâches & confection)</option>
                  <option value="coupeur">Coupeur (Découpe & patronages)</option>
                  <option value="vendeur">Vendeur / Caissier (POS & Facturation)</option>
                  <option value="chef_atelier">Chef d'Atelier (Gestion atelier)</option>
                  <option value="tenant_admin">Admin d'Atelier (Propriétaire / Tout voir)</option>
                </select>
              </div>

              {/* Access authorized toggle status */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accAccesActif}
                    onChange={(e) => setAccAccesActif(e.target.checked)}
                    className="w-4 h-4 text-atelier-gold accent-black cursor-pointer rounded-none border-2 border-black"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                    Autoriser la connexion (Compte Actif)
                  </span>
                </label>
                <p className="text-[9px] text-slate-400 ml-6 mt-1 leading-relaxed">Si désactivé, l'utilisateur recevra un message d'erreur lors de sa tentative de connexion.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setSelectedEmp(null);
                  }}
                  className="flex-1 py-2 rounded-none border-2 border-black dark:border-zinc-700 text-slate-950 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-none bg-atelier-gold text-slate-950 border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-widest text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
