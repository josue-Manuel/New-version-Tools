import React from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  MapPin,
  Phone,
  Home,
  Edit,
  Archive,
  RotateCcw,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { Student } from '../../domain/types';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  className?: string;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onToggleArchive: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  className = 'Non assignée',
  onClose,
  onEdit,
  onToggleArchive,
}) => {
  if (!isOpen || !student) return null;

  // Calcul de l'âge si la date de naissance est renseignée
  const calculateAge = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} ans` : null;
  };

  const age = calculateAge(student.birthDate);

  const formattedEnrolledAt = student.enrolledAt
    ? new Date(student.enrolledAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Date non précisée';

  const formattedBirthDate = student.birthDate
    ? new Date(student.birthDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
        {/* En-tête Dossier */}
        <div className="bg-[#0A1D3D] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1446A0] border-2 border-[#00C2FF] flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md">
              {student.lastName.substring(0, 1)}
              {student.firstName.substring(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs bg-[#1446A0] text-[#00C2FF] px-2 py-0.5 rounded font-bold border border-[#00C2FF]/30">
                  {student.studentNumber}
                </span>
                {student.active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Élève Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    <Archive className="w-3.5 h-3.5" />
                    Dossier Archivé
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mt-2 tracking-tight truncate">
                {student.lastName} {student.firstName}
              </h2>
              <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#00C2FF]" />
                Classe : <span className="font-medium text-white">{className}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Corps des informations */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Section 1 : État Civil */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#1446A0] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              État Civil & Renseignements Personnels
            </h4>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sexe</span>
                <span className="font-medium text-slate-800">
                  {student.gender === 'M' ? 'Masculin (Garçon)' : 'Féminin (Fille)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Âge</span>
                <span className="font-medium text-slate-800">{age || 'Non calculable'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Date de naissance</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formattedBirthDate || 'Non renseignée'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Lieu de naissance</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {student.birthPlace || 'Pointe-Noire (par défaut)'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 : Scolarité */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#1446A0] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Scolarité & Inscription
            </h4>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Classe courante</span>
                <span className="font-bold text-[#1446A0] text-sm">{className}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Date d'inscription</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formattedEnrolledAt}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3 : Responsable Légal */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#1446A0] mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Responsable Légal & Contact d'Urgence
            </h4>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tuteur / Parent :</span>
                <span className="font-semibold text-slate-800">
                  {student.guardianName || 'Non renseigné'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Téléphone direct :</span>
                <span className="font-mono font-medium text-[#1446A0]">
                  {student.guardianPhone ? (
                    <a
                      href={`tel:${student.guardianPhone}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {student.guardianPhone}
                    </a>
                  ) : (
                    'Aucun numéro renseigné'
                  )}
                </span>
              </div>
              <div className="flex items-start justify-between pt-1 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Adresse de résidence :</span>
                <span className="text-right text-slate-700 max-w-[65%] flex items-center justify-end gap-1">
                  <Home className="w-3 h-3 text-slate-400 shrink-0" />
                  {student.guardianAddress || 'Pointe-Noire'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100/80 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={() => onToggleArchive(student)}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 border transition-colors ${
              student.active
                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {student.active ? (
              <>
                <Archive className="w-3.5 h-3.5" />
                Archiver ce dossier
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Réactiver cet élève
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1446A0] hover:bg-[#0A1D3D] rounded shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier la fiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
