/**
 * IndexedDB Schema & Storage Engine
 * New Version School Tools
 *
 * Utilise la bibliothèque promise-based 'idb'
 * Schéma versionné avec migration progressive
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  School,
  AcademicYear,
  SchoolLevel,
  SchoolClass,
  Student,
  Subject,
  ClassSubject,
  Period,
  Assessment,
  Grade,
  CalculationConfig,
} from '../models/types';

export const DB_NAME = 'nv_school_tools_db';
export const DB_VERSION = 1;

export interface SchoolToolsDBSchema extends DBSchema {
  schools: {
    key: string;
    value: School;
  };
  academicYears: {
    key: string;
    value: AcademicYear;
    indexes: { 'by-active': number };
  };
  schoolLevels: {
    key: string;
    value: SchoolLevel;
    indexes: { 'by-type': string };
  };
  classes: {
    key: string;
    value: SchoolClass;
    indexes: { 'by-year': string; 'by-level': string };
  };
  students: {
    key: string;
    value: Student;
    indexes: {
      'by-class': string;
      'by-matricule': string;
      'by-name': string;
    };
  };
  subjects: {
    key: string;
    value: Subject;
    indexes: { 'by-level': string };
  };
  classSubjects: {
    key: string;
    value: ClassSubject;
    indexes: { 'by-class': string; 'by-subject': string };
  };
  periods: {
    key: string;
    value: Period;
    indexes: { 'by-year': string };
  };
  assessments: {
    key: string;
    value: Assessment;
    indexes: {
      'by-class': string;
      'by-subject': string;
      'by-period': string;
    };
  };
  grades: {
    key: string;
    value: Grade;
    indexes: {
      'by-assessment': string;
      'by-student': string;
      'by-student-assessment': [string, string];
    };
  };
  config: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<SchoolToolsDBSchema>> | null = null;

export async function getDatabase(): Promise<IDBPDatabase<SchoolToolsDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<SchoolToolsDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Version 1 : Création initiale des tables
        if (oldVersion < 1) {
          db.createObjectStore('schools', { keyPath: 'id' });

          const yearStore = db.createObjectStore('academicYears', { keyPath: 'id' });
          yearStore.createIndex('by-active', 'active');

          const levelStore = db.createObjectStore('schoolLevels', { keyPath: 'id' });
          levelStore.createIndex('by-type', 'levelType');

          const classStore = db.createObjectStore('classes', { keyPath: 'id' });
          classStore.createIndex('by-year', 'academicYearId');
          classStore.createIndex('by-level', 'schoolLevelId');

          const studentStore = db.createObjectStore('students', { keyPath: 'id' });
          studentStore.createIndex('by-class', 'schoolClassId');
          studentStore.createIndex('by-matricule', 'studentNumber', { unique: true });
          studentStore.createIndex('by-name', 'lastName');

          const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' });
          subjectStore.createIndex('by-level', 'schoolLevelId');

          const csStore = db.createObjectStore('classSubjects', { keyPath: 'id' });
          csStore.createIndex('by-class', 'schoolClassId');
          csStore.createIndex('by-subject', 'subjectId');

          const periodStore = db.createObjectStore('periods', { keyPath: 'id' });
          periodStore.createIndex('by-year', 'academicYearId');

          const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
          assessmentStore.createIndex('by-class', 'schoolClassId');
          assessmentStore.createIndex('by-subject', 'subjectId');
          assessmentStore.createIndex('by-period', 'periodId');

          const gradeStore = db.createObjectStore('grades', { keyPath: 'id' });
          gradeStore.createIndex('by-assessment', 'assessmentId');
          gradeStore.createIndex('by-student', 'studentId');
          gradeStore.createIndex('by-student-assessment', ['studentId', 'assessmentId'], {
            unique: true,
          });

          db.createObjectStore('config', { keyPath: 'key' });
        }
      },
      blocked() {
        console.warn('Base de données bloquée par un autre onglet.');
      },
      blocking() {
        console.warn('Cet onglet bloque une mise à jour de la base.');
      },
    });
  }

  return dbPromise;
}

/**
 * Réinitialise la connexion pour les tests ou la restauration
 */
export function resetDBConnection(): void {
  dbPromise = null;
}
