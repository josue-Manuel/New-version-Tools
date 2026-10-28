import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  HardDriveDownload,
  Construction,
  ArrowLeft,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NavigationSection } from '../../domain/types';

interface PhasePlaceholderViewProps {
  section: NavigationSection;
  onBackToDashboard: () => void;
}

interface SectionDetails {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  phaseScope: string;
  plannedFeatures: string[];
  dataModelStatus: string;
}

const SECTION_DETAILS: Record<string, SectionDetails> = {
  students: {
    title: 'Gestion des Élèves',
    subtitle: 'Enrôlement, gestion des matricules et fiches scolaires',
    icon: Users,
    phaseScope: 'Phase 2 — Gestion administrative',
    plannedFeatures: [
      'Génération et contrôle d’unicité des matricules par établissement',
      'Importation de masse par fichier CSV avec aperçu de validation',
      'Fiche individuelle de l’élève (état civil, contact parents, historique)',
      'Filtrage par classe et statut d’inscription (actif/inactif)',
    ],
    dataModelStatus: 'Entité TypeScript `Student` déjà modélisée et table SQLite spécifiée.',
  },
  classes: {
    title: 'Classes & Niveaux',
    subtitle: 'Organisation pédagogique et répartition des effectifs',
    icon: GraduationCap,
    phaseScope: 'Phase 2 — Structure pédagogique',
    plannedFeatures: [
      'Création des promotions par niveau (Collège, Lycée, Primaire)',
      'Affectation des élèves aux classes et suivi des capacités',
      'Attribution des professeurs principaux et délégués',
      'Archivage par année académique',
    ],
    dataModelStatus: 'Entités `SchoolLevel` et `SchoolClass` modélisées dans le socle.',
  },
  subjects: {
    title: 'Matières & Coefficients',
    subtitle: 'Catalogue officiel des disciplines et barèmes',
    icon: BookOpen,
    phaseScope: 'Phase 2 — Programme officiel',
    plannedFeatures: [
      'Catalogue national des matières (Maths, Français, PC, SVT, Philo, etc.)',
      'Paramétrage des coefficients par série (A, C, D, TI, etc.)',
      'Définition du barème de notation de référence (/20 ou /10)',
    ],
    dataModelStatus: 'Entité `Subject` modélisée avec barèmes stricts.',
  },
  grades: {
    title: 'Évaluations & Saisie des Notes',
    subtitle: 'Registre de notes matriciel et validation en temps réel',
    icon: ClipboardCheck,
    phaseScope: 'Phase 2 — Saisie des notes',
    plannedFeatures: [
      'Grille matricielle de saisie rapide avec navigation clavier (Flèches, Tab, Entrée)',
      'Rejet immédiat des notes hors barème (< 0 ou > barème)',
      'Distinction explicite entre note zéro (0/20) et absence non notée (null)',
      'Création des devoirs surveillés, interrogations et compositions',
    ],
    dataModelStatus: 'Entités `Assessment` et `Grade` intégrées au socle technique.',
  },
  bulletins: {
    title: 'Résultats & Bulletins A4',
    subtitle: 'Moteur de délibération et édition imprimable conforme DDEPS',
    icon: FileSpreadsheet,
    phaseScope: 'Phase 2 — Édition des bulletins',
    plannedFeatures: [
      'Calcul déterministe des moyennes pondérées par discipline et générale',
      'Attribution automatique des rangs de classe et mentions congolaises',
      'Génération du bulletin A4 officiel de Pointe-Noire prêt pour impression',
      'Tableau de délibération récapitulatif pour les conseils de classe',
    ],
    dataModelStatus: 'Moteur de calcul testé et isolé des composants React.',
  },
  backups: {
    title: 'Sauvegardes & Restauration',
    subtitle: 'Sécurisation locale des données scolaires sans cloud',
    icon: HardDriveDownload,
    phaseScope: 'Phase 2 — Sécurité des données',
    plannedFeatures: [
      'Exportation chiffrable de la base locale vers clé USB / disque externe',
      'Vérification d’intégrité par empreinte cryptographique (checksum)',
      'Restauration sécurisée avec validation du schéma avant écriture',
      'Dialogue natif de fichiers via Tauri 2',
    ],
    dataModelStatus: 'Contrat `IBackupService` défini et intègre le pont natif.',
  },
};

export const PhasePlaceholderView: React.FC<PhasePlaceholderViewProps> = ({
  section,
  onBackToDashboard,
}) => {
  const details = SECTION_DETAILS[section] || {
    title: 'Module en Préparation',
    subtitle: 'Ce module sera déployé dans la phase suivante',
    icon: Construction,
    phaseScope: 'Phase 2',
    plannedFeatures: ['Fonctionnalité en cours de développement'],
    dataModelStatus: 'Structure en cours de finalisation',
  };

  const Icon = details.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
        >
          Retour au Tableau de bord
        </Button>
        <Badge variant="warning" size="md">
          {details.phaseScope}
        </Badge>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="w-12 h-12 rounded bg-[#EFF8FF] border border-[#B2DDFF] text-[#1446A0] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#182230]">{details.title}</h2>
              <span className="text-xs font-mono text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2 py-0.5 rounded">
                Non disponible en Phase 1
              </span>
            </div>
            <p className="text-sm text-[#667085] mt-1">{details.subtitle}</p>

            <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
              <h3 className="text-xs font-semibold text-[#182230] uppercase tracking-wider mb-3">
                Fonctionnalités prévues pour la Phase 2 :
              </h3>
              <ul className="space-y-2">
                {details.plannedFeatures.map((feat, idx) => (
                  <li key={idx} className="text-xs text-[#182230] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1446A0] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-3.5 bg-[#F5F7FB] border border-[#CBD5E1] rounded text-xs text-[#667085]">
              <div className="font-semibold text-[#182230] mb-0.5">État du Socle Technique :</div>
              {details.dataModelStatus}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
