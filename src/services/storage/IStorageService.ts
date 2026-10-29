/**
 * New Version School Tools — Interface du Service de Stockage
 *
 * Contrat abstrait séparant l'interface React du moteur de données.
 * En Phase 1 (prévisualisation navigateur), ce service est implémenté en mémoire.
 * En Phase 2 (application de bureau Tauri 2), cette même interface sera
 * implémentée via le plugin SQLite natif (@tauri-apps/plugin-sql).
 */

import { DashboardMetrics, SchoolConfig } from '../../domain/types';

export interface StorageIncident {
  step: 'openDB' | 'transaction' | 'put' | 'get' | 'delete';
  errorName: string;
  errorMessage: string;
  timestamp: string;
  probableCause: string;
}

export interface StorageDiagnostics {
  primaryEngine: 'IndexedDB';
  activeEngine: 'IndexedDB' | 'localStorage' | 'Memory' | string;
  isPersistent: boolean;
  indexedDBAvailable: boolean;
  localStorageAvailable: boolean;
  isIndexedDBBlocked: boolean;
  lastIncident: StorageIncident | null;
}

export interface IStorageService {
  /**
   * Récupère la configuration actuelle de l'établissement.
   * Retourne null si le logiciel n'a pas encore été configuré.
   */
  getSchoolConfig(): Promise<SchoolConfig | null>;

  /**
   * Enregistre ou met à jour la configuration de l'établissement.
   * Valide les données avant persistance.
   */
  saveSchoolConfig(config: SchoolConfig): Promise<void>;

  /**
   * Réinitialise la configuration locale de l'établissement.
   */
  resetSchoolConfig(): Promise<void>;

  /**
   * Calcule et retourne les métriques pour le tableau de bord initial.
   * Garantit que les indicateurs reflètent la réalité (zéro si non renseigné).
   */
  getDashboardMetrics(): Promise<DashboardMetrics>;

  /**
   * Vérifie si le socle technique est opérationnel et prêt.
   */
  checkHealth(): Promise<{
    status: 'ok' | 'error' | 'warning';
    message: string;
    backendType: string;
    diagnostics?: StorageDiagnostics;
  }>;
}
