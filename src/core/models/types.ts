/**
 * New Version School Tools - Core Data Models
 * Conformité : Établissements primaires, collèges et lycées (Pointe-Noire, Congo-Brazzaville)
 */

export type SchoolLevelType = 'primary' | 'middle' | 'secondary';

export interface School {
  id: string;
  name: string;
  address?: string;
  city: string;
  country: string;
  district?: string;
  code: string;
  phone?: string;
  email?: string;
  motto?: string;
  academicYearId: string;
}

export interface AcademicYear {
  id: string;
  label: string; // ex: "2025-2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  active: boolean;
}

export interface SchoolLevel {
  id: string;
  name: string; // ex: "Lycée - 2nd Cycle", "Collège - 1er Cycle", "Primaire"
  levelType: SchoolLevelType;
  defaultGradingScale: number; // 20 pour collège/lycée, 10 ou 20 pour primaire
}

export interface SchoolClass {
  id: string;
  name: string; // ex: "Terminale C", "3ème A", "CM2 B"
  schoolLevelId: string;
  academicYearId: string;
  capacity?: number;
  classTeacherName?: string; // Professeur principal / Maître titulaire
}

export interface Student {
  id: string;
  studentNumber: string; // Matricule unique ex: "CG-PN-2026-0042"
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate?: string;
  birthPlace?: string;
  schoolClassId: string;
  active: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  conductScore?: number; // Note de conduite sur 20
  unexcusedAbsences?: number; // Heures d'absences injustifiées
  excusedAbsences?: number;
}

export interface Subject {
  id: string;
  name: string; // ex: "Mathématiques", "Physique-Chimie", "Français"
  code: string; // ex: "MATH", "PC", "FRAN"
  schoolLevelId: string;
  defaultCoefficient: number;
  gradingScale: number; // Barème standard (20.00)
  category?: 'scientific' | 'literary' | 'general' | 'sports' | 'other';
  teacherName?: string;
}

export interface ClassSubject {
  id: string;
  schoolClassId: string;
  subjectId: string;
  coefficient: number;
  teacherName?: string;
}

export interface Period {
  id: string;
  name: string; // ex: "1er Trimestre", "2e Trimestre", "3e Trimestre"
  shortName: string; // "T1", "T2", "T3"
  startDate: string;
  endDate: string;
  academicYearId: string;
  isClosed: boolean;
}

export interface Assessment {
  id: string;
  name: string; // ex: "Devoir Surveillé N°1", "Composition Trimestrielle"
  subjectId: string;
  schoolClassId: string;
  periodId: string;
  date: string; // YYYY-MM-DD
  maxScore: number; // Barème de l'évaluation (ex: 20, 10, 40)
  coefficient: number; // Poids de l'évaluation (ex: 1, 2, 3)
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number | null; // null = note manquante / absent non noté
  updatedAt: string; // ISO date
  comment?: string;
}

export interface CalculationConfig {
  roundingRule: 'half-up' | 'floor' | 'ceil' | 'none';
  decimalPlaces: number;
  passThreshold: number; // Seuil d'admission (10.00/20 ou 5.00/10)
  normalizeScoresToScale: boolean; // Si maxScore != 20, normaliser à 20
  mentionThresholds: {
    veryGood: number; // >= 16
    good: number; // >= 14
    fairlyGood: number; // >= 12
    pass: number; // >= 10
  };
}

export interface SubjectCalculationResult {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  teacherName?: string;
  assessmentsCount: number;
  gradesCount: number;
  missingGradesCount: number;
  unroundedAverage: number | null;
  roundedAverage: number | null;
  weightedPoints: number | null;
  classStats: {
    min: number | null;
    max: number | null;
    classAverage: number | null;
  };
  rankInSubject: number | null;
  mention: string;
}

export interface StudentTrimesterSummary {
  studentId: string;
  student: Student;
  periodId: string;
  subjectResults: Record<string, SubjectCalculationResult>;
  totalWeightedPoints: number | null;
  totalCoefficients: number;
  generalAverage: number | null;
  rankInClass: number | null;
  mention: string;
  councilDecision: string;
  hasIncompleteData: boolean;
}

export interface BackupMetadata {
  version: '1.0.0';
  software: 'New Version School Tools';
  publisher: 'New Version';
  exportedAt: string;
  schoolId: string;
  schoolName: string;
  academicYear: string;
  recordCounts: {
    schools: number;
    academicYears: number;
    levels: number;
    classes: number;
    students: number;
    subjects: number;
    classSubjects: number;
    periods: number;
    assessments: number;
    grades: number;
  };
  checksum?: string;
}

export interface DatabaseDump {
  metadata: BackupMetadata;
  school: School;
  academicYears: AcademicYear[];
  schoolLevels: SchoolLevel[];
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  classSubjects: ClassSubject[];
  periods: Period[];
  assessments: Assessment[];
  grades: Grade[];
  calculationConfig: CalculationConfig;
}
