import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  HardDriveDownload,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Database,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  X,
} from 'lucide-react';
import { validateBackupFileStructure } from '../core/validation/validators';
import { DatabaseDump } from '../core/models/types';

export const BackupRestoreView: React.FC = () => {
  const {
    school,
    students,
    classes,
    subjects,
    assessments,
    grades,
    exportDatabase,
    restoreDatabase,
    loadDemoData,
  } = useSchool();

  const [pendingDump, setPendingDump] = useState<DatabaseDump | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setPendingDump(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = validateBackupFileStructure(parsed);

        if (!validation.valid || !validation.dump) {
          setValidationError(validation.message);
          return;
        }

        setPendingDump(validation.dump);
        setIsConfirmModalOpen(true);
      } catch (err: any) {
        setValidationError(`Erreur de lecture JSON : ${err.message || 'fichier invalide'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingDump) return;
    await restoreDatabase(pendingDump);
    setIsConfirmModalOpen(false);
    setPendingDump(null);
    setSuccessNotice('Sauvegarde restaurée avec succès dans IndexedDB.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#CBD5E1] pb-3">
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-[#1446A0]" />
            <span>Gestion des Sauvegardes & Restauration Locale</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Exportez l’intégralité des données en fichier JSON sécurisé ou restaurez une archive existante
          </p>
        </div>

        {successNotice && (
          <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#10B981] text-xs text-[#065F46] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{successNotice}</span>
          </div>
        )}

        {validationError && (
          <div className="p-3 rounded-[4px] bg-[#FEF2F2] border border-[#DC2626] text-xs text-[#991B1B] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Section 1: Current State Overview */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-[#1446A0]" />
            <span>État Actuel du Stockage Local (IndexedDB)</span>
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            Toutes les entités ci-dessous sont hébergées localement sur ce poste et disponibles hors-ligne.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Élèves</span>
              <span className="text-lg font-bold tabular-nums text-[#0F172A] block mt-1">{students.length}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Classes</span>
              <span className="text-lg font-bold tabular-nums text-[#0F172A] block mt-1">{classes.length}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Matières</span>
              <span className="text-lg font-bold tabular-nums text-[#0F172A] block mt-1">{subjects.length}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Évaluations</span>
              <span className="text-lg font-bold tabular-nums text-[#0F172A] block mt-1">{assessments.length}</span>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Notes Saisies</span>
              <span className="text-lg font-bold tabular-nums text-[#1446A0] block mt-1">{grades.length}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Export Database Dump */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#1446A0]" />
              <span>Exporter une Sauvegarde Complète (JSON)</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Génère une archive horodatée contenant l’ensemble des données, coefficients et notes.
            </p>
          </div>

          <button
            onClick={exportDatabase}
            className="h-9 px-4 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Sauvegarde</span>
          </button>
        </div>

        {/* Section 3: Restore Backup */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1446A0]" />
                <span>Restaurer une Sauvegarde Validée</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Le fichier sera minutieusement vérifié (signature logicielle, version 1.0.0 et tables requises) avant toute application.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-[4px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#1446A0] file:text-white cursor-pointer"
            />
            <p className="text-[11px] text-[#64748B] mt-2">
              Seuls les fichiers produits par <strong>New Version School Tools</strong> sont acceptés.
            </p>
          </div>
        </div>

        {/* Section 4: Load Demo Data */}
        <div className="bg-white rounded-[4px] border border-[#CBD5E1] p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D97706]" />
              <span>Recharger le Jeu de Données de Démonstration</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Réinitialise la base locale avec les élèves et notes modèles du Lycée Victor Augagneur (Pointe-Noire).
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment écraser la base actuelle pour recharger les données modèles ?')) {
                loadDemoData();
              }
            }}
            className="h-8 px-3 rounded-[4px] border border-[#D97706] bg-white text-xs font-semibold text-[#D97706] hover:bg-[#FEF3C7] cursor-pointer"
          >
            Recharger Démo
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {isConfirmModalOpen && pendingDump && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/75 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00C2FF]" />
                <span>Confirmation de Restauration des Données</span>
              </h3>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-[#A1BAFF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[4px] text-[#92400E] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Attention — Action Destructrice :</strong>
                  La restauration remplacera l'intégralité des classes, élèves et notes actuellement présents sur cet appareil.
                </div>
              </div>

              {/* Summary of what will be restored */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] space-y-1.5">
                <span className="font-bold text-[#0A1D3D] block border-b pb-1">
                  Contenu validé du fichier de sauvegarde :
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
                  <div>Établissement : <strong>{pendingDump.school.name}</strong></div>
                  <div>Année Scolaire : <strong>{pendingDump.metadata.academicYear}</strong></div>
                  <div>Élèves : <strong>{pendingDump.students.length}</strong></div>
                  <div>Classes : <strong>{pendingDump.classes.length}</strong></div>
                  <div>Évaluations : <strong>{pendingDump.assessments.length}</strong></div>
                  <div>Notes : <strong>{pendingDump.grades.length}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white font-semibold text-[#475569]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="px-4 py-1.5 rounded-[4px] bg-[#DC2626] hover:bg-[#B91C1C] font-semibold text-white shadow-xs"
                >
                  Confirmer et Remplacer la Base
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
