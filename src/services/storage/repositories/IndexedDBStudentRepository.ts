/**
 * New Version School Tools — Implémentation du Dépôt Élèves Web (IndexedDBStudentRepository)
 *
 * Implémente IStudentRepository via l'adaptateur résilient WebStorageAdapter.
 */

import { Student } from '../../../domain/types';
import { IStudentRepository, StudentFilter } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';

export class IndexedDBStudentRepository implements IStudentRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getById(id: string): Promise<Student | null> {
    return await this.adapter.get<Student>(STORES.STUDENTS, id);
  }

  async getAll(filter?: StudentFilter): Promise<Student[]> {
    let list = await this.adapter.getAll<Student>(STORES.STUDENTS);

    if (filter) {
      if (filter.classId) {
        list = list.filter((s) => s.schoolClassId === filter.classId);
      }
      if (filter.activeOnly) {
        list = list.filter((s) => s.active);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase().trim();
        list = list.filter(
          (s) =>
            s.lastName.toLowerCase().includes(query) ||
            s.firstName.toLowerCase().includes(query) ||
            s.studentNumber.toLowerCase().includes(query)
        );
      }
    }

    return list;
  }

  async getByStudentNumber(studentNumber: string): Promise<Student | null> {
    const normalized = studentNumber.trim().toUpperCase();
    const all = await this.adapter.getAll<Student>(STORES.STUDENTS);
    return all.find((s) => s.studentNumber.trim().toUpperCase() === normalized) || null;
  }

  async getByClass(classId: string, activeOnly = true): Promise<Student[]> {
    return await this.getAll({ classId, activeOnly });
  }

  async save(student: Student): Promise<void> {
    if (!student.id) {
      throw new Error("L'identifiant de l'élève est obligatoire.");
    }
    if (!student.lastName || student.lastName.trim().length === 0) {
      throw new Error("Le nom de famille de l'élève est obligatoire.");
    }
    if (!student.firstName || student.firstName.trim().length === 0) {
      throw new Error("Le prénom de l'élève est obligatoire.");
    }
    if (!student.studentNumber || student.studentNumber.trim().length === 0) {
      throw new Error("Le matricule officiel de l'élève est obligatoire.");
    }

    // Vérifier l'unicité du matricule (hors l'élève lui-même en cas de mise à jour)
    const existing = await this.getByStudentNumber(student.studentNumber);
    if (existing && existing.id !== student.id) {
      throw new Error(
        `Le matricule '${student.studentNumber}' est déjà attribué à ${existing.lastName} ${existing.firstName}.`
      );
    }

    const sanitized: Student = {
      ...student,
      lastName: student.lastName.trim(),
      firstName: student.firstName.trim(),
      studentNumber: student.studentNumber.trim(),
      enrolledAt: student.enrolledAt || new Date().toISOString(),
      active: student.active !== undefined ? student.active : true,
    };

    await this.adapter.put(STORES.STUDENTS, sanitized);
  }

  async saveBatch(students: Student[]): Promise<void> {
    // Vérification de doublons internes dans le lot
    const seenNumbers = new Set<string>();
    for (const s of students) {
      const num = s.studentNumber.trim().toUpperCase();
      if (seenNumbers.has(num)) {
        throw new Error(`Doublon de matricule '${s.studentNumber}' détecté dans le lot à importer.`);
      }
      seenNumbers.add(num);
    }

    for (const student of students) {
      await this.save(student);
    }
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORES.STUDENTS, id);
  }

  async archive(id: string): Promise<void> {
    const student = await this.getById(id);
    if (student) {
      student.active = false;
      await this.adapter.put(STORES.STUDENTS, student);
    }
  }

  async restore(id: string): Promise<void> {
    const student = await this.getById(id);
    if (student) {
      student.active = true;
      await this.adapter.put(STORES.STUDENTS, student);
    }
  }

  async count(classId?: string): Promise<number> {
    if (classId) {
      const classStudents = await this.getByClass(classId, false);
      return classStudents.length;
    }
    return await this.adapter.count(STORES.STUDENTS);
  }
}
