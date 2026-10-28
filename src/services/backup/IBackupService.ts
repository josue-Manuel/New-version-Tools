/**
 * New Version School Tools — Interface du Service de Sauvegarde
 *
 * Définit le contrat d'exportation et d'importation des archives chiffrables / vérifiables.
 * En Phase 1, cette interface établit la signature sans simuler de fausse sauvegarde.
 * En Phase 2, elle utilisera le dialogue natif de fichiers de Tauri 2 (save/open).
 */

export interface BackupMetadata {
  software: string;
  softwareVersion: string;
  exportedAt: string;
  academicYear: string;
  schoolName: string;
  checksum: string;
}

export interface BackupPackage {
  metadata: BackupMetadata;
  schemaVersion: number;
  payload: Record<string, unknown>;
}

export interface IBackupService {
  /**
   * Crée une archive exportable contenant l'état de la base.
   */
  exportBackup(): Promise<BackupPackage>;

  /**
   * Valide le format et l'intégrité d'une archive avant restauration.
   */
  validateBackup(backupData: unknown): Promise<{ isValid: boolean; error?: string }>;

  /**
   * Restaure les données à partir d'une archive validée.
   */
  restoreBackup(backup: BackupPackage): Promise<void>;
}
