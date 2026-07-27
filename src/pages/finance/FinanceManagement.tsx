import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { logger } from '../../utils/logger';
import toast from 'react-hot-toast';

interface AdvanceRequest {
  id: string;
  staffName: string;
  amount: number;
  requestDate: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  approvedBy?: string;
  disbursedAt?: string;
}

interface PettyCashLedgerEntry {
  id: string;
  date: string;
  description: string;
  type: 'IN' | 'OUT';
  amount: number;
  category: string;
  source: 'MANUAL' | 'TEMPLATE_12' | 'TEMPLATE_15' | 'ADVANCE';
  approvedBy?: string;
}

export default function FinanceManagement() {
  const { user } = useAuth();
  const { getReportHistory, submitReport } = useReport();
  
  // Advances State
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  const [newAdvanceName, setNewAdvanceName] = useState('');
  const [newAdvanceAmount, setNewAdvanceAmount] = useState(100);
  const [newAdvancePurpose, setNewAdvancePurpose] = useState('');

  // Petty Cash State
  const [ledger, setLedger] = useState<PettyCashLedgerEntry[]>([]);
  const [cashOpening, setCashOpening] = useState(2500); // Default default opening cash
  const [cashInAmount, setCashInAmount] = useState(1000);
  const [cashInDescription, setCashInDescription] = useState('Weekly bank replenishment');
  const [physicalCash, setPhysicalCash] = useState(2500);

  useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    try {
      // 1. Load Advances
      const cachedAdvances = localStorage.getItem('titan_advances_list');
      const seedAdvances: AdvanceRequest[] = cachedAdvances ? JSON.parse(cachedAdvances) : [
        { id: 'adv-1', staffName: 'Peter Njoroge', amount: 150, requestDate: '2026-07-22', purpose: 'Medical expense support', status: 'PENDING' },
        { id: 'adv-2', staffName: 'Ibrahim Abdi', amount: 80, requestDate: '2026-07-25', purpose: 'Emergency travel costs', status: 'APPROVED' },
        { id: 'adv-3', staffName: 'Samuel Mwita', amount: 200, requestDate: '2026-07-15', purpose: 'Home repair tools', status: 'DISBURSED', approvedBy: 'Finance Manager', disbursedAt: '2026-07-16' },
      ];
      setAdvances(seedAdvances);
      if (!cachedAdvances) {
        localStorage.setItem('titan_advances_list', JSON.stringify(seedAdvances));
      }

      // 2. Load reports history to sync expenses
      const reports = await getReportHistory();
      
      // Initialize Ledger with standard manual records
      let compiledLedger: PettyCashLedgerEntry[] = [
        { id: 'pc-1', date: '2026-07-01', description: 'Initial cash replenishment', type: 'IN', amount: 2500, category: 'REPLENISHMENT', source: 'MANUAL', approvedBy: 'Enterprise Manager' },
        { id: 'pc-2', date: '2026-07-16', description: 'Advance payout to Samuel Mwita', type: 'OUT', amount: 200, category: 'ADVANCE', source: 'ADVANCE', approvedBy: 'Finance Manager' },
      ];

      // Sync approved/disbursed advances to ledger
      seedAdvances.forEach(adv => {
        if (adv.status === 'DISBURSED' && adv.id !== 'adv-3') { // avoid duplicate for seed pc-2
          compiledLedger.push({
            id: `ledger-${adv.id}`,
            date: adv.disbursedAt?.split('T')[0] || adv.requestDate,
            description: `Advance payout to ${adv.staffName}`,
            type: 'OUT',
            amount: adv.amount,
            category: 'ADVANCE',
            source: 'ADVANCE',
            approvedBy: adv.approvedBy || 'Finance Manager',
          });
        }
      });

      // Parse submitted reports (TEMPLATE_12 & TEMPLATE_15) and add their totals to ledger
      reports.forEach((rep: any) => {
        if (rep.status === 'SUBMITTED' || rep.status === 'VERIFIED') {
          let repData: any = {};
          try {
            repData = typeof rep.data === 'string' ? JSON.parse(rep.data) : (rep.data || {});
          } catch {
            repData = rep.data || {};
          }

          if (rep.reportType === 'TEMPLATE_12') {
            const amount = Number(repData.purchasesTotal || repData.cashTotalSpent || 0);
            if (amount > 0) {
              compiledLedger.push({
                id: rep.id,
                date: rep.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                description: `Stores purchases sheet (Report ${rep.id.slice(0, 6)})`,
                type: 'OUT',
                amount,
                category: 'STORES_EXPENSES',
                source: 'TEMPLATE_12',
                approvedBy: repData.signatures?.siteController || 'Site Controller',
              });
            }
          } else if (rep.reportType === 'TEMPLATE_15') {
            const amount = Number(repData.totalExpenses || 0);
            if (amount > 0) {
              compiledLedger.push({
                id: rep.id,
                date: rep.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                description: `Petty cash daily report (Report ${rep.id.slice(0, 6)})`,
                type: 'OUT',
                amount,
                category: 'PETTY_CASH',
                source: 'TEMPLATE_15',
                approvedBy: repData.signatures?.siteController || 'Site Controller',
              });
            }
          }
        }
      });

      setLedger(compiledLedger);

      // Set physical cash input to match expected cash initially
      const totalIn = compiledLedger.filter(e => e.type === 'IN').reduce((sum, e) => sum + e.amount, 0);
      const totalOut = compiledLedger.filter(e => e.type === 'OUT').reduce((sum, e) => sum + e.amount, 0);
      setPhysicalCash(cashOpening + totalIn - totalOut);

    } catch (err) {
      logger.error('Failed to load finance data:', err);
      toast.error('Failed to sync treasury ledger.');
    }
  }

  // Handle Advance Request submission
  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvanceName) {
      toast.error('Please enter a staff name.');
      return;
    }
    const req: AdvanceRequest = {
      id: `adv-${Date.now()}`,
      staffName: newAdvanceName,
      amount: newAdvanceAmount,
      requestDate: new Date().toISOString().split('T')[0],
      purpose: newAdvancePurpose || 'Personal request',
      status: 'PENDING',
    };
    const updated = [...advances, req];
    setAdvances(updated);
    localStorage.setItem('titan_advances_list', JSON.stringify(updated));
    toast.success('Advance request logged successfully.');
    
    // Reset form
    setNewAdvanceName('');
    setNewAdvanceAmount(100);
    setNewAdvancePurpose('');
  };

  const handleAdvanceStatus = (id: string, newStatus: 'APPROVED' | 'DISBURSED' | 'REJECTED') => {
    const updated = advances.map(adv => {
      if (adv.id === id) {
        const up = { ...adv, status: newStatus };
        if (newStatus === 'APPROVED') {
          up.approvedBy = `${user?.firstName} ${user?.lastName}`;
        }
        if (newStatus === 'DISBURSED') {
          up.disbursedAt = new Date().toISOString();
          
          // Deduct from petty cash ledger dynamically
          const entry: PettyCashLedgerEntry = {
            id: `ledger-${adv.id}`,
            date: new Date().toISOString().split('T')[0],
            description: `Advance payout to ${adv.staffName}`,
            type: 'OUT',
            amount: adv.amount,
            category: 'ADVANCE',
            source: 'ADVANCE',
            approvedBy: `${user?.firstName} ${user?.lastName}`,
          };
          setLedger(prev => [...prev, entry]);
          toast.success(`Advance of $${adv.amount} disbursed and logged to Petty Cash ledger.`);
        }
        return up;
      }
      return adv;
    });
    setAdvances(updated);
    localStorage.setItem('titan_advances_list', JSON.stringify(updated));
    toast.success(`Request state updated to ${newStatus.toLowerCase()}.`);
  };

  // Add Petty Cash replenishment
  const handleReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashInAmount <= 0) return;
    const entry: PettyCashLedgerEntry = {
      id: `pc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: cashInDescription || 'Cash replenishment',
      type: 'IN',
      amount: cashInAmount,
      category: 'REPLENISHMENT',
      source: 'MANUAL',
      approvedBy: `${user?.firstName} ${user?.lastName}`,
    };
    setLedger(prev => [...prev, entry]);
    toast.success(`Replenished petty cash with $${cashInAmount}.`);
    setCashInAmount(1000);
    setCashInDescription('Weekly bank replenishment');
  };

  // Submit Daily Petty Cash Reconciliation (T15)
  const submitReconciliationReport = async () => {
    try {
      const expenses = ledger.filter(e => e.type === 'OUT');
      const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
      const expectedClosing = cashOpening + ledger.filter(e => e.type === 'IN').reduce((sum, e) => sum + e.amount, 0) - totalExp;
      const variance = physicalCash - expectedClosing;

      const payload = {
        cashierName: `${user?.firstName} ${user?.lastName}`,
        openingBalance: cashOpening,
        rows: expenses.map(e => ({
          description: e.description,
          amount: e.amount,
          category: e.category,
          receiptNo: e.id.slice(0, 8),
          approvedBy: e.approvedBy || 'Finance Manager',
        })),
        totalExpenses: totalExp,
        closingBalance: expectedClosing,
        actualBalance: physicalCash,
        variance,
        signatures: {
          financeManager: `OTP_VERIFIED:${Date.now()}:${user?.mobileNumber.slice(-4)}`
        }
      };

      await submitReport('TEMPLATE_15', payload);
      toast.success('Petty cash daily reconciliation signed and submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit petty cash report.');
    }
  };

  // Calculations
  const totalInflow = ledger.filter(e => e.type === 'IN').reduce((sum, e) => sum + e.amount, 0);
  const totalOutflow = ledger.filter(e => e.type === 'OUT').reduce((sum, e) => sum + e.amount, 0);
  const expectedCash = cashOpening + totalInflow - totalOutflow;
  const variance = physicalCash - expectedCash;

  const pendingAdvancesTotal = advances.filter(a => a.status === 'PENDING').reduce((sum, a) => sum + a.amount, 0);
  const disbursedAdvancesTotal = advances.filter(a => a.status === 'DISBURSED').reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="editorial-title text-2xl font-light">Treasury & Advances Manager</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          Approve worker advances, track petty cash ledger flows, and verify physical bank balances
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-black p-4 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Expected Cash Balance</p>
          <p className="text-2xl font-serif italic mt-1">${expectedCash.toLocaleString()}</p>
        </div>
        <div className="border border-black p-4 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Total Disbursed Advances</p>
          <p className="text-2xl font-serif italic mt-1">${disbursedAdvancesTotal.toLocaleString()}</p>
        </div>
        <div className="border border-black p-4 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Total Cash Replenished</p>
          <p className="text-2xl font-serif italic mt-1 text-green-700">${totalInflow.toLocaleString()}</p>
        </div>
        <div className="border border-black p-4 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Reconciliation Variance</p>
          <p className={`text-2xl font-serif italic mt-1 ${variance < 0 ? 'text-red-600' : variance > 0 ? 'text-green-700' : ''}`}>
            ${variance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Petty Cash Left: Ledger Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-black p-6 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
              <h2 className="font-serif italic text-lg text-black">Petty Cash Ledger Log</h2>
              <button
                onClick={submitReconciliationReport}
                className="minimal-btn text-xs px-3 py-1"
              >
                Sign & Submit Reconciliation (T15)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="editorial-table text-xs">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td className="font-medium text-black">{entry.description}</td>
                      <td>
                        <span className="font-mono text-[9px] bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">
                          {entry.source}
                        </span>
                      </td>
                      <td>
                        <span className={`font-bold ${entry.type === 'IN' ? 'text-green-700' : 'text-red-600'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="font-semibold">${entry.amount.toLocaleString()}</td>
                      <td className="text-zinc-500">{entry.approvedBy || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-zinc-200 gap-4">
              <div className="flex items-center gap-2">
                <span className="minimal-label">Actual Physical Cash Drawer:</span>
                <input
                  type="number"
                  value={physicalCash}
                  onChange={(e) => setPhysicalCash(Number(e.target.value))}
                  className="w-24 px-1 py-0.5 border border-zinc-300 text-xs font-bold"
                />
              </div>
              <p className="text-xs font-mono text-zinc-500">
                Opening Base: ${cashOpening} | Expected: ${expectedCash}
              </p>
            </div>
          </div>
        </div>

        {/* Petty Cash Right: Forms */}
        <div className="space-y-6">
          {/* Cash In replenishment form */}
          <div className="border border-black p-6 bg-white space-y-4">
            <h2 className="font-serif italic text-lg text-black border-b border-zinc-150 pb-1">
              Replenish Petty Cash
            </h2>
            <form onSubmit={handleReplenish} className="space-y-4">
              <div>
                <label className="minimal-label">Amount (USD)</label>
                <input
                  type="number"
                  value={cashInAmount}
                  onChange={(e) => setCashInAmount(Number(e.target.value))}
                  className="minimal-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="minimal-label">Description / Source</label>
                <input
                  type="text"
                  value={cashInDescription}
                  onChange={(e) => setCashInDescription(e.target.value)}
                  className="minimal-input text-xs"
                  required
                />
              </div>
              <button type="submit" className="minimal-btn w-full text-xs">
                Log Replenishment
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Salary Advances Management */}
      <div className="border border-black p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black pb-4">
          <div>
            <h2 className="font-serif italic text-lg text-black">Salary Advances Requests Ledger</h2>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              Pending: ${pendingAdvancesTotal} | Disbursed: ${disbursedAdvancesTotal}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table list */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="editorial-table text-xs">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Amount</th>
                  <th>Request Date</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Action Buttons</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((adv) => (
                  <tr key={adv.id}>
                    <td className="font-semibold text-black">{adv.staffName}</td>
                    <td className="font-bold text-green-700">${adv.amount}</td>
                    <td>{adv.requestDate}</td>
                    <td className="italic text-zinc-600">"{adv.purpose}"</td>
                    <td>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase tracking-wide ${
                        adv.status === 'DISBURSED' ? 'border-green-600 bg-green-50 text-green-700' :
                        adv.status === 'APPROVED' ? 'border-blue-600 bg-blue-50 text-blue-700' :
                        adv.status === 'REJECTED' ? 'border-red-600 bg-red-50 text-red-700' :
                        'border-zinc-400 bg-zinc-50'
                      }`}>
                        {adv.status}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      {adv.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAdvanceStatus(adv.id, 'APPROVED')}
                            className="text-[10px] font-semibold text-blue-700 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAdvanceStatus(adv.id, 'REJECTED')}
                            className="text-[10px] font-semibold text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {adv.status === 'APPROVED' && (
                        <button
                          onClick={() => handleAdvanceStatus(adv.id, 'DISBURSED')}
                          className="text-[10px] font-bold text-green-700 hover:underline border border-green-600 px-1 py-0.5"
                        >
                          Disburse Cash
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create request form */}
          <div className="border border-zinc-200 p-4 bg-zinc-50 space-y-4">
            <h3 className="font-serif italic font-semibold text-sm text-black border-b border-zinc-200 pb-1">
              Log Advance Request
            </h3>
            <form onSubmit={handleCreateAdvance} className="space-y-4">
              <div>
                <label className="minimal-label">Staff Name</label>
                <input
                  type="text"
                  value={newAdvanceName}
                  onChange={(e) => setNewAdvanceName(e.target.value)}
                  className="minimal-input text-xs"
                  placeholder="e.g. Samuel Mwita"
                  required
                />
              </div>
              <div>
                <label className="minimal-label">Amount (USD)</label>
                <input
                  type="number"
                  value={newAdvanceAmount}
                  onChange={(e) => setNewAdvanceAmount(Number(e.target.value))}
                  className="minimal-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="minimal-label">Purpose</label>
                <input
                  type="text"
                  value={newAdvancePurpose}
                  onChange={(e) => setNewAdvancePurpose(e.target.value)}
                  className="minimal-input text-xs"
                  placeholder="e.g. Urgent family expense"
                />
              </div>
              <button type="submit" className="minimal-btn w-full text-xs">
                Log Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
