import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import DigitalSignature from '../../components/DigitalSignature';
import { SiteDailySummaryData } from '../../types/reports';

export default function SiteDailySummary() {
  const { user } = useAuth();
  const { saveDraft, submitReport, loadDraft } = useReport();
  const { control, watch, setValue, handleSubmit } = useForm<SiteDailySummaryData>({
    defaultValues: loadDraft('TEMPLATE_01') || {
      materialMinedM3: 450,
      materialProcessedM3: 420,
      pitAreaWorked: 'Zone Alpha Bench 2',
      centrifugeRecoveryG: 185.50,
      shakingTableRecoveryG: 120.20,
      sluiceCleanupG: 45.30,
      totalGoldRecoveryG: 351.00,
      fuelOpeningStockL: 5000,
      fuelReceivedL: 1000,
      fuelIssuedL: 1200,
      fuelClosingStockL: 4800,
      fuelVarianceL: 0,
    },
  });

  const [signature, setSignature] = useState<string>('');

  const centrifuge = watch('centrifugeRecoveryG');
  const shakingTable = watch('shakingTableRecoveryG');
  const sluice = watch('sluiceCleanupG');
  const fOpening = watch('fuelOpeningStockL');
  const fReceived = watch('fuelReceivedL');
  const fIssued = watch('fuelIssuedL');
  const fClosing = watch('fuelClosingStockL');

  // Calculate total gold recovery
  useEffect(() => {
    const total = Number(centrifuge || 0) + Number(shakingTable || 0) + Number(sluice || 0);
    setValue('totalGoldRecoveryG', parseFloat(total.toFixed(2)));
  }, [centrifuge, shakingTable, sluice, setValue]);

  // Calculate fuel variance
  useEffect(() => {
    const expectedClosing = Number(fOpening || 0) + Number(fReceived || 0) - Number(fIssued || 0);
    const variance = Number(fClosing || 0) - expectedClosing;
    setValue('fuelVarianceL', parseFloat(variance.toFixed(2)));
  }, [fOpening, fReceived, fIssued, fClosing, setValue]);

  const onSubmit = async (data: SiteDailySummaryData) => {
    if (!signature) {
      alert('Digital signature is required to verify and sign off the site daily summary.');
      return;
    }

    try {
      await submitReport('TEMPLATE_01', {
        ...data,
        signature,
      });
      alert('Site Daily Summary verified and signed off successfully.');
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    }
  };

  return (
    <div className="max-w-3xl py-4">

      
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-6">
        Consolidated daily site status & production totals (Auto-aggregated)
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Production totals */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">Production Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="minimal-label">Total Material Mined (m³)</label>
              <Controller
                name="materialMinedM3"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input font-semibold" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Total Material Processed (m³)</label>
              <Controller
                name="materialProcessedM3"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input font-semibold" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Active Pit Area Worked</label>
              <Controller
                name="pitAreaWorked"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="text" {...field} className="minimal-input font-semibold" />
                )}
              />
            </div>
          </div>
        </div>

        {/* Gold recovery */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">Gold Recovery Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <label className="minimal-label">Centrifuge Recovery (g)</label>
              <Controller
                name="centrifugeRecoveryG"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" step="0.01" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Shaking Table (g)</label>
              <Controller
                name="shakingTableRecoveryG"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" step="0.01" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Sluice Cleanup (g)</label>
              <Controller
                name="sluiceCleanupG"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" step="0.01" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label font-bold text-black">Total Gold Weight (g)</label>
              <Controller
                name="totalGoldRecoveryG"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className="minimal-input font-bold border-b-2 border-black" />
                )}
              />
            </div>
          </div>
        </div>

        {/* Fuel reconciliation summary */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">Fuel Inventory (L)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="minimal-label">Opening Physical Stock</label>
              <Controller
                name="fuelOpeningStockL"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Received Stock</label>
              <Controller
                name="fuelReceivedL"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Issued Stock</label>
              <Controller
                name="fuelIssuedL"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <label className="minimal-label">Closing Physical Stock</label>
              <Controller
                name="fuelClosingStockL"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input type="number" {...field} className="minimal-input" />
                )}
              />
            </div>
            <div>
              <label className="minimal-label">Physical Variance (L)</label>
              <Controller
                name="fuelVarianceL"
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} disabled className={`minimal-input font-bold ${field.value !== 0 ? 'text-red-600 border-red-500' : ''}`} />
                )}
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="minimal-label">Site Remarks / Exceptions</label>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <textarea {...field} rows={3} className="minimal-input w-full font-serif italic" placeholder="Add comments here..." />
            )}
          />
        </div>

        {/* Digital Signature */}
        <div className="border-t border-black pt-6">
          <label className="minimal-label mb-2">Controller Sign-Off Verification Signature</label>
          <DigitalSignature onSign={setSignature} />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">
            Verify & Approve Daily Site Summary
          </button>
        </div>
      </form>
    </div>
  );
}
