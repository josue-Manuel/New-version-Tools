/**
 * Moteur de calcul académique déterministe
 * New Version School Tools
 *
 * Règles :
 * - Notes comprises entre 0 et le barème de l'évaluation
 * - Coefficients strictement positifs (> 0)
 * - Notes manquantes (null) non comptabilisées comme 0
 * - Moyenne impossible sans note exploitable -> retourne null
 * - Précision préservée jusqu'à l'arrondi final configurable
 * - Normalisation des barèmes hétérogènes (ex: note /10 vers /20)
 */

import {
  Assessment,
  Grade,
  CalculationConfig,
  Subject,
  ClassSubject,
  Student,
  SubjectCalculationResult,
  StudentTrimesterSummary,
} from '../models/types';

export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
  roundingRule: 'half-up',
  decimalPlaces: 2,
  passThreshold: 10.0,
  normalizeScoresToScale: true,
  mentionThresholds: {
    veryGood: 16.0,
    good: 14.0,
    fairlyGood: 12.0,
    pass: 10.0,
  },
};

export class AcademicCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AcademicCalculationError';
  }
}

/**
 * Applique la règle d'arrondi configurée
 */
export function applyRounding(
  value: number,
  rule: CalculationConfig['roundingRule'],
  decimals: number
): number {
  if (rule === 'none') {
    return value;
  }

  const factor = Math.pow(10, decimals);
  const eps = 1e-12; // Évite les imprécisions d'arrondi flottant IEEE-754

  switch (rule) {
    case 'floor':
      return Math.floor((value + eps) * factor) / factor;
    case 'ceil':
      return Math.ceil((value - eps) * factor) / factor;
    case 'half-up':
    default:
      // Math.round standard half-up
      return Math.round((value + Number.EPSILON) * factor) / factor;
  }
}

/**
 * Valide une note individuelle
 */
export function validateGradeScore(score: number | null, maxScore: number): void {
  if (score === null || score === undefined) {
    return; // Note manquante autorisée
  }

  if (typeof score !== 'number' || isNaN(score)) {
    throw new AcademicCalculationError('La note doit être un nombre valide.');
  }

  if (maxScore <= 0) {
    throw new AcademicCalculationError(
      `Le barème de l'évaluation doit être strictement positif (reçu: ${maxScore}).`
    );
  }

  if (score < 0) {
    throw new AcademicCalculationError(
      `La note ne peut pas être négative (reçu: ${score}).`
    );
  }

  if (score > maxScore) {
    throw new AcademicCalculationError(
      `La note (${score}) dépasse le barème maximum autorisé (${maxScore}).`
    );
  }
}

/**
 * Valide le coefficient
 */
export function validateCoefficient(coefficient: number): void {
  if (typeof coefficient !== 'number' || isNaN(coefficient)) {
    throw new AcademicCalculationError('Le coefficient doit être un nombre valide.');
  }
  if (coefficient <= 0) {
    throw new AcademicCalculationError(
      `Le coefficient doit être strictement supérieur à zéro (reçu: ${coefficient}).`
    );
  }
}

export interface AssessmentScorePair {
  score: number | null;
  maxScore: number;
  coefficient: number;
}

/**
 * Calcule la moyenne simple d'une série de notes (toutes avec coefficient = 1 et même barème)
 */
export function calculateSimpleAverage(
  scores: (number | null)[],
  maxScore: number = 20,
  config: CalculationConfig = DEFAULT_CALCULATION_CONFIG
): { rawAverage: number | null; roundedAverage: number | null } {
  const validScores: number[] = [];

  for (const s of scores) {
    if (s !== null && s !== undefined) {
      validateGradeScore(s, maxScore);
      validScores.push(s);
    }
  }

  if (validScores.length === 0) {
    return { rawAverage: null, roundedAverage: null };
  }

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const rawAverage = sum / validScores.length;
  const roundedAverage = applyRounding(rawAverage, config.roundingRule, config.decimalPlaces);

  return { rawAverage, roundedAverage };
}

/**
 * Calcule la moyenne pondérée d'une matière pour un élève sur une période donnée
 */
