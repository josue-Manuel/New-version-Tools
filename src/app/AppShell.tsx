import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '../components/layout/AppSidebar';
import { AppHeader } from '../components/layout/AppHeader';
import { DashboardView } from '../modules/dashboard/DashboardView';
import { SettingsView } from '../modules/settings/SettingsView';
import { PhasePlaceholderView } from '../components/common/PhasePlaceholderView';
import {
  DashboardMetrics,
  NavigationSection,
  SchoolConfig,
} from '../domain/types';
import { defaultStorageService } from '../services/storage/MemoryStorageService';

export const AppShell: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    studentsCount: 0,
    classesCount: 0,
    subjectsCount: 0,
    assessmentsCount: 0,
    gradesRecordedCount: 0,
    isConfigured: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Recharge la configuration et les métriques depuis le service de stockage
  const refreshAppData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedConfig, loadedMetrics] = await Promise.all([
        defaultStorageService.getSchoolConfig(),
        defaultStorageService.getDashboardMetrics(),
      ]);
      setConfig(loadedConfig);
      setMetrics(loadedMetrics);
    } catch (err) {
      console.error('Erreur de chargement du service de stockage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAppData();
  }, [refreshAppData]);

  // Enregistrement de la configuration via le service de stockage
  const handleSaveConfig = async (newConfig: SchoolConfig) => {
    await defaultStorageService.saveSchoolConfig(newConfig);
    await refreshAppData();
  };

  // Réinitialisation de la configuration
  const handleResetConfig = async () => {
    await defaultStorageService.resetSchoolConfig();
    await refreshAppData();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FB] text-[#182230] font-sans">
      {/* Sidebar de navigation */}
      <AppSidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        schoolName={config?.name}
        isConfigured={Boolean(config && config.isConfigured)}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* En-tête supérieur avec statut hors-ligne */}
        <AppHeader config={config} onNavigate={setCurrentSection} />

        {/* Zone de vue défilable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-sm text-[#667085]">
              Chargement du socle technique...
            </div>
          ) : (
            <>
              {currentSection === 'dashboard' && (
                <DashboardView
                  config={config}
                  metrics={metrics}
                  onNavigate={setCurrentSection}
                />
              )}

              {currentSection === 'settings' && (
                <SettingsView
                  currentConfig={config}
                  onSave={handleSaveConfig}
                  onReset={handleResetConfig}
                />
              )}

              {currentSection !== 'dashboard' && currentSection !== 'settings' && (
                <PhasePlaceholderView
                  section={currentSection}
                  onBackToDashboard={() => setCurrentSection('dashboard')}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
