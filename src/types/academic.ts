export type SeriesId = 'TC' | 'TD' | 'TA4' | '2ndeS';

export interface SubjectConfig {
  id: string;
  name: string;
  shortName: string;
  coefficient: number;
  teacherName: string;
  category: 'scientific' | 'literary' | 'general' | 'sports';
}

export interface SeriesConfig {
  id: SeriesId;
  name: string;
  cycle: string;
  totalCoefficients: number;
  subjects: SubjectConfig[];
}

export interface Student {
  id: string;
  matricule: string; // e.g., CG-PN-2026-0412
  lastName: string;
  firstName: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  classId: SeriesId;
  enrollmentDate: string;
  status: 'Inscrit' | 'Boursier' | 'Dispense' | 'En attente';
  parentName: string;
  parentPhone: string;
  address: string;
  photoUrl?: string;
  conductScore: number; // /20
  unexcusedAbsences: number; // hours
  excusedAbsences: number;
}

export interface SubjectGrade {
  interrogation: number | null; // Note de cours /20
  devoir1: number | null;        // Devoir surveillé 1 /20
  composition: number | null;   // Composition trimestrielle /20
  finalMark: number | null;     // Moyenne de la discipline /20
  appreciation: string;
}

// Student grades for a specific trimester
// Key: subjectId -> SubjectGrade
export type TrimesterGrades = Record<string, SubjectGrade>;

export interface StudentTrimesterRecord {
  studentId: string;
  trimester: 1 | 2 | 3;
  grades: TrimesterGrades;
  generalAverage: number | null;
  totalWeightedPoints: number;
  rank: number | null;
  mention: string;
  councilDecision: string;
  published: boolean;
  lastUpdated: string;
}

export interface FeeTransaction {
  id: string;
  receiptNumber: string; // e.g., REC-2026-0891
  studentId: string;
  studentMatricule: string;
  studentName: string;
  classId: SeriesId;
  amount: number; // in FCFA (XAF)
  installment: 'Frais Inscription' | 'Tranche 1' | 'Tranche 2' | 'Tranche 3' | 'Frais Examen Bac';
  paymentMethod: 'Airtel Money Congo' | 'MTN Mobile Money' | 'Espèces au Guichet' | 'Virement Bancaire (BGFI)';
  transactionReference: string;
  cashierName: string;
  timestamp: string;
  status: 'Validé' | 'Quittancé' | 'Annulé';
  notes?: string;
}

export interface LocalMutation {
  id: string;
  timestamp: string;
  actionType: 'UPDATE_GRADE' | 'RECORD_PAYMENT' | 'ENROLL_STUDENT' | 'PUBLISH_BULLETIN';
  entity: string;
  summary: string;
  payload: any;
}

export interface SchoolProfile {
  name: string;
  acronym: string;
  ministry: string;
  direction: string;
  city: string;
  district: string;
  code: string;
  directorName: string;
  directorTitle: string;
  academicYear: string;
  phone: string;
  motto: string;
}
