/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Calendar, 
  Wallet, 
  Box, 
  UserCheck, 
  Settings, 
  Sparkles,
  Menu, 
  X, 
  Bell, 
  LogOut,
  Scissors,
  CheckCircle,
  AlertTriangle,
  Download,
  FileDown,
  FileUp,
  RefreshCw,
  Plus
} from 'lucide-react';

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
import PosCaisseSection from './components/PosCaisseSection';
import OnboardingModal from './components/OnboardingModal';
import FoxLogo from './components/FoxLogo';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export type ActiveTab = 
  | 'dashboard' 
  | 'clients' 
  | 'commandes' 
  | 'atelier' 
  | 'calendrier' 
  | 'pos_caisse'
  | 'stocks' 
  | 'factures' 
  | 'equipe' 
  | 'retouches' 
  | 'saas_subscription' 
  | 'saas_superadmin' 
  | 'settings';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  
  // Modal Onboarding (CDC Section 5)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fox_couture_onboarded') !== 'true';
    }
    return false;
  });

  // Session utilisateur
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

  const { 
    settings,
    notifications, 
    markAllNotificationsAsRead, 
    exportDatabase, 
    resetDatabase,
    tenants,
    currentTenantId,
    setCurrentTenantId,
    userRole,
    setUserRole
  } = useStore();

  const activeTenant = tenants.find(t => t.id === currentTenantId);
  const unreadNotifications = notifications.filter(n => !n.lue);

  // Calcul jours restants période d'essai (pour l'encart PLAN PRO de la sidebar)
  const today = new Date();
  const expDate = activeTenant ? new Date(activeTenant.dateExpiration) : today;
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const trialDaysDisplay = diffDays > 0 ? diffDays : 12;

  // Définition des items de menu de la sidebar (fidèle au PDF)
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients & mesures', icon: Users },
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag },
    { id: 'agenda', label: 'Agenda', icon: Calendar, targetTab: 'calendrier' as ActiveTab },
    { id: 'caisse', label: 'Caisse & paiements', icon: Wallet, targetTab: 'pos_caisse' as ActiveTab },
    { id: 'stock', label: 'Stock', icon: Box, targetTab: 'stocks' as ActiveTab },
    { id: 'equipe', label: 'Équipe', icon: UserCheck, targetTab: 'equipe' as ActiveTab },
  ];

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#191716] flex flex-col lg:flex-row font-sans">
      
      {/* ========================================================
          1. SIDEBAR SOMBRE (Desktop fixe & Mobile Drawer)
         ======================================================== */}
      
      {/* Overlay sombre pour mobile drawer */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
        />
      )}

      {/* Sidebar principale */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50
        w-64 bg-[#161412] text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Haut de la sidebar : Logo & Navigation */}
        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          {/* Logo officiel Fox Couture */}
          <div className="flex items-center justify-between">
            <FoxLogo size="md" lightText={true} />
            <button 
              onClick={() => setIsMobileDrawerOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu de navigation vertical officiel du PDF */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const target = item.targetTab || (item.id as ActiveTab);
              const isActive = activeTab === target || (item.id === 'commandes' && activeTab === 'atelier');
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(target)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#F05A22] text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bas de la sidebar : Encart PLAN PRO (Conforme au PDF) & Profil */}
        <div className="p-5 border-t border-stone-800/60 space-y-3">
          
          {/* Badge PLAN PRO comme sur le screenshot */}
          <div 
            onClick={() => handleNavigate('saas_subscription')}
            className="bg-[#231F1C] hover:bg-[#2C2723] transition-colors rounded-2xl p-4 border border-stone-800/80 cursor-pointer"
          >
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E5A855] font-display">
              PLAN PRO
            </div>
            <div className="text-xs text-stone-300 font-medium mt-1 leading-snug">
              Essai gratuit : {trialDaysDisplay} jours restants
            </div>
          </div>

          {/* Accès rapide aux Paramètres & Déconnexion */}
          <div className="flex items-center justify-between pt-1 px-1">
            <button
              onClick={() => handleNavigate('settings')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'settings' ? 'text-[#F05A22]' : 'text-stone-400 hover:text-white'
              }`}
              title="Paramètres de l'Atelier"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-stone-500 hover:text-rose-400 p-2 rounded-xl transition"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* ========================================================
          2. ZONE DE CONTENU PRINCIPALE (Responsive)
         ======================================================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Topbar compacte (Mobile / Tablette / Notifications) */}
        <header className="sticky top-0 z-30 bg-[#FBF8F3]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-stone-200/40">
          
          {/* Gauche : Bouton menu burger sur mobile/tablette */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-stone-200/60 shadow-xs text-stone-800 hover:bg-stone-50 cursor-pointer"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Atelier actif selector (discret et propre) */}
            <div className="hidden sm:flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200/60 text-xs font-medium text-stone-700">
              <span className="w-2 h-2 rounded-full bg-[#F05A22]"></span>
              <span className="font-bold text-[#191716]">{activeTenant?.raisonSociale || settings.raisonSociale}</span>
              <span className="text-stone-400">·</span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">{userRole}</span>
            </div>
          </div>

          {/* Droite : Notifications & Actions système */}
          <div className="flex items-center gap-2.5">
            
            {/* Cloche de notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="w-10 h-10 rounded-full bg-white border border-stone-200/60 shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-50 transition relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F05A22]"></span>
                )}
              </button>

              {/* Dropdown notifications */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200/70 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="text-xs font-bold text-[#191716]">Alertes ({unreadNotifications.length})</span>
                    {unreadNotifications.length > 0 && (
                      <button 
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] font-semibold text-[#F05A22] hover:underline cursor-pointer"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-stone-50 text-xs space-y-1">
                          <p className="font-bold text-stone-900">{n.titre}</p>
                          <p className="text-stone-600 text-[11px]">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 text-center py-4">Aucune nouvelle alerte</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guide d'accueil Atelier */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200/60 shadow-xs text-xs font-bold text-stone-800 hover:bg-stone-50 cursor-pointer"
              title="Guide d'accueil"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F05A22]" />
              <span>Guide d'accueil</span>
            </button>

          </div>
        </header>

        {/* Contenu principal de la page sélectionnée */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  setActiveTab={(tab: string) => handleNavigate(tab as ActiveTab)} 
                  onNewOrder={() => handleNavigate('commandes')}
                />
              )}
              {activeTab === 'clients' && <ClientSection />}
              {activeTab === 'commandes' && <OrderSection />}
              {activeTab === 'atelier' && <AtelierSection />}
              {activeTab === 'calendrier' && <CalendarSection />}
              {activeTab === 'pos_caisse' && <PosCaisseSection />}
              {activeTab === 'stocks' && <StockSection />}
              {activeTab === 'factures' && <BillingSection />}
              {activeTab === 'equipe' && <PersonnelSection />}
              {activeTab === 'retouches' && <RetoucheSection />}
              {activeTab === 'saas_subscription' && <SubscriptionSection />}
              {activeTab === 'saas_superadmin' && <SuperAdminSection />}
              {activeTab === 'settings' && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modal d'onboarding en 3 étapes */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />

        {/* Invite d'installation PWA native */}
        <PWAInstallPrompt />

        {/* ========================================================
            3. BARRE DE NAVIGATION INFÉRIEURE MOBILE (Bottom Bar)
           ======================================================== */}
        <nav className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
          {[
            { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
            { id: 'commandes', label: 'Commandes', icon: ShoppingBag },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'pos_caisse', label: 'Caisse', icon: Wallet },
            { id: 'settings', label: 'Paramètres', icon: Settings },
          ].map((nav) => {
            const isActive = activeTab === nav.id;
            const Icon = nav.icon;
            return (
              <button
                key={nav.id}
                onClick={() => handleNavigate(nav.id as ActiveTab)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-[#F05A22] font-bold' : 'text-stone-400 hover:text-stone-700 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px]">{nav.label}</span>
              </button>
            );
          })}
        </nav>

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
