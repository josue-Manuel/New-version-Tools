import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useOnlineStatus } from '../common/useOnlineStatus';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Building2,
  Calendar,
  Layers,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Printer,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    school,
    activeYear,
    classes,
    selectedClassId,
    setSelectedClassId,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    isDemoData,
    activeView,
  } = useSchool();

  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs no-print select-none">
      {/* Upper Bar: Identification, Demonstration Disclaimer & Connectivity */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[#F1F5F9] text-xs">
        {/* Left: School & Breadcrumb */}
        <div className="flex items-center gap-2 text-[#475569]">
          <span className="flex items-center gap-1.5 font-bold text-[#0A1D3D]">
            <Building2 className="w-4 h-4 text-[#1446A0]" />
            <span>{school?.name || 'New Version School Tools'}</span>
          </span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#64748B]">{school?.city || 'Pointe-Noire'}</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#1446A0] font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{activeYear?.label || '2025-2026'}</span>
          </span>
        </div>

        {/* Right: Badges, Offline Status & PWA Install */}
        <div className="flex items-center gap-3">
          {/* Fictional Demonstration Data Warning Banner */}
          {isDemoData && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#FEF3C7] border border-[#FDE68A] text-[11px] font-semibold text-[#92400E]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>DONNÉES FICTIVES DE DÉMONSTRATION</span>
            </div>
          )}

          {/* Network Connection Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[11px] font-semibold tracking-wide ${
              isOnline
                ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#059669]'
                : 'bg-[#FEF3C7] border-[#D97706] text-[#92400E]'
            }`}
            title={
              isOnline
                ? 'Connecté à Internet. Les données sont sauvegardées localement dans IndexedDB.'
                : 'Mode Hors-Ligne actif. L’application continue de fonctionner grâce à IndexedDB.'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#10B981]' : 'bg-[#D97706] animate-pulse'
              }`}
            ></span>
            <span>{isOnline ? 'CONNECTÉ' : 'HORS-LIGNE (LOCAL)'}</span>
            {isOnline ? (
              <Wifi className="w-3 h-3 text-[#10B981] ml-0.5" />
            ) : (
              <WifiOff className="w-3 h-3 text-[#D97706] ml-0.5" />
            )}
          </div>

          {/* Install PWA Button */}
          <PWAInstallButton />
        </div>
      </div>

      {/* Lower Bar: Class and Period Selection Controls */}
      <div className="h-11 px-4 flex items-center justify-between gap-4 bg-[#F8FAFC]">
        {/* Class Selector */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs font-semibold text-[#475569]">
            <Layers className="w-3.5 h-3.5 text-[#1446A0]" />
            <span className="hidden sm:inline">Classe :</span>
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-7 px-2.5 text-xs font-bold bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0A1D3D] focus:border-[#1446A0] focus:outline-none shadow-2xs"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#475569] hidden md:inline flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#1446A0]" />
            <span>Période :</span>
          </span>
          <div className="inline-flex rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] p-0.5 shadow-2xs">
            {periods.map((p) => {
              const active = selectedPeriodId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriodId(p.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-[3px] transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1446A0] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0A1D3D] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Print button on printable views */}
          {(activeView === 'bulletins' || activeView === 'reports') && (
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors cursor-pointer ml-2"
              title="Imprimer le document officiel (Format A4)"
            >
              <Printer className="w-3.5 h-3.5 text-[#1446A0]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
