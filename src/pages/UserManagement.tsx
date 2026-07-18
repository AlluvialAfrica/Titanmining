import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Role } from '../types/roles';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { getDataClient } from '../services/dataService';

interface UserCreationFormData {
  role: Role;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  idNumber: string;
  nokFirstName: string;
  nokLastName: string;
  nokMobileNumber: string;
}

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  mobileNumber: string;
  email?: string;
  orgId: string;
  siteId: string;
  status: string;
}

export default function UserManagement() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserCreationFormData>();
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [welcomePreview, setWelcomePreview] = useState<any | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const phoneRegex = /^\+254[0-9]{9}$/;

  // Load users from AppSync on mount
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const client = getDataClient();
      const { data } = await client.models.User.list();
      if (data && data.length > 0) {
        setUsersList(data.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          mobileNumber: u.mobileNumber,
          email: u.email || '',
          orgId: u.orgId,
          siteId: u.orgId,
          status: u.status || 'PENDING',
        })));
      }
    } catch (err) {
      console.error('Failed to load users from AppSync:', err);
      // Fallback: load from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('registeredTenants') || '[]');
        setUsersList(saved);
      } catch (fallbackErr) {
        console.warn('Failed to load users from localStorage fallback:', fallbackErr);
        setUsersList([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  }

  const onSubmit = async (data: UserCreationFormData) => {
    if (!user) return;

    const rng = new Uint32Array(1);
    crypto.getRandomValues(rng);
    const username = (data.firstName.toLowerCase() + data.lastName.toLowerCase() + (rng[0] % 90 + 10)).replace(/\s/g, '');
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    const pwBytes = new Uint8Array(12);
    crypto.getRandomValues(pwBytes);
    const tempPassword = Array.from(pwBytes, b => chars[b % chars.length]).join('') + 'A1!';

    const newUser: UserRecord = {
      id: `user_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      mobileNumber: data.mobileNumber,
      email: data.email,
      orgId: user.orgId,
      siteId: user.siteId,
      status: 'PENDING',
    };

    // Persist to AppSync
    try {
      const client = getDataClient();
      await client.models.User.create({
        orgId: user.orgId,
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        email: data.email,
        idNumber: data.idNumber,
        role: data.role,
        status: 'PENDING',
        nextOfKin: {
          firstName: data.nokFirstName,
          lastName: data.nokLastName,
          mobileNumber: data.nokMobileNumber,
        },
        createdBy: user.id,
      });
    } catch (err) {
      console.error('Failed to create user in AppSync:', err);
    }

    setUsersList([...usersList, newUser]);

    setWelcomePreview({
      firstName: data.firstName,
      username,
      password: tempPassword,
      mobileNumber: data.mobileNumber,
      portalUrl: 'alluvial.africa',
    });

    setShowAddForm(false);
    reset();
  };

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
        <h1 className="editorial-title text-2xl font-light">{t('users.directory')}</h1>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="minimal-btn"
          >
            {t('users.addStaff')}
          </button>
        )}
      </div>

      {welcomePreview && (
        <div className="border border-black p-6 bg-zinc-50 mb-8 max-w-xl">
          <h3 className="font-serif italic text-lg mb-4 text-black flex justify-between items-center">
            <span>{t('users.welcomeSent')}</span>
            <button
              onClick={() => setWelcomePreview(null)}
              className="text-xs font-mono uppercase text-zinc-400 hover:text-black"
            >
              [{t('users.dismiss')}]
            </button>
          </h3>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-2">{t('users.sentTo')}: {welcomePreview.mobileNumber}</p>
          <div className="border border-zinc-200 bg-white p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-black">
{`Welcome to Alluvial Site Manager, ${welcomePreview.firstName}.

Your login credentials:
Username: ${welcomePreview.username}
Password: ${welcomePreview.password}

Login: https://${welcomePreview.portalUrl}

Please change your password on first login.`}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="border border-black p-8 max-w-xl bg-white mb-8">
          <h3 className="font-serif italic text-lg mb-6 text-black border-b border-zinc-150 pb-2">{t('users.createAccount')}</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="minimal-label">{t('users.firstName')}</label>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: t('users.firstNameRequired') }}
                  render={({ field }) => (
                    <input type="text" {...field} className="minimal-input" />
                  )}
                />
              </div>
              <div>
                <label className="minimal-label">{t('users.lastName')}</label>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: t('users.lastNameRequired') }}
                  render={({ field }) => (
                    <input type="text" {...field} className="minimal-input" />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="minimal-label">{t('users.mobileFormat')}</label>
              <Controller
                name="mobileNumber"
                control={control}
                rules={{
                  required: t('users.mobileRequired'),
                  pattern: { value: phoneRegex, message: t('users.mobileInvalid') }
                }}
                render={({ field }) => (
                  <input type="tel" {...field} className="minimal-input" placeholder="+254722828481" />
                )}
              />
              {errors.mobileNumber && <span className="text-xs text-red-600 mt-1 block">{errors.mobileNumber.message}</span>}
            </div>

            <div>
              <label className="minimal-label">{t('users.email')}</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input type="email" {...field} className="minimal-input" />
                )}
              />
            </div>

            <div>
              <label className="minimal-label">{t('users.idNumber')}</label>
              <Controller
                name="idNumber"
                control={control}
                render={({ field }) => (
                  <input type="text" {...field} className="minimal-input" />
                )}
              />
            </div>

            <div>
              <label className="minimal-label">{t('users.roleAssignment')}</label>
              <Controller
                name="role"
                control={control}
                rules={{ required: t('users.roleRequired') }}
                render={({ field }) => (
                  <select {...field} className="minimal-select">
                    <option value="">{t('users.chooseRole')}</option>
                    {Object.values(Role).map(r => (
                      <option key={r} value={r}>{t(`roles.${r}`)}</option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="border-t border-zinc-100 pt-6">
              <h4 className="font-serif italic text-sm mb-4 text-black">{t('users.nokDetails')}</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="minimal-label">{t('users.firstName')}</label>
                  <Controller
                    name="nokFirstName"
                    control={control}
                    rules={{ required: t('users.nokFirstNameRequired') }}
                    render={({ field }) => (
                      <input type="text" {...field} className="minimal-input" />
                    )}
                  />
                </div>
                <div>
                  <label className="minimal-label">{t('users.lastName')}</label>
                  <Controller
                    name="nokLastName"
                    control={control}
                    rules={{ required: t('users.nokLastNameRequired') }}
                    render={({ field }) => (
                      <input type="text" {...field} className="minimal-input" />
                    )}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="minimal-label">{t('users.mobileNumber')}</label>
                <Controller
                  name="nokMobileNumber"
                  control={control}
                  rules={{ required: t('users.nokPhoneRequired') }}
                  render={({ field }) => (
                    <input type="tel" {...field} className="minimal-input" placeholder="+254722828481" />
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="minimal-btn">
                {t('users.createBtn')}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="minimal-btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingUsers ? (
        <div className="text-center py-12 font-serif italic text-zinc-400">Loading users...</div>
      ) : (
        <table className="editorial-table">
          <thead>
            <tr>
              <th>{t('users.name')}</th>
              <th>{t('users.role')}</th>
              <th>{t('users.contact')}</th>
              <th>{t('users.status')}</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u: any) => (
              <tr key={u.id}>
                <td className="font-serif italic font-semibold">{u.firstName} {u.lastName}</td>
                <td>{t(`roles.${u.role}`)}</td>
                <td>{u.mobileNumber}</td>
                <td>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider ${
                    u.status === 'ACTIVE'
                      ? 'border-black bg-zinc-50'
                      : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                  }`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
