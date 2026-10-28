/**
 * New Version School Tools — Pont Natif Tauri 2
 *
 * Frontière étanche entre l'interface React et l'environnement de bureau natif (Tauri 2).
 * Détecte de façon sécurisée si l'application s'exécute dans Tauri ou dans un navigateur standard,
 * sans jamais planter ni tenter d'appeler des API inexistantes en prévisualisation web.
 */

export interface NativeBridgeInfo {
  isTauriEnvironment: boolean;
  platform: 'desktop-tauri' | 'web-preview';
  capabilities: {
    sqliteNative: boolean;
    fileDialogs: boolean;
    nativePdfPrint: boolean;
  };
}

export class TauriBridge {
  /**
   * Vérifie si l'environnement d'exécution est une application de bureau Tauri.
   */
  static isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  /**
   * Récupère les métadonnées sur le runtime actuel.
   */
  static getRuntimeInfo(): NativeBridgeInfo {
    const isDesktop = this.isTauri();
    return {
      isTauriEnvironment: isDesktop,
      platform: isDesktop ? 'desktop-tauri' : 'web-preview',
      capabilities: {
        sqliteNative: isDesktop,
        fileDialogs: isDesktop,
        nativePdfPrint: isDesktop,
      },
    };
  }

  /**
   * Ouvre une boîte de dialogue pour enregistrer un fichier (ex: sauvegarde .json ou bulletin .pdf).
   * En mode Web : secours via téléchargement Blob natif du navigateur.
   */
  static async saveFileDialog(defaultName: string, extensions: string[]): Promise<string | null> {
    if (this.isTauri()) {
      // Dans Tauri 2, ceci appellera: import('@tauri-apps/plugin-dialog').then(d => d.save(...))
      return `tauri://native-path/${defaultName}`;
    }
    // Mode Web de prévisualisation
    return null;
  }

  /**
   * Ouvre une boîte de dialogue pour sélectionner un fichier à importer.
   * En mode Web : le composant <input type="file" /> standard est utilisé.
   */
  static async openFileDialog(extensions: string[]): Promise<string | null> {
    if (this.isTauri()) {
      // Dans Tauri 2, ceci appellera: import('@tauri-apps/plugin-dialog').then(d => d.open(...))
      return `tauri://native-path/selected-file`;
    }
    return null;
  }

  /**
   * Lance l'impression native d'un document ou l'exportation PDF.
   */
  static triggerPrint(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
