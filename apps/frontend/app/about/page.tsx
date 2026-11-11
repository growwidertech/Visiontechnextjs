'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Compass,
  Eye,
  Target,
  Award,
  CheckCircle2,
  Users,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function AboutPage() {
  const { data: pageData } = useQuery({
    queryKey: ['page-about'],
    queryFn: () => apiFetch('/pages/about'),
  });

  const page = pageData?.page;
  const customSections = pageData?.sections || [];

  const teamMembers = [
    {
      name: 'Ar. Vikramaditya Rao',
      role: 'Founder & Principal Architect',
      bio: '20+ years architecting luxury villas, hospitality landmarks, and corporate campuses across India and Europe.',
      image:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Meera Krishnan',
      role: 'Director of Interior Design',
      bio: 'Specializes in tactile European minimalism, bespoke Italian furniture curation, and residential spatial storytelling.',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Kabir Malhotra',
      role: 'Head of Turnkey Contracting & MEP',
      bio: 'Leads 120+ site engineers and factory joinery specialists delivering complex commercial and hospital fit-outs on time.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Senior Lighting & Material Specialist',
      bio: 'Curates natural marble, sustainable veneers, and DALI circadian lighting systems for residences and fine dining.',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Banner with Rich Dark Overlay */}
      <section className="relative h-[58vh] min-h-[420px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src={
            page?.bannerImage ||
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=85'
          }
          alt={page?.title || 'About Vision Tech Solutions'}
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
            {page?.bannerSubtitle || 'ABOUT VISION TECH SOLUTIONS'}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl leading-[1.1]">
            Architecting Timeless Spaces for Living & Working
          </h1>
          <p className="text-white/75 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            {page?.description ||
              'Founded on the belief that extraordinary architecture elevates human potential, Vision Tech Solutions is a premier international-standard interior design and turnkey contracting studio.'}
          </p>
        </div>
      </section>

      {/* Company Introduction & Our Story */}
      <section className="py-16 lg:py-24 border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
              OUR STORY & HERITAGE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
              A Decade of Crafting Bespoke Luxury & Turnkey Precision
            </h2>
            <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed">
              What began as a boutique architectural studio in Hyderabad has grown into a full-spectrum interior architecture and turnkey contracting powerhouse with over 500 delivered landmarks across South India.
            </p>
            <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed">
              Unlike fragmented design-only consultancies, Vision Tech Solutions integrates visionary architects, 3D visualizers, acoustic & MEP engineers, and a state-of-the-art modular woodwork factory under one roof—ensuring that what you approve in 3D is delivered in reality with millimeter precision.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4 border-t border-[#E8DEC8]">
              <div>
                <div className="font-serif text-3xl font-bold text-charcoal">500+</div>
                <div className="text-xs text-charcoal-muted">Projects Delivered</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-charcoal">200+</div>
                <div className="text-xs text-charcoal-muted">Happy Clients</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-charcoal">65+</div>
                <div className="text-xs text-charcoal-muted">Architects & Engineers</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-charcoal">100%</div>
                <div className="text-xs text-charcoal-muted">On-Time Commitment</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"
              alt="Luxury Villa Interior"
              className="rounded-2xl h-72 sm:h-80 w-full object-cover shadow-luxury"
            />
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85"
              alt="Corporate Interior Architecture"
              className="rounded-2xl h-72 sm:h-80 w-full object-cover shadow-luxury mt-8"
            />
          </div>
        </div>
      </section>

      {/* Vision, Mission & Philosophy */}
      <section className="py-16 lg:py-20 bg-[#F6F1E7] border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-[#E8DEC8] shadow-luxury space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38]">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">Our Vision</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              To be India&apos;s most trusted luxury interior architecture and turnkey contracting partner—setting global benchmarks in spatial beauty, sustainability, and engineering excellence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E8DEC8] shadow-luxury space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">Our Mission</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              To transform residential and commercial shells into inspiring, high-performing environments through transparent pricing, ethical material sourcing, and disciplined on-time execution.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E8DEC8] shadow-luxury space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-charcoal">Our Philosophy</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Form follows emotion and function. We pair quiet European elegance—natural stone, warm timber, and generous daylight—with intelligent ergonomics that stand the test of decades.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach, Expertise & Strengths */}
      <section className="py-16 lg:py-24 bg-[#0B1623] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold block mb-2">
              OUR STRENGTHS & EXPERTISE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium">
              Why Leading Homeowners & Enterprises Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Bespoke Design Studio',
                desc: 'Zero cookie-cutter templates. Every floor plan and elevation is custom-architected around your lifestyle or brand DNA.',
              },
              {
                icon: ShieldCheck,
                title: 'Turnkey Accountability',
                desc: 'Civil, electrical, HVAC, acoustics, false ceiling, custom joinery, and soft furnishings managed under one single contract.',
              },
              {
                icon: Clock,
                title: 'Guaranteed Timelines',
                desc: 'Milestone-tracked Gantt schedules backed by our automated modular factory ensure zero handover delays.',
              },
              {
                icon: Award,
                title: 'Certified Material Quality',
                desc: 'Authentic Italian marble, E0-grade marine plywood, Blum/Hettich hardware, and fire-retardant commercial fabrics.',
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-gold/50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Leadership & Design Team */}
      <section className="py-16 lg:py-24 bg-[#FAF7F2] border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold block mb-2">
              OUR LEADERSHIP TEAM
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
              Meet the Architects & Directors Behind Your Space
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury group"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-serif text-xl font-semibold text-charcoal">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#B88B38]">{member.role}</div>
                  <p className="text-xs text-charcoal-muted leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Render any additional CMS sections attached to the About page */}
      {customSections.map((sec: any) => (
        <section
          key={sec._id}
          className="py-14 bg-[#F6F1E7] border-b border-[#E8DEC8]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-charcoal font-semibold mb-3">
              {sec.title}
            </h2>
            {sec.subtitle && <p className="text-sm text-charcoal-muted mb-4">{sec.subtitle}</p>}
            {sec.content && (
              <div
                className="prose prose-sm max-w-none text-charcoal-muted"
                dangerouslySetInnerHTML={{ __html: sec.content }}
              />
            )}
          </div>
        </section>
      ))}

      {/* Contact CTA */}
      <section className="py-16 bg-navy-950 text-white text-center px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">
            START YOUR JOURNEY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium">
            Ready to Transform Your Residence or Commercial Space?
          </h2>
          <p className="text-sm text-white/70">
            Schedule a private consultation with our Principal Architects at our Jubilee Hills, Hyderabad experience studio.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg"
            >
              <span>Book a Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
