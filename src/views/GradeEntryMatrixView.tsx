import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Plus,
  Search,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  X,
  Layers,
  Award,
} from 'lucide-react';
import { Assessment } from '../core/models/types';
import { validateAssessment, validateGradeInput } from '../core/validation/validators';

export const GradeEntryMatrixView: React.FC = () => {
  const {
    selectedClass,
    selectedPeriod,
    classStudents,
    classSubjects,
    classPeriodAssessments,
    grades,
    saveGradeValue,
    saveAssessment,
    deleteAssessment,
    classPeriodSummaries,
    setSelectedStudentId,
    setActiveView,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [isNewAssessmentModalOpen, setIsNewAssessmentModalOpen] = useState(false);
  const [validationErrorBanner, setValidationErrorBanner] = useState<string | null>(null);

  // New assessment form state
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
    name: 'Devoir Surveillé N°1',
    subjectId: classSubjects[0]?.subjectId || '',
    schoolClassId: selectedClass?.id || '',
    periodId: selectedPeriod?.id || '',
    date: new Date().toISOString().slice(0, 10),
    maxScore: 20,
    coefficient: 1,
  });

  // Grid navigation refs map: `${studentIdx}_${assessmentIdx}`
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter assessments by subject
  const visibleAssessments = useMemo(() => {
    if (selectedSubjectFilter === 'ALL') {
      return classPeriodAssessments;
    }
    return classPeriodAssessments.filter((a) => a.subjectId === selectedSubjectFilter);
  }, [classPeriodAssessments, selectedSubjectFilter]);

  // Index grades by `${studentId}_${assessmentId}`
  const gradeMap = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const g of grades) {
      map.set(`${g.studentId}_${g.assessmentId}`, g.score);
    }
    return map;
  }, [grades]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase().trim();
    return classStudents.filter(
      (s) =>
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
    );
  }, [classStudents, searchQuery]);

  // Handle cell keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    assessmentIdx: number
  ) => {
    const totalStudents = filteredStudents.length;
    const totalAssessments = visibleAssessments.length;

    let targetSIdx = studentIdx;
    let targetAIdx = assessmentIdx;

    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      if (assessmentIdx < totalAssessments - 1) {
        targetAIdx = assessmentIdx + 1;
      } else if (studentIdx < totalStudents - 1) {
        targetSIdx = studentIdx + 1;
        targetAIdx = 0;
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      if (assessmentIdx > 0) {
        targetAIdx = assessmentIdx - 1;
      } else if (studentIdx > 0) {
        targetSIdx = studentIdx - 1;
        targetAIdx = totalAssessments - 1;
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      if (studentIdx < totalStudents - 1) {
        targetSIdx = studentIdx + 1;
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (studentIdx > 0) {
        targetSIdx = studentIdx - 1;
      }
      e.preventDefault();
    }

    if (targetSIdx !== studentIdx || targetAIdx !== assessmentIdx) {
      const targetKey = `${targetSIdx}_${targetAIdx}`;
      inputRefs.current[targetKey]?.focus();
      inputRefs.current[targetKey]?.select();
    }
  };

  // Grade input change with rigorous validation
  const handleGradeBlur = (studentId: string, assessment: Assessment, rawVal: string) => {
    const { valid, score, error } = validateGradeInput(rawVal, assessment.maxScore);

    if (!valid) {
      setValidationErrorBanner(error || 'Note invalide');
      return;
    }

    setValidationErrorBanner(null);
    saveGradeValue(studentId, assessment.id, score);
  };

  // Submit new assessment
  const handleCreateAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assessmentToSave: Assessment = {
      id: `ass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newAssessment.name || 'Évaluation',
      subjectId: newAssessment.subjectId || classSubjects[0]?.subjectId || '',
      schoolClassId: selectedClass?.id || '',
      periodId: selectedPeriod?.id || '',
      date: newAssessment.date || new Date().toISOString().slice(0, 10),
      maxScore: Number(newAssessment.maxScore) || 20,
      coefficient: Number(newAssessment.coefficient) || 1,
    };

    const errors = validateAssessment(assessmentToSave);
    if (errors.length > 0) {
      setValidationErrorBanner(errors[0].message);
      return;
    }

    await saveAssessment(assessmentToSave);
    setIsNewAssessmentModalOpen(false);
  };

  // Class summary stats
  const stats = useMemo(() => {
    const validAverages = classPeriodSummaries
      .map((s) => s.generalAverage)
      .filter((avg): avg is number => avg !== null);

    const count = validAverages.length;
    const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
    const classAvg = count > 0 ? (sum / count).toFixed(2) : '—';
    const admittedCount = validAverages.filter((avg) => avg >= 10.0).length;
    const passRate = count > 0 ? Math.round((admittedCount / count) * 100) : 0;
    const max = count > 0 ? Math.max(...validAverages).toFixed(2) : '—';
    const min = count > 0 ? Math.min(...validAverages).toFixed(2) : '—';

    return { total: classStudents.length, evaluated: count, classAvg, passRate, max, min };
  }, [classPeriodSummaries, classStudents.length]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Action & KPI Strip */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
              Tableau de Saisie des Notes & Délibération
            </h2>
            <p className="text-xs text-[#64748B]">
              Classe : <strong className="text-[#0A1D3D]">{selectedClass?.name}</strong> · Période :{' '}
              <strong className="text-[#1446A0]">{selectedPeriod?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewAssessment({
                  name: `Évaluation ${classPeriodAssessments.length + 1}`,
                  subjectId: classSubjects[0]?.subjectId || '',
                  schoolClassId: selectedClass?.id || '',
                  periodId: selectedPeriod?.id || '',
                  date: new Date().toISOString().slice(0, 10),
                  maxScore: 20,
                  coefficient: 1,
                });
                setIsNewAssessmentModalOpen(true);
              }}
              className="h-[34px] px-3.5 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Évaluation</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#64748B] block">
              Effectif Actif
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold tabular-nums text-[#0F172A]">{stats.total}</span>
              <span className="text-xs text-[#64748B]">élèves</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#64748B] block">
              Moyenne Période
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold tabular-nums text-[#1446A0]">{stats.classAvg}</span>
              <span className="text-xs text-[#64748B]">/ 20</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#64748B] block">
              Taux d'Admission (≥ 10)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-lg font-bold tabular-nums ${stats.passRate >= 60 ? 'text-[#059669]' : 'text-[#D97706]'}`}>
                {stats.passRate}%
              </span>
              <span className="text-xs text-[#64748B]">({stats.evaluated} notés)</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#64748B] block">
              Plus Forte & Faible
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold tabular-nums">
              <span className="text-[#059669] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {stats.max}
              </span>
              <span className="text-[#CBD5E1]">/</span>
              <span className="text-[#DC2626] flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {stats.min}
              </span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#64748B] block">
              Évaluations Créées
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold tabular-nums text-[#0F172A]">
                {classPeriodAssessments.length}
              </span>
              <span className="text-xs text-[#64748B]">épreuves en {selectedPeriod?.shortName}</span>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1446A0] focus:outline-none"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#64748B]">Filtrer matière :</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none font-semibold"
            >
              <option value="ALL">Toutes les Matières ({classSubjects.length})</option>
              {classSubjects.map((cs) => (
                <option key={cs.subjectId} value={cs.subjectId}>
                  {cs.subject.name} (Coef {cs.coefficient})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning Banner */}
        {validationErrorBanner && (
          <div className="mt-2.5 p-2 rounded-[4px] bg-[#FEF2F2] border border-[#DC2626] text-xs text-[#991B1B] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{validationErrorBanner}</span>
            </div>
            <button
              onClick={() => setValidationErrorBanner(null)}
              className="text-[#991B1B] hover:text-[#7F1D1D] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Dense Grid */}
      <div className="flex-1 overflow-auto relative bg-[#FFFFFF]">
        {classStudents.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Aucun élève inscrit dans cette classe. Rendez-vous dans le menu <strong>"Registre des Élèves"</strong> pour ajouter ou importer des élèves.
          </div>
        ) : visibleAssessments.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            <div className="max-w-md mx-auto space-y-3">
              <Layers className="w-8 h-8 text-[#1446A0] mx-auto opacity-70" />
              <p className="font-semibold text-sm text-[#0A1D3D]">
                Aucune évaluation enregistrée pour cette période.
              </p>
              <p>
                Cliquez sur le bouton <strong>"Créer une Évaluation"</strong> ci-dessus pour planifier un devoir surveillé ou une composition trimestrielle.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-left ledger-table">
            <thead className="sticky top-0 z-20 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs select-none">
              <tr className="h-8">
                {/* Frozen Columns */}
                <th className="sticky left-0 z-30 bg-[#F1F5F9] w-12 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  N°
                </th>
                <th className="sticky left-12 z-30 bg-[#F1F5F9] w-36 px-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Matricule
                </th>
                <th className="sticky left-48 z-30 bg-[#F1F5F9] min-w-[200px] px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r-2 border-[#CBD5E1]">
                  Nom & Prénoms de l'Élève
                </th>

                {/* Assessment Columns */}
                {visibleAssessments.map((a) => {
                  const sub = classSubjects.find((cs) => cs.subjectId === a.subjectId);
                  return (
                    <th
                      key={a.id}
                      className="w-28 px-1.5 py-1 text-center border-r border-[#CBD5E1] bg-[#F1F5F9] group relative"
                    >
                      <div className="text-[11px] font-bold text-[#1446A0] uppercase truncate" title={a.name}>
                        {a.name}
                      </div>
                      <div className="text-[10px] text-[#64748B] flex items-center justify-center gap-1 font-mono-tabular">
                        <span>{sub?.subject.code || 'MAT'}</span>
                        <span>·</span>
                        <span>Coef {a.coefficient}</span>
                        <span>·</span>
                        <span>/{a.maxScore}</span>
                      </div>
                      {/* Delete assessment button on hover */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer l'évaluation "${a.name}" et toutes ses notes associées ?`)) {
                            deleteAssessment(a.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute right-1 top-1 text-[#DC2626] hover:bg-[#FEE2E2] p-0.5 rounded transition-opacity cursor-pointer"
                        title="Supprimer cette évaluation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </th>
                  );
                })}

                {/* Calculation Columns */}
                <th className="w-24 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] bg-[#E9EDFF]">
                  Total Pts
                </th>
                <th className="w-24 px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-[#1446A0] border-r border-[#CBD5E1] bg-[#E0E8FF]">
                  Moyenne /20
                </th>
                <th className="w-20 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Rang
                </th>
                <th className="w-24 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Mention
                </th>
                <th className="w-20 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                  Bulletin
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredStudents.map((student, studentIndex) => {
                const summary = classPeriodSummaries.find((s) => s.studentId === student.id);
                const avg = summary?.generalAverage ?? null;

                return (
                  <tr key={student.id} className="h-9 hover:bg-[#F8FAFC] transition-colors">
                    {/* Index */}
                    <td className="sticky left-0 z-10 bg-[#FFFFFF] px-2 text-center tabular-nums font-semibold text-[#64748B] border-r border-[#CBD5E1]">
                      {studentIndex + 1}
                    </td>

                    {/* Matricule */}
                    <td className="sticky left-12 z-10 bg-[#FFFFFF] px-2.5 font-mono-tabular text-[11px] text-[#475569] border-r border-[#CBD5E1] whitespace-nowrap">
                      {student.studentNumber}
                    </td>

                    {/* Nom & Prénoms */}
                    <td className="sticky left-48 z-10 bg-[#FFFFFF] px-3 font-semibold text-[#0F172A] border-r-2 border-[#CBD5E1] whitespace-nowrap">
                      {student.lastName} {student.firstName}
                    </td>

                    {/* Grade Input Cells */}
                    {visibleAssessments.map((assessment, assessmentIndex) => {
                      const score = gradeMap.get(`${student.id}_${assessment.id}`) ?? null;
                      const gridKey = `${studentIndex}_${assessmentIndex}`;

                      return (
                        <td
                          key={assessment.id}
                          className="p-0 text-center border-r border-[#CBD5E1] transition-colors"
                        >
                          <input
                            ref={(el) => {
                              inputRefs.current[gridKey] = el;
                            }}
                            type="text"
                            inputMode="decimal"
                            defaultValue={score !== null && score !== undefined ? score.toString() : ''}
                            onBlur={(e) => handleGradeBlur(student.id, assessment, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, studentIndex, assessmentIndex)}
                            placeholder="—"
                            className={`w-full h-8 text-center text-xs tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-[#1446A0] focus:bg-[#FFFFFF] ${
                              score !== null && score !== undefined
                                ? score < 10
                                  ? 'text-[#DC2626]'
                                  : score >= 14
                                  ? 'text-[#1446A0] font-bold'
                                  : 'text-[#0F172A]'
                                : 'text-[#94A3B8]'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Total Points */}
                    <td className="px-2 text-center tabular-nums font-semibold text-[#334155] border-r border-[#CBD5E1] bg-[#F8FAFC]">
                      {summary?.totalWeightedPoints !== null && summary?.totalWeightedPoints !== undefined
                        ? summary.totalWeightedPoints.toFixed(1)
                        : '—'}
                    </td>

                    {/* Moyenne Générale */}
                    <td
                      className={`px-2 text-center tabular-nums text-sm font-bold border-r border-[#CBD5E1] ${
                        avg !== null
                          ? avg >= 14
                            ? 'text-[#1446A0] bg-[#EFF6FF]'
                            : avg >= 10
                            ? 'text-[#059669] bg-[#ECFDF5]'
                            : 'text-[#DC2626] bg-[#FEF2F2]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {avg !== null ? avg.toFixed(2) : '—'}
                    </td>

                    {/* Rang */}
                    <td className="px-2 text-center tabular-nums font-bold text-[#0F172A] border-r border-[#CBD5E1]">
                      {summary?.rankInClass ? `${summary.rankInClass}ᵉ` : '—'}
                    </td>

                    {/* Mention */}
                    <td className="px-2 text-center border-r border-[#CBD5E1]">
                      <span className="text-[10px] font-bold uppercase text-[#475569]">
                        {summary?.mention || '—'}
                      </span>
                    </td>

                    {/* Action: Open Bulletin */}
                    <td className="px-2 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setActiveView('bulletins');
                        }}
                        className="p-1 rounded-[3px] border border-[#CBD5E1] text-[#1446A0] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                        title="Consulter et imprimer le bulletin scolaire"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Créer une Évaluation */}
      {isNewAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Nouvelle Évaluation Pédagogique</h3>
                <p className="text-[11px] text-[#A1BAFF]">
                  {selectedClass?.name} · {selectedPeriod?.name}
                </p>
              </div>
              <button
                onClick={() => setIsNewAssessmentModalOpen(false)}
                className="text-[#A1BAFF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessmentSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                  Intitulé de l'épreuve *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Devoir Surveillé N°1, Composition Trimestrielle"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                  Matière / Discipline *
                </label>
                <select
                  required
                  value={newAssessment.subjectId}
                  onChange={(e) => setNewAssessment({ ...newAssessment, subjectId: e.target.value })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none font-medium"
                >
                  {classSubjects.map((cs) => (
                    <option key={cs.subjectId} value={cs.subjectId}>
                      {cs.subject.name} (Coef national {cs.coefficient})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Barème Maximum *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newAssessment.maxScore}
                    onChange={(e) => setNewAssessment({ ...newAssessment, maxScore: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold tabular-nums focus:border-[#1446A0] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#64748B]">Généralement 20 (ou 10 au primaire)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Poids / Coefficient *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newAssessment.coefficient}
                    onChange={(e) => setNewAssessment({ ...newAssessment, coefficient: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold tabular-nums focus:border-[#1446A0] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#64748B]">ex: 1 pour devoir, 2 pour composition</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                  Date de passation
                </label>
                <input
                  type="date"
                  value={newAssessment.date}
                  onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAssessmentModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white shadow-xs"
                >
                  Créer l'Évaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
