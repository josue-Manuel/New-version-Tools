/**
 * New Version School Tools — Implémentation en mémoire pour prévisualisation
 *
 * NOTE IMPORTANTE D'ARCHITECTURE :
 * Ce service fonctionne en mémoire pour la prévisualisation dans le navigateur.
 * Conformément au cahier des charges, il n'utilise pas localStorage comme base
 * principale pour les données sensibles d'élèves et ne simule pas une base durable.
 * En application de bureau, cette classe est substituée par TauriSQLiteService.
 */

import { DashboardMetrics, SchoolConfig } from '../../domain/types';
import { IStorageService } from './IStorageService';
import { validateSchoolConfig } from './configValidation';

export class MemoryStorageService implements IStorageService {
  private config: SchoolConfig | null = null;
  private backendType: string = 'In-Memory (Mode de démonstration — stockage natif à intégrer)';

  constructor(initialConfig?: SchoolConfig) {
    if (initialConfig) {
      this.config = { ...initialConfig };
    }
  }

  async getSchoolConfig(): Promise<SchoolConfig | null> {
    if (!this.config) {
      return null;
    }
    // Retourne une copie défensive pour éviter les mutations d'état directes
    return { ...this.config };
  }

  async saveSchoolConfig(config: SchoolConfig): Promise<void> {
    // Validation stricte
    validateSchoolConfig(config);

    this.config = {
      ...config,
      name: config.name.trim(),
      academicYear: config.academicYear.trim(),
      city: (config.city || 'Pointe-Noire').trim(),
      country: (config.country || 'Congo').trim(),
      currency: (config.currency || 'FCFA').trim(),
      principalName: config.principalName ? config.principalName.trim() : undefined,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    };
  }

  async resetSchoolConfig(): Promise<void> {
    this.config = null;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // En Phase 1, pas de fausses statistiques : les indicateurs restent à zéro
    return {
      studentsCount: 0,
      classesCount: 0,
      subjectsCount: 0,
      assessmentsCount: 0,
      gradesRecordedCount: 0,
      isConfigured: Boolean(this.config && this.config.isConfigured),
    };
  }

  async checkHealth(): Promise<{ status: 'ok' | 'error'; message: string; backendType: string }> {
    return {
      status: 'ok',
      message: 'Socle technique opérationnel en mode local.',
      backendType: this.backendType,
    };
  }
}

// Instance singleton par défaut pour l'application
export const defaultStorageService = new MemoryStorageService();
