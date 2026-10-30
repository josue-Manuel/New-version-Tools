/**
 * New Version School Tools — Implémentation du Dépôt Paiements Web (IndexedDBPaymentRepository)
 *
 * Enregistrement et suivi des règlements de scolarité (Pointe-Noire) sans appel serveur.
 */

import { FeeTransaction } from '../../../domain/types';
import {
  IPaymentRepository,
  PaymentFilter,
  StudentFinancialBalance,
} from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBPaymentRepository implements IPaymentRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<FeeTransaction | null> {
    return await this.adapter.get<FeeTransaction>(STORES.PAYMENTS, id);
  }

  async getAll(filter?: PaymentFilter): Promise<FeeTransaction[]> {
    let list = await this.adapter.getAll<FeeTransaction>(STORES.PAYMENTS);

    if (filter) {
      if (filter.studentId) {
        list = list.filter((t) => t.studentId === filter.studentId);
      }
      if (filter.classId) {
        list = list.filter((t) => t.schoolClassId === filter.classId);
      }
      if (filter.status) {
        list = list.filter((t) => t.status === filter.status);
      }
      if (filter.startDate) {
        list = list.filter((t) => t.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((t) => t.timestamp <= filter.endDate!);
      }
    }

    // Tri chronologique antéchronologique (les plus récents en premier)
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getByStudent(studentId: string): Promise<FeeTransaction[]> {
    return await this.getAll({ studentId });
  }

  async getByReceiptNumber(receiptNumber: string): Promise<FeeTransaction | null> {
    const normalized = receiptNumber.trim().toUpperCase();
    const all = await this.adapter.getAll<FeeTransaction>(STORES.PAYMENTS);
    return all.find((t) => t.receiptNumber.trim().toUpperCase() === normalized) || null;
  }

  async getStudentBalance(
    studentId: string,
    standardTuition = 220000 // Tarif de référence standard collège/lycée Congo
  ): Promise<StudentFinancialBalance> {
    const studentTxs = await this.getByStudent(studentId);
    const validTxs = studentTxs.filter((t) => t.status !== 'Annulé');

    const totalPaid = validTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const balanceDue = Math.max(0, standardTuition - totalPaid);

    return {
      studentId,
      totalBilled: standardTuition,
      totalPaid,
      balanceDue,
      isFullyPaid: balanceDue === 0,
      transactionsCount: validTxs.length,
    };
  }

  async getTotalCollected(classId?: string): Promise<number> {
    const list = await this.getAll({ classId, status: 'Quittancé' });
    return list.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }

  async save(transaction: FeeTransaction): Promise<void> {
    if (!transaction.id) {
      throw new Error("L'identifiant du paiement est obligatoire.");
    }
    if (!transaction.receiptNumber || transaction.receiptNumber.trim().length === 0) {
      throw new Error("Le numéro de reçu officiel est obligatoire.");
    }
    if (!transaction.studentId) {
      throw new Error("L'élève rattaché au paiement est obligatoire.");
    }
    if (transaction.amount <= 0) {
      throw new Error("Le montant du règlement doit être strictement supérieur à 0 FCFA.");
    }

    // Contrôle d'unicité du reçu
    const existing = await this.getByReceiptNumber(transaction.receiptNumber);
    if (existing && existing.id !== transaction.id) {
      throw new Error(`Le numéro de reçu '${transaction.receiptNumber}' existe déjà.`);
    }

    await this.adapter.put(STORES.PAYMENTS, {
      ...transaction,
      receiptNumber: transaction.receiptNumber.trim(),
      timestamp: transaction.timestamp || new Date().toISOString(),
      status: transaction.status || 'Quittancé',
    });
  }

  async cancelTransaction(id: string, reason?: string): Promise<void> {
    const tx = await this.getById(id);
    if (tx) {
      tx.status = 'Annulé';
      if (reason) {
        tx.notes = tx.notes ? `${tx.notes} | Annulation: ${reason}` : `Annulation: ${reason}`;
      }
      await this.adapter.put(STORES.PAYMENTS, tx);
    }
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.PAYMENTS, id);
  }

  async count(): Promise<number> {
    return await this.adapter.count(STORES.PAYMENTS);
  }
}
