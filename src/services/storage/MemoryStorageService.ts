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
    if (!config.name || config.name.trim().length === 0) {
      throw new Error("Le nom de l'établissement est obligatoire.");
    }

    if (!config.academicYear || config.academicYear.trim().length === 0) {
      throw new Error("L'année scolaire est obligatoire.");
    }

    // Validation du format d'année scolaire (ex: 2024-2025 ou 2024/2025)
    const yearPattern = /^(\d{4})[-/](\d{4})$/;
    const match = config.academicYear.trim().match(yearPattern);
    if (!match) {
      throw new Error("Format d'année scolaire invalide. Utilisez le format 'AAAA-AAAA' (ex: 2024-2025).");
    }
    const y1 = parseInt(match[1], 10);
    const y2 = parseInt(match[2], 10);
    if (y2 !== y1 + 1) {
      throw new Error(`L'année scolaire doit couvrir deux années consécutives (ex: ${y1}-${y1 + 1}).`);
    }

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
