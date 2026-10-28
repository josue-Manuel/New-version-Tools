/**
 * Utilitaires d'Importation et d'Exportation CSV
 * New Version School Tools
 */

import { Student } from '../models/types';

export interface CSVParseResult {
  validRows: Omit<Student, 'id'>[];
  errors: { row: number; field: string; message: string; raw: string }[];
  totalRows: number;
}

/**
 * Analyse et valide un fichier CSV d'élèves
 */
export function parseStudentsCSV(
  csvText: string,
  classId: string,
  existingStudents: Student[] = []
): CSVParseResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const result: CSVParseResult = {
    validRows: [],
    errors: [],
    totalRows: 0,
  };

  if (lines.length < 2) {
    result.errors.push({
      row: 0,
      field: 'file',
      message: 'Le fichier CSV est vide ou ne comporte pas d’en-tête.',
      raw: '',
    });
    return result;
  }

  // Détection du délimiteur (; ou ,)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map((h) => h.trim().toLowerCase().replace(/["']/g, ''));

  const requiredCols = ['matricule', 'nom', 'prenom', 'sexe'];
  const missingCols = requiredCols.filter((col) => !headers.includes(col));

  if (missingCols.length > 0) {
    result.errors.push({
      row: 1,
      field: 'header',
      message: `Colonnes obligatoires manquantes dans l'en-tête : ${missingCols.join(', ')}. Format attendu : matricule${delimiter}nom${delimiter}prenom${delimiter}sexe`,
      raw: headerLine,
    });
    return result;
  }

  const colIndex = {
    matricule: headers.indexOf('matricule'),
    nom: headers.indexOf('nom'),
    prenom: headers.indexOf('prenom'),
    sexe: headers.indexOf('sexe'),
    dateNaissance: headers.indexOf('date_naissance') !== -1 ? headers.indexOf('date_naissance') : headers.indexOf('naissance'),
    lieuNaissance: headers.indexOf('lieu_naissance') !== -1 ? headers.indexOf('lieu_naissance') : headers.indexOf('lieu'),
    tuteur: headers.indexOf('tuteur') !== -1 ? headers.indexOf('tuteur') : headers.indexOf('parent'),
    telephone: headers.indexOf('telephone') !== -1 ? headers.indexOf('telephone') : headers.indexOf('tel'),
  };

  const seenMatriculesInFile = new Set<string>();
  const existingMatricules = new Set(existingStudents.map((s) => s.studentNumber.toLowerCase().trim()));

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    result.totalRows++;

    const cols = rawLine.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    const matricule = cols[colIndex.matricule] || '';
    const nom = cols[colIndex.nom] || '';
    const prenom = cols[colIndex.prenom] || '';
    const sexe = (cols[colIndex.sexe] || '').toUpperCase();
    const birthDate = colIndex.dateNaissance !== -1 ? cols[colIndex.dateNaissance] : undefined;
    const birthPlace = colIndex.lieuNaissance !== -1 ? cols[colIndex.lieuNaissance] : undefined;
    const guardianName = colIndex.tuteur !== -1 ? cols[colIndex.tuteur] : undefined;
    const guardianPhone = colIndex.telephone !== -1 ? cols[colIndex.telephone] : undefined;

    // Validations
    if (!matricule) {
      result.errors.push({ row: i + 1, field: 'matricule', message: 'Matricule manquant.', raw: rawLine });
      continue;
    }

    const normMat = matricule.toLowerCase().trim();
    if (seenMatriculesInFile.has(normMat)) {
      result.errors.push({ row: i + 1, field: 'matricule', message: `Matricule en doublon dans le fichier (${matricule}).`, raw: rawLine });
      continue;
    }
    seenMatriculesInFile.add(normMat);

    if (existingMatricules.has(normMat)) {
      result.errors.push({ row: i + 1, field: 'matricule', message: `Le matricule ${matricule} existe déjà dans l'établissement.`, raw: rawLine });
      continue;
    }

    if (!nom) {
      result.errors.push({ row: i + 1, field: 'nom', message: 'Nom de famille manquant.', raw: rawLine });
      continue;
    }

    if (!prenom) {
      result.errors.push({ row: i + 1, field: 'prenom', message: 'Prénom manquant.', raw: rawLine });
      continue;
    }

    if (!['M', 'F'].includes(sexe)) {
      result.errors.push({ row: i + 1, field: 'sexe', message: `Genre invalide (${sexe}). Attendu : M ou F.`, raw: rawLine });
      continue;
    }

    result.validRows.push({
      studentNumber: matricule,
      lastName: nom.toUpperCase(),
      firstName: prenom,
      gender: sexe as 'M' | 'F',
      birthDate,
      birthPlace,
      guardianName,
      guardianPhone,
      schoolClassId: classId,
      active: true,
      conductScore: 18.0,
      unexcusedAbsences: 0,
      excusedAbsences: 0,
    });
  }

  return result;
}

/**
 * Génère le modèle CSV d'exemple pour l'import
 */
export function generateStudentsCSVTemplate(): string {
  return [
    'matricule;nom;prenom;sexe;date_naissance;lieu_naissance;tuteur;telephone',
    'CG-PN-2026-0091;MOUKASSA;Christian;M;2008-04-14;Pointe-Noire;Moukassa Félix;+242 06 680 12 45',
    'CG-PN-2026-0092;NGOMA;Esther;F;2008-08-22;Pointe-Noire;Ngoma Gilbert;+242 05 533 89 10',
    'CG-PN-2026-0093;MABIALA;Yannick;M;2007-11-03;Dolisie;Mabiala André;+242 06 912 40 77',
  ].join('\n');
}

/**
 * Télécharge un fichier texte/CSV dans le navigateur
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
