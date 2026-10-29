import { describe, it, expect, beforeEach } from 'vitest';
import {
  IndexedDBStorageService,
  StorageDriver,
  CONFIG_STORAGE_KEY,
} from '../services/storage/IndexedDBStorageService';
import { SchoolConfig } from '../domain/types';

/**
 * Driver simulant le stockage persistant IndexedDB sous forme de table persistante.
 * Permet de simuler le comportement du navigateur entre deux rafraîchissements de page (F5).
 */
class PersistentMockDriver implements StorageDriver {
  public storageTable = new Map<string, SchoolConfig>();
  public isPersistent = true;
  public name = 'IndexedDB Mock Driver';
  public shouldFailOnSet = false;
  public shouldFailOnDelete = false;

  async get(key: string): Promise<SchoolConfig | null> {
    const item = this.storageTable.get(key);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async set(key: string, value: SchoolConfig): Promise<void> {
    if (this.shouldFailOnSet) {
      throw new Error('QuotaExceededError: Erreur d’écriture simulée dans IndexedDB.');
    }
    this.storageTable.set(key, JSON.parse(JSON.stringify(value)));
  }

  async delete(key: string): Promise<void> {
    if (this.shouldFailOnDelete) {
      throw new Error('DatabaseClosedError: Erreur de suppression simulée.');
    }
    this.storageTable.delete(key);
  }
}

describe('IndexedDBStorageService — Tests de Persistance Web & Cycle de Vie', () => {
  let mockDriver: PersistentMockDriver;

  beforeEach(() => {
    mockDriver = new PersistentMockDriver();
  });

  const sampleValidConfig: SchoolConfig = {
    name: 'Lycée Victor Augagneur',
    schoolType: 'secondary',
    academicYear: '2024-2025',
    city: 'Pointe-Noire',
    country: 'Congo',
    currency: 'FCFA',
    principalName: 'M. le Proviseur Jean-Paul',
    isConfigured: true,
  };

  it('1. Enregistre la configuration avec assainissement et date de mise à jour', async () => {
    const service = new IndexedDBStorageService(mockDriver);

    await service.saveSchoolConfig(sampleValidConfig);

    const stored = await service.getSchoolConfig();
    expect(stored).not.toBeNull();
    expect(stored?.name).toBe('Lycée Victor Augagneur');
    expect(stored?.academicYear).toBe('2024-2025');
    expect(stored?.isConfigured).toBe(true);
    expect(stored?.updatedAt).toBeDefined();
  });

  it('2. Conserve les données après rechargement / recréation de l’instance du service (Simulation F5)', async () => {
    // Session 1 : l'utilisateur saisit et enregistre
    const serviceSession1 = new IndexedDBStorageService(mockDriver);
    await serviceSession1.saveSchoolConfig(sampleValidConfig);

    // Simulation F5 : serviceSession1 est détruit, une nouvelle instance est créée
    const serviceSession2_AfterF5 = new IndexedDBStorageService(mockDriver);

    const reloadedConfig = await serviceSession2_AfterF5.getSchoolConfig();
    expect(reloadedConfig).not.toBeNull();
    expect(reloadedConfig?.name).toBe('Lycée Victor Augagneur');
    expect(reloadedConfig?.schoolType).toBe('secondary');
    expect(reloadedConfig?.academicYear).toBe('2024-2025');
    expect(reloadedConfig?.city).toBe('Pointe-Noire');
    expect(reloadedConfig?.currency).toBe('FCFA');
    expect(reloadedConfig?.principalName).toBe('M. le Proviseur Jean-Paul');
    expect(reloadedConfig?.isConfigured).toBe(true);

    const metrics = await serviceSession2_AfterF5.getDashboardMetrics();
    expect(metrics.isConfigured).toBe(true);
    expect(metrics.studentsCount).toBe(0);
  });

  it('3. Retourne une copie défensive pour éviter toute mutation involontaire', async () => {
    const service = new IndexedDBStorageService(mockDriver);
    await service.saveSchoolConfig(sampleValidConfig);

    const configCopy = await service.getSchoolConfig();
    if (configCopy) {
      configCopy.name = 'Nom Altéré en Mémoire';
    }

    const verifyConfig = await service.getSchoolConfig();
    expect(verifyConfig?.name).toBe('Lycée Victor Augagneur');
  });

  it('4. Valide strictement les données et rejette les configurations invalides', async () => {
    const service = new IndexedDBStorageService(mockDriver);

    // Nom vide
    await expect(
      service.saveSchoolConfig({ ...sampleValidConfig, name: '   ' })
    ).rejects.toThrow("Le nom de l'établissement est obligatoire.");

    // Nom trop court
    await expect(
      service.saveSchoolConfig({ ...sampleValidConfig, name: 'AB' })
    ).rejects.toThrow("Le nom de l'établissement doit comporter au moins 3 caractères.");

    // Année scolaire vide
    await expect(
      service.saveSchoolConfig({ ...sampleValidConfig, academicYear: '' })
    ).rejects.toThrow("L'année scolaire est obligatoire.");

    // Année scolaire non consécutive (ex: 2024-2022)
    await expect(
      service.saveSchoolConfig({ ...sampleValidConfig, academicYear: '2024-2022' })
    ).rejects.toThrow("L'année scolaire doit couvrir deux années consécutives (ex: 2024-2025).");

    // Format d'année scolaire invalide
    await expect(
      service.saveSchoolConfig({ ...sampleValidConfig, academicYear: '2024' })
    ).rejects.toThrow("Format d'année scolaire invalide.");

    // Type d'école invalide
    await expect(
      // @ts-expect-error test de type invalide
      service.saveSchoolConfig({ ...sampleValidConfig, schoolType: 'universite' })
    ).rejects.toThrow("Type d'établissement scolaire invalide");
  });

  it('5. Lève une erreur explicite si le stockage échoue (garantit que l’UI n’affiche pas de faux succès)', async () => {
    mockDriver.shouldFailOnSet = true;
    const service = new IndexedDBStorageService(mockDriver);

    await expect(service.saveSchoolConfig(sampleValidConfig)).rejects.toThrow(
      'QuotaExceededError'
    );

    // Aucune donnée n'a été corrompue
    expect(mockDriver.storageTable.has(CONFIG_STORAGE_KEY)).toBe(false);
  });

  it('6. Réinitialise la configuration avec suppression effective du stockage', async () => {
    const service = new IndexedDBStorageService(mockDriver);
    await service.saveSchoolConfig(sampleValidConfig);
    expect(await service.getSchoolConfig()).not.toBeNull();

    // Réinitialisation
    await service.resetSchoolConfig();
    expect(await service.getSchoolConfig()).toBeNull();

    // Vérification après reconnexion (simulation F5 après réinitialisation)
    const serviceAfterReset = new IndexedDBStorageService(mockDriver);
    expect(await serviceAfterReset.getSchoolConfig()).toBeNull();

    const metrics = await serviceAfterReset.getDashboardMetrics();
    expect(metrics.isConfigured).toBe(false);
  });

  it('7. Vérifie l’état de santé du service de stockage', async () => {
    const service = new IndexedDBStorageService(mockDriver);
    const health = await service.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.backendType).toBe('IndexedDB Mock Driver');
  });
});

