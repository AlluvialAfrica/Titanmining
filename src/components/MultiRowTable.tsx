import React from 'react';

export interface ColumnDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'time';
  width?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

export interface MultiRowTableProps {
  columns: ColumnDef[];
  rows: Record<string, any>[];
  onRowsChange: (rows: Record<string, any>[]) => void;
  minRows?: number;
  maxRows?: number;
  showRowNumbers?: boolean;
  onCalculateRow?: (row: Record<string, any>, index: number) => Record<string, any>;
}

export default function MultiRowTable({
  columns,
  rows,
  onRowsChange,
  minRows = 1,
  maxRows,
  showRowNumbers = true,
  onCalculateRow,
}: MultiRowTableProps) {
  const ensuredRows = rows.length >= minRows ? rows : [
    ...rows,
    ...Array.from({ length: minRows - rows.length }, () => createEmptyRow(columns)),
  ];

  function createEmptyRow(cols: ColumnDef[]): Record<string, any> {
    const row: Record<string, any> = {};
    for (const col of cols) {
      if (col.type === 'checkbox') {
        row[col.name] = false;
      } else if (col.type === 'number') {
        row[col.name] = '';
      } else {
        row[col.name] = '';
      }
    }
    return row;
  }

  function handleCellChange(rowIndex: number, colName: string, value: any) {
    const updated = ensuredRows.map((row, i) => {
      if (i !== rowIndex) return row;
      const newRow = { ...row, [colName]: value };
      if (onCalculateRow) {
        return onCalculateRow(newRow, i);
      }
      return newRow;
    });
    onRowsChange(updated);
  }

  function addRow() {
    if (maxRows && ensuredRows.length >= maxRows) return;
    onRowsChange([...ensuredRows, createEmptyRow(columns)]);
  }

  function deleteRow(index: number) {
    if (ensuredRows.length <= minRows) return;
    const updated = ensuredRows.filter((_, i) => i !== index);
    onRowsChange(updated);
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse border border-black text-xs print:text-[10px]">
        <thead>
          <tr className="bg-zinc-50">
            {showRowNumbers && (
              <th className="border border-black px-2 py-2 text-[10px] uppercase tracking-wider font-semibold w-10 text-center">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.name}
                className={`border border-black px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-left ${col.width || ''}`}
              >
                {col.label}
                {col.required && <span className="text-red-600 ml-0.5">*</span>}
              </th>
            ))}
            <th className="border border-black px-2 py-2 w-10 print:hidden" />
          </tr>
        </thead>
        <tbody>
          {ensuredRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-zinc-50/50">
              {showRowNumbers && (
                <td className="border border-black px-2 py-1 text-center text-zinc-400 font-mono">
                  {rowIndex + 1}
                </td>
              )}
              {columns.map((col) => (
                <td key={col.name} className="border border-black px-1 py-0.5">
                  {col.type === 'select' ? (
                    <select
                      value={row[col.name] || ''}
                      onChange={(e) => handleCellChange(rowIndex, col.name, e.target.value)}
                      disabled={col.disabled}
                      className="w-full bg-transparent border-0 outline-none text-xs py-1 px-1"
                    >
                      <option value="">--</option>
                      {col.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : col.type === 'checkbox' ? (
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!!row[col.name]}
                        onChange={(e) => handleCellChange(rowIndex, col.name, e.target.checked)}
                        disabled={col.disabled}
                        className="h-4 w-4 accent-black cursor-pointer"
                      />
                    </div>
                  ) : (
                    <input
                      type={col.type}
                      value={row[col.name] ?? ''}
                      onChange={(e) => handleCellChange(
                        rowIndex,
                        col.name,
                        col.type === 'number' ? e.target.value : e.target.value
                      )}
                      disabled={col.disabled}
                      className={`w-full bg-transparent border-0 outline-none text-xs py-1 px-1 ${
                        col.disabled ? 'text-zinc-500 font-semibold' : ''
                      }`}
                      placeholder={col.disabled ? '(auto)' : ''}
                    />
                  )}
                </td>
              ))}
              <td className="border border-black px-1 py-0.5 text-center print:hidden">
                {ensuredRows.length > minRows && (
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIndex)}
                    className="text-zinc-400 hover:text-red-600 transition-colors text-sm leading-none"
                    title="Delete row"
                  >
                    &times;
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 print:hidden">
        <button
          type="button"
          onClick={addRow}
          disabled={maxRows !== undefined && ensuredRows.length >= maxRows}
          className="text-xs uppercase tracking-widest font-semibold text-zinc-500 hover:text-black border border-zinc-200 hover:border-black px-3 py-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + Add Row
        </button>
      </div>
    </div>
  );
}
