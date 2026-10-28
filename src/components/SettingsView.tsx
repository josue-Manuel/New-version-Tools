import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Sliders,
  Building2,
  Scale,
  Save,
  RotateCcw,
  HardDrive,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SeriesId } from '../types/academic';

export const SettingsView: React.FC = () => {
  const {
    seriesList,
    selectedSeriesId,
    setSelectedSeriesId,
    currentSeries,
    updateSeriesSubjectCoef,
    schoolProfile,
    updateSchoolProfile,
    resetToDefaultData,
    students,
    gradesRecord,
    transactions,
  } = useAcademic();

  const [localProfile, setLocalProfile] = useState(schoolProfile);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(localProfile);
    setSaveNotice('Informations administratives enregistrées.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleExportFullJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      schoolProfile,
      seriesList,
      students,
      gradesRecord,
      transactions,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Equatorial_Academic_Core_Backup_${schoolProfile.code}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#CBD5E1] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#1446A0]" />
              <span>Configuration du Système & Barème National</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Paramétrage des coefficients ministériels, barèmes de mention et identité administrative
            </p>
          </div>

          <button
            onClick={handleExportFullJSON}
            className="h-8 px-3 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#1446A0] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Sauvegarde (JSON)</span>
          </button>
        </div>

        {saveNotice && (
          <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#10B981] text-xs text-[#065F46] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Section 1: Official Congolese Coefficient Matrix */}
        <div className="bg-white p-5 rounded-[4px] border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#1446A0]" />
                <span>Coefficients Nationaux par Série (Baccalauréat Général)</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Poids des disciplines pour le calcul de la moyenne générale pondérée (/20.00)
              </p>
            </div>

            {/* Select Series to edit */}
            <div className="inline-flex rounded-[4px] border border-[#CBD5E1] bg-[#F1F5F9] p-0.5 text-xs">
              {seriesList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeriesId(s.id as SeriesId)}
                  className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                    selectedSeriesId === s.id
                      ? 'bg-[#1446A0] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {s.id === 'TC' ? 'Terminale C' : s.id === 'TD' ? 'Terminale D' : 'Terminale A4'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#CBD5E1]">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1]">
                <tr className="h-8 text-[#475569] uppercase font-semibold text-[11px]">
                  <th className="px-3">Discipline</th>
                  <th className="px-3">Code Abrégé</th>
                  <th className="px-3">Enseignant Titulaire</th>
                  <th className="px-3">Catégorie</th>
                  <th className="px-3 text-center w-32">Coefficient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {currentSeries.subjects.map((sub) => (
                  <tr key={sub.id} className="h-9 hover:bg-[#F8FAFC]">
                    <td className="px-3 font-semibold text-[#0F172A]">{sub.name}</td>
                    <td className="px-3 font-mono text-[11px] text-[#1446A0]">{sub.shortName}</td>
                    <td className="px-3 text-[#475569]">{sub.teacherName}</td>
                    <td className="px-3 text-[#64748B] capitalize">{sub.category}</td>
                    <td className="px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={sub.coefficient}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 10) {
                            updateSeriesSubjectCoef(selectedSeriesId, sub.id, val);
                          }
                        }}
                        className="w-16 h-7 text-center font-bold tabular-nums bg-white border border-[#CBD5E1] rounded-[3px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="h-9 bg-[#F1F5F9] font-bold text-xs text-[#0A1D3D]">
                  <td colSpan={4} className="px-3 text-right">
                    Total des Coefficients de la Série :
                  </td>
                  <td className="px-3 text-center tabular-nums text-sm text-[#1446A0]">
                    {currentSeries.totalCoefficients}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: National Mention Scale Overview */}
        <div className="bg-white p-5 rounded-[4px] border border-[#E2E8F0] shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] mb-1">
            Barème Officiel des Mentions & Décisions (Système Congolais)
          </h3>
          <p className="text-xs text-[#64748B] mb-3">
            Règlement des examens d'État du Baccalauréat en République du Congo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE]">
              <span className="font-bold text-[#1E40AF] block">Très Bien</span>
              <span className="text-sm font-black tabular-nums text-[#1E3A8A]">≥ 16.00 / 20</span>
              <p className="text-[10px] text-[#1E40AF] mt-1">Félicitations du Conseil & Tableau d’Honneur</p>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="font-bold text-[#166534] block">Bien</span>
              <span className="text-sm font-black tabular-nums text-[#14532D]">14.00 – 15.99</span>
              <p className="text-[10px] text-[#166534] mt-1">Tableau d’Honneur & Encouragements</p>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="font-bold text-[#166534] block">Assez Bien</span>
              <span className="text-sm font-black tabular-nums text-[#14532D]">12.00 – 13.99</span>
              <p className="text-[10px] text-[#166534] mt-1">Encouragements du Conseil</p>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F8FAFC] border border-[#CBD5E1]">
              <span className="font-bold text-[#334155] block">Passable</span>
              <span className="text-sm font-black tabular-nums text-[#0F172A]">10.00 – 11.99</span>
              <p className="text-[10px] text-[#64748B] mt-1">Admis au premier tour</p>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA]">
              <span className="font-bold text-[#991B1B] block">Ajourné</span>
              <span className="text-sm font-black tabular-nums text-[#7F1D1D]">&lt; 10.00 / 20</span>
              <p className="text-[10px] text-[#991B1B] mt-1">Avertissement ou Blâme</p>
            </div>
          </div>
        </div>

        {/* Section 3: School Profile Settings */}
        <div className="bg-white p-5 rounded-[4px] border border-[#E2E8F0] shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1446A0]" />
            <span>Fiche Administrative de l'Établissement</span>
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            Données figurant sur l'en-tête officiel des bulletins et bordereaux DDEPS
          </p>

          <form onSubmit={handleProfileSave} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Nom Officiel de l'Établissement
                </label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Direction Départementale
                </label>
                <input
                  type="text"
                  value={localProfile.direction}
                  onChange={(e) => setLocalProfile({ ...localProfile, direction: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Ville / Département
                </label>
                <input
                  type="text"
                  value={localProfile.city}
                  onChange={(e) => setLocalProfile({ ...localProfile, city: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Code Établissement
                </label>
                <input
                  type="text"
                  value={localProfile.code}
                  onChange={(e) => setLocalProfile({ ...localProfile, code: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular focus:border-[#1446A0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Année Scolaire
                </label>
                <input
                  type="text"
                  value={localProfile.academicYear}
                  onChange={(e) => setLocalProfile({ ...localProfile, academicYear: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] tabular-nums focus:border-[#1446A0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Nom du Proviseur
                </label>
                <input
                  type="text"
                  value={localProfile.directorName}
                  onChange={(e) => setLocalProfile({ ...localProfile, directorName: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Contacts Téléphoniques (Secrétariat)
                </label>
                <input
                  type="text"
                  value={localProfile.phone}
                  onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular focus:border-[#1446A0] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                Sauvegarder Profil Établissement
              </button>
            </div>
          </form>
        </div>

        {/* Section 4: Maintenance & Reset */}
        <div className="bg-[#FFFFFF] p-5 rounded-[4px] border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialisation des Données de Démonstration</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Efface les modifications locales et recharge les effectifs et notes modèles de Pointe-Noire
              </p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment restaurer les données d’origine du Lycée Victor Augagneur ?')) {
                  resetToDefaultData();
                }
              }}
              className="h-8 px-3 rounded-[4px] border border-[#DC2626] bg-[#FFFFFF] text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              Restaurer les Données Initiales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
