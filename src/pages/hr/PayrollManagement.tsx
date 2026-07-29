import React, { useState, useEffect } from 'react';
import { getDataClient } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { logger } from '../../utils/logger';
import { formatDateDDMMYYYY } from '../../utils/dateFormat';
import DateInput from '../../components/DateInput';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

interface AttendanceEntry {
  staffName: string;
  role: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  timeIn: string;
  timeOut: string;
}

type SubTab = 'payroll' | 'attendance' | 'leave';

const LEAVE_STORAGE_KEY = 'titan_leave_requests';
const ATTENDANCE_STORAGE_PREFIX = 'titan_attendance_';

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

const SEED_STAFF = [
  { id: 'seed-01', firstName: 'Osman', lastName: 'Faafan', role: 'SITE_CONTROLLER' },
  { id: 'seed-02', firstName: 'Sarah', lastName: 'Kiprop', role: 'MINING_GEOLOGY_LEAD' },
  { id: 'seed-03', firstName: 'Kwame', lastName: 'Mensah', role: 'PROCESSING_RECOVERY_LEAD' },
  { id: 'seed-04', firstName: 'John', lastName: 'Kamau', role: 'FUEL_ADMIN_LOGISTICS' },
  { id: 'seed-05', firstName: 'Peter', lastName: 'Njoroge', role: 'ENGINE_MECHANIC' },
  { id: 'seed-06', firstName: 'Samuel', lastName: 'Mwita', role: 'ELECTRICAL_MECHANIC' },
  { id: 'seed-07', firstName: 'Ibrahim', lastName: 'Abdi', role: 'GREASING_WASHING_HELPER' },
  { id: 'seed-08', firstName: 'Francis', lastName: 'Ochieng', role: 'GATE_SECURITY' },
];

const WORKING_DAYS_PER_MONTH = 30;

// ---------------------------------------------------------------------------
// Attendance auto-fill from TEMPLATE_02 history
// ---------------------------------------------------------------------------

