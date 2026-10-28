import { describe, it, expect } from 'vitest';
import { validateBackupFileStructure } from '../core/validation/validators';
import { generateSeedData } from '../core/storage/seedData';

describe('Backup & Restore Verification (Sauvegarde et Restauration)', () => {
  it('valide avec succès une sauvegarde conforme produite par New Version School Tools', () => {
    const validDump = generateSeedData();
    const result = validateBackupFileStructure(validDump);
    expect(result.valid).toBe(true);
    expect(result.dump).toBeDefined();
    expect(result.dump?.metadata.software).toBe('New Version School Tools');
    expect(result.dump?.students.length).toBeGreaterThan(0);
  });

  it('rejette un fichier sans objet JSON valide', () => {
    expect(validateBackupFileStructure(null).valid).toBe(false);
    expect(validateBackupFileStructure('test').valid).toBe(false);
  });

  it('rejette une sauvegarde sans signature de logiciel valide', () => {
    const corruptedDump = generateSeedData();
    (corruptedDump.metadata as any).software = 'Other Software Unknown';
    const result = validateBackupFileStructure(corruptedDump);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Signature logicielle invalide');
  });

  it('rejette une sauvegarde ayant une version de schéma incompatible', () => {
    const corruptedDump = generateSeedData();
    (corruptedDump.metadata as any).version = '2.5.0'; // Incompatible
    const result = validateBackupFileStructure(corruptedDump);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Version de schéma incompatible');
  });

  it('rejette une sauvegarde à laquelle il manque des tables essentielles', () => {
    const corruptedDump = generateSeedData();
    delete (corruptedDump as any).students;
    const result = validateBackupFileStructure(corruptedDump);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('students');
  });
});
