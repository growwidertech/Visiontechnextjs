'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service-detail', slug],
    queryFn: () => apiFetch(`/services/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center">
        <div className="text-gold text-sm tracking-widest uppercase animate-pulse">
          Loading Service Architecture...
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-4xl mb-3">Service Not Found</h1>
        <Link href="/services" className="text-gold underline text-sm">
          Return to All Services
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* 1. Premium Hero Banner with Rich Dark Overlay */}
      <section className="relative h-[60vh] min-h-[440px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src={service.heroBanner || service.cardImage}
          alt={service.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(7,15,25,0.94) 0%, rgba(11,22,35,0.84) 55%, rgba(7,15,25,0.65) 100%)',
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
          <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-gold">
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold">{service.title}</span>
          </div>

          <span className="inline-block bg-gold/20 border border-gold/40 text-gold text-[11px] uppercase tracking-[0.2em] font-semibold px-3.5 py-1 rounded-full mb-3">
            {service.categoryType} Interior Architecture
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl leading-[1.1]">
            {service.title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            {service.shortDescription}
          </p>
          <div className="mt-6">
            <Link
              href="/contact#consultation-form"
              className="bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg"
            >
              <span>Book a Free {service.title} Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Service Introduction & Detailed Description */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
              SERVICE OVERVIEW
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold leading-tight">
              {service.introduction || service.shortDescription}
            </h2>
            <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {service.detailedDescription}
            </p>

            {/* Key Features Grid */}
            {service.keyFeatures?.length > 0 && (
              <div className="pt-6">
                <h3 className="font-serif text-2xl font-semibold text-charcoal mb-4">
                  Key Architectural Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.keyFeatures.map((feat: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-xl border border-[#E8DEC8] shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-charcoal font-serif font-semibold text-lg">
                        <Sparkles className="w-4 h-4 text-[#B88B38] shrink-0" />
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Benefits of Choosing Vision Tech Solutions */}
          <div className="lg:col-span-5 bg-[#0B1623] text-white rounded-2xl p-8 shadow-luxury space-y-6">
            <span className="text-xs uppercase tracking-[0.22em] text-gold font-semibold">
              WHY CHOOSE US
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium">
              The Vision Tech Turnkey Advantage
            </h3>
            <ul className="space-y-3.5">
              {(service.benefits?.length > 0
                ? service.benefits
                : [
                    'Single-point turnkey responsibility from 3D concept to handover',
                    '100% transparent itemized BOQ with zero hidden charges',
                    'Factory-finished bespoke joinery and imported stone',
                    'Dedicated senior architect and full-time resident site engineer',
                  ]
              ).map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-white/85">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-white/15">
              <Link
                href="/contact"
                className="w-full bg-gold hover:bg-gold-light text-navy-950 font-semibold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Request Custom Estimate & Floor Plan Audit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Approach */}
      {service.ourApproach?.length > 0 && (
        <section className="py-16 bg-[#F6F1E7] border-y border-[#E8DEC8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold block mb-2">
                OUR EXECUTION METHODOLOGY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
                How We Deliver Your {service.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.ourApproach.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-sm"
                >
                  <div className="font-serif text-3xl font-bold text-gold mb-2">
                    {step.stepNumber || `0${idx + 1}`}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Service Gallery Images */}
      {service.galleryImages?.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mb-8">
            Curated {service.title} Spaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.galleryImages.map((img: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden border border-[#E8DEC8] bg-white shadow-luxury"
              >
                <img
                  src={img.url}
                  alt={img.alt || img.caption || service.title}
                  className="w-full h-64 object-cover"
                />
                {img.caption && (
                  <div className="p-4 text-xs text-charcoal-muted font-medium">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Related Projects */}
      {service.relatedProjects?.length > 0 && (
        <section className="py-16 bg-[#0B1623] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs uppercase tracking-[0.22em] text-gold font-semibold block mb-2">
                  PORTFOLIO SHOWCASE
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium">
                  Related {service.categoryType} Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs text-gold hover:underline flex items-center gap-1"
              >
                View Full Portfolio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.relatedProjects.map((proj: any) => (
                <Link
                  key={proj._id || proj.slug}
                  href={`/projects/${proj.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden block"
                >
                  <div className="h-60 overflow-hidden">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] text-gold uppercase tracking-wider">
                      {proj.category} • {proj.location}
                    </div>
                    <h3 className="font-serif text-xl text-white group-hover:text-gold mt-1">
                      {proj.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQs */}
      {service.faqs?.length > 0 && (
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-charcoal font-semibold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {service.faqs.map((f: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-[#E8DEC8] shadow-sm"
              >
                <h3 className="font-serif text-lg font-semibold text-charcoal flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#B88B38] shrink-0" />
                  <span>{f.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
