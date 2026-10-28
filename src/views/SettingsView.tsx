import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Settings,
  Building2,
  Calculator,
  Calendar,
  Save,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { School, CalculationConfig } from '../core/models/types';

export const SettingsView: React.FC = () => {
  const {
    school,
    updateSchool,
    academicYears,
    activeYear,
    periods,
    calculationConfig,
    updateCalculationConfig,
  } = useSchool();

  const [schoolForm, setSchoolForm] = useState<Partial<School>>(school || {});
  const [calcForm, setCalcForm] = useState<CalculationConfig>(calculationConfig);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSchool(schoolForm);
    setSaveSuccessNotice('Informations de l’établissement enregistrées.');
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  const handleSaveCalcConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCalculationConfig(calcForm);
    setSaveSuccessNotice('Règles de calcul et d’arrondi mises à jour.');
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#CBD5E1] pb-3">
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1446A0]" />
            <span>Paramètres de l'Établissement & Règles de Calcul</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Configuration administrative, périodes scolaires et moteur de calcul académique
          </p>
        </div>

        {saveSuccessNotice && (
          <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#10B981] text-xs text-[#065F46] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Section 1: School Identity */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[#1446A0]" />
            <span>Identité de l'Établissement Scolaire</span>
          </h3>

          <form onSubmit={handleSaveSchool} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Nom Officiel *
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.name || ''}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Code Établissement
                </label>
                <input
                  type="text"
                  value={schoolForm.code || ''}
                  onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Ville</label>
                <input
                  type="text"
                  value={schoolForm.city || 'Pointe-Noire'}
                  onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Pays</label>
                <input
                  type="text"
                  value={schoolForm.country || 'Congo-Brazzaville'}
                  onChange={(e) => setSchoolForm({ ...schoolForm, country: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Arrondissement / Quartier</label>
                <input
                  type="text"
                  value={schoolForm.district || ''}
                  onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Téléphone Secrétariat</label>
                <input
                  type="text"
                  value={schoolForm.phone || ''}
                  onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">Devise Nationale</label>
                <input
                  type="text"
                  value={schoolForm.motto || 'Unité · Travail · Progrès'}
                  onChange={(e) => setSchoolForm({ ...schoolForm, motto: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold shadow-xs"
              >
                Enregistrer Informations Établissement
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Academic Calculation Engine Rules */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-[#1446A0]" />
            <span>Règles du Moteur de Calcul Déterministe</span>
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            Ajustez les méthodes d'arrondi et la normalisation des barèmes sans altérer la précision interne.
          </p>

          <form onSubmit={handleSaveCalcConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Règle d'Arrondi *
                </label>
                <select
                  value={calcForm.roundingRule}
                  onChange={(e) => setCalcForm({ ...calcForm, roundingRule: e.target.value as any })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-semibold"
                >
                  <option value="half-up">Arrondi Arithmétique Standard (Half-Up)</option>
                  <option value="floor">Troncature vers le bas (Floor)</option>
                  <option value="ceil">Arrondi supérieur (Ceil)</option>
                  <option value="none">Aucun arrondi (Flottant brut)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Nombre de Décimales *
                </label>
                <select
                  value={calcForm.decimalPlaces}
                  onChange={(e) => setCalcForm({ ...calcForm, decimalPlaces: Number(e.target.value) })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-semibold"
                >
                  <option value={1}>1 décimale (ex: 14.5)</option>
                  <option value={2}>2 décimales (ex: 14.58 - Recommandé)</option>
                  <option value={0}>0 décimale (Entier)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Seuil d'Admission *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="20"
                  value={calcForm.passThreshold}
                  onChange={(e) => setCalcForm({ ...calcForm, passThreshold: Number(e.target.value) })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calcForm.normalizeScoresToScale}
                  onChange={(e) => setCalcForm({ ...calcForm, normalizeScoresToScale: e.target.checked })}
                  className="w-4 h-4 text-[#1446A0] rounded"
                />
                <span className="font-semibold text-[#0A1D3D]">
                  Normaliser automatiquement les évaluations sur le barème de la matière
                </span>
              </label>
              <p className="text-[11px] text-[#64748B] pl-6 leading-relaxed">
                Si une interrogation est notée sur 10 alors que la matière est sur 20, la note est ramenée à son équivalent sur 20 (ex: 8/10 devient 16/20) avant pondération par coefficient.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold shadow-xs"
              >
                Appliquer les Règles de Calcul
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Academic Periods */}
        <div className="bg-white rounded-[4px] border border-[#E2E8F0] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#0A1D3D] flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#1446A0]" />
            <span>Périodes Trimestrielles Définies</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-xs">
            {periods.map((p) => (
              <div key={p.id} className="p-3 rounded bg-[#F8FAFC] border border-[#CBD5E1]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1446A0]">{p.name}</span>
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">{p.shortName}</span>
                </div>
                <div className="text-[11px] text-[#475569] mt-1">
                  Du <span className="font-mono-tabular">{p.startDate}</span> au <span className="font-mono-tabular">{p.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
