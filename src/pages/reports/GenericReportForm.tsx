import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
import DigitalSignature from '../../components/DigitalSignature';
import VarianceAlert from '../../components/VarianceAlert';

interface FieldSpec {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'time';
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

interface FormSpec {
  title: string;
  fields: FieldSpec[];
  calculate?: (values: any, setValue: any) => void;
  validate?: (values: any) => string | null;
  getVarianceMessage?: (values: any) => string | null;
}

export default function GenericReportForm({ templateId }: { templateId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { saveDraft, submitReport, loadDraft } = useReport();
  
  const [signature, setSignature] = useState<string>('');
  const [varianceMessage, setVarianceMessage] = useState<string | null>(null);

  // Define specs for all templates dynamically
  const formSpecs: Record<string, FormSpec> = {
    TEMPLATE_02: {
      title: 'Template 02: Staff Attendance & Shift Roster',
      fields: [
        { name: 'shiftName', label: 'Shift Name', type: 'select', required: true, options: [{ value: 'SHIFT_1', label: 'Shift 1 (Day)' }, { value: 'SHIFT_2', label: 'Shift 2 (Night)' }] },
        { name: 'supervisorName', label: 'Supervisor Name', type: 'text', required: true },
        { name: 'totalStaffCount', label: 'Total Expected Staff', type: 'number', required: true },
        { name: 'presentStaffCount', label: 'Present Staff Count', type: 'number', required: true },
        { name: 'absentStaffCount', label: 'Absent Staff Count', type: 'number', required: true },
        { name: 'absenteeNames', label: 'Absentee Names & Reasons', type: 'textarea' },
      ],
      calculate: (values, setValue) => {
        const total = Number(values.totalStaffCount || 0);
        const present = Number(values.presentStaffCount || 0);
        const absent = Number(values.absentStaffCount || 0);
        const variance = total - (present + absent);
        setValue('staffVariance', variance);
      },
      getVarianceMessage: (values) => {
        const total = Number(values.totalStaffCount || 0);
        const present = Number(values.presentStaffCount || 0);
        const absent = Number(values.absentStaffCount || 0);
        const variance = total - (present + absent);
        if (variance !== 0) {
          return `Attendance discrepancy detected. Discrepancy: ${variance} staff. Please verify counts.`;
        }
        return null;
      }
    },
    TEMPLATE_03: {
      title: 'Template 03: Excavator / Machine Daily Log',
      fields: [
        { name: 'machineId', label: 'Machine ID', type: 'select', required: true, options: [{ value: 'CAT_1', label: 'CAT 1 (Caterpillar)' }, { value: 'SANY_1', label: 'SANY 1 (Sany)' }] },
        { name: 'operatorName', label: 'Operator Name', type: 'text', required: true },
        { name: 'openingHours', label: 'Opening Hour Meter', type: 'number', required: true },
        { name: 'closingHours', label: 'Closing Hour Meter', type: 'number', required: true },
        { name: 'breakdowns', label: 'Breakdowns / Issues / Delays', type: 'textarea' },
      ],
      calculate: (values, setValue) => {
        const opening = Number(values.openingHours || 0);
        const closing = Number(values.closingHours || 0);
        if (closing >= opening) {
          setValue('hoursWorked', parseFloat((closing - opening).toFixed(1)));
        }
      },
      validate: (values) => {
        const opening = Number(values.openingHours || 0);
        const closing = Number(values.closingHours || 0);
        if (closing < opening) {
          return 'Closing meter reading cannot be less than opening meter.';
        }
        if (closing - opening > 24) {
          return 'Operating hours cannot exceed 24 hours in a single shift.';
        }
        return null;
      }
    },
    TEMPLATE_05: {
      title: 'Template 05: Mining & Geology Daily Sheet',
      fields: [
        { name: 'pitSection', label: 'Pit Section', type: 'select', required: true, options: [{ value: 'PIT_A', label: 'Pit Area A' }, { value: 'PIT_B', label: 'Pit Area B' }] },
        { name: 'benchLevel', label: 'Bench Level (m)', type: 'number', required: true },
        { name: 'excavatorId', label: 'Excavator Assigned', type: 'text', required: true },
        { name: 'truckLoadsCount', label: 'Total Truck Loads Hauled', type: 'number', required: true },
        { name: 'estimatedGrade', label: 'Estimated Ore Grade (g/m³)', type: 'number', required: true },
        { name: 'geologistRemarks', label: 'Geological Remarks', type: 'textarea' },
      ],
      calculate: (values, setValue) => {
        const loads = Number(values.truckLoadsCount || 0);
        const grade = Number(values.estimatedGrade || 0);
        setValue('estimatedTotalVolumeM3', loads * 12); // Assuming 12m3 per truck load
        setValue('estimatedGoldContentG', parseFloat((loads * 12 * grade).toFixed(2)));
      }
    },
    TEMPLATE_06: {
      title: 'Template 06: Drum & Sand Pump Shift Log',
      fields: [
        { name: 'pumpId', label: 'Pump Unit', type: 'select', required: true, options: [{ value: 'PUMP_01', label: 'Sand Pump 1' }, { value: 'PUMP_02', label: 'Sand Pump 2' }] },
        { name: 'operatorName', label: 'Operator Name', type: 'text', required: true },
        { name: 'inletPressure', label: 'Inlet Pressure (Bar)', type: 'number', required: true },
        { name: 'outletPressure', label: 'Outlet Pressure (Bar)', type: 'number', required: true },
        { name: 'slurryDensity', label: 'Slurry Density (g/L)', type: 'number', required: true },
        { name: 'operatingHours', label: 'Operating Hours (hrs)', type: 'number', required: true },
      ]
    },
    TEMPLATE_07: {
      title: 'Template 07: Centrifuge Operation & Cleanup Log',
      fields: [
        { name: 'centrifugeId', label: 'Centrifuge ID', type: 'select', required: true, options: [{ value: 'CENT_1', label: 'Centrifuge 1' }, { value: 'CENT_2', label: 'Centrifuge 2' }] },
        { name: 'feedRateM3Hr', label: 'Feed Rate (m³/Hr)', type: 'number', required: true },
        { name: 'operatingHours', label: 'Operating Hours (hrs)', type: 'number', required: true },
        { name: 'concentrateWeightG', label: 'Concentrate Weight Recovered (g)', type: 'number', required: true },
        { name: 'cleanupOperatorName', label: 'Cleanup Operator Name', type: 'text', required: true },
      ]
    },
    TEMPLATE_08: {
      title: 'Template 08: Shaking Table Operation Log',
      fields: [
        { name: 'tableId', label: 'Shaking Table ID', type: 'select', required: true, options: [{ value: 'TABLE_1', label: 'Shaking Table 1' }, { value: 'TABLE_2', label: 'Shaking Table 2' }] },
        { name: 'feedRateM3Hr', label: 'Feed Rate (m³/Hr)', type: 'number', required: true },
        { name: 'operatingHours', label: 'Operating Hours (hrs)', type: 'number', required: true },
        { name: 'concentrateWeightG', label: 'Concentrate Weight Recovered (g)', type: 'number', required: true },
        { name: 'tableOperatorName', label: 'Table Operator Name', type: 'text', required: true },
      ]
    },
    TEMPLATE_09: {
      title: 'Template 09: Gold Recovery & Handover Register',
      fields: [
        { name: 'recoveryOfficerName', label: 'Recovery Officer Name', type: 'text', required: true },
        { name: 'witnessName', label: 'Witness Name (Security/Management)', type: 'text', required: true },
        { name: 'grossWeightG', label: 'Gross Weight (g)', type: 'number', required: true },
        { name: 'tareWeightG', label: 'Tare Weight (g)', type: 'number', required: true },
        { name: 'purityPct', label: 'Estimated Purity (%)', type: 'number', required: true },
        { name: 'vaultBoxId', label: 'Security Vault Box ID', type: 'text', required: true },
      ],
      calculate: (values, setValue) => {
        const gross = Number(values.grossWeightG || 0);
        const tare = Number(values.tareWeightG || 0);
        const purity = Number(values.purityPct || 0);
        if (gross >= tare) {
          const net = gross - tare;
          setValue('netWeightG', parseFloat(net.toFixed(2)));
          setValue('pureGoldG', parseFloat((net * (purity / 100)).toFixed(2)));
        }
      },
      validate: (values) => {
        if (values.recoveryOfficerName === values.witnessName) {
          return 'Segregation of Duties: Recovery Officer and Witness must be different individuals.';
        }
        const gross = Number(values.grossWeightG || 0);
        const tare = Number(values.tareWeightG || 0);
        if (gross < tare) {
          return 'Gross weight cannot be less than tare weight.';
        }
        return null;
      }
    },
    TEMPLATE_10: {
      title: 'Template 10: Maintenance, Greasing & Washing Log',
      fields: [
        { name: 'machineId', label: 'Machine ID', type: 'select', required: true, options: [{ value: 'CAT_1', label: 'CAT 1 (Caterpillar)' }, { value: 'SANY_1', label: 'SANY 1 (Sany)' }] },
        { name: 'mechanicName', label: 'Mechanic Name', type: 'text', required: true },
        { name: 'greasingStatus', label: 'Greasing Completed', type: 'checkbox' },
        { name: 'filterChangeStatus', label: 'Filters Changed', type: 'checkbox' },
        { name: 'washingStatus', label: 'Washing Completed', type: 'checkbox' },
        { name: 'mechanicNotes', label: 'Mechanic Notes / Spares Used', type: 'textarea' },
      ]
    },
    TEMPLATE_11: {
      title: 'Template 11: Gate, Search & Items Movement Register',
      fields: [
        { name: 'guardName', label: 'Security Guard Name', type: 'text', required: true },
        { name: 'visitorName', label: 'Visitor Name', type: 'text', required: true },
        { name: 'visitorCompany', label: 'Visitor Company / Org', type: 'text' },
        { name: 'vehiclePlate', label: 'Vehicle Plate Number', type: 'text' },
        { name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'text', required: true },
        { name: 'searchConducted', label: 'Physical Search Conducted', type: 'checkbox', required: true },
        { name: 'timeIn', label: 'Time In', type: 'time', required: true },
        { name: 'timeOut', label: 'Time Out', type: 'time' },
      ],
      validate: (values) => {
        if (values.searchConducted === false) {
          return 'Security warning: Physical search verification must be conducted and confirmed.';
        }
        return null;
      }
    },
    TEMPLATE_12: {
      title: 'Template 12: Stores, Purchases & Expense Sheet',
      fields: [
        { name: 'purchaserName', label: 'Purchaser Name', type: 'text', required: true },
        { name: 'itemName', label: 'Item Name', type: 'text', required: true },
        { name: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
        { name: 'quantity', label: 'Quantity Purchased', type: 'number', required: true },
        { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', required: true },
        { name: 'remarks', label: 'Remarks / Category', type: 'textarea' },
      ],
      calculate: (values, setValue) => {
        const qty = Number(values.quantity || 0);
        const price = Number(values.unitPrice || 0);
        setValue('totalPrice', parseFloat((qty * price).toFixed(2)));
      }
    },
    TEMPLATE_13: {
      title: 'Template 13: Shift Handover Certificate',
      fields: [
        { name: 'outgoingSupervisor', label: 'Outgoing Shift Supervisor', type: 'text', required: true },
        { name: 'incomingSupervisor', label: 'Incoming Shift Supervisor', type: 'text', required: true },
        { name: 'safetyIncidents', label: 'Safety / Security Incidents', type: 'textarea', required: true },
        { name: 'productionStatus', label: 'Production Status & Bench Handover', type: 'textarea', required: true },
        { name: 'handoverApproved', label: 'Handover Confirmed & Approved', type: 'checkbox', required: true },
      ],
      validate: (values) => {
        if (values.outgoingSupervisor === values.incomingSupervisor) {
          return 'Segregation of Duties: Outgoing and Incoming supervisors must be different individuals.';
        }
        if (values.handoverApproved !== true) {
          return 'Both supervisors must confirm and approve handover checkbox to submit.';
        }
        return null;
      }
    },
    TEMPLATE_14: {
      title: 'Template 14: Petty Cash Daily Report',
      fields: [
        { name: 'cashierName', label: 'Cashier Name', type: 'text', required: true },
        { name: 'openingBalance', label: 'Opening Balance (USD)', type: 'number', required: true },
        { name: 'totalExpenses', label: 'Total Shift Expenses (USD)', type: 'number', required: true },
        { name: 'closingBalance', label: 'Closing Cash Balance (USD)', type: 'number', required: true },
      ],
      calculate: (values, setValue) => {
        const opening = Number(values.openingBalance || 0);
        const expenses = Number(values.totalExpenses || 0);
        setValue('calculatedBalance', parseFloat((opening - expenses).toFixed(2)));
      },
      validate: (values) => {
        const opening = Number(values.openingBalance || 0);
        const expenses = Number(values.totalExpenses || 0);
        const closing = Number(values.closingBalance || 0);
        const variance = closing - (opening - expenses);
        setValue('cashVariance', parseFloat(variance.toFixed(2)));
        return null;
      },
      getVarianceMessage: (values) => {
        const opening = Number(values.openingBalance || 0);
        const expenses = Number(values.totalExpenses || 0);
        const closing = Number(values.closingBalance || 0);
        const variance = closing - (opening - expenses);
        if (Math.abs(variance) > 0) {
          return `Petty cash variance detected. Discrepancy: ${variance > 0 ? '+' : ''}${variance} USD. Please explain the cash drawer variance.`;
        }
        return null;
      }
    }
  };

  const spec = formSpecs[templateId];

  const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: loadDraft(templateId) || {},
  });

  const formValues = watch();

  // Run Calculations and Validations
  useEffect(() => {
    if (spec?.calculate) {
      spec.calculate(formValues, setValue);
    }
    if (spec?.getVarianceMessage) {
      setVarianceMessage(spec.getVarianceMessage(formValues));
    } else {
      setVarianceMessage(null);
    }
  }, [formValues, setValue, spec]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(templateId, formValues);
    }, 30000);
    return () => clearInterval(interval);
  }, [formValues, templateId, saveDraft]);

  if (!spec) {
    return (
      <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
        {t('reports_form.specNotDefined', { templateId })}
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    if (!signature) {
      alert(t('reports_form.signatureRequired'));
      return;
    }

    // Run custom validation rules
    if (spec.validate) {
      const errorMsg = spec.validate(data);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
    }

    try {
      await submitReport(templateId, {
        ...data,
        signature,
      });
      alert(`${spec.title} ${t('reports_form.submittedSuccess')}`);
      setSignature('');
    } catch (err: any) {
      alert(err.message || t('reports_form.submissionFailed'));
    }
  };

  return (
    <div className="max-w-3xl py-4">


      {varianceMessage && (
        <VarianceAlert type="warning" message={varianceMessage} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {spec.fields.map(f => (
          <div key={f.name}>
            <label className="minimal-label">{f.label}</label>
            
            <Controller
              name={f.name}
              control={control}
              rules={{ required: f.required ? `${f.label} is required` : false }}
              render={({ field }) => {
                if (f.type === 'select') {
                  return (
                    <select {...field} className="minimal-select">
                      <option value="">{t('reports_form.select')}</option>
                      {f.options?.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  );
                }
                
                if (f.type === 'textarea') {
                  return <textarea {...field} rows={3} className="minimal-input w-full" placeholder={t('reports_form.enterDetails')} />;
                }
                
                if (f.type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="mt-2 h-4 w-4 border-black text-black focus:ring-black accent-black cursor-pointer"
                    />
                  );
                }
                
                return (
                  <input
                    type={f.type}
                    {...field}
                    className="minimal-input"
                    disabled={f.disabled}
                    placeholder={t('reports_form.enterValue')}
                  />
                );
              }}
            />
            {errors[f.name] && (
              <span className="text-xs text-red-600 mt-1 block">{(errors[f.name] as any).message}</span>
            )}
          </div>
        ))}

        {/* Display calculated values read-only if present */}
        {formValues.hoursWorked !== undefined && (
          <div className="bg-zinc-50 p-4 border border-zinc-200">
            <label className="minimal-label">Calculated Hours Worked (Auto)</label>
            <input type="text" value={formValues.hoursWorked} disabled className="minimal-input font-semibold" />
          </div>
        )}

        {formValues.estimatedTotalVolumeM3 !== undefined && (
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 border border-zinc-200">
            <div>
              <label className="minimal-label">Est. Total Volume (m³)</label>
              <input type="text" value={formValues.estimatedTotalVolumeM3} disabled className="minimal-input font-semibold" />
            </div>
            <div>
              <label className="minimal-label">Est. Gold Content (g)</label>
              <input type="text" value={formValues.estimatedGoldContentG} disabled className="minimal-input font-semibold" />
            </div>
          </div>
        )}

        {formValues.netWeightG !== undefined && (
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 border border-zinc-200">
            <div>
              <label className="minimal-label">Net Gold Weight (g)</label>
              <input type="text" value={formValues.netWeightG} disabled className="minimal-input font-semibold" />
            </div>
            <div>
              <label className="minimal-label">Pure Gold Weight (g)</label>
              <input type="text" value={formValues.pureGoldG} disabled className="minimal-input font-semibold" />
            </div>
          </div>
        )}

        {formValues.totalPrice !== undefined && (
          <div className="bg-zinc-50 p-4 border border-zinc-200">
            <label className="minimal-label">Calculated Total Cost (USD)</label>
            <input type="text" value={`$${formValues.totalPrice}`} disabled className="minimal-input font-bold" />
          </div>
        )}

        {formValues.calculatedBalance !== undefined && (
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 border border-zinc-200">
            <div>
              <label className="minimal-label">Calculated Drawer Balance (USD)</label>
              <input type="text" value={`$${formValues.calculatedBalance}`} disabled className="minimal-input font-semibold" />
            </div>
            <div>
              <label className="minimal-label font-bold text-black">Actual Drawer Balance Variance</label>
              <input type="text" value={`$${formValues.cashVariance || 0}`} disabled className="minimal-input font-bold border-b-2 border-black" />
            </div>
          </div>
        )}

        {/* Digital Signature */}
        <div className="border-t border-black pt-6">
          <label className="minimal-label mb-2">{t('reports_form.digitalSignature')}</label>
          <DigitalSignature onSign={setSignature} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">{t('reports_form.submitReport')}
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft(templateId, formValues);
              alert(t('reports_form.draftSaved'));
            }}
            className="minimal-btn-secondary"
          >{t('reports_form.saveDraft')}
          </button>
        </div>
      </form>
    </div>
  );
}
