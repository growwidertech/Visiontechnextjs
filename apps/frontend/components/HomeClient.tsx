'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Home,
  Building2,
  Compass,
  Gem,
  Clock,
  Headset,
  Star,
  ChevronLeft,
  ChevronRight,
  MessagesSquare,
  Award,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  X,
  LayoutGrid,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const PILLAR_ICONS: Record<string, any> = {
  Compass,
  Gem,
  Clock,
  Headset,
};

const PROMISE_ICONS: Record<string, any> = {
  MessagesSquare,
  Award,
  Sliders,
  ShieldCheck,
};

const DEFAULT_HOME_SECTIONS = [
  {
    sectionKey: 'hero',
    blockType: 'hero',
    eyebrow: 'INTERIOR DESIGN & CONTRACTING',
    title: 'Good Design Creates Better Living & Working',
    subtitle:
      'At Vision Tech Solutions, we design inspiring spaces that elevate your lifestyle and business. From luxurious homes to high-performing commercial spaces, we bring your vision to life with creativity, precision and excellence.',
    mediaUrl:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
    videoUrl: '/videos/hero-interior.mp4',
    ctaPrimaryText: 'Explore Our Services',
    ctaPrimaryLink: '#tailored-services',
    ctaSecondaryText: 'Watch Our Showreel',
    ctaSecondaryLink: '#showreel',
    order: 1,
    isEnabled: true,
    data: {
      backgroundVideoUrl: '/videos/hero-interior.mp4',
      slides: [
        {
          number: '01',
          eyebrow: 'INTERIOR DESIGN & CONTRACTING',
          titleLine1: 'Good Design',
          titleLine2: 'Creates Better',
          titleHighlight: 'Living & Working',
          subtitle:
            'At Vision Tech Solutions, we design inspiring spaces that elevate your lifestyle and business. From luxurious homes to high-performing commercial spaces, we bring your vision to life with creativity, precision and excellence.',
          image:
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
          videoUrl: '/videos/hero-interior.mp4',
        },
        {
          number: '02',
          eyebrow: 'BESPOKE LUXURY RESIDENCES & VILLAS',
          titleLine1: 'Timeless Spaces',
          titleLine2: 'Crafted For',
          titleHighlight: 'Modern Elegance',
          subtitle:
            'Every home we architect in Hyderabad blends Italian stone, bespoke millwork, and warm architectural lighting to create a sanctuary tailored exclusively around your family.',
          image:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
          videoUrl: '/videos/hero-interior.mp4',
        },
        {
          number: '03',
          eyebrow: 'TURNKEY COMMERCIAL & HOSPITALITY',
          titleLine1: 'High-Impact',
          titleLine2: 'Environments For',
          titleHighlight: 'Leading Brands',
          subtitle:
            'From Fortune-500 offices in HITEC City and fine-dining restaurants in Jubilee Hills to NABH hospitals and luxury multiplexes, our turnkey contracting team delivers on time with zero compromise.',
          image:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85',
          videoUrl: '/videos/hero-interior.mp4',
        },
      ],
    },
  },
  {
    sectionKey: 'services-overview',
    blockType: 'services-overview',
    eyebrow: 'OUR SERVICES',
    title: 'End-to-End Interior Design & Contracting Solutions',
    subtitle:
      "We create spaces that inspire, engage and perform. Whether it's your dream home or a high-traffic commercial space, our expert team delivers world-class design and execution.",
    ctaPrimaryText: 'Learn More About Us',
    ctaPrimaryLink: '/about',
    order: 2,
    isEnabled: true,
    data: {
      cards: [
        {
          title: 'Residential, Villa & Apartment Interior Design',
          subtitle: 'Elegant homes, Luxurious villas, Modern apartments',
          image:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
          href: '/services/residential-interior-design',
          icon: 'Home',
        },
        {
          title: 'Commercial Building Interior Design',
          subtitle: 'Offices, Malls, Restaurants, Party Halls, Hospitals & More',
          image:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85',
          href: '/services/office-interior-design',
          icon: 'Building2',
        },
      ],
    },
  },
  {
    sectionKey: 'value-pillars',
    blockType: 'value-pillars',
    eyebrow: 'OUR PROMISE',
    title: 'Why Discerning Clients Trust Us',
    order: 3,
    isEnabled: true,
    data: {
      pillars: [
        {
          icon: 'Compass',
          title: 'Creative Designs',
          subtitle: 'Unique & personalized concepts',
        },
        {
          icon: 'Gem',
          title: 'Premium Quality',
          subtitle: 'Only the best materials & finishes',
        },
        {
          icon: 'Clock',
          title: 'On-Time Delivery',
          subtitle: 'Your time, our commitment',
        },
        {
          icon: 'Headset',
          title: 'End-to-End Support',
          subtitle: 'From design to execution',
        },
      ],
    },
  },
  {
    sectionKey: 'why-choose-us',
    blockType: 'why-choose-us',
    eyebrow: 'WHY CHOOSE US',
    title: 'Your Vision, Our Expertise',
    subtitle:
      'With years of experience and a passion for design, we turn ordinary spaces into extraordinary experiences. Our team of designers, architects and project managers work closely with you at every step.',
    mediaUrl:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
    videoUrl: '/videos/hero-interior.mp4',
    ctaPrimaryText: 'Our Process',
    ctaPrimaryLink: '#our-process',
    ctaSecondaryText: 'Watch Our Story',
    ctaSecondaryLink: '#story-video',
    order: 4,
    isEnabled: true,
    data: {
      signatureText: 'Designing Spaces for a Better Tomorrow',
      stats: [
        { value: '500+', label: 'Projects Delivered' },
        { value: '200+', label: 'Happy Clients' },
        { value: '10+', label: 'Years of Experience' },
        { value: '100%', label: 'Client Satisfaction' },
      ],
    },
  },
  {
    sectionKey: 'tailored-solutions',
    blockType: 'tailored-solutions',
    eyebrow: 'OUR SERVICES',
    title: 'Tailored Solutions for Every Space',
    subtitle:
      'Explore our specialized residential and commercial interior architecture capabilities.',
    order: 5,
    isEnabled: true,
    data: {
      residentialHighlightCards: [
        {
          title: 'Homes',
          subtitle: 'Elegant living spaces for your family',
          image:
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
          href: '/services/residential-interior-design',
          categoryType: 'Residential',
        },
        {
          title: 'Villas',
          subtitle: 'Luxury beyond expectations',
          image:
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
          href: '/services/villa-interior-design',
          categoryType: 'Residential',
        },
        {
          title: 'Apartments',
          subtitle: 'Modern spaces, smart living',
          image:
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85',
          href: '/services/apartment-interior-design',
          categoryType: 'Residential',
        },
      ],
      exploreCardImage:
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
    },
  },
  {
    sectionKey: 'featured-projects',
    blockType: 'featured-projects',
    eyebrow: 'FEATURED PROJECTS',
    title: 'Our Latest Work',
    ctaPrimaryText: 'View All Projects',
    ctaPrimaryLink: '/projects',
    order: 6,
    isEnabled: true,
    data: {},
  },
  {
    sectionKey: 'our-process',
    blockType: 'our-process',
    eyebrow: 'OUR DESIGN PROCESS',
    title: 'From Concept Sketch to Turnkey Handover',
    subtitle: 'A transparent, milestone-driven methodology engineered for peace of mind.',
    order: 7,
    isEnabled: true,
    data: {},
  },
  {
    sectionKey: 'testimonials',
    blockType: 'testimonials',
    eyebrow: 'TESTIMONIALS',
    title: 'What Our Clients Say',
    subtitle:
      "Real stories. Real people. Real satisfaction. Here's what our clients have to say about working with Vision Tech Solutions.",
    order: 8,
    isEnabled: true,
    data: {},
  },
  {
    sectionKey: 'trusted-brands',
    blockType: 'trusted-brands',
    eyebrow: 'CLIENTELE & PARTNERSHIPS',
    title: 'Trusted by Leading Brands',
    subtitle:
      'We are proud to have worked with some of the most respected brands across industries.',
    order: 9,
    isEnabled: true,
    data: {},
  },
  {
    sectionKey: 'consultation-cta',
    blockType: 'consultation-cta',
    eyebrow: 'READY TO GET STARTED?',
    title: "Let's Build Something Beautiful Together",
    subtitle:
      'Book a free consultation with our design experts and take the first step towards your dream space.',
    mediaUrl:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
    ctaPrimaryText: 'Request Consultation',
    order: 10,
    isEnabled: true,
    data: {},
  },
];

