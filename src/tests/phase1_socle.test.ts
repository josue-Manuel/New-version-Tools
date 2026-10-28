import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageService } from '../services/storage/MemoryStorageService';
import { SchoolConfig } from '../domain/types';
import { TauriBridge } from '../services/native/TauriBridge';
import { SQLITE_SCHEMA_DDL } from '../services/storage/TauriSQLiteSchema';

describe('Phase 1 : Socle Technique — Tests Unitaires', () => {
  let storage: MemoryStorageService;

  beforeEach(() => {
    storage = new MemoryStorageService();
  });

  describe('Service de Stockage Découplé (IStorageService)', () => {
    it('initialise avec un état non configuré et des métriques à zéro', async () => {
      const config = await storage.getSchoolConfig();
      expect(config).toBeNull();

      const metrics = await storage.getDashboardMetrics();
      expect(metrics.studentsCount).toBe(0);
      expect(metrics.classesCount).toBe(0);
      expect(metrics.subjectsCount).toBe(0);
      expect(metrics.assessmentsCount).toBe(0);
      expect(metrics.gradesRecordedCount).toBe(0);
      expect(metrics.isConfigured).toBe(false);
    });

    it('enregistre une configuration valide et met à jour le statut', async () => {
      const validConfig: SchoolConfig = {
        name: 'Lycée Victor Augagneur',
        schoolType: 'secondary',
        academicYear: '2024-2025',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        principalName: 'M. le Proviseur',
        isConfigured: true,
      };

      await storage.saveSchoolConfig(validConfig);
      const retrieved = await storage.getSchoolConfig();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Lycée Victor Augagneur');
      expect(retrieved?.schoolType).toBe('secondary');
      expect(retrieved?.academicYear).toBe('2024-2025');
      expect(retrieved?.city).toBe('Pointe-Noire');
      expect(retrieved?.isConfigured).toBe(true);

      const metrics = await storage.getDashboardMetrics();
      expect(metrics.isConfigured).toBe(true);
      // Les indicateurs d'élèves et notes restent strictement à zéro (pas de fausse donnée)
      expect(metrics.studentsCount).toBe(0);
    });

    it("rejette l'enregistrement si le nom de l'établissement est vide", async () => {
      const invalidConfig: SchoolConfig = {
        name: '   ',
        schoolType: 'primary',
        academicYear: '2024-2025',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };

      await expect(storage.saveSchoolConfig(invalidConfig)).rejects.toThrow(
        "Le nom de l'établissement est obligatoire."
      );
    });

    it("rejette l'enregistrement si l'année scolaire est vide", async () => {
      const invalidConfig: SchoolConfig = {
        name: 'École Primaire 3 Février',
        schoolType: 'primary',
        academicYear: '',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };

      await expect(storage.saveSchoolConfig(invalidConfig)).rejects.toThrow(
        "L'année scolaire est obligatoire."
      );
    });

    it("rejette un format d'année scolaire invalide", async () => {
      const invalidFormats = ['2024', '2024-25', 'annee-scolaire', '20240-20250'];

      for (const format of invalidFormats) {
        const config: SchoolConfig = {
          name: 'Collège Jean-Félix Tchicaya',
          schoolType: 'middle',
          academicYear: format,
          city: 'Pointe-Noire',
          country: 'Congo',
          currency: 'FCFA',
          isConfigured: true,
        };

        await expect(storage.saveSchoolConfig(config)).rejects.toThrow(
          "Format d'année scolaire invalide. Utilisez le format 'AAAA-AAAA' (ex: 2024-2025)."
        );
      }
    });

    it("rejette une année scolaire avec des années non consécutives", async () => {
      const configNonConsecutive: SchoolConfig = {
        name: 'Collège Jean-Félix Tchicaya',
        schoolType: 'middle',
        academicYear: '2024-2022',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };

      await expect(storage.saveSchoolConfig(configNonConsecutive)).rejects.toThrow(
        "L'année scolaire doit couvrir deux années consécutives (ex: 2024-2025)."
      );
    });

    it('accepte les formats conformes 2024-2025 et 2024/2025', async () => {
      const configHyphen: SchoolConfig = {
        name: 'Complexe Scolaire Saint-Exupéry',
        schoolType: 'mixed',
        academicYear: '2024-2025',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };
      await storage.saveSchoolConfig(configHyphen);
      expect((await storage.getSchoolConfig())?.academicYear).toBe('2024-2025');

      const configSlash: SchoolConfig = {
        ...configHyphen,
        academicYear: '2024/2025',
      };
      await storage.saveSchoolConfig(configSlash);
      expect((await storage.getSchoolConfig())?.academicYear).toBe('2024/2025');
    });

    it('retourne une copie défensive pour préserver l’état interne', async () => {
      const config: SchoolConfig = {
        name: 'École Fraternité',
        schoolType: 'primary',
        academicYear: '2024-2025',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };
      await storage.saveSchoolConfig(config);

      const retrieved1 = await storage.getSchoolConfig();
      if (retrieved1) {
        retrieved1.name = 'Nom Falsifié';
      }

      const retrieved2 = await storage.getSchoolConfig();
      expect(retrieved2?.name).toBe('École Fraternité');
    });

    it('réinitialise la configuration à la demande', async () => {
      const config: SchoolConfig = {
        name: 'Lycée Poaty Bernard',
        schoolType: 'secondary',
        academicYear: '2024-2025',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        isConfigured: true,
      };
      await storage.saveSchoolConfig(config);
      expect(await storage.getSchoolConfig()).not.toBeNull();

      await storage.resetSchoolConfig();
      expect(await storage.getSchoolConfig()).toBeNull();

      const metrics = await storage.getDashboardMetrics();
      expect(metrics.isConfigured).toBe(false);
    });

    it('vérifie la bonne santé du service de stockage', async () => {
      const health = await storage.checkHealth();
      expect(health.status).toBe('ok');
      expect(health.backendType).toContain('In-Memory');
    });
  });

  describe('Pont Natif Tauri (TauriBridge)', () => {
    it('détecte correctement l’environnement web de prévisualisation', () => {
      const isTauri = TauriBridge.isTauri();
      expect(typeof isTauri).toBe('boolean');

      const runtimeInfo = TauriBridge.getRuntimeInfo();
      expect(runtimeInfo.platform).toBe(isTauri ? 'desktop-tauri' : 'web-preview');
      expect(typeof runtimeInfo.capabilities.sqliteNative).toBe('boolean');
    });

    it('gère de manière sécurisée les dialogues en mode prévisualisation web', async () => {
      const saveResult = await TauriBridge.saveFileDialog('test.json', ['json']);
      // En environnement web, retourne null pour permettre le repli Blob natif
      if (!TauriBridge.isTauri()) {
        expect(saveResult).toBeNull();
      }

      const openResult = await TauriBridge.openFileDialog(['json']);
      if (!TauriBridge.isTauri()) {
        expect(openResult).toBeNull();
      }
    });
  });

  describe('Spécification du Schéma Relationnel SQLite (Tauri 2)', () => {
    it('contient toutes les tables nécessaires au fonctionnement scolaire', () => {
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS school_config');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS academic_years');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS school_levels');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS school_classes');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS students');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS subjects');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS periods');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS assessments');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE TABLE IF NOT EXISTS grades');
    });

    it('impose la contrainte d’unicité sur le matricule élève et le couple élève/évaluation', () => {
      expect(SQLITE_SCHEMA_DDL).toContain('student_number TEXT NOT NULL UNIQUE');
      expect(SQLITE_SCHEMA_DDL).toContain('UNIQUE(student_id, assessment_id)');
    });

    it('inclut des index pour les performances des bulletins et délibérations', () => {
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE INDEX IF NOT EXISTS idx_students_class');
      expect(SQLITE_SCHEMA_DDL).toContain('CREATE INDEX IF NOT EXISTS idx_grades_student');
    });
  });
});
