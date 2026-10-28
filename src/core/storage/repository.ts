/**
 * Abstraction de Stockage & Repository Pattern
 * New Version School Tools
 *
 * Cette interface découple l'accès aux données de l'implémentation sous-jacente (IndexedDB).
 * Elle prépare l'intégration future avec une API distante et une synchronisation multi-utilisateurs.
 */

import { getDatabase, resetDBConnection } from './indexedDB';
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
  DatabaseDump,
} from '../models/types';
import { DEFAULT_CALCULATION_CONFIG } from '../calculations/calculationEngine';

export interface ISchoolRepository {
  // School & Years
  getSchool(): Promise<School | null>;
  saveSchool(school: School): Promise<void>;
  getAcademicYears(): Promise<AcademicYear[]>;
  saveAcademicYear(year: AcademicYear): Promise<void>;
  getActiveAcademicYear(): Promise<AcademicYear | null>;

  // Levels & Classes
  getSchoolLevels(): Promise<SchoolLevel[]>;
  saveSchoolLevel(level: SchoolLevel): Promise<void>;
  getClasses(academicYearId?: string): Promise<SchoolClass[]>;
  saveClass(schoolClass: SchoolClass): Promise<void>;
  deleteClass(classId: string): Promise<void>;

  // Students
  getStudents(classId?: string): Promise<Student[]>;
  getStudentById(id: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  saveStudentsBatch(students: Student[]): Promise<void>;
  deleteStudent(id: string): Promise<void>;

  // Subjects & Assignments
  getSubjects(levelId?: string): Promise<Subject[]>;
  saveSubject(subject: Subject): Promise<void>;
  getClassSubjects(classId?: string): Promise<ClassSubject[]>;
  saveClassSubject(classSubject: ClassSubject): Promise<void>;

  // Periods
  getPeriods(academicYearId?: string): Promise<Period[]>;
  savePeriod(period: Period): Promise<void>;

  // Assessments
  getAssessments(classId?: string, periodId?: string, subjectId?: string): Promise<Assessment[]>;
  saveAssessment(assessment: Assessment): Promise<void>;
  deleteAssessment(assessmentId: string): Promise<void>;

  // Grades
  getGrades(assessmentId?: string, studentId?: string): Promise<Grade[]>;
  getGradesForClassAndPeriod(classId: string, periodId: string): Promise<Grade[]>;
  saveGrade(grade: Grade): Promise<void>;
  saveGradesBatch(grades: Grade[]): Promise<void>;

  // Config
  getCalculationConfig(): Promise<CalculationConfig>;
  saveCalculationConfig(config: CalculationConfig): Promise<void>;

  // Backup & Restore
  exportDatabaseDump(): Promise<DatabaseDump>;
  restoreDatabaseDump(dump: DatabaseDump): Promise<void>;
  clearDatabase(): Promise<void>;
}

export class IndexedDBRepository implements ISchoolRepository {
  async getSchool(): Promise<School | null> {
    const db = await getDatabase();
    const schools = await db.getAll('schools');
    return schools[0] || null;
  }

  async saveSchool(school: School): Promise<void> {
    const db = await getDatabase();
    await db.put('schools', school);
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    const db = await getDatabase();
    return await db.getAll('academicYears');
  }

  async saveAcademicYear(year: AcademicYear): Promise<void> {
    const db = await getDatabase();
    await db.put('academicYears', year);
  }

  async getActiveAcademicYear(): Promise<AcademicYear | null> {
    const years = await this.getAcademicYears();
    return years.find((y) => y.active) || years[0] || null;
  }

  async getSchoolLevels(): Promise<SchoolLevel[]> {
    const db = await getDatabase();
    return await db.getAll('schoolLevels');
  }

  async saveSchoolLevel(level: SchoolLevel): Promise<void> {
    const db = await getDatabase();
    await db.put('schoolLevels', level);
  }

  async getClasses(academicYearId?: string): Promise<SchoolClass[]> {
    const db = await getDatabase();
    if (academicYearId) {
      return await db.getAllFromIndex('classes', 'by-year', academicYearId);
    }
    return await db.getAll('classes');
  }

