/**
 * New Version School Tools — Interface du Dépôt Évaluations (IAssessmentRepository)
 *
 * Gère les épreuves et évaluations scolaires :
 * - Devoirs surveillés, interrogations de cours, compositions trimestrielles
 * - Rattachement strict à une classe, une matière et une période (trimestre)
 * - Barème (/20, /10, /40) et coefficient de pondération
 */

import { Assessment } from '../types';
import { IRepository } from './IRepository';

export interface AssessmentFilter {
  classId?: string;
  periodId?: string;
  subjectId?: string;
}

export interface IAssessmentRepository extends IRepository<Assessment, string> {
  /**
   * Récupère les évaluations selon des critères précis (classe, période, matière).
   */
  getAll(filter?: AssessmentFilter): Promise<Assessment[]>;

  /**
   * Récupère toutes les évaluations associées à une classe et un trimestre donnés.
   */
  getByClassAndPeriod(classId: string, periodId: string): Promise<Assessment[]>;

  /**
   * Compte le nombre total d'évaluations enregistrées.
   */
  count(classId?: string): Promise<number>;
}
