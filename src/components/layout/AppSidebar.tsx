import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  HardDriveDownload,
  Settings,
  School,
  Lock,
} from 'lucide-react';
import { NavigationSection } from '../../domain/types';

interface AppSidebarProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  schoolName?: string;
  isConfigured: boolean;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ElementType;
  isReadyInPhase1: boolean;
  phaseNote?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    isReadyInPhase1: true,
  },
  {
    id: 'students',
    label: 'Élèves',
    icon: Users,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'classes',
    label: 'Classes',
    icon: GraduationCap,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'subjects',
    label: 'Matières',
    icon: BookOpen,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'grades',
    label: 'Évaluations et notes',
    icon: ClipboardCheck,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'bulletins',
    label: 'Résultats et bulletins',
    icon: FileSpreadsheet,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'backups',
    label: 'Sauvegardes',
    icon: HardDriveDownload,
    isReadyInPhase1: false,
    phaseNote: 'Phase 2',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    isReadyInPhase1: true,
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentSection,
  onNavigate,
  schoolName,
  isConfigured,
}) => {
  return (
    <aside className="w-64 bg-[#0A1D3D] text-white flex flex-col shrink-0 border-r border-[#1446A0]/30 select-none">
      {/* Brand & Identity */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-[#1446A0] border border-[#00C2FF]/40 flex items-center justify-center shrink-0 shadow-xs">
          <School className="w-5 h-5 text-[#00C2FF]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white leading-tight">
              New Version
            </span>
            <span className="text-[10px] bg-[#1446A0] text-[#00C2FF] font-semibold px-1.5 py-0.2 rounded border border-[#00C2FF]/30">
              SOCLE
            </span>
          </div>
          <span className="text-xs text-white/70 block truncate">
            School Tools
          </span>
        </div>
      </div>

      {/* School Badge in Sidebar */}
      <div className="px-4 py-3 bg-[#0F2854]/60 border-b border-white/5">
        <div className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
          Établissement
        </div>
        <div className="text-xs font-medium text-white truncate">
          {isConfigured && schoolName ? (
            schoolName
          ) : (
            <span className="text-amber-300 italic">Non configuré (Exemple)</span>
          )}
        </div>
        <div className="text-[10px] text-[#00C2FF]/90 mt-0.5">
          {isConfigured ? 'Pointe-Noire, Congo-Brazzaville' : 'Pointe-Noire (Zone cible)'}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
          Menu Principal
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1446A0] text-white shadow-xs'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#00C2FF]' : 'text-white/60'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {!item.isReadyInPhase1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 flex items-center gap-1 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  {item.phaseNote}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Offline Status */}
      <div className="p-3 border-t border-white/10 text-[11px] text-white/60 bg-[#07152D]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/40">Éditeur :</span>
          <span className="font-semibold text-white/80">New Version</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40">Cible desktop :</span>
          <span className="text-[#00C2FF] font-mono text-[10px]">Tauri 2 + SQLite</span>
        </div>
      </div>
    </aside>
  );
};
