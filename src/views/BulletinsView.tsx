import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Building2,
} from 'lucide-react';

export const BulletinsView: React.FC = () => {
  const {
    school,
    activeYear,
    selectedClass,
    selectedPeriod,
    classStudents,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    classPeriodSummaries,
    classSubjects,
  } = useSchool();

  // Find summary for selected student
  const summary = classPeriodSummaries.find((s) => s.studentId === selectedStudentId) || classPeriodSummaries[0];

  const currentIndex = classStudents.findIndex((s) => s.id === selectedStudentId);
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(classStudents[currentIndex - 1].id);
    }
  };
  const handleNext = () => {
    if (currentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs no-print flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#475569]">Élève sélectionné :</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1 rounded border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
              title="Élève précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-8 px-2.5 text-xs font-bold bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0A1D3D] focus:border-[#1446A0] focus:outline-none"
            >
              {classStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.lastName} {st.firstName} ({st.studentNumber})
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentIndex >= classStudents.length - 1}
              className="p-1 rounded border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
              title="Élève suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs text-[#64748B] ml-2">
            ({currentIndex + 1} / {classStudents.length} élèves)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="h-8 px-4 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer le Bulletin (Format A4)</span>
          </button>
        </div>
      </div>

      {/* Main A4 Bulletin Container */}
      <div className="p-4 md:p-8 flex justify-center">
        {!selectedStudent ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Aucun élève sélectionné pour la génération du bulletin.
          </div>
        ) : (
          <div className="w-full max-w-[210mm] bg-white p-6 md:p-10 border border-[#CBD5E1] shadow-md rounded-[2px] text-[#0F172A] print:shadow-none print:border-none print:p-0">
            {/* 1. Institutional State Header (Congo-Brazzaville Standard) */}
            <div className="grid grid-cols-3 items-center border-b-2 border-[#0A1D3D] pb-3">
              <div className="text-left text-[10px] leading-tight space-y-0.5">
                <div className="font-bold text-[#0A1D3D] uppercase tracking-wider">
                  RÉPUBLIQUE DU CONGO
                </div>
                <div className="text-[9px] text-[#64748B] italic">Unité · Travail · Progrès</div>
                <div className="text-[9px] text-[#334155] pt-0.5">
                  Ministère de l'Enseignement Primaire, Secondaire et de l'Alphabétisation
                </div>
                <div className="text-[9px] font-semibold text-[#1446A0]">
                  Direction Départementale de Pointe-Noire
                </div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#1446A0] bg-[#F1F5F9] flex items-center justify-center font-black text-[#1446A0] text-sm">
                  NV
                </div>
                <div className="text-xs font-black uppercase text-[#0A1D3D] mt-1 tracking-tight">
                  {school?.name || 'Lycée Victor Augagneur'}
                </div>
                <div className="text-[9px] text-[#64748B]">
                  {school?.city || 'Pointe-Noire'} · Code : {school?.code || '04-PN-LVA'}
                </div>
              </div>

              <div className="text-right text-[10px] leading-tight space-y-0.5">
                <div className="font-bold text-[#64748B] uppercase">Année Scolaire</div>
                <div className="text-sm font-black text-[#1446A0] tabular-nums">
                  {activeYear?.label || '2025 - 2026'}
                </div>
                <div className="text-[9px] text-[#059669] font-bold pt-0.5">
                  RÉGIME GÉNÉRAL OFFICIEL
                </div>
              </div>
            </div>

            {/* 2. Bulletin Title Banner */}
            <div className="my-3 py-1.5 bg-[#F1F5F9] border-y border-[#CBD5E1] text-center">
              <h1 className="text-sm font-black uppercase tracking-wider text-[#0A1D3D]">
                BULLETIN DE NOTES OFFICIEL — {selectedPeriod?.name.toUpperCase()}
              </h1>
              <div className="text-[11px] text-[#475569] font-semibold">
                Classe : {selectedClass?.name}
              </div>
            </div>

            {/* 3. Student Identification Card */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] mb-3 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#64748B] block">Matricule :</span>
                  <span className="font-mono-tabular font-bold text-xs text-[#1446A0]">
                    {selectedStudent.studentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#64748B] block">Nom & Prénoms :</span>
                  <span className="font-bold text-xs text-[#0F172A]">
                    {selectedStudent.lastName} {selectedStudent.firstName}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#64748B] block">Né(e) le / Lieu :</span>
                  <span className="font-medium text-[11px] text-[#334155]">
                    {selectedStudent.birthDate || '—'} à {selectedStudent.birthPlace || 'Pointe-Noire'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#64748B] block">Genre & Conduite :</span>
                  <span className="font-medium text-[11px] text-[#334155]">
                    {selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'} · Conduite : {selectedStudent.conductScore || 18}/20
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Subject Grades Table */}
            <table className="w-full border-collapse border border-[#CBD5E1] text-xs mb-3">
              <thead>
                <tr className="h-7 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                  <th className="px-2 py-0.5 text-left border-r border-[#CBD5E1]">Disciplines</th>
                  <th className="px-2 py-0.5 text-left border-r border-[#CBD5E1]">Professeur</th>
                  <th className="px-2 py-0.5 text-center border-r border-[#CBD5E1] w-16">Note /20</th>
                  <th className="px-2 py-0.5 text-center border-r border-[#CBD5E1] w-12">Coef</th>
                  <th className="px-2 py-0.5 text-center border-r border-[#CBD5E1] w-16">Points</th>
                  <th className="px-2 py-0.5 text-center border-r border-[#CBD5E1] w-24">Moy. Classe</th>
                  <th className="px-2 py-0.5 text-center border-r border-[#CBD5E1] w-14">Rang</th>
                  <th className="px-3 py-0.5 text-left">Appréciation de l'Enseignant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {classSubjects.map((cs) => {
                  const subResult = summary?.subjectResults[cs.subjectId];
                  const avg = subResult?.roundedAverage;
                  const points = subResult?.weightedPoints;
                  const stats = subResult?.classStats;

                  return (
                    <tr key={cs.id} className="h-7">
                      <td className="px-2 font-semibold text-[#0F172A] border-r border-[#CBD5E1]">
                        {cs.subject.name}
                      </td>
                      <td className="px-2 text-[#64748B] text-[10px] border-r border-[#CBD5E1]">
                        {subResult?.teacherName || cs.teacherName || '—'}
                      </td>
                      <td
                        className={`px-2 text-center tabular-nums font-bold border-r border-[#CBD5E1] ${
                          avg !== null && avg !== undefined
                            ? avg < 10
                              ? 'text-[#DC2626]'
                              : avg >= 14
                              ? 'text-[#1446A0]'
                              : 'text-[#0F172A]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {avg !== null && avg !== undefined ? avg.toFixed(2) : '—'}
                      </td>
                      <td className="px-2 text-center tabular-nums font-semibold text-[#475569] border-r border-[#CBD5E1]">
                        {cs.coefficient}
                      </td>
                      <td className="px-2 text-center tabular-nums font-bold text-[#0F172A] border-r border-[#CBD5E1]">
                        {points !== null && points !== undefined ? points.toFixed(2) : '—'}
                      </td>
                      <td className="px-2 text-center tabular-nums text-[10px] text-[#64748B] border-r border-[#CBD5E1]">
                        {stats?.classAverage !== null && stats?.classAverage !== undefined
                          ? stats.classAverage.toFixed(1)
                          : '—'}
                      </td>
                      <td className="px-2 text-center tabular-nums font-medium text-[#475569] border-r border-[#CBD5E1]">
                        {subResult?.rankInSubject ? `${subResult.rankInSubject}ᵉ` : '—'}
                      </td>
                      <td className="px-3 text-[10px] text-[#475569] italic">
                        {avg !== null && avg !== undefined
                          ? avg >= 16
                            ? 'Excellent travail, très bonne rigueur.'
                            : avg >= 14
                            ? 'Très bon ensemble, continuez ainsi.'
                            : avg >= 12
                            ? 'Bon travail régulier.'
                            : avg >= 10
                            ? 'Résultats passables, intensifier les efforts.'
                            : 'Insuffisant, manque de travail personnel.'
                          : 'Non évalué.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 5. Recap & Deliberation Grid */}
            <div className="grid grid-cols-2 gap-3 my-3">
              {/* Mathematics and Ranking */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-1 text-xs">
                <div className="text-[10px] font-bold uppercase text-[#1446A0] border-b pb-0.5">
                  Bilan Pédagogique & Classement
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Total des Coefficients :</span>
                  <span className="font-bold tabular-nums text-[#0F172A]">{summary?.totalCoefficients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Points Pondérés Obtenus :</span>
                  <span className="font-bold tabular-nums text-[#0F172A]">
                    {summary?.totalWeightedPoints !== null && summary?.totalWeightedPoints !== undefined
                      ? summary.totalWeightedPoints.toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-[#CBD5E1] bg-[#EFF6FF] px-2 rounded-[2px]">
                  <span className="font-bold text-[#00307A]">MOYENNE DU TRIMESTRE :</span>
                  <span className="text-sm font-black tabular-nums text-[#1446A0]">
                    {summary?.generalAverage !== null && summary?.generalAverage !== undefined
                      ? `${summary.generalAverage.toFixed(2)} / 20.00`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Rang de l'Élève :</span>
                  <span className="font-bold text-[#0F172A]">
                    {summary?.rankInClass ? `${summary.rankInClass}ᵉ sur ${classStudents.length} élèves` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Mention Officielle :</span>
                  <span className="font-bold text-[#1446A0] uppercase">{summary?.mention || '—'}</span>
                </div>
              </div>

              {/* Attendance & Council Decision */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-1 text-xs">
                <div className="text-[10px] font-bold uppercase text-[#1446A0] border-b pb-0.5">
                  Assiduité & Décision du Conseil
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Absences Injustifiées :</span>
                  <span className="font-bold tabular-nums text-[#0F172A]">
                    {selectedStudent.unexcusedAbsences || 0} heures
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Absences Justifiées :</span>
                  <span className="font-medium tabular-nums text-[#334155]">
                    {selectedStudent.excusedAbsences || 0} heures
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase block">
                    Avis du Conseil des Professeurs :
                  </span>
                  <div className="mt-1 p-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[2px] text-[11px] font-semibold text-[#0A1D3D]">
                    {summary?.councilDecision || 'Délibération en cours'}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Signatures and Seal */}
            <div className="mt-4 pt-3 border-t-2 border-[#0A1D3D] grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span className="font-bold text-[#475569] block text-[11px]">Le Professeur Principal</span>
                <span className="text-[9px] text-[#64748B] block mb-6">{selectedClass?.classTeacherName || 'Visa'}</span>
                <div className="h-6 border-b border-dashed border-[#CBD5E1]"></div>
              </div>

              <div>
                <span className="font-bold text-[#475569] block text-[11px]">Le Directeur des Études</span>
                <span className="text-[9px] text-[#64748B] block mb-6">Contrôle des Notes</span>
                <div className="h-6 border-b border-dashed border-[#CBD5E1]"></div>
              </div>

              <div>
                <span className="font-bold text-[#0A1D3D] block text-[11px]">Le Proviseur / Chef d'Établissement</span>
                <span className="text-[9px] text-[#64748B] block mb-1">Cachet & Signature</span>
                <div className="w-20 h-10 mx-auto border-2 border-double border-[#1446A0] rounded text-[7px] flex flex-col items-center justify-center text-[#1446A0] font-black uppercase p-0.5">
                  <span>RÉP. DU CONGO</span>
                  <span>SCEAU OFFICIEL</span>
                  <span>LVA POINTE-NOIRE</span>
                </div>
              </div>
            </div>

            {/* Print footer notice */}
            <div className="mt-3 text-center text-[8px] text-[#94A3B8]">
              Édité par New Version School Tools · Système académique hors-ligne de Pointe-Noire · Toute surcharge ou rature annule ce document.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
