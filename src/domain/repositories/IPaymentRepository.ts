/**
 * New Version School Tools — Interface du Dépôt Paiements & Trésorerie (IPaymentRepository)
 *
 * Gère la comptabilité des frais scolaires pour les écoles de Pointe-Noire :
 * - Inscription, tranches de scolarité, frais d'examen d'État (BEPC, Bac)
 * - Modes de règlement locaux (Airtel Money Congo, MTN Mobile Money, Espèces, Virement BGFI)
 * - Quittancement et numérotation séquentielle des reçus de caisse
 * - Calcul du solde financier par élève (facturé, acquitté, reste dû)
 * - 100 % local-first, sans simulation de serveur distant
 */

import { FeeTransaction } from '../types';
import { IRepository } from './IRepository';

export interface PaymentFilter {
  studentId?: string;
  classId?: string;
  status?: FeeTransaction['status'];
  startDate?: string;
  endDate?: string;
}

export interface StudentFinancialBalance {
  studentId: string;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  isFullyPaid: boolean;
  transactionsCount: number;
}

export interface IPaymentRepository extends IRepository<FeeTransaction, string> {
  /**
   * Récupère la liste des transactions avec filtres facultatifs.
   */
  getAll(filter?: PaymentFilter): Promise<FeeTransaction[]>;

  /**
   * Récupère les transactions d'un élève spécifique.
   */
  getByStudent(studentId: string): Promise<FeeTransaction[]>;

  /**
   * Recherche une transaction par son numéro de reçu officiel (ex: "REC-2026-0042").
   */
  getByReceiptNumber(receiptNumber: string): Promise<FeeTransaction | null>;

  /**
   * Calcule le bilan financier d'un élève (frais dus vs montants réglés).
   */
  getStudentBalance(studentId: string, standardTuition?: number): Promise<StudentFinancialBalance>;

  /**
   * Calcule le total encaissé (globalement ou filtré par classe).
   */
  getTotalCollected(classId?: string): Promise<number>;

  /**
   * Annule un encaissement (statut 'Annulé') avec traçabilité sans destruction de la pièce comptable.
   */
  cancelTransaction(id: string, reason?: string): Promise<void>;

  /**
   * Compte le nombre total de reçus émis.
   */
  count(): Promise<number>;
}
