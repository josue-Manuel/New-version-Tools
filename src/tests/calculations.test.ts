import { describe, it, expect } from 'vitest';
import {
  calculateSimpleAverage,
  calculateWeightedSubjectAverage,
  applyRounding,
  validateGradeScore,
  validateCoefficient,
  computeClassPeriodSummaries,
  determineMention,
  AcademicCalculationError,
  DEFAULT_CALCULATION_CONFIG,
} from '../core/calculations/calculationEngine';
import { Student, ClassSubject, Subject, Assessment, Grade } from '../core/models/types';

describe('Academic Calculation Engine (Moteur de Calcul)', () => {
  // Test 1 : Calcul d'une moyenne simple
  it('calcule correctement une moyenne simple de notes valides', () => {
    const scores = [14, 16, 12, 18];
    const { rawAverage, roundedAverage } = calculateSimpleAverage(scores, 20);
    expect(rawAverage).toBe(15);
    expect(roundedAverage).toBe(15.0);
  });

  // Test 2 : Calcul d'une moyenne pondérée
  it('calcule rigoureusement une moyenne pondérée avec coefficients différents', () => {
    // Interrogation note 12 (coef 1), Devoir note 15 (coef 2), Composition note 18 (coef 3)
    // Somme = (12*1 + 15*2 + 18*3) = 12 + 30 + 54 = 96
    // Coefs = 1 + 2 + 3 = 6
    // Moyenne = 96 / 6 = 16.00
    const assessments = [
      { score: 12, maxScore: 20, coefficient: 1 },
      { score: 15, maxScore: 20, coefficient: 2 },
      { score: 18, maxScore: 20, coefficient: 3 },
    ];
    const result = calculateWeightedSubjectAverage(assessments, 20);
    expect(result.rawAverage).toBe(16);
    expect(result.roundedAverage).toBe(16.0);
    expect(result.totalValidCoefficients).toBe(6);
    expect(result.validGradesCount).toBe(3);
  });

  // Test 3 : Coefficients nuls ou négatifs rejetés
  it('rejette strictement les coefficients nuls avec message d’erreur explicite', () => {
    expect(() => validateCoefficient(0)).toThrowError(AcademicCalculationError);
    expect(() => validateCoefficient(0)).toThrowError(/strictement supérieur à zéro/);
  });

  it('rejette strictement les coefficients négatifs', () => {
    expect(() => validateCoefficient(-2)).toThrowError(AcademicCalculationError);
    expect(() =>
      calculateWeightedSubjectAverage([{ score: 15, maxScore: 20, coefficient: -1 }])
    ).toThrowError(AcademicCalculationError);
  });

  // Test 4 : Notes hors barème rejetées
  it('rejette les notes négatives', () => {
    expect(() => validateGradeScore(-1.5, 20)).toThrowError(AcademicCalculationError);
    expect(() => validateGradeScore(-1.5, 20)).toThrowError(/ne peut pas être négative/);
  });

  it('rejette les notes excédant le barème de l’évaluation', () => {
    expect(() => validateGradeScore(21, 20)).toThrowError(AcademicCalculationError);
    expect(() => validateGradeScore(21, 20)).toThrowError(/dépasse le barème maximum/);
    expect(() => validateGradeScore(12, 10)).toThrowError(AcademicCalculationError);
  });

  // Test 5 : Notes manquantes distinctes de 0
  it('ne comptabilise PAS les notes manquantes (null) comme des zéros', () => {
    // Si la note manquante était 0 : (16*2 + 0*3)/5 = 32/5 = 6.4 (Ajourné)
    // Comme elle est ignorée : 16*2 / 2 = 16.0 (Très Bien)
    const assessments = [
      { score: 16, maxScore: 20, coefficient: 2 },
      { score: null, maxScore: 20, coefficient: 3 }, // Note non saisie / élève absent excusé
    ];
    const result = calculateWeightedSubjectAverage(assessments, 20);
    expect(result.rawAverage).toBe(16);
    expect(result.roundedAverage).toBe(16.0);
    expect(result.totalValidCoefficients).toBe(2);
    expect(result.missingGradesCount).toBe(1);
  });

  // Test 6 : Élève sans aucune note
  it('retourne null lorsqu’un élève n’a aucune note exploitable', () => {
    const assessments = [
      { score: null, maxScore: 20, coefficient: 2 },
      { score: null, maxScore: 20, coefficient: 1 },
    ];
    const result = calculateWeightedSubjectAverage(assessments, 20);
    expect(result.rawAverage).toBeNull();
    expect(result.roundedAverage).toBeNull();
    expect(result.validGradesCount).toBe(0);
  });

  // Test 7 : Normalisation des barèmes hétérogènes (ex: note /10 vers barème /20)
  it('normalise correctement une note sur 10 vers une matière sur 20', () => {
    // Note 8/10 -> correspond à 16/20
    const assessments = [
      { score: 8, maxScore: 10, coefficient: 1 },
    ];
    const result = calculateWeightedSubjectAverage(assessments, 20, {
      ...DEFAULT_CALCULATION_CONFIG,
      normalizeScoresToScale: true,
    });
    expect(result.rawAverage).toBe(16);
  });

  // Test 8 : Règles et cas limites d’arrondi
  it('applique fidèlement les différentes règles d’arrondi', () => {
    const val = 12.3456;
    expect(applyRounding(val, 'half-up', 2)).toBe(12.35);
    expect(applyRounding(val, 'floor', 2)).toBe(12.34);
    expect(applyRounding(val, 'ceil', 2)).toBe(12.35);
    expect(applyRounding(12.341, 'ceil', 2)).toBe(12.35);
    expect(applyRounding(val, 'none', 2)).toBe(val);
  });

  // Test 9 : Classe sans élèves
  it('gère correctement une classe sans élèves sans déclencher d’erreur', () => {
    const emptyStudents: Student[] = [];
    const results = computeClassPeriodSummaries(emptyStudents, [], [], [], 'T1');
    expect(results).toEqual([]);
  });

  // Test 10 : Détermination des mentions selon les seuils congolais
  it('détermine les mentions correctes selon les seuils', () => {
    expect(determineMention(16.5).mention).toBe('Très Bien');
    expect(determineMention(14.0).mention).toBe('Bien');
    expect(determineMention(12.5).mention).toBe('Assez Bien');
    expect(determineMention(10.0).mention).toBe('Passable');
    expect(determineMention(8.5).mention).toBe('Ajourné(e)');
    expect(determineMention(null).mention).toBe('Non évalué');
  });

  // Test 11 : Calcul complet de synthèse et attribution des rangs
  it('classe les élèves par ordre décroissant de moyenne générale', () => {
    const dummyStudents: Student[] = [
      {
        id: 's1',
        studentNumber: 'CG-PN-2026-001',
        firstName: 'Christian',
        lastName: 'MOUKASSA',
        gender: 'M',
        schoolClassId: 'c1',
        active: true,
      },
      {
        id: 's2',
        studentNumber: 'CG-PN-2026-002',
        firstName: 'Esther',
        lastName: 'NGOMA',
        gender: 'F',
        schoolClassId: 'c1',
        active: true,
      },
    ];

    const dummySubject: Subject = {
      id: 'sub1',
      name: 'Mathématiques',
      code: 'MATH',
      schoolLevelId: 'lvl1',
      defaultCoefficient: 4,
      gradingScale: 20,
    };

    const dummyClassSubjects: (ClassSubject & { subject: Subject })[] = [
      {
        id: 'cs1',
        schoolClassId: 'c1',
        subjectId: 'sub1',
        coefficient: 4,
        subject: dummySubject,
      },
    ];

    const dummyAssessments: Assessment[] = [
      {
        id: 'a1',
        name: 'Composition T1',
        subjectId: 'sub1',
        schoolClassId: 'c1',
        periodId: 'p1',
        date: '2026-10-20',
        maxScore: 20,
        coefficient: 1,
      },
    ];

    const dummyGrades: Grade[] = [
      { id: 'g1', studentId: 's1', assessmentId: 'a1', score: 14.5, updatedAt: '2026-10-20' },
      { id: 'g2', studentId: 's2', assessmentId: 'a1', score: 17.0, updatedAt: '2026-10-20' },
    ];

    const summaries = computeClassPeriodSummaries(
      dummyStudents,
      dummyClassSubjects,
      dummyAssessments,
      dummyGrades,
      'p1'
    );

    expect(summaries).toHaveLength(2);

    const s2Summary = summaries.find((s) => s.studentId === 's2');
    const s1Summary = summaries.find((s) => s.studentId === 's1');

    expect(s2Summary?.generalAverage).toBe(17.0);
    expect(s2Summary?.rankInClass).toBe(1);

    expect(s1Summary?.generalAverage).toBe(14.5);
    expect(s1Summary?.rankInClass).toBe(2);
  });
});
