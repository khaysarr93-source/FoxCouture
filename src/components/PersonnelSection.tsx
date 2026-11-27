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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-200/60 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#191716] font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-[#F05A22]" /> Équipe & Gestion des Utilisateurs
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">Supervisez votre personnel d'atelier et contrôlez leurs droits d'accès à la plateforme</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-fox-primary text-xs"
          >
            <UserPlus className="h-4 w-4 stroke-[3]" /> Ajouter un Membre
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Effectif Total</span>
            <span className="text-2xl font-extrabold font-display tracking-tight text-[#191716]">{totalStaff}</span>
          </div>
          <Users className="h-7 w-7 text-stone-300" />
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Disponibles</span>
            <span className="text-2xl font-extrabold font-display tracking-tight text-emerald-600">{activeStaff}</span>
          </div>
          <Activity className="h-7 w-7 text-emerald-300" />
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Comptes d'Accès</span>
            <span className="text-2xl font-extrabold font-display tracking-tight text-indigo-600">{accountsCreated}</span>
          </div>
          <Key className="h-7 w-7 text-indigo-300" />
        </div>
        <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Accès Bloqués</span>
            <span className="text-2xl font-extrabold font-display tracking-tight text-rose-600">{accountsBlocked}</span>
          </div>
          <ShieldAlert className="h-7 w-7 text-rose-300" />
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex bg-white p-1 rounded-2xl border border-stone-200/60 shadow-xs max-w-md">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'employees'
              ? 'bg-[#191716] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Membres de l'équipe
        </button>
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'accounts'
              ? 'bg-[#191716] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Comptes & droits d'accès
        </button>
      </div>

      {/* TAB 1: EMPLOYEES GRID */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employes.map(emp => {
            const isAtMaxLoad = emp.chargeTravail >= 5;
            const hasAccess = !!(emp.email && emp.motDePasse);

            return (
              <div key={emp.id} className="card-fox rounded-3xl p-5 border border-stone-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-4">
                  {/* Header status */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      emp.role === 'chef_atelier' ? 'bg-amber-50 text-amber-800 border border-amber-200/60' :
                      emp.role === 'coupeur' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                      emp.role === 'couturier' ? 'bg-orange-50 text-[#F05A22] border border-orange-200/60' :
                      'bg-stone-100 text-stone-700 border border-stone-200/60'
                    }`}>
                      {(emp.role || 'couturier').replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      {hasAccess && (
                        <span 
                          className="p-1 bg-indigo-50 border border-indigo-200/60 text-indigo-700 rounded-lg" 
                          title="Possède un compte d'accès système"
                        >
                          <Key className="h-3 w-3" />
                        </span>
                      )}
                      <button
                        onClick={() => toggleStatut(emp)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                          emp.statut === 'actif' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Cliquer pour changer la disponibilité d'atelier"
                      >
                        {emp.statut === 'actif' ? '● Actif' : '○ Absent'}
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase ${emp.avatarColor || 'bg-stone-800'}`}>
                      {emp.prenom[0]}{emp.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {emp.prenom} {emp.nom}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 font-medium">
                        <Tag className="h-3.5 w-3.5 text-stone-400" /> Spécialité : <span className="font-semibold text-stone-700">{Array.isArray(emp.specialite) ? emp.specialite.join(', ') : emp.specialite}</span>
                      </p>
                    </div>
                  </div>

                  {/* Workload and tasks */}
                  <div className="bg-[#FBF8F3] p-3.5 rounded-2xl border border-stone-200/60 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-500">Charge d'atelier :</span>
                      <span className={`font-mono font-bold ${isAtMaxLoad ? 'text-rose-600' : 'text-stone-900'}`}>
                        {emp.chargeTravail} en cours
                      </span>
                    </div>

                    <div className="h-2 w-full bg-stone-200/70 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, (emp.chargeTravail / 6) * 100)}%` }} 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isAtMaxLoad ? 'bg-rose-500' : 'bg-[#F05A22]'
                        }`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 block">Capacité maximale conseillée : 5 confections</span>
                  </div>
                </div>

                {/* Bottom detail action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono">
                    <Phone className="h-3.5 w-3.5 text-[#F05A22]" />
                    <a href={`tel:${emp.telephone}`} className="hover:underline font-semibold text-stone-800">{emp.telephone}</a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openAccountManagement(emp)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Gérer les identifiants d'accès"
                    >
                      <Key className="h-3 w-3" /> Accès
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Retirer ${emp.prenom} ${emp.nom} de la liste du personnel ?`)) deleteEmploye(emp.id);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Supprimer"
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
        <div className="card-fox rounded-3xl border border-stone-200/70 shadow-xs p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Identifiants d'accès des collaborateurs</h3>
              <p className="text-xs text-stone-500 mt-0.5">Attribuez un rôle logiciel (Administrateur, Chef ou Couturier) pour restreindre l'affichage selon le profil.</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-xs font-semibold pb-3">
                <th className="py-3 px-3">Collaborateur</th>
                <th className="py-3 px-3">Adresse email d'accès</th>
                <th className="py-3 px-3">Rôle logiciel</th>
                <th className="py-3 px-3">Dernière connexion</th>
                <th className="py-3 px-3">Statut d'accès</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {employes.map(emp => {
                const hasAccess = emp.email && emp.motDePasse;
                const isBlocked = emp.accesActif === false;

                return (
                  <tr key={emp.id} className="hover:bg-[#FBF8F3]/60 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${emp.avatarColor || 'bg-stone-800'}`}>
                          {emp.prenom[0]}{emp.nom[0]}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{emp.prenom} {emp.nom}</span>
                          <span className="text-[11px] text-stone-400 capitalize">{(emp.role || 'couturier').replace('_', ' ')} d'atelier</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3">
                      {hasAccess ? (
                        <div className="flex items-center gap-1.5 font-mono text-stone-900 font-semibold">
                          <Mail className="h-3.5 w-3.5 text-stone-400" />
                          <span>{emp.email}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Aucun compte d'accès</span>
                      )}
                    </td>

                    {/* System role */}
                    <td className="py-3.5 px-3">
                      {hasAccess ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.roleSaaS === 'tenant_admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          emp.roleSaaS === 'chef_atelier' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          emp.roleSaaS === 'vendeur' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          emp.roleSaaS === 'coupeur' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {emp.roleSaaS === 'tenant_admin' ? 'Admin d\'Atelier' :
                           emp.roleSaaS === 'chef_atelier' ? 'Chef d\'Atelier' :
                           emp.roleSaaS === 'vendeur' ? 'Vendeur / Caissier' :
                           emp.roleSaaS === 'coupeur' ? 'Coupeur' :
                           'Couturier / Artisan'}
                        </span>
                      ) : (
                        <span className="text-stone-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Last login */}
                    <td className="py-3.5 px-3 font-mono text-stone-500 text-xs">
                      {hasAccess ? (emp.derniereConnexion || '—') : <span className="text-stone-400">—</span>}
                    </td>

                    {/* System active toggle status */}
                    <td className="py-3.5 px-3">
                      {hasAccess ? (
                        <button
                          onClick={() => toggleAccesActif(emp)}
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition ${
                            !isBlocked 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title={isBlocked ? "Débloquer l'accès système" : "Bloquer l'accès système"}
                        >
                          {!isBlocked ? '✓ Autorisé' : '✗ Bloqué'}
                        </button>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasAccess ? (
                          <>
                            <button
                              onClick={() => openAccountManagement(emp)}
                              className="px-2.5 py-1 border border-stone-200/80 bg-white hover:bg-stone-50 rounded-lg transition cursor-pointer text-xs font-semibold text-stone-700"
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
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Retirer les droits de connexion"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAccountManagement(emp)}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-[#F05A22] text-[#F05A22] hover:text-white transition rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Créer un compte
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
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card-fox rounded-3xl max-w-lg w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                Recruter un membre d'équipe
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="Abdoulaye"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">Nom *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="Sarr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Rôle / Poste *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleEmploye)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                >
                  <option value="couturier">Couturier d'Atelier</option>
                  <option value="coupeur">Coupeur de Patronages</option>
                  <option value="chef_atelier">Chef d'Atelier / Maître Tailleur</option>
                  <option value="vendeur">Vendeur / Caissier</option>
                  <option value="finisseur">Finisseur / Repasseur</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Spécialité / Matières</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="Ex: Broderie or, Costume 3 pièces, Soie"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Téléphone portable *</label>
                <input
                  type="text"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              {/* Collapsible / Optional section: System User account */}
              <div className="pt-3 border-t border-stone-200/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSystemAccess}
                    onChange={(e) => setHasSystemAccess(e.target.checked)}
                    className="w-4 h-4 accent-[#F05A22] cursor-pointer rounded"
                  />
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-[#F05A22]" /> Créer un compte d'accès système
                  </span>
                </label>
                <p className="text-[11px] text-stone-500 ml-6 mt-0.5 leading-relaxed">Permet au collaborateur de se connecter à l'application avec un accès restreint ou complet.</p>
              </div>

              {hasSystemAccess && (
                <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-stone-200/80 space-y-3 animate-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Adresse email de connexion *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        required={hasSystemAccess}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200/80 bg-white pl-10 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                        placeholder="couturier@foxcouture.sn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 block">Mot de passe *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                        <input
                          type="password"
                          required={hasSystemAccess}
                          value={motDePasse}
                          onChange={(e) => setMotDePasse(e.target.value)}
                          className="w-full rounded-xl border border-stone-200/80 bg-white pl-10 pr-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                          placeholder="Mot de passe"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 block">Niveau d'accès / Rôle *</label>
                      <select
                        value={roleSaaS}
                        onChange={(e) => setRoleSaaS(e.target.value as any)}
                        className="w-full rounded-xl border border-stone-200/80 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
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
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-fox-primary !py-2.5"
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
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-fox rounded-3xl max-w-sm w-full p-6 border border-stone-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Key className="h-4.5 w-4.5 text-[#F05A22]" /> Accès système : {selectedEmp.prenom}
              </h3>
              <button 
                onClick={() => {
                  setIsAccountModalOpen(false);
                  setSelectedEmp(null);
                }} 
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-stone-200/80 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${selectedEmp.avatarColor || 'bg-stone-800'}`}>
                  {selectedEmp.prenom[0]}{selectedEmp.nom[0]}
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">{selectedEmp.prenom} {selectedEmp.nom}</span>
                  <span className="text-[11px] text-stone-500 capitalize block">{(selectedEmp.role || 'couturier').replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Adresse email d'accès</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] pl-10 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="nom@foxcouture.sn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Mot de passe système</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={accPassword}
                    onChange={(e) => setAccPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] pl-10 pr-10 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
                    placeholder="Nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Rôle / Droits logiciel</label>
                <select
                  value={accRoleSaaS}
                  onChange={(e) => setAccRoleSaaS(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F05A22]/20 focus:border-[#F05A22]"
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
                    className="w-4 h-4 accent-[#F05A22] cursor-pointer rounded"
                  />
                  <span className="text-xs font-bold text-stone-800">
                    Autoriser la connexion (Compte actif)
                  </span>
                </label>
                <p className="text-[11px] text-stone-500 ml-6 mt-0.5 leading-relaxed">Si désactivé, l'utilisateur recevra un message d'erreur lors de sa tentative de connexion.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setSelectedEmp(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200/80 text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-fox-primary !py-2.5 flex items-center justify-center gap-1"
                >
                  <Check className="h-4 w-4" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
