import React from 'react';

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="bg-navy-950 text-white pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">
            TERMS OF ENGAGEMENT
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-2">
            Terms & Conditions
          </h1>
          <p className="text-xs text-white/60 mt-2">Effective Date: October 2026</p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8DEC8] shadow-luxury space-y-6 text-sm text-charcoal-muted leading-relaxed">
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            1. Intellectual Property & 3D Architectural Designs
          </h2>
          <p>
            All project photography, 3D architectural visualizations, floor plans, and brand assets displayed on this website are the intellectual property of Vision Tech Solutions.
          </p>
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            2. Consultation & Turnkey Proposals
          </h2>
          <p>
            Initial design consultations are complimentary. Final project execution timelines and turnkey pricing are governed by the itemized Bill of Quantities (BOQ) and formal contract signed upon design approval.
          </p>
        </div>
      </section>
    </main>
  );
}