const DEFAULT_SERVICES = [
  {
    title: 'Residential Interior Design',
    slug: 'residential-interior-design',
    categoryType: 'Residential',
    shortDescription: 'Elegant living spaces for your family crafted with bespoke materials.',
    cardImage:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Villa Interior Design',
    slug: 'villa-interior-design',
    categoryType: 'Residential',
    shortDescription: 'Luxury beyond expectations for private estates and villas.',
    cardImage:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Apartment Interior Design',
    slug: 'apartment-interior-design',
    categoryType: 'Residential',
    shortDescription: 'Modern spaces and smart living tailored for urban apartments.',
    cardImage:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Office Interior Design',
    slug: 'office-interior-design',
    categoryType: 'Commercial',
    shortDescription: 'High-performing corporate workspaces and executive headquarters.',
    cardImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Restaurant Interior Design',
    slug: 'restaurant-interior-design',
    categoryType: 'Commercial',
    shortDescription: 'Atmospheric fine-dining restaurants and hospitality lounges.',
    cardImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Hospital Interior Design',
    slug: 'hospital-interior-design',
    categoryType: 'Commercial',
    shortDescription: 'Healing, patient-centric healthcare environments and clinics.',
    cardImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Shopping Mall Interior Design',
    slug: 'shopping-mall-interior-design',
    categoryType: 'Commercial',
    shortDescription: 'Iconic retail atriums and experiential commercial destinations.',
    cardImage:
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Movie Theater / Cinema Interior Design',
    slug: 'movie-theater-interior-design',
    categoryType: 'Commercial',
    shortDescription: 'Acoustic luxury auditoriums and VIP cinema lounges.',
    cardImage:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
  },
];

