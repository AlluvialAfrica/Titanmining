import React, { useState } from 'react';

interface PricingProps {
  onRegisterClick: () => void;
  onBackClick: () => void;
}

export default function Pricing({ onRegisterClick, onBackClick }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white text-black border border-black my-8 relative">
      <button 
        onClick={onBackClick}
        className="absolute top-6 right-6 text-xs uppercase tracking-widest text-zinc-400 hover:text-black font-semibold"
      >
        [Back]
      </button>

      <div className="text-center mb-12">
        <img src="/atlas.png" alt="Atlas Logo" className="h-10 mx-auto mb-6 object-contain" />
        <h1 className="editorial-title text-4xl font-light mb-4 text-black">Simple, Transparent Pricing</h1>
        <p className="font-serif italic text-zinc-600 text-sm max-w-md mx-auto">
          "Unlocking enterprise-grade site controls, offline-sync reporting and dual-signature verification for your mining site."
        </p>

        {/* Toggle Switch */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className={`text-xs uppercase tracking-wider font-semibold transition-all ${billingCycle === 'monthly' ? 'text-black' : 'text-zinc-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 border border-black rounded-full p-0.5 transition-colors focus:outline-none flex items-center bg-white cursor-pointer"
          >
            <div className={`w-4.5 h-4.5 bg-black rounded-full transition-transform transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs uppercase tracking-wider font-semibold transition-all ${billingCycle === 'annual' ? 'text-black font-bold' : 'text-zinc-400'}`}>
            Annual Billing <span className="text-[9px] bg-black text-white px-1.5 py-0.5 ml-1 font-mono">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Tier Card */}
        <div className="border border-black p-8 bg-white flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Standard Plan</p>
            <h3 className="font-serif italic text-2xl font-light mb-6">Alluvial Operator</h3>
            <div className="border-t border-b border-black py-6 my-6">
              <span className="font-serif text-5xl font-light">
                {billingCycle === 'monthly' ? '$500' : '$400'}
              </span>
              <span className="text-zinc-500 text-xs font-mono lowercase"> / month</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-2">
                {billingCycle === 'monthly' ? 'Billed monthly. Cancel anytime.' : 'Billed as $4,800 annually. Save $1,200/year.'}
              </p>
            </div>
            
            <ul className="space-y-3 text-xs tracking-wide text-zinc-700 list-disc list-inside font-serif italic mb-8">
              <li>14 Operational Roles Templates</li>
              <li>Offline Draft Auto-Save Cache (30s)</li>
              <li>Segregation of Duties checks & alerts</li>
              <li>Touch digital signature capture</li>
              <li>Multi-user site directory manager</li>
              <li>Automatic end-of-shift summaries</li>
            </ul>
          </div>

          <button onClick={onRegisterClick} className="w-full minimal-btn">
            Get Started
          </button>
        </div>

        {/* Value Prop Details */}
        <div className="border border-black p-8 bg-zinc-50 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-serif italic text-xl font-light text-black">Why Alluvial Site Manager?</h3>
            <div className="space-y-4 text-xs leading-relaxed text-zinc-600">
              <p>
                <strong>Offline-First Resilience:</strong> Built specifically for remote alluvial locations. File reports offline during shifts; the system auto-saves drafts locally and pushes them automatically to the cloud once network connectivity is restored.
              </p>
              <p>
                <strong>Operational Compliance:</strong> Enforce rigorous separation of responsibilities on-site. The platform automatically blocks self-verification of cash accounts, gold handovers, and fuel logs.
              </p>
              <p>
                <strong>Audit Readiness:</strong> Securely capture touch-pad signatures and maintain a timestamped history ledger that can be exported directly for regulatory reviews.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono border-t border-zinc-200 pt-6">
            Contact support@alluvial.africa for custom enterprise requirements.
          </div>
        </div>
      </div>
    </div>
  );
}
