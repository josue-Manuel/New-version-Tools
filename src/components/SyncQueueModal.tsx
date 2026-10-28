import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncQueueModal: React.FC<SyncQueueModalProps> = ({ isOpen, onClose }) => {
  const {
    isOnline,
    toggleOnlineMode,
    offlineQueue,
    isSyncing,
    lastSyncTime,
    syncOfflineQueue,
    schoolProfile,
  } = useAcademic();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD5E1] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header - STRICT DESIGN SPEC: #0A1D3D with white typography */}
        <div className="px-5 py-4 bg-[#0A1D3D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#1446A0] flex items-center justify-center">
              <Server className="w-4 h-4 text-[#00C2FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Moteur Local-First & Réplication Ministérielle
              </h3>
              <p className="text-[11px] text-[#A1BAFF]">
                Architecture résiliente aux coupures réseau de Pointe-Noire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1BAFF] hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Current Connection Status Box */}
          <div className="p-3.5 rounded-[4px] border border-[#CBD5E1] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-[#10B981]' : 'bg-[#D97706]'
                  }`}
                ></span>
                <span className="font-bold text-sm text-[#0F172A]">
                  {isOnline ? 'CONNECTÉ — SYNCHRONISÉ' : 'HORS-LIGNE — LOCAL'}
                </span>
              </div>

              <button
                onClick={toggleOnlineMode}
                className={`px-3 py-1 rounded-[4px] border text-xs font-semibold transition-colors cursor-pointer ${
                  isOnline
                    ? 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]'
                    : 'border-[#D97706] bg-[#FEF3C7] text-[#92400E]'
                }`}
              >
                {isOnline ? 'Basculer en Mode Hors-Ligne' : 'Rétablir Connexion Réseau'}
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-3 text-[#64748B]">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#64748B]">
                  Dernière Réplication Serveur
                </span>
                <span className="font-medium text-[#0F172A]">{lastSyncTime}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#64748B]">
                  Serveur Cible (DDEPS)
                </span>
                <span className="font-mono-tabular font-medium text-[#0F172A]">
                  ddeps-pn.gouv.cg (Port 443)
                </span>
              </div>
            </div>
          </div>

          {/* Pending Mutation Buffer List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#475569]">
                File des Mutations en Attente de Réplication ({offlineQueue.length})
              </span>
              <span className="text-[10px] text-[#64748B]">
                Stockage persistant : IndexedDB local
              </span>
            </div>

            <div className="h-44 overflow-y-auto border border-[#CBD5E1] rounded-[4px] bg-[#FFFFFF] divide-y divide-[#E2E8F0]">
              {offlineQueue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#64748B]">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mb-2" />
                  <span className="font-semibold text-xs text-[#0F172A]">
                    Toutes les modifications sont synchronisées !
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-0.5">
                    Aucune transaction ou saisie de note en attente de commit.
                  </span>
                </div>
              ) : (
                offlineQueue.map((item) => (
                  <div key={item.id} className="p-2.5 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0F172A]">{item.entity}</span>
                      <span className="font-mono-tabular text-[10px] text-[#64748B]">
                        {new Date(item.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] mt-0.5">{item.summary}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded-[2px] bg-[#F1F5F9] text-[9px] font-mono text-[#1446A0]">
                      {item.actionType}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] text-[11px] text-[#1E3A8A] leading-relaxed">
            <strong>Règle de Fonctionnement :</strong> En cas de coupure de fibre ou de courant à Pointe-Noire, le système bascule sans interruption sur le stockage local. Dès que le réseau est disponible, un simple clic permet de propager l'ensemble des délibérations et règlements financiers.
          </div>
        </div>

        {/* Footer - STRICT DESIGN SPEC: Right-aligned, primary action strictly on far right */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] font-semibold text-[#334155] hover:bg-[#F1F5F9] cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={syncOfflineQueue}
            disabled={offlineQueue.length === 0 || isSyncing}
            className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] font-semibold text-white cursor-pointer shadow-xs flex items-center gap-2 focus:ring-2 focus:ring-[#00C2FF] disabled:opacity-40"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Réplication en cours...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Synchroniser Maintenant</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
