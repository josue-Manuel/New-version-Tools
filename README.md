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
│   ├── repositories/                    # Contrats de dépôts métier (Repository Pattern)
│   │   ├── IRepository.ts               # Interface générique CRUD
│   │   ├── IStudentRepository.ts        # Gestion élèves, matricules, archivage
│   │   ├── IClassRepository.ts          # Classes, niveaux d'enseignement
│   │   ├── ISubjectRepository.ts        # Matières, coefficients, affectations
│   │   ├── IAssessmentRepository.ts     # Évaluations, devoirs, compositions
│   │   ├── IGradeRepository.ts          # Notes, matrices, suppression en cascade
│   │   ├── IPaymentRepository.ts        # Frais scolaires, reçus, solde élève
│   │   ├── ISchoolConfigRepository.ts   # Séparation stricte configuration vs données
│   │   ├── IAppDatabase.ts              # Unité de travail centralisée (Unit of Work)
│   │   └── index.ts                     # Export centralisé des contrats
│   └── types/
│       └── index.ts                     # Modèle TypeScript strict du domaine
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
│       ├── IStorageService.ts           # Contrat Phase 1 de configuration
│       ├── IndexedDBStorageService.ts   # Persistance multi-paliers de configuration
│       ├── MemoryStorageService.ts      # Implémentation mémoire isolée (tests)
│       ├── TauriSQLiteSchema.ts         # Schéma relationnel SQLite complet (Tauri 2)
│       ├── db/
│       │   ├── WebDatabaseSchema.ts     # Magasins d'objets IndexedDB versionnés (v1 -> v2)
│       │   └── WebStorageAdapter.ts     # Moteur résilient IndexedDB / localStorage / Mémoire
│       └── repositories/
│           ├── IndexedDBSchoolConfigRepository.ts
│           ├── IndexedDBStudentRepository.ts
│           ├── IndexedDBClassRepository.ts
│           ├── IndexedDBSubjectRepository.ts
│           ├── IndexedDBAssessmentRepository.ts
│           ├── IndexedDBGradeRepository.ts
│           ├── IndexedDBPaymentRepository.ts
│           ├── WebAppDatabase.ts         # Implémentation IAppDatabase pour le Web
│           └── index.ts                 # Export de defaultAppDatabase
├── styles/
│   └── colors.ts                        # Constantes de la palette officielle
└── tests/
    ├── repositories_phase2.test.ts      # 12 tests d'intégrité des dépôts Phase 2
    ├── indexeddb_storage.test.ts        # 11 tests de persistance multi-paliers & F5
    ├── phase1_socle.test.ts             # 15 tests du socle technique et du pont natif
    ├── calculations.test.ts             # 13 tests du moteur de calcul académique
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
Résultat : **61 tests exécutés et validés avec succès (100 %)**.

### Vérification du typage TypeScript
```bash
npm run lint
```

### Compilation de production
```bash
npm run build
```

---

## 5. Architecture de Stockage Cible & Préparation Phase 2

1. **Centralisation par Repository Pattern & Unit of Work (IAppDatabase)** :
   L'application dispose d'une architecture découplée évitant tout appel direct à `localStorage` dans les composants métier :
   - `defaultAppDatabase.students` : Inscriptions, recherche matricule, archivage.
   - `defaultAppDatabase.classes` : Niveaux, classes, affectations.
   - `defaultAppDatabase.subjects` : Catalogue national, coefficients par classe.
   - `defaultAppDatabase.assessments` : Devoirs surveillés, interrogations, compositions.
   - `defaultAppDatabase.grades` : Notes réelles (distinction note `0/20` vs absence non notée `null`).
   - `defaultAppDatabase.payments` : Encaissements de scolarité, reçus officiels, solde par élève.
   - `defaultAppDatabase.schoolConfig` : Séparation étanche de la configuration et des données élèves.

2. **Résilience Web Multi-Paliers** :
   - IndexedDB natif (`nv_school_tools_web_db` v2) en palier prioritaire.
   - Repli transparent sur `localStorage` partitionné en cas d'environnement restreint (iframe de prévisualisation Google AI Studio), assurant la **survie des données après rechargement de page (F5)**.

3. **Transition Transparente vers Tauri 2 & SQLite** :
   - Le schéma SQLite DDL (`TauriSQLiteSchema.ts`) contient 100 % des tables nécessaires (`school_config`, `academic_years`, `school_levels`, `school_classes`, `students`, `subjects`, `class_subjects`, `periods`, `assessments`, `grades`, `fee_transactions`).
   - L'intégration ultérieure de Tauri 2 consistera uniquement à instancier une classe `TauriSQLiteAppDatabase implements IAppDatabase`, sans réécrire aucun composant React ni aucune règle de calcul.

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
