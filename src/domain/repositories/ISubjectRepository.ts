/**
 * New Version School Tools — Interface du Dépôt Matières & Coefficients (ISubjectRepository)
 *
 * Gère le catalogue officiel des disciplines et leur affectation :
 * - Matières du programme officiel (Maths, PC, SVT, Français, Histoire-Géo, etc.)
 * - Barèmes standard (/20, /10) et coefficients par défaut
 * - Affectation par classe (ClassSubject) avec coefficients spécifiques et nom de l'enseignant
 */

import { Subject, ClassSubject } from '../types';
import { IRepository } from './IRepository';

export interface ISubjectRepository extends IRepository<Subject, string> {
  /**
   * Récupère la liste des matières, filtrable par niveau d'enseignement.
   */
  getAll(levelId?: string): Promise<Subject[]>;

  /**
   * Récupère les matières affectées à une classe spécifique avec leurs coefficients.
   */
  getClassSubjects(classId?: string): Promise<ClassSubject[]>;

  /**
   * Récupère l'association d'une matière dans une classe.
   */
  getClassSubjectById(id: string): Promise<ClassSubject | null>;

  /**
   * Enregistre ou met à jour l'affectation d'une matière dans une classe.
   */
  saveClassSubject(classSubject: ClassSubject): Promise<void>;

  /**
   * Supprime l'affectation d'une matière dans une classe.
   */
  deleteClassSubject(id: string): Promise<void>;

  /**
   * Compte le nombre de matières enregistrées.
   */
  count(): Promise<number>;
}
