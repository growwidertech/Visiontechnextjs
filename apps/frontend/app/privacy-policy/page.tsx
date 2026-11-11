import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="bg-navy-950 text-white pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">
            LEGAL & DATA GOVERNANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-white/60 mt-2">Last Updated: October 2026</p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8DEC8] shadow-luxury space-y-6 text-sm text-charcoal-muted leading-relaxed">
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            1. Information We Collect
          </h2>
          <p>
            When you request a free interior design consultation or submit an enquiry on Vision Tech Solutions, we collect your name, email address, phone number, property location, service preference, and project details solely to prepare your architectural proposal.
          </p>
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            2. How We Use & Protect Your Data
          </h2>
          <p>
            All client enquiries and floor plans are stored in encrypted databases with role-based access control. We never sell, rent, or trade your personal contact details to third-party marketers.
          </p>
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            3. Contact Our Data Protection Officer
          </h2>
          <p>
            For any requests regarding your personal information, email us at{' '}
            <strong className="text-charcoal">info@visiontechsolutions.co.in</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}
