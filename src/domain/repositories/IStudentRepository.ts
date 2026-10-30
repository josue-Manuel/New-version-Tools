/**
 * New Version School Tools — Interface du Dépôt Élèves (IStudentRepository)
 *
 * Gère le cycle de vie complet des élèves :
 * - Inscription et création avec génération de matricule unique
 * - Consultation unitaire et par classe
 * - Modification de dossier scolaire
 * - Archivage (désactivation) et suppression sécurisée
 * - Importation par lot
 */

import { Student } from '../types';
import { IRepository } from './IRepository';

export interface StudentFilter {
  classId?: string;
  activeOnly?: boolean;
  searchQuery?: string;
}

export interface IStudentRepository extends IRepository<Student, string> {
  /**
   * Récupère la liste des élèves avec options de filtrage (classe, actif, recherche).
   */
  getAll(filter?: StudentFilter): Promise<Student[]>;

  /**
   * Recherche un élève par son matricule officiel unique (ex: "CG-PN-2026-0042").
   */
  getByStudentNumber(studentNumber: string): Promise<Student | null>;

  /**
   * Récupère tous les élèves inscrits dans une classe spécifique.
   */
  getByClass(classId: string, activeOnly?: boolean): Promise<Student[]>;

  /**
   * Enregistre un lot d'élèves (notamment pour l'import CSV massif).
   */
  saveBatch(students: Student[]): Promise<void>;

  /**
   * Archive un élève en passant son statut 'active' à false sans supprimer son historique de notes.
   */
  archive(id: string): Promise<void>;

  /**
   * Réactive un élève précédemment archivé.
   */
  restore(id: string): Promise<void>;

  /**
   * Compte le nombre d'élèves (globalement ou par classe).
   */
  count(classId?: string): Promise<number>;
}
