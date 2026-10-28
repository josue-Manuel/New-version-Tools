import { describe, it, expect } from 'vitest';
import {
  validateStudent,
  validateAssessment,
  validateGradeInput,
  validateBackupFileStructure,
} from '../core/validation/validators';
import { parseStudentsCSV } from '../core/export/csvImportExport';
import { Student } from '../core/models/types';

describe('Data Validation Suite (Validations Métier)', () => {
  it('valide avec succès un élève complet et conforme', () => {
    const student: Partial<Student> = {
      lastName: 'MOUKASSA',
      firstName: 'Christian',
      studentNumber: 'CG-PN-2026-0042',
      gender: 'M',
      schoolClassId: 'cls_tc',
    };
    const errors = validateStudent(student);
    expect(errors).toHaveLength(0);
  });

  it('détecte et rejette les champs obligatoires manquants pour un élève', () => {
    const errors = validateStudent({});
    expect(errors.some((e) => e.field === 'lastName')).toBe(true);
    expect(errors.some((e) => e.field === 'firstName')).toBe(true);
    expect(errors.some((e) => e.field === 'studentNumber')).toBe(true);
    expect(errors.some((e) => e.field === 'gender')).toBe(true);
    expect(errors.some((e) => e.field === 'schoolClassId')).toBe(true);
  });

  it('empêche strictement l’attribution de matricules en doublon au sein de l’établissement', () => {
    const existing: Student[] = [
      {
        id: 's1',
        studentNumber: 'CG-PN-2026-0042',
        firstName: 'Christian',
        lastName: 'MOUKASSA',
        gender: 'M',
        schoolClassId: 'c1',
        active: true,
      },
    ];

    const duplicateStudent: Partial<Student> = {
      id: 's2',
      studentNumber: 'cg-pn-2026-0042', // Casse différente mais même matricule normalisé
      firstName: 'Yannick',
      lastName: 'MABIALA',
      gender: 'M',
      schoolClassId: 'c1',
    };

    const errors = validateStudent(duplicateStudent, existing);
    expect(errors.some((e) => e.field === 'studentNumber')).toBe(true);
    expect(errors[0].message).toContain('déjà attribué');
  });

  it('valide la saisie d’une note et autorise les notes manquantes', () => {
    expect(validateGradeInput('', 20).valid).toBe(true);
    expect(validateGradeInput('', 20).score).toBeNull();

    expect(validateGradeInput('15.5', 20).valid).toBe(true);
    expect(validateGradeInput('15.5', 20).score).toBe(15.5);

    expect(validateGradeInput('14,75', 20).valid).toBe(true);
    expect(validateGradeInput('14,75', 20).score).toBe(14.75);

    expect(validateGradeInput('21', 20).valid).toBe(false);
    expect(validateGradeInput('-2', 20).valid).toBe(false);
    expect(validateGradeInput('abc', 20).valid).toBe(false);
  });

  it('analyse un fichier CSV et détecte les doublons internes et externes', () => {
    const existing: Student[] = [
      {
        id: 's1',
        studentNumber: 'CG-PN-2026-001',
        firstName: 'Existant',
        lastName: 'TEST',
        gender: 'M',
        schoolClassId: 'c1',
        active: true,
      },
    ];

    const csvContent = [
      'matricule;nom;prenom;sexe',
      'CG-PN-2026-001;DUP;Jean;M', // Doublon externe
      'CG-PN-2026-002;LOUBAKI;Esther;F', // Valide
      'CG-PN-2026-002;LOUBAKI;Esther;F', // Doublon interne dans le fichier
      'CG-PN-2026-003;;Paul;M', // Nom manquant
    ].join('\n');

    const result = parseStudentsCSV(csvContent, 'c1', existing);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].studentNumber).toBe('CG-PN-2026-002');
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
