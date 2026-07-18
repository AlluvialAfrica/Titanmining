import React, { useState } from 'react';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '../contexts/LanguageContext';

const stripePromise = loadStripe('pk_test_51TsR4n3zWruJmWzzj73gR5hNBhLM2fvCGVdB2Blh2pcqX3S324wktIAithotfoQCqgh5G0rlELoQ4twX88aFyvZG00iV5AtHog');

interface RegisterTenantProps {
  onBackToLogin: () => void;
  selectedPlan: 'monthly' | 'annual';
  setSelectedPlan: (plan: 'monthly' | 'annual') => void;
}

function StripeCheckoutForm({ plan, email, orgName, onPaymentSuccess }: { plan: 'monthly' | 'annual'; email: string; orgName: string; onPaymentSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const amount = plan === 'monthly' ? 500 : 4800;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not loaded');

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { email },
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      console.log('Stripe Payment Method created:', paymentMethod?.id);
      // TODO: Send paymentMethod.id to backend to create Stripe subscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message || t('register.paymentFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-zinc-50 p-4 border border-black mb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">{t('register.selectedPlan')}</p>
        <p className="font-serif italic text-lg text-black">
          {plan === 'monthly' ? t('register.monthlyPlanDesc') : t('register.annualPlanDesc')}
        </p>
      </div>

      <div>
        <label className="minimal-label">{t('register.cardLabel')}</label>
        <div className="border border-black p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#000000',
                  fontFamily: 'Inter, sans-serif',
                  '::placeholder': { color: '#a0a0a0' },
                },
                invalid: { color: '#dc2626' },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50">{error}</div>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full minimal-btn"
      >
        {loading ? t('register.processingPayment') : `${t('register.subscribeTo')} $${amount.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function RegisterTenant({ onBackToLogin, selectedPlan, setSelectedPlan }: RegisterTenantProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    orgName: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });

  const [userInputCode, setUserInputCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign up with Cognito
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            phone_number: formData.mobileNumber,
            given_name: formData.ownerFirstName,
            family_name: formData.ownerLastName,
            'custom:role': 'SITE_CONTROLLER',
            'custom:orgId': `org_${formData.orgName.toLowerCase().replace(/\s/g, '_')}`,
            'custom:siteId': 'site_alpha_01',
            'custom:status': 'ACTIVE',
          },
        },
      });

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode: userInputCode,
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || t('register.incorrectCode'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep(4);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-black">
      <div className="md:w-1/2 bg-zinc-50 border-r border-black p-12 flex flex-col justify-between">
        <div>
          <img src="/atlas.png" alt="Atlas Logo" className="h-12 mb-8 object-contain" />
          <h1 className="editorial-title text-4xl font-light tracking-tight mt-6 mb-6">
            {t('register.title')} <br />{t('register.titleBr')}
          </h1>
          <p className="font-serif italic text-zinc-600 text-sm leading-relaxed max-w-md">
            "{t('register.subtitle')}"
          </p>

          <div className="mt-8 border-t border-black pt-8">
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-4">{t('register.selectPlan')}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-black bg-white font-bold'
                    : 'border-zinc-200 hover:border-black text-zinc-500 bg-transparent'
                }`}
              >
                <p className="text-xs uppercase tracking-wider">{t('register.payMonthly')}</p>
                <p className="font-serif italic text-xl mt-1 text-black">$500 <span className="text-[10px] text-zinc-400 font-mono font-normal">/ mo</span></p>
              </button>
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`p-4 border text-left transition-all relative ${
                  selectedPlan === 'annual'
                    ? 'border-black bg-white font-bold'
                    : 'border-zinc-200 hover:border-black text-zinc-500 bg-transparent'
                }`}
              >
                <span className="absolute top-2 right-2 text-[9px] bg-black text-white px-1.5 py-0.5 font-mono uppercase tracking-wider">{t('pricing.save20')}</span>
                <p className="text-xs uppercase tracking-wider">{t('register.payAnnually')}</p>
                <p className="font-serif italic text-xl mt-1 text-black">$4,800 <span className="text-[10px] text-zinc-400 font-mono font-normal">/ yr</span></p>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="text-left text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold mt-12"
        >
          &larr; {t('register.backToLogin')}
        </button>
      </div>

      <div className="md:w-1/2 flex flex-col justify-center p-12">
        <div className="max-w-md w-full mx-auto">

          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">{t('register.joinNetwork')}</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('register.step1')}</p>
              </div>

              {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="minimal-label">{t('register.orgName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.orgName}
                    onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                    className="minimal-input"
                    placeholder={t('register.orgPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="minimal-label">{t('register.firstName')}</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerFirstName}
                      onChange={e => setFormData({ ...formData, ownerFirstName: e.target.value })}
                      className="minimal-input"
                    />
                  </div>
                  <div>
                    <label className="minimal-label">{t('register.lastName')}</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerLastName}
                      onChange={e => setFormData({ ...formData, ownerLastName: e.target.value })}
                      className="minimal-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="minimal-label">{t('register.emailAddress')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="minimal-input"
                    placeholder={t('register.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="minimal-label">{t('register.ownerMobile')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="minimal-input"
                    placeholder={t('register.mobilePlaceholder')}
                  />
                </div>
                <div>
                  <label className="minimal-label">{t('register.password')}</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="minimal-input"
                    placeholder="Min 8 chars, upper + lower + number + symbol"
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full minimal-btn pt-4">
                  {loading ? t('login.processing') : t('register.continueVerification')}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">{t('register.confirmEmail')}</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('register.step2')}</p>
              </div>

              {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-6">
                <div>
                  <label className="minimal-label">{t('register.confirmationCode')}</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userInputCode}
                    onChange={e => setUserInputCode(e.target.value)}
                    className="minimal-input text-center text-lg tracking-widest font-mono"
                    placeholder="123456"
                  />
                  <p className="text-[10px] text-zinc-400 mt-2 font-mono">Check your email for the verification code</p>
                </div>

                <button type="submit" disabled={loading} className="w-full minimal-btn">
                  {loading ? t('login.processing') : t('register.verifyCode')}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">{t('register.subscriptionCheckout')}</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('register.step3')}</p>
              </div>

              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  plan={selectedPlan}
                  email={formData.email}
                  orgName={formData.orgName}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <span className="text-5xl">&#127881;</span>
              <h2 className="editorial-title text-3xl font-light">{t('register.portalCreated')}</h2>
              <p className="font-serif italic text-zinc-600 text-sm leading-relaxed">
                {t('register.thanksMessage', { orgName: formData.orgName })}
              </p>

              <div className="bg-zinc-50 p-4 border border-zinc-200 font-mono text-xs text-left">
                <p className="font-semibold text-black uppercase text-[10px] tracking-wider mb-2">{t('register.loginDetails')}</p>
                <p>{t('register.username')}: {formData.email}</p>
                <p>{t('register.mobile')}: {formData.mobileNumber}</p>
                <p>{t('register.roleLabel')}: SITE_CONTROLLER</p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full minimal-btn"
              >{t('register.loginNow')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
