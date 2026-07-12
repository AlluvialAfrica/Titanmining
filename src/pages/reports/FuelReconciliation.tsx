import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import DigitalSignature from '../../components/DigitalSignature';
import VarianceAlert from '../../components/VarianceAlert';

interface FuelFormData {
  machineId: string;
  openingMeter: number;
  closingMeter: number;
  hoursWorked: number;
  fuelIssued: number;
  expectedLPerHr: number;
  actualLPerHr: number;
  issuedBy: string;
  receivedBy: string;
  remarks: string;
  openingStock: number;
  received: number;
  totalAvailable: number;
  totalIssued: number;
  closingStock: number;
  variance: number;
  varianceReason: string;
}

const MACHINE_SPECS: Record<string, { brand: string; expectedLPerHr: number }> = {
  'CAT_1': { brand: 'Caterpillar', expectedLPerHr: 25 },
  'CAT_2': { brand: 'Caterpillar', expectedLPerHr: 25 },
  'SANY_1': { brand: 'Sany', expectedLPerHr: 22 },
  'SANY_2': { brand: 'Sany', expectedLPerHr: 22 },
};

export default function FuelReconciliation() {
  const { user } = useAuth();
  const { saveDraft, submitReport, loadDraft } = useReport();
  const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm<FuelFormData>({
    defaultValues: loadDraft('TEMPLATE_04') || {},
  });

  const [showVarianceAlert, setShowVarianceAlert] = useState(false);
  const [signature, setSignature] = useState<string>('');

  const machineId = watch('machineId');
  const openingMeter = watch('openingMeter');
  const closingMeter = watch('closingMeter');
  const fuelIssued = watch('fuelIssued');
  const openingStock = watch('openingStock');
  const received = watch('received');
  const totalIssued = watch('totalIssued');
  const closingStock = watch('closingStock');
  const variance = watch('variance');

  // Auto-calculations for machine usage
  useEffect(() => {
    if (openingMeter && closingMeter && closingMeter > openingMeter) {
      const hours = closingMeter - openingMeter;
      setValue('hoursWorked', parseFloat(hours.toFixed(1)));

      if (machineId && fuelIssued && hours > 0) {
        const expected = MACHINE_SPECS[machineId].expectedLPerHr;
        const actual = fuelIssued / hours;
        setValue('expectedLPerHr', expected);
        setValue('actualLPerHr', parseFloat(actual.toFixed(2)));

        if (actual > expected * 1.2) {
          setShowVarianceAlert(true);
        } else {
          setShowVarianceAlert(false);
        }
      }
    }
  }, [openingMeter, closingMeter, fuelIssued, machineId, setValue]);

  // Auto-calculations for stock levels
  useEffect(() => {
    const oStock = Number(openingStock || 0);
    const rec = Number(received || 0);
    const tIssued = Number(totalIssued || 0);
    const cStock = Number(closingStock || 0);

    const totalAvail = oStock + rec;
    setValue('totalAvailable', totalAvail);

    const calcVariance = cStock - (totalAvail - tIssued);
    setValue('variance', parseFloat(calcVariance.toFixed(2)));

    if (Math.abs(calcVariance) > 50) {
      setShowVarianceAlert(true);
    }
  }, [openingStock, received, totalIssued, closingStock, setValue]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = {
        machineId, openingMeter, closingMeter, fuelIssued,
        openingStock, received, totalIssued, closingStock, variance
      };
      saveDraft('TEMPLATE_04', currentValues);
    }, 30000);
    return () => clearInterval(interval);
  }, [machineId, openingMeter, closingMeter, fuelIssued, openingStock, received, totalIssued, closingStock, variance, saveDraft]);

  const onSubmit = async (data: FuelFormData) => {
    if (!signature) {
      alert('Digital signature is required to sign off the daily reconciliation report.');
      return;
    }

    if (data.issuedBy === data.receivedBy) {
      alert('Segregation of Duties Violation: Fuel issuer and receiver must be different individuals.');
      return;
    }

    if (Math.abs(data.variance) > 0 && !data.varianceReason) {
      alert('Explanation is required when a fuel stock variance is detected.');
      return;
    }

    try {
      await submitReport('TEMPLATE_04', {
        ...data,
        signature,
      });
      alert('Fuel Reconciliation Report submitted successfully.');
      clearSignature();
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    }
  };

  const clearSignature = () => {
    setSignature('');
  };

  return (
    <div className="max-w-3xl py-4">


      {showVarianceAlert && (
        <VarianceAlert 
          type="warning" 
          message="High fuel consumption variance detected. Verify meter readings and stock records. Explanation is mandatory." 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Machine selection */}
        <div>
          <label className="minimal-label">Machine</label>
          <Controller
            name="machineId"
            control={control}
            rules={{ required: 'Machine selection is required' }}
            render={({ field }) => (
              <select {...field} className="minimal-select">
                <option value="">Select Machine...</option>
                <option value="CAT_1">CAT 1 (Caterpillar - Expected 25L/Hr)</option>
                <option value="CAT_2">CAT 2 (Caterpillar - Expected 25L/Hr)</option>
                <option value="SANY_1">SANY 1 (Sany - Expected 22L/Hr)</option>
                <option value="SANY_2">SANY 2 (Sany - Expected 22L/Hr)</option>
              </select>
            )}
          />
          {errors.machineId && <span className="text-xs text-red-600 mt-1 block">{errors.machineId.message}</span>}
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="minimal-label">Opening Meter (Hrs)</label>
            <Controller
              name="openingMeter"
              control={control}
              rules={{ required: 'Opening meter reading is required', min: 0 }}
              render={({ field }) => (
                <input type="number" step="0.1" {...field} className="minimal-input" placeholder="0.0" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">Closing Meter (Hrs)</label>
            <Controller
              name="closingMeter"
              control={control}
              rules={{ required: 'Closing meter reading is required', min: 0 }}
              render={({ field }) => (
                <input type="number" step="0.1" {...field} className="minimal-input" placeholder="0.0" />
              )}
            />
          </div>
        </div>

        {/* Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-zinc-50 p-4 border border-zinc-200">
          <div>
            <label className="minimal-label">Hours Worked (Auto)</label>
            <Controller
              name="hoursWorked"
              control={control}
              render={({ field }) => (
                <input type="number" {...field} disabled className="minimal-input font-semibold" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">Expected L/Hr (Auto)</label>
            <Controller
              name="expectedLPerHr"
              control={control}
              render={({ field }) => (
                <input type="number" {...field} disabled className="minimal-input font-semibold" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">Actual L/Hr (Auto)</label>
            <Controller
              name="actualLPerHr"
              control={control}
              render={({ field }) => (
                <input type="number" {...field} disabled className="minimal-input font-semibold" />
              )}
            />
          </div>
        </div>

        {/* Fuel details */}
        <div>
          <label className="minimal-label">Fuel Issued (Litres)</label>
          <Controller
            name="fuelIssued"
            control={control}
            rules={{ required: 'Fuel volume issued is required', min: 0 }}
            render={({ field }) => (
              <input type="number" step="1" {...field} className="minimal-input" placeholder="0" />
            )}
          />
        </div>

        {/* Dual Sign-off Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-100 pt-6">
          <div>
            <label className="minimal-label">Issued By (Logistics Controller)</label>
            <Controller
              name="issuedBy"
              control={control}
              rules={{ required: 'Issuer name is required' }}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="">Select Issuer...</option>
                  <option value="user_fuel">Sarah Wambui (Logistics Lead)</option>
                  <option value="user_controller">Amoroso Gombe (Controller)</option>
                </select>
              )}
            />
          </div>
          <div>
            <label className="minimal-label">Received By (Machine Operator)</label>
            <Controller
              name="receivedBy"
              control={control}
              rules={{ required: 'Receiver name is required' }}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="">Select Receiver...</option>
                  <option value="user_excavator">Peter Kamau (Operator)</option>
                  <option value="user_geology">Moses Kiprono (Mining Lead)</option>
                  <option value="user_processing">David Ochieng (Processing Lead)</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Stock levels */}
        <div className="border-t border-black pt-6">
          <h3 className="font-serif italic text-lg mb-4 text-black">Stock Reconciliation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="minimal-label">Opening Physical Stock (L)</label>
              <Controller
                name="openingStock"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" placeholder="0" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Fuel Received Today (L)</label>
              <Controller
                name="received"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" placeholder="0" />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div>
              <label className="minimal-label">Total Available Stock (Auto)</label>
              <Controller
                name="totalAvailable"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Total Issued Today (L)</label>
              <Controller
                name="totalIssued"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" placeholder="0" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Closing Physical Stock (L)</label>
              <Controller
                name="closingStock"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" placeholder="0" />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <label className="minimal-label">Physical Variance (L)</label>
              <Controller
                name="variance"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className="minimal-input font-bold" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Variance Explanation</label>
              <Controller
                name="varianceReason"
                control={control}
                render={({ field }) => (
                  <input type="text" {...field} className="minimal-input" placeholder="Required if variance exists..." />
                )}
              />
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="border-t border-black pt-6">
          <label className="minimal-label mb-2">Submitter Digital Signature</label>
          <DigitalSignature onSign={setSignature} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">
            Submit Reconciliation
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft('TEMPLATE_04', watch());
              alert('Draft saved successfully.');
            }}
            className="minimal-btn-secondary"
          >
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
}
