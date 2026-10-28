import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  FileText,
} from 'lucide-react';
import { Student } from '../core/models/types';
import { validateStudent } from '../core/validation/validators';
import {
  parseStudentsCSV,
  generateStudentsCSVTemplate,
  downloadFile,
  CSVParseResult,
} from '../core/export/csvImportExport';

export const StudentsManagementView: React.FC = () => {
  const {
    students,
    classes,
    selectedClassId,
    saveStudent,
    deleteStudent,
    importCSVStudents,
    setSelectedStudentId,
    setActiveView,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassId, setFilterClassId] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // New Student Form
  const [formData, setFormData] = useState<Partial<Student>>({
    studentNumber: '',
    lastName: '',
    firstName: '',
    gender: 'M',
    schoolClassId: selectedClassId || classes[0]?.id || '',
    birthDate: '2008-01-01',
    birthPlace: 'Pointe-Noire',
    active: true,
    guardianName: '',
    guardianPhone: '+242 06 ',
    conductScore: 18.0,
    unexcusedAbsences: 0,
    excusedAbsences: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // CSV Import State
  const [csvResult, setCsvResult] = useState<CSVParseResult | null>(null);
  const [csvTargetClassId, setCsvTargetClassId] = useState<string>(selectedClassId || classes[0]?.id || '');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterClassId !== 'ALL' && s.schoolClassId !== filterClassId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q))
      );
    });
  }, [students, filterClassId, searchQuery]);

  // Open Add modal with auto-suggested matricule
  const handleOpenAddModal = () => {
    const nextCount = students.length + 1;
    setFormData({
      studentNumber: `CG-PN-2026-${String(nextCount).padStart(4, '0')}`,
      lastName: '',
      firstName: '',
      gender: 'M',
      schoolClassId: selectedClassId || classes[0]?.id || '',
      birthDate: '2008-01-01',
      birthPlace: 'Pointe-Noire',
      active: true,
      guardianName: '',
      guardianPhone: '+242 06 ',
      conductScore: 18.0,
      unexcusedAbsences: 0,
      excusedAbsences: 0,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: Student = {
      id: editingStudent ? editingStudent.id : `stu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentNumber: formData.studentNumber?.trim() || '',
      lastName: formData.lastName?.trim().toUpperCase() || '',
      firstName: formData.firstName?.trim() || '',
      gender: (formData.gender as 'M' | 'F') || 'M',
      schoolClassId: formData.schoolClassId || classes[0]?.id || '',
      active: formData.active ?? true,
      birthDate: formData.birthDate,
      birthPlace: formData.birthPlace,
      guardianName: formData.guardianName,
      guardianPhone: formData.guardianPhone,
      conductScore: Number(formData.conductScore) || 18,
      unexcusedAbsences: Number(formData.unexcusedAbsences) || 0,
      excusedAbsences: Number(formData.excusedAbsences) || 0,
    };

    const errors = validateStudent(candidate, students);
    if (errors.length > 0) {
      const errMap: Record<string, string> = {};
      errors.forEach((e) => (errMap[e.field] = e.message));
      setFormErrors(errMap);
      return;
    }

    await saveStudent(candidate);
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  // CSV File Handler
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseStudentsCSV(text, csvTargetClassId, students);
        setCsvResult(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmCSVImport = async () => {
    if (!csvResult || csvResult.validRows.length === 0) return;
    const count = await importCSVStudents(csvResult.validRows);
    setImportSuccessMsg(`${count} élève(s) importé(s) avec succès dans la classe.`);
    setCsvResult(null);
    setIsImportModalOpen(false);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1446A0]" />
              <span>Registre Matricule & Gestion des Élèves</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Effectif global enregistré dans IndexedDB :{' '}
              <strong className="text-[#0A1D3D] tabular-nums">{students.length}</strong> élèves
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCsvResult(null);
                setCsvTargetClassId(selectedClassId || classes[0]?.id || '');
                setIsImportModalOpen(true);
              }}
              className="h-8 px-3 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#1446A0]" />
              <span>Importer Fichier CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="h-8 px-3.5 bg-[#1446A0] hover:bg-[#0F357D] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvel Élève</span>
            </button>
          </div>
        </div>

        {importSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-[4px] bg-[#ECFDF5] border border-[#10B981] text-xs text-[#065F46] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1446A0] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#64748B]">Classe :</span>
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="h-8 px-2.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none font-semibold"
            >
              <option value="ALL">Toutes les classes ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Students Roster Table */}
      <div className="flex-1 overflow-auto bg-[#FFFFFF]">
        <table className="w-full border-collapse text-left ledger-table">
          <thead className="sticky top-0 z-10 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs select-none">
            <tr className="h-8">
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-36">
                Matricule
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Nom & Prénoms
              </th>
              <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1] w-14">
                Sexe
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Classe Assignée
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Lieu de Naissance
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Tuteur Légal / Tél.
              </th>
              <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-xs">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  Aucun élève trouvé dans ce registre.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => {
                const assignedClass = classes.find((c) => c.id === st.schoolClassId);
                return (
                  <tr key={st.id} className="h-9 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-3 font-mono-tabular text-[11px] font-bold text-[#1446A0] border-r border-[#CBD5E1] whitespace-nowrap">
                      {st.studentNumber}
                    </td>
                    <td className="px-3 font-semibold text-[#0F172A] border-r border-[#CBD5E1] whitespace-nowrap">
                      {st.lastName} {st.firstName}
                    </td>
                    <td className="px-2 text-center text-[#475569] border-r border-[#CBD5E1]">
                      {st.gender}
                    </td>
                    <td className="px-3 border-r border-[#CBD5E1] text-[#334155]">
                      {assignedClass?.name || 'Non assigné'}
                    </td>
                    <td className="px-3 text-[#64748B] border-r border-[#CBD5E1] truncate max-w-[160px]">
                      {st.birthPlace || '—'}
                    </td>
                    <td className="px-3 text-[#475569] border-r border-[#CBD5E1] truncate max-w-[200px]">
                      <span className="font-medium text-[#0F172A]">{st.guardianName || '—'}</span>
                      {st.guardianPhone && (
                        <span className="text-[11px] text-[#64748B] ml-1 font-mono-tabular">
                          ({st.guardianPhone})
                        </span>
                      )}
                    </td>
                    <td className="px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setActiveView('bulletins');
                          }}
                          className="p-1 rounded-[3px] text-[#1446A0] hover:bg-[#EFF6FF] transition-colors"
                          title="Voir le bulletin scolaire A4"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(st);
                            setFormData(st);
                            setFormErrors({});
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 rounded-[3px] text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                          title="Modifier les informations"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Confirmer la suppression de l'élève ${st.lastName} ${st.firstName} ?`)) {
                              deleteStudent(st.id);
                            }
                          }}
                          className="p-1 rounded-[3px] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                          title="Supprimer cet élève"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add or Edit Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingStudent ? 'Modifier le Dossier Élève' : 'Immatriculation d’un Nouvel Élève'}
                </h3>
                <p className="text-[11px] text-[#A1BAFF]">
                  Enregistrement dans la base IndexedDB de l’établissement
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#A1BAFF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Matricule Unique *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CG-PN-2026-XXXX"
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    className={`w-full h-8 px-2.5 bg-[#FFFFFF] border rounded-[4px] text-[#0F172A] font-mono-tabular font-bold ${
                      formErrors.studentNumber ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1]'
                    }`}
                  />
                  {formErrors.studentNumber && (
                    <span className="text-[10px] text-[#DC2626]">{formErrors.studentNumber}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Classe d'affectation *
                  </label>
                  <select
                    value={formData.schoolClassId}
                    onChange={(e) => setFormData({ ...formData, schoolClassId: e.target.value })}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Nom de Famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: MOUKASSA"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Prénoms *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Christian"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Genre *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Date de Naissance
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Lieu de Naissance
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Pointe-Noire (Arr. 1)"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="border-t border-[#F1F5F9] pt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Nom du Tuteur / Parent</label>
                  <input
                    type="text"
                    placeholder="ex: M. Moukassa Jean"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Téléphone Tuteur</label>
                  <input
                    type="text"
                    placeholder="+242 06 ... / +242 05 ..."
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white shadow-xs"
                >
                  {editingStudent ? 'Enregistrer Modifications' : 'Immatriculer l’Élève'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Import with Validation & Interactive Preview */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Importation d'Élèves par Fichier CSV</h3>
                <p className="text-[11px] text-[#A1BAFF]">
                  Validation de structure et vérification de doublons avant enregistrement
                </p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-[#A1BAFF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Instructions and Download Template */}
              <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0]">
                <div>
                  <span className="font-semibold text-[#0A1D3D] block">Format attendu :</span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    matricule;nom;prenom;sexe;date_naissance;lieu_naissance;tuteur;telephone
                  </span>
                </div>
                <button
                  onClick={() => downloadFile(generateStudentsCSVTemplate(), 'Modele_Import_Eleves.csv')}
                  className="px-2.5 py-1 rounded-[3px] bg-white border border-[#CBD5E1] text-[11px] font-semibold text-[#1446A0] hover:bg-[#F8FAFC] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger Modèle CSV</span>
                </button>
              </div>

              {/* Class target & file input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Classe de destination
                  </label>
                  <select
                    value={csvTargetClassId}
                    onChange={(e) => setCsvTargetClassId(e.target.value)}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase mb-1">
                    Sélectionner le fichier CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVFileChange}
                    className="w-full h-8 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#1446A0] file:text-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview & Errors Table */}
              {csvResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0A1D3D]">
                      Aperçu de validation : {csvResult.validRows.length} lignes valides sur {csvResult.totalRows}
                    </span>
                    {csvResult.errors.length > 0 && (
                      <span className="text-[11px] text-[#DC2626] font-bold">
                        {csvResult.errors.length} anomalie(s) détectée(s)
                      </span>
                    )}
                  </div>

                  {/* Errors Box */}
                  {csvResult.errors.length > 0 && (
                    <div className="max-h-28 overflow-y-auto p-2 rounded-[4px] bg-[#FEF2F2] border border-[#DC2626] text-[11px] text-[#991B1B] space-y-1">
                      {csvResult.errors.map((err, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="font-bold">Ligne {err.row} :</span>
                          <span>{err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Valid Rows Preview Table */}
                  <div className="max-h-40 overflow-y-auto border border-[#CBD5E1] rounded-[4px]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1]">
                        <tr className="h-6">
                          <th className="px-2">Matricule</th>
                          <th className="px-2">Nom & Prénoms</th>
                          <th className="px-2 text-center">Sexe</th>
                          <th className="px-2">Lieu</th>
                          <th className="px-2">Tuteur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {csvResult.validRows.map((r, idx) => (
                          <tr key={idx} className="h-6 hover:bg-[#F8FAFC]">
                            <td className="px-2 font-mono-tabular font-bold text-[#1446A0]">{r.studentNumber}</td>
                            <td className="px-2">{r.lastName} {r.firstName}</td>
                            <td className="px-2 text-center">{r.gender}</td>
                            <td className="px-2">{r.birthPlace || '—'}</td>
                            <td className="px-2">{r.guardianName || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!csvResult || csvResult.validRows.length === 0}
                  onClick={handleConfirmCSVImport}
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] text-xs font-semibold text-white shadow-xs disabled:opacity-40"
                >
                  Enregistrer {csvResult?.validRows.length || 0} Élèves dans la Base
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
