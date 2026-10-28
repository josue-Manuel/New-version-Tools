import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  FileSpreadsheet,
  Users,
  Coins,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeModule, setActiveModule, schoolProfile, students, offlineQueue } = useAcademic();

  const navItems = [
    {
      id: 'matrix' as const,
      label: 'Matrice de Délibération',
      subtitle: 'Relevé de notes & coefficients',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'roster' as const,
      label: 'Registre Matricule',
      subtitle: 'Dossiers & effectifs élèves',
      icon: Users,
      badge: `${students.length} élèves`,
    },
    {
      id: 'ledger' as const,
      label: 'Livre de Caisse & Écolages',
      subtitle: 'Régie financière en FCFA',
      icon: Coins,
      badge: 'XAF',
    },
    {
      id: 'bulletins' as const,
      label: 'Bulletins & Bordereau',
      subtitle: 'Format officiel DDEPS Congo',
      icon: FileText,
      badge: 'Officiel',
    },
    {
      id: 'settings' as const,
      label: 'Barème & Coefficients',
      subtitle: 'Programmes & profil lycée',
      icon: Sliders,
      badge: null,
    },
  ];

  return (
    <aside
      className={`bg-[#0A1D3D] text-[#EDF0FF] transition-all duration-200 flex flex-col justify-between shrink-0 select-none z-40 border-r border-[#1F3051] ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding & Emblem */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1F3051]">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-[4px] bg-[#1446A0] border border-[#305AB4] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-white uppercase truncate">
                  {schoolProfile.acronym}
                </span>
                <span className="text-[10px] text-[#A1BAFF] font-medium truncate">
                  Pointe-Noire · Core Académique
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-[4px] bg-[#1446A0] border border-[#305AB4] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Collapse Toggle */}
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

        {/* Collapsed Toggle Button when collapsed */}
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

        {/* Navigation Section */}
        <div className="py-3 px-2">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#A1BAFF]">
              Administration & Délibération
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeModule === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors cursor-pointer group relative ${
                    active
                      ? 'bg-[#1446A0] text-white font-medium shadow-xs'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#1F3051]/60'
                  }`}
                >
                  {/* Left indicator marker on active item */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00C2FF] rounded-r-[2px]"></span>
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
                      <span className="text-[10px] text-[#A1BAFF] opacity-80 block truncate">
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

      {/* Bottom Institutional Info & Local Engine State */}
      <div className="p-3 border-t border-[#1F3051] bg-[#07152D]">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#A1BAFF]">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>Base Locale (Indexed)</span>
              </span>
              <span className="tabular-nums text-white font-semibold">100% OK</span>
            </div>

            <div className="text-[10px] text-[#7487B2] leading-tight font-mono-tabular">
              Code: {schoolProfile.code}
            </div>

            {offlineQueue.length > 0 && (
              <div className="px-2 py-1 rounded-[2px] bg-[#D97706]/20 border border-[#D97706]/40 text-[#FBBF24] text-[10px] flex items-center justify-between">
                <span>Tampon hors-ligne :</span>
                <span className="font-bold tabular-nums">{offlineQueue.length} op.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#A1BAFF]" title="Base Locale Opérationnelle">
            <HardDrive className="w-4 h-4 text-[#00C2FF]" />
            {offlineQueue.length > 0 && (
              <span className="mt-1 w-2 h-2 rounded-full bg-[#D97706]"></span>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
