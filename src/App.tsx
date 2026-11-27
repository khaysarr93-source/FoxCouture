/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  UserCheck, 
  Cpu, 
  Calendar, 
  Database, 
  FileText, 
  Users, 
  Wrench, 
  LayoutDashboard,
  Bell,
  Settings,
  Menu,
  X,
  FileDown,
  FileUp,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Store,
  BarChart2
} from 'lucide-react';

// Sub workspaces
import Dashboard from './components/Dashboard';
import ClientSection from './components/ClientSection';
import OrderSection from './components/OrderSection';
import AtelierSection from './components/AtelierSection';
import CalendarSection from './components/CalendarSection';
import StockSection from './components/StockSection';
import BillingSection from './components/BillingSection';
import PersonnelSection from './components/PersonnelSection';
import RetoucheSection from './components/RetoucheSection';
import SubscriptionSection from './components/SubscriptionSection';
import SuperAdminSection from './components/SuperAdminSection';
import SettingsSection from './components/SettingsSection';
import LoginScreen from './components/LoginScreen';
import FoxMascot from './components/FoxMascot';
import PosCaisseSection from './components/PosCaisseSection';
import { MobileStatsSection } from './components/mobile/MobileStatsSection';
import { MobileAtelierSection } from './components/mobile/MobileAtelierSection';
import { MobileOrderDetailModal } from './components/mobile/MobileOrderDetailModal';
import { MobileBottomNav, MobileTab } from './components/mobile/MobileBottomNav';
import { Smartphone, Monitor } from 'lucide-react';
import { Commande } from './types';
import NetworkStatusBadge from './components/NetworkStatusBadge';

type ActiveTab = 
  | 'dashboard' 
  | 'clients' 
  | 'commandes' 
  | 'atelier' 
  | 'calendrier' 
  | 'stocks' 
  | 'factures' 
  | 'pos_caisse' 
  | 'stats'
  | 'equipe' 
  | 'retouches' 
  | 'saas_subscription' 
  | 'saas_superadmin' 
  | 'settings';

