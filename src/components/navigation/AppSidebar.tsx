import React from 'react';
import { useSchool, AppView } from '../../context/SchoolContext';
import {
  FileSpreadsheet,
  Users,
  Layers,
  FileText,
  BarChart3,
  HardDriveDownload,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Database,
} from 'lucide-react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeView, setActiveView, students, classes } = useSchool();

  const navItems: { id: AppView; label: string; subtitle: string; icon: any; badge?: string }[] = [
    {
      id: 'grades',
      label: 'Saisie des Notes',
      subtitle: 'Tableau & délibération',
      icon: FileSpreadsheet,
    },
    {
      id: 'students',
      label: 'Registre des Élèves',
      subtitle: 'Matricules & import CSV',
      icon: Users,
      badge: `${students.length}`,
    },
    {
      id: 'classes',
      label: 'Classes & Matières',
      subtitle: 'Coefficients & évaluations',
      icon: Layers,
      badge: `${classes.length}`,
    },
    {
      id: 'bulletins',
      label: 'Bulletins Scolaires',
      subtitle: 'Format officiel A4 imprimable',
      icon: FileText,
      badge: 'A4',
    },
    {
      id: 'reports',
      label: 'Résultats & Synthèse',
      subtitle: 'Classement & procès-verbal',
      icon: BarChart3,
    },
    {
      id: 'backup',
      label: 'Sauvegardes & Données',
      subtitle: 'Export / Restauration JSON',
      icon: HardDriveDownload,
    },
    {
      id: 'settings',
      label: 'Configuration',
      subtitle: 'Règles de calcul & école',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`bg-[#0A1D3D] text-[#EDF0FF] transition-all duration-200 flex flex-col justify-between shrink-0 select-none z-40 border-r border-[#1F3051] no-print ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Top Brand Lockup */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1F3051]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-[4px] bg-[#1446A0] border border-[#305AB4] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#00C2FF]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-white uppercase truncate">
                  School Tools
                </span>
                <span className="text-[10px] text-[#A1BAFF] font-medium truncate">
                  New Version EdTech
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-[4px] bg-[#1446A0] border border-[#305AB4] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#00C2FF]" />
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-[4px] text-[#A1BAFF] hover:text-white hover:bg-[#1446A0]/40 transition-colors cursor-pointer ${
              collapsed ? 'hidden' : 'block'
            }`}
            title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {collapsed && (
          <div className="p-2 flex justify-center border-b border-[#1F3051]">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-[4px] text-[#A1BAFF] hover:text-white hover:bg-[#1446A0]/40 transition-colors cursor-pointer"
              title="Agrandir le menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="py-3 px-2">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#A1BAFF]">
              Gestion Pédagogique
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[4px] text-left transition-colors cursor-pointer group relative ${
                    active
                      ? 'bg-[#1446A0] text-white font-semibold shadow-xs'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#1F3051]/60'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#00C2FF] rounded-r-[2px]"></span>
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-[#00C2FF]' : 'text-[#A1BAFF] group-hover:text-white'
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-[2px] ${
                              active
                                ? 'bg-[#0A1D3D] text-[#A1BAFF]'
                                : 'bg-[#1F3051] text-[#CBD5E1]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#A1BAFF] opacity-80 block truncate font-normal">
                        {item.subtitle}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: IndexedDB Status */}
      <div className="p-3 border-t border-[#1F3051] bg-[#07152D] text-[11px] text-[#A1BAFF]">
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>Base Locale IndexedDB</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Active et persistante"></span>
            </div>
            <div className="text-[10px] text-[#7487B2] font-mono leading-tight">
              v1.0.0 · Pointe-Noire (Congo)
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="IndexedDB Connectée">
            <Database className="w-4 h-4 text-[#00C2FF]" />
          </div>
        )}
      </div>
    </aside>
  );
};
