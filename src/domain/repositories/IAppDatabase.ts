/**
 * New Version School Tools — Interface Centrale de la Base de Données (IAppDatabase)
 *
 * Patron d'Unité de Travail (Unit of Work) centralisant l'accès à tous les dépôts métier :
 * - schoolConfig : paramètres et calendrier scolaire
 * - students : gestion des dossiers élèves
 * - classes : niveaux et divisions
 * - subjects : matières et coefficients
 * - assessments : évaluations et devoirs
 * - grades : registre des notes
 * - payments : comptabilité des frais scolaires
 *
 * Cette interface abstraite permet de substituer l'implémentation IndexedDB par
 * SQLite (Tauri 2 via @tauri-apps/plugin-sql) sans modifier les composants React.
 */

import { ISchoolConfigRepository } from './ISchoolConfigRepository';
import { IStudentRepository } from './IStudentRepository';
import { IClassRepository } from './IClassRepository';
import { ISubjectRepository } from './ISubjectRepository';
import { IAssessmentRepository } from './IAssessmentRepository';
import { IGradeRepository } from './IGradeRepository';
import { IPaymentRepository } from './IPaymentRepository';

export interface DatabaseHealthInfo {
  status: 'ok' | 'warning' | 'error';
  message: string;
  backendType: string;
  isPersistent: boolean;
  details?: Record<string, unknown>;
}

export interface IAppDatabase {
  readonly schoolConfig: ISchoolConfigRepository;
  readonly students: IStudentRepository;
  readonly classes: IClassRepository;
  readonly subjects: ISubjectRepository;
  readonly assessments: IAssessmentRepository;
  readonly grades: IGradeRepository;
  readonly payments: IPaymentRepository;

  /**
   * Vérifie la disponibilité et l'intégrité du stockage.
   */
  checkHealth(): Promise<DatabaseHealthInfo>;

  /**
   * Exporte un instantané complet de toutes les tables (pour sauvegarde locale).
   */
  exportData(): Promise<Record<string, unknown>>;

  /**
   * Restaure les données à partir d'un instantané exporté.
   */
  restoreData(snapshot: Record<string, unknown>): Promise<void>;

  /**
   * Réinitialise les tables de données scolaires (utilisé pour les tests ou réinstallation).
   */
  clear(): Promise<void>;
}
