import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Sparkles, Plus, GraduationCap } from 'lucide-react';
import { Student, SchoolClass } from '../../domain/types';
import { defaultAppDatabase } from '../../services/storage/repositories/WebAppDatabase';

interface StudentFormModalProps {
  isOpen: boolean;
  studentToEdit: Student | null;
  classes: SchoolClass[];
  onClose: () => void;
  onSaved: () => void;
  onClassCreated?: (newClass: SchoolClass) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  studentToEdit,
  classes,
  onClose,
  onSaved,
  onClassCreated,
}) => {
  const isEditing = Boolean(studentToEdit);

  const [studentNumber, setStudentNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [schoolClassId, setSchoolClassId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');

  // Mode création rapide de classe si nécessaire
  const [isCreatingQuickClass, setIsCreatingQuickClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialisation du formulaire lors de l'ouverture ou du changement d'élève
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setIsCreatingQuickClass(false);
    setNewClassName('');

    if (studentToEdit) {
      setStudentNumber(studentToEdit.studentNumber || '');
      setLastName(studentToEdit.lastName || '');
      setFirstName(studentToEdit.firstName || '');
      setGender(studentToEdit.gender || 'M');
      setSchoolClassId(studentToEdit.schoolClassId || '');
      setBirthDate(studentToEdit.birthDate || '');
      setBirthPlace(studentToEdit.birthPlace || '');
      setGuardianName(studentToEdit.guardianName || '');
      setGuardianPhone(studentToEdit.guardianPhone || '');
      setGuardianAddress(studentToEdit.guardianAddress || '');
    } else {
      // Formulaire vide pour une nouvelle inscription
      setStudentNumber('');
      setLastName('');
      setFirstName('');
      setGender('M');
      setSchoolClassId(classes.length > 0 ? classes[0].id : '');
      setBirthDate('');
      setBirthPlace('Pointe-Noire');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianAddress('');

      // Suggérer un matricule par défaut propre à l'année
      generateSuggestedMatricule();
    }
  }, [isOpen, studentToEdit, classes]);

  // Générateur intelligent de matricule standard congolais
  const generateSuggestedMatricule = async () => {
    try {
      const year = new Date().getFullYear();
      const allStudents = await defaultAppDatabase.students.getAll();
      const nextSequence = (allStudents.length + 1).toString().padStart(4, '0');
      const suggested = `CG-PN-${year}-${nextSequence}`;
      setStudentNumber(suggested);
    } catch {
      setStudentNumber(`CG-PN-${new Date().getFullYear()}-0001`);
    }
  };

  if (!isOpen) return null;

  // Création rapide d'une nouvelle classe depuis le modal
  const handleCreateQuickClass = async () => {
    const trimmed = newClassName.trim();
    if (!trimmed) {
      setError('Veuillez renseigner le nom de la classe (ex: "Terminale C" ou "CM2 A").');
      return;
    }

    try {
      const newClass: SchoolClass = {
        id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: trimmed,
        schoolLevelId: 'lvl_default',
        academicYearId: 'ay_current',
      };

      await defaultAppDatabase.classes.save(newClass);
      if (onClassCreated) {
        onClassCreated(newClass);
      }
      setSchoolClassId(newClass.id);
      setIsCreatingQuickClass(false);
      setNewClassName('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création de la classe.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation des champs obligatoires
    const cleanNumber = studentNumber.trim().toUpperCase();
    const cleanLastName = lastName.trim().toUpperCase();
    const cleanFirstName = firstName.trim();

    if (!cleanNumber) {
      setError('Le matricule officiel de l’élève est obligatoire.');
      return;
    }
    if (!cleanLastName) {
      setError('Le nom de famille de l’élève est obligatoire.');
      return;
    }
    if (!cleanFirstName) {
      setError('Le prénom de l’élève est obligatoire.');
      return;
    }
    if (!schoolClassId) {
      setError('Veuillez sélectionner ou créer une classe d’affectation pour l’élève.');
      return;
    }

    // 2. Vérification unicité du matricule
    try {
      setIsSaving(true);
      const existing = await defaultAppDatabase.students.getByStudentNumber(cleanNumber);
      if (existing && (!isEditing || existing.id !== studentToEdit?.id)) {
        setError(
          `Le matricule '${cleanNumber}' est déjà attribué à ${existing.lastName} ${existing.firstName} (Classe : ${existing.schoolClassId}). Veuillez utiliser un matricule unique.`
        );
        setIsSaving(false);
        return;
      }

      const studentPayload: Student = {
        id: isEditing && studentToEdit ? studentToEdit.id : `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        studentNumber: cleanNumber,
        lastName: cleanLastName,
        firstName: cleanFirstName,
        gender,
        schoolClassId,
        birthDate: birthDate || undefined,
        birthPlace: birthPlace.trim() || undefined,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        guardianAddress: guardianAddress.trim() || undefined,
        active: isEditing && studentToEdit ? studentToEdit.active : true,
        enrolledAt: isEditing && studentToEdit ? studentToEdit.enrolledAt : new Date().toISOString(),
      };

      await defaultAppDatabase.students.save(studentPayload);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde de l’élève:', err);
      setError(err?.message || 'Une erreur est survenue lors de l’enregistrement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header Modal */}
        <div className="bg-[#0A1D3D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#1446A0] border border-[#00C2FF]/40 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                {isEditing ? `Modifier la fiche : ${studentToEdit?.lastName} ${studentToEdit?.firstName}` : 'Inscrire un nouvel élève'}
              </h3>
              <p className="text-xs text-white/70">
                {isEditing ? 'Mise à jour des informations scolaires et civiles' : 'Dossier d’inscription scolaire conforme (Pointe-Noire)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1 : État Civil & Identité */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1446A0] mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span>1. Identité et Matricule Scolaire</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matricule */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Matricule Officiel <span className="text-red-500">*</span>
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={generateSuggestedMatricule}
                      className="text-[11px] text-[#1446A0] hover:text-[#0A1D3D] flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-[#00C2FF]" />
                      Suggérer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value.toUpperCase())}
                  placeholder="Ex: CG-PN-2026-0001"
                  className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0] focus:border-transparent uppercase bg-slate-50"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Identifiant unique conservé sur le bulletin.</p>
              </div>

              {/* Sexe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('M')}
                    className={`py-2 px-3 rounded text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      gender === 'M'
                        ? 'bg-[#1446A0] text-white border-[#1446A0] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Masculin (M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('F')}
                    className={`py-2 px-3 rounded text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      gender === 'F'
                        ? 'bg-[#1446A0] text-white border-[#1446A0] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Féminin (F)
                  </button>
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de famille <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.toUpperCase())}
                  placeholder="Ex: MAVOUNGOU"
                  className="w-full px-3 py-2 text-xs font-bold rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0] uppercase"
                  required
                />
              </div>

              {/* Prénom(s) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prénom(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Grace Divine"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                  required
                />
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                />
              </div>

              {/* Lieu de naissance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Ex: Pointe-Noire, Congo"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Affectation Scolaire */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1446A0] mb-3 flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                2. Affectation dans une Classe
              </span>
              {!isCreatingQuickClass && (
                <button
                  type="button"
                  onClick={() => setIsCreatingQuickClass(true)}
                  className="text-[11px] text-[#1446A0] hover:text-[#0A1D3D] font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  + Nouvelle classe
                </button>
              )}
            </h4>

            {isCreatingQuickClass ? (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md mb-2 flex flex-col md:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: Terminale D ou 3ème B"
                  className="flex-1 w-full px-3 py-1.5 text-xs rounded border border-blue-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1446A0]"
                  autoFocus
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleCreateQuickClass}
                    className="flex-1 md:flex-none px-3 py-1.5 bg-[#1446A0] text-white text-xs font-medium rounded hover:bg-[#0A1D3D]"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingQuickClass(false);
                      setNewClassName('');
                    }}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classe d’affectation <span className="text-red-500">*</span>
                </label>
                <select
                  value={schoolClassId}
                  onChange={(e) => setSchoolClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                  required
                >
                  <option value="" disabled>
                    -- Choisir une classe --
                  </option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Aucune classe enregistrée. Utilisez "+ Nouvelle classe" ci-dessus pour en créer une.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 3 : Responsable Légal & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1446A0] mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span>3. Responsable Légal & Contacts (Pointe-Noire)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du parent ou tuteur
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Ex: M. Jean-Pierre MAVOUNGOU"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Téléphone du tuteur
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Ex: +242 06 654 32 10 / 05 521..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse de résidence / Quartier
                </label>
                <input
                  type="text"
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  placeholder="Ex: Quartier Tié-Tié, Rue de la Paix, Pointe-Noire"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1446A0] hover:bg-[#0A1D3D] rounded shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Enregistrement en cours...' : isEditing ? 'Mettre à jour l’élève' : 'Inscrire l’élève'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
