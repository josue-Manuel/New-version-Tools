import React, { useState, useRef, useMemo } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Search,
  Download,
  AlertTriangle,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';

export const GradesMatrixView: React.FC = () => {
  const {
    currentSeries,
    currentClassStudents,
    trimester,
    gradesRecord,
    updateGradeCell,
    selectedStudentId,
    setSelectedStudentId,
    setActiveModule,
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'admitted' | 'failing' | 'honors'>('all');
  const [editingCell, setEditingCell] = useState<{ studentId: string; subjectId: string } | null>(null);
  const [invalidCellError, setInvalidCellError] = useState<{ studentId: string; subjectId: string; msg: string } | null>(null);

  // Grid navigation refs: key is `${studentIndex}-${subjectIndex}`
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Filter students based on search query and status filter
  const filteredStudents = useMemo(() => {
    return currentClassStudents.filter((student) => {
      const recordKey = `${student.id}-T${trimester}`;
      const record = gradesRecord[recordKey];
      const avg = record?.generalAverage ?? null;

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        student.lastName.toLowerCase().includes(query) ||
        student.firstName.toLowerCase().includes(query) ||
        student.matricule.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Filter modes
      if (filterMode === 'admitted') return avg !== null && avg >= 10.0;
      if (filterMode === 'failing') return avg !== null && avg < 10.0;
      if (filterMode === 'honors') return avg !== null && avg >= 14.0;
      return true;
    });
  }, [currentClassStudents, trimester, gradesRecord, searchQuery, filterMode]);

  // Compute class statistics
  const stats = useMemo(() => {
    let sum = 0;
    let count = 0;
    let max = -1;
    let min = 21;
    let admittedCount = 0;

    currentClassStudents.forEach((student) => {
      const recordKey = `${student.id}-T${trimester}`;
      const avg = gradesRecord[recordKey]?.generalAverage;
      if (avg !== null && avg !== undefined) {
        sum += avg;
        count++;
        if (avg > max) max = avg;
        if (avg < min) min = avg;
        if (avg >= 10.0) admittedCount++;
      }
    });

    const classAverage = count > 0 ? (sum / count).toFixed(2) : '—';
    const passRate = count > 0 ? Math.round((admittedCount / count) * 100) : 0;

    return {
      total: currentClassStudents.length,
      evaluated: count,
      classAverage,
      passRate,
      max: max >= 0 ? max.toFixed(2) : '—',
      min: min <= 20 ? min.toFixed(2) : '—',
    };
  }, [currentClassStudents, trimester, gradesRecord]);

  // Keyboard navigation handler inside the grid
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    subjectIdx: number
  ) => {
    const totalStudents = filteredStudents.length;
    const totalSubjects = currentSeries.subjects.length;

    let targetSIdx = studentIdx;
    let targetSubIdx = subjectIdx;

    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      if (subjectIdx < totalSubjects - 1) {
        targetSubIdx = subjectIdx + 1;
      } else if (studentIdx < totalStudents - 1) {
        targetSIdx = studentIdx + 1;
        targetSubIdx = 0;
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      if (subjectIdx > 0) {
        targetSubIdx = subjectIdx - 1;
      } else if (studentIdx > 0) {
        targetSIdx = studentIdx - 1;
        targetSubIdx = totalSubjects - 1;
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

    if (targetSIdx !== studentIdx || targetSubIdx !== subjectIdx) {
      const targetKey = `${targetSIdx}-${targetSubIdx}`;
      inputRefs.current[targetKey]?.focus();
      inputRefs.current[targetKey]?.select();
    }
  };

  // Grade input change handler with strict Congolese baccalaureate validation (0.00 to 20.00)
  const handleGradeChange = (studentId: string, subjectId: string, rawVal: string) => {
    if (rawVal === '') {
      updateGradeCell(studentId, trimester, subjectId, null);
      setInvalidCellError(null);
      return;
    }

    const cleaned = rawVal.replace(',', '.');
    const num = parseFloat(cleaned);

    if (isNaN(num)) {
      setInvalidCellError({ studentId, subjectId, msg: 'Valeur non numérique' });
      return;
    }

    if (num < 0 || num > 20) {
      // Out-of-scale error immediately flagged in red per design spec
      setInvalidCellError({
        studentId,
        subjectId,
        msg: `Note hors-barème (${num}/20). Le standard congolais est strictly borné de 0 à 20.`,
      });
      return;
    }

    setInvalidCellError(null);
    updateGradeCell(studentId, trimester, subjectId, num);
  };

  // Export class ledger to CSV
  const handleExportCSV = () => {
    const headers = [
      'Matricule',
      'Nom',
      'Prenom',
      'Sexe',
      ...currentSeries.subjects.map((s) => `${s.shortName} (Coef ${s.coefficient})`),
      'Points Pondérés',
      'Moyenne /20',
      'Rang',
      'Mention',
      'Decision Conseil',
    ];

    const rows = currentClassStudents.map((st) => {
      const record = gradesRecord[`${st.id}-T${trimester}`];
      return [
        st.matricule,
        st.lastName,
        st.firstName,
        st.gender,
        ...currentSeries.subjects.map((sub) => {
          const val = record?.grades[sub.id]?.finalMark;
          return val !== null && val !== undefined ? val.toFixed(2) : '';
        }),
        record?.totalWeightedPoints ?? '',
        record?.generalAverage !== null && record?.generalAverage !== undefined ? record.generalAverage.toFixed(2) : '',
        record?.rank ?? '',
        record?.mention ?? '',
        `"${record?.councilDecision ?? ''}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Releve_Notes_${currentSeries.id}_T${trimester}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* KPI & Summary Strip */}
      <div className="p-4 border-b border-[#E2E8F0] bg-[#FFFFFF] shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Stat 1: Effectif */}
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Effectif Inscrit
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold tabular-nums text-[#0F172A]">{stats.total}</span>
              <span className="text-xs text-[#64748B]">élèves ({currentSeries.id})</span>
            </div>
          </div>

          {/* Stat 2: Moyenne de Classe */}
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Moyenne Trimestrielle
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold tabular-nums text-[#1446A0]">
                {stats.classAverage}
              </span>
              <span className="text-xs text-[#64748B]">/ 20.00</span>
            </div>
          </div>

          {/* Stat 3: Taux de Réussite */}
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Taux d'Admission (≥ 10)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold tabular-nums ${stats.passRate >= 60 ? 'text-[#059669]' : 'text-[#D97706]'}`}>
                {stats.passRate}%
              </span>
              <span className="text-xs text-[#64748B]">au 1er tour</span>
            </div>
          </div>

          {/* Stat 4: Max / Min */}
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Fourchette Notes
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold tabular-nums">
              <span className="text-[#059669] flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {stats.max}
              </span>
              <span className="text-[#CBD5E1]">/</span>
              <span className="text-[#DC2626] flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {stats.min}
              </span>
            </div>
          </div>

          {/* Stat 5: Coefficients */}
          <div className="px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] col-span-2 md:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Total Coefficients
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold tabular-nums text-[#0F172A]">
                {currentSeries.totalCoefficients}
              </span>
              <span className="text-xs text-[#64748B]">points pondérés</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filtering Bar */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher nom, prénom ou matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[34px] pl-8 pr-3 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1446A0] focus:ring-1 focus:ring-[#1446A0] focus:outline-none"
            />
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[4px] border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#FFFFFF] text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Tous ({currentClassStudents.length})
            </button>
            <button
              onClick={() => setFilterMode('admitted')}
              className={`px-3 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMode === 'admitted'
                  ? 'bg-[#FFFFFF] text-[#059669] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Admis (≥ 10)
            </button>
            <button
              onClick={() => setFilterMode('honors')}
              className={`px-3 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMode === 'honors'
                  ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Honneur (≥ 14)
            </button>
            <button
              onClick={() => setFilterMode('failing')}
              className={`px-3 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMode === 'failing'
                  ? 'bg-[#FFFFFF] text-[#DC2626] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Ajournés (&lt; 10)
            </button>
          </div>

          {/* Right Action: CSV Export */}
          <button
            onClick={handleExportCSV}
            className="h-[34px] px-3 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            title="Exporter la matrice de notes au format CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#1446A0]" />
            <span>Exporter Procès-Verbal (CSV)</span>
          </button>
        </div>

        {/* Live Validation Alert Banner if user entered mark > 20 */}
        {invalidCellError && (
          <div className="mt-2 px-3 py-2 bg-[#FEF2F2] border border-[#DC2626] rounded-[4px] text-xs text-[#991B1B] flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="font-semibold">Erreur de saisie :</span>
            <span>{invalidCellError.msg}</span>
          </div>
        )}
      </div>

      {/* Main Dense Ledger Data Table */}
      <div className="flex-1 overflow-auto relative bg-[#FFFFFF]">
        <table className="w-full border-collapse text-left ledger-table">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs select-none">
            <tr className="h-8">
              {/* Sticky Columns */}
              <th className="sticky left-0 z-30 bg-[#F1F5F9] w-12 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Rang
              </th>
              <th className="sticky left-12 z-30 bg-[#F1F5F9] w-36 px-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Matricule
              </th>
              <th className="sticky left-48 z-30 bg-[#F1F5F9] min-w-[200px] px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r-2 border-[#CBD5E1]">
                Nom & Prénoms de l'Élève
              </th>

              {/* Dynamic Subject Columns with Official Coefficients */}
              {currentSeries.subjects.map((sub) => (
                <th
                  key={sub.id}
                  className="w-24 px-1.5 py-1 text-center border-r border-[#CBD5E1] bg-[#F1F5F9]"
                  title={`${sub.name} — Coef: ${sub.coefficient} (${sub.teacherName})`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1E3A8A]">
                    {sub.shortName}
                  </div>
                  <div className="text-[10px] text-[#64748B] tabular-nums font-normal">
                    Coef {sub.coefficient}
                  </div>
                </th>
              ))}

              {/* Calculated Results Columns */}
              <th className="w-24 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] bg-[#E9EDFF]">
                Total Pts
              </th>
              <th className="w-24 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1446A0] border-r border-[#CBD5E1] bg-[#E0E8FF]">
                Moyenne /20
              </th>
              <th className="w-28 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Mention
              </th>
              <th className="min-w-[180px] px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                Avis & Décision du Conseil
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#E2E8F0] text-xs">
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + currentSeries.subjects.length + 4}
                  className="py-12 text-center text-[#64748B]"
                >
                  Aucun élève ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, studentIndex) => {
                const recordKey = `${student.id}-T${trimester}`;
                const record = gradesRecord[recordKey];
                const avg = record?.generalAverage ?? null;
                const isSelected = selectedStudentId === student.id;

                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`h-9 transition-colors group cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-l-[3px] border-l-[#1446A0]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* Sticky Rank */}
                    <td className="sticky left-0 z-10 bg-inherit px-2 text-center tabular-nums font-semibold text-[#0F172A] border-r border-[#CBD5E1]">
                      {record?.rank ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-[2px] bg-[#F1F5F9] text-[11px]">
                          {record.rank}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Sticky Matricule */}
                    <td className="sticky left-12 z-10 bg-inherit px-2.5 font-mono-tabular text-[11px] text-[#475569] border-r border-[#CBD5E1] whitespace-nowrap">
                      {student.matricule}
                    </td>

                    {/* Sticky Student Name */}
                    <td className="sticky left-48 z-10 bg-inherit px-3 border-r-2 border-[#CBD5E1] whitespace-nowrap">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0F172A] truncate">
                          {student.lastName} {student.firstName}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(student.id);
                            setActiveModule('bulletins');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#1446A0] hover:text-[#0F357D] p-0.5 rounded transition-opacity"
                          title="Voir le Bulletin Officiel"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Dynamic Grade Input Cells */}
                    {currentSeries.subjects.map((sub, subjectIndex) => {
                      const gradeObj = record?.grades[sub.id];
                      const val = gradeObj?.finalMark;
                      const hasError =
                        invalidCellError?.studentId === student.id &&
                        invalidCellError?.subjectId === sub.id;
                      const isEditing =
                        editingCell?.studentId === student.id &&
                        editingCell?.subjectId === sub.id;

                      const gridKey = `${studentIndex}-${subjectIndex}`;

                      return (
                        <td
                          key={sub.id}
                          className={`p-0 text-center border-r border-[#CBD5E1] transition-colors relative ${
                            hasError ? 'bg-[#FEF2F2]' : ''
                          }`}
                        >
                          <input
                            ref={(el) => {
                              inputRefs.current[gridKey] = el;
                            }}
                            type="text"
                            inputMode="decimal"
                            defaultValue={val !== null && val !== undefined ? val.toFixed(1) : ''}
                            onFocus={() => {
                              setEditingCell({ studentId: student.id, subjectId: sub.id });
                            }}
                            onBlur={(e) => {
                              handleGradeChange(student.id, sub.id, e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, studentIndex, subjectIndex)}
                            className={`w-full h-8 text-center text-xs tabular-nums font-semibold focus:outline-none transition-all ${
                              hasError
                                ? 'bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626]'
                                : isEditing
                                ? 'bg-[#FFFFFF] ring-2 ring-[#1446A0] text-[#0F172A]'
                                : val !== null && val !== undefined
                                ? val < 10
                                  ? 'text-[#DC2626]'
                                  : val >= 14
                                  ? 'text-[#1446A0] font-bold'
                                  : 'text-[#0F172A]'
                                : 'text-[#94A3B8]'
                            }`}
                            placeholder="—"
                          />
                        </td>
                      );
                    })}

                    {/* Calculated: Total Points Pondérés */}
                    <td className="px-2 text-center tabular-nums font-semibold text-[#334155] border-r border-[#CBD5E1] bg-[#F8FAFC]">
                      {record?.totalWeightedPoints ? record.totalWeightedPoints.toFixed(1) : '—'}
                    </td>

                    {/* Calculated: Moyenne Générale /20 */}
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

                    {/* Mention */}
                    <td className="px-2 text-center border-r border-[#CBD5E1]">
                      {record?.mention && record.mention !== '—' ? (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-[0.04em] ${
                            record.mention === 'Très Bien'
                              ? 'bg-[#1446A0] text-white'
                              : record.mention === 'Bien'
                              ? 'bg-[#E0E8FF] text-[#00307A]'
                              : record.mention === 'Assez Bien'
                              ? 'bg-[#ECFDF5] text-[#065F46]'
                              : record.mention === 'Passable'
                              ? 'bg-[#F1F5F9] text-[#334155]'
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                          }`}
                        >
                          {record.mention}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Decision / Appreciation */}
                    <td className="px-3 text-[11px] text-[#475569] truncate max-w-xs">
                      {record?.councilDecision || 'En cours d’évaluation'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Keyboard Shortcuts Help Footer */}
      <div className="h-7 px-4 bg-[#F1F5F9] border-t border-[#CBD5E1] flex items-center justify-between text-[11px] text-[#64748B] select-none no-print">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="px-1 py-0.2 rounded bg-white border border-[#CBD5E1] font-mono text-[10px] text-[#0F172A]">
              Tab / Entrée / Flèches
            </span>
            <span>Navigation rapide sans souris</span>
          </span>
          <span className="text-[#CBD5E1]">·</span>
          <span>Échelle : 0.00 à 20.00</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="text-[#1446A0] font-medium">Validation instantanée des coefficients</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{filteredStudents.length} élèves affichés</span>
        </div>
      </div>
    </div>
  );
};
