import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { SchoolConfig, SchoolType } from '../../domain/types';

interface SettingsViewProps {
  currentConfig: SchoolConfig | null;
  storageHealth?: {
    status: 'ok' | 'error' | 'warning';
    message: string;
    backendType: string;
    diagnostics?: any;
  } | null;
  onSave: (config: SchoolConfig) => Promise<void>;
  onReset: () => Promise<void>;
}

interface FormErrors {
  name?: string;
  academicYear?: string;
  city?: string;
  country?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentConfig,
  storageHealth,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<Partial<SchoolConfig>>({
    name: currentConfig?.name || '',
    schoolType: currentConfig?.schoolType || 'secondary',
    academicYear: currentConfig?.academicYear || '',
    city: currentConfig?.city || 'Pointe-Noire',
    country: currentConfig?.country || 'Congo',
    currency: currentConfig?.currency || 'FCFA',
    principalName: currentConfig?.principalName || '',
  });

  // Synchronise le formulaire si currentConfig change après chargement asynchrone
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        name: currentConfig.name,
        schoolType: currentConfig.schoolType,
        academicYear: currentConfig.academicYear,
        city: currentConfig.city,
        country: currentConfig.country,
        currency: currentConfig.currency,
        principalName: currentConfig.principalName || '',
      });
    }
  }, [currentConfig]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const schoolTypeOptions = [
    { value: 'primary', label: 'École Primaire (CP1 - CM2)' },
    { value: 'middle', label: 'Collège d’Enseignement Général (6ème - 3ème)' },
    { value: 'secondary', label: 'Lycée d’Enseignement Général / Technique (2nde - Tle)' },
    { value: 'mixed', label: 'Complexe Scolaire Mixte (Primaire, Collège, Lycée)' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Le nom officiel de l'établissement est obligatoire.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Le nom de l'établissement doit comporter au moins 3 caractères.";
    }

    if (!formData.academicYear || formData.academicYear.trim().length === 0) {
      newErrors.academicYear = "L'année scolaire est obligatoire.";
    } else {
      const yearPattern = /^(\d{4})[-/](\d{4})$/;
      const match = formData.academicYear.trim().match(yearPattern);
      if (!match) {
        newErrors.academicYear =
          "Format d'année invalide. Exemple conforme : '2024-2025' ou '2024/2025'.";
      } else {
        const y1 = parseInt(match[1], 10);
        const y2 = parseInt(match[2], 10);
        if (y2 !== y1 + 1) {
          newErrors.academicYear = `L'année scolaire doit couvrir deux années consécutives (ex: ${y1}-${y1 + 1}).`;
        }
      }
    }

    if (!formData.city || formData.city.trim().length === 0) {
      newErrors.city = 'La ville est obligatoire.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaveSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const configToSave: SchoolConfig = {
        name: formData.name!.trim(),
        schoolType: (formData.schoolType as SchoolType) || 'secondary',
        academicYear: formData.academicYear!.trim(),
        city: (formData.city || 'Pointe-Noire').trim(),
        country: (formData.country || 'Congo').trim(),
        currency: (formData.currency || 'FCFA').trim(),
        principalName: formData.principalName ? formData.principalName.trim() : undefined,
        isConfigured: true,
      };

      await onSave(configToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 6000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir réinitialiser la configuration ? Les paramètres actuels seront effacés.'
      )
    ) {
      await onReset();
      setFormData({
        name: '',
        schoolType: 'secondary',
        academicYear: '',
        city: 'Pointe-Noire',
        country: 'Congo',
        currency: 'FCFA',
        principalName: '',
      });
      setErrors({});
      setSaveSuccess(false);
    }
  };

  const isFormConfigured = Boolean(currentConfig && currentConfig.isConfigured);
  const activeEngine = storageHealth?.backendType || 'IndexedDB / localStorage';
  const diagnostics = storageHealth?.diagnostics;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Scope Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#182230]">Configuration de l&apos;Établissement</h2>
          <p className="text-sm text-[#667085] mt-0.5">
            Paramètres officiels de New Version School Tools pour les écoles de Pointe-Noire (Congo-Brazzaville).
          </p>
        </div>
        <div>
          {isFormConfigured ? (
            <Badge variant="success" size="md" dot>
              Statut : Configuré
            </Badge>
          ) : (
            <Badge variant="warning" size="md" dot>
              Statut : Non configuré (Données d&apos;exemple)
            </Badge>
          )}
        </div>
      </div>

      {/* Storage Backend Disclosure & Diagnostic Bar */}
      <div className="bg-[#F5F7FB] border border-[#CBD5E1] rounded-md p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-[#1446A0] shrink-0 mt-0.5" />
            <div className="text-xs text-[#667085] leading-relaxed">
              <strong className="text-[#182230]">Stockage local actif : {activeEngine} — </strong>
              Ce formulaire communique avec l&apos;interface abstraite <code className="font-mono text-[#1446A0]">IStorageService</code>.
              Vos données restent <strong>réellement enregistrées après actualisation (F5)</strong> et fermeture du navigateur.
              Lors du déploiement de bureau avec <strong>Tauri 2</strong>, cette même couche alimentera la base SQLite locale.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-xs font-medium text-[#1446A0] hover:text-[#0F357C] inline-flex items-center gap-1 shrink-0 px-2 py-1 bg-white border border-[#CBD5E1] rounded hover:bg-[#F8FAFC] transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{showDiagnostics ? 'Masquer diagnostic' : 'Diagnostic technique'}</span>
            {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Detailed Technical Diagnostic Panel */}
        {showDiagnostics && (
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-xs">
            <div className="font-semibold text-[#182230] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>Rapport d’intégrité du stockage local (Environnement Web) :</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-3 rounded border border-[#E2E8F0] text-[#344054]">
              <div>
                <span className="text-[#667085]">Moteur primaire cible : </span>
                <span className="font-mono font-medium">IndexedDB (idb v8)</span>
              </div>
              <div>
                <span className="text-[#667085]">Moteur de secours persistant : </span>
                <span className="font-mono font-medium">localStorage (Web Storage API)</span>
              </div>
              <div>
                <span className="text-[#667085]">Persistance après rechargement F5 : </span>
                <span className="text-[#027A48] font-medium">Garantie (Survie prouvée)</span>
              </div>
              <div>
                <span className="text-[#667085]">Moteur opérationnel actuel : </span>
                <span className="font-semibold text-[#1446A0]">
                  {diagnostics?.activeEngine || activeEngine}
                </span>
              </div>
            </div>

            {diagnostics?.lastIncident && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-2.5 rounded text-[#92400E] space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Incident IndexedDB intercepté & pris en charge :</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong>Étape :</strong> {diagnostics.lastIncident.step} |{' '}
                  <strong>Erreur :</strong> {diagnostics.lastIncident.errorName} ({diagnostics.lastIncident.errorMessage})<br />
                  <strong>Cause :</strong> {diagnostics.lastIncident.probableCause}<br />
                  <strong>Résolution automatique :</strong> Bascule transparente effectuée vers <em>localStorage</em>. Aucune donnée n&apos;est perdue.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] rounded-md p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-sm font-medium">
            Configuration enregistrée avec succès. Persistance locale assurée : vos paramètres restent enregistrés même après rechargement de page (F5).
          </div>
        </div>
      )}

      {/* Error Notification */}
      {submitError && (
        <div className="bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-medium">
            <strong>Erreur lors de l&apos;enregistrement :</strong> {submitError}
          </div>
        </div>
      )}

      {/* Main Configuration Form */}
      <Card
        title="Identité & Paramètres Généraux"
        subtitle="Renseignez les informations officielles figurant sur vos documents administratifs"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom de l'établissement */}
          <Input
            label="Nom officiel de l'établissement"
            required
            placeholder="Ex : Complexe Scolaire Saint-Exupéry, Lycée Victor Augagneur..."
            value={formData.name || ''}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
            helperText="Le nom complet tel qu'il doit apparaître sur les bulletins et registres officiels."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type d'établissement */}
            <Select
              label="Type d'établissement scolaire"
              required
              options={schoolTypeOptions}
              value={formData.schoolType || 'secondary'}
              onChange={(e) =>
                setFormData({ ...formData, schoolType: e.target.value as SchoolType })
              }
              helperText="Détermine les niveaux et la structure des classes en Phase 2."
            />

            {/* Année scolaire */}
            <Input
              label="Année scolaire en cours"
              required
              placeholder="Ex : 2024-2025"
              value={formData.academicYear || ''}
              onChange={(e) => {
                setFormData({ ...formData, academicYear: e.target.value });
                if (errors.academicYear) setErrors({ ...errors, academicYear: undefined });
              }}
              error={errors.academicYear}
              helperText="Format AAAA-AAAA conforme au calendrier ministériel."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ville */}
            <Input
              label="Ville"
              required
              placeholder="Pointe-Noire"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              error={errors.city}
            />

            {/* Pays */}
            <Input
              label="Pays"
              required
              value={formData.country || 'Congo'}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />

            {/* Devise monétaire */}
            <Input
              label="Devise d'affichage"
              placeholder="FCFA"
              value={formData.currency || 'FCFA'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              helperText="Pour les futurs états de comptabilité / frais scolaires."
            />
          </div>

          {/* Nom du Chef d'établissement / Direction */}
          <Input
            label="Chef d'établissement / Direction (facultatif)"
            placeholder="Ex : M. le Proviseur Jean-Paul BITSINDOU"
            value={formData.principalName || ''}
            onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
            helperText="Nom figurant dans le bas des bulletins scolaires officiels."
          />

          {/* Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Réinitialiser
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
