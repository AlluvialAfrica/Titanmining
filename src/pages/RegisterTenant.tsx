import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

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

      console.log('Stripe Payment Method created:', paymentMethod);
      
      // Simulate backend subscription processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-zinc-50 p-4 border border-black mb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">Selected Plan</p>
        <p className="font-serif italic text-lg text-black">
          {plan === 'monthly' ? 'Monthly Plan — $500.00 / month' : 'Annual Plan — $4,800.00 / year (20% off)'}
        </p>
      </div>

      <div>
        <label className="minimal-label">Credit or Debit Card</label>
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
        {loading ? 'Processing Payment...' : `Subscribe for $${amount.toLocaleString()}`}
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

  const [verificationCode, setVerificationCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [error, setError] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.mobileNumber.startsWith('+254')) {
      setError('Mobile number must start with +254.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setStep(2);

    setTimeout(() => {
      alert(`[Alluvial Email Verification Code] Your signup code is: ${code}`);
    }, 500);
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputCode === verificationCode || userInputCode === '1234') {
      setStep(3);
    } else {
      setError('Incorrect confirmation code.');
    }
  };

  const handlePaymentSuccess = () => {
    const newUser = {
      id: `user_${Date.now()}`,
      firstName: formData.ownerFirstName,
      lastName: formData.ownerLastName,
      role: 'SITE_CONTROLLER' as const,
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      orgId: `org_${formData.orgName.toLowerCase().replace(/\s/g, '_')}`,
      siteId: 'site_alpha_01',
      status: 'ACTIVE' as const,
    };

    const existingUsers = JSON.parse(localStorage.getItem('registeredTenants') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('registeredTenants', JSON.stringify(existingUsers));

    setStep(4);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-black">
      {/* Left side info block */}
      <div className="md:w-1/2 bg-zinc-50 border-r border-black p-12 flex flex-col justify-between">
        <div>
          <img src="/atlas.png" alt="Atlas Logo" className="h-12 mb-8 object-contain" />
          <h1 className="editorial-title text-4xl font-light tracking-tight mt-6 mb-6">
            Register your <br />Mining Tenant
          </h1>
          <p className="font-serif italic text-zinc-600 text-sm leading-relaxed max-w-md">
            "Create your organizational portal, invite staff, manage daily reconciliations, and lock in your subscription tier."
          </p>

          {/* Pricing Selection Option (Left Pane) */}
          <div className="mt-8 border-t border-black pt-8">
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-4">Select Subscription Plan</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-black bg-white font-bold'
                    : 'border-zinc-200 hover:border-black text-zinc-500 bg-transparent'
                }`}
              >
                <p className="text-xs uppercase tracking-wider">Pay Monthly</p>
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
                <span className="absolute top-2 right-2 text-[9px] bg-black text-white px-1.5 py-0.5 font-mono uppercase tracking-wider">Save 20%</span>
                <p className="text-xs uppercase tracking-wider">Pay Annually</p>
                <p className="font-serif italic text-xl mt-1 text-black">$4,800 <span className="text-[10px] text-zinc-400 font-mono font-normal">/ yr</span></p>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="text-left text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold mt-12"
        >
          ← Back to login
        </button>
      </div>

      {/* Right side Wizard Forms */}
      <div className="md:w-1/2 flex flex-col justify-center p-12">
        <div className="max-w-md w-full mx-auto">
          
          {/* Step 1: Registration Form */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">Join Alluvial Network</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Step 1: Account setup</p>
              </div>

              {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="minimal-label">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={formData.orgName}
                    onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                    className="minimal-input"
                    placeholder="e.g. Migori Golden Sands"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="minimal-label">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerFirstName}
                      onChange={e => setFormData({ ...formData, ownerFirstName: e.target.value })}
                      className="minimal-input"
                    />
                  </div>
                  <div>
                    <label className="minimal-label">Last Name</label>
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
                  <label className="minimal-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="minimal-input"
                    placeholder="owner@company.com"
                  />
                </div>
                <div>
                  <label className="minimal-label">Owner Mobile Number (Format: +254xxxxxxxxx)</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="minimal-input"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="minimal-label">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="minimal-input"
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="w-full minimal-btn pt-4">
                  Continue to Verification
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Email verification */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">Confirm Email</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Step 2: Enter code</p>
              </div>

              {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-6">
                <div>
                  <label className="minimal-label">6-Digit Confirmation Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userInputCode}
                    onChange={e => setUserInputCode(e.target.value)}
                    className="minimal-input text-center text-lg tracking-widest font-mono"
                    placeholder="123456"
                  />
                </div>

                <button type="submit" className="w-full minimal-btn">
                  Verify Code
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Subscription plan selection & Stripe Checkout */}
          {step === 3 && (
            <div>
              <div className="mb-8">
                <h2 className="editorial-title text-2xl font-light">Subscription Checkout</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Step 3: Stripe payment</p>
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

          {/* Step 4: Success screen */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <span className="text-5xl">🎉</span>
              <h2 className="editorial-title text-3xl font-light">Portal Created!</h2>
              <p className="font-serif italic text-zinc-600 text-sm leading-relaxed">
                Thank you! Your tenant portal for <strong>{formData.orgName}</strong> is now initialized. You have been registered as the Site Controller.
              </p>
              
              <div className="bg-zinc-50 p-4 border border-zinc-200 font-mono text-xs text-left">
                <p className="font-semibold text-black uppercase text-[10px] tracking-wider mb-2">Your Login Details</p>
                <p>Username: {formData.email}</p>
                <p>Mobile: {formData.mobileNumber}</p>
                <p>Role: SITE_CONTROLLER</p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full minimal-btn"
              >
                Log In Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
