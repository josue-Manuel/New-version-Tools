import React, { useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  BarChart3,
  Download,
  AlertTriangle,
  Award,
  CheckCircle,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { downloadFile } from '../core/export/csvImportExport';

export const ResultsSynthesisView: React.FC = () => {
  const {
    school,
    activeYear,
    selectedClass,
    selectedPeriod,
    classPeriodSummaries,
    classSubjects,
  } = useSchool();

  // Export class PV to CSV
  const handleExportPV = () => {
    if (!selectedClass || !selectedPeriod) return;

    const headers = [
      'Rang',
      'Matricule',
      'Nom',
      'Prenom',
      'Sexe',
      ...classSubjects.map((cs) => `${cs.subject.code} (Coef ${cs.coefficient})`),
      'Points Pondérés',
      'Moyenne Générale /20',
      'Mention',
      'Décision du Conseil',
    ];

    const rows = classPeriodSummaries.map((summary) => {
      const st = summary.student;
      return [
        summary.rankInClass ?? '',
        st.studentNumber,
        st.lastName,
        st.firstName,
        st.gender,
        ...classSubjects.map((cs) => {
          const res = summary.subjectResults[cs.subjectId];
          return res?.roundedAverage !== null && res?.roundedAverage !== undefined
            ? res.roundedAverage.toFixed(2)
            : '';
        }),
        summary.totalWeightedPoints !== null && summary.totalWeightedPoints !== undefined
          ? summary.totalWeightedPoints.toFixed(2)
          : '',
        summary.generalAverage !== null && summary.generalAverage !== undefined
          ? summary.generalAverage.toFixed(2)
          : '',
        summary.mention,
        `"${summary.councilDecision}"`,
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    downloadFile(
      csvContent,
      `Proces_Verbal_${selectedClass.name.replace(/\s+/g, '_')}_${selectedPeriod.shortName}.csv`
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1446A0]" />
              <span>Synthèse de Classe & Procès-Verbal de Délibération</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Classe : <strong className="text-[#0A1D3D]">{selectedClass?.name}</strong> · Session :{' '}
              <strong className="text-[#1446A0]">{selectedPeriod?.name}</strong> ({activeYear?.label})
            </p>
          </div>

          <button
            onClick={handleExportPV}
            disabled={classPeriodSummaries.length === 0}
            className="h-8 px-3.5 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Procès-Verbal (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Deliberation Matrix Table */}
      <div className="flex-1 overflow-auto bg-[#FFFFFF]">
        {classPeriodSummaries.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Aucun résultat à afficher pour cette classe et période.
          </div>
        ) : (
          <table className="w-full border-collapse text-left ledger-table">
            <thead className="sticky top-0 z-10 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs select-none">
              <tr className="h-8">
                <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-12">
                  Rang
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-36">
                  Matricule
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r-2 border-[#CBD5E1] min-w-[180px]">
                  Nom & Prénoms
                </th>

                {/* Subject averages */}
                {classSubjects.map((cs) => (
                  <th
                    key={cs.id}
                    className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1446A0] border-r border-[#CBD5E1] w-24"
                    title={`${cs.subject.name} (Coef ${cs.coefficient})`}
                  >
                    <div>{cs.subject.code}</div>
                    <div className="text-[9px] text-[#64748B] font-normal">Coef {cs.coefficient}</div>
                  </th>
                ))}

                <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-24 bg-[#E9EDFF]">
                  Total Pts
                </th>
                <th className="px-3 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-[#1446A0] border-r border-[#CBD5E1] w-28 bg-[#E0E8FF]">
                  Moyenne /20
                </th>
                <th className="px-3 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-28">
                  Mention
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                  Avis & Décision du Conseil
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {classPeriodSummaries.map((summary) => {
                const st = summary.student;
                const avg = summary.generalAverage;

                return (
                  <tr key={st.id} className="h-9 hover:bg-[#F8FAFC] transition-colors">
                    {/* Rank */}
                    <td className="px-2 text-center font-bold tabular-nums border-r border-[#CBD5E1] text-[#0A1D3D]">
                      {summary.rankInClass ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-[2px] bg-[#F1F5F9] text-[11px]">
                          {summary.rankInClass}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Matricule */}
                    <td className="px-3 font-mono-tabular text-[11px] font-semibold text-[#1446A0] border-r border-[#CBD5E1] whitespace-nowrap">
                      {st.studentNumber}
                    </td>

                    {/* Student Name & incomplete warning */}
                    <td className="px-3 font-bold text-[#0F172A] border-r-2 border-[#CBD5E1] whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1.5">
                        <span>{st.lastName} {st.firstName}</span>
                        {summary.hasIncompleteData && (
                          <span
                            className="text-[9px] px-1 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold"
                            title="Notes manquantes sur certaines évaluations"
                          >
                            Incomplet
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subject Averages */}
                    {classSubjects.map((cs) => {
                      const res = summary.subjectResults[cs.subjectId];
                      const subAvg = res?.roundedAverage;

                      return (
                        <td
                          key={cs.id}
                          className="px-2 text-center tabular-nums font-semibold border-r border-[#CBD5E1]"
                        >
                          {subAvg !== null && subAvg !== undefined ? (
                            <span
                              className={
                                subAvg < 10
                                  ? 'text-[#DC2626]'
                                  : subAvg >= 14
                                  ? 'text-[#1446A0] font-bold'
                                  : 'text-[#0F172A]'
                              }
                            >
                              {subAvg.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[#CBD5E1] font-normal">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Weighted Points */}
                    <td className="px-2 text-center tabular-nums font-semibold text-[#334155] border-r border-[#CBD5E1] bg-[#F8FAFC]">
                      {summary.totalWeightedPoints !== null && summary.totalWeightedPoints !== undefined
                        ? summary.totalWeightedPoints.toFixed(2)
                        : '—'}
                    </td>

                    {/* General Average */}
                    <td
                      className={`px-3 text-center tabular-nums text-sm font-bold border-r border-[#CBD5E1] ${
                        avg !== null
                          ? avg >= 14
                            ? 'text-[#1446A0] bg-[#EFF6FF]'
                            : avg >= 10
                            ? 'text-[#059669] bg-[#ECFDF5]'
                            : 'text-[#DC2626] bg-[#FEF2F2]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {avg !== null ? `${avg.toFixed(2)}` : '—'}
                    </td>

                    {/* Mention */}
                    <td className="px-3 text-center border-r border-[#CBD5E1]">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase ${
                          summary.mention === 'Très Bien'
                            ? 'bg-[#1446A0] text-white'
                            : summary.mention === 'Bien'
                            ? 'bg-[#E0E8FF] text-[#00307A]'
                            : summary.mention === 'Assez Bien'
                            ? 'bg-[#ECFDF5] text-[#065F46]'
                            : summary.mention === 'Passable'
                            ? 'bg-[#F1F5F9] text-[#334155]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}
                      >
                        {summary.mention}
                      </span>
                    </td>

                    {/* Council Decision */}
                    <td className="px-3 text-[11px] text-[#475569] truncate max-w-xs">
                      {summary.councilDecision}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
