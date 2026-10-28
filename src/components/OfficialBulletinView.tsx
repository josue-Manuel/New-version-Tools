import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  FileText,
  Printer,
  Award,
  CheckCircle,
  Building2,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const OfficialBulletinView: React.FC = () => {
  const {
    currentSeries,
    currentClassStudents,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    trimester,
    setTrimester,
    gradesRecord,
    schoolProfile,
  } = useAcademic();

  const [viewMode, setViewMode] = useState<'individual' | 'bordereau'>('individual');

  // Active student's trimester record
  const studentRecord = selectedStudent ? gradesRecord[`${selectedStudent.id}-T${trimester}`] : null;

  // Compute class stats for each subject (min, max, average)
  const subjectClassStats = React.useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number }> = {};

    currentSeries.subjects.forEach((sub) => {
      let sum = 0;
      let count = 0;
      let min = 21;
      let max = -1;

      currentClassStudents.forEach((st) => {
        const mark = gradesRecord[`${st.id}-T${trimester}`]?.grades[sub.id]?.finalMark;
        if (mark !== null && mark !== undefined) {
          sum += mark;
          count++;
          if (mark < min) min = mark;
          if (mark > max) max = mark;
        }
      });

      stats[sub.id] = {
        min: min <= 20 ? min : 0,
        max: max >= 0 ? max : 0,
        avg: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
      };
    });

    return stats;
  }, [currentSeries, currentClassStudents, trimester, gradesRecord]);

  // Navigate next/previous student
  const currentIndex = currentClassStudents.findIndex((s) => s.id === selectedStudentId);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(currentClassStudents[currentIndex - 1].id);
    }
  };
  const handleNextStudent = () => {
    if (currentIndex < currentClassStudents.length - 1) {
      setSelectedStudentId(currentClassStudents[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
      {/* Control Bar (Hidden on print) */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs no-print flex flex-wrap items-center justify-between gap-3">
        {/* Switch between individual bulletin & ministerial bordereau */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-[4px] border border-[#CBD5E1] bg-[#F1F5F9] p-0.5 text-xs">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-[#1446A0] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Bulletin Individuel
            </button>
            <button
              onClick={() => setViewMode('bordereau')}
              className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                viewMode === 'bordereau'
                  ? 'bg-[#1446A0] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Bordereau Récapitulatif DDEPS
            </button>
          </div>

          {/* Student Selector in individual view */}
          {viewMode === 'individual' && (
            <div className="flex items-center gap-1.5 ml-3">
              <button
                onClick={handlePrevStudent}
                disabled={currentIndex <= 0}
                className="p-1 rounded-[3px] border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
                title="Élève précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="h-8 px-2.5 text-xs font-semibold bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
              >
                {currentClassStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.lastName} {s.firstName} ({s.matricule})
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextStudent}
                disabled={currentIndex >= currentClassStudents.length - 1}
                className="p-1 rounded-[3px] border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
                title="Élève suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-[#64748B] ml-1">
                ({currentIndex + 1} / {currentClassStudents.length})
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="h-8 px-3.5 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Document Officiel</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-8 flex justify-center">
        {viewMode === 'individual' ? (
          /* INDIVIDUAL BULLETIN */
          selectedStudent ? (
            <div className="w-full max-w-4xl bg-white p-8 border border-[#CBD5E1] shadow-md rounded-[2px] text-[#0F172A]">
              {/* Institutional Republic Header */}
              <div className="grid grid-cols-3 items-center border-b-2 border-[#0A1D3D] pb-4">
                {/* Left: Ministry Identification */}
                <div className="text-left text-[11px] leading-tight space-y-0.5">
                  <div className="font-bold text-[#0A1D3D] uppercase">
                    RÉPUBLIQUE DU CONGO
                  </div>
                  <div className="text-[10px] text-[#64748B] italic">Unité · Travail · Progrès</div>
                  <div className="text-[10px] font-medium text-[#334155] pt-1">
                    {schoolProfile.ministry}
                  </div>
                  <div className="text-[10px] font-semibold text-[#1446A0]">
                    {schoolProfile.direction}
                  </div>
                </div>

                {/* Center: School Emblem / Crest */}
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full border-2 border-[#1446A0] bg-[#F1F5F9] flex items-center justify-center font-black text-[#1446A0] text-lg shadow-xs">
                    LVA
                  </div>
                  <div className="text-sm font-black uppercase text-[#0A1D3D] mt-1 tracking-wide">
                    {schoolProfile.name}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {schoolProfile.city} · {schoolProfile.district}
                  </div>
                </div>

                {/* Right: Academic Year & Code */}
                <div className="text-right text-[11px] leading-tight space-y-0.5">
                  <div className="text-[10px] text-[#64748B] uppercase font-bold">Année Scolaire</div>
                  <div className="text-sm font-black text-[#1446A0] tabular-nums">
                    {schoolProfile.academicYear}
                  </div>
                  <div className="text-[10px] text-[#475569] font-mono-tabular pt-1">
                    Code Établissement : {schoolProfile.code}
                  </div>
                  <div className="text-[10px] text-[#059669] font-bold">
                    ENSEIGNEMENT SECONDAIRE GÉNÉRAL
                  </div>
                </div>
              </div>

              {/* Title Banner */}
              <div className="my-4 py-2 bg-[#F1F5F9] border-y border-[#CBD5E1] text-center">
                <h1 className="text-base font-black uppercase tracking-wider text-[#0A1D3D]">
                  BULLETIN DE NOTES DU {trimester}ᵉʳ TRIMESTRE
                </h1>
                <div className="text-xs text-[#475569] font-medium">
                  {currentSeries.name} — Session d'Évaluation Trimestrielle
                </div>
              </div>

              {/* Student Identity Ledger Box */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] mb-4 text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#64748B] block">
                      Matricule National
                    </span>
                    <span className="font-mono-tabular font-bold text-sm text-[#1446A0]">
                      {selectedStudent.matricule}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#64748B] block">
                      Nom & Prénoms de l'Élève
                    </span>
                    <span className="font-bold text-sm text-[#0F172A]">
                      {selectedStudent.lastName} {selectedStudent.firstName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#64748B] block">
                      Date & Lieu de Naissance
                    </span>
                    <span className="font-medium text-[#334155]">
                      {selectedStudent.birthDate} à {selectedStudent.birthPlace}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#64748B] block">
                      Sexe & Statut
                    </span>
                    <span className="font-medium text-[#334155]">
                      {selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'} · {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Grade Table */}
              <table className="w-full border-collapse border border-[#CBD5E1] text-xs mb-4">
                <thead>
                  <tr className="h-8 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                    <th className="px-3 py-1 text-left border-r border-[#CBD5E1]">Disciplines</th>
                    <th className="px-2 py-1 text-left border-r border-[#CBD5E1]">Enseignant Titulaire</th>
                    <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-20">Note /20</th>
                    <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-14">Coef</th>
                    <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-20">Points</th>
                    <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-28">Moy. Classe</th>
                    <th className="px-3 py-1 text-left">Appréciation de l'Enseignant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {currentSeries.subjects.map((sub) => {
                    const gradeObj = studentRecord?.grades[sub.id];
                    const mark = gradeObj?.finalMark;
                    const points = mark !== null && mark !== undefined ? (mark * sub.coefficient).toFixed(1) : '—';
                    const stats = subjectClassStats[sub.id];

                    return (
                      <tr key={sub.id} className="h-8 hover:bg-[#F8FAFC]">
                        <td className="px-3 font-semibold text-[#0F172A] border-r border-[#CBD5E1]">
                          {sub.name}
                        </td>
                        <td className="px-2 text-[#475569] text-[11px] border-r border-[#CBD5E1]">
                          {sub.teacherName}
                        </td>
                        <td
                          className={`px-2 text-center tabular-nums font-bold border-r border-[#CBD5E1] ${
                            mark !== null && mark !== undefined
                              ? mark < 10
                                ? 'text-[#DC2626]'
                                : mark >= 14
                                ? 'text-[#1446A0]'
                                : 'text-[#0F172A]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {mark !== null && mark !== undefined ? mark.toFixed(1) : '—'}
                        </td>
                        <td className="px-2 text-center tabular-nums font-semibold text-[#475569] border-r border-[#CBD5E1]">
                          {sub.coefficient}
                        </td>
                        <td className="px-2 text-center tabular-nums font-bold text-[#0F172A] border-r border-[#CBD5E1]">
                          {points}
                        </td>
                        <td className="px-2 text-center tabular-nums text-[10px] text-[#64748B] border-r border-[#CBD5E1]">
                          <span>{stats?.avg.toFixed(1)}</span>
                          <span className="text-[#CBD5E1] mx-1">·</span>
                          <span>[{stats?.min.toFixed(1)} - {stats?.max.toFixed(1)}]</span>
                        </td>
                        <td className="px-3 text-[11px] text-[#334155] italic">
                          {gradeObj?.appreciation || (mark && mark >= 10 ? 'Travail régulier' : 'Fournir plus d’efforts')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Bottom Summary & Deliberation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Academic Calculation Recap */}
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#1446A0] border-b border-[#E2E8F0] pb-1">
                    Bilan Mathématique & Classement
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Total Coefficients Nationaux :</span>
                    <span className="font-bold tabular-nums text-[#0F172A]">{currentSeries.totalCoefficients}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Total Points Pondérés Obtenus :</span>
                    <span className="font-bold tabular-nums text-[#0F172A]">
                      {studentRecord?.totalWeightedPoints ? studentRecord.totalWeightedPoints.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-[#CBD5E1] bg-[#EFF6FF] px-2 rounded-[2px]">
                    <span className="font-bold text-[#00307A]">MOYENNE GÉNÉRALE DU TRIMESTRE :</span>
                    <span className="text-base font-black tabular-nums text-[#1446A0]">
                      {studentRecord?.generalAverage !== null && studentRecord?.generalAverage !== undefined
                        ? `${studentRecord.generalAverage.toFixed(2)} / 20.00`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Rang de l'Élève :</span>
                    <span className="font-bold text-[#0F172A]">
                      {studentRecord?.rank ? `${studentRecord.rank}ᵉ sur ${currentClassStudents.length} élèves` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Mention Attribuée :</span>
                    <span className="font-bold text-[#1446A0] uppercase">{studentRecord?.mention || '—'}</span>
                  </div>
                </div>

                {/* Discipline & Council Deliberation */}
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#1446A0] border-b border-[#E2E8F0] pb-1">
                    Assiduité & Décision du Conseil
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Note de Conduite :</span>
                    <span className="font-bold tabular-nums text-[#059669]">{selectedStudent.conductScore.toFixed(1)} / 20</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#64748B]">Absences Non Justifiées :</span>
                    <span className="font-bold tabular-nums text-[#0F172A]">{selectedStudent.unexcusedAbsences} heures</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">
                      Avis du Conseil des Professeurs :
                    </span>
                    <div className="mt-1 p-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[2px] font-medium text-[#0A1D3D] text-[11px]">
                      {studentRecord?.councilDecision || 'Délibération en cours'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div className="mt-6 pt-6 border-t-2 border-[#0A1D3D] grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="font-bold text-[#475569] block mb-1">Le Professeur Principal</span>
                  <span className="text-[10px] text-[#64748B] block mb-8">Visa & Observations</span>
                  <div className="h-8 border-b border-dashed border-[#CBD5E1]"></div>
                </div>

                <div>
                  <span className="font-bold text-[#475569] block mb-1">Le Directeur des Études</span>
                  <span className="text-[10px] text-[#64748B] block mb-8">Vérification des Coefficients</span>
                  <div className="h-8 border-b border-dashed border-[#CBD5E1]"></div>
                </div>

                <div>
                  <span className="font-bold text-[#0A1D3D] block mb-1">Le Proviseur du Lycée</span>
                  <span className="text-[10px] text-[#64748B] block mb-2">{schoolProfile.directorName}</span>
                  <div className="w-24 h-14 mx-auto border-2 border-double border-[#1446A0] rounded text-[8px] flex flex-col items-center justify-center text-[#1446A0] font-black uppercase p-1">
                    <span>RÉP. DU CONGO</span>
                    <span>SCEAU OFFICIEL</span>
                    <span>LVA POINTE-NOIRE</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B]">Aucun élève sélectionné.</div>
          )
        ) : (
          /* BORDEREAU RÉCAPITULATIF MINISTÉRIEL (MINISTERIAL REPORT) */
          <div className="w-full bg-white p-8 border border-[#CBD5E1] shadow-md rounded-[2px] text-[#0F172A]">
            <div className="border-b-2 border-[#0A1D3D] pb-3 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-[#475569]">
                RÉPUBLIQUE DU CONGO — MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE
              </div>
              <div className="text-sm font-black text-[#0A1D3D] uppercase mt-1">
                BORDEREAU RÉCAPITULATIF DE DÉLIBÉRATION TRIMESTRIELLE — DDEPS POINTE-NOIRE
              </div>
              <div className="text-xs text-[#1446A0] font-semibold mt-0.5">
                Établissement : {schoolProfile.name} · Série : {currentSeries.name} · {trimester}ᵉʳ Trimestre · {schoolProfile.academicYear}
              </div>
            </div>

            <table className="w-full border-collapse border border-[#CBD5E1] text-xs mt-4">
              <thead>
                <tr className="h-8 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-semibold uppercase text-[#475569]">
                  <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-12">Rang</th>
                  <th className="px-3 py-1 text-left border-r border-[#CBD5E1] w-36">Matricule</th>
                  <th className="px-3 py-1 text-left border-r border-[#CBD5E1]">Nom & Prénoms</th>
                  <th className="px-2 py-1 text-center border-r border-[#CBD5E1] w-12">Sexe</th>
                  <th className="px-3 py-1 text-center border-r border-[#CBD5E1] w-24">Total Pts</th>
                  <th className="px-3 py-1 text-center border-r border-[#CBD5E1] w-24">Moyenne /20</th>
                  <th className="px-3 py-1 text-center border-r border-[#CBD5E1] w-28">Mention</th>
                  <th className="px-3 py-1 text-left">Décision Officielle du Jury</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {currentClassStudents
                  .slice()
                  .sort((a, b) => {
                    const avgA = gradesRecord[`${a.id}-T${trimester}`]?.generalAverage ?? -1;
                    const avgB = gradesRecord[`${b.id}-T${trimester}`]?.generalAverage ?? -1;
                    return avgB - avgA;
                  })
                  .map((st, idx) => {
                    const rec = gradesRecord[`${st.id}-T${trimester}`];
                    return (
                      <tr key={st.id} className="h-8 hover:bg-[#F8FAFC]">
                        <td className="px-2 text-center font-bold tabular-nums border-r border-[#CBD5E1]">
                          {idx + 1}
                        </td>
                        <td className="px-3 font-mono-tabular text-[11px] font-semibold text-[#1446A0] border-r border-[#CBD5E1]">
                          {st.matricule}
                        </td>
                        <td className="px-3 font-bold text-[#0F172A] border-r border-[#CBD5E1]">
                          {st.lastName} {st.firstName}
                        </td>
                        <td className="px-2 text-center text-[#475569] border-r border-[#CBD5E1]">
                          {st.gender}
                        </td>
                        <td className="px-3 text-center tabular-nums font-semibold text-[#334155] border-r border-[#CBD5E1]">
                          {rec?.totalWeightedPoints ? rec.totalWeightedPoints.toFixed(1) : '—'}
                        </td>
                        <td className="px-3 text-center tabular-nums font-bold text-[#1446A0] border-r border-[#CBD5E1]">
                          {rec?.generalAverage !== null && rec?.generalAverage !== undefined
                            ? rec.generalAverage.toFixed(2)
                            : '—'}
                        </td>
                        <td className="px-3 text-center border-r border-[#CBD5E1]">
                          <span className="font-semibold text-[10px] uppercase">{rec?.mention || '—'}</span>
                        </td>
                        <td className="px-3 text-[11px] text-[#334155]">
                          {rec?.councilDecision || 'Non délibéré'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Validation stamps */}
            <div className="mt-8 pt-4 border-t border-[#CBD5E1] flex justify-between text-xs text-[#475569]">
              <div>
                <span>Fait à Pointe-Noire, le 27 Octobre 2026</span>
              </div>
              <div className="text-right">
                <span className="font-bold block">Le Président du Jury d'Établissement</span>
                <span className="text-[11px] text-[#64748B]">Inspecteur DDEPS / Proviseur</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
