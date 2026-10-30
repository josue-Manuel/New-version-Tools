import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  RotateCcw,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Student, SchoolClass } from '../../domain/types';
import { defaultAppDatabase } from '../../services/storage/repositories/WebAppDatabase';
import { StudentFormModal } from './StudentFormModal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentArchiveModal } from './StudentArchiveModal';

interface StudentsViewProps {
  onStudentChanged?: () => void;
}

// Classes standards de base si aucune classe n'est encore enregistrée dans l'établissement
const DEFAULT_INITIAL_CLASSES = [
  { id: 'cls_6eme_a', name: '6ème A', schoolLevelId: 'lvl_middle', academicYearId: 'ay_current' },
  { id: 'cls_3eme_a', name: '3ème A', schoolLevelId: 'lvl_middle', academicYearId: 'ay_current' },
  { id: 'cls_2nde_c', name: '2nde C', schoolLevelId: 'lvl_secondary', academicYearId: 'ay_current' },
  { id: 'cls_1ere_d', name: '1ère D', schoolLevelId: 'lvl_secondary', academicYearId: 'ay_current' },
  { id: 'cls_tle_c', name: 'Terminale C', schoolLevelId: 'lvl_secondary', academicYearId: 'ay_current' },
  { id: 'cls_cm2', name: 'CM2', schoolLevelId: 'lvl_primary', academicYearId: 'ay_current' },
];

