/**
 * New Version School Tools — Implémentation du Dépôt Matières Web (IndexedDBSubjectRepository)
 */

import { Subject, ClassSubject } from '../../../domain/types';
import { ISubjectRepository } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBSubjectRepository implements ISubjectRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<Subject | null> {
    return await this.adapter.get<Subject>(STORES.SUBJECTS, id);
  }

  async getAll(levelId?: string): Promise<Subject[]> {
    let list = await this.adapter.getAll<Subject>(STORES.SUBJECTS);
    if (levelId) {
      list = list.filter((s) => s.schoolLevelId === levelId);
    }
    return list;
  }

  async save(subject: Subject): Promise<void> {
    if (!subject.id) {
      throw new Error("L'identifiant de la matière est obligatoire.");
    }
    if (!subject.name || subject.name.trim().length === 0) {
      throw new Error('Le nom de la matière est obligatoire.');
    }
    if (subject.defaultCoefficient <= 0) {
      throw new Error('Le coefficient par défaut doit être strictement supérieur à 0.');
    }
    await this.adapter.put(STORES.SUBJECTS, {
      ...subject,
      name: subject.name.trim(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.SUBJECTS, id);
  }

  async getClassSubjects(classId?: string): Promise<ClassSubject[]> {
    let list = await this.adapter.getAll<ClassSubject>(STORES.CLASS_SUBJECTS);
    if (classId) {
      list = list.filter((cs) => cs.schoolClassId === classId);
    }
    return list;
  }

  async getClassSubjectById(id: string): Promise<ClassSubject | null> {
    return await this.adapter.get<ClassSubject>(STORES.CLASS_SUBJECTS, id);
  }

  async saveClassSubject(classSubject: ClassSubject): Promise<void> {
    if (!classSubject.id) {
      throw new Error("L'identifiant de l'affectation de matière est obligatoire.");
    }
    if (classSubject.coefficient <= 0) {
      throw new Error('Le coefficient de la matière dans la classe doit être supérieur à zéro.');
    }
    await this.adapter.put(STORES.CLASS_SUBJECTS, classSubject);
  }

  async deleteClassSubject(id: string): Promise<void> {
    await this.adapter.delete(STORES.CLASS_SUBJECTS, id);
  }

  async count(): Promise<number> {
    return await this.adapter.count(STORES.SUBJECTS);
  }
}
