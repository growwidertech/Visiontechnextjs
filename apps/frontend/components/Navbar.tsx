'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ArrowRight,
  Search,
  Menu,
  X,
  Home,
  Castle,
  Building2,
  Briefcase,
  Utensils,
  HeartPulse,
  ShoppingBag,
  Film,
  Shield,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function BrandLogo({
  companyName = 'VISION TECH SOLUTIONS',
  tagline = 'DESIGN • BUILD • TRANSFORM',
  logoUrl = '',
}: {
  companyName?: string;
  tagline?: string;
  logoUrl?: string;
}) {
  return (
    <Link href="/" className="flex items-center gap-3 group shrink-0">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={companyName}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 shrink-0">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          >
            <path
              d="M6 10L16 10L24 28L32 10L42 10L26.5 42H21.5L6 10Z"
              fill="url(#vts_cyan_grad)"
            />
            <path
              d="M17 10H23L24 13L29 10H35L24 33L17 10Z"
              fill="#0EA5E9"
              fillOpacity="0.45"
            />
            <path d="M18 14H30L28.5 18H19.5L18 14Z" fill="#D4A853" />
            <defs>
              <linearGradient
                id="vts_cyan_grad"
                x1="6"
                y1="10"
                x2="42"
                y2="42"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#38BDF8" />
                <stop offset="0.55" stopColor="#0284C7" />
                <stop offset="1" stopColor="#0369A1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-white font-sans font-bold tracking-[0.14em] text-xs sm:text-sm md:text-base leading-tight uppercase whitespace-nowrap">
          {companyName}
        </span>
        <span className="text-[8.5px] sm:text-[10px] tracking-[0.22em] text-gold-light font-medium uppercase mt-0.5 whitespace-nowrap">
          {tagline}
        </span>
      </div>
    </Link>
  );
}

const SERVICE_ICON_MAP: Record<string, any> = {
  Home,
  Castle,
  Building2,
  Briefcase,
  Utensils,
  HeartPulse,
  ShoppingBag,
  Film,
};

