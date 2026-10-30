/**
 * New Version School Tools — Implémentation du Dépôt Configuration Web (IndexedDBSchoolConfigRepository)
 */

import {
  SchoolConfig,
  AcademicYear,
  Period,
  CalculationConfig,
  DashboardMetrics,
} from '../../../domain/types';
import { ISchoolConfigRepository } from '../../../domain/repositories';
import { WebStorageAdapter } from '../db/WebStorageAdapter';
import { STORES } from '../db/WebDatabaseSchema';
import { validateSchoolConfig } from '../configValidation';
import { CONFIG_STORAGE_KEY } from '../IndexedDBStorageService';

export const CALC_CONFIG_STORAGE_KEY = 'calculation_config';

export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
  roundingRule: 'half-up',
  decimalPlaces: 2,
  passThreshold: 10.0,
  normalizeScoresToScale: true,
  mentionThresholds: {
    veryGood: 16.0,
    good: 14.0,
    fairlyGood: 12.0,
    pass: 10.0,
  },
};

export class IndexedDBSchoolConfigRepository implements ISchoolConfigRepository {
  constructor(private adapter: WebStorageAdapter) {}

  async getConfig(): Promise<SchoolConfig | null> {
    const record = await this.adapter.get<{ key: string; data: SchoolConfig }>(
      STORES.CONFIG,
      CONFIG_STORAGE_KEY
    );
    if (!record || !record.data) {
      return null;
    }
    return { ...record.data };
  }

  async saveConfig(config: SchoolConfig): Promise<void> {
    validateSchoolConfig(config);

    const sanitized: SchoolConfig = {
      name: config.name.trim(),
      schoolType: config.schoolType,
      academicYear: config.academicYear.trim(),
      city: (config.city || 'Pointe-Noire').trim(),
      country: (config.country || 'Congo').trim(),
      currency: (config.currency || 'FCFA').trim(),
      principalName: config.principalName ? config.principalName.trim() : undefined,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    };

    await this.adapter.put(STORES.CONFIG, {
      key: CONFIG_STORAGE_KEY,
      data: sanitized,
      updatedAt: sanitized.updatedAt,
    });
  }

  async resetConfig(): Promise<void> {
    await this.adapter.delete(STORES.CONFIG, CONFIG_STORAGE_KEY);
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    return await this.adapter.getAll<AcademicYear>(STORES.ACADEMIC_YEARS);
  }

  async getActiveAcademicYear(): Promise<AcademicYear | null> {
    const years = await this.getAcademicYears();
    return years.find((y) => y.isCurrent) || years[0] || null;
  }

  async saveAcademicYear(year: AcademicYear): Promise<void> {
    if (!year.id) throw new Error("L'identifiant de l'année scolaire est obligatoire.");
    if (!year.label) throw new Error("Le libellé de l'année scolaire est obligatoire.");

    await this.adapter.put(STORES.ACADEMIC_YEARS, year);
  }

  async getPeriods(academicYearId?: string): Promise<Period[]> {
    let list = await this.adapter.getAll<Period>(STORES.PERIODS);
    if (academicYearId) {
      list = list.filter((p) => p.academicYearId === academicYearId);
    }
    return list;
  }

  async savePeriod(period: Period): Promise<void> {
    if (!period.id) throw new Error("L'identifiant de la période est obligatoire.");
    if (!period.name) throw new Error("Le nom de la période est obligatoire.");
    await this.adapter.put(STORES.PERIODS, period);
  }

  async getCalculationConfig(): Promise<CalculationConfig> {
    const record = await this.adapter.get<{ key: string; value: CalculationConfig }>(
      STORES.APP_METADATA,
      CALC_CONFIG_STORAGE_KEY
    );
    return record && record.value ? record.value : DEFAULT_CALCULATION_CONFIG;
  }

  async saveCalculationConfig(config: CalculationConfig): Promise<void> {
    await this.adapter.put(STORES.APP_METADATA, {
      key: CALC_CONFIG_STORAGE_KEY,
      value: config,
      updatedAt: new Date().toISOString(),
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const config = await this.getConfig();

    const [students, classes, subjects, assessments, grades] = await Promise.all([
      this.adapter.getAll(STORES.STUDENTS),
      this.adapter.getAll(STORES.CLASSES),
      this.adapter.getAll(STORES.SUBJECTS),
      this.adapter.getAll(STORES.ASSESSMENTS),
      this.adapter.getAll(STORES.GRADES),
    ]);

    const activeGrades = (grades as Array<{ score?: number | null }>).filter(
      (g) => g.score !== null && g.score !== undefined
    );

    return {
      studentsCount: students.length,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      assessmentsCount: assessments.length,
      gradesRecordedCount: activeGrades.length,
      isConfigured: Boolean(config && config.isConfigured),
    };
  }
}
