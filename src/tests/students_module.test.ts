/**
 * New Version School Tools — Tests Automatisés du Module Élèves (Phase 2.1)
 *
 * Vérifie l'ensemble des exigences fonctionnelles et techniques :
 * 1. Création et inscription d'un élève avec validation des champs obligatoires
 * 2. Unicité stricte du matricule scolaire officiel et rejet des doublons
 * 3. Consultation et recherche multi-critères (nom, prénom, matricule)
 * 4. Modification des informations du dossier élève
 * 5. Archivage sans perte de données et réactivation
 * 6. Filtrage par classe et statut
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebStorageAdapter } from '../services/storage/db/WebStorageAdapter';
import { IndexedDBStudentRepository } from '../services/storage/repositories/IndexedDBStudentRepository';
import { IndexedDBClassRepository } from '../services/storage/repositories/IndexedDBClassRepository';
import { Student, SchoolClass } from '../domain/types';

describe('Phase 2.1 — Module de Gestion des Élèves (Repository & Métier)', () => {
  let adapter: WebStorageAdapter;
  let studentRepo: IndexedDBStudentRepository;
  let classRepo: IndexedDBClassRepository;

  // Création d'un mock Storage pour isoler les tests
  const createMockStorage = (): Storage => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = String(val);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (i: number) => Object.keys(store)[i] || null,
      length: 0,
    };
  };

  beforeEach(() => {
    const mockStorage = createMockStorage();
    adapter = new WebStorageAdapter(mockStorage);
    studentRepo = new IndexedDBStudentRepository(adapter);
    classRepo = new IndexedDBClassRepository(adapter);
  });

  it('1. Enregistre un élève avec ses informations essentielles et facultatives', async () => {
    const student: Student = {
      id: 'stu_001',
      studentNumber: 'CG-PN-2026-0001',
      lastName: 'MAVOUNGOU',
      firstName: 'Grace Divine',
      gender: 'F',
      schoolClassId: 'cls_tle_c',
      birthDate: '2008-05-14',
      birthPlace: 'Pointe-Noire',
      guardianName: 'Jean-Pierre MAVOUNGOU',
      guardianPhone: '+242 06 654 32 10',
      guardianAddress: 'Tié-Tié, Pointe-Noire',
      active: true,
      enrolledAt: '2026-09-01T08:00:00.000Z',
    };

    await studentRepo.save(student);

    const saved = await studentRepo.getById('stu_001');
    expect(saved).not.toBeNull();
    expect(saved?.studentNumber).toBe('CG-PN-2026-0001');
    expect(saved?.lastName).toBe('MAVOUNGOU');
    expect(saved?.firstName).toBe('Grace Divine');
    expect(saved?.gender).toBe('F');
    expect(saved?.birthPlace).toBe('Pointe-Noire');
    expect(saved?.guardianName).toBe('Jean-Pierre MAVOUNGOU');
    expect(saved?.active).toBe(true);
  });

  it('2. Refuse la création d’un élève si des champs obligatoires sont manquants', async () => {
    // Manque nom
    await expect(
      studentRepo.save({
        id: 'stu_err_1',
        studentNumber: 'CG-PN-2026-0002',
        lastName: '',
        firstName: 'Michel',
        gender: 'M',
        schoolClassId: 'cls_tle_c',
        active: true,
        enrolledAt: new Date().toISOString(),
      })
    ).rejects.toThrow("Le nom de famille de l'élève est obligatoire.");

    // Manque prénom
    await expect(
      studentRepo.save({
        id: 'stu_err_2',
        studentNumber: 'CG-PN-2026-0003',
        lastName: 'KOUMBA',
        firstName: '   ',
        gender: 'M',
        schoolClassId: 'cls_tle_c',
        active: true,
        enrolledAt: new Date().toISOString(),
      })
    ).rejects.toThrow("Le prénom de l'élève est obligatoire.");

    // Manque matricule
    await expect(
      studentRepo.save({
        id: 'stu_err_3',
        studentNumber: '',
        lastName: 'KOUMBA',
        firstName: 'Michel',
        gender: 'M',
        schoolClassId: 'cls_tle_c',
        active: true,
        enrolledAt: new Date().toISOString(),
      })
    ).rejects.toThrow("Le matricule officiel de l'élève est obligatoire.");
  });

  it('3. Empêche strictement les doublons de matricules scolaires', async () => {
    const student1: Student = {
      id: 'stu_orig',
      studentNumber: 'CG-PN-2026-0010',
      lastName: 'NGOUABI',
      firstName: 'Athanase',
      gender: 'M',
      schoolClassId: 'cls_3eme_a',
      active: true,
      enrolledAt: new Date().toISOString(),
    };
    await studentRepo.save(student1);

    // Tentative d'inscrire un 2e élève avec le même matricule
    const student2: Student = {
      id: 'stu_duplicate',
      studentNumber: 'CG-PN-2026-0010',
      lastName: 'TCHISIAMBOU',
      firstName: 'Serge',
      gender: 'M',
      schoolClassId: 'cls_2nde_c',
      active: true,
      enrolledAt: new Date().toISOString(),
    };

    await expect(studentRepo.save(student2)).rejects.toThrow(
      "Le matricule 'CG-PN-2026-0010' est déjà attribué à NGOUABI Athanase."
    );
  });

  it('4. Permet à un élève de conserver son propre matricule lors d’une mise à jour', async () => {
    const student: Student = {
      id: 'stu_update_test',
      studentNumber: 'CG-PN-2026-0020',
      lastName: 'LOEMBA',
      firstName: 'Christelle',
      gender: 'F',
      schoolClassId: 'cls_cm2',
      active: true,
      enrolledAt: new Date().toISOString(),
    };
    await studentRepo.save(student);

    // Mise à jour (changement de prénom ou de classe sans changer d'id)
    const updated: Student = {
      ...student,
      firstName: 'Christelle Marie',
      schoolClassId: 'cls_6eme_a',
    };

    await expect(studentRepo.save(updated)).resolves.not.toThrow();
    const fetched = await studentRepo.getById('stu_update_test');
    expect(fetched?.firstName).toBe('Christelle Marie');
    expect(fetched?.schoolClassId).toBe('cls_6eme_a');
  });

  it('5. Recherche dynamique par nom, prénom ou matricule', async () => {
    await studentRepo.save({
      id: 'stu_s1',
      studentNumber: 'CG-PN-2026-0101',
      lastName: 'MAKOSSO',
      firstName: 'Anatole',
      gender: 'M',
      schoolClassId: 'cls_tle_c',
      active: true,
      enrolledAt: new Date().toISOString(),
    });
    await studentRepo.save({
      id: 'stu_s2',
      studentNumber: 'CG-PN-2026-0102',
      lastName: 'BAMBOU',
      firstName: 'Clarisse',
      gender: 'F',
      schoolClassId: 'cls_3eme_a',
      active: true,
      enrolledAt: new Date().toISOString(),
    });

    // Recherche par matricule
    const byMatricule = await studentRepo.getAll({ searchQuery: '0101' });
    expect(byMatricule).toHaveLength(1);
    expect(byMatricule[0].lastName).toBe('MAKOSSO');

    // Recherche par nom
    const byLastName = await studentRepo.getAll({ searchQuery: 'makosso' });
    expect(byLastName).toHaveLength(1);
    expect(byLastName[0].firstName).toBe('Anatole');

    // Recherche par prénom
    const byFirstName = await studentRepo.getAll({ searchQuery: 'clarisse' });
    expect(byFirstName).toHaveLength(1);
    expect(byFirstName[0].lastName).toBe('BAMBOU');
  });

  it('6. Archive un élève sans supprimer ses données et permet sa restauration', async () => {
    const student: Student = {
      id: 'stu_archive_test',
      studentNumber: 'CG-PN-2026-0200',
      lastName: 'POATY',
      firstName: 'Julien',
      gender: 'M',
      schoolClassId: 'cls_tle_c',
      active: true,
      enrolledAt: new Date().toISOString(),
    };
    await studentRepo.save(student);

    // Vérifier présence dans la liste active
    let activeStudents = await studentRepo.getAll({ activeOnly: true });
    expect(activeStudents.some((s) => s.id === 'stu_archive_test')).toBe(true);

    // Archiver l'élève
    await studentRepo.archive('stu_archive_test');

    // Ne doit plus apparaître dans les actifs
    activeStudents = await studentRepo.getAll({ activeOnly: true });
    expect(activeStudents.some((s) => s.id === 'stu_archive_test')).toBe(false);

    // Doit toujours exister dans la base complète (historique préservé)
    const archivedStudent = await studentRepo.getById('stu_archive_test');
    expect(archivedStudent).not.toBeNull();
    expect(archivedStudent?.active).toBe(false);

    // Réactiver l'élève
    await studentRepo.restore('stu_archive_test');
    activeStudents = await studentRepo.getAll({ activeOnly: true });
    expect(activeStudents.some((s) => s.id === 'stu_archive_test')).toBe(true);
  });

  it('7. Filtre correctement les élèves par classe d’affectation', async () => {
    await studentRepo.save({
      id: 'stu_c1',
      studentNumber: 'CG-PN-2026-0301',
      lastName: 'MVOULA',
      firstName: 'Jean',
      gender: 'M',
      schoolClassId: 'cls_term_c',
      active: true,
      enrolledAt: new Date().toISOString(),
    });
    await studentRepo.save({
      id: 'stu_c2',
      studentNumber: 'CG-PN-2026-0302',
      lastName: 'KIMBEMBE',
      firstName: 'Sarah',
      gender: 'F',
      schoolClassId: 'cls_term_c',
      active: true,
      enrolledAt: new Date().toISOString(),
    });
    await studentRepo.save({
      id: 'stu_c3',
      studentNumber: 'CG-PN-2026-0303',
      lastName: 'NZALAKANDA',
      firstName: 'Paul',
      gender: 'M',
      schoolClassId: 'cls_3eme_b',
      active: true,
      enrolledAt: new Date().toISOString(),
    });

    const termCStudents = await studentRepo.getByClass('cls_term_c');
    expect(termCStudents).toHaveLength(2);
    expect(termCStudents.map((s) => s.lastName).sort()).toEqual(['KIMBEMBE', 'MVOULA']);

    const countTermC = await studentRepo.count('cls_term_c');
    expect(countTermC).toBe(2);

    const totalCount = await studentRepo.count();
    expect(totalCount).toBe(3);
  });
});
