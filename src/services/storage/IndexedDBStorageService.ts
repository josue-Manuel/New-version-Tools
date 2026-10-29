/**
 * New Version School Tools — Service de Stockage Persistant Multi-Paliers (Web)
 *
 * Implémentation du contrat IStorageService dotée d'une architecture multi-paliers résiliente :
 * - Palier 1 (Prioritaire) : IndexedDB natif via la bibliothèque promise-based 'idb'.
 * - Palier 2 (Secours persistant) : localStorage Web Storage sécurisé avec sérialisation JSON
 *   et validation de schéma. Activé automatiquement si IndexedDB subit une restriction de bac à sable
 *   (iframe cross-origin dans le preview Google AI Studio, blocage de stockage tiers, navigation privée).
 * - Palier 3 (Secours session) : Mémoire vive Map<string, SchoolConfig> si aucun stockage persistant n'est autorisé.
 *
 * GARANTIES :
 * 1. Persistance F5 : même si l'iframe Google AI Studio bloque IndexedDB ("Internal error."),
 *    les données saisies sont enregistrées dans localStorage et restent conservées après rechargement F5.
 * 2. Diagnostic transparent : enregistre les métadonnées techniques de l'éventuelle restriction IndexedDB
 *    (étape ayant échoué, nom de l'exception, message natif, cause probable).
 * 3. Découplage strict : aucune dépendance React. Interface prête pour le pont SQLite natif sous Tauri 2.
 */

import { openDB, IDBPDatabase } from 'idb';
import { DashboardMetrics, SchoolConfig } from '../../domain/types';
import { IStorageService, StorageDiagnostics, StorageIncident } from './IStorageService';
import { validateSchoolConfig } from './configValidation';

export const WEB_DB_NAME = 'nv_school_tools_web_db';
export const WEB_DB_VERSION = 1;
export const STORE_NAME = 'school_configuration';
export const CONFIG_STORAGE_KEY = 'active_school_config';
export const LOCAL_STORAGE_KEY = 'nv_school_tools_persisted_config';

export interface StorageDriver {
  get(key: string): Promise<SchoolConfig | null>;
  set(key: string, value: SchoolConfig): Promise<void>;
  delete(key: string): Promise<void>;
  isPersistent: boolean;
  name: string;
}

export class IndexedDBStorageService implements IStorageService {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private customDriver: StorageDriver | null = null;
  private memoryFallback: Map<string, SchoolConfig> = new Map();
  private isIndexedDBDisabled = false;
  private activeEngine: 'IndexedDB' | 'localStorage' | 'Memory' | string = 'IndexedDB';
  private lastIncident: StorageIncident | null = null;
  private customLocalStorage: Storage | null = null;

  constructor(customDriver?: StorageDriver, customLocalStorage?: Storage) {
    if (customDriver) {
      this.customDriver = customDriver;
      this.activeEngine = customDriver.name;
    }
    if (customLocalStorage) {
      this.customLocalStorage = customLocalStorage;
    }
  }

