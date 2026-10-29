/**
 * New Version School Tools — Validation de la Configuration Scolaire
 *
 * Règles communes de validation utilisées par les services de stockage
 * (IndexedDBStorageService, MemoryStorageService, et futur TauriSQLiteStorageService).
 */

import { SchoolConfig, SchoolType } from '../../domain/types';

const VALID_SCHOOL_TYPES: SchoolType[] = ['primary', 'middle', 'secondary', 'mixed'];

export function validateSchoolConfig(config: SchoolConfig): void {
  if (!config) {
    throw new Error('La configuration est obligatoire.');
  }

  // 1. Nom de l'établissement
  if (!config.name || config.name.trim().length === 0) {
    throw new Error("Le nom de l'établissement est obligatoire.");
  }
  if (config.name.trim().length < 3) {
    throw new Error("Le nom de l'établissement doit comporter au moins 3 caractères.");
  }

  // 2. Année scolaire
  if (!config.academicYear || config.academicYear.trim().length === 0) {
    throw new Error("L'année scolaire est obligatoire.");
  }

  const yearPattern = /^(\d{4})[-/](\d{4})$/;
  const match = config.academicYear.trim().match(yearPattern);
  if (!match) {
    throw new Error(
      "Format d'année scolaire invalide. Utilisez le format 'AAAA-AAAA' (ex: 2024-2025)."
    );
  }

  const y1 = parseInt(match[1], 10);
  const y2 = parseInt(match[2], 10);
  if (y2 !== y1 + 1) {
    throw new Error(
      `L'année scolaire doit couvrir deux années consécutives (ex: ${y1}-${y1 + 1}).`
    );
  }

  // 3. Type d'établissement
  if (!config.schoolType || !VALID_SCHOOL_TYPES.includes(config.schoolType)) {
    throw new Error(
      "Type d'établissement scolaire invalide (valeurs autorisées : primary, middle, secondary, mixed)."
    );
  }

  // 4. Ville et pays
  if (!config.city || config.city.trim().length === 0) {
    throw new Error('La ville de l’établissement est obligatoire.');
  }

  if (!config.country || config.country.trim().length === 0) {
    throw new Error('Le pays de l’établissement est obligatoire.');
  }
}
