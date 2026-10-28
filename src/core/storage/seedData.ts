/**
 * Données de Démonstration Fictives
 * New Version School Tools
 *
 * AVERTISSEMENT : Toutes les données ci-dessous sont rigoureusement FICTIVES.
 * Elles sont fournies uniquement pour valider le bon fonctionnement de l'application
 * dans le contexte des établissements scolaires de Pointe-Noire (Congo-Brazzaville).
 */

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
  DatabaseDump,
} from '../models/types';
import { DEFAULT_CALCULATION_CONFIG } from '../calculations/calculationEngine';

export function generateSeedData(): DatabaseDump {
  const school: School = {
    id: 'sch_lva_pn',
    name: 'Lycée Victor Augagneur (Démonstration)',
    address: 'Avenue de l’Indépendance, BP 714',
    city: 'Pointe-Noire',
    country: 'Congo-Brazzaville',
    district: 'Arrondissement 1 Émery Patrice Lumumba',
    code: '04-PN-LVA-2026',
    phone: '+242 06 632 18 90',
    email: 'contact@lva-pointenoire.cg',
    motto: 'Unité · Travail · Progrès',
    academicYearId: 'ay_2025_2026',
  };

  const academicYears: AcademicYear[] = [
    {
      id: 'ay_2025_2026',
      label: '2025 - 2026',
      startDate: '2025-10-01',
      endDate: '2026-06-30',
      active: true,
    },
  ];

  const schoolLevels: SchoolLevel[] = [
    {
      id: 'lvl_sec',
      name: 'Second Cycle (Lycée)',
      levelType: 'secondary',
      defaultGradingScale: 20,
    },
    {
      id: 'lvl_mid',
      name: 'Premier Cycle (Collège)',
      levelType: 'middle',
      defaultGradingScale: 20,
    },
    {
      id: 'lvl_pri',
      name: 'Cycle Primaire',
      levelType: 'primary',
      defaultGradingScale: 10,
    },
  ];

  const classes: SchoolClass[] = [
    {
      id: 'cls_tc',
      name: 'Terminale C (Math & Sciences Physiques)',
      schoolLevelId: 'lvl_sec',
      academicYearId: 'ay_2025_2026',
      capacity: 35,
      classTeacherName: 'M. Loubaki Jean-Paul',
    },
    {
      id: 'cls_td',
      name: 'Terminale D (Sciences Biologiques)',
      schoolLevelId: 'lvl_sec',
      academicYearId: 'ay_2025_2026',
      capacity: 40,
      classTeacherName: 'M. Mabiala François',
    },
    {
      id: 'cls_3eme',
      name: 'Classe de 3ème A (Collège)',
      schoolLevelId: 'lvl_mid',
      academicYearId: 'ay_2025_2026',
      capacity: 45,
      classTeacherName: 'Mme Mavoungou Claire',
    },
  ];

  const periods: Period[] = [
    {
      id: 'prd_t1',
      name: '1er Trimestre',
      shortName: 'T1',
      startDate: '2025-10-01',
      endDate: '2025-12-20',
      academicYearId: 'ay_2025_2026',
      isClosed: false,
    },
    {
      id: 'prd_t2',
      name: '2ème Trimestre',
      shortName: 'T2',
      startDate: '2026-01-05',
      endDate: '2026-03-27',
      academicYearId: 'ay_2025_2026',
      isClosed: false,
    },
    {
      id: 'prd_t3',
      name: '3ème Trimestre',
      shortName: 'T3',
      startDate: '2026-04-13',
      endDate: '2026-06-30',
      academicYearId: 'ay_2025_2026',
      isClosed: false,
    },
  ];

  const subjects: Subject[] = [
    { id: 'sub_math', name: 'Mathématiques', code: 'MATH', schoolLevelId: 'lvl_sec', defaultCoefficient: 6, gradingScale: 20, category: 'scientific', teacherName: 'M. Loubaki Jean-Paul' },
    { id: 'sub_phys', name: 'Physique - Chimie', code: 'PC', schoolLevelId: 'lvl_sec', defaultCoefficient: 5, gradingScale: 20, category: 'scientific', teacherName: 'Mme Ngoma Blandine' },
    { id: 'sub_svt', name: 'Sciences de la Vie et de la Terre', code: 'SVT', schoolLevelId: 'lvl_sec', defaultCoefficient: 3, gradingScale: 20, category: 'scientific', teacherName: 'M. Mabiala François' },
    { id: 'sub_fr', name: 'Français & Littérature', code: 'FRAN', schoolLevelId: 'lvl_sec', defaultCoefficient: 3, gradingScale: 20, category: 'literary', teacherName: 'M. Tchibinda Alexis' },
    { id: 'sub_phil', name: 'Philosophie', code: 'PHIL', schoolLevelId: 'lvl_sec', defaultCoefficient: 3, gradingScale: 20, category: 'literary', teacherName: 'M. Mpassi Bernard' },
    { id: 'sub_hg', name: 'Histoire - Géographie', code: 'HG', schoolLevelId: 'lvl_sec', defaultCoefficient: 2, gradingScale: 20, category: 'general', teacherName: 'Mme Mavoungou Claire' },
    { id: 'sub_ang', name: 'Anglais', code: 'ANG', schoolLevelId: 'lvl_sec', defaultCoefficient: 2, gradingScale: 20, category: 'general', teacherName: 'M. Taty Christian' },
    { id: 'sub_eps', name: 'Éducation Physique & Sportive', code: 'EPS', schoolLevelId: 'lvl_sec', defaultCoefficient: 2, gradingScale: 20, category: 'sports', teacherName: 'M. Ganga Dieudonné' },
  ];

  const classSubjects: ClassSubject[] = subjects.map((sub) => ({
    id: `cs_tc_${sub.id}`,
    schoolClassId: 'cls_tc',
    subjectId: sub.id,
    coefficient: sub.defaultCoefficient,
    teacherName: sub.teacherName,
  }));

  const students: Student[] = [
    {
      id: 'stu_1',
      studentNumber: 'CG-PN-2026-0042',
      firstName: 'Christian Grâce',
      lastName: 'MOUKASSA',
      gender: 'M',
      birthDate: '2008-04-14',
      birthPlace: 'Pointe-Noire (Arr. 1 Lumumba)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Moukassa Jean-Félix',
      guardianPhone: '+242 06 680 12 45',
      guardianAddress: 'Quartier Mpita, Rue des Manguiers',
      conductScore: 18.5,
      unexcusedAbsences: 2,
      excusedAbsences: 4,
    },
    {
      id: 'stu_2',
      studentNumber: 'CG-PN-2026-0043',
      firstName: 'Esther Sephora',
      lastName: 'NGOMA',
      gender: 'F',
      birthDate: '2008-08-22',
      birthPlace: 'Pointe-Noire (Arr. 2 Mvou-Mvou)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Ngoma Gilbert',
      guardianPhone: '+242 05 533 89 10',
      guardianAddress: 'Avenue de l’Indépendance, Grand Marché',
      conductScore: 19.0,
      unexcusedAbsences: 0,
      excusedAbsences: 1,
    },
    {
      id: 'stu_3',
      studentNumber: 'CG-PN-2026-0044',
      firstName: 'Yannick Trésor',
      lastName: 'MABIALA',
      gender: 'M',
      birthDate: '2007-11-03',
      birthPlace: 'Dolisie (Niari)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Mabiala André',
      guardianPhone: '+242 06 912 40 77',
      guardianAddress: 'Quartier Tié-Tié, Rue de la Paix',
      conductScore: 16.0,
      unexcusedAbsences: 6,
      excusedAbsences: 2,
    },
    {
      id: 'stu_4',
      studentNumber: 'CG-PN-2026-0045',
      firstName: 'Aurelie Divine',
      lastName: 'LOUBAKI',
      gender: 'F',
      birthDate: '2008-02-18',
      birthPlace: 'Brazzaville (Makélékélé)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Loubaki Émile',
      guardianPhone: '+242 06 677 34 20',
      guardianAddress: 'Résidence du Port, Centre-Ville',
      conductScore: 18.0,
      unexcusedAbsences: 1,
      excusedAbsences: 3,
    },
    {
      id: 'stu_5',
      studentNumber: 'CG-PN-2026-0046',
      firstName: 'Kévin Rodrigue',
      lastName: 'MASSAMBA',
      gender: 'M',
      birthDate: '2007-06-30',
      birthPlace: 'Pointe-Noire (Arr. 4 Loandjili)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Massamba Charles',
      guardianPhone: '+242 05 510 66 82',
      guardianAddress: 'Quartier Loandjili, Arrêt Hôpital',
      conductScore: 15.5,
      unexcusedAbsences: 8,
      excusedAbsences: 0,
    },
    {
      id: 'stu_6',
      studentNumber: 'CG-PN-2026-0047',
      firstName: 'Clarisse Brenda',
      lastName: 'MAVOUNGOU',
      gender: 'F',
      birthDate: '2008-10-10',
      birthPlace: 'Pointe-Noire (Arr. 3 Tié-Tié)',
      schoolClassId: 'cls_tc',
      active: true,
      guardianName: 'Mavoungou Paul',
      guardianPhone: '+242 06 651 22 19',
      guardianAddress: 'Quartier OCH, Rue de la Liberté',
      conductScore: 19.5,
      unexcusedAbsences: 0,
      excusedAbsences: 0,
    },
  ];

  // Deux évaluations par matière pour le 1er trimestre
  const assessments: Assessment[] = [];
  const grades: Grade[] = [];

  subjects.forEach((sub, subIdx) => {
    // 1. Devoir surveillé N°1 (coef 1)
    const dsId = `ass_tc_${sub.id}_ds1`;
    assessments.push({
      id: dsId,
      name: `Devoir Surveillé ${sub.code} N°1`,
      subjectId: sub.id,
      schoolClassId: 'cls_tc',
      periodId: 'prd_t1',
      date: '2025-11-10',
      maxScore: 20,
      coefficient: 1,
    });

    // 2. Composition trimestrielle (coef 2)
    const compId = `ass_tc_${sub.id}_comp`;
    assessments.push({
      id: compId,
      name: `Composition Trimestrielle ${sub.code}`,
      subjectId: sub.id,
      schoolClassId: 'cls_tc',
      periodId: 'prd_t1',
      date: '2025-12-15',
      maxScore: 20,
      coefficient: 2,
    });

    // Notes modèles pour les élèves
    const baseScores: Record<string, [number, number]> = {
      stu_1: [16.5, 17.5],
      stu_2: [15.5, 16.0],
      stu_3: [11.0, 11.5],
      stu_4: [14.5, 14.0],
      stu_5: [8.5, 9.0],
      stu_6: [14.0, 14.5],
    };

    students.forEach((st) => {
      const scores = baseScores[st.id] || [12, 12];
      // Note DS1
      grades.push({
        id: `grd_${st.id}_${dsId}`,
        studentId: st.id,
        assessmentId: dsId,
        score: scores[0],
        updatedAt: '2025-11-12T10:00:00Z',
      });
      // Note Composition
      grades.push({
        id: `grd_${st.id}_${compId}`,
        studentId: st.id,
        assessmentId: compId,
        score: scores[1],
        updatedAt: '2025-12-18T10:00:00Z',
      });
    });
  });

  return {
    metadata: {
      version: '1.0.0',
      software: 'New Version School Tools',
      publisher: 'New Version',
      exportedAt: new Date().toISOString(),
      schoolId: school.id,
      schoolName: school.name,
      academicYear: '2025 - 2026',
      recordCounts: {
        schools: 1,
        academicYears: 1,
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
    calculationConfig: DEFAULT_CALCULATION_CONFIG,
  };
}
