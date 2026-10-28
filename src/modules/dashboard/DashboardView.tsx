import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Settings,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Info,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DashboardMetrics, NavigationSection, SchoolConfig } from '../../domain/types';

interface DashboardViewProps {
  config: SchoolConfig | null;
  metrics: DashboardMetrics;
  onNavigate: (section: NavigationSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  config,
  metrics,
  onNavigate,
}) => {
  const isConfigured = Boolean(config && config.isConfigured);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Configuration State Banner */}
      {!isConfigured ? (
        <div className="bg-[#EFF8FF] border border-[#B2DDFF] rounded-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded bg-[#1446A0] text-white flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1446A0]">
                Bienvenue dans New Version School Tools
              </h2>
              <p className="text-sm text-[#182230] mt-0.5">
                L&apos;établissement n&apos;a pas encore été configuré. Renseignez les informations
                de base (nom, type, année scolaire) pour initialiser votre espace de travail.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => onNavigate('settings')}
            className="shrink-0"
          >
            Configurer l&apos;établissement
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#CBD5E1] rounded-md p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#182230]">{config!.name}</h2>
                  <Badge variant="success" size="sm">
                    {config!.schoolType.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Année scolaire : <strong className="text-[#182230]">{config!.academicYear}</strong> • Localisation : {config!.city}, {config!.country}
                  {config!.principalName && ` • Direction : ${config!.principalName}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Settings className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('settings')}
            >
              Modifier la configuration
            </Button>
          </div>
        </div>
      )}

      {/* 2. Indicateurs Académiques Initiaux (Zéro authentique — Aucune donnée fictive) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#182230] uppercase tracking-wider">
              Indicateurs de l&apos;Établissement
            </h3>
            <p className="text-xs text-[#667085]">
              État authentique en Phase 1 (aucune donnée simulée ou fictive)
            </p>
          </div>
          <span className="text-xs text-[#667085] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
            Socle Initial
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Élèves */}
          <Card className="hover:border-[#CBD5E1] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] uppercase">Élèves inscrits</span>
              <div className="w-8 h-8 rounded bg-[#F5F7FB] border border-[#E2E8F0] flex items-center justify-center text-[#1446A0]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#182230] font-mono">
                {metrics.studentsCount}
              </span>
              <p className="text-xs text-[#667085] mt-1">Inscriptions en Phase 2</p>
            </div>
          </Card>

          {/* Card 2: Classes */}
          <Card className="hover:border-[#CBD5E1] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] uppercase">Classes créées</span>
              <div className="w-8 h-8 rounded bg-[#F5F7FB] border border-[#E2E8F0] flex items-center justify-center text-[#1446A0]">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#182230] font-mono">
                {metrics.classesCount}
              </span>
              <p className="text-xs text-[#667085] mt-1">Niveaux à configurer</p>
            </div>
          </Card>

          {/* Card 3: Matières */}
          <Card className="hover:border-[#CBD5E1] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] uppercase">Matières au programme</span>
              <div className="w-8 h-8 rounded bg-[#F5F7FB] border border-[#E2E8F0] flex items-center justify-center text-[#1446A0]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#182230] font-mono">
                {metrics.subjectsCount}
              </span>
              <p className="text-xs text-[#667085] mt-1">Coefficients officiels</p>
            </div>
          </Card>

          {/* Card 4: Évaluations */}
          <Card className="hover:border-[#CBD5E1] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] uppercase">Évaluations saisies</span>
              <div className="w-8 h-8 rounded bg-[#F5F7FB] border border-[#E2E8F0] flex items-center justify-center text-[#1446A0]">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#182230] font-mono">
                {metrics.assessmentsCount}
              </span>
              <p className="text-xs text-[#667085] mt-1">Devoirs et compositions</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Note explicite sur l'intégrité des données et le mode démo */}
      <div className="bg-[#F5F7FB] border border-[#CBD5E1] rounded-md p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#1E88E5] shrink-0 mt-0.5" />
        <div className="text-xs text-[#667085] leading-relaxed">
          <strong className="text-[#182230]">Mode de démonstration — Stockage natif à intégrer : </strong>
          Ce tableau de bord reflète fidèlement l&apos;état initial de votre établissement.
          En prévisualisation web, les paramètres sont temporairement conservés en mémoire via un service découplé.
          Aucune fausse statistique n&apos;est simulée (indicateurs à zéro). La base relationnelle SQLite locale et l&apos;exécution hors-ligne complète seront effectives lors du déploiement de l&apos;application de bureau avec <strong>Tauri 2</strong>.
        </div>
      </div>

      {/* 4. Raccourcis et modules en préparation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module Prêt: Paramètres */}
        <Card
          title="Configuration du Socle"
          subtitle="Paramètres disponibles et opérationnels dès maintenant"
        >
          <div className="space-y-3">
            <p className="text-xs text-[#667085] leading-relaxed">
              Personnalisez les coordonnées de votre établissement (Pointe-Noire), l&apos;année scolaire
              active, ainsi que le type d&apos;enseignement (primaire, collège, lycée ou mixte).
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Settings className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('settings')}
              >
                Accéder au formulaire de configuration
              </Button>
            </div>
          </div>
        </Card>

        {/* Architecture & Transition vers Tauri 2 + SQLite */}
        <Card
          title="Architecture Cible (Tauri 2 & SQLite)"
          subtitle="Préparation de l'intégration locale sur ordinateur"
        >
          <div className="space-y-2.5 text-xs text-[#667085]">
            <div className="flex items-center gap-2 text-[#182230]">
              <HardDrive className="w-4 h-4 text-[#1446A0]" />
              <span className="font-semibold">Moteur de données cible : SQLite local</span>
            </div>
            <p className="leading-relaxed">
              Le schéma relationnel SQL (élèves, classes, notes) est d&apos;ores et déjà modélisé dans la couche <code className="font-mono text-[#1446A0]">TauriSQLiteSchema.ts</code>. Il sera connecté via le plugin officiel Tauri SQLite sans changer l&apos;interface.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[#B54708]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">État actuel : Prévisualisation web (service mémoire)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Feuille de route des futures fonctionnalités (Phase 2) */}
      <Card
        title="Modules Académiques — Phase 2"
        subtitle="Ces fonctionnalités seront déployées sur ce même socle technique"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('students')}
            className="p-3.5 rounded border border-[#E2E8F0] hover:border-[#1446A0] hover:bg-[#F5F7FB] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#182230]">Élèves & Inscriptions</span>
              <Badge variant="neutral" size="sm">Phase 2</Badge>
            </div>
            <p className="text-xs text-[#667085]">
              Matricules uniques, import CSV, affectation aux classes.
            </p>
          </div>

          <div
            onClick={() => onNavigate('grades')}
            className="p-3.5 rounded border border-[#E2E8F0] hover:border-[#1446A0] hover:bg-[#F5F7FB] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#182230]">Grille des Notes</span>
              <Badge variant="neutral" size="sm">Phase 2</Badge>
            </div>
            <p className="text-xs text-[#667085]">
              Saisie matricielle rapide, navigation clavier, contrôles de barème.
            </p>
          </div>

          <div
            onClick={() => onNavigate('bulletins')}
            className="p-3.5 rounded border border-[#E2E8F0] hover:border-[#1446A0] hover:bg-[#F5F7FB] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#182230]">Bulletins & Délibérations</span>
              <Badge variant="neutral" size="sm">Phase 2</Badge>
            </div>
            <p className="text-xs text-[#667085]">
              Calcul déterministe des moyennes, classement et impression A4 DDEPS.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
