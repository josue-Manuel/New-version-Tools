import React, { useState } from 'react';
import { Archive, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Student } from '../../domain/types';
import { defaultAppDatabase } from '../../services/storage/repositories/WebAppDatabase';

interface StudentArchiveModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentArchiveModal: React.FC<StudentArchiveModalProps> = ({
  isOpen,
  student,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const isArchiving = student.active;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      if (isArchiving) {
        await defaultAppDatabase.students.archive(student.id);
      } else {
        await defaultAppDatabase.students.restore(student.id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors du changement de statut d’archivage:', err);
      setError(err?.message || 'Une erreur est survenue lors de l’opération.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isArchiving
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {isArchiving ? (
                  <Archive className="w-5 h-5" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  {isArchiving ? 'Archiver le dossier élève' : 'Réactiver l’élève'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {student.studentNumber} — {student.lastName} {student.firstName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-600 space-y-2">
            {isArchiving ? (
              <>
                <p>
                  Êtes-vous sûr de vouloir archiver le dossier de{' '}
                  <strong className="text-slate-900">
                    {student.lastName} {student.firstName}
                  </strong>{' '}
                  ?
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Conservation des données garantie :</strong> L'élève ne sera plus
                    affiché dans les listes d'appel ou de saisie des notes, mais l'intégralité de
                    son historique et de ses données restera conservée. Vous pourrez le restaurer à
                    tout moment.
                  </div>
                </div>
              </>
            ) : (
              <p>
                L'élève{' '}
                <strong className="text-slate-900">
                  {student.lastName} {student.firstName}
                </strong>{' '}
                sera réintégré dans la liste des élèves actifs de l'établissement et pourra à nouveau
                recevoir des évaluations.
              </p>
            )}
          </div>

          {error && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 text-xs font-semibold text-white rounded transition-colors flex items-center gap-1.5 shadow-xs ${
                isArchiving
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isProcessing
                ? 'Traitement en cours...'
                : isArchiving
                ? 'Confirmer l’archivage'
                : 'Confirmer la réactivation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
