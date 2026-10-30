/**
 * New Version School Tools — Implémentation du Dépôt Classes & Niveaux Web (IndexedDBClassRepository)
 */

import { SchoolClass, SchoolLevel } from '../../../domain/types';
import { IClassRepository } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBClassRepository implements IClassRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<SchoolClass | null> {
    return await this.adapter.get<SchoolClass>(STORES.CLASSES, id);
  }

  async getAll(academicYearId?: string): Promise<SchoolClass[]> {
    let list = await this.adapter.getAll<SchoolClass>(STORES.CLASSES);
    if (academicYearId) {
      list = list.filter((c) => c.academicYearId === academicYearId);
    }
    return list;
  }

  async getByLevel(levelId: string): Promise<SchoolClass[]> {
    const list = await this.adapter.getAll<SchoolClass>(STORES.CLASSES);
    return list.filter((c) => c.schoolLevelId === levelId);
  }

  async save(schoolClass: SchoolClass): Promise<void> {
    if (!schoolClass.id) {
      throw new Error("L'identifiant de la classe est obligatoire.");
    }
    if (!schoolClass.name || schoolClass.name.trim().length === 0) {
      throw new Error('Le nom de la classe est obligatoire (ex: "Terminale C", "3ème A").');
    }
    await this.adapter.put(STORES.CLASSES, {
      ...schoolClass,
      name: schoolClass.name.trim(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.CLASSES, id);
  }

  async getLevels(): Promise<SchoolLevel[]> {
    return await this.adapter.getAll<SchoolLevel>(STORES.SCHOOL_LEVELS);
  }

  async getLevelById(id: string): Promise<SchoolLevel | null> {
    return await this.adapter.get<SchoolLevel>(STORES.SCHOOL_LEVELS, id);
  }

  async saveLevel(level: SchoolLevel): Promise<void> {
    if (!level.id) {
      throw new Error("L'identifiant du niveau scolaire est obligatoire.");
    }
    if (!level.name || level.name.trim().length === 0) {
      throw new Error('Le nom du niveau scolaire est obligatoire.');
    }
    await this.adapter.put(STORES.SCHOOL_LEVELS, {
      ...level,
      name: level.name.trim(),
    });
  }

  async deleteLevel(id: string): Promise<void> {
    await this.adapter.delete(STORES.SCHOOL_LEVELS, id);
  }

  async count(academicYearId?: string): Promise<number> {
    const classes = await this.getAll(academicYearId);
    return classes.length;
  }
}
