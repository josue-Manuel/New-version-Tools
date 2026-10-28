import React, { useState, useMemo } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Coins,
  Receipt,
  PlusCircle,
  Search,
  Printer,
  CheckCircle2,
  Download,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { FeeTransaction } from '../types/academic';

export const FeeLedgerView: React.FC = () => {
  const { transactions, students, addTransaction, schoolProfile } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeTransaction | null>(null);

  // New Transaction Form State
  const [newTx, setNewTx] = useState({
    studentId: students[0]?.id || '',
    amount: 50000,
    installment: 'Tranche 1' as FeeTransaction['installment'],
    paymentMethod: 'MTN Mobile Money' as FeeTransaction['paymentMethod'],
    transactionReference: '',
    cashierName: 'Mme Tsiba Henriette (Régisseur Principal)',
    notes: '',
  });

  // Calculate financial KPIs
  const metrics = useMemo(() => {
    const totalCollected = transactions.reduce((acc, t) => acc + (t.status === 'Quittancé' ? t.amount : 0), 0);
    // Estimated expected collection for all enrolled students
    const totalExpected = students.length * 200000;
    const balanceRemaining = Math.max(0, totalExpected - totalCollected);
    const recoveryRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return {
      totalCollected,
      totalExpected,
      balanceRemaining,
      recoveryRate,
      txCount: transactions.length,
    };
  }, [transactions, students]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterMethod !== 'ALL' && t.paymentMethod !== filterMethod) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.studentName.toLowerCase().includes(q) ||
        t.studentMatricule.toLowerCase().includes(q) ||
        t.receiptNumber.toLowerCase().includes(q) ||
        t.transactionReference.toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery, filterMethod]);

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === newTx.studentId);
    if (!st) return;

    addTransaction({
      studentId: st.id,
      studentMatricule: st.matricule,
      studentName: `${st.lastName} ${st.firstName}`,
      classId: st.classId,
      amount: Number(newTx.amount),
      installment: newTx.installment,
      paymentMethod: newTx.paymentMethod,
      transactionReference:
        newTx.transactionReference.trim() ||
        `${newTx.paymentMethod.startsWith('MTN') ? 'MTN' : newTx.paymentMethod.startsWith('Airtel') ? 'AIR' : 'GUI'}-${Date.now().toString().slice(-6)}`,
      cashierName: newTx.cashierName,
      notes: newTx.notes,
    });

    setIsCashModalOpen(false);
  };

  const printReceipt = (receipt: FeeTransaction) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Financial Strip */}
      <div className="p-4 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#1446A0]" />
              <span>Livre de Caisse & Recouvrement des Écolages (FCFA)</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Devise monétaire : Franc CFA BEAC (XAF) · Établissement public sous tutelle du Ministère
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCashModalOpen(true)}
              className="h-[34px] px-3.5 bg-[#1446A0] hover:bg-[#0F357D] active:bg-[#0A2558] text-white text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#00C2FF]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Encaisser un Paiement</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-[#F8FAFC] rounded-[4px] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Total Recouvré (Caisse & Mobile)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#059669]">
                {metrics.totalCollected.toLocaleString('fr-CG')}
              </span>
              <span className="text-xs font-medium text-[#059669]">FCFA</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-[4px] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Reste Global à Recouvrer
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#D97706]">
                {metrics.balanceRemaining.toLocaleString('fr-CG')}
              </span>
              <span className="text-xs font-medium text-[#D97706]">FCFA</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-[4px] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Taux d'Écolage Soldé
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#1446A0]">
                {metrics.recoveryRate}%
              </span>
              <span className="text-xs text-[#64748B]">de l'objectif budgétaire</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-[4px] border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] block">
              Quittances Émises
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#0F172A]">
                {metrics.txCount}
              </span>
              <span className="text-xs text-[#64748B]">reçus officiels</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher par reçu N°, élève, matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[34px] pl-8 pr-3 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1446A0] focus:ring-1 focus:ring-[#1446A0] focus:outline-none"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[4px] border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setFilterMethod('ALL')}
              className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMethod === 'ALL'
                  ? 'bg-[#FFFFFF] text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Tous Modes
            </button>
            <button
              onClick={() => setFilterMethod('MTN Mobile Money')}
              className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMethod === 'MTN Mobile Money'
                  ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              MTN MoMo
            </button>
            <button
              onClick={() => setFilterMethod('Airtel Money Congo')}
              className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMethod === 'Airtel Money Congo'
                  ? 'bg-[#FFFFFF] text-[#1446A0] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Airtel Money
            </button>
            <button
              onClick={() => setFilterMethod('Espèces au Guichet')}
              className={`px-2.5 py-1 font-medium rounded-[3px] transition-colors cursor-pointer ${
                filterMethod === 'Espèces au Guichet'
                  ? 'bg-[#FFFFFF] text-[#059669] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Espèces (Guichet)
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Data Table */}
      <div className="flex-1 overflow-auto bg-[#FFFFFF]">
        <table className="w-full border-collapse text-left ledger-table">
          <thead className="sticky top-0 z-10 bg-[#F1F5F9] border-b-2 border-[#CBD5E1] shadow-xs select-none">
            <tr className="h-8">
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                N° Quittance
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Date & Heure
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Matricule
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Élève Bénéficiaire
              </th>
              <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Série
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Motif / Tranche
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Canal de Paiement
              </th>
              <th className="px-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1446A0] border-r border-[#CBD5E1]">
                Montant (FCFA)
              </th>
              <th className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569] border-r border-[#CBD5E1]">
                Régisseur / Réf.
              </th>
              <th className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-xs">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="h-9 hover:bg-[#F8FAFC] transition-colors">
                <td className="px-3 font-mono-tabular text-[11px] font-bold text-[#1446A0] border-r border-[#CBD5E1] whitespace-nowrap">
                  {tx.receiptNumber}
                </td>
                <td className="px-3 font-mono-tabular text-[11px] text-[#64748B] border-r border-[#CBD5E1] whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-3 font-mono-tabular text-[11px] text-[#475569] border-r border-[#CBD5E1] whitespace-nowrap">
                  {tx.studentMatricule}
                </td>
                <td className="px-3 font-semibold text-[#0F172A] border-r border-[#CBD5E1] whitespace-nowrap">
                  {tx.studentName}
                </td>
                <td className="px-2 text-center border-r border-[#CBD5E1]">
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-[#F1F5F9] font-mono text-[10px] font-semibold text-[#1E3A8A]">
                    {tx.classId}
                  </span>
                </td>
                <td className="px-3 text-[#334155] border-r border-[#CBD5E1]">
                  {tx.installment}
                </td>
                <td className="px-3 border-r border-[#CBD5E1]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#0F172A]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tx.paymentMethod.startsWith('MTN')
                        ? 'bg-[#EAB308]'
                        : tx.paymentMethod.startsWith('Airtel')
                        ? 'bg-[#DC2626]'
                        : 'bg-[#10B981]'
                    }`}></span>
                    <span>{tx.paymentMethod}</span>
                  </span>
                </td>
                <td className="px-3 text-right font-bold tabular-nums text-[#059669] border-r border-[#CBD5E1] whitespace-nowrap">
                  {tx.amount.toLocaleString('fr-CG')}
                </td>
                <td className="px-3 text-[#64748B] border-r border-[#CBD5E1] truncate max-w-[140px] font-mono-tabular text-[11px]">
                  {tx.transactionReference}
                </td>
                <td className="px-2 text-center">
                  <button
                    onClick={() => printReceipt(tx)}
                    className="p-1 rounded-[3px] border border-[#CBD5E1] text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1446A0] hover:border-[#1446A0] transition-colors cursor-pointer"
                    title="Imprimer le reçu officiel de caisse"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Encaisser un Paiement */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/70 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD5E1] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-[#0A1D3D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Encaissement d'Écolage (Régie de Recettes)
                </h3>
                <p className="text-[11px] text-[#A1BAFF]">
                  Émission de quittance officielle en Francs CFA
                </p>
              </div>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="text-[#A1BAFF] hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCashSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                  Élève Assujetti *
                </label>
                <select
                  required
                  value={newTx.studentId}
                  onChange={(e) => setNewTx({ ...newTx, studentId: e.target.value })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.matricule} - {s.classId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Tranche / Rubrique *
                  </label>
                  <select
                    value={newTx.installment}
                    onChange={(e) => setNewTx({ ...newTx, installment: e.target.value as any })}
                    className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none"
                  >
                    <option value="Frais Inscription">Frais d'Inscription</option>
                    <option value="Tranche 1">1ère Tranche (Trimestre 1)</option>
                    <option value="Tranche 2">2ème Tranche (Trimestre 2)</option>
                    <option value="Tranche 3">3ème Tranche (Trimestre 3)</option>
                    <option value="Frais Examen Bac">Frais Dossier Baccalauréat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    required
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-bold tabular-nums focus:border-[#1446A0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                  Mode de Règlement *
                </label>
                <select
                  value={newTx.paymentMethod}
                  onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                  className="w-full h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] focus:border-[#1446A0] focus:outline-none font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money (MoMo Congo)</option>
                  <option value="Airtel Money Congo">Airtel Money Congo</option>
                  <option value="Espèces au Guichet">Espèces au Guichet (Caisse Principale)</option>
                  <option value="Virement Bancaire (BGFI)">Virement Bancaire (BGFI Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-[0.04em] mb-1">
                  Référence Transactionnelle (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: MTN-CG-881290 ou N° Bordereau BGFI"
                  value={newTx.transactionReference}
                  onChange={(e) => setNewTx({ ...newTx, transactionReference: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#0F172A] font-mono-tabular focus:border-[#1446A0] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#CBD5E1] bg-[#FFFFFF] font-semibold text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#1446A0] hover:bg-[#0F357D] font-semibold text-white cursor-pointer shadow-xs"
                >
                  Émettre Quittance de Caisse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reçu Officiel de Caisse (Printable Receipt) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3D]/80 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] rounded-[6px] border border-[#CBD5E1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in">
            {/* Action Bar */}
            <div className="h-10 px-4 bg-[#0A1D3D] text-white flex items-center justify-between no-print">
              <span className="text-xs font-semibold">Aperçu Quittance Officielle</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-[#1446A0] hover:bg-[#0F357D] rounded-[3px] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-[#A1BAFF] hover:text-white p-1 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Body (Formatted according to Congolese Public Administration standards) */}
            <div className="p-6 bg-white text-[#0F172A] border-4 border-double border-[#CBD5E1] m-2">
              {/* Institutional Header */}
              <div className="text-center border-b border-[#CBD5E1] pb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                  RÉPUBLIQUE DU CONGO
                </div>
                <div className="text-[9px] text-[#64748B]">Unité · Travail · Progrès</div>
                <div className="text-xs font-bold text-[#0A1D3D] mt-1 uppercase">
                  {schoolProfile.ministry}
                </div>
                <div className="text-[11px] font-semibold text-[#1446A0]">
                  {schoolProfile.direction} — {schoolProfile.city}
                </div>
                <div className="text-sm font-black text-[#0F172A] uppercase tracking-wide mt-1">
                  {schoolProfile.name}
                </div>
              </div>

              {/* Receipt Title */}
              <div className="my-3 flex items-center justify-between bg-[#F8FAFC] p-2 border border-[#E2E8F0] rounded-[2px]">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] block">TITRE OFFICIEL</span>
                  <span className="text-xs font-black text-[#1446A0]">QUITTANCE DE PAIEMENT ÉCOLAGE</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#64748B] block">N° REÇU</span>
                  <span className="text-xs font-mono font-bold text-[#0F172A]">{selectedReceipt.receiptNumber}</span>
                </div>
              </div>

              {/* Receipt Fields */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Date & Heure :</span>
                  <span className="font-mono-tabular font-medium">{new Date(selectedReceipt.timestamp).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Matricule National :</span>
                  <span className="font-mono-tabular font-bold text-[#1446A0]">{selectedReceipt.studentMatricule}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Nom de l'Élève :</span>
                  <span className="font-bold text-[#0F172A]">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Classe / Série :</span>
                  <span className="font-semibold text-[#0F172A]">{selectedReceipt.classId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Rubrique :</span>
                  <span className="font-medium text-[#0F172A]">{selectedReceipt.installment}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Moyen de Paiement :</span>
                  <span className="font-medium text-[#0F172A]">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Réf. Transaction :</span>
                  <span className="font-mono-tabular text-[11px] text-[#475569]">{selectedReceipt.transactionReference}</span>
                </div>

                {/* Amount Box */}
                <div className="p-3 bg-[#ECFDF5] border border-[#10B981] rounded-[4px] flex items-center justify-between my-2">
                  <span className="text-xs font-bold text-[#065F46] uppercase">Montant Versé :</span>
                  <span className="text-lg font-black tabular-nums text-[#065F46]">
                    {selectedReceipt.amount.toLocaleString('fr-CG')} FCFA
                  </span>
                </div>
              </div>

              {/* Signatures & Cachet */}
              <div className="mt-6 pt-4 border-t border-[#CBD5E1] grid grid-cols-2 gap-4 text-center text-[10px]">
                <div>
                  <span className="text-[#64748B] block mb-6">Le Parent / Déposant</span>
                  <div className="h-6 border-b border-dashed border-[#CBD5E1]"></div>
                </div>
                <div>
                  <span className="text-[#64748B] block mb-1">Pour la Régie des Recettes</span>
                  <span className="font-semibold text-[#0F172A] block">{selectedReceipt.cashierName}</span>
                  <div className="mt-2 w-20 h-10 mx-auto border border-dashed border-[#1446A0] rounded text-[8px] flex items-center justify-center text-[#1446A0] uppercase font-bold">
                    Cachet Régie LVA
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-[9px] text-[#94A3B8]">
                Ce reçu constitue une quittance libératoire sous réserve d'encaissement effectif.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