export function calculateWeightedSubjectAverage(
  assessmentsWithGrades: AssessmentScorePair[],
  targetScale: number = 20,
  config: CalculationConfig = DEFAULT_CALCULATION_CONFIG
): {
  rawAverage: number | null;
  roundedAverage: number | null;
  totalValidCoefficients: number;
  validGradesCount: number;
  missingGradesCount: number;
} {
  let weightedSum = 0;
  let totalCoefficients = 0;
  let validGradesCount = 0;
  let missingGradesCount = 0;

  for (const item of assessmentsWithGrades) {
    validateCoefficient(item.coefficient);
    validateGradeScore(item.score, item.maxScore);

    if (item.score === null || item.score === undefined) {
      missingGradesCount++;
      continue; // La note manquante n'est PAS un 0
    }

    // Normalisation éventuelle si l'évaluation n'est pas sur le barème cible (ex: note /10 vers /20)
    let normalizedScore = item.score;
    if (config.normalizeScoresToScale && item.maxScore !== targetScale) {
      normalizedScore = (item.score / item.maxScore) * targetScale;
    }

    weightedSum += normalizedScore * item.coefficient;
    totalCoefficients += item.coefficient;
    validGradesCount++;
  }

  if (validGradesCount === 0 || totalCoefficients === 0) {
    return {
      rawAverage: null,
      roundedAverage: null,
      totalValidCoefficients: 0,
      validGradesCount: 0,
      missingGradesCount,
    };
  }

  const rawAverage = weightedSum / totalCoefficients;
  const roundedAverage = applyRounding(rawAverage, config.roundingRule, config.decimalPlaces);

  return {
    rawAverage,
    roundedAverage,
    totalValidCoefficients: totalCoefficients,
    validGradesCount,
    missingGradesCount,
  };
}

/**
 * Détermine la mention selon les seuils configurés
 */
export function determineMention(
  average: number | null,
  config: CalculationConfig = DEFAULT_CALCULATION_CONFIG
): { mention: string; councilDecision: string } {
  if (average === null || isNaN(average)) {
    return { mention: 'Non évalué', councilDecision: 'Notes insuffisantes' };
  }

  const { veryGood, good, fairlyGood, pass } = config.mentionThresholds;

  if (average >= veryGood) {
    return {
      mention: 'Très Bien',
      councilDecision: 'Félicitations du Conseil & Tableau d’Honneur',
    };
  }
  if (average >= good) {
    return {
      mention: 'Bien',
      councilDecision: 'Tableau d’Honneur avec Encouragements',
    };
  }
  if (average >= fairlyGood) {
    return {
      mention: 'Assez Bien',
      councilDecision: 'Encouragements du Conseil',
    };
  }
  if (average >= pass) {
    return {
      mention: 'Passable',
      councilDecision: 'Admis(e) — Poursuivre les efforts',
    };
  }
  if (average >= pass - 1.5) {
    return {
      mention: 'Ajourné(e)',
      councilDecision: 'Avertissement Travail — En danger',
    };
  }
  return {
    mention: 'Ajourné(e)',
    councilDecision: 'Blâme pour manque flagrant de travail',
  };
}

/**
 * Calcule la synthèse complète d'une classe pour une période
 */
