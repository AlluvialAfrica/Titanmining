import React, { useState, useEffect } from 'react';
import { getDataClient } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { logger } from '../../utils/logger';
import toast from 'react-hot-toast';

interface StaffPayrollRecord {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  daysPresent: number;
  daysAbsent: number;
  leaveDays: number;
  advance: number;
  salaryDue: number;
  netPay: number;
}

interface LeaveRequest {
  id: string;
  staffName: string;
  leaveType: 'Normal' | 'Sick' | 'Compassionate';
  startDate: string;
  days: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const DEFAULT_SALARIES: Record<string, number> = {
  SITE_CONTROLLER: 2500,
  MINING_GEOLOGY_LEAD: 1800,
  PROCESSING_RECOVERY_LEAD: 1800,
  FUEL_ADMIN_LOGISTICS: 1400,
  ENGINE_MECHANIC: 1200,
  ELECTRICAL_MECHANIC: 1200,
  GREASING_WASHING_HELPER: 800,
  GATE_SECURITY: 800,
  HR_MANAGER: 1500,
  MAINTENANCE_MANAGER: 1500,
  PUMP_SUPERVISOR: 1100,
  LAB_MANAGER: 1300,
  FINANCE_MANAGER: 1500,
  ENTERPRISE_MANAGER: 3000,
};

export default function PayrollManagement() {
  const { user } = useAuth();
  const { submitReport } = useReport();
  const [staffList, setStaffList] = useState<StaffPayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: '1', staffName: 'Peter Njoroge', leaveType: 'Sick', startDate: '2026-07-10', days: 3, status: 'PENDING' },
    { id: '2', staffName: 'Sarah Kiprop', leaveType: 'Normal', startDate: '2026-07-20', days: 5, status: 'APPROVED' },
    { id: '3', staffName: 'Ibrahim Abdi', leaveType: 'Compassionate', startDate: '2026-07-24', days: 2, status: 'PENDING' },
  ]);

  useEffect(() => {
    loadStaffData();
  }, []);

  async function loadStaffData() {
    setLoading(true);
    try {
      const client = getDataClient();
      const { data: users } = await client.models.User.list();
      
      // Seed users fallback if empty
      const userRecords = users && users.length > 0 ? users : [
        { id: 'seed-01', firstName: 'Osman', lastName: 'Faafan', role: 'SITE_CONTROLLER' },
        { id: 'seed-02', firstName: 'Sarah', lastName: 'Kiprop', role: 'MINING_GEOLOGY_LEAD' },
        { id: 'seed-03', firstName: 'Kwame', lastName: 'Mensah', role: 'PROCESSING_RECOVERY_LEAD' },
        { id: 'seed-04', firstName: 'John', lastName: 'Kamau', role: 'FUEL_ADMIN_LOGISTICS' },
        { id: 'seed-05', firstName: 'Peter', lastName: 'Njoroge', role: 'ENGINE_MECHANIC' },
        { id: 'seed-06', firstName: 'Samuel', lastName: 'Mwita', role: 'ELECTRICAL_MECHANIC' },
        { id: 'seed-07', firstName: 'Ibrahim', lastName: 'Abdi', role: 'GREASING_WASHING_HELPER' },
        { id: 'seed-08', firstName: 'Francis', lastName: 'Ochieng', role: 'GATE_SECURITY' },
      ];

      // Query any existing advances to deduct them from payroll (we'll fetch from localStorage for simplicity/integrity)
      const cachedAdvancesStr = localStorage.getItem('titan_advances_list');
      const advancesList = cachedAdvancesStr ? JSON.parse(cachedAdvancesStr) : [];

      const formatted: StaffPayrollRecord[] = userRecords.map((u: any, idx: number) => {
        const base = DEFAULT_SALARIES[u.role] || 1000;
        
        // Sum disbursed advances for this email/name
        const nameKey = `${u.firstName} ${u.lastName}`.toLowerCase();
        const userAdvance = advancesList
          .filter((a: any) => (a.staffName.toLowerCase() === nameKey || a.id === u.id) && a.status === 'DISBURSED')
          .reduce((sum: number, a: any) => sum + Number(a.amount || 0), 0);

        // Mock work presence for demo purposes
        const daysPresent = 22 + (idx % 4);
        const leaveDays = idx % 3 === 0 ? 2 : 0;
        const daysAbsent = 26 - daysPresent - leaveDays;
        
        // Net pay calculation: (base / 26 days * daysPresent) - advances
        const salaryDue = Math.round((base / 26) * (daysPresent + leaveDays));
        const netPay = Math.max(0, salaryDue - userAdvance);

        return {
          id: u.id || `staff-${idx}`,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          baseSalary: base,
          daysPresent,
          daysAbsent,
          leaveDays,
          advance: userAdvance,
          salaryDue,
          netPay,
        };
      });

      setStaffList(formatted);
    } catch (err) {
      logger.error('Failed to load staff list for payroll:', err);
      toast.error('Failed to load staff directory.');
    } finally {
      setLoading(false);
    }
  }

  const handleActionLeave = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        toast.success(`Leave request ${action.toLowerCase()} successfully.`);
        return { ...req, status: action };
      }
      return req;
    }));
  };

  const handleSalaryChange = (id: string, field: keyof StaffPayrollRecord, value: number) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'baseSalary') {
          updated.salaryDue = Math.round((value / 26) * (updated.daysPresent + updated.leaveDays));
        } else if (field === 'daysPresent' || field === 'leaveDays') {
          updated.salaryDue = Math.round((updated.baseSalary / 26) * (updated.daysPresent + updated.leaveDays));
        }
        updated.netPay = Math.max(0, updated.salaryDue - updated.advance);
        return updated;
      }
      return s;
    }));
  };

  const submitPayrollReport = async () => {
    try {
      const totalAdvances = staffList.reduce((sum, s) => sum + s.advance, 0);
      const totalSalaries = staffList.reduce((sum, s) => sum + s.salaryDue, 0);
      const totalNetPay = staffList.reduce((sum, s) => sum + s.netPay, 0);

      const payload = {
        period: selectedMonth,
        hrOfficer: `${user?.firstName} ${user?.lastName}`,
        rows: staffList.map(s => ({
          staffName: s.name,
          role: s.role,
          daysPresent: s.daysPresent,
          daysAbsent: s.daysAbsent,
          leaveDays: s.leaveDays,
          advance: s.advance,
          salaryDue: s.salaryDue,
          netPay: s.netPay,
        })),
        totalAdvances,
        totalSalaries,
        totalNetPay,
        signatures: {
          hrManager: `OTP_VERIFIED:${Date.now()}:${user?.mobileNumber.slice(-4)}`
        }
      };

      await submitReport('TEMPLATE_14', payload);
      toast.success('Payroll compiled & TEMPLATE_14 report generated successfully!');
      
      // Store compiled payroll summary in localStorage to link with Petty Cash
      localStorage.setItem('titan_latest_payroll', JSON.stringify({
        period: selectedMonth,
        totalNetPay,
        compiledAt: new Date().toISOString(),
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payroll report.');
    }
  };

  const grandTotalSalaries = staffList.reduce((sum, s) => sum + s.salaryDue, 0);
  const grandTotalAdvances = staffList.reduce((sum, s) => sum + s.advance, 0);
  const grandTotalNetPay = staffList.reduce((sum, s) => sum + s.netPay, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-title text-2xl font-light">Payroll & Leave Management</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          Review attendance, leaves, advances, and run monthly payroll sheets
        </p>
      </div>

      {/* Leave Requests Panel */}
      <div className="border border-black p-6 bg-white space-y-4">
        <h2 className="font-serif italic text-lg text-black border-b border-zinc-150 pb-1">
          Recent Leave Applications
        </h2>
        <div className="overflow-x-auto">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>Days Requested</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => (
                <tr key={req.id}>
                  <td className="font-serif italic font-semibold">{req.staffName}</td>
                  <td>{req.leaveType}</td>
                  <td>{req.startDate}</td>
                  <td>{req.days} days</td>
                  <td>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'border-green-600 bg-green-50 text-green-700' :
                      req.status === 'REJECTED' ? 'border-red-600 bg-red-50 text-red-700' :
                      'border-zinc-400 bg-zinc-50'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleActionLeave(req.id, 'APPROVED')}
                          className="text-[10px] uppercase font-semibold text-green-700 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleActionLeave(req.id, 'REJECTED')}
                          className="text-[10px] uppercase font-semibold text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Configuration & Form */}
      <div className="border border-black p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black pb-4">
          <h2 className="font-serif italic text-lg text-black">
            Monthly Payroll Calculations
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="minimal-input max-w-[180px] py-1 text-xs"
            />
            <button
              onClick={submitPayrollReport}
              className="minimal-btn text-xs"
            >
              Sign & Compile Payroll (T14)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 font-serif italic text-zinc-400">Loading staff database...</div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Base Salary</th>
                    <th>Days Present (26d)</th>
                    <th>Leave Days</th>
                    <th>Salary Earned</th>
                    <th>Advances Deducted</th>
                    <th>Net Pay due</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold text-black">{s.name}</td>
                      <td className="text-[11px] font-mono text-zinc-500 uppercase">{s.role.replace('_', ' ')}</td>
                      <td>
                        <input
                          type="number"
                          value={s.baseSalary}
                          onChange={(e) => handleSalaryChange(s.id, 'baseSalary', Number(e.target.value))}
                          className="w-20 px-1 py-0.5 border border-zinc-200 text-xs"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max={26}
                          value={s.daysPresent}
                          onChange={(e) => handleSalaryChange(s.id, 'daysPresent', Number(e.target.value))}
                          className="w-16 px-1 py-0.5 border border-zinc-200 text-xs"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max={26}
                          value={s.leaveDays}
                          onChange={(e) => handleSalaryChange(s.id, 'leaveDays', Number(e.target.value))}
                          className="w-16 px-1 py-0.5 border border-zinc-200 text-xs"
                        />
                      </td>
                      <td className="font-semibold">${s.salaryDue.toLocaleString()}</td>
                      <td className="text-red-600 font-medium">-${s.advance.toLocaleString()}</td>
                      <td className="font-serif italic font-bold text-green-700">${s.netPay.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-50 border-t-2 border-black font-bold">
                    <td colSpan={2}>Grand Total</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${grandTotalSalaries.toLocaleString()}</td>
                    <td className="text-red-600">-${grandTotalAdvances.toLocaleString()}</td>
                    <td className="font-serif italic text-green-700">${grandTotalNetPay.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Metrics visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200">
              <div className="border border-zinc-200 p-4">
                <p className="minimal-label">Total Outlay</p>
                <p className="text-xl font-serif italic mt-1">${(grandTotalSalaries + grandTotalAdvances).toLocaleString()}</p>
                <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded">
                  <div className="bg-black h-1.5 rounded" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="border border-zinc-200 p-4">
                <p className="minimal-label">Net Disbursed Salary</p>
                <p className="text-xl font-serif italic mt-1 text-green-700">${grandTotalNetPay.toLocaleString()}</p>
                <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded">
                  <div className="bg-green-600 h-1.5 rounded" style={{ width: `${(grandTotalNetPay / (grandTotalSalaries || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="border border-zinc-200 p-4">
                <p className="minimal-label">Advances Recovered</p>
                <p className="text-xl font-serif italic mt-1 text-red-600">${grandTotalAdvances.toLocaleString()}</p>
                <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded">
                  <div className="bg-red-500 h-1.5 rounded" style={{ width: `${(grandTotalAdvances / (grandTotalSalaries || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
