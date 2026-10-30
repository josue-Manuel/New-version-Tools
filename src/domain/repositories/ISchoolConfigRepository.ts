/**
 * New Version School Tools — Interface du Dépôt Configuration & Calendrier (ISchoolConfigRepository)
 *
 * Sépare explicitement les paramètres généraux de l'établissement des données scolaires :
 * - Paramètres officiels (nom, type d'école, devise FCFA, chef d'établissement)
 * - Années académiques et désignation de l'année active
 * - Périodes scolaires (Trimestres T1, T2, T3) et dates limites
 * - Paramètres du moteur de calcul (arrondis, seuils d'admission et de mentions)
 */

import {
  SchoolConfig,
  AcademicYear,
  Period,
  CalculationConfig,
  DashboardMetrics,
} from '../types';

export interface ISchoolConfigRepository {
  /**
   * Récupère la configuration officielle active de l'établissement.
   */
  getConfig(): Promise<SchoolConfig | null>;

  /**
   * Enregistre ou met à jour la configuration de l'établissement avec validation stricte.
   */
  saveConfig(config: SchoolConfig): Promise<void>;

  /**
   * Réinitialise la configuration de l'établissement.
   */
  resetConfig(): Promise<void>;

  /**
   * Récupère la liste des années scolaires enregistrées.
   */
  getAcademicYears(): Promise<AcademicYear[]>;

  /**
   * Récupère l'année scolaire actuellement active.
   */
  getActiveAcademicYear(): Promise<AcademicYear | null>;

  /**
   * Enregistre ou met à jour une année scolaire.
   */
  saveAcademicYear(year: AcademicYear): Promise<void>;

  /**
   * Récupère les périodes (trimestres) associées à une année scolaire.
   */
  getPeriods(academicYearId?: string): Promise<Period[]>;

  /**
   * Enregistre ou met à jour une période scolaire.
   */
  savePeriod(period: Period): Promise<void>;

  /**
   * Récupère la configuration du moteur de calcul (arrondis, seuils, normalisation).
   */
  getCalculationConfig(): Promise<CalculationConfig>;

  /**
   * Enregistre la configuration du moteur de calcul.
   */
  saveCalculationConfig(config: CalculationConfig): Promise<void>;

  /**
   * Calcule et agrège les indicateurs du tableau de bord.
   */
  getDashboardMetrics(): Promise<DashboardMetrics>;
}
