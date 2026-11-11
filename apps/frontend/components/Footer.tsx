'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { BrandLogo } from './Navbar';

export function Footer() {
  const pathname = usePathname();
  const { data: bundle } = useQuery({
    queryKey: ['public-bundle'],
    queryFn: () => apiFetch('/dashboard/public-bundle'),
  });

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const settings = bundle?.settings || {
    companyName: 'VISION TECH SOLUTIONS',
    tagline: 'DESIGN • BUILD • TRANSFORM',
    footerAboutText:
      'Creating beautiful, functional and sustainable spaces for a better tomorrow.',
    phonePrimary: '+91 98765 43210',
    emailPrimary: 'info@visiontechsolutions.co.in',
    address: 'Plot No. 123, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033',
    whatsappNumber: '+919876543210',
    googleMapsDirectionsUrl: 'https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad+500033',
    copyrightText: '© 2026 Vision Tech Solutions (visiontechsolutions.co.in). All rights reserved.',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
      pinterest: 'https://pinterest.com',
    },
  };

  return (
    <footer className="bg-[#070F19] text-white/80 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <BrandLogo
              companyName={settings.companyName || 'VISION TECH SOLUTIONS'}
              tagline={settings.tagline || 'DESIGN • BUILD • TRANSFORM'}
              logoUrl={settings.logoUrl}
            />
            <p className="text-sm text-white/65 leading-relaxed max-w-sm">
              {settings.footerAboutText ||
                'Creating beautiful, functional and sustainable spaces for a better tomorrow.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings.socialLinks?.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/15 hover:border-gold hover:bg-gold hover:text-navy-950 flex items-center justify-center transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.instagram || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/15 hover:border-gold hover:bg-gold hover:text-navy-950 flex items-center justify-center transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.linkedin || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/15 hover:border-gold hover:bg-gold hover:text-navy-950 flex items-center justify-center transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.youtube || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-white/15 hover:border-gold hover:bg-gold hover:text-navy-950 flex items-center justify-center transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (with Testimonials placed here, Blog removed) (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white font-sans font-semibold text-sm tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-white/70">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gold transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-gold transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-gold transition-colors font-medium text-gold/90">
                  Client Testimonials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-sans font-semibold text-sm tracking-wider uppercase">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-white/70">
              <li>
                <Link
                  href="/services/residential-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Residential Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/villa-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Villa Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/apartment-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Apartment Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/shopping-mall-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Shopping Mall Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/office-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Office Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/restaurant-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Restaurant Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/hospital-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Hospital Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/movie-theater-interior-design"
                  className="hover:text-gold transition-colors"
                >
                  Movie Theater Interior Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-sans font-semibold text-sm tracking-wider uppercase">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs sm:text-[13px] text-white/70">
              <a
                href={`tel:${settings.phonePrimary}`}
                className="flex items-center gap-3 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>{settings.phonePrimary}</span>
              </a>
              <a
                href={`mailto:${settings.emailPrimary}`}
                className="flex items-center gap-3 hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="break-all">{settings.emailPrimary}</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={
                  settings.googleMapsDirectionsUrl ||
                  'https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad+500033'
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-md"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="text-center sm:text-left">
            {settings.copyrightText || '© 2026 Vision Tech Solutions. All rights reserved.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link href="/#testimonials" className="hover:text-gold transition-colors">
              Testimonials
            </Link>
            <span>|</span>
            <Link href="/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms-and-conditions" className="hover:text-gold transition-colors">
              Terms & Conditions
            </Link>
            <span>|</span>
            <Link href="/faq" className="hover:text-gold transition-colors">
              FAQ
            </Link>
            <span>|</span>
            <Link href="/sitemap.xml" className="hover:text-gold transition-colors">
              Sitemap
            </Link>
            <span>|</span>
            <Link
              href="/admin"
              className="text-gold/80 hover:text-gold flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> CMS Login
            </Link>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Concierge Button */}
      <a
        href={`https://wa.me/${(settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Vision Tech Solutions, I would like to book a free interior design consultation.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20BD5A] text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </footer>
  );
}
