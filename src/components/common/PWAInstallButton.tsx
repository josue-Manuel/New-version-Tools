import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si déjà installé, masquer
  if (isInstalled) {
    return null;
  }

  // Installation Chromium / Desktop / Android
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-white shadow-xs transition-colors cursor-pointer"
        title="Installer New Version School Tools sur cet ordinateur pour accès hors-ligne"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer sur Ordinateur</span>
      </button>
    );
  }

  // Guide iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#1446A0]" />
          <span>Installer (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-[6px] border border-[#CBD5E1] p-5 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h4 className="text-sm font-bold text-[#0A1D3D]">Installation sur iPad / iPhone</h4>
                <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.<br />
                2. Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-1.5 rounded-[4px] bg-[#1446A0] text-white text-xs font-semibold"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
