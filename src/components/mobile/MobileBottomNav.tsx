import React from 'react';
import { Home, Users, Shirt, Package, BarChart2 } from 'lucide-react';

export type MobileTab = 'atelier' | 'clients' | 'catalogue' | 'stock' | 'stats';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'atelier' as MobileTab, label: 'Atelier', icon: Home },
    { id: 'clients' as MobileTab, label: 'Clients', icon: Users },
    { id: 'catalogue' as MobileTab, label: 'Catalogue', icon: Shirt },
    { id: 'stock' as MobileTab, label: 'Stock', icon: Package },
    { id: 'stats' as MobileTab, label: 'Stats', icon: BarChart2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-800 pb-safe transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'scale-110' : ''
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
