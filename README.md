# New Version School Tools — Phase 1 : Socle Technique

Logiciel de gestion scolaire desktop offline-first pour les écoles primaires, collèges et lycées de **Pointe-Noire (Congo-Brazzaville)**.

- **Nom du logiciel** : New Version School Tools
- **Éditeur** : New Version
- **Phase actuelle** : Phase 1 — Socle technique, architecture modulaire et interface initiale
- **Cible desktop** : Tauri 2 + SQLite local (sans dépendance Internet, sans cloud, sans API payante)

---

## 1. Objectifs & Périmètre de la Phase 1

Conformément au cahier des charges de la Phase 1, cette étape se concentre exclusivement sur :
1. **L'architecture modulaire découplée** séparant l'interface React du stockage de données.
2. **Le système de navigation de bureau** avec statuts visuels d'autonomie locale/hors-ligne.
3. **Le tableau de bord initial authentique** : indicateurs à zéro, sans fausses statistiques simulées.
4. **Le formulaire de configuration initiale** de l'établissement avec validation stricte.
5. **La spécification du schéma relationnel SQLite** et du pont natif pour l'intégration de bureau **Tauri 2**.
6. **L'affichage transparent des modules en préparation (Phase 2)** sans écrans vides trompeurs.

---

## 2. Palette & Identité Visuelle