const DEFAULT_PROJECTS = [
  {
    _id: 'proj-1',
    title: 'Luxury Villa',
    slug: 'the-aurelia-luxury-villa',
    category: 'Villa',
    projectType: 'Residential',
    location: 'Jubilee Hills, Hyderabad',
    coverImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    isFeatured: true,
  },
  {
    _id: 'proj-2',
    title: 'Modern Office',
    slug: 'nexus-global-tech-headquarters',
    category: 'Office',
    projectType: 'Commercial',
    location: 'HITEC City, Hyderabad',
    coverImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
    isFeatured: true,
  },
  {
    _id: 'proj-3',
    title: 'Fine Dining Restaurant',
    slug: 'saffron-and-sage-fine-dining',
    category: 'Restaurant',
    projectType: 'Commercial',
    location: 'Banjara Hills, Hyderabad',
    coverImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85',
    isFeatured: true,
  },
  {
    _id: 'proj-4',
    title: 'Hospital Interior',
    slug: 'asteria-premier-wellness-hospital',
    category: 'Hospital',
    projectType: 'Commercial',
    location: 'Gachibowli, Hyderabad',
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=85',
    isFeatured: true,
  },
  {
    _id: 'proj-5',
    title: 'Apartment Interior',
    slug: 'the-verve-sky-apartment',
    category: 'Apartment',
    projectType: 'Residential',
    location: 'Financial District, Hyderabad',
    coverImage:
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=85',
    isFeatured: true,
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    _id: 'test-1',
    customerName: 'Anita Sharma',
    designation: 'Homemaker | Villa, Jubilee Hills',
    photograph:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    reviewContent:
      'Vision Tech Solutions transformed our home into a dream space. Their attention to detail and professionalism is truly commendable.',
    rating: 5,
  },
  {
    _id: 'test-2',
    customerName: 'Rohit Mehta',
    designation: 'Business Owner | Office, HITEC City',
    photograph:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    reviewContent:
      'The team delivered our office space on time with exceptional quality. Our employees love the new workspace!',
    rating: 5,
  },
  {
    _id: 'test-3',
    customerName: 'Neha Kapoor',
    designation: 'Restaurant Owner | Banjara Hills',
    photograph:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    reviewContent:
      'From concept to completion, everything was seamless. The restaurant looks stunning and has received great feedback from our guests!',
    rating: 5,
  },
];

