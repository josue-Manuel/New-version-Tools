export * from './IStorageService';
export * from './configValidation';
export * from './MemoryStorageService';
export * from './IndexedDBStorageService';
export * from './TauriSQLiteSchema';
export * from './db/WebDatabaseSchema';
export * from './db/WebStorageAdapter';
export * from './repositories';

import { defaultIndexedDBStorageService } from './IndexedDBStorageService';
import { IStorageService } from './IStorageService';

/**
 * Service de stockage actif par défaut pour la configuration et le tableau de bord (Phase 1).
 *
 * Pour les domaines académiques et financiers de la Phase 2,
 * utiliser l'unité de travail centralisée `defaultAppDatabase` (ou injecter `IAppDatabase`).
 */
export const defaultStorageService: IStorageService = defaultIndexedDBStorageService;