  async saveClass(schoolClass: SchoolClass): Promise<void> {
    const db = await getDatabase();
    await db.put('classes', schoolClass);
  }

  async deleteClass(classId: string): Promise<void> {
    const db = await getDatabase();
    await db.delete('classes', classId);
  }

  async getStudents(classId?: string): Promise<Student[]> {
    const db = await getDatabase();
    if (classId) {
      return await db.getAllFromIndex('students', 'by-class', classId);
    }
    return await db.getAll('students');
  }

  async getStudentById(id: string): Promise<Student | null> {
    const db = await getDatabase();
    return (await db.get('students', id)) || null;
  }

  async saveStudent(student: Student): Promise<void> {
    const db = await getDatabase();
    await db.put('students', student);
  }

  async saveStudentsBatch(students: Student[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction('students', 'readwrite');
    for (const student of students) {
      await tx.store.put(student);
    }
    await tx.done;
  }

  async deleteStudent(id: string): Promise<void> {
    const db = await getDatabase();
    await db.delete('students', id);
  }

  async getSubjects(levelId?: string): Promise<Subject[]> {
    const db = await getDatabase();
    if (levelId) {
      return await db.getAllFromIndex('subjects', 'by-level', levelId);
    }
    return await db.getAll('subjects');
  }

  async saveSubject(subject: Subject): Promise<void> {
    const db = await getDatabase();
    await db.put('subjects', subject);
  }

  async getClassSubjects(classId?: string): Promise<ClassSubject[]> {
    const db = await getDatabase();
    if (classId) {
      return await db.getAllFromIndex('classSubjects', 'by-class', classId);
    }
    return await db.getAll('classSubjects');
  }

  async saveClassSubject(classSubject: ClassSubject): Promise<void> {
    const db = await getDatabase();
    await db.put('classSubjects', classSubject);
  }

  async getPeriods(academicYearId?: string): Promise<Period[]> {
    const db = await getDatabase();
    if (academicYearId) {
      return await db.getAllFromIndex('periods', 'by-year', academicYearId);
    }
    return await db.getAll('periods');
  }

  async savePeriod(period: Period): Promise<void> {
    const db = await getDatabase();
    await db.put('periods', period);
  }

  async getAssessments(classId?: string, periodId?: string, subjectId?: string): Promise<Assessment[]> {
    const db = await getDatabase();
    let list: Assessment[] = [];

    if (classId) {
      list = await db.getAllFromIndex('assessments', 'by-class', classId);
    } else {
      list = await db.getAll('assessments');
    }

    if (periodId) {
      list = list.filter((a) => a.periodId === periodId);
    }
    if (subjectId) {
      list = list.filter((a) => a.subjectId === subjectId);
    }

    return list;
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    const db = await getDatabase();
    await db.put('assessments', assessment);
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction(['assessments', 'grades'], 'readwrite');
    await tx.objectStore('assessments').delete(assessmentId);

    // Supprimer les notes associées
    const gradeIndex = tx.objectStore('grades').index('by-assessment');
    let cursor = await gradeIndex.openCursor(assessmentId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  async getGrades(assessmentId?: string, studentId?: string): Promise<Grade[]> {
    const db = await getDatabase();
    if (assessmentId) {
      return await db.getAllFromIndex('grades', 'by-assessment', assessmentId);
    }
    if (studentId) {
      return await db.getAllFromIndex('grades', 'by-student', studentId);
    }
    return await db.getAll('grades');
  }

  async getGradesForClassAndPeriod(classId: string, periodId: string): Promise<Grade[]> {
    const assessments = await this.getAssessments(classId, periodId);
    const assessmentIds = new Set(assessments.map((a) => a.id));

    const db = await getDatabase();
    const allGrades = await db.getAll('grades');
    return allGrades.filter((g) => assessmentIds.has(g.assessmentId));
  }

  async saveGrade(grade: Grade): Promise<void> {
    const db = await getDatabase();
    await db.put('grades', grade);
  }

  async saveGradesBatch(grades: Grade[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction('grades', 'readwrite');
    for (const g of grades) {
      await tx.store.put(g);
    }
    await tx.done;
  }

  async getCalculationConfig(): Promise<CalculationConfig> {
    const db = await getDatabase();
    const cfg = await db.get('config', 'calculationConfig');
    return cfg ? cfg.value : DEFAULT_CALCULATION_CONFIG;
  }

  async saveCalculationConfig(config: CalculationConfig): Promise<void> {
    const db = await getDatabase();
    await db.put('config', { key: 'calculationConfig', value: config });
  }

  async exportDatabaseDump(): Promise<DatabaseDump> {
    const school = (await this.getSchool()) || {
      id: 'sch_default',
      name: 'Établissement Démonstration',
      city: 'Pointe-Noire',
      country: 'Congo-Brazzaville',
      code: 'CG-PN-DEMO',
      academicYearId: 'ay_2025_2026',
    };

    const academicYears = await this.getAcademicYears();
    const schoolLevels = await this.getSchoolLevels();
    const classes = await this.getClasses();
    const students = await this.getStudents();
    const subjects = await this.getSubjects();
    const classSubjects = await this.getClassSubjects();
    const periods = await this.getPeriods();
    const assessments = await this.getAssessments();
    const grades = await this.getGrades();
    const calculationConfig = await this.getCalculationConfig();

    return {
      metadata: {
        version: '1.0.0',
        software: 'New Version School Tools',
        publisher: 'New Version',
        exportedAt: new Date().toISOString(),
        schoolId: school.id,
        schoolName: school.name,
        academicYear: academicYears.find((y) => y.id === school.academicYearId)?.label || '2025-2026',
        recordCounts: {
          schools: 1,
          academicYears: academicYears.length,
          levels: schoolLevels.length,
          classes: classes.length,
          students: students.length,
          subjects: subjects.length,
          classSubjects: classSubjects.length,
          periods: periods.length,
          assessments: assessments.length,
          grades: grades.length,
        },
      },
      school,
      academicYears,
      schoolLevels,
      classes,
      students,
      subjects,
      classSubjects,
      periods,
      assessments,
      grades,
      calculationConfig,
    };
  }

  async restoreDatabaseDump(dump: DatabaseDump): Promise<void> {
    const db = await getDatabase();

    const stores = [
      'schools',
      'academicYears',
      'schoolLevels',
      'classes',
      'students',
      'subjects',
      'classSubjects',
      'periods',
      'assessments',
      'grades',
      'config',
    ] as const;

    const tx = db.transaction(stores as any, 'readwrite');

    // Vider les tables
    for (const s of stores) {
      await (tx as any).objectStore(s).clear();
    }

    // Réinsérer les entités
    await (tx as any).objectStore('schools').put(dump.school);

    for (const item of dump.academicYears) await (tx as any).objectStore('academicYears').put(item);
    for (const item of dump.schoolLevels) await (tx as any).objectStore('schoolLevels').put(item);
    for (const item of dump.classes) await (tx as any).objectStore('classes').put(item);
    for (const item of dump.students) await (tx as any).objectStore('students').put(item);
    for (const item of dump.subjects) await (tx as any).objectStore('subjects').put(item);
    for (const item of dump.classSubjects) await (tx as any).objectStore('classSubjects').put(item);
    for (const item of dump.periods) await (tx as any).objectStore('periods').put(item);
    for (const item of dump.assessments) await (tx as any).objectStore('assessments').put(item);
    for (const item of dump.grades) await (tx as any).objectStore('grades').put(item);

    await (tx as any).objectStore('config').put({ key: 'calculationConfig', value: dump.calculationConfig });

    await tx.done;
  }

  async clearDatabase(): Promise<void> {
    const db = await getDatabase();
    const stores = [
      'schools',
      'academicYears',
      'schoolLevels',
      'classes',
      'students',
      'subjects',
      'classSubjects',
      'periods',
      'assessments',
      'grades',
      'config',
    ] as const;

    const tx = db.transaction(stores as any, 'readwrite');
    for (const s of stores) {
      await (tx as any).objectStore(s).clear();
    }
    await tx.done;
  }
}

// Instance singleton
export const schoolRepository = new IndexedDBRepository();