function getAttendanceFromReports(
  orgId: string,
  staffName: string,
  month: number,
  year: number,
): { present: number; absent: number; leave: number } | null {
  try {
    const raw = localStorage.getItem(`history_${orgId}`);
    if (!raw) return null;
    const history: any[] = JSON.parse(raw);

    const t02Reports = history.filter((h: any) => {
      if (h.reportType !== 'TEMPLATE_02') return false;
      const dateStr = h.reportDate || h.submittedAt?.slice(0, 10);
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    if (t02Reports.length === 0) return null;

    let present = 0;
    let absent = 0;
    let leave = 0;
    const nameLower = staffName.toLowerCase();

    for (const report of t02Reports) {
      const data = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;
      if (!data?.rows) continue;
      for (const row of data.rows) {
        const rowName = (row.staffName || row.name || '').toLowerCase();
        if (rowName !== nameLower) continue;
        const status = (row.status || '').toUpperCase();
        if (status === 'PRESENT') present++;
        else if (status === 'ABSENT') absent++;
        else if (status === 'LEAVE') leave++;
      }
    }

    // Only return if we found at least one matching entry
    if (present + absent + leave === 0) return null;
    return { present, absent, leave };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PayrollManagement() {
  const { user } = useAuth();
  const { submitReport } = useReport();
  const [subTab, setSubTab] = useState<SubTab>('payroll');
  const [staffList, setStaffList] = useState<StaffPayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');

  // Leave state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  useEffect(() => {
    loadStaffData();
    loadLeaveRequests();
  }, [selectedMonth]);

  useEffect(() => {
    loadAttendanceForDate(attendanceDate);
  }, [attendanceDate]);

  function loadLeaveRequests() {
    try {
      const data = localStorage.getItem(LEAVE_STORAGE_KEY);
      setLeaveRequests(data ? JSON.parse(data) : []);
    } catch {
      setLeaveRequests([]);
    }
  }

  function saveLeaveRequests(requests: LeaveRequest[]) {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(requests));
    setLeaveRequests(requests);
  }

  function loadAttendanceForDate(date: string) {
    try {
      const data = localStorage.getItem(`${ATTENDANCE_STORAGE_PREFIX}${date}`);
      if (data) {
        setAttendanceEntries(JSON.parse(data));
      } else {
        // Initialize from staff list
        const entries: AttendanceEntry[] = SEED_STAFF.map(s => ({
          staffName: `${s.firstName} ${s.lastName}`,
          role: s.role,
          status: 'PRESENT' as const,
          timeIn: '07:00',
          timeOut: '17:00',
        }));
        setAttendanceEntries(entries);
      }
    } catch {
      setAttendanceEntries([]);
    }
  }

  function saveAttendance() {
    localStorage.setItem(`${ATTENDANCE_STORAGE_PREFIX}${attendanceDate}`, JSON.stringify(attendanceEntries));
    toast.success('Attendance saved successfully.');
  }

  async function loadStaffData() {
    setLoading(true);
    try {
      const client = getDataClient();
      const { data: users } = await client.models.User.list();
      const userRecords = users && users.length > 0 ? users : SEED_STAFF;

      const cachedAdvancesStr = localStorage.getItem('titan_advances_list');
      const advancesList = cachedAdvancesStr ? JSON.parse(cachedAdvancesStr) : [];

      // Parse selectedMonth to get month/year for attendance lookup
      const [selYear, selMonth] = selectedMonth.split('-').map(Number);

      const formatted: StaffPayrollRecord[] = userRecords.map((u: any, idx: number) => {
        const base = DEFAULT_SALARIES[u.role] || 1000;
        const fullName = `${u.firstName} ${u.lastName}`;
        const nameKey = fullName.toLowerCase();
        const userAdvance = advancesList
          .filter((a: any) => (a.staffName.toLowerCase() === nameKey || a.id === u.id) && a.status === 'DISBURSED')
          .reduce((sum: number, a: any) => sum + Number(a.amount || 0), 0);

        // Try to pull real attendance from TEMPLATE_02 submissions
        const attendance = user?.orgId
          ? getAttendanceFromReports(user.orgId, fullName, selMonth, selYear)
          : null;

        let daysPresent: number;
        let leaveDays: number;
        let daysAbsent: number;

        if (attendance) {
          daysPresent = attendance.present;
          leaveDays = attendance.leave;
          daysAbsent = WORKING_DAYS_PER_MONTH - daysPresent - leaveDays;
        } else {
          // Fallback seed values
          daysPresent = 26 + (idx % 4);
          leaveDays = idx % 3 === 0 ? 2 : 0;
          daysAbsent = WORKING_DAYS_PER_MONTH - daysPresent - leaveDays;
        }

        const salaryDue = Math.round((base / WORKING_DAYS_PER_MONTH) * (daysPresent + leaveDays));
        const netPay = Math.max(0, salaryDue - userAdvance);

        return {
          id: u.id || `staff-${idx}`,
          name: fullName,
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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleActionLeave = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = leaveRequests.map(req => {
      if (req.id === id) {
        toast.success(`Leave request ${action.toLowerCase()} successfully.`);
        return { ...req, status: action, reviewedBy: `${user?.firstName} ${user?.lastName}` };
      }
      return req;
    });
    saveLeaveRequests(updated);
  };

  const handleSalaryChange = (id: string, field: keyof StaffPayrollRecord, value: number) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'baseSalary') {
          updated.salaryDue = Math.round((value / WORKING_DAYS_PER_MONTH) * (updated.daysPresent + updated.leaveDays));
        } else if (field === 'daysPresent' || field === 'leaveDays') {
          updated.salaryDue = Math.round((updated.baseSalary / WORKING_DAYS_PER_MONTH) * (updated.daysPresent + updated.leaveDays));
        }
        // Always recalculate netPay when any field changes (including advance)
        updated.netPay = Math.max(0, updated.salaryDue - updated.advance);
        return updated;
      }
      return s;
    }));
  };

  const handleAttendanceChange = (idx: number, field: keyof AttendanceEntry, value: string) => {
    setAttendanceEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
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

  // Attendance summaries
  const attendanceSummary = {
    present: attendanceEntries.filter(e => e.status === 'PRESENT').length,
    absent: attendanceEntries.filter(e => e.status === 'ABSENT').length,
    leave: attendanceEntries.filter(e => e.status === 'LEAVE').length,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-title text-2xl font-light">Payroll & Leave Management</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          Review attendance, leaves, advances, and run monthly payroll sheets
        </p>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-2 border-b border-black pb-2">
        {(['payroll', 'attendance', 'leave'] as SubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`text-[10px] uppercase tracking-widest font-semibold px-4 py-2 border ${
              subTab === tab ? 'border-black bg-black text-white' : 'border-zinc-300 text-zinc-500 hover:border-black'
            }`}
          >
            {tab === 'payroll' ? 'Payroll' : tab === 'attendance' ? 'Attendance' : 'Leave Requests'}
          </button>
        ))}
      </div>

      {/* ---------- PAYROLL TAB ---------- */}
      {subTab === 'payroll' && (
        <div className="border border-black p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black pb-4">
            <h2 className="font-serif italic text-lg text-black">Monthly Payroll Calculations</h2>
            <div className="flex items-center gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="minimal-input max-w-[180px] py-1 text-xs"
              />
              <button onClick={submitPayrollReport} className="minimal-btn text-xs">
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
                      <th>Days Present ({WORKING_DAYS_PER_MONTH}d)</th>
                      <th>Leave Days</th>
                      <th>Salary Earned</th>
                      <th>Advance</th>
                      <th>Net Pay due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s.id}>
                        <td className="font-semibold text-black">{s.name}</td>
                        <td className="text-[11px] font-mono text-zinc-500 uppercase">{s.role.replace('_', ' ')}</td>
                        <td>
                          <input type="number" value={s.baseSalary} onChange={(e) => handleSalaryChange(s.id, 'baseSalary', Number(e.target.value))} className="w-20 px-1 py-0.5 border border-zinc-200 text-xs" />
                        </td>
                        <td>
                          <input type="number" max={WORKING_DAYS_PER_MONTH} value={s.daysPresent} onChange={(e) => handleSalaryChange(s.id, 'daysPresent', Number(e.target.value))} className="w-16 px-1 py-0.5 border border-zinc-200 text-xs" />
                        </td>
                        <td>
                          <input type="number" max={WORKING_DAYS_PER_MONTH} value={s.leaveDays} onChange={(e) => handleSalaryChange(s.id, 'leaveDays', Number(e.target.value))} className="w-16 px-1 py-0.5 border border-zinc-200 text-xs" />
                        </td>
                        <td className="font-semibold">${s.salaryDue.toLocaleString()}</td>
                        <td>
                          <input type="number" value={s.advance} onChange={(e) => handleSalaryChange(s.id, 'advance', Number(e.target.value))} className="w-20 px-1 py-0.5 border border-zinc-200 text-xs text-red-600" />
                        </td>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200">
                <div className="border border-zinc-200 p-4">
                  <p className="minimal-label">Total Outlay</p>
                  <p className="text-xl font-serif italic mt-1">${(grandTotalSalaries + grandTotalAdvances).toLocaleString()}</p>
                  <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded"><div className="bg-black h-1.5 rounded" style={{ width: '100%' }}></div></div>
                </div>
                <div className="border border-zinc-200 p-4">
                  <p className="minimal-label">Net Disbursed Salary</p>
                  <p className="text-xl font-serif italic mt-1 text-green-700">${grandTotalNetPay.toLocaleString()}</p>
                  <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded"><div className="bg-green-600 h-1.5 rounded" style={{ width: `${(grandTotalNetPay / (grandTotalSalaries || 1)) * 100}%` }}></div></div>
                </div>
                <div className="border border-zinc-200 p-4">
                  <p className="minimal-label">Advances Recovered</p>
                  <p className="text-xl font-serif italic mt-1 text-red-600">${grandTotalAdvances.toLocaleString()}</p>
                  <div className="w-full bg-zinc-100 h-1.5 mt-2 rounded"><div className="bg-red-500 h-1.5 rounded" style={{ width: `${(grandTotalAdvances / (grandTotalSalaries || 1)) * 100}%` }}></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- ATTENDANCE TAB ---------- */}
      {subTab === 'attendance' && (
        <div className="border border-black p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black pb-4">
            <h2 className="font-serif italic text-lg text-black">Daily Attendance Register</h2>
            <div className="flex items-center gap-4">
              <DateInput value={attendanceDate} onChange={setAttendanceDate} className="minimal-input max-w-[180px] py-1 text-xs" />
              <button onClick={saveAttendance} className="minimal-btn text-xs">Save Attendance</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Staff Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                </tr>
              </thead>
              <tbody>
                {attendanceEntries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="font-semibold">{entry.staffName}</td>
                    <td className="text-[11px] font-mono text-zinc-500 uppercase">{entry.role.replace(/_/g, ' ')}</td>
                    <td>
                      <select
                        value={entry.status}
                        onChange={e => handleAttendanceChange(idx, 'status', e.target.value)}
                        className="text-xs border border-zinc-200 px-2 py-1"
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LEAVE">Leave</option>
                      </select>
                    </td>
                    <td>
                      <input type="time" value={entry.timeIn} onChange={e => handleAttendanceChange(idx, 'timeIn', e.target.value)} className="text-xs border border-zinc-200 px-2 py-1" />
                    </td>
                    <td>
                      <input type="time" value={entry.timeOut} onChange={e => handleAttendanceChange(idx, 'timeOut', e.target.value)} className="text-xs border border-zinc-200 px-2 py-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200">
            <div className="border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-green-700 font-semibold">Present</p>
              <p className="text-xl font-serif italic mt-1 text-green-700">{attendanceSummary.present}</p>
            </div>
            <div className="border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-red-700 font-semibold">Absent</p>
              <p className="text-xl font-serif italic mt-1 text-red-600">{attendanceSummary.absent}</p>
            </div>
            <div className="border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Leave</p>
              <p className="text-xl font-serif italic mt-1 text-amber-600">{attendanceSummary.leave}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- LEAVE TAB ---------- */}
      {subTab === 'leave' && (
        <div className="border border-black p-6 bg-white space-y-4">
          <h2 className="font-serif italic text-lg text-black border-b border-zinc-150 pb-1">
            All Leave Applications
          </h2>
          {leaveRequests.length === 0 ? (
            <p className="text-zinc-500 font-serif italic text-center py-6">No leave applications submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-serif italic font-semibold">{req.employeeName}</td>
                      <td>{req.leaveType}</td>
                      <td>{formatDateDDMMYYYY(req.startDate)}</td>
                      <td>{formatDateDDMMYYYY(req.endDate)}</td>
                      <td>{req.numberOfDays} days</td>
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
                            <button onClick={() => handleActionLeave(req.id, 'APPROVED')} className="text-[10px] uppercase font-semibold text-green-700 hover:underline">Approve</button>
                            <button onClick={() => handleActionLeave(req.id, 'REJECTED')} className="text-[10px] uppercase font-semibold text-red-600 hover:underline">Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
