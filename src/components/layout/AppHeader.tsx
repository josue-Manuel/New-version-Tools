import React from 'react';
import {
  FlaskConical,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { NavigationSection, SchoolConfig } from '../../domain/types';

interface AppHeaderProps {
  config: SchoolConfig | null;
  onNavigate: (section: NavigationSection) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ config, onNavigate }) => {
  const isConfigured = Boolean(config && config.isConfigured);

  return (
    <header className="h-16 bg-white border-b border-[#CBD5E1] px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Context & Status */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-[#182230] flex items-center gap-2">
            <span>
              {isConfigured
                ? config!.name
                : "Établissement non configuré (Données d'exemple)"}
            </span>
            {isConfigured ? (
              <Badge variant="success" size="sm" dot>
                Configuré
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" dot>
                Non configuré
              </Badge>
            )}
          </h1>
          <p className="text-xs text-[#667085]">
            {isConfigured
              ? `${config!.city}, ${config!.country} • Année ${config!.academicYear}`
              : "Configuration requise — Renseignez les paramètres officiels de votre école"}
          </p>
        </div>
      </div>

      {/* Right: Explicit Demonstration / Preview Engine Status */}
      <div className="flex items-center gap-3">
        {/* Academic Year pill if available */}
        {isConfigured && config!.academicYear && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F7FB] border border-[#E2E8F0] rounded text-xs text-[#182230] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#1446A0]" />
            <span>{config!.academicYear}</span>
          </div>
        )}

        {/* Demo / Target Engine Status badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFAEB] border border-[#FEDF89] text-xs text-[#B54708] font-medium"
          title="Prévisualisation web — Stockage temporaire en mémoire. L'exécution 100% hors-ligne et la base locale SQLite seront activées dans le client de bureau Tauri 2."
        >
          <FlaskConical className="w-3.5 h-3.5 text-[#B54708]" />
          <span>Mode de démonstration — stockage natif à intégrer</span>
        </div>

        {/* Quick config button if not yet configured */}
        {!isConfigured && (
          <Button
            size="sm"
            variant="primary"
            icon={<SettingsIcon className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('settings')}
          >
            Configurer
          </Button>
        )}
      </div>
    </header>
  );
};
