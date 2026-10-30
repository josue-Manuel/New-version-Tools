/**
 * New Version School Tools — Adaptateur de Stockage Résilient Web (WebStorageAdapter)
 *
 * Moteur physique multi-paliers pour la version web :
 * - Palier 1 : IndexedDB natif avec migrations de version (v1 -> v2) et index de recherche.
 * - Palier 2 : Repli persistant localStorage pour chaque magasin d'objets (clé par clé ou partition).
 *              Permet d'exécuter l'application de façon fluide dans les environnements d'iframe
 *              restreints (Google AI Studio) sans provoquer de "DOMException: Internal error.".
 * - Palier 3 : Cache en mémoire vive Map<string, any> pour la session.
 */

import { openDB, IDBPDatabase } from 'idb';
import { DB_NAME, CURRENT_DB_VERSION, STORES, StoreName } from './WebDatabaseSchema';

export interface WebAdapterIncident {
  store: string;
  operation: 'open' | 'get' | 'getAll' | 'put' | 'delete' | 'clear' | 'count';
  errorName: string;
  errorMessage: string;
  timestamp: string;
  probableCause: string;
}

export class WebStorageAdapter {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private isIndexedDBBlocked = false;
  private memoryStores = new Map<string, Map<string, any>>();
  private lastIncident: WebAdapterIncident | null = null;
  private customLocalStorage: Storage | null = null;

  constructor(customLocalStorage?: Storage) {
    if (customLocalStorage) {
      this.customLocalStorage = customLocalStorage;
    }
  }