export function computeClassPeriodSummaries(
  students: Student[],
  classSubjects: (ClassSubject & { subject: Subject })[],
  assessments: Assessment[],
  grades: Grade[],
  periodId: string,
  config: CalculationConfig = DEFAULT_CALCULATION_CONFIG
): StudentTrimesterSummary[] {
  // Indexer les notes par clé `${studentId}_${assessmentId}`
  const gradeMap = new Map<string, number | null>();
  for (const g of grades) {
    gradeMap.set(`${g.studentId}_${g.assessmentId}`, g.score);
  }

  // Filtrer les évaluations de la période
  const periodAssessments = assessments.filter((a) => a.periodId === periodId);

  // 1. Calculer pour chaque élève et chaque matière
  const studentSummaries: StudentTrimesterSummary[] = [];

  for (const student of students) {
    const subjectResults: Record<string, SubjectCalculationResult> = {};
    let totalWeightedPoints = 0;
    let totalCoefficients = 0;
    let hasAnyUsableGrade = false;
    let hasIncompleteData = false;

    for (const cs of classSubjects) {
      validateCoefficient(cs.coefficient);

      // Évaluations de cette matière pour la classe
      const subAssessments = periodAssessments.filter(
        (a) => a.subjectId === cs.subjectId && a.schoolClassId === student.schoolClassId
      );

      const pairs: AssessmentScorePair[] = subAssessments.map((a) => {
        const score = gradeMap.get(`${student.id}_${a.id}`) ?? null;
        return {
          score,
          maxScore: a.maxScore,
          coefficient: a.coefficient,
        };
      });

      const { rawAverage, roundedAverage, validGradesCount, missingGradesCount } =
        calculateWeightedSubjectAverage(pairs, cs.subject.gradingScale, config);

      if (subAssessments.length > 0 && missingGradesCount > 0) {
        hasIncompleteData = true;
      }

      let weightedPoints: number | null = null;
      if (rawAverage !== null) {
        weightedPoints = rawAverage * cs.coefficient;
        totalWeightedPoints += weightedPoints;
        totalCoefficients += cs.coefficient;
        hasAnyUsableGrade = true;
      }

      subjectResults[cs.subjectId] = {
        subjectId: cs.subjectId,
        subjectName: cs.subject.name,
        coefficient: cs.coefficient,
        teacherName: cs.teacherName || cs.subject.teacherName,
        assessmentsCount: subAssessments.length,
        gradesCount: validGradesCount,
        missingGradesCount,
        unroundedAverage: rawAverage,
        roundedAverage,
        weightedPoints: weightedPoints !== null ? applyRounding(weightedPoints, config.roundingRule, config.decimalPlaces) : null,
        classStats: { min: null, max: null, classAverage: null },
        rankInSubject: null,
        mention: rawAverage !== null ? determineMention(rawAverage, config).mention : '—',
      };
    }

    const generalAverageRaw = hasAnyUsableGrade && totalCoefficients > 0
      ? totalWeightedPoints / totalCoefficients
      : null;

    const generalAverage = generalAverageRaw !== null
      ? applyRounding(generalAverageRaw, config.roundingRule, config.decimalPlaces)
      : null;

    const { mention, councilDecision } = determineMention(generalAverage, config);

    studentSummaries.push({
      studentId: student.id,
      student,
      periodId,
      subjectResults,
      totalWeightedPoints: hasAnyUsableGrade
        ? applyRounding(totalWeightedPoints, config.roundingRule, config.decimalPlaces)
        : null,
      totalCoefficients,
      generalAverage,
      rankInClass: null,
      mention,
      councilDecision,
      hasIncompleteData,
    });
  }

  // 2. Calcul des rangs généraux de classe (tri décroissant)
  const sortedStudents = [...studentSummaries].sort((a, b) => {
    if (a.generalAverage === null && b.generalAverage === null) return 0;
    if (a.generalAverage === null) return 1;
    if (b.generalAverage === null) return -1;
    return b.generalAverage - a.generalAverage;
  });

  sortedStudents.forEach((item, index) => {
    if (item.generalAverage !== null) {
      item.rankInClass = index + 1;
    }
  });

  // 3. Calcul des statistiques de classe par matière (min, max, moyenne classe, rang par matière)
  for (const cs of classSubjects) {
    const scoresWithStudent: { studentId: string; avg: number }[] = [];

    for (const summary of studentSummaries) {
      const subRes = summary.subjectResults[cs.subjectId];
      if (subRes && subRes.unroundedAverage !== null) {
        scoresWithStudent.push({ studentId: summary.studentId, avg: subRes.unroundedAverage });
      }
    }

    if (scoresWithStudent.length > 0) {
      const min = Math.min(...scoresWithStudent.map((s) => s.avg));
      const max = Math.max(...scoresWithStudent.map((s) => s.avg));
      const sum = scoresWithStudent.reduce((acc, s) => acc + s.avg, 0);
      const classAverage = sum / scoresWithStudent.length;

      // Tri pour les rangs dans la matière
      scoresWithStudent.sort((a, b) => b.avg - a.avg);
      const rankMap = new Map<string, number>();
      scoresWithStudent.forEach((s, idx) => {
        rankMap.set(s.studentId, idx + 1);
      });

      for (const summary of studentSummaries) {
        const subRes = summary.subjectResults[cs.subjectId];
        if (subRes) {
          subRes.classStats = {
            min: applyRounding(min, config.roundingRule, config.decimalPlaces),
            max: applyRounding(max, config.roundingRule, config.decimalPlaces),
            classAverage: applyRounding(classAverage, config.roundingRule, config.decimalPlaces),
          };
          subRes.rankInSubject = rankMap.get(summary.studentId) ?? null;
        }
      }
    }
  }

  return studentSummaries;
}