/**
 * Mock complet de l'interface W3C Storage pour tester la persistance localStorage
 * dans l'environnement de test Node/Vitest.
 */
class MockLocalStorage implements Storage {
  public store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('IndexedDBStorageService — Repli Résilient localStorage (Cas Iframe Preview & Internal error)', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
  });

  const sampleConfig: SchoolConfig = {
    name: 'Collège Jean-Félix Tchicaya',
    schoolType: 'middle',
    academicYear: '2024-2025',
    city: 'Pointe-Noire',
    country: 'Congo',
    currency: 'FCFA',
    principalName: 'M. le Principal',
    isConfigured: true,
  };

  it('1. Bascule automatiquement sur localStorage lorsque IndexedDB n’est pas disponible ou restreint', async () => {
    // Sans driver custom, avec mockStorage injecté
    const service = new IndexedDBStorageService(undefined, mockStorage);

    await service.saveSchoolConfig(sampleConfig);

    const stored = await service.getSchoolConfig();
    expect(stored).not.toBeNull();
    expect(stored?.name).toBe('Collège Jean-Félix Tchicaya');
    expect(stored?.academicYear).toBe('2024-2025');
    expect(stored?.isConfigured).toBe(true);

    // Vérifie que les données sont bien dans le stockage physique mockStorage
    expect(mockStorage.store.size).toBe(1);

    const diagnostics = service.getDiagnostics();
    expect(diagnostics.activeEngine).toBe('localStorage');
    expect(diagnostics.isPersistent).toBe(true);
  });

  it('2. Garantit la persistance des données après rechargement F5 via le repli localStorage', async () => {
    // Session 1 : sauvegarde initiale dans l'environnement avec restriction
    const session1 = new IndexedDBStorageService(undefined, mockStorage);
    await session1.saveSchoolConfig(sampleConfig);

    // Session 2 : Simulation F5 — nouvelle instance créée avec le même localStorage du navigateur
    const session2_AfterF5 = new IndexedDBStorageService(undefined, mockStorage);

    const reloaded = await session2_AfterF5.getSchoolConfig();
    expect(reloaded).not.toBeNull();
    expect(reloaded?.name).toBe('Collège Jean-Félix Tchicaya');
    expect(reloaded?.city).toBe('Pointe-Noire');
    expect(reloaded?.academicYear).toBe('2024-2025');
    expect(reloaded?.isConfigured).toBe(true);

    const metrics = await session2_AfterF5.getDashboardMetrics();
    expect(metrics.isConfigured).toBe(true);
  });

  it('3. Reflète fidèlement l’état de santé et le moteur actif via checkHealth()', async () => {
    const service = new IndexedDBStorageService(undefined, mockStorage);
    await service.saveSchoolConfig(sampleConfig);

    const health = await service.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.backendType).toContain('localStorage');
    expect(health.message).toContain('localStorage');
    expect(health.diagnostics?.isPersistent).toBe(true);
  });

  it('4. Réinitialise correctement la configuration sur le stockage de repli', async () => {
    const service = new IndexedDBStorageService(undefined, mockStorage);
    await service.saveSchoolConfig(sampleConfig);
    expect(await service.getSchoolConfig()).not.toBeNull();

    await service.resetSchoolConfig();
    expect(await service.getSchoolConfig()).toBeNull();
    expect(mockStorage.store.size).toBe(0);

    // Vérification après F5 simulé
    const serviceAfterF5 = new IndexedDBStorageService(undefined, mockStorage);
    expect(await serviceAfterF5.getSchoolConfig()).toBeNull();
  });
});

