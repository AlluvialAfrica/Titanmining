/**
 * Report PDF generation utility.
 * Generates structured HTML for each template type and opens it in a print dialog.
 */

const TEMPLATE_NAMES: Record<string, string> = {
  TEMPLATE_01: 'Site Daily Summary',
  TEMPLATE_02: 'Staff Attendance & Shift Roster',
  TEMPLATE_03: 'Excavator / Machine Daily Log',
  TEMPLATE_04: 'Fuel Issuance & Reconciliation',
  TEMPLATE_05: 'Mining & Geology Daily Sheet',
  TEMPLATE_06: 'Drum & Sand Pump Shift Log',
  TEMPLATE_07: 'Centrifuge Operation & Cleanup Log',
  TEMPLATE_08: 'Shaking Table Operation Log',
  TEMPLATE_09: 'Gold Recovery & Handover Register',
  TEMPLATE_10: 'Maintenance, Greasing & Washing Log',
  TEMPLATE_11: 'Gate, Search & Items Movement Register',
  TEMPLATE_12: 'Stores, Purchases & Expense Sheet',
  TEMPLATE_13: 'Shift Handover Certificate',
  TEMPLATE_14: 'HR Payroll & Leave Record',
  TEMPLATE_15: 'Petty Cash Daily Report',
};

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderTable(rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) return '<p style="color:#888;font-style:italic;">No data rows.</p>';
  const keys = Object.keys(rows[0]).filter(k => k !== '__id');
  return `
    <table>
      <thead>
        <tr style="background:#f4f4f4;">
          ${keys.map(k => `<th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:12px;text-transform:uppercase;">${escapeHtml(k)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${keys.map(k => {
              const val = row[k];
              const display = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : typeof val === 'object' ? JSON.stringify(val) : escapeHtml(val);
              return `<td style="padding:8px;border:1px solid #ddd;font-size:12px;">${display}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderFieldRows(data: Record<string, any>, excludeKeys: string[] = []): string {
  const excluded = new Set([...excludeKeys, 'rows', 'secondaryRows', 'signature', 'signatures', '__id']);
  return Object.entries(data)
    .filter(([k]) => !excluded.has(k))
    .map(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) return '';
      if (Array.isArray(v)) return '';
      const display = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : escapeHtml(v);
      return `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:40%;font-size:12px;">${escapeHtml(k)}</td><td style="padding:8px;border:1px solid #ddd;font-size:12px;">${display}</td></tr>`;
    })
    .filter(Boolean)
    .join('');
}

function renderSignatures(signatures: Record<string, string> | string | undefined): string {
  if (!signatures) return '';
  if (typeof signatures === 'string') {
    if (signatures.startsWith('data:image')) {
      return `<div style="margin-top:20px;"><p style="font-size:12px;font-weight:bold;">Signature</p><img src="${signatures}" style="max-width:300px;border:1px solid #ddd;padding:8px;" /></div>`;
    }
    return `<div style="margin-top:20px;"><p style="font-size:12px;font-weight:bold;">Verification</p><p style="font-size:12px;">${escapeHtml(signatures)}</p></div>`;
  }
  return Object.entries(signatures)
    .map(([role, value]) => {
      if (value.startsWith('data:image')) {
        return `<div style="margin-top:15px;display:inline-block;margin-right:30px;"><p style="font-size:11px;font-weight:bold;text-transform:uppercase;">${escapeHtml(role)}</p><img src="${value}" style="max-width:200px;border:1px solid #ddd;padding:4px;" /></div>`;
      }
      return `<div style="margin-top:15px;display:inline-block;margin-right:30px;"><p style="font-size:11px;font-weight:bold;text-transform:uppercase;">${escapeHtml(role)}</p><p style="font-size:11px;color:#444;">${escapeHtml(value)}</p></div>`;
    })
    .join('');
}

export function generateReportHtml(report: any, templateId?: string): string {
  const tid = templateId || report.reportType || 'UNKNOWN';
  const templateName = TEMPLATE_NAMES[tid] || tid;
  let parsedData: any = {};
  try {
    parsedData = typeof report.data === 'string' ? JSON.parse(report.data) : (report.data || {});
  } catch {
    parsedData = report.data || {};
  }

  const rows = parsedData.rows;
  const secondaryRows = parsedData.secondaryRows;
  const signatures = parsedData.signatures || parsedData.signature;

  return `<!DOCTYPE html>
<html>
<head>
  <title>${templateName} - ${new Date(report.submittedAt || Date.now()).toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; }
    h1 { font-weight: normal; font-size: 22px; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { font-weight: normal; font-size: 16px; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .header-left { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
    .meta { margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #444; }
    .meta p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .print-btn { background: #000; color: #fff; border: none; padding: 10px 24px; cursor: pointer; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; }
    .print-btn:hover { background: #333; }
    @media print { .print-btn { display: none; } .no-print { display: none; } }
    .footer-sigs { margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="header-left">Titan Mining - Official Report</div>
      <h1>${escapeHtml(templateName)}</h1>
    </div>
  </div>

  <div class="meta">
    <p><strong>Organization:</strong> ${escapeHtml(report.orgId)}</p>
    <p><strong>Site:</strong> ${escapeHtml(report.siteId || 'N/A')}</p>
    <p><strong>Submitted By:</strong> ${escapeHtml(report.userId)}</p>
    <p><strong>Date:</strong> ${new Date(report.submittedAt || Date.now()).toLocaleString()}</p>
    <p><strong>Status:</strong> ${escapeHtml(report.status)}</p>
  </div>

  <h2>Report Fields</h2>
  <table>${renderFieldRows(parsedData)}</table>

  ${rows && Array.isArray(rows) && rows.length > 0 ? `<h2>Primary Records</h2>${renderTable(rows)}` : ''}
  ${secondaryRows && Array.isArray(secondaryRows) && secondaryRows.length > 0 ? `<h2>Secondary Records</h2>${renderTable(secondaryRows)}` : ''}

  ${signatures ? `<div class="footer-sigs"><h2>Sign-Off Verification</h2>${renderSignatures(signatures)}</div>` : ''}

</body>
</html>`;
}

export function openReportPdf(report: any, templateId?: string): void {
  const html = generateReportHtml(report, templateId);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