  /**
   * Vérifie si l'API IndexedDB est syntaxiquement présente dans l'environnement.
   */
  private isIndexedDBAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      window.indexedDB !== null
    );
  }

  /**
   * Récupère l'objet localStorage effectif (réel ou injecté pour les tests).
   */
  private getEffectiveLocalStorage(): Storage | null {
    if (this.customLocalStorage) {
      return this.customLocalStorage;
    }
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const testKey = '__nv_storage_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Vérifie si localStorage est disponible et fonctionnel dans cet environnement.
   */
  private isLocalStorageAvailable(): boolean {
    return this.getEffectiveLocalStorage() !== null;
  }

  /**
   * Enregistre un incident technique survenu sur le moteur IndexedDB pour le diagnostic.
   */
  private recordIndexedDBIncident(
    step: StorageIncident['step'],
    err: unknown
  ): void {
    const errorName =
      err instanceof DOMException
        ? `DOMException [${err.name}]`
        : err instanceof Error
        ? err.name
        : 'UnknownError';
    const errorMessage = err instanceof Error ? err.message : String(err);

    let probableCause = "Erreur inattendue lors de l'accès à IndexedDB.";
    if (
      errorMessage.includes('Internal error') ||
      errorName.includes('UnknownError') ||
      errorName.includes('SecurityError') ||
      errorMessage.includes('denied')
    ) {
      probableCause =
        "Restriction d'accès au stockage dans l'environnement d'iframe de prévisualisation Google AI Studio (bac à sable cross-origin / Storage Partitioning).";
    } else if (errorName.includes('QuotaExceeded')) {
      probableCause = 'Quota de stockage du navigateur dépassé.';
    }

    this.lastIncident = {
      step,
      errorName,
      errorMessage,
      timestamp: new Date().toISOString(),
      probableCause,
    };

    console.warn(
      `[StorageService] Incident IndexedDB intercepté à l'étape '${step}' (${errorName}: "${errorMessage}").\n` +
      `Cause identifiée : ${probableCause}\n` +
      `Basculement immédiat vers la persistance de secours locale (localStorage).`
    );
  }

  /**
   * Ouvre ou récupère la connexion existante à la base IndexedDB.
   * Réinitialise dbPromise en cas d'erreur pour éviter la mise en cache d'une promesse rejetée.
   */
  private async getDB(): Promise<IDBPDatabase> {
    if (this.isIndexedDBDisabled) {
      throw new Error(
        `IndexedDB désactivé pour cette session suite à l'incident : ${this.lastIncident?.errorMessage || 'Erreur interne'}`
      );
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (!this.isIndexedDBAvailable()) {
      throw new Error(
        "L'API IndexedDB n'est pas disponible dans cet environnement d'exécution."
      );
    }

    try {
      this.dbPromise = openDB(WEB_DB_NAME, WEB_DB_VERSION, {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
          }
        },
        blocked() {
          console.warn('[IndexedDB] Ouverture de la base bloquée par une autre connexion ouverte.');
        },
        blocking() {
          console.warn('[IndexedDB] Fermeture de la base pour mise à niveau requise.');
        },
        terminated() {
          console.error('[IndexedDB] Connexion à la base de données terminée de manière anormale.');
        },
      });

      const db = await this.dbPromise;
      return db;
    } catch (err: unknown) {
      this.dbPromise = null;
      this.isIndexedDBDisabled = true;
      this.recordIndexedDBIncident('openDB', err);
      throw err;
    }
  }

  /**
   * Sauvegarde la configuration dans localStorage de manière synchrone et sécurisée.
   */
  private saveToLocalStorage(config: SchoolConfig): boolean {
    const storage = this.getEffectiveLocalStorage();
    if (!storage) return false;

    try {
      const payload = {
        key: CONFIG_STORAGE_KEY,
        data: config,
        savedAt: new Date().toISOString(),
        engine: 'localStorage-fallback',
      };
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error('[StorageService] Erreur d’écriture dans localStorage:', err);
      return false;
    }
  }

  /**
   * Récupère la configuration stockée dans localStorage avec validation d'intégrité.
   */
  private getFromLocalStorage(): SchoolConfig | null {
    const storage = this.getEffectiveLocalStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && typeof parsed.data === 'object' && parsed.data.name) {
        return parsed.data as SchoolConfig;
      }
      return null;
    } catch (err) {
      console.error('[StorageService] Erreur de lecture depuis localStorage:', err);
      return null;
    }
  }

  /**
   * Supprime la configuration de localStorage.
   */
  private removeFromLocalStorage(): void {
    const storage = this.getEffectiveLocalStorage();
    if (storage) {
      try {
        storage.removeItem(LOCAL_STORAGE_KEY);
      } catch (err) {
        console.error('[StorageService] Erreur de suppression localStorage:', err);
      }
    }
  }

  /**
   * Récupère la configuration actuelle de l'établissement.
   * Retourne null si aucune configuration n'a été enregistrée.
   */
  async getSchoolConfig(): Promise<SchoolConfig | null> {
    // 1. Pilote personnalisé (ex: tests unitaires avec MockDriver)
    if (this.customDriver) {
      const data = await this.customDriver.get(CONFIG_STORAGE_KEY);
      return data ? { ...data } : null;
    }

    // 2. Tentative via IndexedDB si disponible et non désactivé
    if (this.isIndexedDBAvailable() && !this.isIndexedDBDisabled) {
      try {
        const db = await this.getDB();
        const record = await db.get(STORE_NAME, CONFIG_STORAGE_KEY);
        if (record && record.data) {
          this.activeEngine = 'IndexedDB';
          return { ...(record.data as SchoolConfig) };
        }
      } catch (err: unknown) {
        this.recordIndexedDBIncident('get', err);
        this.isIndexedDBDisabled = true;
      }
    }

    // 3. Repli persistant : lecture depuis localStorage (F5 survie garantie)
    if (this.isLocalStorageAvailable()) {
      const fromLS = this.getFromLocalStorage();
      if (fromLS) {
        this.activeEngine = 'localStorage';
        return { ...fromLS };
      }
    }

    // 4. Repli mémoire volatile (si présent dans le cache)
    const fallback = this.memoryFallback.get(CONFIG_STORAGE_KEY);
    if (fallback) {
      this.activeEngine = 'Memory';
      return { ...fallback };
    }

    return null;
  }

  /**
   * Valide et enregistre la configuration de l'établissement de façon persistante.
   * En cas de restriction IndexedDB ("Internal error." dans l'iframe), bascule
   * immédiatement et automatiquement vers localStorage pour garantir la persistance après F5.
   */
  async saveSchoolConfig(config: SchoolConfig): Promise<void> {
    // Validation stricte préalable du modèle scolaire
    validateSchoolConfig(config);

    const sanitizedConfig: SchoolConfig = {
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

    // 1. Pilote personnalisé (mode test unitaire / mock)
    if (this.customDriver) {
      await this.customDriver.set(CONFIG_STORAGE_KEY, sanitizedConfig);
      return;
    }

    let indexedDBSaved = false;

    // 2. Tentative IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBDisabled) {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.store.put({
          key: CONFIG_STORAGE_KEY,
          data: sanitizedConfig,
          updatedAt: sanitizedConfig.updatedAt,
        });
        await tx.done;
        indexedDBSaved = true;
        this.activeEngine = 'IndexedDB';
      } catch (err: unknown) {
        this.recordIndexedDBIncident('put', err);
        this.isIndexedDBDisabled = true;
      }
    }

    // 3. Sauvegarde dans localStorage (repli persistant automatique ou miroir de redondance)
    let localStorageSaved = false;
    if (this.isLocalStorageAvailable()) {
      localStorageSaved = this.saveToLocalStorage(sanitizedConfig);
      if (localStorageSaved && !indexedDBSaved) {
        this.activeEngine = 'localStorage';
        console.info(
          '[StorageService] Configuration enregistrée avec succès dans le stockage persistant localStorage (survit aux rechargements F5).'
        );
      }
    }

    // 4. Sauvegarde dans le cache mémoire pour cohérence
    this.memoryFallback.set(CONFIG_STORAGE_KEY, { ...sanitizedConfig });

    // Si ni IndexedDB ni localStorage n'ont pu persister les données sur disque
    if (!indexedDBSaved && !localStorageSaved) {
      this.activeEngine = 'Memory';
      console.warn(
        '[StorageService] Attention : aucun stockage persistant (IndexedDB ou localStorage) n’a pu enregistrer les données. Mode mémoire session actif.'
      );
    }
  }

  /**
   * Réinitialise la configuration de l'établissement sur tous les moteurs de stockage.
   */
  async resetSchoolConfig(): Promise<void> {
    // 1. Pilote personnalisé
    if (this.customDriver) {
      await this.customDriver.delete(CONFIG_STORAGE_KEY);
      return;
    }

    // 2. Nettoyage IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBDisabled) {
      try {
        const db = await this.getDB();
        await db.delete(STORE_NAME, CONFIG_STORAGE_KEY);
      } catch (err: unknown) {
        this.recordIndexedDBIncident('delete', err);
      }
    }

    // 3. Nettoyage localStorage
    this.removeFromLocalStorage();

    // 4. Nettoyage cache mémoire
    this.memoryFallback.delete(CONFIG_STORAGE_KEY);
  }

  /**
   * Retourne les indicateurs de l'établissement pour le tableau de bord.
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const config = await this.getSchoolConfig();
    return {
      studentsCount: 0,
      classesCount: 0,
      subjectsCount: 0,
      assessmentsCount: 0,
      gradesRecordedCount: 0,
      isConfigured: Boolean(config && config.isConfigured),
    };
  }

  /**
   * Retourne le diagnostic complet de l'état du stockage.
   */
  getDiagnostics(): StorageDiagnostics {
    return {
      primaryEngine: 'IndexedDB',
      activeEngine: this.activeEngine,
      isPersistent: this.activeEngine !== 'Memory',
      indexedDBAvailable: this.isIndexedDBAvailable() && !this.isIndexedDBDisabled,
      localStorageAvailable: this.isLocalStorageAvailable(),
      isIndexedDBBlocked: this.isIndexedDBDisabled,
      lastIncident: this.lastIncident,
    };
  }

  /**
   * Vérifie la disponibilité et l'état opérationnel du stockage.
   */
  async checkHealth(): Promise<{
    status: 'ok' | 'error' | 'warning';
    message: string;
    backendType: string;
    diagnostics?: StorageDiagnostics;
  }> {
    const diagnostics = this.getDiagnostics();

    if (this.customDriver) {
      return {
        status: 'ok',
        message: 'Pilote de stockage personnalisé opérationnel.',
        backendType: this.customDriver.name,
        diagnostics,
      };
    }

    // Si IndexedDB est actif et opérationnel
    if (this.isIndexedDBAvailable() && !this.isIndexedDBDisabled) {
      try {
        const db = await this.getDB();
        if (db) {
          return {
            status: 'ok',
            message: 'Base de données locale IndexedDB connectée et opérationnelle.',
            backendType: 'IndexedDB (Persistance Web Locale)',
            diagnostics,
          };
        }
      } catch {
        // En cas d'échec lors du health check, on bascule vers l'état suivant
      }
    }

    // Si localStorage a pris le relais (cas de l'iframe de prévisualisation Google AI Studio)
    if (this.isLocalStorageAvailable()) {
      const incidentMsg = this.lastIncident
        ? ` (${this.lastIncident.errorName} : ${this.lastIncident.errorMessage})`
        : '';
      return {
        status: 'ok',
        message:
          `Persistance locale active via localStorage (Repli automatique suite à restriction iframe IndexedDB${incidentMsg}). Vos données sont conservées après actualisation (F5).`,
        backendType: 'localStorage (Persistant - Repli iframe)',
        diagnostics: this.getDiagnostics(),
      };
    }

    // Si seul le cache mémoire fonctionne
    return {
      status: 'warning',
      message:
        'Mode de repli en mémoire vive actif (IndexedDB et localStorage inaccessibles). Les données seront réinitialisées au rechargement de page.',
      backendType: 'In-Memory (Session volatile)',
      diagnostics: this.getDiagnostics(),
    };
  }
}

// Singleton par défaut pour la version web
export const defaultIndexedDBStorageService = new IndexedDBStorageService();
// Alias sémantique
export const PersistentWebStorageService = IndexedDBStorageService;
