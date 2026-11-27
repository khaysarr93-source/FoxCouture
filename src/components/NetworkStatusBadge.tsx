import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { testSupabaseConnection } from '../lib/sync';

export const NetworkStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

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

    // Initial test if Supabase is configured
    if (isSupabaseConfigured) {
      testSupabaseConnection().then(res => {
        setSyncStatus(res.connected ? 'Connecté' : 'Hors-ligne');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await testSupabaseConnection();
      setSyncStatus(res.connected ? 'Connecté' : 'Erreur');
    } catch {
      setSyncStatus('Erreur');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 800);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <button
          onClick={triggerSync}
          title={
            isSupabaseConfigured
              ? 'Connecté à Supabase Cloud. Cliquez pour synchroniser.'
              : 'Mode Local / Démo'
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer ${
            isSupabaseConfigured
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80'
              : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          ) : isSupabaseConfigured ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <Wifi className="h-3.5 w-3.5 text-stone-500" />
          )}
          <span className="hidden sm:inline">
            {isSyncing ? 'Sync...' : isSupabaseConfigured ? 'Supabase Connecté' : 'Mode Local'}
          </span>
        </button>
      ) : (
        <div 
          title="Pas de connexion internet."
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-amber-300 bg-amber-50 text-amber-800"
        >
          <WifiOff className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline">Hors-Ligne</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusBadge;

