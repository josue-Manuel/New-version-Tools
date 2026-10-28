import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  SeriesConfig,
  SeriesId,
  Student,
  StudentTrimesterRecord,
  FeeTransaction,
  LocalMutation,
  SchoolProfile,
} from '../types/academic';
import {
  INITIAL_SERIES,
  INITIAL_STUDENTS,
  INITIAL_GRADES_RECORD,
  INITIAL_TRANSACTIONS,
  INITIAL_SCHOOL_PROFILE,
} from '../data/initialData';

interface AcademicContextType {
  // Navigation & Hierarchy
  seriesList: SeriesConfig[];
  selectedSeriesId: SeriesId;
  setSelectedSeriesId: (id: SeriesId) => void;
  currentSeries: SeriesConfig;
  trimester: 1 | 2 | 3;
  setTrimester: (t: 1 | 2 | 3) => void;
  activeModule: 'matrix' | 'roster' | 'ledger' | 'bulletins' | 'settings';
  setActiveModule: (m: 'matrix' | 'roster' | 'ledger' | 'bulletins' | 'settings') => void;

  // Students & Dossiers
  students: Student[];
  currentClassStudents: Student[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedStudent: Student | null;
  addStudent: (data: Omit<Student, 'id' | 'matricule' | 'enrollmentDate'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;

  // Grades & Records
  gradesRecord: Record<string, StudentTrimesterRecord>;
  updateGradeCell: (studentId: string, trimester: 1 | 2 | 3, subjectId: string, mark: number | null) => void;
  publishTrimester: (seriesId: SeriesId, trimester: 1 | 2 | 3) => void;
  getStudentTrimesterData: (studentId: string, trimester: 1 | 2 | 3) => StudentTrimesterRecord | null;
  recalculateAllAverages: () => void;

  // Finance & Treasury
  transactions: FeeTransaction[];
  addTransaction: (data: Omit<FeeTransaction, 'id' | 'receiptNumber' | 'timestamp' | 'status'>) => void;
  getStudentBalance: (studentId: string) => { totalBilled: number; totalPaid: number; balanceDue: number };

  // School Profile & Config
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  updateSeriesSubjectCoef: (seriesId: SeriesId, subjectId: string, newCoef: number) => void;

  // Local-First & Connectivity State
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  toggleOnlineMode: () => void;
  offlineQueue: LocalMutation[];
  isSyncing: boolean;
  lastSyncTime: string;
  syncOfflineQueue: () => Promise<void>;
  resetToDefaultData: () => void;
}

const AcademicContext = createContext<AcademicContextType | null>(null);

const STORAGE_KEYS = {
  SERIES: 'eac_series_v1',
  STUDENTS: 'eac_students_v1',
  GRADES: 'eac_grades_v1',
  TRANSACTIONS: 'eac_transactions_v1',
  PROFILE: 'eac_profile_v1',
  OFFLINE_QUEUE: 'eac_offline_queue_v1',
  LAST_SYNC: 'eac_last_sync_v1',
  IS_ONLINE: 'eac_is_online_v1',
};

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or seed
  const [seriesList, setSeriesList] = useState<SeriesConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERIES);
    return saved ? JSON.parse(saved) : INITIAL_SERIES;
  });

  const [selectedSeriesId, setSelectedSeriesId] = useState<SeriesId>('TC');
  const [trimester, setTrimester] = useState<1 | 2 | 3>(1);
  const [activeModule, setActiveModule] = useState<'matrix' | 'roster' | 'ledger' | 'bulletins' | 'settings'>('matrix');

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('stu-1');

  const [gradesRecord, setGradesRecord] = useState<Record<string, StudentTrimesterRecord>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GRADES);
    return saved ? JSON.parse(saved) : INITIAL_GRADES_RECORD;
  });

  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_PROFILE;
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [offlineQueue, setOfflineQueue] = useState<LocalMutation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return saved ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || 'Aujourd’hui à 15:28 (Brazzaville)';
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(seriesList));
  }, [seriesList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(gradesRecord));
  }, [gradesRecord]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_ONLINE, JSON.stringify(isOnline));
  }, [isOnline]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Derived: Current Series config
  const currentSeries = useMemo(() => {
    return seriesList.find((s) => s.id === selectedSeriesId) || seriesList[0];
  }, [seriesList, selectedSeriesId]);

  // Derived: Current Class Students
  const currentClassStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedSeriesId);
  }, [students, selectedSeriesId]);

  // Selected Student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || currentClassStudents[0] || null;
  }, [students, selectedStudentId, currentClassStudents]);

  // Queue mutation helper for offline changes
  const recordMutation = useCallback(
    (actionType: LocalMutation['actionType'], entity: string, summary: string, payload: any) => {
      if (!isOnline) {
        const mutation: LocalMutation = {
          id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          actionType,
          entity,
          summary,
          payload,
        };
        setOfflineQueue((prev) => [mutation, ...prev]);
      }
    },
    [isOnline]
  );

  // Compute mentions and decisions
  const computeMention = (average: number): { mention: string; decision: string } => {
    if (average >= 16.0) {
      return { mention: 'Très Bien', decision: 'Félicitations du Conseil et Tableau d’Honneur' };
    }
    if (average >= 14.0) {
      return { mention: 'Bien', decision: 'Tableau d’Honneur avec Encouragements' };
    }
    if (average >= 12.0) {
      return { mention: 'Assez Bien', decision: 'Encouragements du Conseil' };
    }
    if (average >= 10.0) {
      return { mention: 'Passable', decision: 'Admis — Travail régulier' };
    }
    if (average >= 8.5) {
      return { mention: 'Ajourné', decision: 'Avertissement Travail — Risque d’échec' };
    }
    return { mention: 'Ajourné', decision: 'Blâme pour manque flagrant de travail' };
  };

  // Update a single grade cell in a student's trimester record
  const updateGradeCell = useCallback(
    (studentId: string, trim: 1 | 2 | 3, subjectId: string, mark: number | null) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const series = seriesList.find((s) => s.id === student.classId);
      if (!series) return;

      const recordKey = `${studentId}-T${trim}`;

      setGradesRecord((prev) => {
        const existingRecord = prev[recordKey];
        const existingGrades = existingRecord?.grades || {};
        const currentSubjectGrade = existingGrades[subjectId] || {
          interrogation: null,
          devoir1: null,
          composition: null,
          finalMark: null,
          appreciation: '',
        };

        const updatedGrades = {
          ...existingGrades,
          [subjectId]: {
            ...currentSubjectGrade,
            finalMark: mark,
          },
        };

        // Recalculate weighted total and general average
        let totalWeighted = 0;
        let totalCoef = 0;

        series.subjects.forEach((subj) => {
          const val = updatedGrades[subj.id]?.finalMark;
          if (val !== null && val !== undefined && !isNaN(val)) {
            totalWeighted += val * subj.coefficient;
            totalCoef += subj.coefficient;
          }
        });

        const generalAverage = totalCoef > 0 ? parseFloat((totalWeighted / totalCoef).toFixed(2)) : null;
        const { mention, decision } = generalAverage !== null ? computeMention(generalAverage) : { mention: '—', decision: 'En attente des notes' };

        const updatedRecord: StudentTrimesterRecord = {
          studentId,
          trimester: trim,
          grades: updatedGrades,
          totalWeightedPoints: parseFloat(totalWeighted.toFixed(2)),
          generalAverage,
          rank: existingRecord?.rank || null,
          mention,
          councilDecision: decision,
          published: false,
          lastUpdated: new Date().toISOString(),
        };

        return {
          ...prev,
          [recordKey]: updatedRecord,
        };
      });

      // Track offline mutation
      recordMutation(
        'UPDATE_GRADE',
        `Élève ${student.lastName} (${student.matricule})`,
        `Mise à jour note ${subjectId.toUpperCase()}: ${mark !== null ? mark + '/20' : 'Vide'} (T${trim})`,
        { studentId, trimester: trim, subjectId, mark }
      );
    },
    [students, seriesList, recordMutation]
  );

  // Recalculate rank across the whole class for selected series and trimester
  const recalculateAllAverages = useCallback(() => {
    setGradesRecord((prev) => {
      const copy = { ...prev };
      const classStudents = students.filter((s) => s.classId === selectedSeriesId);

      // Collect averages
      const scores = classStudents.map((s) => {
        const key = `${s.id}-T${trimester}`;
        return {
          studentId: s.id,
          key,
          avg: copy[key]?.generalAverage ?? -1,
        };
      });

      // Sort descending
      scores.sort((a, b) => b.avg - a.avg);

      scores.forEach((item, index) => {
        if (copy[item.key]) {
          copy[item.key] = {
            ...copy[item.key],
            rank: item.avg >= 0 ? index + 1 : null,
          };
        }
      });

      return copy;
    });
  }, [students, selectedSeriesId, trimester]);

  // Run initial rank calculation whenever class or trimester changes
  useEffect(() => {
    recalculateAllAverages();
  }, [recalculateAllAverages]);

  // Publish trimester grades (locking and signing official deliberation)
  const publishTrimester = useCallback(
    (seriesId: SeriesId, trim: 1 | 2 | 3) => {
      const classStudents = students.filter((s) => s.classId === seriesId);
      setGradesRecord((prev) => {
        const copy = { ...prev };
        classStudents.forEach((st) => {
          const key = `${st.id}-T${trim}`;
          if (copy[key]) {
            copy[key] = {
              ...copy[key],
              published: true,
              lastUpdated: new Date().toISOString(),
            };
          }
        });
        return copy;
      });

      recordMutation(
        'PUBLISH_BULLETIN',
        `Série ${seriesId} — Trimestre ${trim}`,
        `Délibération officielle validée et procès-verbal verrouillé pour ${classStudents.length} élèves`,
        { seriesId, trimester: trim }
      );
    },
    [students, recordMutation]
  );

  // Add new enrolled student
  const addStudent = useCallback(
    (data: Omit<Student, 'id' | 'matricule' | 'enrollmentDate'>) => {
      const year = 2026;
      const count = students.length + 1;
      const matricule = `CG-PN-${year}-${String(410 + count).padStart(4, '0')}`;
      const newStudent: Student = {
        ...data,
        id: `stu-${Date.now()}`,
        matricule,
        enrollmentDate: new Date().toISOString().split('T')[0],
      };

      setStudents((prev) => [newStudent, ...prev]);

      recordMutation(
        'ENROLL_STUDENT',
        `${newStudent.lastName} ${newStudent.firstName}`,
        `Nouvelle immatriculation officielle: ${matricule} (${data.classId})`,
        newStudent
      );
    },
    [students.length, recordMutation]
  );

  // Update student dossier
  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  // Add payment transaction
  const addTransaction = useCallback(
    (data: Omit<FeeTransaction, 'id' | 'receiptNumber' | 'timestamp' | 'status'>) => {
      const receiptNumber = `REC-2026-${String(850 + transactions.length + 1).padStart(4, '0')}`;
      const newTx: FeeTransaction = {
        ...data,
        id: `tx-${Date.now()}`,
        receiptNumber,
        timestamp: new Date().toISOString(),
        status: 'Quittancé',
      };

      setTransactions((prev) => [newTx, ...prev]);

      recordMutation(
        'RECORD_PAYMENT',
        `Reçu N° ${receiptNumber} — ${data.studentName}`,
        `Encaissement de ${data.amount.toLocaleString('fr-CG')} FCFA (${data.installment})`,
        newTx
      );
    },
    [transactions.length, recordMutation]
  );

  // Calculate student balance
  const getStudentBalance = useCallback(
    (studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      // Standard Congolese lycée tuition rates:
      // Inscription: 60 000 FCFA, T1: 50 000 FCFA, T2: 50 000 FCFA, T3: 45 000 FCFA, Examen Bac: 15 000 FCFA
      const standardTuition = student?.status === 'Boursier' ? 90000 : 220000;
      const studentTxList = transactions.filter((t) => t.studentId === studentId && t.status !== 'Annulé');
      const totalPaid = studentTxList.reduce((acc, t) => acc + t.amount, 0);
      const balanceDue = Math.max(0, standardTuition - totalPaid);

      return {
        totalBilled: standardTuition,
        totalPaid,
        balanceDue,
      };
    },
    [students, transactions]
  );

  // Update school profile
  const updateSchoolProfile = useCallback((profile: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...profile }));
  }, []);

  // Update subject coefficient
  const updateSeriesSubjectCoef = useCallback((seriesId: SeriesId, subjectId: string, newCoef: number) => {
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id !== seriesId) return s;
        const updatedSubjects = s.subjects.map((sub) => (sub.id === subjectId ? { ...sub, coefficient: newCoef } : sub));
        const totalCoefficients = updatedSubjects.reduce((acc, curr) => acc + curr.coefficient, 0);
        return {
          ...s,
          subjects: updatedSubjects,
          totalCoefficients,
        };
      })
    );
  }, []);

  // Offline / Online toggle
  const toggleOnlineMode = useCallback(() => {
    setIsOnline((prev) => !prev);
  }, []);

  // Offline queue synchronization
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);

    // Simulate high-reliability handshake with DDEPS Pointe-Noire ministerial server
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const syncDate = new Date();
    const formatted = `Aujourd’hui à ${syncDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (DDEPS Pointe-Noire)`;

    setOfflineQueue([]);
    setLastSyncTime(formatted);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, formatted);
    setIsSyncing(false);
  }, [offlineQueue]);

  // Reset to default data
  const resetToDefaultData = useCallback(() => {
    localStorage.clear();
    setSeriesList(INITIAL_SERIES);
    setStudents(INITIAL_STUDENTS);
    setGradesRecord(INITIAL_GRADES_RECORD);
    setTransactions(INITIAL_TRANSACTIONS);
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setOfflineQueue([]);
    setIsOnline(true);
  }, []);

  const getStudentTrimesterData = useCallback(
    (studentId: string, trim: 1 | 2 | 3) => {
      const key = `${studentId}-T${trim}`;
      return gradesRecord[key] || null;
    },
    [gradesRecord]
  );

  return (
    <AcademicContext.Provider
      value={{
        seriesList,
        selectedSeriesId,
        setSelectedSeriesId,
        currentSeries,
        trimester,
        setTrimester,
        activeModule,
        setActiveModule,
        students,
        currentClassStudents,
        selectedStudentId,
        setSelectedStudentId,
        selectedStudent,
        addStudent,
        updateStudent,
        gradesRecord,
        updateGradeCell,
        publishTrimester,
        getStudentTrimesterData,
        recalculateAllAverages,
        transactions,
        addTransaction,
        getStudentBalance,
        schoolProfile,
        updateSchoolProfile,
        updateSeriesSubjectCoef,
        isOnline,
        setIsOnline,
        toggleOnlineMode,
        offlineQueue,
        isSyncing,
        lastSyncTime,
        syncOfflineQueue,
        resetToDefaultData,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
