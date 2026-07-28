import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';
import DateInput from '../../components/DateInput';
import { formatDateDDMMYYYY } from '../../utils/dateFormat';

interface LeaveRequestRecord {
  id: string;
  employeeId: string;
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

interface LeaveBalance {
  leaveType: string;
  maxDays: number;
  usedDays: number;
  remaining: number;
}

const DEFAULT_LEAVE_TYPES = [
  { type: 'Normal', maxDays: 21 },
  { type: 'Sick', maxDays: 10 },
  { type: 'Compassionate', maxDays: 5 },
  { type: 'Maternity', maxDays: 90 },
];

const STORAGE_KEY = 'titan_leave_requests';

function getStoredLeaveRequests(): LeaveRequestRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function storeLeaveRequests(requests: LeaveRequestRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export default function LeaveApplication() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [leaveType, setLeaveType] = useState('Normal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const stored = getStoredLeaveRequests();
    setRequests(stored);
  }, []);

  // Calculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(Math.max(1, diff));
    }
  }, [startDate, endDate]);

  // Calculate leave balances
  // Match by employeeId OR employeeName to handle demo users where id may differ across sessions
  const currentYear = new Date().getFullYear();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const myRequests = requests.filter(
    r => r.employeeId === user?.id || r.employeeName === userName
  );
  const balances: LeaveBalance[] = DEFAULT_LEAVE_TYPES.map(lt => {
    const approved = myRequests
      .filter(r => r.leaveType === lt.type && r.status === 'APPROVED' && new Date(r.startDate).getFullYear() === currentYear)
      .reduce((sum, r) => sum + r.numberOfDays, 0);
    return {
      leaveType: lt.type,
      maxDays: lt.maxDays,
      usedDays: approved,
      remaining: lt.maxDays - approved,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates.');
      return;
    }

    const newRequest: LeaveRequestRecord = {
      id: `LR-${Date.now()}`,
      employeeId: user.id,
      employeeName: `${user.firstName} ${user.lastName}`,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    const updated = [...requests, newRequest];
    setRequests(updated);
    storeLeaveRequests(updated);

    toast.success('Leave application submitted successfully.');
    setStartDate('');
    setEndDate('');
    setReason('');
    setNumberOfDays(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-title text-2xl font-light">Leave Application</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          Apply for leave and view your leave history
        </p>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {balances.map(b => (
          <div key={b.leaveType} className="border border-black p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{b.leaveType} Leave</p>
            <p className="text-2xl font-serif italic mt-1">{b.remaining}<span className="text-sm text-zinc-400">/{b.maxDays}d</span></p>
            <p className="text-[10px] text-zinc-400 mt-1">{b.usedDays} days used this year</p>
          </div>
        ))}
      </div>

      {/* Application Form */}
      <div className="border border-black p-6 bg-white">
        <h2 className="font-serif italic text-lg text-black border-b border-zinc-150 pb-1 mb-4">
          New Leave Application
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="minimal-label">Leave Type</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
                className="minimal-select"
              >
                {DEFAULT_LEAVE_TYPES.map(lt => (
                  <option key={lt.type} value={lt.type}>{lt.type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="minimal-label">Number of Days</label>
              <input type="number" value={numberOfDays} disabled className="minimal-input font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="minimal-label">Start Date</label>
              <DateInput value={startDate} onChange={setStartDate} required />
            </div>
            <div>
              <label className="minimal-label">End Date</label>
              <DateInput value={endDate} onChange={setEndDate} required />
            </div>
          </div>
          <div>
            <label className="minimal-label">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="minimal-input w-full"
              placeholder="Reason for leave..."
            />
          </div>
          <button type="submit" className="minimal-btn">Submit Leave Application</button>
        </form>
      </div>

      {/* Leave History */}
      <div className="border border-black p-6 bg-white">
        <h2 className="font-serif italic text-lg text-black border-b border-zinc-150 pb-1 mb-4">
          My Leave History
        </h2>
        {myRequests.length === 0 ? (
          <p className="text-zinc-500 font-serif italic text-center py-6">No leave applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).map(req => (
                  <tr key={req.id}>
                    <td className="font-serif italic font-semibold">{req.leaveType}</td>
                    <td>{formatDateDDMMYYYY(req.startDate)}</td>
                    <td>{formatDateDDMMYYYY(req.endDate)}</td>
                    <td>{req.numberOfDays}</td>
                    <td>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider ${
                        req.status === 'APPROVED' ? 'border-green-600 bg-green-50 text-green-700' :
                        req.status === 'REJECTED' ? 'border-red-600 bg-red-50 text-red-700' :
                        'border-zinc-400 bg-zinc-50'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{formatDateDDMMYYYY(req.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
