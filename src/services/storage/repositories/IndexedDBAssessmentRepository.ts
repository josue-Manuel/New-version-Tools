/**
 * New Version School Tools — Implémentation du Dépôt Évaluations Web (IndexedDBAssessmentRepository)
 */

import { Assessment } from '../../../domain/types';
import { IAssessmentRepository, AssessmentFilter } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBAssessmentRepository implements IAssessmentRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<Assessment | null> {
    return await this.adapter.get<Assessment>(STORES.ASSESSMENTS, id);
  }

  async getAll(filter?: AssessmentFilter): Promise<Assessment[]> {
    let list = await this.adapter.getAll<Assessment>(STORES.ASSESSMENTS);

    if (filter) {
      if (filter.classId) {
        list = list.filter((a) => a.schoolClassId === filter.classId);
      }
      if (filter.periodId) {
        list = list.filter((a) => a.periodId === filter.periodId);
      }
      if (filter.subjectId) {
        list = list.filter((a) => a.subjectId === filter.subjectId);
      }
    }

    return list;
  }

  async getByClassAndPeriod(classId: string, periodId: string): Promise<Assessment[]> {
    return await this.getAll({ classId, periodId });
  }

  async save(assessment: Assessment): Promise<void> {
    if (!assessment.id) {
      throw new Error("L'identifiant de l'évaluation est obligatoire.");
    }
    if (!assessment.name || assessment.name.trim().length === 0) {
      throw new Error("Le libellé de l'évaluation est obligatoire (ex: Devoir N°1).");
    }
    if (assessment.maxScore <= 0) {
      throw new Error("Le barème maximum de l'évaluation doit être strictement supérieur à zéro.");
    }
    if (assessment.coefficient <= 0) {
      throw new Error("Le coefficient de l'évaluation doit être strictement supérieur à zéro.");
    }

    await this.adapter.put(STORES.ASSESSMENTS, {
      ...assessment,
      name: assessment.name.trim(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.ASSESSMENTS, id);

    // Supprimer également les notes liées à cette évaluation
    const allGrades = await this.adapter.getAll<{ id: string; assessmentId: string }>(
      STORES.GRADES
    );
    const related = allGrades.filter((g) => g.assessmentId === id);
    for (const g of related) {
      await this.adapter.delete(STORES.GRADES, g.id);
    }
  }

  async count(classId?: string): Promise<number> {
    if (classId) {
      const list = await this.getAll({ classId });
      return list.length;
    }
    return await this.adapter.count(STORES.ASSESSMENTS);
  }
}