export function HomeClient({ initialBundle }: { initialBundle?: any }) {
  const { data: bundle } = useQuery({
    queryKey: ['public-bundle'],
    queryFn: () => apiFetch('/dashboard/public-bundle'),
    initialData: initialBundle || undefined,
  });

  const sections = bundle?.homeSections?.length ? bundle.homeSections : DEFAULT_HOME_SECTIONS;
  const services = bundle?.services?.length ? bundle.services : DEFAULT_SERVICES;
  const projects = bundle?.projects?.length ? bundle.projects : DEFAULT_PROJECTS;
  const testimonials = bundle?.testimonials?.length
    ? bundle.testimonials
    : DEFAULT_TESTIMONIALS;

  // Hero slider state
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  // Tailored solutions filter tab state ('Residential' | 'Commercial' | 'All')
  const [serviceTab, setServiceTab] = useState<'Residential' | 'Commercial' | 'All'>('Residential');
  // Testimonials carousel offset
  const [testimonialOffset, setTestimonialOffset] = useState(0);
  // Video modal state
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  // Consultation Form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterestedIn: '',
    projectDetails: '',
    website_url_honeypot: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      await apiFetch('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...formState,
          serviceInterestedIn:
            formState.serviceInterestedIn || 'Residential Interior Design',
          sourcePage: 'Home Page Consultation Banner',
        }),
      });
      setSubmitResult({
        ok: true,
        msg: 'Thank you! Your free consultation request has been received. Our senior architect in Hyderabad will contact you shortly.',
      });
      setFormState({
        name: '',
        email: '',
        phone: '',
        serviceInterestedIn: '',
        projectDetails: '',
        website_url_honeypot: '',
      });
    } catch (err: any) {
      setSubmitResult({
        ok: false,
        msg: err.message || 'Please check your inputs and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderSection = (sec: any) => {
    switch (sec.blockType) {
      // ======================================================================
      // 1. HERO SECTION (With 20-30s Autoplaying Luxury Interior Video + Dark Opacity)
      // ======================================================================
      case 'hero': {
        const slides = sec.data?.slides?.length
          ? sec.data.slides
          : DEFAULT_HOME_SECTIONS[0].data.slides;
        const currentSlide = slides[heroSlideIdx % slides.length] || slides[0];
        const heroVideoSrc =
          sec.data?.backgroundVideoUrl ||
          (sec.videoUrl && sec.videoUrl.endsWith('.mp4') ? sec.videoUrl : null) ||
          '/videos/hero-interior.mp4';

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center overflow-hidden bg-navy-950"
          >
            {/* Autoplaying 20-30 second Luxury Interior Architecture Video Background */}
            <div className="absolute inset-0">
              <video
                key={heroVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                poster={
                  currentSlide.image ||
                  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85'
                }
                className="w-full h-full object-cover object-center"
              >
                <source src={heroVideoSrc} type="video/mp4" />
                <source
                  src="https://videos.pexels.com/video-files/7578552/7578552-hd_1920_1080_30fps.mp4"
                  type="video/mp4"
                />
                <source
                  src="https://assets.mixkit.co/videos/41566/41566-720.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Multi-layer high-contrast luxury dark overlay for crystal-clear text & navbar visibility */}
              <div
                style={{
                  background:
                    'linear-gradient(90deg, rgba(7,15,25,0.90) 0%, rgba(11,22,35,0.75) 52%, rgba(7,15,25,0.48) 100%)',
                }}
                className="absolute inset-0"
              />
              <div
                style={{
                  background:
                    'linear-gradient(180deg, rgba(7,15,25,0.86) 0%, rgba(7,15,25,0.28) 38%, rgba(7,15,25,0.82) 100%)',
                }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 sm:pt-36 pb-20">
              <motion.div
                key={heroSlideIdx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl space-y-6"
              >
                <div className="inline-flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.26em] text-gold font-semibold">
                    {currentSlide.eyebrow || sec.eyebrow}
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] font-medium text-white leading-[1.08] tracking-tight">
                  {currentSlide.titleLine1 ? (
                    <>
                      <span className="block">{currentSlide.titleLine1}</span>
                      <span className="block">{currentSlide.titleLine2}</span>
                      <span className="block text-gold font-normal">
                        {currentSlide.titleHighlight}
                      </span>
                    </>
                  ) : (
                    <span>{sec.title}</span>
                  )}
                </h1>

                <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                  {currentSlide.subtitle || sec.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={sec.ctaPrimaryLink || '#tailored-services'}
                    className="bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <span>{sec.ctaPrimaryText || 'Explore Our Services'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setVideoModalUrl('/videos/hero-interior.mp4')}
                    className="group inline-flex items-center gap-3 text-white hover:text-gold text-xs sm:text-sm font-medium px-3 py-2 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-full border border-white/40 group-hover:border-gold bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:scale-105">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </span>
                    <span>{sec.ctaSecondaryText || 'Watch Our Showreel'}</span>
                  </button>
                </div>
              </motion.div>

              {/* Bottom Right Slide Indicators: 01 — 02 — 03 */}
              <div className="mt-12 lg:mt-0 lg:absolute lg:bottom-10 lg:right-8 flex items-center gap-3 text-xs font-medium text-white/75">
                {slides.map((s: any, idx: number) => {
                  const active = idx === heroSlideIdx % slides.length;
                  return (
                    <React.Fragment key={idx}>
                      <button
                        type="button"
                        onClick={() => setHeroSlideIdx(idx)}
                        className={`transition-colors ${
                          active ? 'text-gold font-bold text-sm' : 'hover:text-white'
                        }`}
                      >
                        {s.number || `0${idx + 1}`}
                      </button>
                      {idx < slides.length - 1 && (
                        <span
                          className={`h-[1.5px] transition-all ${
                            active ? 'w-8 bg-gold' : 'w-4 bg-white/30'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 2. OUR SERVICES: End-to-End Interior Design & Contracting Solutions
      // ======================================================================
      case 'services-overview': {
        const cards = sec.data?.cards?.length
          ? sec.data.cards
          : [
              {
                title: 'Residential, Villa & Apartment Interior Design',
                subtitle: 'Elegant homes, Luxurious villas, Modern apartments',
                image:
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
                href: '/services/residential-interior-design',
                icon: 'Home',
              },
              {
                title: 'Commercial Building Interior Design',
                subtitle: 'Offices, Malls, Restaurants, Party Halls, Hospitals & More',
                image:
                  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85',
                href: '/services/office-interior-design',
                icon: 'Building2',
              },
            ];

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="py-16 lg:py-24 bg-[#FAF7F2] border-b border-[#E8DEC8]/70"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                {/* Left Column (5 cols) */}
                <div className="lg:col-span-5 space-y-5 pr-0 lg:pr-6">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-charcoal-muted font-semibold block">
                    {sec.eyebrow || 'OUR SERVICES'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-charcoal font-semibold leading-[1.15]">
                    {sec.title || 'End-to-End Interior Design & Contracting Solutions'}
                  </h2>
                  <p className="text-charcoal-muted text-sm sm:text-[15px] leading-relaxed">
                    {sec.subtitle ||
                      "We create spaces that inspire, engage and perform. Whether it's your dream home or a high-traffic commercial space, our expert team delivers world-class design and execution."}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={sec.ctaPrimaryLink || '/about'}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#B88B38] hover:text-charcoal border-b border-[#D4A853] pb-1 transition-colors"
                    >
                      <span>{sec.ctaPrimaryText || 'Learn More About Us'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: 2 Large Category Cards (7 cols) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {cards.map((card: any, idx: number) => {
                    const IconComp = card.icon === 'Building2' ? Building2 : Home;
                    return (
                      <Link
                        key={idx}
                        href={card.href || '/services'}
                        className="group bg-white rounded-2xl overflow-hidden shadow-luxury border border-[#E8DEC8]/80 flex flex-col transition-all duration-300 hover:-translate-y-1.5"
                      >
                        <div className="relative h-52 sm:h-56 overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between relative">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-center justify-center text-[#B88B38] shrink-0 mt-0.5">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-[#B88B38] transition-colors leading-snug">
                                {card.title}
                              </h3>
                              <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
                                {card.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end mt-4">
                            <span className="w-8 h-8 rounded-full border border-[#E8DEC8] group-hover:border-gold group-hover:bg-gold text-charcoal-muted group-hover:text-navy-950 flex items-center justify-center transition-colors">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 3. 4-PILLAR VALUE STRIP (Creative Designs | Premium Quality | On-Time Delivery | End-to-End Support)
      // ======================================================================
      case 'value-pillars': {
        const pillars = sec.data?.pillars?.length
          ? sec.data.pillars
          : [
              {
                icon: 'Compass',
                title: 'Creative Designs',
                subtitle: 'Unique & personalized concepts',
              },
              {
                icon: 'Gem',
                title: 'Premium Quality',
                subtitle: 'Only the best materials & finishes',
              },
              {
                icon: 'Clock',
                title: 'On-Time Delivery',
                subtitle: 'Your time, our commitment',
              },
              {
                icon: 'Headset',
                title: 'End-to-End Support',
                subtitle: 'From design to execution',
              },
            ];

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="py-10 bg-[#F6F1E7] border-b border-[#E8DEC8]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFD3BC]">
                {pillars.map((pillar: any, idx: number) => {
                  const IconComp = PILLAR_ICONS[pillar.icon] || Gem;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center px-6 py-4 first:pt-0 sm:first:pt-4 last:pb-0 sm:last:pb-4"
                    >
                      <div className="w-11 h-11 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-[#B88B38] mb-3">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-charcoal">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-1">{pillar.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 4. WHY CHOOSE US: "Your Vision, Our Expertise" + Stats + Double-Height Lobby
      // ======================================================================
      case 'why-choose-us': {
        const stats = sec.data?.stats?.length
          ? sec.data.stats
          : [
              { value: '500+', label: 'Projects Delivered' },
              { value: '200+', label: 'Happy Clients' },
              { value: '10+', label: 'Years of Experience' },
              { value: '100%', label: 'Client Satisfaction' },
            ];

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="relative bg-[#0B1623] text-white overflow-hidden min-h-[540px] flex items-center"
          >
            {/* Right-side Architectural Image with seamless dark navy blend on the left */}
            <div className="absolute inset-0 lg:left-[32%]">
              <img
                src={
                  sec.mediaUrl ||
                  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85'
                }
                alt={sec.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1623] via-[#0B1623]/80 lg:via-[#0B1623]/45 to-[#0B1623]/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1623]/90 via-transparent to-[#0B1623]/30" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                {/* Left Content + Stats (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block">
                    {sec.eyebrow || 'WHY CHOOSE US'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-medium text-white leading-[1.12]">
                    {sec.title || 'Your Vision, Our Expertise'}
                  </h2>
                  <p className="text-white/75 text-sm sm:text-[15px] leading-relaxed max-w-xl">
                    {sec.subtitle ||
                      'With years of experience and a passion for design, we turn ordinary spaces into extraordinary experiences. Our team of designers, architects and project managers work closely with you at every step.'}
                  </p>

                  <div className="pt-1">
                    <Link
                      href={sec.ctaPrimaryLink || '#our-process'}
                      className="bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-xs px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <span>{sec.ctaPrimaryText || 'Our Process'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Statistics Row */}
                  <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/15 max-w-xl">
                    {stats.map((st: any, idx: number) => (
                      <div key={idx}>
                        <div className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                          {st.value}
                        </div>
                        <div className="text-[11px] sm:text-xs text-white/65 mt-1">
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Overlay Controls: Watch Our Story button + Script Signature (5 cols) */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between gap-6">
                  <button
                    type="button"
                    onClick={() => setVideoModalUrl('/videos/hero-interior.mp4')}
                    className="bg-navy-950/75 hover:bg-navy-950/90 backdrop-blur-md border border-white/25 hover:border-gold text-white px-5 py-2.5 rounded-full inline-flex items-center gap-3 text-xs font-medium transition-all shadow-lg"
                  >
                    <span className="w-7 h-7 rounded-full bg-gold text-navy-950 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                    <span>{sec.ctaSecondaryText || 'Watch Our Story'}</span>
                  </button>

                  <div className="font-script text-2xl sm:text-3xl text-white/90 drop-shadow-md text-right leading-snug select-none">
                    {sec.data?.signatureText || 'Designing Spaces for a Better Tomorrow'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 5. OUR SERVICES: "Tailored Solutions for Every Space" (Residential | Commercial | All)
      // ======================================================================
      case 'tailored-solutions': {
        const defaultResCards = sec.data?.residentialHighlightCards || [
          {
            title: 'Homes',
            subtitle: 'Elegant living spaces for your family',
            image:
              'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
            href: '/services/residential-interior-design',
            categoryType: 'Residential',
          },
          {
            title: 'Villas',
            subtitle: 'Luxury beyond expectations',
            image:
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
            href: '/services/villa-interior-design',
            categoryType: 'Residential',
          },
          {
            title: 'Apartments',
            subtitle: 'Modern spaces, smart living',
            image:
              'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85',
            href: '/services/apartment-interior-design',
            categoryType: 'Residential',
          },
        ];

        const commercialCards = services
          .filter((s: any) => s.categoryType === 'Commercial')
          .slice(0, 3)
          .map((s: any) => ({
            title: s.title.replace(' Interior Design', ''),
            subtitle: s.shortDescription,
            image: s.cardImage || s.heroBanner,
            href: `/services/${s.slug}`,
            categoryType: 'Commercial',
          }));

        const allServiceCards = services.map((s: any) => ({
          title: s.title.replace(' Interior Design', ''),
          subtitle: s.shortDescription,
          image: s.cardImage || s.heroBanner,
          href: `/services/${s.slug}`,
          categoryType: s.categoryType,
        }));

        const displayedCards =
          serviceTab === 'Residential'
            ? defaultResCards
            : serviceTab === 'Commercial'
            ? commercialCards
            : allServiceCards.slice(0, 7);

        return (
          <section
            id="tailored-services"
            key={sec._id || sec.sectionKey}
            className="py-16 lg:py-24 bg-[#FAF7F2]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header & Filter Pills */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-charcoal-muted font-semibold block mb-2">
                    {sec.eyebrow || 'OUR SERVICES'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-charcoal font-semibold">
                    {sec.title || 'Tailored Solutions for Every Space'}
                  </h2>
                </div>

                {/* Filter Tabs: Residential | Commercial | All */}
                <div className="inline-flex items-center bg-[#EFE8DA] p-1.5 rounded-full self-start md:self-auto">
                  {(['Residential', 'Commercial', 'All'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setServiceTab(tab)}
                      className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                        serviceTab === tab
                          ? 'bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 shadow-sm'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4-Column Grid matching the attached design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedCards.map((card: any, idx: number) => (
                  <Link
                    key={idx}
                    href={card.href}
                    className="group bg-white rounded-2xl overflow-hidden shadow-luxury border border-[#E8DEC8]/80 flex flex-col transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex items-center justify-between gap-3 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E8DEC8] flex items-center justify-center text-[#B88B38] shrink-0 mt-0.5">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-[#B88B38] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B88B38] shrink-0 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}

                {/* 4th Card: Dark Overlay "Explore All Services ->" matching the design */}
                <Link
                  href="/services"
                  className="group relative rounded-2xl overflow-hidden min-h-[310px] flex flex-col items-center justify-end p-7 text-center shadow-luxury"
                >
                  <img
                    src={
                      sec.data?.exploreCardImage ||
                      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85'
                    }
                    alt="Explore All Services"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070F19]/95 via-[#0B1623]/70 to-[#0B1623]/40" />
                  <div className="relative z-10 flex flex-col items-center space-y-3 pb-4">
                    <div className="w-12 h-12 rounded-xl border border-gold/40 bg-white/10 backdrop-blur-sm flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy-950 transition-all">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="text-white font-serif text-xl font-medium flex items-center gap-2 group-hover:text-gold transition-colors">
                      <span>Explore All Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-white/65">
                      Residential • Villa • Office • Restaurant • Hospital • Mall • Cinema
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 6. FEATURED PROJECTS: "Our Latest Work" (5-column horizontal showcase on dark navy)
      // ======================================================================
      case 'featured-projects': {
        const featuredList = projects.filter((p: any) => p.isFeatured).slice(0, 5);
        const displayProjects =
          featuredList.length > 0 ? featuredList : projects.slice(0, 5);

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="py-16 lg:py-24 bg-[#0B1623] text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-2">
                    {sec.eyebrow || 'FEATURED PROJECTS'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-white">
                    {sec.title || 'Our Latest Work'}
                  </h2>
                </div>
                <Link
                  href={sec.ctaPrimaryLink || '/projects'}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/85 hover:text-gold font-medium border-b border-white/25 hover:border-gold pb-1 self-start sm:self-auto transition-colors"
                >
                  <span>{sec.ctaPrimaryText || 'View All Projects'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 5-Column Showcase matching the reference layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {displayProjects.map((proj: any) => (
                  <Link
                    key={proj._id || proj.slug}
                    href={`/projects/${proj.slug}`}
                    className="group relative h-80 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10 block"
                  >
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070F19] via-[#070F19]/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="w-8 h-8 rounded-lg bg-navy-950/80 border border-gold/40 flex items-center justify-center text-gold mb-2.5">
                        {proj.projectType === 'Commercial' ? (
                          <Building2 className="w-4 h-4" />
                        ) : (
                          <Home className="w-4 h-4" />
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-medium text-white group-hover:text-gold transition-colors leading-snug">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-white/65 mt-0.5">
                        {proj.projectType || proj.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 7. OUR DESIGN PROCESS SECTION (Configurable from CMS)
      // ======================================================================
      case 'our-process': {
        const steps = sec.data?.steps || [
          {
            step: '01',
            title: 'Discovery & Spatial Audit',
            description:
              'We meet to understand your lifestyle or brand goals, evaluate site dimensions, and establish a clear budget framework.',
          },
          {
            step: '02',
            title: '3D Architecture & Material Curation',
            description:
              'Experience photorealistic 3D renders and touch curated stone, timber, and fabric samples in our design lounge.',
          },
          {
            step: '03',
            title: 'Precision Factory & Site Execution',
            description:
              'Our engineers manage civil, MEP, acoustic, and custom factory joinery with weekly quality checkpoints.',
          },
          {
            step: '04',
            title: 'Styling & On-Time Handover',
            description:
              'Final lighting calibration, soft-furnishing styling, deep cleaning, and key handover with comprehensive warranty.',
          },
        ];

        return (
          <section
            id="our-process"
            key={sec._id || sec.sectionKey}
            className="py-16 lg:py-20 bg-[#F6F1E7] border-b border-[#E8DEC8]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#B88B38] font-semibold block mb-2">
                  {sec.eyebrow || 'OUR DESIGN PROCESS'}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
                  {sec.title || 'From Concept Sketch to Turnkey Handover'}
                </h2>
                {sec.subtitle && (
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
                    {sec.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-sm hover:shadow-luxury transition-shadow relative"
                  >
                    <span className="font-serif text-4xl font-bold text-gold/35 block mb-3">
                      {st.step || `0${idx + 1}`}
                    </span>
                    <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 8. TESTIMONIALS: "What Our Clients Say" (Matches attached reference layout)
      // ======================================================================
      case 'testimonials': {
        const list = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
        const visibleTestimonials = list.slice(testimonialOffset, testimonialOffset + 3);
        const displayItems =
          visibleTestimonials.length > 0 ? visibleTestimonials : list.slice(0, 3);

        return (
          <section
            id="testimonials"
            key={sec._id || sec.sectionKey}
            className="py-16 lg:py-24 bg-[#FAF7F2] relative"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Heading & Intro (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-charcoal-muted font-semibold block">
                    {sec.eyebrow || 'TESTIMONIALS'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-charcoal font-semibold leading-tight">
                    {sec.title || 'What Our Clients Say'}
                  </h2>
                  <p className="text-charcoal-muted text-sm leading-relaxed">
                    {sec.subtitle ||
                      "Real stories. Real people. Real satisfaction. Here's what our clients have to say about working with Vision Tech Solutions."}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialOffset((prev) =>
                          prev > 0 ? prev - 1 : Math.max(0, list.length - 3)
                        )
                      }
                      aria-label="Previous testimonials"
                      className="w-10 h-10 rounded-full border border-[#D8CCB8] hover:border-gold bg-white hover:bg-gold text-charcoal flex items-center justify-center transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialOffset((prev) =>
                          prev + 1 < list.length ? prev + 1 : 0
                        )
                      }
                      aria-label="Next testimonials"
                      className="w-10 h-10 rounded-full border border-[#D8CCB8] hover:border-gold bg-white hover:bg-gold text-charcoal flex items-center justify-center transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column: 3 Testimonial Cards (8 cols) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {displayItems.map((item: any, idx: number) => (
                    <div
                      key={item._id || idx}
                      className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-luxury flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={
                              item.photograph ||
                              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.customerName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gold/40"
                          />
                          <div className="flex items-center gap-0.5 text-gold">
                            {Array.from({ length: item.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-[13px] text-charcoal-muted italic leading-relaxed">
                          &ldquo;{item.reviewContent}&rdquo;
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#F3EDE2]">
                        <div className="font-serif font-bold text-base text-charcoal">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          {item.designation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {[0, 1, 2].map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    onClick={() => setTestimonialOffset(dot % Math.max(1, list.length))}
                    className={`h-2 rounded-full transition-all ${
                      testimonialOffset === dot ? 'w-6 bg-gold' : 'w-2 bg-[#D8CCB8]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 9. TRUSTED BY LEADING BRANDS (2x5 Monochrome Brand Matrix on Dark Navy)
      // ======================================================================
      case 'trusted-brands': {
        const brands = sec.data?.brands?.length
          ? sec.data.brands
          : [
              { name: 'TATA', subtitle: 'TATA GROUP' },
              { name: 'Infosys', subtitle: 'INFOSYS' },
              { name: 'HDFC BANK', subtitle: 'HDFC BANK' },
              { name: 'Marriott', subtitle: 'INTERNATIONAL' },
              { name: 'SAMSUNG', subtitle: 'ELECTRONICS' },
              { name: 'Reliance', subtitle: 'Industries Limited' },
              { name: 'WIPRO', subtitle: 'TECHNOLOGIES' },
              { name: 'Apollo', subtitle: 'HOSPITALS' },
              { name: 'KFC', subtitle: 'RESTAURANTS' },
              { name: 'DECATHLON', subtitle: 'SPORTS' },
            ];

        return (
          <section
            key={sec._id || sec.sectionKey}
            className="py-14 lg:py-20 bg-[#0B1623] text-white border-t border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column (4 cols) */}
                <div className="lg:col-span-4 space-y-3 pr-0 lg:pr-6 lg:border-r lg:border-white/15">
                  <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white leading-tight">
                    {sec.title || 'Trusted by Leading Brands'}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                    {sec.subtitle ||
                      'We are proud to have worked with some of the most respected brands across industries.'}
                  </p>
                </div>

                {/* Right Column: 2x5 Logo Grid (8 cols) */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-6">
                  {brands.map((b: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-colors text-center"
                    >
                      <span className="font-serif font-bold tracking-wider text-base sm:text-lg text-white/90">
                        {b.name}
                      </span>
                      {b.subtitle && (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-white/45 mt-0.5">
                          {b.subtitle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // 10. READY TO GET STARTED? – "Let's Build Something Beautiful Together" + Live Form
      // ======================================================================
      case 'consultation-cta': {
        const promises = sec.data?.promises?.length
          ? sec.data.promises
          : [
              { icon: 'MessagesSquare', label: 'Free Consultation' },
              { icon: 'Award', label: 'Expert Guidance' },
              { icon: 'Sliders', label: 'Customized Solutions' },
              { icon: 'ShieldCheck', label: 'No Obligation' },
            ];

        return (
          <section
            id="consultation-form"
            key={sec._id || sec.sectionKey}
            className="relative py-16 lg:py-24 bg-navy-950 text-white overflow-hidden"
          >
            {/* Background Interior Image with Rich Dark Overlay */}
            <div className="absolute inset-0">
              <img
                src={
                  sec.mediaUrl ||
                  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85'
                }
                alt="Book Consultation"
                className="w-full h-full object-cover"
              />
              <div
                style={{ backgroundColor: 'rgba(7, 15, 25, 0.86)' }}
                className="absolute inset-0 backdrop-blur-[2px]"
              />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Copy (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block">
                    {sec.eyebrow || 'READY TO GET STARTED?'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-white leading-[1.15]">
                    {sec.title || "Let's Build Something Beautiful Together"}
                  </h2>
                  <p className="text-white/75 text-sm leading-relaxed">
                    {sec.subtitle ||
                      'Book a free consultation with our design experts in Hyderabad and take the first step towards your dream space.'}
                  </p>
                </div>

                {/* Center Column: Glassmorphic Consultation Form (5 cols) */}
                <div className="lg:col-span-5">
                  <form
                    onSubmit={handleEnquirySubmit}
                    className="bg-navy-950/75 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4"
                  >
                    {/* Honeypot field */}
                    <input
                      type="text"
                      name="website_url_honeypot"
                      value={formState.website_url_honeypot}
                      onChange={(e) =>
                        setFormState({ ...formState, website_url_honeypot: e.target.value })
                      }
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-gold"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number *"
                        value={formState.phone}
                        onChange={(e) =>
                          setFormState({ ...formState, phone: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-gold"
                      />
                      <select
                        value={formState.serviceInterestedIn}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            serviceInterestedIn: e.target.value,
                          })
                        }
                        className="w-full bg-navy-900/90 border border-white/20 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-gold"
                      >
                        <option value="">Select Service</option>
                        <option value="Residential Interior Design">
                          Residential Interior Design
                        </option>
                        <option value="Villa Interior Design">Villa Interior Design</option>
                        <option value="Apartment Interior Design">
                          Apartment Interior Design
                        </option>
                        <option value="Office Interior Design">Office Interior Design</option>
                        <option value="Restaurant Interior Design">
                          Restaurant Interior Design
                        </option>
                        <option value="Hospital Interior Design">
                          Hospital Interior Design
                        </option>
                        <option value="Shopping Mall Interior Design">
                          Shopping Mall Interior Design
                        </option>
                        <option value="Movie Theater Interior Design">
                          Movie Theater Interior Design
                        </option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Location in Hyderabad & Brief Project Requirements (Optional)"
                        value={formState.projectDetails}
                        onChange={(e) =>
                          setFormState({ ...formState, projectDetails: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-gold"
                      />
                    </div>

                    {submitResult && (
                      <div
                        className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                          submitResult.ok
                            ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200'
                            : 'bg-rose-950/90 border border-rose-500/40 text-rose-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{submitResult.msg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-xs sm:text-sm py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                    >
                      <span>
                        {submitting
                          ? 'Submitting Request...'
                          : sec.ctaPrimaryText || 'Request Consultation'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right Column: 4 Trust Badges (3 cols) */}
                <div className="lg:col-span-3 space-y-4 pl-0 lg:pl-4">
                  {promises.map((item: any, idx: number) => {
                    const IconComp = PROMISE_ICONS[item.icon] || ShieldCheck;
                    return (
                      <div key={idx} className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full border border-gold/50 bg-gold/15 flex items-center justify-center text-gold shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-white/90">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ======================================================================
      // GENERIC CMS PAGE-BUILDER BLOCKS (Text, Image-Text Split, Full-Width Image, CTA)
      // ======================================================================
      default:
        return (
          <section
            key={sec._id || sec.sectionKey}
            className="py-16 bg-[#FAF7F2] border-b border-[#E8DEC8]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={sec.mediaUrl ? 'lg:col-span-6 space-y-4' : 'lg:col-span-12 space-y-4'}>
                  {sec.eyebrow && (
                    <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
                      {sec.eyebrow}
                    </span>
                  )}
                  <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="text-charcoal-muted text-sm leading-relaxed">
                      {sec.subtitle}
                    </p>
                  )}
                  {sec.content && (
                    <div
                      className="prose prose-sm max-w-none text-charcoal-muted"
                      dangerouslySetInnerHTML={{ __html: sec.content }}
                    />
                  )}
                  {sec.ctaPrimaryText && (
                    <Link
                      href={sec.ctaPrimaryLink || '/contact'}
                      className="inline-flex items-center gap-2 bg-gold text-navy-950 font-semibold text-xs px-6 py-3 rounded-full"
                    >
                      <span>{sec.ctaPrimaryText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                {sec.mediaUrl && (
                  <div className="lg:col-span-6">
                    <img
                      src={sec.mediaUrl}
                      alt={sec.title}
                      className="w-full h-80 object-cover rounded-2xl shadow-luxury"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <main className="min-h-screen">
      {sections.map((sec: any) => renderSection(sec))}

      {/* Showreel / Story Video Lightbox Modal */}
      {videoModalUrl && (
        <div
          className="fixed inset-0 z-[80] bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setVideoModalUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-navy-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                Vision Tech Solutions – Architectural Showreel
              </span>
              <button
                onClick={() => setVideoModalUrl(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {videoModalUrl.endsWith('.mp4') ? (
                <video
                  src={videoModalUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={videoModalUrl}
                  title="Vision Tech Solutions Showreel"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