function MainAppContent() {
  const { deleteCommande } = useStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileTab, setMobileTab] = useState<MobileTab>('atelier');
  const [selectedCommandeForModal, setSelectedCommandeForModal] = useState<Commande | null>(null);
  const [isMobileModeForced, setIsMobileModeForced] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fox_couture_mobile_mode');
      if (stored !== null) return stored === 'true';
      return window.innerWidth < 1024;
    }
    return false;
  });

  const toggleMobileMode = (forcedState?: boolean) => {
    const nextState = forcedState !== undefined ? forcedState : !isMobileModeForced;
    setIsMobileModeForced(nextState);
    localStorage.setItem('fox_couture_mobile_mode', String(nextState));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

  // Active logged-in user session
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const stored = localStorage.getItem('fox_couture_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('fox_couture_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fox_couture_current_user');
    setUserRole('couturier');
    setActiveTab('dashboard');
  };

  // Theme states & clock telemetry
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fox_couture_darkmode') === 'true';
  });
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fox_couture_darkmode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFrenchDate = (date: Date) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${dayName} ${dayNum} ${monthName} ${year} — ${hours}:${minutes}:${seconds}`;
  };

  const { 
    settings,
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    exportDatabase, 
    importDatabase, 
    resetDatabase,
    tenants,
    currentTenantId,
    setCurrentTenantId,
    userRole,
    setUserRole
  } = useStore();

  const activeTenant = tenants.find(t => t.id === currentTenantId);
  const unreadNotifications = notifications.filter(n => !n.lue);

  // Expiration and trial check for SaaS Multi-tenant
  const today = new Date();
  const expDate = activeTenant ? new Date(activeTenant.dateExpiration) : today;
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpired = activeTenant ? (diffDays <= 0 && activeTenant.statut !== 'actif') : false;
  const isRestricted = activeTenant ? (activeTenant.statut === 'suspendu' || activeTenant.statut === 'resilie' || isExpired) : false;

  const [trialTimeLeft, setTrialTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!activeTenant || activeTenant.statut !== 'essai') {
      setTrialTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      // Parse expiration date as end-of-day YYYY-MM-DD 23:59:59 to give users the full last day of their trial
      const expiry = new Date(`${activeTenant.dateExpiration}T23:59:59`);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTrialTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTrialTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeTenant]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importDatabase(text);
      if (success) {
        alert('Base de données Fox Couture importée avec succès ! Rafraîchissement automatique.');
        window.location.reload();
      } else {
        alert('Fichier invalide. Veuillez importer un fichier JSON de sauvegarde Fox Couture valide.');
      }
    };
    reader.readAsText(file);
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTo?.tab) {
      setActiveTab(notif.linkTo.tab as ActiveTab);
    }
    setIsNotifDropdownOpen(false);
  };

  // Build menu items list dynamically based on role (Section 3 of specs)
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="h-5 w-5" />, color: 'group-hover:text-amber-500' },
  ];

  if (userRole !== 'couturier') {
    menuItems.push(
      { id: 'pos_caisse', label: 'Caisse & Ventes POS', icon: <Store className="h-5 w-5" />, color: 'group-hover:text-amber-500' }
    );
  }

  menuItems.push(
    { id: 'clients', label: 'Clients & Mesures', icon: <UserCheck className="h-5 w-5" />, color: 'group-hover:text-emerald-500' },
    { id: 'commandes', label: 'Commandes Atelier', icon: <Scissors className="h-5 w-5" />, color: 'group-hover:text-rose-500' },
    { id: 'atelier', label: 'Suivi de Production', icon: <Cpu className="h-5 w-5" />, color: 'group-hover:text-indigo-500' },
    { id: 'calendrier', label: 'Agenda des Essayages', icon: <Calendar className="h-5 w-5" />, color: 'group-hover:text-amber-500' },
    { id: 'stocks', label: 'Tissus & Fournitures', icon: <Database className="h-5 w-5" />, color: 'group-hover:text-blue-500' }
  );

  if (userRole !== 'couturier') {
    menuItems.push(
      { id: 'stats', label: 'Stats & Analyses 📊', icon: <BarChart2 className="h-5 w-5" />, color: 'group-hover:text-blue-500' },
      { id: 'factures', label: 'Règlements & Factures', icon: <FileText className="h-5 w-5" />, color: 'group-hover:text-teal-500' },
      { id: 'equipe', label: 'Équipe & Couturiers', icon: <Users className="h-5 w-5" />, color: 'group-hover:text-pink-500' },
      { id: 'retouches', label: 'SAV & Retouches', icon: <Wrench className="h-5 w-5" />, color: 'group-hover:text-purple-500' }
    );
  }

  if (userRole === 'tenant_admin' || userRole === 'super_admin') {
    menuItems.push(
      { id: 'saas_subscription', label: 'Mon Abonnement 💳', icon: <Sparkles className="h-5 w-5" />, color: 'group-hover:text-atelier-gold' },
      { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" />, color: 'group-hover:text-zinc-400' }
    );
  }

  if (userRole === 'super_admin') {
    menuItems.push(
      { id: 'saas_superadmin', label: 'Supervision SaaS 🌐', icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, color: 'group-hover:text-emerald-500' }
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // ========================================================
  // VUE MOBILE-FIRST TAILOR SHOP SÉNÉGAL (CONFORME MAQUETTE)
  // ========================================================
  if (isMobileModeForced) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans selection:bg-blue-600 selection:text-white">
        {/* Barre de retour vers le mode bureau (visible sur grand écran) */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-slate-900 text-white text-xs font-bold shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Simulateur Mobile Tailor Shop Sénégal (Maquette Conforme)</span>
          </div>
          <button
            onClick={() => toggleMobileMode(false)}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Basculer en vue Bureau ERP</span>
          </button>
        </div>

        {/* Conteneur Mobile centré façon smartphone */}
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-zinc-950 shadow-2xl relative border-x border-slate-200/80 dark:border-zinc-800">
          {mobileTab === 'atelier' && (
            <MobileAtelierSection 
              onSelectCommande={(c) => setSelectedCommandeForModal(c)}
              onSelectClient={() => setMobileTab('clients')}
              onNavigateToTab={(t) => setMobileTab(t as MobileTab)}
            />
          )}

          {mobileTab === 'clients' && (
            <div className="p-4 pb-28">
              <ClientSection />
            </div>
          )}

          {mobileTab === 'catalogue' && (
            <div className="p-4 pb-28">
              <OrderSection onSelectCommande={(c: any) => setSelectedCommandeForModal(c)} />
            </div>
          )}

          {mobileTab === 'stock' && (
            <div className="p-4 pb-28">
              <StockSection />
            </div>
          )}

          {mobileTab === 'stats' && (
            <MobileStatsSection onBack={() => setMobileTab('atelier')} />
          )}

          {/* Barre de navigation inférieure fixe */}
          <MobileBottomNav activeTab={mobileTab} onSelectTab={(t) => setMobileTab(t)} />
        </div>

        {/* Modal de détail de commande */}
        {selectedCommandeForModal && (
          <MobileOrderDetailModal
            commande={selectedCommandeForModal}
            onClose={() => setSelectedCommandeForModal(null)}
            onDeleteCommande={(id) => deleteCommande(id)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atelier-cream text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-atelier-gold selection:text-slate-900 transition-colors duration-300">
      
      {/* Top Telemetry Header Bar */}
      <header className="bg-white border-b-2 border-black dark:border-zinc-800 h-20 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
          {/* Mobile burger toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 lg:hidden rounded-none text-slate-950 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer border border-black dark:border-zinc-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo Brand with Fox Mascot */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-zinc-950 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,122,26,1)] rounded-none shrink-0">
              <FoxMascot size="sm" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-display font-black text-xs sm:text-base lg:text-xl tracking-tight text-black dark:text-white uppercase whitespace-nowrap leading-tight">
                {settings.raisonSociale.split(' ')[0]} <span className="text-atelier-gold ml-1">{settings.raisonSociale.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="hidden sm:block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-400 whitespace-nowrap leading-none mt-0.5">
                {settings.slogan}
              </p>
            </div>
          </div>

          {/* Real-time Telemetry Clock */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-black dark:border-zinc-800 px-3 py-1.5 font-mono">
            <Clock className="h-3.5 w-3.5 text-atelier-gold animate-pulse" />
            <span>{formatFrenchDate(currentTime)}</span>
          </div>
        </div>

        {/* User alerts & data actions */}
        <div className="flex items-center gap-3">
          
          {/* Indicateur Réseau & Sync Supabase */}
          <NetworkStatusBadge />

          {/* MOBILE APP MODE TOGGLE (Maquette Sénégal) */}
          <button 
            onClick={() => toggleMobileMode()}
            title={isMobileModeForced ? 'Retour Vue Bureau' : 'Activer Vue Mobile Maquette'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer border border-blue-200 dark:border-blue-800 text-xs font-bold"
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden md:inline">Vue Mobile Maquette</span>
          </button>

          {/* THEME TOGGLE */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Mode Clair' : 'Mode Nuit'}
            className="p-2.5 rounded-none bg-slate-50 text-slate-950 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border border-black flex items-center justify-center"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-950" />
            )}
          </button>

          {/* NOTIFICATION HUB */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                setIsSettingsDropdownOpen(false);
              }}
              className="p-2.5 rounded-none bg-white text-black hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition relative cursor-pointer border border-black"
            >
              <Bell className="h-5 w-5 text-black dark:text-white" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 border-2 border-white rounded-full"></span>
              )}
            </button>

            {/* Notification Dropdown List */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-none border-2 border-black p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-150 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-950">Alertes ({unreadNotifications.length})</span>
                  {unreadNotifications.length > 0 && (
                    <button 
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[9px] font-black uppercase tracking-widest text-slate-950 hover:underline cursor-pointer"
                    >
                      Tout lire
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-none border-2 border-black text-xs cursor-pointer transition flex items-start gap-2.5 ${
                          notif.lue ? 'bg-slate-50 text-slate-500' : 'bg-atelier-beige text-slate-950 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 border border-black mt-1.5 flex-shrink-0 ${
                          notif.type === 'stock' ? 'bg-rose-600' : 'bg-atelier-gold'
                        }`}></span>
                        <div>
                          <p className="font-black uppercase tracking-wider text-[10px] text-slate-950">{notif.titre}</p>
                          <p className="mt-1 leading-relaxed text-[11px] text-slate-700">{notif.message}</p>
                          <span className="text-[9px] text-slate-500 block mt-1 font-mono uppercase font-black">
                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <p className="text-xs font-black uppercase tracking-widest">Aucune alerte active</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BACKUP & SYSTEM ACTIONS */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
                setIsNotifDropdownOpen(false);
              }}
              className="p-2.5 rounded-none bg-black text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer text-xs font-black uppercase tracking-widest border border-black"
            >
              <Settings className="h-4.5 w-4.5 text-atelier-gold" />
              <span className="hidden sm:inline">Administration</span>
            </button>

            {isSettingsDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-none border-2 border-black p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-150 space-y-2.5 text-xs font-semibold">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Configurations & Actions</span>
                
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsSettingsDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 bg-amber-50 hover:bg-atelier-beige rounded-none transition flex items-center gap-2 cursor-pointer text-slate-950 font-black uppercase tracking-wider border border-black text-[10px]"
                >
                  <Settings className="h-4 w-4 text-slate-950" />
                  Paramètres de l'Atelier ⚙️
                </button>

                <hr className="border-black my-1" />

                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Sauvegarde & Restauration</span>
                
                <button
                  onClick={() => {
                    exportDatabase();
                    setIsSettingsDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-none transition flex items-center gap-2 cursor-pointer text-slate-900 font-bold"
                >
                  <FileDown className="h-4 w-4 text-slate-500" />
                  Exporter Base (JSON)
                </button>

                <label className="w-full text-left p-2.5 hover:bg-slate-50 rounded-none transition flex items-center gap-2 cursor-pointer text-slate-900 font-bold">
                  <FileUp className="h-4 w-4 text-slate-500" />
                  <span>Importer Base (JSON)</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportFile}
                    className="hidden" 
                  />
                </label>

                <hr className="border-black my-1" />

                <button
                  onClick={() => {
                    resetDatabase();
                    setIsSettingsDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 rounded-none transition flex items-center gap-2 cursor-pointer text-rose-600 font-bold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Données de démo (Reset)
                </button>

                <hr className="border-black dark:border-zinc-800 my-1.5" />

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-black/10 rounded-none flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-none border border-black dark:border-zinc-700 bg-atelier-gold text-slate-950 flex items-center justify-center font-black text-xs uppercase">
                    {currentUser.prenom[0]}{currentUser.nom[0]}
                  </div>
                  <div className="leading-tight overflow-hidden">
                    <span className="font-bold text-[11px] text-slate-950 dark:text-zinc-100 block truncate">{currentUser.prenom} {currentUser.nom}</span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-black">Role: {userRole}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsSettingsDropdownOpen(false);
                  }}
                  className="w-full text-left p-2.5 bg-rose-600 text-white hover:bg-black dark:hover:bg-zinc-800 rounded-none transition flex items-center gap-2 cursor-pointer font-bold border border-black"
                >
                  <X className="h-4 w-4 text-white" />
                  Se Déconnecter
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Multi-tenant SaaS Utility Switcher Bar (Section 3 of specs) */}
      <div className="bg-white border-b-2 border-black dark:border-zinc-800 px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-atelier-gold text-slate-950 font-black text-[9px] uppercase tracking-widest border border-black">
            SaaS Multi-Société
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-black dark:text-zinc-350">Atelier / Société :</span>
            <select
              value={currentTenantId}
              onChange={(e) => setCurrentTenantId(e.target.value)}
              className="bg-white dark:bg-zinc-950 border border-black dark:border-zinc-700 px-2 py-1 rounded-none font-black text-slate-950 dark:text-zinc-100 cursor-pointer text-xs"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.raisonSociale} ({t.statut.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-black dark:text-zinc-350">Rôle :</span>
            <select
              value={userRole}
              onChange={(e) => {
                const role = e.target.value as any;
                setUserRole(role);
                if (role === 'super_admin') {
                  setActiveTab('saas_superadmin');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              className="bg-white dark:bg-zinc-950 border border-black dark:border-zinc-700 px-2 py-1 rounded-none font-black text-slate-950 dark:text-zinc-100 cursor-pointer text-xs"
            >
              <option value="tenant_admin">Administrateur d'Atelier</option>
              <option value="super_admin">Super-Administrateur SaaS</option>
              <option value="couturier">Couturier / Personnel</option>
            </select>
          </div>

          {activeTenant && (
            <span className={`px-2.5 py-0.5 border border-black text-[9px] font-black uppercase tracking-widest ${
              activeTenant.statut === 'actif' ? 'bg-emerald-100 text-emerald-800' :
              activeTenant.statut === 'essai' ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800 font-bold animate-pulse'
            }`}>
              Statut : {activeTenant.statut}
            </span>
          )}
        </div>
      </div>

      {/* Main Layout body */}
      <div className="flex-1 flex relative">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:block w-72 bg-white border-r-2 border-black dark:border-zinc-800 p-6 space-y-8 flex-shrink-0 text-slate-900 dark:text-white sticky top-20 h-[calc(100vh-80px)] overflow-y-auto sidebar-scroll transition-colors duration-300">
          
          {/* Quick Stats banner */}
          <div className="bg-slate-50 dark:bg-zinc-950 rounded-none p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-zinc-500 block">Performance mensuelle</span>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-atelier-gold text-slate-950 rounded-none font-black text-sm italic border border-black dark:border-transparent">
                98%
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-xs uppercase tracking-tight">Taux de Ponctualité</span>
                <span className="text-[10px] text-black dark:text-zinc-400 leading-none">Commandes livrées à l'heure</span>
              </div>
            </div>
          </div>

          {/* Trial countdown timer inside Sidebar */}
          {activeTenant && activeTenant.statut === 'essai' && trialTimeLeft && (
            <div className="bg-slate-50 dark:bg-zinc-950 rounded-none p-4 border-2 border-amber-500 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-300"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 block animate-pulse">⏰ Temps d'essai restant</span>
              
              {/* Dynamic countdown grids */}
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-white dark:bg-zinc-900 p-1.5 border border-slate-200 dark:border-zinc-800">
                  <span className="block text-sm font-black font-mono text-slate-950 dark:text-white">{trialTimeLeft.days}</span>
                  <span className="text-[7px] text-black dark:text-zinc-500 uppercase tracking-tight font-bold">Jours</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-1.5 border border-slate-200 dark:border-zinc-800">
                  <span className="block text-sm font-black font-mono text-amber-500 dark:text-amber-400">{String(trialTimeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[7px] text-black dark:text-zinc-500 uppercase tracking-tight font-bold">Heures</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-1.5 border border-slate-200 dark:border-zinc-800">
                  <span className="block text-sm font-black font-mono text-amber-500 dark:text-amber-400">{String(trialTimeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[7px] text-black dark:text-zinc-500 uppercase tracking-tight font-bold">Min</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-1.5 border border-slate-200 dark:border-zinc-800">
                  <span className="block text-sm font-black font-mono text-amber-500 animate-pulse">{String(trialTimeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[7px] text-black dark:text-zinc-500 uppercase tracking-tight font-bold">Sec</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('saas_subscription')}
                className="w-full py-1.5 bg-amber-500 hover:bg-black hover:text-white text-black font-black uppercase text-[9px] tracking-widest border border-black cursor-pointer transition-colors"
              >
                S'abonner maintenant 💳
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-zinc-500 block px-3 mb-2">Espaces de travail</span>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition group cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-atelier-gold text-black border border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none' 
                    : 'text-black dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-atelier-gold dark:hover:text-atelier-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${activeTab === item.id ? 'text-black' : 'text-atelier-gold dark:text-atelier-gold group-hover:text-black dark:group-hover:text-white'} transition`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === item.id ? 'translate-x-0.5 text-black' : 'opacity-0 group-hover:opacity-100 text-black dark:text-zinc-500'}`} />
              </button>
            ))}
          </nav>

          {/* Footer of sidebar */}
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-900 text-[10px] text-black dark:text-zinc-500 text-center font-mono font-medium">
            Atelier Fox Couture © 2026
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay background */}
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
              />
              
              {/* Drawer panel */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-80 bg-white text-slate-900 dark:text-white p-6 z-50 lg:hidden flex flex-col justify-between overflow-y-auto sidebar-scroll border-r border-slate-200 dark:border-zinc-900 transition-colors duration-300"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-zinc-900">
                    <span className="font-display font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">
                      FOX <span className="text-atelier-gold">COUTURE</span>
                    </span>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white rounded-none cursor-pointer border border-slate-200 dark:border-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile Trial Countdown */}
                  {activeTenant && activeTenant.statut === 'essai' && trialTimeLeft && (
                    <div className="bg-slate-50 dark:bg-zinc-950 rounded-none p-3.5 border border-amber-500 space-y-2.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 block animate-pulse">⏰ Temps d'essai restant</span>
                      
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div className="bg-white dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-xs font-black font-mono text-slate-950 dark:text-white">{trialTimeLeft.days}</span>
                          <span className="text-[6px] text-black dark:text-zinc-500 uppercase font-bold">Jours</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-xs font-black font-mono text-amber-500 dark:text-amber-400">{String(trialTimeLeft.hours).padStart(2, '0')}</span>
                          <span className="text-[6px] text-black dark:text-zinc-500 uppercase font-bold">Heures</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-xs font-black font-mono text-amber-500 dark:text-amber-400">{String(trialTimeLeft.minutes).padStart(2, '0')}</span>
                          <span className="text-[6px] text-black dark:text-zinc-500 uppercase font-bold">Min</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-xs font-black font-mono text-amber-500 animate-pulse">{String(trialTimeLeft.seconds).padStart(2, '0')}</span>
                          <span className="text-[6px] text-black dark:text-zinc-500 uppercase font-bold">Sec</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('saas_subscription');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-1 bg-amber-500 hover:bg-black hover:text-white text-black font-black uppercase text-[8px] tracking-widest border border-black cursor-pointer text-center"
                      >
                        S'abonner maintenant 💳
                      </button>
                    </div>
                  )}

                  <nav className="space-y-1">
                    {menuItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition cursor-pointer ${
                          activeTab === item.id 
                            ? 'bg-atelier-gold text-black border border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none' 
                            : 'text-black dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-atelier-gold dark:hover:text-atelier-gold'
                        }`}
                      >
                        <span className={activeTab === item.id ? 'text-black' : 'text-atelier-gold dark:text-atelier-gold'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="text-[10px] text-black dark:text-zinc-500 font-mono text-center border-t border-slate-200 dark:border-zinc-900 pt-4">
                  Fox Couture Administration © 2026
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ACTIVE WORKSPACE AREA */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden overflow-y-auto max-w-[1400px] mx-auto w-full space-y-6">
          
          {activeTenant && activeTenant.statut === 'essai' && activeTab !== 'saas_subscription' && activeTab !== 'saas_superadmin' && (
            <div className="bg-white dark:bg-zinc-900 border-2 border-amber-500 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 uppercase text-[10px] tracking-wider">Période d'essai gratuit active 🚀</h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-serif mt-0.5 leading-relaxed">
                    Il vous reste exactement <strong className="font-mono text-amber-600 dark:text-amber-400 font-black text-sm">{trialTimeLeft ? `${trialTimeLeft.days}j ${String(trialTimeLeft.hours).padStart(2, '0')}h ${String(trialTimeLeft.minutes).padStart(2, '0')}m ${String(trialTimeLeft.seconds).padStart(2, '0')}s` : `${diffDays} jours`}</strong> (votre essai de 15 jours expire le {activeTenant.dateExpiration.split('-').reverse().join('/')}). Profitez de l'accès complet pour propulser votre atelier de confection.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('saas_subscription')}
                className="px-4 py-1.5 bg-amber-500 hover:bg-black text-slate-950 hover:text-white font-black uppercase text-[10px] tracking-widest border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                S'abonner maintenant 💳
              </button>
            </div>
          )}

          {isRestricted && activeTenant && activeTab !== 'saas_subscription' && activeTab !== 'saas_superadmin' && (
            <div className="bg-white dark:bg-zinc-900 border-2 border-rose-600 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-rose-600 flex-shrink-0" />
                <div>
                  <h4 className="font-black text-rose-950 uppercase text-[11px] tracking-wider">Accès Restreint (Mode Lecture Seule Actif)</h4>
                  <p className="text-[11px] text-rose-800 font-serif mt-0.5 leading-relaxed">
                    L'abonnement de votre maison <strong>{activeTenant.raisonSociale}</strong> est actuellement {activeTenant.statut === 'suspendu' ? 'suspendu pour défaut de paiement' : activeTenant.statut === 'resilie' ? 'résilié' : 'expiré'}.
                    Veuillez régulariser votre compte pour retrouver toutes les fonctionnalités d'écriture.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('saas_subscription')}
                className="px-4 py-2 bg-rose-600 hover:bg-black text-white hover:text-white font-black uppercase text-[10px] tracking-widest border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
              >
                Régulariser mon compte 💳
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard setActiveTab={(tab: any) => setActiveTab(tab as ActiveTab)} />}
              {activeTab === 'clients' && <ClientSection />}
              {activeTab === 'commandes' && <OrderSection />}
              {activeTab === 'atelier' && <AtelierSection />}
              {activeTab === 'calendrier' && <CalendarSection />}
              {activeTab === 'stocks' && <StockSection />}
              {activeTab === 'stats' && <MobileStatsSection onBack={() => setActiveTab('dashboard')} />}
              {activeTab === 'factures' && <BillingSection />}
              {activeTab === 'pos_caisse' && <PosCaisseSection />}
              {activeTab === 'equipe' && <PersonnelSection />}
              {activeTab === 'retouches' && <RetoucheSection />}
              {activeTab === 'saas_subscription' && <SubscriptionSection />}
              {activeTab === 'saas_superadmin' && <SuperAdminSection />}
              {activeTab === 'settings' && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
