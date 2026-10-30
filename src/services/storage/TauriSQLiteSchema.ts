/**
 * New Version School Tools — Spécification du Schéma SQLite (Tauri 2)
 *
 * Ce fichier définit les tables relationnelles SQLite qui seront déployées
 * via Tauri 2 avec le plugin `@tauri-apps/plugin-sql` (ou IPC Rust rusqlite).
 *
 * Base de données locale sécurisée : `sqlite:nv_school_tools.db`
 */

export const SQLITE_SCHEMA_DDL = `
-- Table: configuration et établissement
CREATE TABLE IF NOT EXISTS school_config (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    school_type TEXT NOT NULL CHECK(school_type IN ('primary', 'middle', 'secondary', 'mixed')),
    academic_year TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Pointe-Noire',
    country TEXT NOT NULL DEFAULT 'Congo',
    currency TEXT NOT NULL DEFAULT 'FCFA',
    principal_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Table: années scolaires
CREATE TABLE IF NOT EXISTS academic_years (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0
);

-- Table: niveaux d'enseignement
CREATE TABLE IF NOT EXISTS school_levels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level_type TEXT NOT NULL CHECK(level_type IN ('primary', 'middle', 'secondary')),
    code TEXT NOT NULL
);

-- Table: classes
CREATE TABLE IF NOT EXISTS school_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    school_level_id TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    capacity INTEGER,
    FOREIGN KEY(school_level_id) REFERENCES school_levels(id),
    FOREIGN KEY(academic_year_id) REFERENCES academic_years(id)
);

-- Table: élèves (avec contrainte d'unicité sur le matricule)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    student_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    school_class_id TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    birth_date TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    enrolled_at TEXT NOT NULL,
    FOREIGN KEY(school_class_id) REFERENCES school_classes(id)
);

-- Table: matières
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    school_level_id TEXT NOT NULL,
    default_coefficient REAL NOT NULL DEFAULT 1.0,
    grading_scale REAL NOT NULL DEFAULT 20.0,
    FOREIGN KEY(school_level_id) REFERENCES school_levels(id)
);

-- Table: périodes (trimestres)
CREATE TABLE IF NOT EXISTS periods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_closed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(academic_year_id) REFERENCES academic_years(id)
);

-- Table: évaluations
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    school_class_id TEXT NOT NULL,
    period_id TEXT NOT NULL,
    date TEXT NOT NULL,
    max_score REAL NOT NULL DEFAULT 20.0,
    coefficient REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(school_class_id) REFERENCES school_classes(id),
    FOREIGN KEY(period_id) REFERENCES periods(id)
);

-- Table: notes (scores)
CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    assessment_id TEXT NOT NULL,
    score REAL,
    updated_at TEXT NOT NULL,
    UNIQUE(student_id, assessment_id),
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Table: affectation matières par classe
CREATE TABLE IF NOT EXISTS class_subjects (
    id TEXT PRIMARY KEY,
    school_class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    coefficient REAL NOT NULL DEFAULT 1.0,
    teacher_name TEXT,
    FOREIGN KEY(school_class_id) REFERENCES school_classes(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

-- Table: comptabilité & frais scolaires (paiements et reçus)
CREATE TABLE IF NOT EXISTS fee_transactions (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    school_class_id TEXT,
    amount REAL NOT NULL,
    installment TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    cashier_name TEXT,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Validé', 'Quittancé', 'Annulé')),
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

-- Index pour optimiser la recherche et la génération des bulletins
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class_period ON assessments(school_class_id, period_id);
CREATE INDEX IF NOT EXISTS idx_grades_assessment ON grades(assessment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(school_class_id);
CREATE INDEX IF NOT EXISTS idx_fee_transactions_student ON fee_transactions(student_id);
`;

/**
 * Spécification du pont Tauri SQLite.
 * Prépare l'implémentation de IStorageService avec @tauri-apps/plugin-sql.
 */
export interface TauriSQLiteConfig {
  dbPath: string; // "sqlite:nv_school_tools.db"
  autoMigrate: boolean;
}
