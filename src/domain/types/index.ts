/**
 * New Version School Tools — Types du Domaine Métier
 * Conçu pour un logiciel scolaire desktop offline-first (Pointe-Noire, Congo-Brazzaville).
 * Ces entités préparent l'architecture cible SQLite (Tauri 2).
 */

export type SchoolType = 'primary' | 'middle' | 'secondary' | 'mixed';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  address?: string;
  city: string;
  country: string;
  academicYearId: string;
  principalName?: string;
  currency?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  label: string; // Ex: "2024-2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export type LevelType = 'primary' | 'middle' | 'secondary';

export interface SchoolLevel {
  id: string;
  name: string; // Ex: "Premier Cycle (Collège)", "Second Cycle (Lycée)"
  levelType: LevelType;
  code: string;
}

export interface SchoolClass {
  id: string;
  name: string; // Ex: "Terminale C", "3ème A", "CM2"
  schoolLevelId: string;
  academicYearId: string;
  capacity?: number;
}

export interface Student {
  id: string;
  studentNumber: string; // Matricule unique au sein de l'établissement
  firstName: string;
  lastName: string;
  schoolClassId: string;
  gender: 'M' | 'F';
  birthDate?: string;
  active: boolean;
  enrolledAt: string;
}

export interface Subject {
  id: string;
  name: string; // Ex: "Mathématiques", "Français", "Physique-Chimie"
  code: string;
  schoolLevelId: string;
  defaultCoefficient: number;
  gradingScale: number; // Barème de référence (généralement 20)
}

export interface Period {
  id: string;
  name: string; // Ex: "1er Trimestre", "2ème Trimestre", "3ème Trimestre"
  academicYearId: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface Assessment {
  id: string;
  name: string; // Ex: "Devoir Départemental", "Interrogation Écrite n°1"
  subjectId: string;
  schoolClassId: string;
  periodId: string;
  date: string;
  maxScore: number;
  coefficient: number;
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number | null; // null = note non attribuée ou élève dispensé
  updatedAt: string;
}

/**
 * Configuration initiale de l'établissement.
 * Utilisée en Phase 1 pour initialiser le logiciel avant la gestion complète.
 */
export interface SchoolConfig {
  name: string;
  schoolType: SchoolType;
  academicYear: string;
  city: string;
  country: string;
  currency: string;
  principalName?: string;
  isConfigured: boolean;
  updatedAt?: string;
}

/**
 * Indicateurs initiaux du Tableau de bord.
 * En Phase 1, ces métriques sont fidèlement initialisées à zéro sans fausses données.
 */
export interface DashboardMetrics {
  studentsCount: number;
  classesCount: number;
  subjectsCount: number;
  assessmentsCount: number;
  gradesRecordedCount: number;
  isConfigured: boolean;
}

/**
 * Identifiants de navigation de l'application
 */
export type NavigationSection =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'grades'
  | 'bulletins'
  | 'backups'
  | 'settings';
