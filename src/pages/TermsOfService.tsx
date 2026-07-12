import React from 'react';

export default function TermsOfService({ onClose }: { onClose: () => void }) {
  return (
    <div className="max-w-3xl mx-auto p-12 bg-white text-black border border-black my-8 relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-xs uppercase tracking-widest text-zinc-400 hover:text-black font-semibold"
      >
        [Close]
      </button>

      <h1 className="editorial-title text-3xl font-light mb-8 border-b border-black pb-4">
        Terms of Service
      </h1>

      <div className="space-y-6 font-serif italic text-zinc-700 leading-relaxed text-sm">
        <p>
          Welcome to Alluvial Site Manager. By accessing and using this site-management application, you agree to comply with and be bound by the following terms and conditions of use.
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">1. License & Subscription</h3>
        <p>
          We grant you a non-exclusive, non-transferable, revocable license to access our platform solely for your mining operations, subject to timely payment of the subscription fees ($500/month or annual equivalent).
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">2. Multi-Tenant Isolation</h3>
        <p>
          Each tenant's data is strictly partitioned and isolated. You retain full ownership of all data submitted via your organization portal. We do not inspect or utilize operational logs except as required for maintenance and troubleshooting.
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">3. Digital Signatures & Records</h3>
        <p>
          You agree that all digital signatures captured on the platform are intended to serve as legally binding verifications of operational entries under your organization.
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">4. Limitation of Liability</h3>
        <p>
          Alluvial Africa is not liable for data loss due to local offline queue corruption or sync issues arising from incorrect client device configurations. Ensure regular reviews of synchronized cloud history records.
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-zinc-200 text-center">
        <button onClick={onClose} className="minimal-btn">
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
