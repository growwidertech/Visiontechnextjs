'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function FaqPage() {
  const { data: faqs = [] } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => apiFetch('/faqs'),
  });

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="relative h-[42vh] min-h-[320px] flex items-center bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full">
          <span className="text-xs uppercase tracking-[0.26em] text-gold font-semibold block mb-3">
            CLIENT KNOWLEDGE BASE
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {faqs.map((faq: any, idx: number) => (
          <div
            key={faq._id || idx}
            className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-luxury"
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#B88B38] shrink-0 mt-1" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B88B38] font-semibold">
                  {faq.category || 'General'}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal mt-0.5">
                  {faq.question}
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-12 bg-[#0B1623] text-white rounded-2xl p-8 text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl">Still have a question?</h3>
          <p className="text-xs sm:text-sm text-white/75">
            Speak directly with our senior interior architects for personalized guidance.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gold text-navy-950 font-semibold text-xs px-6 py-3 rounded-full"
          >
            <span>Contact Our Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
