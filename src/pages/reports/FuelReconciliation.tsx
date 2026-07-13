import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { t } = useLanguage();
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
      alert(t('fuelRecon.signatureRequired'));
      return;
    }

    if (data.issuedBy === data.receivedBy) {
      alert(t('fuelRecon.sodViolation'));
      return;
    }

    if (Math.abs(data.variance) > 0 && !data.varianceReason) {
      alert(t('fuelRecon.varianceRequired'));
      return;
    }

    try {
      await submitReport('TEMPLATE_04', {
        ...data,
        signature,
      });
      alert(t('fuelRecon.submitSuccess'));
      clearSignature();
    } catch (err: any) {
      alert(err.message || t('reports_form.submissionFailed'));
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
          message={t('fuelRecon.varianceWarning')} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Machine selection */}
        <div>
          <label className="minimal-label">{t('fuelRecon.machine')}</label>
          <Controller
            name="machineId"
            control={control}
            rules={{ required: t('fuelRecon.machineRequired') }}
            render={({ field }) => (
              <select {...field} className="minimal-select">
                <option value="">{t('fuelRecon.selectMachine')}</option>
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
            <label className="minimal-label">{t('fuelRecon.openingMeter')}</label>
            <Controller
              name="openingMeter"
              control={control}
              rules={{ required: t('fuelRecon.openingRequired'), min: 0 }}
              render={({ field }) => (
                <input type="number" step="0.1" {...field} className="minimal-input" placeholder="0.0" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('fuelRecon.closingMeter')}</label>
            <Controller
              name="closingMeter"
              control={control}
              rules={{ required: t('fuelRecon.closingRequired'), min: 0 }}
              render={({ field }) => (
                <input type="number" step="0.1" {...field} className="minimal-input" placeholder="0.0" />
              )}
            />
          </div>
        </div>

        {/* Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-zinc-50 p-4 border border-zinc-200">
          <div>
            <label className="minimal-label">{t('fuelRecon.hoursWorked')}</label>
            <Controller
              name="hoursWorked"
              control={control}
              render={({ field }) => (
                <input type="number" {...field} disabled className="minimal-input font-semibold" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('fuelRecon.expectedLPerHr')}</label>
            <Controller
              name="expectedLPerHr"
              control={control}
              render={({ field }) => (
                <input type="number" {...field} disabled className="minimal-input font-semibold" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('fuelRecon.actualLPerHr')}</label>
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
          <label className="minimal-label">{t('fuelRecon.fuelIssued')}</label>
          <Controller
            name="fuelIssued"
            control={control}
            rules={{ required: t('fuelRecon.fuelRequired'), min: 0 }}
            render={({ field }) => (
              <input type="number" step="1" {...field} className="minimal-input" placeholder="0" />
            )}
          />
        </div>

        {/* Dual Sign-off Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-100 pt-6">
          <div>
            <label className="minimal-label">{t('fuelRecon.issuedBy')}</label>
            <Controller
              name="issuedBy"
              control={control}
              rules={{ required: t('fuelRecon.issuerRequired') }}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="">{t('fuelRecon.selectIssuer')}</option>
                  <option value="user_fuel">Sarah Wambui (Logistics Lead)</option>
                  <option value="user_controller">Amoroso Gombe (Controller)</option>
                </select>
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('fuelRecon.receivedBy')}</label>
            <Controller
              name="receivedBy"
              control={control}
              rules={{ required: t('fuelRecon.receiverRequired') }}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="">{t('fuelRecon.selectReceiver')}</option>
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
          <h3 className="font-serif italic text-lg mb-4 text-black">{t('fuelRecon.stockReconciliation')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="minimal-label">{t('fuelRecon.openingPhysical')}</label>
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
              <label className="minimal-label">{t('fuelRecon.fuelReceived')}</label>
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
              <label className="minimal-label">{t('fuelRecon.totalAvailable')}</label>
              <Controller
                name="totalAvailable"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">{t('fuelRecon.totalIssuedToday')}</label>
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
              <label className="minimal-label">{t('fuelRecon.closingPhysical')}</label>
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
              <label className="minimal-label">{t('fuelRecon.physicalVariance')}</label>
              <Controller
                name="variance"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className="minimal-input font-bold" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">{t('fuelRecon.varianceExplanation')}</label>
              <Controller
                name="varianceReason"
                control={control}
                render={({ field }) => (
                  <input type="text" {...field} className="minimal-input" placeholder={t('fuelRecon.variancePlaceholder')} />
                )}
              />
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="border-t border-black pt-6">
          <label className="minimal-label mb-2">{t('fuelRecon.submitterSignature')}</label>
          <DigitalSignature onSign={setSignature} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">{t('fuelRecon.submitReconciliation')}
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft('TEMPLATE_04', watch());
              alert(t('fuelRecon.draftSaved'));
            }}
            className="minimal-btn-secondary"
          >{t('reports_form.saveDraft')}
          </button>
        </div>
      </form>
    </div>
  );
}
