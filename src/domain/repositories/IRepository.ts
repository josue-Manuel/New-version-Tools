/**
 * New Version School Tools — Interface Générique de Dépôt (Repository Pattern)
 *
 * Contrat fondamental définissant les opérations de base (CRUD) pour chaque entité
 * du domaine scolaire. Découplé du moteur physique sous-jacent (IndexedDB / SQLite Tauri 2).
 */

export interface IRepository<T, ID = string> {
  /**
   * Récupère une entité par son identifiant unique.
   */
  getById(id: ID): Promise<T | null>;

  /**
   * Récupère l'ensemble des entités de la collection.
   */
  getAll(): Promise<T[]>;

  /**
   * Enregistre ou met à jour une entité.
   */
  save(entity: T): Promise<void>;

  /**
   * Enregistre un lot d'entités de manière atomique ou séquentielle.
   */
  saveBatch?(entities: T[]): Promise<void>;

  /**
   * Supprime une entité par son identifiant.
   */
  delete(id: ID): Promise<void>;

  /**
   * Retourne le nombre total d'entités.
   */
  count?(): Promise<number>;
}
