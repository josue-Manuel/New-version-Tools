/**
 * New Version School Tools — Interface du Dépôt Notes & Résultats (IGradeRepository)
 *
 * Gère le registre matriciel des notes scolaires :
 * - Saisie, consultation et mise à jour unitaire ou matricielle
 * - Traitement strict de la note manquante (null) distincte de zéro (0/20)
 * - Enregistrement par lot lors de la saisie d'un devoir pour toute une classe
 * - Suppression en cascade lors de la suppression d'une évaluation
 */

import { Grade } from '../types';
import { IRepository } from './IRepository';

export interface GradeFilter {
  assessmentId?: string;
  studentId?: string;
}

export interface IGradeRepository extends IRepository<Grade, string> {
  /**
   * Récupère la liste des notes selon un filtre (par évaluation ou par élève).
   */
  getAll(filter?: GradeFilter): Promise<Grade[]>;

  /**
   * Récupère toutes les notes attribuées pour une évaluation spécifique.
   */
  getByAssessment(assessmentId: string): Promise<Grade[]>;

  /**
   * Récupère toutes les notes d'un élève.
   */
  getByStudent(studentId: string): Promise<Grade[]>;

  /**
   * Récupère la note précise d'un élève à une évaluation donnée.
   */
  getGrade(studentId: string, assessmentId: string): Promise<Grade | null>;

  /**
   * Récupère l'ensemble des notes pour une liste d'évaluations (vue matricielle de classe).
   */
  getByAssessments(assessmentIds: string[]): Promise<Grade[]>;

  /**
   * Enregistre un lot de notes (sauvegarde atomique de la grille de classe).
   */
  saveBatch(grades: Grade[]): Promise<void>;

  /**
   * Supprime toutes les notes rattachées à une évaluation supprimée.
   */
  deleteByAssessment(assessmentId: string): Promise<void>;

  /**
   * Compte le nombre total de notes renseignées.
   */
  count(): Promise<number>;
}