export const StudentsView: React.FC<StudentsViewProps> = ({ onStudentChanged }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [studentToArchive, setStudentToArchive] = useState<Student | null>(null);

  // Notification de succès
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Chargement des classes et initialisation si vide
  const loadClasses = useCallback(async () => {
    try {
      let loadedClasses = await defaultAppDatabase.classes.getAll();
      if (loadedClasses.length === 0) {
        // Enregistrer les classes par défaut dans IndexedDB
        for (const cls of DEFAULT_INITIAL_CLASSES) {
          await defaultAppDatabase.classes.save(cls);
        }
        loadedClasses = await defaultAppDatabase.classes.getAll();
      }
      setClasses(loadedClasses);
      return loadedClasses;
    } catch (err) {
      console.error('Erreur chargement classes:', err);
      return [];
    }
  }, []);

  // Chargement des élèves
  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const allStudents = await defaultAppDatabase.students.getAll();
      setStudents(allStudents);
    } catch (err) {
      console.error('Erreur chargement élèves:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadClasses();
      await loadStudents();
    };
    init();
  }, [loadClasses, loadStudents]);

  // Map des noms de classe pour affichage direct
  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [classes]);

  // Filtrage combiné (Recherche + Classe + Statut actif/archivé)
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Filtre statut
      if (statusFilter === 'active' && !s.active) return false;
      if (statusFilter === 'archived' && s.active) return false;

      // Filtre classe
      if (selectedClassId !== 'all' && s.schoolClassId !== selectedClassId) return false;

      // Filtre recherche textuelle
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${s.lastName} ${s.firstName}`.toLowerCase();
        const reverseName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const studentNumber = s.studentNumber.toLowerCase();

        return (
          fullName.includes(query) ||
          reverseName.includes(query) ||
          studentNumber.includes(query)
        );
      }

      return true;
    });
  }, [students, statusFilter, selectedClassId, searchQuery]);

  // Statistiques globales
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.active).length;
    const archived = total - active;
    const boys = students.filter((s) => s.gender === 'M' && s.active).length;
    const girls = students.filter((s) => s.gender === 'F' && s.active).length;

    return { total, active, archived, boys, girls };
  }, [students]);

  // Déclencheurs d'actions
  const handleOpenAddModal = () => {
    setStudentToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (student: Student) => {
    setSelectedStudentForDetail(student);
    setIsDetailModalOpen(true);
  };

  const handleOpenArchiveModal = (student: Student) => {
    setStudentToArchive(student);
    setIsArchiveModalOpen(true);
  };

  const handleStudentSaved = async () => {
    await loadStudents();
    if (onStudentChanged) {
      onStudentChanged();
    }
    showToast(
      studentToEdit
        ? 'Dossier élève mis à jour avec succès dans la base locale.'
        : 'Nouvel élève inscrit et enregistré avec succès.'
    );
  };

  const handleArchiveSuccess = async () => {
    await loadStudents();
    if (onStudentChanged) {
      onStudentChanged();
    }
    showToast(
      studentToArchive?.active
        ? `L'élève ${studentToArchive.lastName} a été archivé. Ses notes restent préservées.`
        : `L'élève ${studentToArchive?.lastName} a été réactivé dans sa classe.`
    );
  };

  const handleClassCreated = (newClass: SchoolClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A1D3D] text-white px-4 py-3 rounded-lg shadow-xl border border-[#00C2FF]/40 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C2FF] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0A1D3D] tracking-tight">
              Gestion des Élèves
            </h1>
            <span className="text-xs bg-[#1446A0]/10 text-[#1446A0] font-semibold px-2 py-0.5 rounded-full border border-[#1446A0]/20">
              {stats.active} actif{stats.active > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inscriptions, fiches individuelles et gestion des effectifs scolaires (Pointe-Noire).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1446A0] hover:bg-[#0A1D3D] text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#00C2FF]" />
          Inscrire un élève
        </button>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Inscrits */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1446A0]/10 border border-[#1446A0]/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#1446A0]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Inscrits
            </div>
            <div className="text-xl font-bold text-[#0A1D3D]">{stats.total}</div>
          </div>
        </div>

        {/* Élèves Actifs */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Élèves Actifs
            </div>
            <div className="text-xl font-bold text-emerald-700">{stats.active}</div>
          </div>
        </div>

        {/* Répartition Garçons / Filles */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Parité (M / F)
            </div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <span>{stats.boys} G</span>
              <span className="text-slate-300">|</span>
              <span>{stats.girls} F</span>
            </div>
          </div>
        </div>

        {/* Archivés */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Archivés
            </div>
            <div className="text-xl font-bold text-amber-700">{stats.archived}</div>
          </div>
        </div>
      </div>

      {/* Barre d'outils et de filtrage */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Champ de recherche */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom ou matricule officiel..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1446A0] bg-slate-50 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filtres combinés */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filtre par classe */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">Toutes les classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white text-[#1446A0] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Actifs ({stats.active})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-[#1446A0] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('archived')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'archived'
                  ? 'bg-white text-[#1446A0] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archivés ({stats.archived})
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des élèves */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Chargement de la base des élèves depuis IndexedDB...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-14 px-4 text-center">
            {students.length === 0 ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1446A0]/10 text-[#1446A0] flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">
                  Aucun élève enregistré
                </h3>
                <p className="text-xs text-slate-500">
                  Commencez la gestion scolaire en inscrivant le premier élève de l'établissement.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-[#1446A0] text-white text-xs font-semibold rounded hover:bg-[#0A1D3D] inline-flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-[#00C2FF]" />
                  Inscrire le premier élève
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-2">
                <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="font-semibold text-xs text-slate-700">
                  Aucun résultat ne correspond aux filtres appliqués
                </h3>
                <p className="text-[11px] text-slate-500">
                  Modifiez votre recherche ou réinitialisez les critères.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClassId('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs text-[#1446A0] hover:underline font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Nom & Prénoms</th>
                  <th className="py-3 px-3 text-center">Sexe</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Contact Tuteur</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const className = classMap.get(student.schoolClassId) || 'Non assignée';

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !student.active ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                    >
                      {/* Matricule */}
                      <td className="py-3 px-4 font-mono font-bold text-[#1446A0]">
                        <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {student.studentNumber}
                        </span>
                      </td>

                      {/* Nom & Prénoms */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0A1D3D] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {student.lastName.substring(0, 1)}
                            {student.firstName.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {student.lastName} {student.firstName}
                            </div>
                            {student.birthPlace && (
                              <div className="text-[10px] text-slate-400">
                                Né(e) à {student.birthPlace}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sexe */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.gender === 'M'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      {/* Classe */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {className}
                        </span>
                      </td>

                      {/* Contact Tuteur */}
                      <td className="py-3 px-4 text-slate-600">
                        {student.guardianName || student.guardianPhone ? (
                          <div>
                            <div className="font-medium text-slate-800 truncate max-w-[180px]">
                              {student.guardianName || 'Tuteur'}
                            </div>
                            {student.guardianPhone && (
                              <div className="font-mono text-[10px] text-slate-500">
                                {student.guardianPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Non renseigné</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-3 text-center">
                        {student.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Archivé
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Fiche détaillée */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(student)}
                            title="Consulter la fiche détaillée"
                            className="p-1.5 text-slate-600 hover:text-[#1446A0] hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Modifier */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            title="Modifier les informations"
                            className="p-1.5 text-slate-600 hover:text-[#1446A0] hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Archiver ou Réactiver */}
                          <button
                            type="button"
                            onClick={() => handleOpenArchiveModal(student)}
                            title={student.active ? 'Archiver l’élève' : 'Réactiver l’élève'}
                            className={`p-1.5 rounded transition-colors ${
                              student.active
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {student.active ? (
                              <Archive className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale d'ajout ou modification d'élève */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        studentToEdit={studentToEdit}
        classes={classes}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleStudentSaved}
        onClassCreated={handleClassCreated}
      />

      {/* Modale de fiche détaillée d'élève */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        student={selectedStudentForDetail}
        className={
          selectedStudentForDetail
            ? classMap.get(selectedStudentForDetail.schoolClassId) || 'Non assignée'
            : undefined
        }
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEditModal}
        onToggleArchive={handleOpenArchiveModal}
      />

      {/* Modale de confirmation d'archivage ou réactivation */}
      <StudentArchiveModal
        isOpen={isArchiveModalOpen}
        student={studentToArchive}
        onClose={() => setIsArchiveModalOpen(false)}
        onSuccess={handleArchiveSuccess}
      />
    </div>
  );
};
