import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../contexts/LanguageContext';
import { logger } from '../utils/logger';

interface OrgProfileData {
  name: string;
  address: string;
  currency: string;
  timeZone: string;
  businessDayClose: string;
  whatsappNumber: string;
  sites: string;
}

export default function InstitutionalProfile() {
  const { t } = useLanguage();
  const { control, handleSubmit } = useForm<OrgProfileData>({
    defaultValues: {
      name: 'Alluvial Africa Mining Corp',
      address: '10th Floor, Delta Corner Tower, Nairobi, Kenya',
      currency: 'USD',
      timeZone: 'Africa/Nairobi',
      businessDayClose: '17:00',
      whatsappNumber: '+254700000000',
      sites: 'Migori Pit 1, Migori Pit 2, Migori Pit 3',
    },
  });

  const onSubmit = (data: OrgProfileData) => {
    alert(t('profile.updated'));
    logger.debug('Updated Profile:', data);
  };

  return (
    <div className="py-4 max-w-xl">
      <h1 className="editorial-title text-2xl font-light mb-8 border-b border-black pb-4">
        {t('profile.title')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="minimal-label">{t('profile.orgName')}</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input type="text" {...field} className="minimal-input font-semibold" />
            )}
          />
        </div>

        <div>
          <label className="minimal-label">{t('profile.hqAddress')}</label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <input type="text" {...field} className="minimal-input" />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="minimal-label">{t('profile.currency')}</label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('profile.timezone')}</label>
            <Controller
              name="timeZone"
              control={control}
              render={({ field }) => (
                <select {...field} className="minimal-select">
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                  <option value="GMT">GMT (Coordinated Universal Time)</option>
                </select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="minimal-label">{t('profile.businessClose')}</label>
            <Controller
              name="businessDayClose"
              control={control}
              render={({ field }) => (
                <input type="time" {...field} className="minimal-input" />
              )}
            />
          </div>
          <div>
            <label className="minimal-label">{t('profile.whatsappNumber')}</label>
            <Controller
              name="whatsappNumber"
              control={control}
              render={({ field }) => (
                <input type="tel" {...field} className="minimal-input" />
              )}
            />
          </div>
        </div>

        <div>
          <label className="minimal-label">{t('profile.siteLocations')}</label>
          <Controller
            name="sites"
            control={control}
            render={({ field }) => (
              <input type="text" {...field} className="minimal-input" />
            )}
          />
        </div>

        <div className="pt-4">
          <button type="submit" className="minimal-btn">
            {t('profile.saveSettings')}
          </button>
        </div>
      </form>
    </div>
  );
}