L'interface respecte rigoureusement la charte graphique sobre et professionnelle :
- **Bleu nuit** : `#0A1D3D` (barre latérale, fond institutionnel)
- **Bleu principal** : `#1446A0` (boutons d'action, en-têtes, accentuation primaire)
- **Bleu secondaire** : `#1E88E5` (survols, focus, navigation active)
- **Cyan** : `#00C2FF` (badges, repères visuels)
- **Fond clair** : `#F5F7FB` (arrière-plan principal de travail)
- **Blanc** : `#FFFFFF` (cartes et conteneurs)
- **Texte principal** : `#182230` (titres et corps de texte)
- **Texte secondaire** : `#667085` (descriptions et métadonnées)

---

## 3. Structure du Projet

```text
src/
├── app/
│   └── AppShell.tsx                     # Conteneur racine de navigation et gestion de l'état
├── components/
│   ├── common/
│   │   └── PhasePlaceholderView.tsx     # Écran explicatif pour les modules de la Phase 2
│   ├── layout/
│   │   ├── AppHeader.tsx                # En-tête avec statut hors-ligne et identité école
│   │   └── AppSidebar.tsx               # Barre latérale avec badges "Phase 2" et logo
│   └── ui/
│       ├── Badge.tsx                    # Badges d'état (neutral, info, success, warning)
│       ├── Button.tsx                   # Primitifs de boutons sobres (primary, outline, ghost)
│       ├── Card.tsx                     # Cartes d'affichage avec bordures fines
│       ├── Input.tsx                    # Champs de saisie avec validation d'erreurs
│       └── Select.tsx                   # Sélecteur typé
├── domain/
│   └── types/
│       └── index.ts                     # Modèle TypeScript strict (School, Student, Grade...)
├── modules/
│   ├── dashboard/
│   │   └── DashboardView.tsx            # Tableau de bord initial aux métriques véridiques
│   └── settings/
│       └── SettingsView.tsx             # Formulaire de configuration de l'établissement
├── services/
│   ├── backup/
│   │   └── IBackupService.ts            # Contrat d'export/import d'archives sécurisées
│   ├── native/
│   │   └── TauriBridge.ts               # Pont sécurisé détectant l'environnement Tauri 2
│   └── storage/
│       ├── IStorageService.ts           # Contrat d'accès aux données (remplaçable par SQLite)
│       ├── configValidation.ts          # Validateur partagé de la configuration scolaire
│       ├── IndexedDBStorageService.ts   # Persistance locale IndexedDB (active sur la version web)
│       ├── MemoryStorageService.ts      # Implémentation isolée en mémoire (secours / tests)
│       ├── TauriSQLiteSchema.ts         # Schéma DDL relationnel SQLite pour Tauri 2
│       └── index.ts                     # Injection de defaultStorageService (IndexedDB sur web)
├── styles/
│   └── colors.ts                        # Constantes de la palette officielle
└── tests/
    ├── indexeddb_storage.test.ts        # 7 tests de persistance IndexedDB (simulation F5, erreurs)
    ├── phase1_socle.test.ts             # 15 tests unitaires du socle technique et du pont
    ├── calculations.test.ts             # 13 tests du moteur de calcul
    ├── validation.test.ts               # 5 tests de validation de saisie
    └── backup.test.ts                   # 5 tests de vérification de sauvegarde
```

---

## 4. Guide d'Installation & Lancement Local

### Prérequis
- Node.js (version 20 ou supérieure recommandée)
- npm

### Installation des dépendances
```bash
npm install
```

### Lancement du serveur de développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

### Exécution des tests automatisés (Vitest)
```bash
npm test
```
Résultat : **49 tests exécutés et validés avec succès (100 %)**.

### Vérification du typage TypeScript
```bash
npm run lint
```

### Compilation de production
```bash
npm run build
```

---

## 5. Persistance Web Multi-Paliers & Résilience

1. **Architecture de persistance résiliente (RÉSOLU)** :
   L'application utilise désormais `IndexedDBStorageService` avec une architecture multi-paliers :
   - **Palier 1 (Prioritaire)** : IndexedDB local (`nv_school_tools_web_db`) via `idb`.
   - **Palier 2 (Repli persistant automatique)** : `localStorage` avec sérialisation JSON sécurisée et validation de schéma. Si IndexedDB est restreint par une politique de bac à sable dans une iframe (ex : aperçu Google AI Studio renvoyant `DOMException [UnknownError]: "Internal error."`), le stockage bascule automatiquement et de façon transparente vers `localStorage`.
   - **Garantie F5** : Les données de configuration restent **réellement enregistrées après actualisation (F5)**, fermeture de l'onglet ou redémarrage du navigateur sous Windows.
   - **Diagnostic technique en direct** : Un volet d'inspection technique est accessible dans la vue Configuration pour visualiser en temps réel le moteur actif, l'état de persistance et les éventuels incidents interceptés.
2. **Modules métier de la Phase 2** :
   Les rubriques *Élèves*, *Classes*, *Matières*, *Évaluations & Notes*, *Résultats & Bulletins* et *Sauvegardes* sont documentées et affichent leur feuille de route détaillée sans simuler de fausses saisies.
3. **Transition de bureau vers SQLite** :
   Le contrat `IStorageService` permet de basculer sur `TauriSQLiteStorageService` pour l'application de bureau native sans toucher à l'interface React.

---

## 6. Étapes d'Intégration Locale dans Tauri 2 avec SQLite

Pour transformer cette application React en logiciel de bureau Windows / Linux / macOS autonome :

### Étape 1 : Initialiser Tauri 2 dans le projet
```bash
npm install -D @tauri-apps/cli@next
npx tauri init
```

### Étape 2 : Ajouter le plugin officiel SQLite de Tauri
Dans le dossier du projet :
```bash
npm install @tauri-apps/plugin-sql
```
Dans `src-tauri/Cargo.toml` :
```toml
[dependencies]
tauri = { version = "2.0.0", features = [] }
tauri-plugin-sql = { version = "2.0.0", features = ["sqlite"] }
```

### Étape 3 : Déclarer les permissions dans `src-tauri/capabilities/default.json`
```json
{
  "permissions": [
    "core:default",
    "sql:default",
    "sql:allow-execute",
    "sql:allow-select",
    "dialog:default"
  ]
}
```

### Étape 4 : Créer `TauriSQLiteStorageService.ts`
Remplacer l'instance `defaultStorageService` dans `src/app/AppShell.tsx` par une classe implémentant `IStorageService` qui utilise `Database.load("sqlite:nv_school_tools.db")` et exécute le script `SQLITE_SCHEMA_DDL` défini dans `src/services/storage/TauriSQLiteSchema.ts`.

### Étape 5 : Compiler l'exécutable natif
```bash
npm run tauri build
```
L'installeur `.exe` (Windows), `.deb`/`.AppImage` (Linux) ou `.dmg` (macOS) sera généré dans `src-tauri/target/release/bundle/`.
