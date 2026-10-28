import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Users,
  UserPlus,
  Search,
  FileText,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Clock,
  CheckCircle2,
  X,
  Edit2,
} from 'lucide-react';
import { Student, SeriesId } from '../types/academic';

export const StudentRegistryView: React.FC = () => {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    addStudent,
    updateStudent,
    getStudentBalance,
    setActiveModule,
    currentSeries,
    selectedSeriesId,
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    lastName: '',
    firstName: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '2008-01-01',
    birthPlace: 'Pointe-Noire',
    classId: selectedSeriesId,
    status: 'Inscrit' as 'Inscrit' | 'Boursier',
    parentName: '',
    parentPhone: '+242 06 ',
    address: 'Quartier ',
    conductScore: 18.0,
    unexcusedAbsences: 0,
    excusedAbsences: 0,
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (filterClass !== 'ALL' && s.classId !== filterClass) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.lastName.toLowerCase().includes(q) ||
      s.firstName.toLowerCase().includes(q) ||
      s.matricule.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q)
    );
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.lastName.trim() || !newStudent.firstName.trim()) return;

    addStudent(newStudent);
    setIsEnrollModalOpen(false);
    // Reset form
    setNewStudent({
      lastName: '',
      firstName: '',
      gender: 'M',
      birthDate: '2008-01-01',
      birthPlace: 'Pointe-Noire',
      classId: selectedSeriesId,
      status: 'Inscrit',
      parentName: '',
      parentPhone: '+242 06 ',
      address: 'Quartier ',
      conductScore: 18.0,
      unexcusedAbsences: 0,
      excusedAbsences: 0,
    });
  };

  const currentStudentBalance = selectedStudent ? getStudentBalance(selectedStudent.id) : null;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
      {/* Primary List View */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E2E8F0] overflow-hidden">
        {/* Top Filter & Actions Header */}
        <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1446A0]" />
                <span>Registre Général des Immatriculations</span>
              </h2>
              <p className="text-xs text-[#64748B]">
                Effectif total : <strong className="tabular-nums text-[#0F172A]">{students.length}</strong> élèves enregistrés dans la base académique
              </p>
            </div>

            {/* Enroll New Student Button */}
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="h-[34px] px-3.5 bg-[#1446A0] hover:bg-[#0F357D] active:bg-[#0A2558] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscrire un Élève</span>
            </button>
          </div>

          {/* Search and Cohort Filter */}
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Rechercher par matricule, nom ou tuteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] pl-8 pr-3 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1446A0] focus:ring-1 focus:ring-[#1446A0] focus:outline-none"
              />
            </div>

            {/* Filter by class */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[4px] border border-[#E2E8F0] text-xs">
              <button
                onClick={() => setFilterClass('ALL')}
                className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                  filterClass === 'ALL'
                    ? 'bg-[#FFFFFF] text-[#0F172A] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Toutes Séries
              </button>
              <button
                onClick={() => setFilterClass('TC')}
                className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                  filterClass === 'TC'
                    ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Terminale C
              </button>
              <button
                onClick={() => setFilterClass('TD')}
                className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                  filterClass === 'TD'
                    ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Terminale D
              </button>
              <button
                onClick={() => setFilterClass('TA4')}
                className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                  filterClass === 'TA4'
                    ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Terminale A4
              </button>
            </div>
          </div>
        </div>

        {/* Dense Student Table */}
        <div className="flex-1 overflow-auto bg-[#FFFFFF]">
          <table className="w-full border-collapse text-left ledger-table">
            <thead className="sticky top-0 z-10 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs">
              <tr className="h-8">
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Matricule
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Nom & Prénoms
                </th>
                <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Sexe
                </th>
                <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Série
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Lieu de Naissance
                </th>
                <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                  Tuteur Légal / Contact
                </th>
                <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredStudents.map((st) => {
                const isSelected = selectedStudentId === st.id;
                return (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`h-9 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-l-[3px] border-l-[#1446A0]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="px-3 font-mono-tabular text-[11px] text-[#1446A0] font-semibold border-r border-[#CBD5E1] whitespace-nowrap">
                      {st.matricule}
                    </td>
                    <td className="px-3 font-semibold text-[#0F172A] border-r border-[#CBD5E1] whitespace-nowrap">
                      {st.lastName} {st.firstName}
                    </td>
                    <td className="px-2 text-center text-[#475569] border-r border-[#CBD5E1]">
                      {st.gender}
                    </td>
                    <td className="px-2 text-center border-r border-[#CBD5E1]">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#F1F5F9] font-mono text-[10px] font-semibold text-[#1E3A8A]">
                        {st.classId}
                      </span>
                    </td>
                    <td className="px-3 text-[#475569] border-r border-[#CBD5E1] truncate max-w-[160px]">
                      {st.birthPlace}
                    </td>
                    <td className="px-3 text-[#475569] border-r border-[#CBD5E1] truncate max-w-[200px]">
                      <span className="font-medium text-[#0F172A]">{st.parentName}</span>
                      <span className="text-[11px] text-[#64748B] ml-1 font-mono-tabular">({st.parentPhone})</span>
                    </td>
                    <td className="px-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded-[2px] text-[10px] font-semibold ${
                          st.status === 'Boursier'
                            ? 'bg-[#E0E8FF] text-[#1446A0]'
                            : 'bg-[#F1F5F9] text-[#334155]'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Master-Detail Dossier Pane: Fixed at 320px per design spec */}
      <div className="w-80 bg-[#FFFFFF] flex flex-col shrink-0 overflow-y-auto border-l border-[#CBD5E1] shadow-xs select-none">
        {selectedStudent ? (
          <div className="p-4 space-y-4">
            {/* Dossier Header */}
            <div className="border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1446A0]">
                  Dossier Individuel
                </span>
                <span className="px-1.5 py-0.5 rounded-[2px] bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] font-mono font-bold text-[#0F172A]">
                  {selectedStudent.matricule}
                </span>
              </div>

              {/* Student Identity Card */}
              <div className="mt-3 flex items-start gap-3">
                <div className="w-12 h-14 bg-[#1446A0] text-white rounded-[3px] border border-[#305AB4] flex flex-col items-center justify-center font-bold text-sm shrink-0">
                  <span>{selectedStudent.gender}</span>
                  <span className="text-[9px] font-normal text-[#A1BAFF] mt-0.5">ÉLÈVE</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                    {selectedStudent.lastName}
                  </h3>
                  <p className="text-xs text-[#475569]">{selectedStudent.firstName}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#64748B]">
                    <span>Série {selectedStudent.classId}</span>
                    <span>·</span>
                    <span className="text-[#059669] font-medium">{selectedStudent.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Civil Status Section */}
            <div className="space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                État Civil & Naissance
              </div>
              <div className="space-y-1.5 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-[#334155]">
                  <Calendar className="w-3.5 h-3.5 text-[#1446A0] shrink-0" />
                  <span>Né(e) le : <strong className="tabular-nums text-[#0F172A]">{selectedStudent.birthDate}</strong></span>
                </div>
                <div className="flex items-start gap-2 text-[#334155]">
                  <MapPin className="w-3.5 h-3.5 text-[#1446A0] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">Lieu : {selectedStudent.birthPlace}</span>
                </div>
              </div>
            </div>

            {/* Tuteur & Contact Parent */}
            <div className="space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                Tuteur Légal / Famille
              </div>
              <div className="space-y-1.5 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-[#E2E8F0]">
                <div className="font-semibold text-[#0F172A]">{selectedStudent.parentName}</div>
                <div className="flex items-center gap-2 text-[#334155]">
                  <Phone className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span className="font-mono-tabular text-[11px] text-[#0F172A]">{selectedStudent.parentPhone}</span>
                </div>
                <div className="text-[11px] text-[#64748B] leading-tight">{selectedStudent.address}</div>
              </div>
            </div>

            {/* Discipline & Assiduité */}
            <div className="space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                Assiduité & Discipline
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8FAFC] p-2 rounded-[4px] border border-[#E2E8F0] text-center">
                  <span className="text-[10px] text-[#64748B] block">Absences Non Justifiées</span>
                  <span className={`text-base font-bold tabular-nums ${selectedStudent.unexcusedAbsences > 5 ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
                    {selectedStudent.unexcusedAbsences} h
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded-[4px] border border-[#E2E8F0] text-center">
                  <span className="text-[10px] text-[#64748B] block">Note de Conduite</span>
                  <span className="text-base font-bold tabular-nums text-[#059669]">
                    {selectedStudent.conductScore.toFixed(1)}/20
                  </span>
                </div>
              </div>
            </div>

            {/* Situation Financière Snapshot */}
            {currentStudentBalance && (
              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                  Situation Financière (Écolage)
                </div>
                <div className="bg-[#F8FAFC] p-2.5 rounded-[4px] border border-[#E2E8F0] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Facturé :</span>
                    <span className="font-semibold tabular-nums text-[#0F172A]">
                      {currentStudentBalance.totalBilled.toLocaleString('fr-CG')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Payé :</span>
                    <span className="font-semibold tabular-nums text-[#059669]">
                      {currentStudentBalance.totalPaid.toLocaleString('fr-CG')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#CBD5E1] pt-1">
                    <span className="font-medium text-[#0F172A]">Reste dû :</span>
                    <span className={`font-bold tabular-nums ${currentStudentBalance.balanceDue > 0 ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                      {currentStudentBalance.balanceDue.toLocaleString('fr-CG')} FCFA
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setActiveModule('bulletins')}
                className="w-full h-8 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ouvrir Bulletin Scolaire</span>
              </button>

              <button
                onClick={() => setActiveModule('ledger')}
                className="w-full h-8 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#1446A0]" />
                <span>Régulariser Écolage (Caisse)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#64748B] text-xs">
            Sélectionnez un élève dans la liste pour consulter son dossier matricule complet.
          </div>
        )}
      </div>

      {/* Modal: Inscrire un Nouvel Élève */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD5E1] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Nouvelle Immatriculation Scolaire (DDEPS Pointe-Noire)
                </h3>
                <p className="text-[11px] text-[#A1BAFF]">
                  Enregistrement dans le registre matricule officiel de la République du Congo
                </p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-[#A1BAFF] hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEnrollSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Nom de Famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: MOUKASSA"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value.toUpperCase() })}
                    className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:ring-1 focus:ring-[#1446A0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Prénoms *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean-Christian"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:ring-1 focus:ring-[#1446A0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Sexe
                  </label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'M' | 'F' })}
                    className="w-full h-8 px-2 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Série / Classe
                  </label>
                  <select
                    value={newStudent.classId}
                    onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value as SeriesId })}
                    className="w-full h-8 px-2 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  >
                    <option value="TC">Terminale C</option>
                    <option value="TD">Terminale D</option>
                    <option value="TA4">Terminale A4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Régime
                  </label>
                  <select
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value as any })}
                    className="w-full h-8 px-2 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  >
                    <option value="Inscrit">Régulier</option>
                    <option value="Boursier">Boursier d'État</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Date de Naissance
                  </label>
                  <input
                    type="date"
                    value={newStudent.birthDate}
                    onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Lieu de Naissance
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Pointe-Noire (Arr. 1)"
                    value={newStudent.birthPlace}
                    onChange={(e) => setNewStudent({ ...newStudent, birthPlace: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#F1F5F9] pt-3 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
                  Coordonnées du Responsable / Tuteur Légal
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#475569] mb-1">Nom du Parent/Tuteur</label>
                    <input
                      type="text"
                      placeholder="ex: M. Moukassa Félix"
                      value={newStudent.parentName}
                      onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#475569] mb-1">Téléphone (Congo)</label>
                    <input
                      type="text"
                      placeholder="+242 06 ... / +242 05 ..."
                      value={newStudent.parentPhone}
                      onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none font-mono-tabular"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Adresse Domiciliaire (Quartier, Rue)</label>
                  <input
                    type="text"
                    placeholder="ex: Quartier Mpita, Rue des Manguiers, Pointe-Noire"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
                >
                  Valider l'Immatriculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
