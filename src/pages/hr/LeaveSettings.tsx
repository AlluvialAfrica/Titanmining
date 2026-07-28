import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface LeaveTypeSetting {
  id: string;
  leaveType: string;
  maxDaysPerYear: number;
  isActive: boolean;
}

const STORAGE_KEY = 'titan_leave_settings';

const DEFAULT_SETTINGS: LeaveTypeSetting[] = [
  { id: 'ls-1', leaveType: 'Normal', maxDaysPerYear: 21, isActive: true },
  { id: 'ls-2', leaveType: 'Sick', maxDaysPerYear: 10, isActive: true },
  { id: 'ls-3', leaveType: 'Compassionate', maxDaysPerYear: 5, isActive: true },
  { id: 'ls-4', leaveType: 'Maternity', maxDaysPerYear: 90, isActive: true },
];

function getStoredSettings(): LeaveTypeSetting[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function storeSettings(settings: LeaveTypeSetting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function LeaveSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LeaveTypeSetting[]>([]);
  const [newType, setNewType] = useState('');
  const [newDays, setNewDays] = useState(0);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleUpdate = (id: string, field: keyof LeaveTypeSetting, value: any) => {
    const updated = settings.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSettings(updated);
    storeSettings(updated);
    toast.success('Leave setting updated.');
  };

  const handleAdd = () => {
    if (!newType || newDays <= 0) {
      toast.error('Please enter a leave type name and max days.');
      return;
    }
    const newSetting: LeaveTypeSetting = {
      id: `ls-${Date.now()}`,
      leaveType: newType,
      maxDaysPerYear: newDays,
      isActive: true,
    };
    const updated = [...settings, newSetting];
    setSettings(updated);
    storeSettings(updated);
    setNewType('');
    setNewDays(0);
    toast.success('Leave type added.');
  };

  const handleDelete = (id: string) => {
    const updated = settings.filter(s => s.id !== id);
    setSettings(updated);
    storeSettings(updated);
    toast.success('Leave type removed.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="editorial-title text-2xl font-light">Leave Policy Settings</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          Configure leave types and maximum days per year
        </p>
      </div>

      <div className="border border-black p-6 bg-white">
        <div className="overflow-x-auto">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Max Days / Year</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map(s => (
                <tr key={s.id}>
                  <td className="font-serif italic font-semibold">{s.leaveType}</td>
                  <td>
                    <input
                      type="number"
                      value={s.maxDaysPerYear}
                      onChange={e => handleUpdate(s.id, 'maxDaysPerYear', Number(e.target.value))}
                      className="w-20 px-1 py-0.5 border border-zinc-200 text-xs"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={s.isActive}
                      onChange={e => handleUpdate(s.id, 'isActive', e.target.checked)}
                      className="h-4 w-4 accent-black cursor-pointer"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-[10px] uppercase font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Leave Type */}
        <div className="mt-6 pt-4 border-t border-zinc-200">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-600 mb-3">Add New Leave Type</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="minimal-label">Type Name</label>
              <input
                type="text"
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="minimal-input"
                placeholder="e.g. Study Leave"
              />
            </div>
            <div>
              <label className="minimal-label">Max Days / Year</label>
              <input
                type="number"
                value={newDays || ''}
                onChange={e => setNewDays(Number(e.target.value))}
                className="minimal-input"
                placeholder="0"
              />
            </div>
            <button onClick={handleAdd} className="minimal-btn text-xs">
              Add Leave Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
