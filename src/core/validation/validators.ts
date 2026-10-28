/**
 * Validateurs de données pour New Version School Tools
 */

import { Student, Assessment, Grade, DatabaseDump } from '../models/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateStudent(
  student: Partial<Student>,
  existingStudents: Student[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!student.lastName || student.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'Le nom de famille est obligatoire.' });
  }

  if (!student.firstName || student.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'Le prénom est obligatoire.' });
  }

  if (!student.studentNumber || student.studentNumber.trim().length === 0) {
    errors.push({ field: 'studentNumber', message: 'Le matricule est obligatoire.' });
  } else {
    // Vérification de doublon de matricule au sein de l'établissement
    const duplicate = existingStudents.find(
      (s) => s.studentNumber.toLowerCase().trim() === student.studentNumber?.toLowerCase().trim() &&
             s.id !== student.id
    );
    if (duplicate) {
      errors.push({
        field: 'studentNumber',
        message: `Le matricule "${student.studentNumber}" est déjà attribué à ${duplicate.lastName} ${duplicate.firstName}.`,
      });
    }
  }

  if (!student.gender || !['M', 'F'].includes(student.gender)) {
    errors.push({ field: 'gender', message: 'Le genre doit être "M" ou "F".' });
  }

  if (!student.schoolClassId) {
    errors.push({ field: 'schoolClassId', message: 'L’affectation à une classe est obligatoire.' });
  }

  return errors;
}

export function validateAssessment(assessment: Partial<Assessment>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!assessment.name || assessment.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Le nom de l’évaluation est obligatoire.' });
  }

  if (!assessment.subjectId) {
    errors.push({ field: 'subjectId', message: 'La matière est obligatoire.' });
  }

  if (!assessment.schoolClassId) {
    errors.push({ field: 'schoolClassId', message: 'La classe est obligatoire.' });
  }

  if (!assessment.periodId) {
    errors.push({ field: 'periodId', message: 'La période d’évaluation est obligatoire.' });
  }

  if (assessment.maxScore === undefined || assessment.maxScore === null || isNaN(assessment.maxScore) || assessment.maxScore <= 0) {
    errors.push({ field: 'maxScore', message: 'Le barème doit être un nombre strictement supérieur à 0.' });
  }

  if (assessment.coefficient === undefined || assessment.coefficient === null || isNaN(assessment.coefficient) || assessment.coefficient <= 0) {
    errors.push({ field: 'coefficient', message: 'Le coefficient doit être un nombre strictement supérieur à 0.' });
  }

  return errors;
}

export function validateGradeInput(rawScore: string, maxScore: number): { valid: boolean; score: number | null; error?: string } {
  if (rawScore === '' || rawScore === null || rawScore === undefined) {
    return { valid: true, score: null }; // Note manquante autorisée
  }

  const cleaned = rawScore.replace(',', '.').trim();
  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    return { valid: false, score: null, error: 'La note doit être un nombre valide.' };
  }

  if (num < 0) {
    return { valid: false, score: null, error: 'Une note ne peut pas être négative.' };
  }

  if (num > maxScore) {
    return { valid: false, score: null, error: `La note (${num}) dépasse le barème (${maxScore}).` };
  }

  return { valid: true, score: num };
}

export function validateBackupFileStructure(data: any): { valid: boolean; message: string; dump?: DatabaseDump } {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Le fichier ne contient pas un objet JSON valide.' };
  }

  if (!data.metadata) {
    return { valid: false, message: 'Métadonnées de sauvegarde manquantes.' };
  }

  if (data.metadata.software !== 'New Version School Tools') {
    return {
      valid: false,
      message: `Signature logicielle invalide ou incompatible (reçu: ${data.metadata.software || 'inconnu'}).`,
    };
  }

  if (data.metadata.version !== '1.0.0') {
    return {
      valid: false,
      message: `Version de schéma incompatible (${data.metadata.version}). Version attendue: 1.0.0.`,
    };
  }

  const requiredArrays = ['academicYears', 'schoolLevels', 'classes', 'students', 'subjects', 'periods', 'assessments', 'grades'];
  for (const arrName of requiredArrays) {
    if (!Array.isArray(data[arrName])) {
      return { valid: false, message: `La section "${arrName}" est absente ou n’est pas un tableau.` };
    }
  }

  if (!data.school || typeof data.school !== 'object' || !data.school.id || !data.school.name) {
    return { valid: false, message: 'Informations de l’établissement invalides ou manquantes.' };
  }

  return { valid: true, message: 'Sauvegarde validée avec succès.', dump: data as DatabaseDump };
}
