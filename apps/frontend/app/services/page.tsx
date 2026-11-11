'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Home, Building2, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function ServicesIndexPage() {
  const [filter, setFilter] = useState<'All' | 'Residential' | 'Commercial'>('All');

  const { data: services = [] } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => apiFetch('/services'),
  });

  const filtered = services.filter((s: any) =>
    filter === 'All' ? true : s.categoryType === filter
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Banner with Rich Dark Overlay */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85"
          alt="Our Services"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(7,15,25,0.94) 0%, rgba(11,22,35,0.84) 55%, rgba(7,15,25,0.68) 100%)',
          }}
          className="absolute inset-0"
        />
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(7,15,25,0.85) 0%, transparent 45%, rgba(7,15,25,0.75) 100%)',
          }}
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 w-full">
          <span className="text-xs uppercase tracking-[0.26em] text-gold font-semibold block mb-3">
            OUR SERVICES • DESIGN & TURNKEY CONTRACTING
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl">
            End-to-End Interior Design & Contracting Solutions
          </h1>
          <p className="text-white/75 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            From bespoke luxury villas and modern urban apartments to corporate offices, fine-dining restaurants, NABH hospitals, shopping malls, and acoustic cinema auditoriums.
          </p>
        </div>
      </section>

      {/* Filter Bar & Services Grid */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
              Specialized Interior Architecture Verticals
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Select any vertical below to explore our process, features, galleries, and related projects.
            </p>
          </div>

          <div className="inline-flex bg-[#EFE8DA] p-1.5 rounded-full self-start">
            {(['All', 'Residential', 'Commercial'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((srv: any) => (
            <Link
              key={srv._id || srv.slug}
              href={`/services/${srv.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury flex flex-col transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={srv.cardImage || srv.heroBanner}
                  alt={srv.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-navy-950/85 backdrop-blur-sm text-gold text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-gold/30">
                  {srv.categoryType}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-charcoal group-hover:text-[#B88B38] transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
                    {srv.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F3EDE2] flex items-center justify-between text-xs font-semibold text-[#B88B38]">
                  <span>Explore Service Details</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
