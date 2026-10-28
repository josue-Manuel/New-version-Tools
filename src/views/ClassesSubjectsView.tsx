import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Scale,
} from 'lucide-react';
import { SchoolClass, Subject, ClassSubject } from '../core/models/types';

export const ClassesSubjectsView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    schoolLevels,
    activeYear,
    saveClass,
    deleteClass,
    subjects,
    classSubjects,
    saveSubject,
    saveClassSubject,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'classes' | 'coefficients' | 'subjects'>('coefficients');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // New class state
  const [newClass, setNewClass] = useState<Partial<SchoolClass>>({
    name: 'Terminale A4',
    schoolLevelId: schoolLevels[0]?.id || '',
    capacity: 35,
    classTeacherName: '',
  });

  // New subject state
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    code: '',
    schoolLevelId: schoolLevels[0]?.id || '',
    defaultCoefficient: 2,
    gradingScale: 20,
    category: 'general',
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.schoolLevelId) return;

    const classId = `cls_${Date.now()}`;
    const toSave: SchoolClass = {
      id: classId,
      name: newClass.name,
      schoolLevelId: newClass.schoolLevelId,
      academicYearId: activeYear?.id || '',
      capacity: Number(newClass.capacity) || 35,
      classTeacherName: newClass.classTeacherName,
    };

    await saveClass(toSave);

    // Initialiser les matières pour cette classe à partir des matières du niveau
    const levelSubjects = subjects.filter((s) => s.schoolLevelId === toSave.schoolLevelId);
    for (const sub of levelSubjects) {
      await saveClassSubject({
        id: `cs_${classId}_${sub.id}`,
        schoolClassId: classId,
        subjectId: sub.id,
        coefficient: sub.defaultCoefficient,
        teacherName: sub.teacherName,
      });
    }

    setIsClassModalOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.code) return;

    const toSave: Subject = {
      id: `sub_${Date.now()}`,
      name: newSubject.name,
      code: newSubject.code.toUpperCase(),
      schoolLevelId: newSubject.schoolLevelId || schoolLevels[0]?.id || '',
      defaultCoefficient: Number(newSubject.defaultCoefficient) || 2,
      gradingScale: Number(newSubject.gradingScale) || 20,
      category: newSubject.category || 'general',
    };

    await saveSubject(toSave);
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1446A0]" />
              <span>Classes, Matières & Barèmes Nationaux</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Association des disciplines, coefficients officiels et structures pédagogiques
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="h-8 px-3.5 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Classe</span>
            </button>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="h-8 px-3 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#1446A0]" />
              <span>Nouvelle Matière</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-4 flex items-center gap-1 border-b border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('coefficients')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'coefficients'
                ? 'border-[#1446A0] text-[#1446A0]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Coefficients de la Classe ({classSubjects.length} matières)
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'classes'
                ? 'border-[#1446A0] text-[#1446A0]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Liste des Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'border-[#1446A0] text-[#1446A0]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Catalogue Général des Matières ({subjects.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'coefficients' && (
          <div className="bg-white rounded-[4px] border border-[#CBD5E1] p-5 shadow-xs max-w-4xl">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#1446A0]" />
                  <span>Coefficients Appliqués pour le Calcul des Moyennes</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Poids de chaque discipline pour la classe active. Les modifications sont enregistrées immédiatement.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-[#CBD5E1]">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1]">
                <tr className="h-8 text-[#475569] uppercase font-semibold text-[11px]">
                  <th className="px-3">Matière</th>
                  <th className="px-2 text-center w-24">Code</th>
                  <th className="px-3">Professeur Titulaire</th>
                  <th className="px-2 text-center w-24">Barème</th>
                  <th className="px-3 text-center w-36">Coefficient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {classSubjects.map((cs) => (
                  <tr key={cs.id} className="h-9 hover:bg-[#F8FAFC]">
                    <td className="px-3 font-semibold text-[#0F172A]">{cs.subject.name}</td>
                    <td className="px-2 text-center font-mono text-[11px] font-bold text-[#1446A0]">
                      {cs.subject.code}
                    </td>
                    <td className="px-3 text-[#475569]">{cs.teacherName || cs.subject.teacherName || '—'}</td>
                    <td className="px-2 text-center text-[#64748B] font-mono-tabular">
                      /{cs.subject.gradingScale}
                    </td>
                    <td className="px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={cs.coefficient}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            saveClassSubject({ ...cs, coefficient: val });
                          }
                        }}
                        className="w-16 h-7 text-center font-bold tabular-nums bg-white border border-[#CBD5E1] rounded-[3px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="bg-white rounded-[4px] border border-[#CBD5E1] overflow-hidden max-w-4xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1]">
                <tr className="h-8 text-[#475569] uppercase font-semibold text-[11px]">
                  <th className="px-3">Nom de la Classe</th>
                  <th className="px-3">Niveau Éducatif</th>
                  <th className="px-3">Professeur Principal</th>
                  <th className="px-2 text-center w-24">Capacité</th>
                  <th className="px-2 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {classes.map((c) => {
                  const lvl = schoolLevels.find((l) => l.id === c.schoolLevelId);
                  return (
                    <tr key={c.id} className="h-9 hover:bg-[#F8FAFC]">
                      <td className="px-3 font-bold text-[#0F172A]">{c.name}</td>
                      <td className="px-3 text-[#475569]">{lvl?.name || '—'}</td>
                      <td className="px-3 text-[#334155]">{c.classTeacherName || 'Non désigné'}</td>
                      <td className="px-2 text-center tabular-nums text-[#64748B]">{c.capacity || 35} élèves</td>
                      <td className="px-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Confirmer la suppression de la classe "${c.name}" ?`)) {
                              deleteClass(c.id);
                            }
                          }}
                          className="p-1 rounded text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                          title="Supprimer la classe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white rounded-[4px] border border-[#CBD5E1] overflow-hidden max-w-4xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1]">
                <tr className="h-8 text-[#475569] uppercase font-semibold text-[11px]">
                  <th className="px-3">Intitulé de la Matière</th>
                  <th className="px-2 text-center w-24">Code</th>
                  <th className="px-3">Niveau d'Enseignement</th>
                  <th className="px-2 text-center w-28">Coef Standard</th>
                  <th className="px-2 text-center w-24">Barème</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {subjects.map((s) => {
                  const lvl = schoolLevels.find((l) => l.id === s.schoolLevelId);
                  return (
                    <tr key={s.id} className="h-9 hover:bg-[#F8FAFC]">
                      <td className="px-3 font-semibold text-[#0F172A]">{s.name}</td>
                      <td className="px-2 text-center font-mono text-[11px] font-bold text-[#1446A0]">{s.code}</td>
                      <td className="px-3 text-[#475569]">{lvl?.name || 'Tous niveaux'}</td>
                      <td className="px-2 text-center font-bold tabular-nums text-[#0F172A]">{s.defaultCoefficient}</td>
                      <td className="px-2 text-center font-mono-tabular text-[#64748B]">/{s.gradingScale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Créer une Nouvelle Classe</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-[#A1BAFF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                  Intitulé de la Classe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Première C, 4ème B, CE2 A"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                  Niveau Éducatif *
                </label>
                <select
                  value={newClass.schoolLevelId}
                  onChange={(e) => setNewClass({ ...newClass, schoolLevelId: e.target.value })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                >
                  {schoolLevels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.levelType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Capacité Maximum
                  </label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Professeur Principal
                  </label>
                  <input
                    type="text"
                    placeholder="M. Moukassa"
                    value={newClass.classTeacherName}
                    onChange={(e) => setNewClass({ ...newClass, classTeacherName: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white shadow-xs"
                >
                  Enregistrer la Classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Créer une Nouvelle Discipline</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-[#A1BAFF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Nom de la Matière *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sciences Économiques"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SES"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Coefficient Standard
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSubject.defaultCoefficient}
                    onChange={(e) => setNewSubject({ ...newSubject, defaultCoefficient: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Barème par défaut
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newSubject.gradingScale}
                    onChange={(e) => setNewSubject({ ...newSubject, gradingScale: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white shadow-xs"
                >
                  Enregistrer Discipline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
