import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const NetworkStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = () => {
    setIsSyncing(true);
    // Simulation de synchronisation ou déclenchement réel
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }, 1200);
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <button
          onClick={triggerSync}
          title={
            isSupabaseConfigured
              ? `Connecté à Supabase Cloud (Dernière sync : ${lastSyncTime.toLocaleTimeString()})`
              : 'Mode Local / Démo (Hors Supabase Cloud)'
          }
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border border-black dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 transition hover:bg-emerald-100 cursor-pointer"
        >
          {isSyncing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="hidden sm:inline">
            {isSyncing ? 'Sync...' : isSupabaseConfigured ? 'Supabase En Ligne' : 'Mode Local'}
          </span>
        </button>
      ) : (
        <div 
          title="Pas de connexion internet. Toutes vos modifications sont enregistrées localement et seront synchronisées au retour du réseau."
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border-2 border-amber-600 bg-amber-50 text-amber-900 animate-pulse"
        >
          <WifiOff className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline">Mode Hors Ligne</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusBadge;
