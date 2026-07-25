import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
import MultiSignatureFooter from '../../components/MultiSignatureFooter';
import { SiteDailySummaryData } from '../../types/reports';

export default function SiteDailySummary() {
  const { user } = useAuth();
  const { saveDraft, submitReport, loadDraft } = useReport();
  const { t } = useLanguage();
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

  const [multiSignatures, setMultiSignatures] = useState<Record<string, string>>({});

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
    const requiredSigs = ['siteController'];
    const missing = requiredSigs.filter(r => !multiSignatures[r]);
    if (missing.length > 0) {
      alert(t('siteSummary.signatureRequired'));
      return;
    }

    try {
      await submitReport('TEMPLATE_01', {
        ...data,
        signatures: multiSignatures,
      });
      alert(t('siteSummary.submitSuccess'));
    } catch (err: any) {
      alert(err.message || t('siteSummary.verificationFailed'));
    }
  };

  const numField = (name: keyof SiteDailySummaryData, label: string, opts?: { required?: boolean; disabled?: boolean; step?: string; className?: string }) => (
    <div>
      <label className="minimal-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={{ required: opts?.required }}
        render={({ field }) => (
          <input
            type="number"
            step={opts?.step || '1'}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            value={typeof field.value === 'object' ? '' : (field.value ?? '')}
            disabled={opts?.disabled}
            className={`minimal-input ${opts?.className || ''}`}
          />
        )}
      />
    </div>
  );

  const textField = (name: keyof SiteDailySummaryData, label: string, opts?: { required?: boolean; placeholder?: string; textarea?: boolean }) => (
    <div>
      <label className="minimal-label">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={{ required: opts?.required }}
        render={({ field }) => {
          const val = typeof field.value === 'object' ? '' : (field.value as string || '');
          return opts?.textarea ? (
            <textarea onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} rows={3} className="minimal-input w-full font-serif italic" placeholder={opts?.placeholder} value={val} />
          ) : (
            <input type="text" onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} className="minimal-input font-semibold" value={val} />
          );
        }}
      />
    </div>
  );

  return (
    <div className="max-w-3xl py-4">


      <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-6">
        {t('siteSummary.subtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Production totals */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.productionDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {numField('materialMinedM3', t('siteSummary.materialMined'), { required: true, className: 'font-semibold' })}
            {numField('materialProcessedM3', t('siteSummary.materialProcessed'), { required: true, className: 'font-semibold' })}
            {textField('pitAreaWorked', t('siteSummary.pitAreaWorked'), { required: true })}
          </div>
        </div>

        {/* Gold recovery */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.goldRecovery')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
            {numField('centrifugeRecoveryG', t('siteSummary.centrifugeRecovery'), { required: true, step: '0.01' })}
            {numField('shakingTableRecoveryG', t('siteSummary.shakingTableRecovery'), { required: true, step: '0.01' })}
            {numField('sluiceCleanupG', t('siteSummary.sluiceCleanup'), { required: true, step: '0.01' })}
            <div>
              <label className="minimal-label font-bold text-black">{t('siteSummary.totalGold')}</label>
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
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.fuelInventory')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {numField('fuelOpeningStockL', t('siteSummary.openingStock'), { required: true })}
            {numField('fuelReceivedL', t('siteSummary.receivedStock'), { required: true })}
            {numField('fuelIssuedL', t('siteSummary.issuedStock'), { required: true })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-6">
            {numField('fuelClosingStockL', t('siteSummary.closingStock'), { required: true })}
            <div>
              <label className="minimal-label">{t('siteSummary.variance')}</label>
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

        {/* Machines Section */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.machinesSection')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
            {numField('machineWorkingHours', t('siteSummary.machineWorkingHours'))}
            {numField('machineDowntime', t('siteSummary.machineDowntime'))}
            {numField('machinesDown', t('siteSummary.machinesDown'))}
          </div>
          <div className="mt-4">
            {textField('downtimeReason', t('siteSummary.downtimeReason'), { textarea: true, placeholder: 'Reason for downtime...' })}
          </div>
        </div>

        {/* Staff Section */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.staffSection')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
            {numField('totalPresent', t('siteSummary.totalPresent'))}
            {numField('totalAbsent', t('siteSummary.totalAbsent'))}
            {numField('visitors', t('siteSummary.visitors'))}
            {numField('casualsUsed', t('siteSummary.casualsUsed'))}
          </div>
        </div>

        {/* Security/Gate Section */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.securitySection')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {numField('searchesDone', t('siteSummary.searchesDone'))}
            {numField('vehicleMovements', t('siteSummary.vehicleMovements'))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4">
            {textField('securityItemsInOut', t('siteSummary.securityItemsInOut'), { textarea: true, placeholder: 'Items in/out...' })}
            {textField('securityIncidents', t('siteSummary.securityIncidents'), { textarea: true, placeholder: 'Incidents...' })}
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.expensesSection')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {numField('cashUsed', t('siteSummary.cashUsed'), { step: '0.01' })}
            {numField('purchasesTotal', t('siteSummary.purchasesTotal'), { step: '0.01' })}
          </div>
          <div className="mt-4">
            {textField('pendingRequirements', t('siteSummary.pendingRequirements'), { textarea: true, placeholder: 'Pending requirements...' })}
          </div>
        </div>

        {/* Tomorrow Plan Section */}
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">{t('siteSummary.tomorrowPlanSection')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {textField('pitToMine', t('siteSummary.pitToMine'))}
            {textField('plantTarget', t('siteSummary.plantTarget'))}
            {textField('repairPriority', t('siteSummary.repairPriority'))}
          </div>
          <div className="mt-4">
            {textField('suppliesNeeded', t('siteSummary.suppliesNeeded'), { textarea: true, placeholder: 'Supplies needed...' })}
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="minimal-label">{t('siteSummary.remarks')}</label>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <textarea {...field} rows={3} className="minimal-input w-full font-serif italic" placeholder={t('siteSummary.remarksPlaceholder')} />
            )}
          />
        </div>

        {/* Multi-Signature Footer */}
        <MultiSignatureFooter
          signatories={[
            { role: 'siteController', label: t('siteSummary.siteControllerSignOff') || 'Site Controller', required: true },
            { role: 'ownerDirector', label: t('siteSummary.ownerDirectorReview') || 'Owner / Director Review', required: false },
          ]}
          onSignaturesChange={setMultiSignatures}
        />

        {/* Submit */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">{t('siteSummary.verifyApprove')}</button>
          <button
            type="button"
            onClick={() => window.print()}
            className="minimal-btn-secondary"
          >
            Print / Save PDF
          </button>
        </div>
      </form>
    </div>
  );
}
