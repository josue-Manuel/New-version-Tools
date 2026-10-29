export * from './IStorageService';
export * from './configValidation';
export * from './MemoryStorageService';
export * from './IndexedDBStorageService';
export * from './TauriSQLiteSchema';

import { defaultIndexedDBStorageService } from './IndexedDBStorageService';
import { IStorageService } from './IStorageService';

/**
 * Service de stockage actif par défaut.
 * Dans l'application web, c'est l'implémentation persistante IndexedDB qui est injectée,
 * garantissant la conservation des données après rechargement de page (F5) et redémarrage du navigateur.
 *
 * En mode application de bureau (Tauri 2), cette même interface sera connectée au plugin SQLite.
 */
export const defaultStorageService: IStorageService = defaultIndexedDBStorageService;
