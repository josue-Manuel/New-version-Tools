/**
 * New Version School Tools — Implémentation du Dépôt Notes Web (IndexedDBGradeRepository)
 */

import { Grade } from '../../../domain/types';
import { IGradeRepository, GradeFilter } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBGradeRepository implements IGradeRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<Grade | null> {
    return await this.adapter.get<Grade>(STORES.GRADES, id);
  }

  async getAll(filter?: GradeFilter): Promise<Grade[]> {
    let list = await this.adapter.getAll<Grade>(STORES.GRADES);

    if (filter) {
      if (filter.assessmentId) {
        list = list.filter((g) => g.assessmentId === filter.assessmentId);
      }
      if (filter.studentId) {
        list = list.filter((g) => g.studentId === filter.studentId);
      }
    }

    return list;
  }

  async getByAssessment(assessmentId: string): Promise<Grade[]> {
    return await this.getAll({ assessmentId });
  }

  async getByStudent(studentId: string): Promise<Grade[]> {
    return await this.getAll({ studentId });
  }

  async getGrade(studentId: string, assessmentId: string): Promise<Grade | null> {
    const list = await this.getAll({ studentId, assessmentId });
    return list[0] || null;
  }

  async getByAssessments(assessmentIds: string[]): Promise<Grade[]> {
    if (assessmentIds.length === 0) return [];
    const idSet = new Set(assessmentIds);
    const all = await this.adapter.getAll<Grade>(STORES.GRADES);
    return all.filter((g) => idSet.has(g.assessmentId));
  }

  async save(grade: Grade): Promise<void> {
    if (!grade.id) {
      throw new Error("L'identifiant de la note est obligatoire.");
    }
    if (!grade.studentId) {
      throw new Error("L'identifiant de l'élève est obligatoire.");
    }
    if (!grade.assessmentId) {
      throw new Error("L'identifiant de l'évaluation est obligatoire.");
    }
    if (grade.score !== null && grade.score < 0) {
      throw new Error("Une note ne peut pas être négative.");
    }

    await this.adapter.put(STORES.GRADES, {
      ...grade,
      updatedAt: grade.updatedAt || new Date().toISOString(),
    });
  }

  async saveBatch(grades: Grade[]): Promise<void> {
    const sanitized = grades.map((g) => ({
      ...g,
      updatedAt: g.updatedAt || new Date().toISOString(),
    }));
    await this.adapter.putBatch(STORES.GRADES, sanitized);
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.GRADES, id);
  }

  async deleteByAssessment(assessmentId: string): Promise<void> {
    const all = await this.getByAssessment(assessmentId);
    for (const g of all) {
      await this.adapter.delete(STORES.GRADES, g.id);
    }
  }

  async count(): Promise<number> {
    const all = await this.adapter.getAll<Grade>(STORES.GRADES);
    // Compte uniquement les notes effectivement saisies (score !== null)
    return all.filter((g) => g.score !== null).length;
  }
}
