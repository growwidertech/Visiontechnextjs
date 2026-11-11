'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => apiFetch('/settings'),
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    serviceInterestedIn: 'Residential Interior Design',
    budgetRange: '₹25 Lakhs – ₹50 Lakhs',
    projectDetails: '',
    website_url_honeypot: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await apiFetch('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          sourcePage: 'Contact Us Page',
        }),
      });
      setFeedback({
        ok: true,
        msg: 'Thank you! Your enquiry has been saved and our Principal Architect team has been notified via email.',
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        location: '',
        serviceInterestedIn: 'Residential Interior Design',
        budgetRange: '₹25 Lakhs – ₹50 Lakhs',
        projectDetails: '',
        website_url_honeypot: '',
      });
    } catch (err: any) {
      setFeedback({
        ok: false,
        msg: err.message || 'Unable to submit enquiry. Please verify all fields.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const phonePrimary = settings?.phonePrimary || '+91 98765 43210';
  const phoneSecondary = settings?.phoneSecondary || '+91 40 4123 5678';
  const emailPrimary = settings?.emailPrimary || 'info@visiontechsolutions.co.in';
  const emailSupport = settings?.emailSupport || 'projects@visiontechsolutions.co.in';
  const address =
    settings?.address || 'Plot No. 123, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033';
  const businessHours =
    settings?.businessHours || 'Monday – Saturday: 9:30 AM – 7:00 PM IST';
  const whatsappNumber = settings?.whatsappNumber || '+919876543210';

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Banner with Rich Dark Overlay */}
      <section className="relative h-[48vh] min-h-[360px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85"
          alt="Contact Vision Tech Solutions"
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
            CONNECT WITH OUR DESIGN STUDIO
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl">
            Let&apos;s Build Something Beautiful Together
          </h1>
          <p className="text-white/75 text-sm sm:text-base max-w-2xl mt-4">
            Visit our Experience Center in Jubilee Hills, Hyderabad or book a complimentary architectural consultation below.
          </p>
        </div>
      </section>

      {/* Contact Information & 7-Field Consultation Form */}
      <section
        id="consultation-form"
        className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Studio Contact Details & WhatsApp CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
                EXPERIENCE STUDIO & HEADQUARTERS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-1">
                Get in Touch With Our Architects
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-luxury space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Studio Address
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5 leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Direct Numbers
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                    Primary: <a href={`tel:${phonePrimary}`} className="hover:text-[#B88B38]">{phonePrimary}</a>
                  </p>
                  <p className="text-xs sm:text-sm text-charcoal-muted">
                    Studio Desk: <a href={`tel:${phoneSecondary}`} className="hover:text-[#B88B38]">{phoneSecondary}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Email Addresses
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                    Consultations: <a href={`mailto:${emailPrimary}`} className="hover:text-[#B88B38]">{emailPrimary}</a>
                  </p>
                  <p className="text-xs sm:text-sm text-charcoal-muted">
                    Turnkey Projects: <a href={`mailto:${emailSupport}`} className="hover:text-[#B88B38]">{emailSupport}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#B88B38] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Business Hours
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
                    {businessHours}
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Button */}
              <div className="pt-3 border-t border-[#F3EDE2] flex flex-wrap items-center justify-between gap-4">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Vision Tech Solutions, I would like to schedule a consultation.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Instantly on WhatsApp</span>
                </a>

                <div className="flex items-center gap-2">
                  <a
                    href={settings?.socialLinks?.facebook || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E8DEC8] flex items-center justify-center text-charcoal-muted hover:text-[#B88B38]"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={settings?.socialLinks?.instagram || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E8DEC8] flex items-center justify-center text-charcoal-muted hover:text-[#B88B38]"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={settings?.socialLinks?.linkedin || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E8DEC8] flex items-center justify-center text-charcoal-muted hover:text-[#B88B38]"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={settings?.socialLinks?.youtube || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E8DEC8] flex items-center justify-center text-charcoal-muted hover:text-[#B88B38]"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Complete 7-Field Consultation Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 border border-[#E8DEC8] shadow-luxury space-y-5"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
                  COMPLIMENTARY DESIGN CONSULTATION
                </span>
                <h3 className="font-serif text-3xl text-charcoal font-semibold mt-1">
                  Tell Us About Your Project
                </h3>
              </div>

              <input
                type="text"
                name="website_url_honeypot"
                value={form.website_url_honeypot}
                onChange={(e) => setForm({ ...form, website_url_honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. rajesh@example.com"
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Project Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Service Interested In *
                  </label>
                  <select
                    value={form.serviceInterestedIn}
                    onChange={(e) =>
                      setForm({ ...form, serviceInterestedIn: e.target.value })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="Residential Interior Design">Residential Interior Design</option>
                    <option value="Villa Interior Design">Villa Interior Design</option>
                    <option value="Apartment Interior Design">Apartment Interior Design</option>
                    <option value="Office Interior Design">Office Interior Design</option>
                    <option value="Restaurant Interior Design">Restaurant Interior Design</option>
                    <option value="Hospital Interior Design">Hospital Interior Design</option>
                    <option value="Shopping Mall Interior Design">Shopping Mall Interior Design</option>
                    <option value="Movie Theater Interior Design">Movie Theater / Cinema Interior Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Estimated Budget Range
                  </label>
                  <select
                    value={form.budgetRange}
                    onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="₹15 Lakhs – ₹25 Lakhs">₹15 Lakhs – ₹25 Lakhs</option>
                    <option value="₹25 Lakhs – ₹50 Lakhs">₹25 Lakhs – ₹50 Lakhs</option>
                    <option value="₹50 Lakhs – ₹1 Crore">₹50 Lakhs – ₹1 Crore</option>
                    <option value="₹1 Crore – ₹3 Crore">₹1 Crore – ₹3 Crore</option>
                    <option value="₹3 Crore+ (Commercial / Estate)">₹3 Crore+ (Commercial / Estate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Project Details & Requirements
                </label>
                <textarea
                  rows={4}
                  value={form.projectDetails}
                  onChange={(e) => setForm({ ...form, projectDetails: e.target.value })}
                  placeholder="Share property size (sq. ft.), possession timeline, and any specific requirements..."
                  className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              {feedback && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                    feedback.ok
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border border-rose-300 text-rose-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{feedback.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
              >
                <span>{submitting ? 'Submitting Enquiry...' : 'Request Free Consultation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps Integration */}
        <div className="mt-16 rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury bg-white">
          <iframe
            src={
              settings?.googleMapsEmbedUrl ||
              'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.6789123456!2d78.4071!3d17.4319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9144f4b1b111%3A0x6d3b0b8c52b1a8e0!2sRoad%20No.%2036%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
            }
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Vision Tech Solutions Studio Location - Jubilee Hills, Hyderabad"
          />
        </div>
      </section>
    </main>
  );
}
