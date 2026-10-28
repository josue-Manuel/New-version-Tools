import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  FileSpreadsheet, 
  Printer, 
  Layers
} from 'lucide-react';
import { SeriesId } from '../types/academic';

interface HeaderProps {
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSyncModal }) => {
  const {
    seriesList,
    selectedSeriesId,
    setSelectedSeriesId,
    currentSeries,
    trimester,
    setTrimester,
    activeModule,
    isOnline,
    toggleOnlineMode,
    offlineQueue,
    isSyncing,
    schoolProfile,
    publishTrimester,
  } = useAcademic();

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState<string | null>(null);

  // Module names in breadcrumb
  const moduleNames = {
    matrix: 'Matrice de Délibération & Relevé de Notes',
    roster: 'Registre Matricule & Dossiers Élèves',
    ledger: 'Livre de Caisse & Écolages (FCFA)',
    bulletins: 'Bulletins Officiels & Bordereau DDEPS',
    settings: 'Configuration & Barème National',
  };

  const handlePublish = () => {
    setIsPublishing(true);
    publishTrimester(selectedSeriesId, trimester);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccessNotice('Délibération officielle validée avec succès');
      setTimeout(() => setPublishSuccessNotice(null), 3500);
    }, 400);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] no-print">
      {/* Upper Bar: Breadcrumbs & Institutional Identification */}
      <div className="h-12 px-5 flex items-center justify-between border-b border-[#F1F5F9]">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5 font-medium text-[#334155]">
            <Building2 className="w-3.5 h-3.5 text-[#1446A0]" />
            <span>{schoolProfile.name}</span>
          </span>
          <span className="text-[#94A3B8]">/</span>
          <span>{schoolProfile.city}</span>
          <span className="text-[#94A3B8]">/</span>
          <span className="font-semibold text-[#0F172A]">{moduleNames[activeModule]}</span>
          <span className="text-[#94A3B8]">/</span>
          <span className="tabular-nums text-[#1446A0] font-medium">{schoolProfile.academicYear}</span>
        </div>

        {/* Right side: Network & Sync Status Badge */}
        <div className="flex items-center gap-3">
          {/* Official Seal Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-semibold text-[#334155]">
            <span className="w-2 h-2 rounded-full bg-[#1446A0]"></span>
            <span>RÉPUBLIQUE DU CONGO · DDEPS</span>
          </div>

          {/* Network Sync Badge - STRICT DESIGN SPEC */}
          <button
            onClick={onOpenSyncModal}
            title={isOnline ? 'Cliquer pour examiner la synchronisation' : 'Cliquer pour gérer la file hors-ligne'}
            className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
                <span className="text-[11px] font-semibold tracking-[0.04em] text-[#0F172A] whitespace-nowrap">
                  CONNECTÉ — SYNCHRONISÉ
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0"></span>
                <span className="text-[11px] font-semibold tracking-[0.04em] text-[#D97706] whitespace-nowrap">
                  HORS-LIGNE — LOCAL ({offlineQueue.length} MODIF.)
                </span>
              </>
            )}
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#1446A0] animate-spin ml-1" />
            ) : isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-[#10B981] ml-1" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-[#D97706] ml-1" />
            )}
          </button>

          {/* Offline Simulation Switcher */}
          <button
            onClick={toggleOnlineMode}
            className={`text-xs px-2.5 py-1 rounded-[4px] border transition-colors cursor-pointer whitespace-nowrap ${
              isOnline
                ? 'border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                : 'border-[#D97706] bg-[#FEF3C7] text-[#92400E] font-medium'
            }`}
            title="Simuler les coupures de réseau fréquentes à Pointe-Noire pour tester la résilience locale"
          >
            {isOnline ? 'Simuler Hors-Ligne' : 'Rétablir Connexion'}
          </button>
        </div>
      </div>

      {/* Lower Bar: Active Series Cohort & Trimester Navigation Controls */}
      <div className="h-12 px-5 flex items-center justify-between gap-4 bg-[#F8FAFC]">
        {/* Left: Series/Class Segmented Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
            <Layers className="w-4 h-4 text-[#1446A0]" />
            <span className="hidden sm:inline">Cohorte :</span>
          </div>

          <div className="inline-flex rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] p-0.5 shadow-xs">
            {seriesList.map((s) => {
              const active = selectedSeriesId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeriesId(s.id as SeriesId)}
                  className={`px-3 py-1 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1446A0] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {s.id === 'TC' ? 'Terminale C' : s.id === 'TD' ? 'Terminale D' : 'Terminale A4'}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-[#64748B] hidden md:inline">
            ({currentSeries.subjects.length} disciplines · {currentSeries.totalCoefficients} coefs)
          </span>
        </div>

        {/* Center / Right: Trimester Segmented Control & Commitment Action */}
        <div className="flex items-center gap-3">
          {/* Trimester Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[4px] border border-[#E2E8F0]">
            {([1, 2, 3] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrimester(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-[3px] transition-colors whitespace-nowrap cursor-pointer ${
                  trimester === t
                    ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs border border-[#CBD5E1]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {t}ᵉʳ Trimestre
              </button>
            ))}
          </div>

          {/* Quick Commit / Deliberation Action if in Matrix module */}
          {activeModule === 'matrix' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-3.5 py-1.5 bg-[#1446A0] hover:bg-[#0F357D] active:bg-[#0A2558] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C2FF] disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Validation...' : 'Valider Délibération'}</span>
              </button>
            </div>
          )}

          {/* Print Action */}
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Imprimer l'écran courant"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Success Notice */}
      {publishSuccessNotice && (
        <div className="bg-[#10B981] text-white text-xs px-4 py-1.5 text-center font-medium shadow-sm transition-all animate-in fade-in slide-in-from-top-1">
          ✓ {publishSuccessNotice}
        </div>
      )}
    </header>
  );
};
