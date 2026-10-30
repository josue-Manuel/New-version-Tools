/**
 * New Version School Tools — Interface du Dépôt Classes & Niveaux (IClassRepository)
 *
 * Gère la structure pédagogique de l'établissement :
 * - Niveaux (Primaire, Collège, Lycée)
 * - Classes et séries (Terminale C, 3ème A, CM2, etc.)
 * - Association par année académique et suivi de capacité
 */

import { SchoolClass, SchoolLevel } from '../types';
import { IRepository } from './IRepository';

export interface IClassRepository extends IRepository<SchoolClass, string> {
  /**
   * Récupère toutes les classes, avec filtre facultatif sur l'année académique.
   */
  getAll(academicYearId?: string): Promise<SchoolClass[]>;

  /**
   * Récupère les classes associées à un niveau d'enseignement spécifique.
   */
  getByLevel(levelId: string): Promise<SchoolClass[]>;

  /**
   * Récupère la liste des niveaux d'enseignement configurés (Primaire, Collège, Lycée).
   */
  getLevels(): Promise<SchoolLevel[]>;

  /**
   * Récupère un niveau par son identifiant.
   */
  getLevelById(id: string): Promise<SchoolLevel | null>;

  /**
   * Enregistre ou met à jour un niveau d'enseignement.
   */
  saveLevel(level: SchoolLevel): Promise<void>;

  /**
   * Supprime un niveau d'enseignement.
   */
  deleteLevel(id: string): Promise<void>;

  /**
   * Compte le nombre total de classes.
   */
  count(academicYearId?: string): Promise<number>;
}
