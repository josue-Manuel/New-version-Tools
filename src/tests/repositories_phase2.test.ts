/**
 * New Version School Tools — Tests Unitaires de l'Architecture des Dépôts (Phase 2)
 *
 * Valide l'ensemble des dépôts spécialisés de l'unité de travail IAppDatabase :
 * 1. Dépôt Élèves (IStudentRepository) : unicité matricule, archivage, filtres
 * 2. Dépôt Classes & Niveaux (IClassRepository)
 * 3. Dépôt Matières & Affectations (ISubjectRepository)
 * 4. Dépôt Évaluations (IAssessmentRepository)
 * 5. Dépôt Notes (IGradeRepository) : distinction note null vs 0, suppression en cascade
 * 6. Dépôt Paiements (IPaymentRepository) : reçus uniques, solde financier élève, annulation
 * 7. Base de Données Unifiée (WebAppDatabase) : instantané d'export/restauration, santé
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebAppDatabase } from '../services/storage/repositories/WebAppDatabase';
import { WebStorageAdapter } from '../services/storage/db/WebStorageAdapter';
import {
  Student,
  SchoolClass,
  SchoolLevel,
  Subject,
  ClassSubject,
  Assessment,
  Grade,
  FeeTransaction,
} from '../domain/types';

/**
 * Mock en mémoire de l'API Storage (W3C localStorage) pour l'exécution des tests.
 */
class MemoryStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('Architecture des Dépôts Métier (Phase 2) — Tests de Cohérence et Intégrité', () => {
  let db: WebAppDatabase;
  let mockStorage: MemoryStorageMock;

  beforeEach(() => {
    mockStorage = new MemoryStorageMock();
    const adapter = new WebStorageAdapter(mockStorage);
    db = new WebAppDatabase(adapter);
  });

  describe('1. Dépôt Élèves (IStudentRepository)', () => {
    const sampleStudent: Student = {
      id: 'stu_001',
      studentNumber: 'CG-PN-2026-0001',
      firstName: 'Christian',
      lastName: 'MOUKASSA',
      gender: 'M',
      schoolClassId: 'cls_tc',
      active: true,
      enrolledAt: '2026-09-15',
    };

    it('enregistre et retrouve un élève par ID et par Matricule', async () => {
      await db.students.save(sampleStudent);

      const byId = await db.students.getById('stu_001');
      expect(byId).not.toBeNull();
      expect(byId?.lastName).toBe('MOUKASSA');

      const byNumber = await db.students.getByStudentNumber('cg-pn-2026-0001'); // insensible à la casse
      expect(byNumber).not.toBeNull();
      expect(byNumber?.id).toBe('stu_001');
    });

    it('rejette strictement l’attribution d’un matricule en doublon', async () => {
      await db.students.save(sampleStudent);

      const duplicate: Student = {
        id: 'stu_002',
        studentNumber: 'CG-PN-2026-0001', // Même matricule
        firstName: 'Yannick',
        lastName: 'MABIALA',
        gender: 'M',
        schoolClassId: 'cls_tc',
        active: true,
        enrolledAt: '2026-09-15',
      };

      await expect(db.students.save(duplicate)).rejects.toThrow(/déjà attribué/);
    });

    it('archive un élève sans détruire son identifiant', async () => {
      await db.students.save(sampleStudent);
      expect((await db.students.getById('stu_001'))?.active).toBe(true);

      await db.students.archive('stu_001');
      const archived = await db.students.getById('stu_001');
      expect(archived?.active).toBe(false);

      // Le filtre actif l'exclut par défaut
      const activeList = await db.students.getAll({ activeOnly: true });
      expect(activeList.find((s) => s.id === 'stu_001')).toBeUndefined();

      // Mais il est toujours présent dans la base
      const fullList = await db.students.getAll({ activeOnly: false });
      expect(fullList.find((s) => s.id === 'stu_001')).toBeDefined();

      // Réactivation
      await db.students.restore('stu_001');
      expect((await db.students.getById('stu_001'))?.active).toBe(true);
    });
  });

  describe('2. Dépôt Classes & Niveaux (IClassRepository)', () => {
    it('gère les niveaux scolaires et les classes avec filtrage', async () => {
      const level: SchoolLevel = {
        id: 'lvl_lycee',
        name: 'Second Cycle (Lycée)',
        levelType: 'secondary',
        code: 'LYC',
      };
      await db.classes.saveLevel(level);

      const schoolClass: SchoolClass = {
        id: 'cls_tc',
        name: 'Terminale C',
        schoolLevelId: 'lvl_lycee',
        academicYearId: 'ay_2025_2026',
        capacity: 45,
      };
      await db.classes.save(schoolClass);

      const levels = await db.classes.getLevels();
      expect(levels).toHaveLength(1);
      expect(levels[0].name).toBe('Second Cycle (Lycée)');

      const classes = await db.classes.getByLevel('lvl_lycee');
      expect(classes).toHaveLength(1);
      expect(classes[0].name).toBe('Terminale C');
    });
  });

  describe('3. Dépôt Matières & Coefficients (ISubjectRepository)', () => {
    it('gère le catalogue des matières et l’affectation avec coefficient par classe', async () => {
      const math: Subject = {
        id: 'sub_math',
        name: 'Mathématiques',
        code: 'MATH',
        schoolLevelId: 'lvl_lycee',
        defaultCoefficient: 5,
        gradingScale: 20,
      };
      await db.subjects.save(math);

      const classSubject: ClassSubject = {
        id: 'cs_tc_math',
        schoolClassId: 'cls_tc',
        subjectId: 'sub_math',
        coefficient: 6, // coefficient spécifique Terminale C
        teacherName: 'M. MAVOUNGOU',
      };
      await db.subjects.saveClassSubject(classSubject);

      const list = await db.subjects.getClassSubjects('cls_tc');
      expect(list).toHaveLength(1);
      expect(list[0].coefficient).toBe(6);
      expect(list[0].teacherName).toBe('M. MAVOUNGOU');
    });
  });

  describe('4. Dépôt Évaluations & Notes (IAssessmentRepository & IGradeRepository)', () => {
    it('distingue fidèlement une note nulle (0/20) d’une note manquante (null)', async () => {
      const assessment: Assessment = {
        id: 'ass_001',
        name: 'Devoir Surveillé N°1',
        subjectId: 'sub_math',
        schoolClassId: 'cls_tc',
        periodId: 'trim_1',
        date: '2026-10-15',
        maxScore: 20,
        coefficient: 2,
      };
      await db.assessments.save(assessment);

      const gradeStudent1: Grade = {
        id: 'grd_001',
        studentId: 'stu_001',
        assessmentId: 'ass_001',
        score: 0, // Note de zéro (copie blanche)
        updatedAt: '2026-10-16',
      };

      const gradeStudent2: Grade = {
        id: 'grd_002',
        studentId: 'stu_002',
        assessmentId: 'ass_001',
        score: null, // Absence non notée / dispensé
        updatedAt: '2026-10-16',
      };

      await db.grades.saveBatch([gradeStudent1, gradeStudent2]);

      const retrieved1 = await db.grades.getGrade('stu_001', 'ass_001');
      const retrieved2 = await db.grades.getGrade('stu_002', 'ass_001');

      expect(retrieved1?.score).toBe(0);
      expect(retrieved2?.score).toBeNull();

      // Le compte des notes renseignées ne prend que les notes non nulles
      const count = await db.grades.count();
      expect(count).toBe(1);
    });

    it('supprime en cascade les notes lorsque l’évaluation est supprimée', async () => {
      const assessment: Assessment = {
        id: 'ass_temp',
        name: 'Interrogation Test',
        subjectId: 'sub_math',
        schoolClassId: 'cls_tc',
        periodId: 'trim_1',
        date: '2026-10-18',
        maxScore: 20,
        coefficient: 1,
      };
      await db.assessments.save(assessment);

      await db.grades.save({
        id: 'grd_temp',
        studentId: 'stu_001',
        assessmentId: 'ass_temp',
        score: 15,
        updatedAt: '2026-10-18',
      });

      expect(await db.grades.getById('grd_temp')).not.toBeNull();

      // Suppression de l'évaluation
      await db.assessments.delete('ass_temp');

      // L'évaluation et la note doivent avoir disparu
      expect(await db.assessments.getById('ass_temp')).toBeNull();
      expect(await db.grades.getById('grd_temp')).toBeNull();
    });
  });

  describe('5. Dépôt Paiements & Trésorerie (IPaymentRepository)', () => {
    it('enregistre un règlement de frais scolaires et calcule le solde élève', async () => {
      const payment1: FeeTransaction = {
        id: 'tx_001',
        receiptNumber: 'REC-2026-0001',
        studentId: 'stu_001',
        amount: 60000,
        installment: 'Frais Inscription',
        paymentMethod: 'Airtel Money Congo',
        timestamp: '2026-09-10T10:00:00Z',
        status: 'Quittancé',
      };

      const payment2: FeeTransaction = {
        id: 'tx_002',
        receiptNumber: 'REC-2026-0002',
        studentId: 'stu_001',
        amount: 50000,
        installment: 'Tranche 1',
        paymentMethod: 'Espèces au Guichet',
        timestamp: '2026-10-05T14:30:00Z',
        status: 'Quittancé',
      };

      await db.payments.save(payment1);
      await db.payments.save(payment2);

      // Total scolarité référence = 220 000 FCFA
      // Payé = 60 000 + 50 000 = 110 000 FCFA
      // Reste dû = 110 000 FCFA
      const balance = await db.payments.getStudentBalance('stu_001', 220000);
      expect(balance.totalPaid).toBe(110000);
      expect(balance.balanceDue).toBe(110000);
      expect(balance.isFullyPaid).toBe(false);
      expect(balance.transactionsCount).toBe(2);

      const totalCollected = await db.payments.getTotalCollected();
      expect(totalCollected).toBe(110000);
    });

    it('rejette les numéros de reçus en doublon', async () => {
      await db.payments.save({
        id: 'tx_001',
        receiptNumber: 'REC-2026-0001',
        studentId: 'stu_001',
        amount: 50000,
        installment: 'Tranche 1',
        paymentMethod: 'Espèces au Guichet',
        timestamp: '2026-09-10',
        status: 'Quittancé',
      });

      await expect(
        db.payments.save({
          id: 'tx_002',
          receiptNumber: 'REC-2026-0001', // Même numéro
          studentId: 'stu_002',
          amount: 25000,
          installment: 'Tranche 1',
          paymentMethod: 'MTN Mobile Money',
          timestamp: '2026-09-11',
          status: 'Quittancé',
        })
      ).rejects.toThrow(/existe déjà/);
    });

    it('permet l’annulation d’un paiement sans effacer la traçabilité comptable', async () => {
      await db.payments.save({
        id: 'tx_annul',
        receiptNumber: 'REC-2026-0099',
        studentId: 'stu_001',
        amount: 50000,
        installment: 'Tranche 1',
        paymentMethod: 'Espèces au Guichet',
        timestamp: '2026-09-10',
        status: 'Quittancé',
      });

      await db.payments.cancelTransaction('tx_annul', 'Erreur de saisie caissier');

      const tx = await db.payments.getById('tx_annul');
      expect(tx?.status).toBe('Annulé');
      expect(tx?.notes).toContain('Erreur de saisie caissier');

      // Ne compte plus dans le total perçu
      const balance = await db.payments.getStudentBalance('stu_001', 100000);
      expect(balance.totalPaid).toBe(0);
    });
  });

  describe('6. Unité de Travail & Export / Restauration (WebAppDatabase)', () => {
    it('exporte et restaure fidèlement un instantané de la base sans perte de données', async () => {
      // 1. Peupler avec des données représentatives
      await db.classes.save({
        id: 'cls_3e',
        name: '3ème A',
        schoolLevelId: 'lvl_college',
        academicYearId: 'ay_2025_2026',
      });
      await db.students.save({
        id: 'stu_10',
        studentNumber: 'CG-PN-2026-0010',
        firstName: 'Esther',
        lastName: 'LOUBAKI',
        gender: 'F',
        schoolClassId: 'cls_3e',
        active: true,
        enrolledAt: '2026-09-20',
      });

      // 2. Export
      const snapshot = await db.exportData();
      expect(snapshot).toBeDefined();
      expect(snapshot.students).toBeDefined();

      // 3. Vider la base
      await db.clear();
      expect(await db.students.getById('stu_10')).toBeNull();
      expect(await db.classes.getById('cls_3e')).toBeNull();

      // 4. Restaurer depuis le snapshot
      await db.restoreData(snapshot);
      const restoredStudent = await db.students.getById('stu_10');
      const restoredClass = await db.classes.getById('cls_3e');

      expect(restoredStudent).not.toBeNull();
      expect(restoredStudent?.lastName).toBe('LOUBAKI');
      expect(restoredClass).not.toBeNull();
      expect(restoredClass?.name).toBe('3ème A');
    });

    it('vérifie l’état de santé de la base', async () => {
      const health = await db.checkHealth();
      expect(health.status).toBe('ok');
      expect(health.isPersistent).toBe(true);
    });
  });
});
