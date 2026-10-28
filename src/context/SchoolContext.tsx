/**
 * Contexte Principal de l'Application Scolaire
 * New Version School Tools
 *
 * Persistance via IndexedDB (ISchoolRepository)
 * Moteur de calcul déterministe découplé
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  StudentTrimesterSummary,
  DatabaseDump,
} from '../core/models/types';
import { schoolRepository } from '../core/storage/repository';
import { generateSeedData } from '../core/storage/seedData';
import { computeClassPeriodSummaries, DEFAULT_CALCULATION_CONFIG } from '../core/calculations/calculationEngine';

export type AppView = 'grades' | 'students' | 'classes' | 'bulletins' | 'reports' | 'backup' | 'settings';

interface SchoolContextType {
  // Navigation & Views
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isLoading: boolean;
  isInitialized: boolean;
  isDemoData: boolean;

  // School & Academic Year
  school: School | null;
  updateSchool: (data: Partial<School>) => Promise<void>;
  academicYears: AcademicYear[];
  activeYear: AcademicYear | null;

  // Levels & Classes
  schoolLevels: SchoolLevel[];
  classes: SchoolClass[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedClass: SchoolClass | null;
  saveClass: (schoolClass: SchoolClass) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Periods
  periods: Period[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  selectedPeriod: Period | null;

  // Students
  students: Student[];
  classStudents: Student[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedStudent: Student | null;
  saveStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  importCSVStudents: (rows: Omit<Student, 'id'>[]) => Promise<number>;

  // Subjects & Assignments
  subjects: Subject[];
  classSubjects: (ClassSubject & { subject: Subject })[];
  saveSubject: (subject: Subject) => Promise<void>;
  saveClassSubject: (cs: ClassSubject) => Promise<void>;

  // Assessments & Grades
  assessments: Assessment[];
  classPeriodAssessments: Assessment[];
  grades: Grade[];
  saveAssessment: (assessment: Assessment) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  saveGradeValue: (studentId: string, assessmentId: string, score: number | null) => Promise<void>;

  // Calculations & Results
  calculationConfig: CalculationConfig;
  updateCalculationConfig: (config: CalculationConfig) => Promise<void>;
  classPeriodSummaries: StudentTrimesterSummary[];

  // Database Management
  refreshData: () => Promise<void>;
  exportDatabase: () => Promise<void>;
  restoreDatabase: (dump: DatabaseDump) => Promise<void>;
  loadDemoData: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('grades');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Entities state
  const [school, setSchool] = useState<School | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [schoolLevels, setSchoolLevels] = useState<SchoolLevel[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rawClassSubjects, setRawClassSubjects] = useState<ClassSubject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [calculationConfig, setCalculationConfig] = useState<CalculationConfig>(DEFAULT_CALCULATION_CONFIG);

  // Initial load
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      let sch = await schoolRepository.getSchool();

      // Si la base locale IndexedDB est vide, charger les données de démonstration initiales
      if (!sch) {
        const seed = generateSeedData();
        await schoolRepository.restoreDatabaseDump(seed);
        sch = await schoolRepository.getSchool();
        setIsDemoData(true);
      } else {
        // Détecter si ce sont des données de démonstration
        setIsDemoData(sch.id.includes('demo') || sch.name.includes('Démonstration'));
      }

      const [years, levels, cls, per, stus, subs, cs, asses, grds, cfg] = await Promise.all([
        schoolRepository.getAcademicYears(),
        schoolRepository.getSchoolLevels(),
        schoolRepository.getClasses(),
        schoolRepository.getPeriods(),
        schoolRepository.getStudents(),
        schoolRepository.getSubjects(),
        schoolRepository.getClassSubjects(),
        schoolRepository.getAssessments(),
        schoolRepository.getGrades(),
        schoolRepository.getCalculationConfig(),
      ]);

      setSchool(sch);
      setAcademicYears(years);
      setSchoolLevels(levels);
      setClasses(cls);
      setPeriods(per);
      setStudents(stus);
      setSubjects(subs);
      setRawClassSubjects(cs);
      setAssessments(asses);
      setGrades(grds);
      setCalculationConfig(cfg || DEFAULT_CALCULATION_CONFIG);

      // Sélections par défaut
      if (cls.length > 0 && !selectedClassId) {
        setSelectedClassId(cls[0].id);
      }
      if (per.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(per[0].id);
      }
      if (stus.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stus[0].id);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Erreur lors du chargement des données IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedPeriodId, selectedStudentId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Active Academic Year
  const activeYear = useMemo(() => {
    return academicYears.find((y) => y.id === school?.academicYearId) || academicYears[0] || null;
  }, [academicYears, school]);

  // Selected Class
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  // Selected Period
  const selectedPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[0] || null;
  }, [periods, selectedPeriodId]);

  // Students of current class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => s.schoolClassId === selectedClassId && s.active);
  }, [students, selectedClassId]);

  // Selected Student
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || classStudents[0] || null;
  }, [students, selectedStudentId, classStudents]);

  // Class subjects joined with Subject entity
  const classSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    const filtered = rawClassSubjects.filter((cs) => cs.schoolClassId === selectedClassId);
    const subMap = new Map(subjects.map((s) => [s.id, s]));

    return filtered
      .map((cs) => {
        const sub = subMap.get(cs.subjectId);
        if (!sub) return null;
        return {
          ...cs,
          subject: sub,
        };
      })
      .filter((item): item is ClassSubject & { subject: Subject } => item !== null);
  }, [rawClassSubjects, selectedClassId, subjects]);

  // Assessments for current class and period
  const classPeriodAssessments = useMemo(() => {
    if (!selectedClassId || !selectedPeriodId) return [];
    return assessments.filter(
      (a) => a.schoolClassId === selectedClassId && a.periodId === selectedPeriodId
    );
  }, [assessments, selectedClassId, selectedPeriodId]);

  // Deterministic Calculation Engine
  const classPeriodSummaries = useMemo(() => {
    if (!selectedClassId || !selectedPeriodId || classStudents.length === 0 || classSubjects.length === 0) {
      return [];
    }
    return computeClassPeriodSummaries(
      classStudents,
      classSubjects,
      assessments,
      grades,
      selectedPeriodId,
      calculationConfig
    );
  }, [classStudents, classSubjects, assessments, grades, selectedPeriodId, calculationConfig]);

  // Actions
  const updateSchool = async (data: Partial<School>) => {
    if (!school) return;
    const updated = { ...school, ...data };
    await schoolRepository.saveSchool(updated);
    setSchool(updated);
  };

  const saveClass = async (schoolClass: SchoolClass) => {
    await schoolRepository.saveClass(schoolClass);
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === schoolClass.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = schoolClass;
        return copy;
      }
      return [...prev, schoolClass];
    });
  };

  const deleteClass = async (id: string) => {
    await schoolRepository.deleteClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    if (selectedClassId === id && classes.length > 1) {
      const remaining = classes.filter((c) => c.id !== id);
      setSelectedClassId(remaining[0].id);
    }
  };

  const saveStudent = async (student: Student) => {
    await schoolRepository.saveStudent(student);
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = student;
        return copy;
      }
      return [...prev, student];
    });
  };

  const deleteStudent = async (id: string) => {
    await schoolRepository.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const importCSVStudents = async (rows: Omit<Student, 'id'>[]): Promise<number> => {
    const newStudents: Student[] = rows.map((r, idx) => ({
      ...r,
      id: `stu_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    await schoolRepository.saveStudentsBatch(newStudents);
    setStudents((prev) => [...prev, ...newStudents]);
    return newStudents.length;
  };

  const saveSubject = async (subject: Subject) => {
    await schoolRepository.saveSubject(subject);
    setSubjects((prev) => {
      const idx = prev.findIndex((s) => s.id === subject.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = subject;
        return copy;
      }
      return [...prev, subject];
    });
  };

  const saveClassSubject = async (cs: ClassSubject) => {
    await schoolRepository.saveClassSubject(cs);
    setRawClassSubjects((prev) => {
      const idx = prev.findIndex((item) => item.id === cs.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = cs;
        return copy;
      }
      return [...prev, cs];
    });
  };

  const saveAssessment = async (assessment: Assessment) => {
    await schoolRepository.saveAssessment(assessment);
    setAssessments((prev) => {
      const idx = prev.findIndex((a) => a.id === assessment.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = assessment;
        return copy;
      }
      return [...prev, assessment];
    });
  };

  const deleteAssessment = async (id: string) => {
    await schoolRepository.deleteAssessment(id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    setGrades((prev) => prev.filter((g) => g.assessmentId !== id));
  };

  const saveGradeValue = async (studentId: string, assessmentId: string, score: number | null) => {
    const existing = grades.find((g) => g.studentId === studentId && g.assessmentId === assessmentId);
    const updatedGrade: Grade = {
      id: existing ? existing.id : `grd_${studentId}_${assessmentId}`,
      studentId,
      assessmentId,
      score,
      updatedAt: new Date().toISOString(),
    };

    await schoolRepository.saveGrade(updatedGrade);

    setGrades((prev) => {
      const idx = prev.findIndex((g) => g.studentId === studentId && g.assessmentId === assessmentId);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updatedGrade;
        return copy;
      }
      return [...prev, updatedGrade];
    });
  };

  const updateCalculationConfig = async (config: CalculationConfig) => {
    await schoolRepository.saveCalculationConfig(config);
    setCalculationConfig(config);
  };

  const exportDatabase = async () => {
    const dump = await schoolRepository.exportDatabaseDump();
    const jsonStr = JSON.stringify(dump, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sauvegarde_SchoolTools_${dump.school.code}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreDatabase = async (dump: DatabaseDump) => {
    await schoolRepository.restoreDatabaseDump(dump);
    await loadAllData();
  };

  const loadDemoData = async () => {
    const seed = generateSeedData();
    await schoolRepository.restoreDatabaseDump(seed);
    await loadAllData();
  };

  return (
    <SchoolContext.Provider
      value={{
        activeView,
        setActiveView,
        isLoading,
        isInitialized,
        isDemoData,
        school,
        updateSchool,
        academicYears,
        activeYear,
        schoolLevels,
        classes,
        selectedClassId,
        setSelectedClassId,
        selectedClass,
        saveClass,
        deleteClass,
        periods,
        selectedPeriodId,
        setSelectedPeriodId,
        selectedPeriod,
        students,
        classStudents,
        selectedStudentId,
        setSelectedStudentId,
        selectedStudent,
        saveStudent,
        deleteStudent,
        importCSVStudents,
        subjects,
        classSubjects,
        saveSubject,
        saveClassSubject,
        assessments,
        classPeriodAssessments,
        grades,
        saveAssessment,
        deleteAssessment,
        saveGradeValue,
        calculationConfig,
        updateCalculationConfig,
        classPeriodSummaries,
        refreshData: loadAllData,
        exportDatabase,
        restoreDatabase,
        loadDemoData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    throw new Error('useSchool doit être utilisé au sein d’un SchoolProvider');
  }
  return ctx;
}
