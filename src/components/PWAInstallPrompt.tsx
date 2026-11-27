import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import FoxLogo from './FoxLogo';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Détecter iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Écouter beforeinstallprompt sur Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter l'installation réussie
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isInstalled || isDismissed) return null;

  // Si installable sur Android/Desktop ou guide iOS
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#191716] text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-stone-800 flex items-start gap-3.5">
        <div className="p-2.5 bg-[#F05A22] rounded-2xl flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Installer Fox Couture
            </h4>
            <button 
              onClick={() => setIsDismissed(true)}
              className="text-stone-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
            {isIOS 
              ? "Appuyez sur le bouton Partager puis 'Sur l'écran d'accueil' pour l'installer comme une vraie application."
              : "Installez l'application sur votre écran d'accueil pour un accès rapide et hors-ligne."}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="btn-fox-primary !py-1.5 !px-3.5 !text-xs !rounded-xl"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Installer maintenant</span>
              </button>
            ) : isIOS ? (
              <div className="flex items-center gap-1.5 text-xs text-[#E5A855] font-bold">
                <Share className="w-3.5 h-3.5" />
                <span>Partager &gt; Écran d'accueil</span>
              </div>
            ) : null}

            <button
              onClick={() => setIsDismissed(true)}
              className="text-[11px] text-stone-400 hover:text-stone-200 px-2 py-1 font-semibold cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