  private isIndexedDBAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      window.indexedDB !== null
    );
  }

  private getEffectiveLocalStorage(): Storage | null {
    if (this.customLocalStorage) {
      return this.customLocalStorage;
    }
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const testKey = '__nv_st_probe__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      } catch {
        return null;
      }
    }
    return null;
  }

  private recordIncident(
    store: string,
    operation: WebAdapterIncident['operation'],
    err: unknown
  ): void {
    const errorName =
      err instanceof DOMException
        ? `DOMException [${err.name}]`
        : err instanceof Error
        ? err.name
        : 'UnknownError';
    const errorMessage = err instanceof Error ? err.message : String(err);

    let probableCause = "Erreur inattendue lors de l'accès au stockage.";
    if (
      errorMessage.includes('Internal error') ||
      errorName.includes('UnknownError') ||
      errorName.includes('SecurityError') ||
      errorMessage.includes('denied')
    ) {
      probableCause =
        "Restriction d'accès IndexedDB dans l'iframe de prévisualisation (bac à sable cross-origin).";
    }

    this.lastIncident = {
      store,
      operation,
      errorName,
      errorMessage,
      timestamp: new Date().toISOString(),
      probableCause,
    };
  }

  public async getDB(): Promise<IDBPDatabase> {
    if (this.isIndexedDBBlocked) {
      throw new Error(`IndexedDB bloqué suite à un incident technique.`);
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (!this.isIndexedDBAvailable()) {
      throw new Error("L'API IndexedDB n'est pas disponible.");
    }

    try {
      this.dbPromise = openDB(DB_NAME, CURRENT_DB_VERSION, {
        upgrade(db, oldVersion) {
          // Version 1 : Configuration initiale
          if (oldVersion < 1) {
            if (!db.objectStoreNames.contains(STORES.CONFIG)) {
              db.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
            }
          }

          // Version 2 : Architecture Phase 2 (Dossiers, Classes, Notes, Paiements)
          if (oldVersion < 2) {
            // Configuration & Calendrier
            if (!db.objectStoreNames.contains(STORES.ACADEMIC_YEARS)) {
              const yearStore = db.createObjectStore(STORES.ACADEMIC_YEARS, { keyPath: 'id' });
              yearStore.createIndex('by-active', 'isCurrent');
            }
            if (!db.objectStoreNames.contains(STORES.PERIODS)) {
              const periodStore = db.createObjectStore(STORES.PERIODS, { keyPath: 'id' });
              periodStore.createIndex('by-year', 'academicYearId');
            }
            if (!db.objectStoreNames.contains(STORES.APP_METADATA)) {
              db.createObjectStore(STORES.APP_METADATA, { keyPath: 'key' });
            }

            // Structure académique
            if (!db.objectStoreNames.contains(STORES.SCHOOL_LEVELS)) {
              const levelStore = db.createObjectStore(STORES.SCHOOL_LEVELS, { keyPath: 'id' });
              levelStore.createIndex('by-type', 'levelType');
            }
            if (!db.objectStoreNames.contains(STORES.CLASSES)) {
              const classStore = db.createObjectStore(STORES.CLASSES, { keyPath: 'id' });
              classStore.createIndex('by-year', 'academicYearId');
              classStore.createIndex('by-level', 'schoolLevelId');
            }
            if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
              const subjectStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
              subjectStore.createIndex('by-level', 'schoolLevelId');
            }
            if (!db.objectStoreNames.contains(STORES.CLASS_SUBJECTS)) {
              const csStore = db.createObjectStore(STORES.CLASS_SUBJECTS, { keyPath: 'id' });
              csStore.createIndex('by-class', 'schoolClassId');
              csStore.createIndex('by-subject', 'subjectId');
            }

            // Élèves, Évaluations, Notes
            if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
              const studentStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
              studentStore.createIndex('by-class', 'schoolClassId');
              studentStore.createIndex('by-number', 'studentNumber', { unique: true });
              studentStore.createIndex('by-name', 'lastName');
            }
            if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
              const assessStore = db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'id' });
              assessStore.createIndex('by-class', 'schoolClassId');
              assessStore.createIndex('by-period', 'periodId');
              assessStore.createIndex('by-subject', 'subjectId');
            }
            if (!db.objectStoreNames.contains(STORES.GRADES)) {
              const gradeStore = db.createObjectStore(STORES.GRADES, { keyPath: 'id' });
              gradeStore.createIndex('by-assessment', 'assessmentId');
              gradeStore.createIndex('by-student', 'studentId');
            }

            // Paiements & Frais de scolarité
            if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
              const paymentStore = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'id' });
              paymentStore.createIndex('by-student', 'studentId');
              paymentStore.createIndex('by-receipt', 'receiptNumber', { unique: true });
              paymentStore.createIndex('by-class', 'schoolClassId');
            }
          }
        },
      });

      const db = await this.dbPromise;
      return db;
    } catch (err) {
      this.dbPromise = null;
      this.isIndexedDBBlocked = true;
      this.recordIncident(STORES.CONFIG, 'open', err);
      throw err;
    }
  }

  // --- Helpers LocalStorage de repli ---

  private getLSStoreKey(store: string): string {
    return `nv_st_store_${store}`;
  }

  private readLSStore<T>(store: string): Map<string, T> {
    const ls = this.getEffectiveLocalStorage();
    if (!ls) return new Map();
    try {
      const raw = ls.getItem(this.getLSStoreKey(store));
      if (!raw) return new Map();
      const obj = JSON.parse(raw);
      return new Map(Object.entries(obj));
    } catch {
      return new Map();
    }
  }

  private writeLSStore<T>(store: string, map: Map<string, T>): void {
    const ls = this.getEffectiveLocalStorage();
    if (!ls) return;
    try {
      const obj = Object.fromEntries(map.entries());
      ls.setItem(this.getLSStoreKey(store), JSON.stringify(obj));
    } catch (err) {
      console.warn(`[WebStorageAdapter] Erreur d'écriture localStorage pour '${store}':`, err);
    }
  }

  // --- Helpers Cache Mémoire ---

  private getMemoryStore<T>(store: string): Map<string, T> {
    if (!this.memoryStores.has(store)) {
      this.memoryStores.set(store, new Map());
    }
    return this.memoryStores.get(store)!;
  }

  // --- Opérations Publiques Découplées ---

  public async get<T>(store: StoreName, id: string): Promise<T | null> {
    // 1. IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        const res = await db.get(store as any, id);
        if (res !== undefined) return res as T;
      } catch (err) {
        this.recordIncident(store, 'get', err);
        this.isIndexedDBBlocked = true;
      }
    }

    // 2. Repli localStorage
    const lsMap = this.readLSStore<T>(store);
    if (lsMap.has(id)) {
      return lsMap.get(id)!;
    }

    // 3. Repli Mémoire
    const memMap = this.getMemoryStore<T>(store);
    return memMap.get(id) ?? null;
  }

  public async getAll<T>(store: StoreName): Promise<T[]> {
    // 1. IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        const res = await db.getAll(store as any);
        if (res && res.length > 0) return res as T[];
      } catch (err) {
        this.recordIncident(store, 'getAll', err);
        this.isIndexedDBBlocked = true;
      }
    }

    // 2. Repli localStorage
    const lsMap = this.readLSStore<T>(store);
    if (lsMap.size > 0) {
      return Array.from(lsMap.values());
    }

    // 3. Repli Mémoire
    const memMap = this.getMemoryStore<T>(store);
    return Array.from(memMap.values());
  }

  public async put<T extends { id?: string; key?: string }>(
    store: StoreName,
    item: T
  ): Promise<void> {
    const key = (item.id || item.key) as string;
    if (!key) {
      throw new Error(`Impossible d'enregistrer dans '${store}': clé primaire absente.`);
    }

    let idbSucceeded = false;

    // 1. IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        await db.put(store as any, item);
        idbSucceeded = true;
      } catch (err) {
        this.recordIncident(store, 'put', err);
        this.isIndexedDBBlocked = true;
      }
    }

    // 2. localStorage (sauvegarde systématique de sécurité pour survie F5 en iframe)
    const lsMap = this.readLSStore<T>(store);
    lsMap.set(key, item);
    this.writeLSStore(store, lsMap);

    // 3. Mémoire
    const memMap = this.getMemoryStore<T>(store);
    memMap.set(key, item);
  }

  public async putBatch<T extends { id?: string; key?: string }>(
    store: StoreName,
    items: T[]
  ): Promise<void> {
    if (items.length === 0) return;

    // 1. IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        const tx = db.transaction(store as any, 'readwrite');
        for (const item of items) {
          await tx.store.put(item);
        }
        await tx.done;
      } catch (err) {
        this.recordIncident(store, 'put', err);
        this.isIndexedDBBlocked = true;
      }
    }

    // 2. localStorage
    const lsMap = this.readLSStore<T>(store);
    for (const item of items) {
      const key = (item.id || item.key) as string;
      if (key) lsMap.set(key, item);
    }
    this.writeLSStore(store, lsMap);

    // 3. Mémoire
    const memMap = this.getMemoryStore<T>(store);
    for (const item of items) {
      const key = (item.id || item.key) as string;
      if (key) memMap.set(key, item);
    }
  }

  public async delete(store: StoreName, id: string): Promise<void> {
    // 1. IndexedDB
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        await db.delete(store as any, id);
      } catch (err) {
        this.recordIncident(store, 'delete', err);
      }
    }

    // 2. localStorage
    const lsMap = this.readLSStore(store);
    lsMap.delete(id);
    this.writeLSStore(store, lsMap);

    // 3. Mémoire
    const memMap = this.getMemoryStore(store);
    memMap.delete(id);
  }

  public async clearStore(store: StoreName): Promise<void> {
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      try {
        const db = await this.getDB();
        await db.clear(store as any);
      } catch (err) {
        this.recordIncident(store, 'clear', err);
      }
    }

    const ls = this.getEffectiveLocalStorage();
    if (ls) {
      ls.removeItem(this.getLSStoreKey(store));
    }

    const memMap = this.getMemoryStore(store);
    memMap.clear();
  }

  public async count(store: StoreName): Promise<number> {
    const all = await this.getAll(store);
    return all.length;
  }

  public getLastIncident(): WebAdapterIncident | null {
    return this.lastIncident;
  }

  public getActiveEngineName(): string {
    if (this.isIndexedDBAvailable() && !this.isIndexedDBBlocked) {
      return 'IndexedDB (Persistant natif)';
    }
    if (this.getEffectiveLocalStorage() !== null) {
      return 'localStorage (Repli persistant - Survie F5)';
    }
    return 'In-Memory (Session volatile)';
  }

  public isPersistent(): boolean {
    return this.getActiveEngineName() !== 'In-Memory (Session volatile)';
  }
}

// Instance singleton par défaut pour l'adaptateur web
export const defaultWebStorageAdapter = new WebStorageAdapter();
