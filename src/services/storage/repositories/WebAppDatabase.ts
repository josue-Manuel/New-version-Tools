/**
 * New Version School Tools — Base de Données Web Unifiée (WebAppDatabase)
 *
 * Implémentation complète de IAppDatabase regroupant l'ensemble des dépôts spécialisés
 * au sein d'une unité de travail (Unit of Work) cohérente et testable.
 *
 * Gère le repli résilient face aux restrictions d'iframe dans Google AI Studio et
 * assure une frontière nette prête pour le futur connecteur SQLite (Tauri 2).
 */

import {
  IAppDatabase,
  DatabaseHealthInfo,
  ISchoolConfigRepository,
  IStudentRepository,
  IClassRepository,
  ISubjectRepository,
  IAssessmentRepository,
  IGradeRepository,
  IPaymentRepository,
} from '../../../domain/repositories';
import { WebStorageAdapter, defaultWebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES, StoreName } from '../db/WebDatabaseSchema';

import { IndexedDBSchoolConfigRepository } from './IndexedDBSchoolConfigRepository';
import { IndexedDBStudentRepository } from './IndexedDBStudentRepository';
import { IndexedDBClassRepository } from './IndexedDBClassRepository';
import { IndexedDBSubjectRepository } from './IndexedDBSubjectRepository';
import { IndexedDBAssessmentRepository } from './IndexedDBAssessmentRepository';
import { IndexedDBGradeRepository } from './IndexedDBGradeRepository';
import { IndexedDBPaymentRepository } from './IndexedDBPaymentRepository';

export class WebAppDatabase implements IAppDatabase {
  public readonly schoolConfig: ISchoolConfigRepository;
  public readonly students: IStudentRepository;
  public readonly classes: IClassRepository;
  public readonly subjects: ISubjectRepository;
  public readonly assessments: IAssessmentRepository;
  public readonly grades: IGradeRepository;
  public readonly payments: IPaymentRepository;

  constructor(private adapter: WebStorageAdapter = defaultWebStorageAdapter) {
    this.schoolConfig = new IndexedDBSchoolConfigRepository(this.adapter);
    this.students = new IndexedDBStudentRepository(this.adapter);
    this.classes = new IndexedDBClassRepository(this.adapter);
    this.subjects = new IndexedDBSubjectRepository(this.adapter);
    this.assessments = new IndexedDBAssessmentRepository(this.adapter);
    this.grades = new IndexedDBGradeRepository(this.adapter);
    this.payments = new IndexedDBPaymentRepository(this.adapter);
  }

  async checkHealth(): Promise<DatabaseHealthInfo> {
    const isPersistent = this.adapter.isPersistent();
    const backendType = this.adapter.getActiveEngineName();
    const incident = this.adapter.getLastIncident();

    if (incident) {
      return {
        status: 'warning',
        message: `Stockage local actif via ${backendType}. Incident IndexedDB intercepté (${incident.errorName}) et bascule transparente effectuée. Données préservées après actualisation (F5).`,
        backendType,
        isPersistent,
        details: { incident },
      };
    }

    return {
      status: 'ok',
      message: `Base de données locale opérationnelle via ${backendType}. Données persistantes après rechargement F5.`,
      backendType,
      isPersistent,
    };
  }

  async exportData(): Promise<Record<string, unknown>> {
    const storeKeys = Object.values(STORES) as StoreName[];
    const result: Record<string, unknown> = {
      _meta: {
        exportedAt: new Date().toISOString(),
        engine: this.adapter.getActiveEngineName(),
        version: 2,
      },
    };

    for (const store of storeKeys) {
      result[store] = await this.adapter.getAll(store);
    }

    return result;
  }

  async restoreData(snapshot: Record<string, unknown>): Promise<void> {
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error("L'instantané de restauration est invalide ou corrompu.");
    }

    const storeKeys = Object.values(STORES) as StoreName[];

    for (const store of storeKeys) {
      if (Array.isArray(snapshot[store])) {
        await this.adapter.clearStore(store);
        const items = snapshot[store] as any[];
        await this.adapter.putBatch(store, items);
      }
    }
  }

  async clear(): Promise<void> {
    const storeKeys = Object.values(STORES) as StoreName[];
    for (const store of storeKeys) {
      await this.adapter.clearStore(store);
    }
  }
}

// Instance globale par défaut pour l'application
export const defaultAppDatabase = new WebAppDatabase();
