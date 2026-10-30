/**
 * New Version School Tools — Schéma Versionné IndexedDB (Web)
 *
 * Définit la structure des magasins d'objets (Object Stores) et des index locaux.
 * Compatible avec les configurations existantes de la Phase 1 (migration transparente v1 -> v2).
 */

export const DB_NAME = 'nv_school_tools_web_db';
export const CURRENT_DB_VERSION = 2;

export const STORES = {
  // Configuration et calendrier (séparés des données élèves)
  CONFIG: 'school_configuration',
  ACADEMIC_YEARS: 'academic_years',
  PERIODS: 'periods',
  APP_METADATA: 'app_metadata',

  // Structure académique
  SCHOOL_LEVELS: 'school_levels',
  CLASSES: 'school_classes',
  SUBJECTS: 'subjects',
  CLASS_SUBJECTS: 'class_subjects',

  // Dossiers et scolarité
  STUDENTS: 'students',
  ASSESSMENTS: 'assessments',
  GRADES: 'grades',

  // Trésorerie et frais scolaires
  PAYMENTS: 'fee_transactions',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];