const DEFAULT_SERVICES = [
  {
    title: 'Residential Interior Design',
    slug: 'residential-interior-design',
    shortDescription: 'Elegant living spaces crafted for timeless family comfort',
    iconName: 'Home',
  },
  {
    title: 'Villa Interior Design',
    slug: 'villa-interior-design',
    shortDescription: 'Luxury beyond expectations for private estates & villas',
    iconName: 'Castle',
  },
  {
    title: 'Apartment Interior Design',
    slug: 'apartment-interior-design',
    shortDescription: 'Modern spaces and smart urban apartment living',
    iconName: 'Building2',
  },
  {
    title: 'Office Interior Design',
    slug: 'office-interior-design',
    shortDescription: 'High-performing corporate workspaces & headquarters',
    iconName: 'Briefcase',
  },
  {
    title: 'Restaurant Interior Design',
    slug: 'restaurant-interior-design',
    shortDescription: 'Atmospheric fine-dining & hospitality experiences',
    iconName: 'Utensils',
  },
  {
    title: 'Hospital Interior Design',
    slug: 'hospital-interior-design',
    shortDescription: 'Healing, patient-centric healthcare environments',
    iconName: 'HeartPulse',
  },
  {
    title: 'Shopping Mall Interior Design',
    slug: 'shopping-mall-interior-design',
    shortDescription: 'Iconic retail atriums & commercial concourses',
    iconName: 'ShoppingBag',
  },
  {
    title: 'Movie Theater / Cinema Interior Design',
    slug: 'movie-theater-interior-design',
    shortDescription: 'Acoustic luxury auditoriums & VIP cinema lounges',
    iconName: 'Film',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bundle } = useQuery({
    queryKey: ['public-bundle'],
    queryFn: () => apiFetch('/dashboard/public-bundle'),
  });

  const settings = bundle?.settings;
  const services = bundle?.services?.length ? bundle.services : DEFAULT_SERVICES;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Optional Announcement Bar */}
      {settings?.announcementBar?.enabled && (
        <div className="bg-gold text-navy-950 text-xs font-medium py-2 px-4 text-center tracking-wide z-50 relative">
          <span>{settings.announcementBar.text}</span>
          {settings.announcementBar.linkUrl && (
            <Link
              href={settings.announcementBar.linkUrl}
              className="ml-2 underline font-semibold hover:text-navy-800"
            >
              {settings.announcementBar.linkText || 'Learn More'} →
            </Link>
          )}
        </div>
      )}

      <header
        style={{
          backgroundColor: scrolled
            ? 'rgba(7, 15, 25, 0.96)'
            : 'rgba(7, 15, 25, 0.82)',
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
          scrolled
            ? 'py-3.5 border-white/15 shadow-2xl'
            : 'py-4 border-white/10 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <BrandLogo
            companyName={settings?.companyName || 'VISION TECH SOLUTIONS'}
            tagline={settings?.tagline || 'DESIGN • BUILD • TRANSFORM'}
            logoUrl={settings?.logoUrl}
          />

          {/* Desktop Navigation (Home, About Us, Services, Projects, Gallery, Contact) */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-white">
            <Link
              href="/"
              className={`relative py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                pathname === '/' ? 'text-gold font-semibold' : 'text-white/95'
              }`}
            >
              Home
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
              )}
            </Link>

            <Link
              href="/about"
              className={`relative py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                pathname === '/about' ? 'text-gold font-semibold' : 'text-white/95'
              }`}
            >
              About Us
              {pathname === '/about' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
              )}
            </Link>

            {/* Services Mega Dropdown - High Contrast Solid Luxury Panel */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link
                href="/services"
                className={`flex items-center gap-1.5 py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                  pathname?.startsWith('/services')
                    ? 'text-gold font-semibold'
                    : 'text-white/95'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesDropdownOpen ? 'rotate-180 text-gold' : ''
                  }`}
                />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[680px] z-50">
                  <div
                    style={{ backgroundColor: '#091320' }}
                    className="border border-gold/40 rounded-2xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.92)] ring-1 ring-white/10"
                  >
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/15">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.22em] text-gold font-bold block">
                          INTERIOR DESIGN & TURNKEY CONTRACTING
                        </span>
                        <span className="text-xs text-white/65">
                          Explore our bespoke residential & commercial design capabilities
                        </span>
                      </div>
                      <Link
                        href="/services"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="text-xs font-semibold text-gold hover:text-gold-light flex items-center gap-1.5 bg-gold/10 border border-gold/30 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        <span>View All {services.length} Services</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {services.map((srv: any) => {
                        const IconComp = SERVICE_ICON_MAP[srv.iconName] || Home;
                        return (
                          <Link
                            key={srv.slug}
                            href={`/services/${srv.slug}`}
                            onClick={() => setServicesDropdownOpen(false)}
                            className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.09] border border-white/5 hover:border-gold/40 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 mt-0.5 group-hover:bg-gold group-hover:text-navy-950 transition-colors">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-white text-[13px] font-semibold group-hover:text-gold transition-colors truncate">
                                {srv.title}
                              </div>
                              <div className="text-white/70 text-[11px] line-clamp-1 mt-0.5 leading-snug">
                                {srv.shortDescription}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/projects"
              className={`relative py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                pathname?.startsWith('/projects')
                  ? 'text-gold font-semibold'
                  : 'text-white/95'
              }`}
            >
              Projects
              {pathname?.startsWith('/projects') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
              )}
            </Link>

            <Link
              href="/gallery"
              className={`relative py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                pathname === '/gallery' ? 'text-gold font-semibold' : 'text-white/95'
              }`}
            >
              Gallery
              {pathname === '/gallery' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
              )}
            </Link>

            <Link
              href="/contact"
              className={`relative py-1.5 whitespace-nowrap transition-colors hover:text-gold ${
                pathname === '/contact' ? 'text-gold font-semibold' : 'text-white/95'
              }`}
            >
              Contact
              {pathname === '/contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
              )}
            </Link>
          </nav>

          {/* Right CTA & Search */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/contact#consultation-form"
              className="bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
            >
              <span>Get a Free Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search website"
              className="w-9 h-9 rounded-full border border-white/25 hover:border-gold bg-white/5 text-white hover:text-gold flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              href="/admin"
              title="Admin CMS Portal"
              className="w-9 h-9 rounded-full border border-white/20 hover:border-gold bg-white/5 text-white/80 hover:text-gold flex items-center justify-center transition-colors"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search"
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-gold"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-gold"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Responsive Drawer */}
        {mobileOpen && (
          <div
            style={{ backgroundColor: '#070F19' }}
            className="lg:hidden border-t border-white/15 px-5 py-6 space-y-4 max-h-[82vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex flex-col space-y-2.5 text-white text-sm font-medium">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-gold"
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-gold"
              >
                About Us
              </Link>

              {/* Mobile Expandable Services Submenu */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full py-2 px-3 rounded-lg hover:bg-white/5 flex items-center justify-between text-left"
                >
                  <span>Services</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold transition-transform ${
                      mobileServicesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {mobileServicesOpen && (
                  <div className="mt-1 ml-3 pl-3 border-l border-gold/30 space-y-1.5">
                    <Link
                      href="/services"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1.5 text-xs font-semibold text-gold"
                    >
                      View All Services →
                    </Link>
                    {services.map((srv: any) => (
                      <Link
                        key={srv.slug}
                        href={`/services/${srv.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-xs text-white/80 hover:text-gold"
                      >
                        {srv.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/projects"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-gold"
              >
                Projects
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-gold"
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-gold"
              >
                Contact
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg text-gold/90 hover:bg-white/5 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Admin CMS Dashboard
              </Link>
            </div>
            <div className="pt-3 border-t border-white/15">
              <Link
                href="/contact#consultation-form"
                onClick={() => setMobileOpen(false)}
                className="w-full bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 font-semibold text-xs py-3.5 px-5 rounded-full flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Get a Free Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchModalOpen && (
        <div
          style={{ backgroundColor: 'rgba(7, 15, 25, 0.88)' }}
          className="fixed inset-0 z-[70] backdrop-blur-md flex items-start justify-center pt-28 px-4"
        >
          <div
            style={{ backgroundColor: '#0B1623' }}
            className="border border-gold/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                Search Projects & Interior Design Services
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. Luxury Villa, Modern Office, Hospital, Modular Kitchen..."
                className="flex-1 bg-navy-950 border border-white/25 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="bg-gold hover:bg-gold-light text-navy-950 font-semibold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
