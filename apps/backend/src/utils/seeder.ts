import bcrypt from 'bcryptjs';
import {
  Permission,
  Role,
  User,
  WebsiteSettings,
  NavigationMenu,
  Service,
  Project,
  ProjectImage,
  GalleryAlbum,
  MediaAsset,
  Testimonial,
  BlogCategory,
  BlogPost,
  Faq,
  Enquiry,
  Page,
  PageSection,
  ActivityLog,
} from '../models';
import { env } from '../config/env';
import { logger } from './logger';
import { PermissionKey } from '@vision/shared';

const ALL_PERMISSIONS: { key: PermissionKey; name: string; module: string; description: string }[] = [
  { key: 'users:read', name: 'View Users', module: 'Users & RBAC', description: 'View admin users and roles' },
  { key: 'users:write', name: 'Manage Users', module: 'Users & RBAC', description: 'Create, edit and deactivate users' },
  { key: 'roles:manage', name: 'Manage Roles & Permissions', module: 'Users & RBAC', description: 'Configure role permissions' },
  { key: 'pages:read', name: 'View Pages', module: 'Pages', description: 'View CMS pages and sections' },
  { key: 'pages:write', name: 'Edit Pages & Sections', module: 'Pages', description: 'Create and edit pages and blocks' },
  { key: 'pages:publish', name: 'Publish Pages', module: 'Pages', description: 'Publish or unpublish pages' },
  { key: 'services:read', name: 'View Services', module: 'Services', description: 'View interior design services' },
  { key: 'services:write', name: 'Manage Services', module: 'Services', description: 'Create, edit and publish services' },
  { key: 'projects:read', name: 'View Projects', module: 'Projects', description: 'View portfolio projects' },
  { key: 'projects:write', name: 'Manage Projects', module: 'Projects', description: 'Create, edit and publish projects' },
  { key: 'gallery:read', name: 'View Gallery', module: 'Gallery', description: 'View gallery albums' },
  { key: 'gallery:write', name: 'Manage Gallery', module: 'Gallery', description: 'Create and reorder gallery albums' },
  { key: 'media:read', name: 'View Media Library', module: 'Media', description: 'Browse uploaded images and videos' },
  { key: 'media:write', name: 'Upload & Manage Media', module: 'Media', description: 'Upload and delete media assets' },
  { key: 'testimonials:read', name: 'View Testimonials', module: 'Testimonials', description: 'View customer reviews' },
  { key: 'testimonials:write', name: 'Manage Testimonials', module: 'Testimonials', description: 'Add and edit testimonials' },
  { key: 'blog:read', name: 'View Blog Articles', module: 'Blog', description: 'View blog posts' },
  { key: 'blog:write', name: 'Manage Blog Articles', module: 'Blog', description: 'Create, edit and publish blog articles' },
  { key: 'enquiries:read', name: 'View Enquiries', module: 'Enquiries', description: 'View customer consultation leads' },
  { key: 'enquiries:write', name: 'Manage Enquiries', module: 'Enquiries', description: 'Update lead status, notes and assignments' },
  { key: 'settings:read', name: 'View Website Settings', module: 'Settings', description: 'View global configuration' },
  { key: 'settings:write', name: 'Manage Website Settings', module: 'Settings', description: 'Update global settings and menus' },
  { key: 'seo:manage', name: 'Manage SEO Metadata', module: 'SEO', description: 'Edit SEO titles, slugs, and OpenGraph data' },
];

export async function seedDatabaseIfNeeded(forceReset = false): Promise<void> {
  if (forceReset) {
    await Promise.all([
      Permission.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      WebsiteSettings.deleteMany({}),
      NavigationMenu.deleteMany({}),
      Service.deleteMany({}),
      Project.deleteMany({}),
      ProjectImage.deleteMany({}),
      GalleryAlbum.deleteMany({}),
      MediaAsset.deleteMany({}),
      Testimonial.deleteMany({}),
      BlogCategory.deleteMany({}),
      BlogPost.deleteMany({}),
      Faq.deleteMany({}),
      Enquiry.deleteMany({}),
      Page.deleteMany({}),
      PageSection.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
  }

  const existingSuperAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existingSuperAdmin && !forceReset) {
    logger.info('Database already seeded with Vision Tech Solutions content.');
    return;
  }

  logger.info('Seeding Vision Tech Solutions database with luxury interior design content...');

  // 1. Seed Permissions
  await Permission.insertMany(ALL_PERMISSIONS);
  const allPermKeys = ALL_PERMISSIONS.map((p) => p.key);

  // 2. Seed the 5 Roles
  const rolesData = [
    {
      name: 'Super Administrator' as const,
      slug: 'super-administrator',
      description: 'Full unrestricted control over users, permissions, global settings, and all CMS modules.',
      permissions: allPermKeys,
      isSystem: true,
    },
    {
      name: 'Administrator' as const,
      slug: 'administrator',
      description: 'Can manage all website content, pages, projects, services, enquiries, and settings.',
      permissions: allPermKeys.filter((k) => k !== 'roles:manage'),
      isSystem: true,
    },
    {
      name: 'Content Manager' as const,
      slug: 'content-manager',
      description: 'Can edit website pages, sections, services, testimonials, FAQs, SEO, and blog articles.',
      permissions: [
        'pages:read',
        'pages:write',
        'pages:publish',
        'services:read',
        'services:write',
        'testimonials:read',
        'testimonials:write',
        'blog:read',
        'blog:write',
        'media:read',
        'media:write',
        'seo:manage',
      ] as PermissionKey[],
      isSystem: true,
    },
    {
      name: 'Gallery Manager' as const,
      slug: 'gallery-manager',
      description: 'Can upload, categorize, reorder, and manage gallery albums and media library assets.',
      permissions: [
        'gallery:read',
        'gallery:write',
        'media:read',
        'media:write',
        'projects:read',
      ] as PermissionKey[],
      isSystem: true,
    },
    {
      name: 'Project Manager' as const,
      slug: 'project-manager',
      description: 'Can create, update, reorder, and publish interior design projects and manage enquiries.',
      permissions: [
        'projects:read',
        'projects:write',
        'media:read',
        'media:write',
        'enquiries:read',
        'enquiries:write',
        'seo:manage',
      ] as PermissionKey[],
      isSystem: true,
    },
  ];

  const createdRoles = await Role.insertMany(rolesData);
  const roleMap = new Map(createdRoles.map((r) => [r.name, r]));

  // 3. Seed Users for each Role
  const defaultPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const usersToCreate = [
    {
      name: 'Ar. Vikramaditya Rao',
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: defaultPasswordHash,
      designation: 'Founder & Principal Architect',
      role: roleMap.get('Super Administrator')!._id,
      roleName: 'Super Administrator' as const,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
    {
      name: 'Meera Krishnan',
      email: 'admin.ops@visiontechsolutions.co.in',
      passwordHash: defaultPasswordHash,
      designation: 'Director of Operations',
      role: roleMap.get('Administrator')!._id,
      roleName: 'Administrator' as const,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
    {
      name: 'Ananya Deshmukh',
      email: 'content@visiontechsolutions.co.in',
      passwordHash: defaultPasswordHash,
      designation: 'Editorial & Brand Strategist',
      role: roleMap.get('Content Manager')!._id,
      roleName: 'Content Manager' as const,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
    {
      name: 'Siddharth Menon',
      email: 'gallery@visiontechsolutions.co.in',
      passwordHash: defaultPasswordHash,
      designation: 'Visual Curator & Architectural Photographer',
      role: roleMap.get('Gallery Manager')!._id,
      roleName: 'Gallery Manager' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
    {
      name: 'Kabir Malhotra',
      email: 'projects@visiontechsolutions.co.in',
      passwordHash: defaultPasswordHash,
      designation: 'Senior Turnkey Project Director',
      role: roleMap.get('Project Manager')!._id,
      roleName: 'Project Manager' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
  ];

  const createdUsers = await User.insertMany(usersToCreate);
  const superAdmin = createdUsers[0];

  // 4. Seed Global Website Settings
  await WebsiteSettings.create({
    companyName: 'Vision Tech Solutions',
    tagline: 'DESIGN • BUILD • TRANSFORM',
    logoUrl: '',
    faviconUrl: '',
    address: 'Plot No. 123, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033',
    phonePrimary: '+91 98765 43210',
    phoneSecondary: '+91 40 4123 5678',
    emailPrimary: 'info@visiontechsolutions.co.in',
    emailSupport: 'projects@visiontechsolutions.co.in',
    whatsappNumber: '+919876543210',
    businessHours: 'Monday – Saturday: 9:30 AM – 7:00 PM IST',
    googleMapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.6789123456!2d78.4071!3d17.4319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9144f4b1b111%3A0x6d3b0b8c52b1a8e0!2sRoad%20No.%2036%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    googleMapsDirectionsUrl: 'https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad+500033',
    socialLinks: {
      facebook: 'https://facebook.com/visiontechsolutions',
      instagram: 'https://instagram.com/visiontechsolutions',
      linkedin: 'https://linkedin.com/company/visiontechsolutions',
      youtube: 'https://youtube.com/@visiontechsolutions',
      pinterest: 'https://pinterest.com/visiontechsolutions',
    },
    announcementBar: {
      enabled: false,
      text: 'Complimentary Architectural Consultation & 3D Spatial Walkthrough for Luxury Villas & Commercial Spaces.',
      linkText: 'Book Consultation',
      linkUrl: '/contact',
    },
    footerAboutText:
      'Creating beautiful, functional and sustainable spaces for a better tomorrow.',
    copyrightText: '© 2026 Vision Tech Solutions. All rights reserved.',
    defaultSeo: {
      metaTitle: 'Vision Tech Solutions | Luxury Interior Design & Turnkey Contracting in Hyderabad',
      metaDescription:
        'At Vision Tech Solutions (visiontechsolutions.co.in), we design inspiring spaces in Hyderabad that elevate your lifestyle and business. Luxury residential, villa, apartment, office, restaurant, hospital, and mall interiors.',
      slug: 'home',
      ogTitle: 'Vision Tech Solutions – Good Design Creates Better Living & Working',
      ogDescription:
        'Premier luxury interior architecture and turnkey contracting studio in Jubilee Hills, Hyderabad.',
      ogImage:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      keywords: [
        'Luxury Interior Design Hyderabad',
        'Villa Interior Design Jubilee Hills',
        'Commercial Interior Contracting Hyderabad',
        'Vision Tech Solutions',
        'Office Interior Design HITEC City Hyderabad',
      ],
    },
    notificationEmails: ['info@visiontechsolutions.co.in', 'projects@visiontechsolutions.co.in'],
    supportedLanguages: ['en', 'te', 'hi', 'kn', 'ta', 'ml'],
    defaultLanguage: 'en',
    updatedBy: superAdmin._id as any,
  });

  // 5. Seed Navigation Menus
  await NavigationMenu.insertMany([
    {
      location: 'header',
      title: 'Main Header Navigation',
      locale: 'en',
      items: [
        { label: 'Home', href: '/', order: 1 },
        { label: 'About Us', href: '/about', order: 2 },
        {
          label: 'Services',
          href: '/services',
          order: 3,
          children: [
            {
              label: 'Residential Interior Design',
              href: '/services/residential-interior-design',
              description: 'Bespoke living spaces crafted for timeless family comfort',
            },
            {
              label: 'Villa Interior Design',
              href: '/services/villa-interior-design',
              description: 'Grand architectural interiors for luxury estates & villas',
            },
            {
              label: 'Apartment Interior Design',
              href: '/services/apartment-interior-design',
              description: 'Intelligent, contemporary urban apartment transformations',
            },
            {
              label: 'Office Interior Design',
              href: '/services/office-interior-design',
              description: 'High-performance corporate workspaces & executive headquarters',
            },
            {
              label: 'Restaurant Interior Design',
              href: '/services/restaurant-interior-design',
              description: 'Immersive fine-dining & hospitality experiences',
            },
            {
              label: 'Hospital Interior Design',
              href: '/services/hospital-interior-design',
              description: 'Healing, patient-centric healthcare & wellness environments',
            },
            {
              label: 'Shopping Mall Interior Design',
              href: '/services/shopping-mall-interior-design',
              description: 'Iconic retail atriums & high-footfall commercial destinations',
            },
            {
              label: 'Movie Theater / Cinema Interior Design',
              href: '/services/movie-theater-interior-design',
              description: 'Acoustic luxury auditoriums & VIP cinema lounges',
            },
          ],
        },
        { label: 'Projects', href: '/projects', order: 4 },
        { label: 'Gallery', href: '/gallery', order: 5 },
        { label: 'Contact', href: '/contact', order: 6 },
      ],
    },
    {
      location: 'footer-quick-links',
      title: 'Quick Links',
      locale: 'en',
      items: [
        { label: 'Home', href: '/', order: 1 },
        { label: 'About Us', href: '/about', order: 2 },
        { label: 'Services', href: '/services', order: 3 },
        { label: 'Projects', href: '/projects', order: 4 },
        { label: 'Gallery', href: '/gallery', order: 5 },
        { label: 'Client Testimonials', href: '/#testimonials', order: 6 },
        { label: 'FAQs', href: '/faq', order: 7 },
        { label: 'Contact Us', href: '/contact', order: 8 },
      ],
    },
    {
      location: 'footer-services',
      title: 'Our Services',
      locale: 'en',
      items: [
        { label: 'Residential Interior Design', href: '/services/residential-interior-design', order: 1 },
        { label: 'Villa Interior Design', href: '/services/villa-interior-design', order: 2 },
        { label: 'Apartment Interior Design', href: '/services/apartment-interior-design', order: 3 },
        { label: 'Shopping Mall Interior Design', href: '/services/shopping-mall-interior-design', order: 4 },
        { label: 'Office Interior Design', href: '/services/office-interior-design', order: 5 },
        { label: 'Restaurant Interior Design', href: '/services/restaurant-interior-design', order: 6 },
        { label: 'Hospital Interior Design', href: '/services/hospital-interior-design', order: 7 },
        { label: 'Movie Theater Interior Design', href: '/services/movie-theater-interior-design', order: 8 },
      ],
    },
  ]);

  // 6. Seed Projects Portfolio (8+ comprehensive projects covering every category & featured on home)
  const projectsSeed = [
    {
      title: 'Luxury Villa',
      slug: 'the-aurelia-luxury-villa',
      category: 'Villa' as const,
      projectType: 'Residential' as const,
      location: 'Jubilee Hills, Hyderabad',
      completionDate: 'August 2026',
      clientName: 'Mr. Rajesh & Anita Sharma',
      projectSize: '8,400 Sq. Ft.',
      duration: '7 Months',
      shortSummary:
        'A contemporary Mediterranean-inspired private villa blending Italian travertine, warm walnut millwork, and indoor-outdoor pool pavilions.',
      description:
        'Designed as a serene sanctuary in Jubilee Hills, Hyderabad, The Aurelia Luxury Villa reimagines contemporary tropical modernism. Double-height living volumes open seamlessly onto a cantilevered infinity pool deck, while custom brass screens filter natural daylight across bespoke Italian marble flooring.',
      designConcept:
        'Biophilic luxury anchored in tactile natural stone, fluted Burma teak paneling, and warm ambient architectural lighting that transitions effortlessly from day to twilight.',
      challenges:
        'Integrating concealed VRF climate systems and acoustic home automation across a 22-foot double-height structural glazing facade without visual clutter.',
      solutions:
        'Engineered custom recessed architectural ceiling coffers in veneered oak that house linear diffusers, motorized sheer drapery tracks, and tunable DALI warm-dim luminaires.',
      coverImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
          caption: 'Main Double-Height Formal Living Salon overlooking Private Pool',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
          caption: 'Twilight Exterior Architecture & Infinity Pool Deck',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
          caption: 'Bespoke Italian Minotti-inspired Lounge & Skyline View',
          order: 3,
        },
        {
          url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
          caption: 'Primary Master Suite with Upholstered Nubuck Headboard',
          order: 4,
        },
        {
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
          caption: 'Sculptural Quartzite Island Kitchen & Wine Cellar',
          order: 5,
        },
        {
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85',
          caption: 'Spa-Inspired Master Ensuite in Bookmatched Statuario Marble',
          order: 6,
        },
      ],
      beforeAfterImages: [
        {
          title: 'Main Living Pavilion Transformation',
          beforeUrl:
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
          afterUrl:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
          caption: 'From bare concrete structural shell to warm travertine and walnut living sanctuary.',
        },
      ],
      videos: [
        {
          title: 'The Aurelia Villa – Architectural Walkthrough',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
          isExternal: true,
        },
      ],
      isFeatured: true,
      displayOrder: 1,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'Modern Office',
      slug: 'nexus-global-tech-headquarters',
      category: 'Office' as const,
      projectType: 'Commercial' as const,
      location: 'HITEC City, Hyderabad',
      completionDate: 'July 2026',
      clientName: 'Nexus FinTech Enterprise',
      projectSize: '24,000 Sq. Ft.',
      duration: '5 Months',
      shortSummary:
        'An agile, biophilic executive headquarters engineered for collaboration, acoustic privacy, and Fortune-500 brand presence.',
      description:
        'Spanning two interconnected floors in HITEC City, Hyderabad, this flagship corporate workspace harmonizes hospitality-grade warmth with ergonomic precision. Custom acoustic timber baffles, circadian lighting, and glass-enclosed boardrooms foster deep focus and effortless teamwork.',
      designConcept:
        'Hospitality-inspired workplace architecture ("Work-Resort") combining warm oak veneers, charcoal steel framing, and lush indoor botanical courts.',
      challenges:
        'Delivering 220 ergonomic workstations, 8 acoustic boardrooms, and a 100-seater townhall within a tight 150-day turnkey handover schedule.',
      solutions:
        'Utilized modular double-glazed demountable partitions and prefabricated custom millwork modules manufactured in parallel with MEP rough-ins.',
      coverImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
          caption: 'Open Collaborative Workspace & Biophilic Daylit Lounges',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85',
          caption: 'Executive Boardroom with Integrated Telepresence & Acoustic Slats',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=85',
          caption: 'Client Reception Concierge & Sculptural Brass Feature Wall',
          order: 3,
        },
        {
          url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=85',
          caption: 'Executive Breakout Café & Barista Lounge',
          order: 4,
        },
      ],
      beforeAfterImages: [
        {
          title: 'Executive Floor Plate Transformation',
          beforeUrl:
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          afterUrl:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
          caption: 'Transformed from conventional cubicles into a luminous biophilic headquarters.',
        },
      ],
      videos: [],
      isFeatured: true,
      displayOrder: 2,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'Fine Dining Restaurant',
      slug: 'saffron-and-sage-fine-dining',
      category: 'Restaurant' as const,
      projectType: 'Commercial' as const,
      location: 'Banjara Hills, Hyderabad',
      completionDate: 'June 2026',
      clientName: 'Ms. Neha Kapoor – Culinary Collective',
      projectSize: '6,200 Sq. Ft.',
      duration: '4 Months',
      shortSummary:
        'An atmospheric culinary destination featuring hand-troweled terracotta plaster, custom blown-glass chandeliers, and velvet banquettes.',
      description:
        'Saffron & Sage was conceived as a multi-sensory gastronomic theater. Guests arrive through a dramatic bronze-clad portal into an intimate dining room anchored by a monolithic green marble show-bar and open Robata grill kitchen.',
      designConcept:
        'Earthy Mediterranean warmth meets contemporary Asian minimalism with acoustic ceiling clouds, custom cane-and-walnut dining chairs, and warm 2400K candlelight ambiance.',
      challenges:
        'Balancing open-kitchen smoke extraction and high-occupancy reverberation control while preserving an intimate fine-dining acoustic profile.',
      solutions:
        'Installed micro-perforated terracotta acoustic ceiling vaults and negative-pressure laminar air curtains around the open culinary theater.',
      coverImage:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
          caption: 'Main Dining Salon with Custom Pendant Chandeliers',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
          caption: 'Private Sommelier Tasting Room & Onyx Bar',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=85',
          caption: 'Al-Fresco Botanical Courtyard Dining Terrace',
          order: 3,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: true,
      displayOrder: 3,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'Hospital Interior',
      slug: 'asteria-premier-wellness-hospital',
      category: 'Hospital' as const,
      projectType: 'Commercial' as const,
      location: 'Gachibowli, Hyderabad',
      completionDate: 'May 2026',
      clientName: 'Asteria Healthcare Group',
      projectSize: '45,000 Sq. Ft.',
      duration: '8 Months',
      shortSummary:
        'Next-generation healing architecture combining five-star hospitality comfort with international clinical hygiene and NABH compliance.',
      description:
        'Redefining healthcare interiors, Asteria Premier Wellness Hospital replaces sterile institutional corridors with daylight-filled healing atriums, antimicrobial Corian surfaces, soothing sage-and-beige palettes, and hotel-grade VIP recovery suites.',
      designConcept:
        'Evidence-based biophilic healing design that reduces patient anxiety and accelerates recovery while optimizing nurse station ergonomics and clinical workflows.',
      challenges:
        'Meeting strict infection-control, seamless anti-bacterial flooring, and medical-gas routing standards while achieving a luxury five-star hotel aesthetic.',
      solutions:
        'Specified thermoformed seamless solid-surface wall cladding, acoustic wood-look hygienic vinyl, and concealed medical headwalls integrated into custom timber headboard cabinetry.',
      coverImage:
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85',
          caption: 'Grand Daylit Welcome Atrium & Patient Concierge Lounge',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=85',
          caption: 'Presidential VIP Recovery Suite with Family Lounge',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85',
          caption: 'Executive Diagnostic Consultation Studio',
          order: 3,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: true,
      displayOrder: 4,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'Apartment Interior',
      slug: 'the-verve-sky-apartment',
      category: 'Apartment' as const,
      projectType: 'Residential' as const,
      location: 'Financial District, Hyderabad',
      completionDate: 'September 2026',
      clientName: 'Mr. Siddharth & Priya Nair',
      projectSize: '3,800 Sq. Ft.',
      duration: '4 Months',
      shortSummary:
        'A sophisticated 4-BHK sky residence crafted with warm beige tones, fluted glass partitions, and bespoke Italian modular cabinetry.',
      description:
        'Perched on the 28th floor overlooking the Financial District in Hyderabad, this luxury apartment maximizes spatial flow through sliding bronze-mesh partitions, custom walk-in wardrobes, and a seamless champagne-lacquer kitchen.',
      designConcept:
        'Quiet European luxury—layering ivory bouclé upholstery, brushed champagne gold hardware, and smoked oak herringbone parquet.',
      challenges:
        'Expanding the visual footprint of the dining and family den without altering structural shear walls.',
      solutions:
        'Replaced solid masonry non-load-bearing dividers with floor-to-ceiling rimless fluted glass pocket doors and continuous cove-lit ceiling planes.',
      coverImage:
        'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=85',
          caption: 'Open-Plan Living & Dining Salon in Ivory and Warm Beige',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
          caption: 'Bespoke Master Bedroom with Integrated Fluted Wardrobe',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
          caption: 'Contemporary Modular Kitchen with Quartz Waterfall Counter',
          order: 3,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: true,
      displayOrder: 5,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'The Solana Heritage Residence',
      slug: 'the-solana-heritage-residence',
      category: 'Residential' as const,
      projectType: 'Residential' as const,
      location: 'Kokapet, Hyderabad',
      completionDate: 'April 2026',
      clientName: 'Dr. Arvind & Kavitha Hegde',
      projectSize: '5,600 Sq. Ft.',
      duration: '6 Months',
      shortSummary:
        'Timeless multigenerational family home blending handcrafted South Indian brass artifacts with contemporary European living comforts.',
      description:
        'Located in Kokapet, Hyderabad, The Solana Residence celebrates warm heirloom craftsmanship alongside modern architectural clarity. A central skylit courtyard anchors the formal living, puja sanctuary, and dining spaces.',
      designConcept:
        'Warm contemporary heritage—pairing natural Kota and Italian Botticino stone with hand-rubbed teakwood and soft linen drapery.',
      challenges:
        'Designing universally accessible circulation for three generations while maintaining a cohesive international luxury aesthetic.',
      solutions:
        'Integrated a custom glass-and-brass pneumatic home elevator and zero-threshold stone transitions across all three levels.',
      coverImage:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
          caption: 'Formal Family Living Room with Custom Teak Credenza',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
          caption: 'Double-Height Dining Court & Sculptural Staircase',
          order: 2,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: false,
      displayOrder: 6,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'The Grand Galleria Shopping Mall',
      slug: 'the-grand-galleria-shopping-mall',
      category: 'Shopping Mall' as const,
      projectType: 'Commercial' as const,
      location: 'Madhapur, Hyderabad',
      completionDate: 'March 2026',
      clientName: 'Galleria Retail Developments',
      projectSize: '1,20,000 Sq. Ft.',
      duration: '11 Months',
      shortSummary:
        'A luxury retail atrium featuring parametric skylight canopies, panoramic glass elevators, and international flagship concourses.',
      description:
        'Designed to elevate high-street luxury retail in South India, The Grand Galleria features sweeping curved balconies, champagne anodized aluminum soffits, and curated VIP luxury lounges.',
      designConcept:
        'Luminous architectural theater that maximizes storefront visibility, intuitive wayfinding, and dwell time.',
      challenges:
        'Coordinating high-traffic durability and smoke-evacuation atrium engineering with luxury stone flooring and sculptural lighting.',
      solutions:
        'Implemented CNC-waterjet terrazzo and granite medallions with integrated linear LED wayfinding ribbons.',
      coverImage:
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1600&q=85',
          caption: 'Central Luxury Retail Atrium & Parametric Skylight',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1600&q=85',
          caption: 'VIP Personal Styling Suite & Luxury Boutique Concourse',
          order: 2,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: false,
      displayOrder: 7,
      status: 'published' as const,
      locale: 'en' as const,
    },
    {
      title: 'Lumiere Gold Class Cinema & Lounge',
      slug: 'lumiere-gold-class-cinema-lounge',
      category: 'Movie Theater' as const,
      projectType: 'Commercial' as const,
      location: 'Banjara Hills, Hyderabad',
      completionDate: 'February 2026',
      clientName: 'Lumiere Multiplex Cinemas',
      projectSize: '32,000 Sq. Ft.',
      duration: '6 Months',
      shortSummary:
        'Dolby Atmos luxury cinema auditoriums and Art-Deco VIP champagne foyer engineered for zero-reverberation acoustic perfection.',
      description:
        'Lumiere Gold Class transforms moviegoing into a private club experience. From the dramatic obsidian-and-brass lobby lounge to motorized Italian leather recliners with personal butler call systems, every detail is engineered for immersion.',
      designConcept:
        'Contemporary Art-Deco glamour fused with precision THX and Dolby Atmos acoustic architecture.',
      challenges:
        'Eliminating low-frequency bass bleed between adjacent luxury screening rooms.',
      solutions:
        'Constructed isolated box-within-a-box floating concrete slabs and custom-fabricated stretch-velvet acoustic wall cassettes with concealed linear fiber-optic starlight ceilings.',
      coverImage:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=85',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85',
          caption: 'Gold Class Dolby Atmos Auditorium with Motorized Leather Recliners',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85',
          caption: 'VIP Cinema Foyer & Art-Deco Lounge',
          order: 2,
        },
      ],
      beforeAfterImages: [],
      videos: [],
      isFeatured: false,
      displayOrder: 8,
      status: 'published' as const,
      locale: 'en' as const,
    },
  ];

  const createdProjects = await Project.insertMany(
    projectsSeed.map((p) => ({
      ...p,
      seo: {
        metaTitle: `${p.title} – ${p.category} Interior Design | Vision Tech Solutions`,
        metaDescription: p.shortSummary,
        slug: p.slug,
        ogImage: p.coverImage,
      },
      createdBy: superAdmin._id,
    }))
  );

  // 7. Seed All 8 Required Services Pages
  const servicesSeed = [
    {
      title: 'Residential Interior Design',
      slug: 'residential-interior-design',
      categoryType: 'Residential' as const,
      shortDescription: 'Elegant living spaces for your family crafted with bespoke materials and timeless comfort.',
      heroBanner:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
      iconName: 'Home',
      introduction:
        'We design bespoke residential sanctuaries that reflect your family’s heritage, lifestyle, and aspirations—harmonizing spatial flow, natural daylight, and fine artisanal craftsmanship.',
      detailedDescription:
        'Our Residential Interior Design studio offers complete design-to-handover excellence. From spatial planning and 3D photorealistic visualizations to custom furniture manufacturing, modular kitchens, lighting automation, and soft furnishings, our senior architects curate every square inch with meticulous care.',
      ourApproach: [
        { stepNumber: '01', title: 'Lifestyle & Spatial Discovery', description: 'Deep-dive consultations to understand your family routines, storage needs, and aesthetic preferences.' },
        { stepNumber: '02', title: 'Concept & 3D Architectural Visualization', description: 'Photorealistic 3D renders, material moodboards, and walkthroughs before execution begins.' },
        { stepNumber: '03', title: 'Precision Engineering & Bespoke Joinery', description: 'Factory-finished cabinetry, imported stone laying, and concealed MEP services.' },
        { stepNumber: '04', title: 'White-Glove Styling & Handover', description: 'Final curation of lighting, drapery, artwork, and a comprehensive multi-year warranty.' },
      ],
      keyFeatures: [
        { title: 'Bespoke Italian & German Kitchens', description: 'Ergonomic culinary spaces with quartz countertops and Blum/Hettich hardware.' },
        { title: 'Custom Millwork & Wardrobes', description: 'Floor-to-ceiling fluted wood paneling, walk-in closets, and concealed storage.' },
        { title: 'Smart Home & Mood Lighting', description: 'Tunable warm architectural lighting and automated drapery control.' },
        { title: 'Vastu-Compliant Spatial Planning', description: 'Harmonious room layouts optimized for cross-ventilation and natural light.' },
      ],
      designSolutions: [
        { title: 'Formal & Family Living Salons', description: 'Double-height feature walls, bespoke sofas, and curated acoustic comfort.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80' },
        { title: 'Master Bedroom Sanctuaries', description: 'Restful palettes in warm beige, upholstered headboards, and spa-grade ensuites.', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80' },
      ],
      benefits: [
        'Single-point turnkey accountability from concept to final styling',
        '100% transparent BOQ pricing with zero hidden escalations',
        'Guaranteed 45-to-90 day project delivery timeline',
        '10-year warranty on custom woodwork and hardware',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85', caption: 'Contemporary Luxury Living Room', alt: 'Luxury Residential Interior' },
        { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85', caption: 'Warm Minimalist Master Suite', alt: 'Master Bedroom Design' },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85', caption: 'Island Kitchen & Dining', alt: 'Modular Kitchen' },
      ],
      faqs: [
        { question: 'How long does a full residential interior project take?', answer: 'A standard 3-BHK or 4-BHK residence takes 8 to 12 weeks from design sign-off to move-in ready handover.' },
        { question: 'Do you customize all furniture and wardrobes?', answer: 'Yes, every wardrobe, kitchen module, and loose furniture piece is custom-tailored to your exact spatial dimensions and material choices.' },
      ],
      relatedProjects: [createdProjects[5]._id, createdProjects[0]._id, createdProjects[4]._id],
      displayOrder: 1,
      isFeatured: true,
    },
    {
      title: 'Villa Interior Design',
      slug: 'villa-interior-design',
      categoryType: 'Residential' as const,
      shortDescription: 'Luxury beyond expectations for private estates, duplexes, and architectural villas.',
      heroBanner:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
      iconName: 'Castle',
      introduction:
        'Villas demand an architectural scale of thinking—where grand double-height foyers, sculptural staircases, private home cinemas, and landscaped pool decks flow together effortlessly.',
      detailedDescription:
        'Our Villa Interior Design practice specializes in ultra-luxury private estates ranging from 4,500 to 25,000+ sq. ft. We integrate civil modifications, HVAC VRF engineering, home elevators, Italian marble bookmatching, outdoorpergolas, and bespoke chandelier installations.',
      ourApproach: [
        { stepNumber: '01', title: 'Architectural Envelope & Civil Audit', description: 'Evaluating structural volumes, skylights, terraces, and indoor-outdoor transitions.' },
        { stepNumber: '02', title: 'Material Curation & Stone Selection', description: 'Hand-selecting imported Italian Statuario, travertine, and Burma teak veneers.' },
        { stepNumber: '03', title: 'MEP, Automation & Acoustic Integration', description: 'Seamless KNX/Crestron home automation, concealed air-conditioning, and private theater acoustics.' },
        { stepNumber: '04', title: 'Turnkey Execution & Landscape Styling', description: 'End-to-end project management with dedicated site engineers and luxury styling.' },
      ],
      keyFeatures: [
        { title: 'Double-Height Living & Chandelier Engineering', description: 'Dramatic vertical volumes anchored by custom sculptural lighting and stone cladding.' },
        { title: 'Private Home Theaters & Wine Cellars', description: 'Acoustically calibrated screening lounges and temperature-controlled tasting rooms.' },
        { title: 'Indoor-Outdoor Poolside Pavilions', description: 'Weather-resistant luxury deck lounges, outdoor kitchens, and Zen water courts.' },
        { title: 'Spa-Inspired Master Suites', description: 'Walk-in couture dressing rooms, steam showers, and freestanding stone bathtubs.' },
      ],
      designSolutions: [
        { title: 'Grand Foyer & Staircase Design', description: 'Cantilevered marble steps with brushed brass balustrades.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80' },
        { title: 'Pool Deck & Gazebo Lounges', description: 'Resort-style outdoor living integrated with the main salon.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80' },
      ],
      benefits: [
        'Dedicated Principal Architect and full-time resident site engineer',
        'Complete civil, MEP, landscape, and interior contracting under one roof',
        'Direct sourcing of European furniture, lighting, and natural stone',
        'Strict milestone-based quality audits',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', caption: 'Villa Formal Living Salon', alt: 'Villa Interior Design' },
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85', caption: 'Infinity Pool & Exterior Architecture', alt: 'Luxury Villa' },
      ],
      faqs: [
        { question: 'Do you handle civil changes and terrace extensions for villas?', answer: 'Yes, our structural and civil contracting wing handles wall modifications, skylight cut-outs, waterproofing, and terrace gazebos.' },
      ],
      relatedProjects: [createdProjects[0]._id, createdProjects[5]._id],
      displayOrder: 2,
      isFeatured: true,
    },
    {
      title: 'Apartment Interior Design',
      slug: 'apartment-interior-design',
      categoryType: 'Residential' as const,
      shortDescription: 'Modern spaces and smart living tailored for high-rise urban apartments and penthouses.',
      heroBanner:
        'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85',
      iconName: 'Building2',
      introduction:
        'Transform your high-rise apartment or sky penthouse into an expansive, clutter-free haven of contemporary elegance.',
      detailedDescription:
        'Urban apartments require intelligent spatial choreography. We combine sleek floor-to-ceiling storage, fluted glass dividers, convertible study nooks, and warm European finishes to make every square foot feel spacious, luminous, and effortlessly functional.',
      ourApproach: [
        { stepNumber: '01', title: 'Space Optimization Audit', description: 'Maximizing storage capacity and sightlines without crowding circulation.' },
        { stepNumber: '02', title: '3D Design & Material Selection', description: 'Curating scratch-resistant laminates, acrylics, veneers, and quartz surfaces.' },
        { stepNumber: '03', title: 'Off-Site Precision Manufacturing', description: 'Clean, noise-free modular production in our automated factory for rapid site assembly.' },
        { stepNumber: '04', title: '45-Day Express Handover', description: 'Deep-cleaned, styled, and ready for immediate move-in.' },
      ],
      keyFeatures: [
        { title: 'Space-Saving Modular Systems', description: 'Concealed bar units, pull-out pantries, and hydraulic storage beds.' },
        { title: 'Fluted Glass & Metal Partitions', description: 'Defining foyer and dining zones while allowing uninterrupted daylight.' },
        { title: 'Balcony Sky-Deck Makeovers', description: 'Weatherproof decking, vertical gardens, and cozy evening seating.' },
        { title: 'Acoustic Home Office Nooks', description: 'Ergonomic work-from-home stations seamlessly integrated into living or bedroom suites.' },
      ],
      designSolutions: [
        { title: 'Open-Concept Living & Dining', description: 'Unified ceiling planes and continuous flooring for an expansive feel.', image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=900&q=80' },
      ],
      benefits: [
        'Society-compliant noise and timing protocols during execution',
        'Zero-dust factory-finished modular installation',
        'Guaranteed 45-to-60 day completion',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=85', caption: 'Sky Apartment Living Room', alt: 'Apartment Interior' },
      ],
      faqs: [
        { question: 'Do you handle apartment association approvals?', answer: 'Yes, we prepare all required drawings and documentation for society/builder interior fit-out permissions.' },
      ],
      relatedProjects: [createdProjects[4]._id, createdProjects[5]._id],
      displayOrder: 3,
      isFeatured: true,
    },
    {
      title: 'Office Interior Design',
      slug: 'office-interior-design',
      categoryType: 'Commercial' as const,
      shortDescription: 'High-performing corporate workspaces, executive suites, and agile tech headquarters.',
      heroBanner:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85',
      iconName: 'Briefcase',
      introduction:
        'Great workplace design attracts top talent, elevates brand prestige, and measurably boosts team productivity.',
      detailedDescription:
        'We deliver turnkey corporate office interiors—integrating workplace strategy, ergonomic workstations, acoustic boardrooms, enterprise IT/AV networking, HVAC, fire safety, and biophilic breakout zones.',
      ourApproach: [
        { stepNumber: '01', title: 'Workplace Strategy & Headcount Planning', description: 'Analyzing department workflows, collaboration ratios, and future growth.' },
        { stepNumber: '02', title: 'Brand-Aligned Architectural Design', description: 'Translating your corporate identity into reception lobbies, boardrooms, and lounges.' },
        { stepNumber: '03', title: 'Turnkey MEP, IT & Acoustic Contracting', description: 'Complete HVAC, structured cabling, access control, fire sprinklers, and acoustic glazing.' },
        { stepNumber: '04', title: 'On-Time Handover & Certification', description: 'Zero-defect delivery so your teams can start working without a day of delay.' },
      ],
      keyFeatures: [
        { title: 'Acoustic Boardrooms & Zoom Pods', description: 'STC-45 rated double-glazed partitions and sound-absorbing timber slats.' },
        { title: 'Ergonomic Workstations & Lighting', description: 'Glare-free 4000K circadian task lighting and BIFMA-certified seating.' },
        { title: 'Hospitality-Style Reception & Cafés', description: 'Welcoming client lounges and vibrant townhall cafeterias.' },
        { title: 'Complete MEP & Fire Compliance', description: 'End-to-end electrical, server room cooling, and fire safety integration.' },
      ],
      designSolutions: [
        { title: 'Collaborative Agile Neighbourhoods', description: 'Flexible workstation clusters paired with informal huddle lounges.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80' },
      ],
      benefits: [
        'Fast-track 60-to-90 day turnkey corporate fit-outs',
        'Single contract covering civil, interior, HVAC, electrical, and networking',
        'LEED & WELL green building compliant material selections',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85', caption: 'Executive Workspace', alt: 'Office Interior' },
      ],
      faqs: [
        { question: 'Can you execute bare-shell to plug-and-play office interiors?', answer: 'Yes, we specialize in complete bare-shell to plug-and-play turnkey execution including HVAC, electrical, data networking, and furniture.' },
      ],
      relatedProjects: [createdProjects[1]._id],
      displayOrder: 4,
      isFeatured: true,
    },
    {
      title: 'Restaurant Interior Design',
      slug: 'restaurant-interior-design',
      categoryType: 'Commercial' as const,
      shortDescription: 'Atmospheric fine-dining restaurants, artisanal cafés, and luxury hospitality lounges.',
      heroBanner:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
      iconName: 'Utensils',
      introduction:
        'In hospitality, spatial atmosphere is just as memorable as the cuisine. We craft magnetic dining destinations that guests love to photograph, linger in, and return to.',
      detailedDescription:
        'From concept storytelling and seating cover optimization to commercial kitchen exhaust integration, bar ergonomics, acoustic control, and dramatic theatrical lighting, we build high-ROI hospitality spaces.',
      ourApproach: [
        { stepNumber: '01', title: 'Culinary Concept & Cover Optimization', description: 'Balancing maximum seating capacity with intimate table spacing and server flow.' },
        { stepNumber: '02', title: 'Sensory Material & Lighting Design', description: 'Warm dimmable lighting scenes, tactile textures, and signature bar focal points.' },
        { stepNumber: '03', title: 'Kitchen MEP & Acoustic Engineering', description: 'Fresh-air makeup, grease-trap plumbing, and reverberation control.' },
        { stepNumber: '04', title: 'Launch-Ready Turnkey Delivery', description: 'Custom upholstery, tableware styling, and signage installation.' },
      ],
      keyFeatures: [
        { title: 'Signature Show-Bars & Open Kitchens', description: 'Sculptural marble bar counters and theatrical culinary displays.' },
        { title: 'Acoustic Comfort Engineering', description: 'Ensuring lively energy without overwhelming echo or noise fatigue.' },
        { title: 'Custom Commercial-Grade Upholstery', description: 'Stain-resistant luxury velvets, leathers, and solid hardwood dining chairs.' },
        { title: 'Instagram-Worthy Focal Moments', description: 'Bespoke installations and lighting that drive organic social sharing.' },
      ],
      designSolutions: [],
      benefits: [
        'Optimized table turnover and server circulation efficiency',
        'Rapid turnaround to minimize pre-launch rental burn',
        'Heavy-duty hospitality finishes built for high daily footfall',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85', caption: 'Fine Dining Interior', alt: 'Restaurant Interior Design' },
      ],
      faqs: [],
      relatedProjects: [createdProjects[2]._id],
      displayOrder: 5,
      isFeatured: true,
    },
    {
      title: 'Hospital Interior Design',
      slug: 'hospital-interior-design',
      categoryType: 'Commercial' as const,
      shortDescription: 'Healing, patient-centric healthcare environments, specialty clinics, and wellness centers.',
      heroBanner:
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=85',
      iconName: 'HeartPulse',
      introduction:
        'We design compassionate, stress-reducing healthcare environments that blend five-star hospitality warmth with rigorous clinical hygiene.',
      detailedDescription:
        'Our healthcare interior specialists design multi-specialty hospitals, fertility & wellness centers, dental studios, and executive diagnostic lounges compliant with NABH and JCI guidelines.',
      ourApproach: [
        { stepNumber: '01', title: 'Clinical Workflow & Zoning Analysis', description: 'Separating sterile, semi-sterile, and public circulation paths.' },
        { stepNumber: '02', title: 'Biophilic Healing Palette', description: 'Daylight integration, calming nature-inspired tones, and intuitive wayfinding.' },
        { stepNumber: '03', title: 'Hygienic & Medical MEP Execution', description: 'Anti-microbial seamless vinyl/epoxy flooring, lead-lined imaging rooms, and HEPA HVAC.' },
        { stepNumber: '04', title: 'Accreditation-Ready Handover', description: 'Full compliance testing for safety, accessibility, and infection control.' },
      ],
      keyFeatures: [
        { title: 'Hospitality-Grade Patient Suites', description: 'Warm timber tones, concealed medical gas headwalls, and family sleeper lounges.' },
        { title: 'Antimicrobial Seamless Surfaces', description: 'Thermoformed Corian counters and cove-skirted medical-grade vinyl flooring.' },
        { title: 'Stress-Free Waiting Atriums', description: 'Acoustic ceilings, ergonomic seating, and soothing biophilic planters.' },
        { title: 'NABH & Barrier-Free Compliance', description: 'Wheelchair-friendly corridors, anti-skid grab bars, and clear visual signage.' },
      ],
      designSolutions: [],
      benefits: [
        'Proven track record in healthcare & diagnostic turnkey execution',
        'Strict adherence to infection control and fire-safety norms',
        'Calming environments that elevate patient trust and satisfaction',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85', caption: 'Hospital Atrium Lounge', alt: 'Hospital Interior Design' },
      ],
      faqs: [],
      relatedProjects: [createdProjects[3]._id],
      displayOrder: 6,
      isFeatured: true,
    },
    {
      title: 'Shopping Mall Interior Design',
      slug: 'shopping-mall-interior-design',
      categoryType: 'Commercial' as const,
      shortDescription: 'Iconic retail atriums, luxury experiential concourses, food courts, and commercial hubs.',
      heroBanner:
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=85',
      iconName: 'ShoppingBag',
      introduction:
        'Architecting landmark retail destinations that captivate shoppers, maximize storefront visibility, and drive commercial value.',
      detailedDescription:
        'We partner with commercial developers and retail brands to design grand entrance lobbies, multi-level sky-lit atriums, gourmet food courts, luxury washrooms, and VIP lounge concourses.',
      ourApproach: [
        { stepNumber: '01', title: 'Footfall & Sightline Choreography', description: 'Eliminating dead zones and ensuring clear visibility across all retail levels.' },
        { stepNumber: '02', title: 'Signature Atrium & Ceiling Architecture', description: 'Parametric baffles, skylights, and dynamic architectural illumination.' },
        { stepNumber: '03', title: 'Heavy-Duty Commercial Contracting', description: 'High-abrasion natural stone flooring, glass balustrades, and escalator cladding.' },
        { stepNumber: '04', title: 'Tenant Coordination & Delivery', description: 'Seamless interface with anchor stores and MEP life-safety systems.' },
      ],
      keyFeatures: [
        { title: 'Grand Skylit Atriums', description: 'Sculptural ceiling soffits and programmable architectural lighting.' },
        { title: 'Experiential Gourmet Food Courts', description: 'Curated seating zones, acoustic baffles, and vibrant hospitality finishes.' },
        { title: 'Five-Star Restroom & Lounge Suites', description: 'Touchless fixtures, marble vanities, and family baby-care lounges.' },
        { title: 'Intuitive Digital Wayfinding', description: 'Integrated directory kiosks and architectural signage.' },
      ],
      designSolutions: [],
      benefits: [
        'Engineered for 50,000+ daily footfall durability',
        'Enhances tenant lease value and shopper dwell time',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=85', caption: 'Luxury Mall Atrium', alt: 'Shopping Mall Interior' },
      ],
      faqs: [],
      relatedProjects: [createdProjects[6]._id],
      displayOrder: 7,
      isFeatured: true,
    },
    {
      title: 'Movie Theater / Cinema Interior Design',
      slug: 'movie-theater-interior-design',
      categoryType: 'Commercial' as const,
      shortDescription: 'Acoustic luxury auditoriums, Dolby Atmos multiplexes, and VIP cinema lounges.',
      heroBanner:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=85',
      cardImage:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
      iconName: 'Film',
      introduction:
        'Where precision acoustic engineering meets Art-Deco luxury—creating unforgettable big-screen entertainment destinations.',
      detailedDescription:
        'We design and build multiplex auditoriums, VIP Gold-Class screening lounges, concession foyers, and private screening rooms with certified RT60 acoustic calibration, stadium seating geometry, and dramatic ambient illumination.',
      ourApproach: [
        { stepNumber: '01', title: 'Sightline & Stadium Tier Modeling', description: 'Ensuring unobstructed screen views from every single recliner.' },
        { stepNumber: '02', title: 'Dolby Atmos & THX Acoustic Design', description: 'Sound-isolation shells, bass traps, and fabric-wrapped acoustic wall panels.' },
        { stepNumber: '03', title: 'Foyer & Concession Experience', description: 'High-margin gourmet concession counters and glamorous VIP lounges.' },
        { stepNumber: '04', title: 'Turnkey Seating & Lighting Integration', description: 'Motorized leather recliners, aisle step-lighting, and acoustic doors.' },
      ],
      keyFeatures: [
        { title: 'Precision Acoustic Wall Systems', description: 'Zero sound bleed and crystal-clear surround sound immersion.' },
        { title: 'VIP Gold-Class Recliner Lounges', description: 'Motorized leather seating with swivel dining trays and butler call buttons.' },
        { title: 'Glamorous Box-Office & Concession Foyers', description: 'Dramatic marble, brass, and programmable LED ceiling geometry.' },
        { title: 'Fire-Retardant Certified Materials', description: '100% Class-A fire-rated carpets, fabrics, and acoustic insulation.' },
      ],
      designSolutions: [],
      benefits: [
        'Turnkey acoustic, HVAC, seating, and interior execution',
        'Designed to maximize F&B concession revenue and VIP ticket yields',
      ],
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85', caption: 'Luxury Cinema Auditorium', alt: 'Movie Theater Interior' },
      ],
      faqs: [],
      relatedProjects: [createdProjects[7]._id],
      displayOrder: 8,
      isFeatured: true,
    },
  ];

  await Service.insertMany(
    servicesSeed.map((s) => ({
      ...s,
      status: 'published',
      locale: 'en',
      seo: {
        metaTitle: `${s.title} | Vision Tech Solutions`,
        metaDescription: s.shortDescription,
        slug: s.slug,
        ogImage: s.heroBanner,
      },
      createdBy: superAdmin._id,
    }))
  );

  // 8. Seed Client Testimonials (matching reference image + additional)
  await Testimonial.insertMany([
    {
      customerName: 'Anita Sharma',
      designation: 'Homemaker | Villa',
      projectType: 'Villa Interior Design',
      location: 'Jubilee Hills, Hyderabad',
      photograph:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      reviewContent:
        'Vision Tech Solutions transformed our home into a dream space. Their attention to detail and professionalism is truly commendable.',
      rating: 5,
      displayOrder: 1,
      status: 'published',
      createdBy: superAdmin._id,
    },
    {
      customerName: 'Rohit Mehta',
      designation: 'Business Owner | Office',
      projectType: 'Office Interior Design',
      location: 'HITEC City, Hyderabad',
      photograph:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
      reviewContent:
        'The team delivered our office space on time with exceptional quality. Our employees love the new workspace!',
      rating: 5,
      displayOrder: 2,
      status: 'published',
      createdBy: superAdmin._id,
    },
    {
      customerName: 'Neha Kapoor',
      designation: 'Restaurant Owner',
      projectType: 'Restaurant Interior Design',
      location: 'Banjara Hills, Hyderabad',
      photograph:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      reviewContent:
        'From concept to completion, everything was seamless. The restaurant looks stunning and has received great feedback from our guests!',
      rating: 5,
      displayOrder: 3,
      status: 'published',
      createdBy: superAdmin._id,
    },
    {
      customerName: 'Dr. Arvind Hegde',
      designation: 'Medical Director | Hospital',
      projectType: 'Hospital Interior Design',
      location: 'Gachibowli, Hyderabad',
      photograph:
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      reviewContent:
        'Vision Tech Solutions created a calming, five-star healing environment for our patients while meeting every single clinical and NABH requirement.',
      rating: 5,
      displayOrder: 4,
      status: 'published',
      createdBy: superAdmin._id,
    },
  ]);

  // 9. Seed Media Assets & Gallery Albums
  const mediaSeed = [
    {
      title: 'Twilight Skyline Luxury Living Salon',
      caption: 'Full-height structural glazing overlooking the city skyline at dusk',
      altText: 'Vision Tech Solutions Luxury Living Room',
      category: 'Residential',
      publicId: 'seed/hero-living-room',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 420000,
      width: 1920,
      height: 1080,
      tags: ['hero', 'residential', 'living-room'],
    },
    {
      title: 'The Aurelia Villa Infinity Pool & Deck',
      caption: 'Mediterranean-inspired private villa with cantilevered pool terrace',
      altText: 'Luxury Villa Exterior and Pool',
      category: 'Villa',
      publicId: 'seed/villa-pool',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 380000,
      width: 1600,
      height: 1067,
      tags: ['villa', 'architecture'],
    },
    {
      title: 'Biophilic Executive Workspace',
      caption: 'Daylit collaborative corporate headquarters in HITEC City, Hyderabad',
      altText: 'Modern Office Interior Design',
      category: 'Office',
      publicId: 'seed/modern-office',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 350000,
      width: 1600,
      height: 1067,
      tags: ['office', 'commercial'],
    },
    {
      title: 'Saffron & Sage Fine Dining Salon',
      caption: 'Bespoke blown-glass chandeliers and velvet banquettes',
      altText: 'Fine Dining Restaurant Interior',
      category: 'Restaurant',
      publicId: 'seed/fine-dining',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 390000,
      width: 1600,
      height: 1067,
      tags: ['restaurant', 'hospitality'],
    },
    {
      title: 'Double-Height Architectural Lobby',
      caption: 'Grand marble spiral staircase and warm architectural cove lighting',
      altText: 'Luxury Lobby Architecture',
      category: 'Commercial',
      publicId: 'seed/lobby-architecture',
      url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 410000,
      width: 1600,
      height: 1067,
      tags: ['lobby', 'commercial'],
    },
    {
      title: 'Master Bedroom in Warm Beige & Walnut',
      caption: 'Custom upholstered headboard, brass pendant lamps, and oak parquet',
      altText: 'Luxury Master Suite',
      category: 'Apartment',
      publicId: 'seed/master-suite',
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
      secureUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
      resourceType: 'image' as const,
      format: 'jpg',
      bytes: 340000,
      width: 1600,
      height: 1067,
      tags: ['bedroom', 'apartment'],
    },
  ];

  await MediaAsset.insertMany(
    mediaSeed.map((m) => ({
      ...m,
      responsiveUrls: {
        sm: m.thumbnailUrl,
        md: m.secureUrl,
        lg: m.secureUrl,
        xl: m.secureUrl,
      },
      createdBy: superAdmin._id,
    }))
  );

  await GalleryAlbum.insertMany([
    {
      title: 'Signature Luxury Villas & Residences',
      slug: 'signature-luxury-villas-residences',
      description: 'Curated architectural photography from our private villas, duplex penthouses, and bespoke family residences.',
      category: 'Residential',
      coverImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      associatedProject: createdProjects[0]._id,
      displayOrder: 1,
      status: 'published',
      items: [
        {
          title: 'The Aurelia Double-Height Living Room',
          caption: 'Italian travertine walls and custom walnut ceiling coffers',
          altText: 'Luxury Villa Living Room',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Villa',
          aspectRatio: 'landscape',
          order: 1,
        },
        {
          title: 'Twilight Pool Pavilion',
          caption: 'Cantilevered architectural pergola overlooking the infinity pool',
          altText: 'Villa Pool Pavilion',
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Villa',
          aspectRatio: 'portrait',
          order: 2,
        },
        {
          title: 'Bespoke Master Bedroom Sanctuary',
          caption: 'Warm beige bouclé textures and ambient cove lighting',
          altText: 'Master Bedroom Suite',
          url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Apartment',
          aspectRatio: 'landscape',
          order: 3,
        },
        {
          title: 'Sculptural Quartzite Island Kitchen',
          caption: 'Handleless champagne lacquer cabinetry with integrated Gaggenau appliances',
          altText: 'Luxury Modular Kitchen',
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Residential',
          aspectRatio: 'square',
          order: 4,
        },
        {
          title: 'Skyline Lounge & Library',
          caption: 'Panoramic floor-to-ceiling windows framing the twilight cityscape',
          altText: 'Skyline Living Room',
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Residential',
          aspectRatio: 'landscape',
          order: 5,
        },
      ],
    },
    {
      title: 'Commercial, Hospitality & Healthcare Landmarks',
      slug: 'commercial-hospitality-healthcare-landmarks',
      description: 'Executive headquarters, fine-dining destinations, wellness hospitals, retail malls, and luxury cinemas.',
      category: 'Commercial',
      coverImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
      associatedProject: createdProjects[1]._id,
      displayOrder: 2,
      status: 'published',
      items: [
        {
          title: 'Nexus Global Tech Headquarters',
          caption: 'Biophilic open workspace with acoustic timber slats',
          altText: 'Modern Office Interior',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Office',
          aspectRatio: 'landscape',
          order: 1,
        },
        {
          title: 'Saffron & Sage Fine Dining',
          caption: 'Warm terracotta plaster and hand-blown amber glass chandeliers',
          altText: 'Fine Dining Restaurant',
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Restaurant',
          aspectRatio: 'portrait',
          order: 2,
        },
        {
          title: 'Asteria Wellness Hospital Atrium',
          caption: 'Daylit healing architecture with hospitality-grade concierge lounge',
          altText: 'Hospital Interior Atrium',
          url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Hospital',
          aspectRatio: 'landscape',
          order: 3,
        },
        {
          title: 'The Grand Galleria Retail Concourse',
          caption: 'Multi-level luxury shopping atrium with panoramic skylight',
          altText: 'Shopping Mall Interior',
          url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Shopping Mall',
          aspectRatio: 'square',
          order: 4,
        },
        {
          title: 'Lumiere Gold Class Cinema Lounge',
          caption: 'THX-certified acoustic luxury auditorium with Italian leather recliners',
          altText: 'Movie Theater Interior',
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85',
          thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
          resourceType: 'image',
          category: 'Movie Theater',
          aspectRatio: 'landscape',
          order: 5,
        },
      ],
    },
  ]);

  // 10. Seed Blog Categories & Blog Articles
  await BlogCategory.insertMany([
    { name: 'Luxury Residential', slug: 'luxury-residential', description: 'Insights on bespoke homes, villas, and penthouses' },
    { name: 'Commercial Architecture', slug: 'commercial-architecture', description: 'Future-ready workspaces, hospitality, and retail design' },
    { name: 'Materials & Craftsmanship', slug: 'materials-craftsmanship', description: 'Guides to natural stone, lighting, and artisanal millwork' },
  ]);

  await BlogPost.insertMany([
    {
      title: 'The Quiet Luxury Movement: Why Warm Minimalism Is Redefining Indian Villas in 2026',
      slug: 'quiet-luxury-warm-minimalism-indian-villas-2026',
      excerpt:
        'Discover how tactile travertine, unlacquered brass, and biophilic courtyards are replacing ostentatious ornament in modern luxury residences.',
      content: `
        <p>True architectural luxury whispers rather than shouts. Across Bangalore, Hyderabad, and Mumbai, discerning homeowners are embracing <strong>Quiet Luxury</strong>—an aesthetic philosophy rooted in honest materials, generous spatial proportions, and effortless indoor-outdoor harmony.</p>
        <h3>1. Tactile Honesty Over High-Gloss Finishes</h3>
        <p>Instead of mirror-polished synthetics, our studio is specifying honed Italian travertine, sandblasted Kota stone, open-pore American walnut veneers, and hand-troweled lime plaster walls that age with grace.</p>
        <h3>2. Architectural Lighting as Sculpture</h3>
        <p>By layering 2700K concealed linear cove lighting with glare-free pinhole spots and artisanal blown-glass pendants, a living room transforms seamlessly from a vibrant daytime family hub to an intimate twilight sanctuary.</p>
        <h3>3. Seamless Turnkey Execution</h3>
        <p>Achieving minimalist detailing—such as shadow-gap skirting and flush concealed doors—requires millimeter-level coordination between civil contractors, MEP engineers, and factory joinery teams.</p>
      `,
      featuredImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      category: 'Luxury Residential',
      tags: ['Villa Design', 'Quiet Luxury', 'Interior Trends 2026'],
      authorName: 'Ar. Vikramaditya Rao',
      authorRole: 'Founder & Principal Architect',
      readTimeMinutes: 5,
      status: 'published',
      publishedAt: new Date('2026-10-12'),
      seo: {
        metaTitle: 'Quiet Luxury & Warm Minimalism in Villa Interior Design | Vision Tech Solutions',
        metaDescription: 'Explore how tactile stone, warm timber, and architectural lighting define modern luxury villas.',
        slug: 'quiet-luxury-warm-minimalism-indian-villas-2026',
      },
      createdBy: superAdmin._id,
    },
    {
      title: 'Designing High-Performance Workspaces: The Hospitality-Driven Office Revolution',
      slug: 'designing-high-performance-hospitality-driven-workspaces',
      excerpt:
        'How forward-thinking enterprises are blending boutique hotel comfort with acoustic precision to draw teams back to the office.',
      content: `
        <p>The modern corporate headquarters is no longer a sea of uniform desks—it is a cultural magnet. At Vision Tech Solutions, we call this the <strong>Work-Resort Paradigm</strong>.</p>
        <h3>Acoustic Privacy Meets Collaborative Energy</h3>
        <p>By zoning floor plates into high-energy barista lounges and STC-45 rated focus pods, employees can choose the exact acoustic environment their task demands.</p>
        <h3>Biophilia & Circadian Wellness</h3>
        <p>Integrating natural daylight harvesting, indoor botanical courts, and ergonomic sit-stand desks reduces fatigue and increases creative output by over 28%.</p>
      `,
      featuredImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
      category: 'Commercial Architecture',
      tags: ['Office Interior', 'Workplace Strategy', 'Biophilic Design'],
      authorName: 'Kabir Malhotra',
      authorRole: 'Senior Turnkey Project Director',
      readTimeMinutes: 6,
      status: 'published',
      publishedAt: new Date('2026-10-18'),
      seo: {
        metaTitle: 'Hospitality-Driven Office Interior Design | Vision Tech Solutions',
        metaDescription: 'How enterprise offices use acoustic pods, biophilia, and hospitality design to boost productivity.',
        slug: 'designing-high-performance-hospitality-driven-workspaces',
      },
      createdBy: superAdmin._id,
    },
    {
      title: 'A Curated Guide to Italian Marble vs. Engineered Quartzite in Luxury Homes',
      slug: 'italian-marble-vs-engineered-quartzite-luxury-homes',
      excerpt:
        'Understanding porosity, bookmatched veining, and culinary durability when selecting stone for living salons and island kitchens.',
      content: `
        <p>Selecting the right stone surface is one of the most consequential investments in a luxury interior project. While Statuario and Botticino marble offer unmatched organic depth for formal living floors, high-traffic culinary islands benefit from zero-porosity natural quartzite and sintered stone.</p>
        <h3>Where to Use Natural Italian Marble</h3>
        <p>Formal foyers, double-height feature walls, and powder room vanities shine with bookmatched natural marble sealed with penetrating nano-coatings.</p>
      `,
      featuredImage:
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85',
      category: 'Materials & Craftsmanship',
      tags: ['Italian Marble', 'Kitchen Design', 'Luxury Materials'],
      authorName: 'Ananya Deshmukh',
      authorRole: 'Editorial & Brand Strategist',
      readTimeMinutes: 4,
      status: 'published',
      publishedAt: new Date('2026-10-24'),
      seo: {
        metaTitle: 'Italian Marble vs Quartzite Guide | Vision Tech Solutions',
        metaDescription: 'Expert guide to choosing natural stone and quartz surfaces for luxury residential interiors.',
        slug: 'italian-marble-vs-engineered-quartzite-luxury-homes',
      },
      createdBy: superAdmin._id,
    },
  ]);

  // 11. Seed FAQs
  await Faq.insertMany([
    {
      question: 'Does Vision Tech Solutions provide complete turnkey interior design and contracting?',
      answer:
        'Yes. We handle everything from architectural spatial planning, 3D visualization, civil modifications, MEP/HVAC engineering, custom factory joinery, lighting, and final styling under a single turnkey contract.',
      category: 'General',
      displayOrder: 1,
      status: 'published',
    },
    {
      question: 'How do you ensure on-time project delivery without cost overruns?',
      answer:
        'Before execution begins, we lock in every 3D drawing, material specification, and itemized BOQ. Our automated factory manufactures modular woodwork in parallel with on-site civil work, backed by weekly milestone tracking.',
      category: 'Process & Pricing',
      displayOrder: 2,
      status: 'published',
    },
    {
      question: 'What types of commercial interior projects do you undertake?',
      answer:
        'Our commercial contracting division delivers corporate offices, IT parks, fine-dining restaurants, NABH-compliant hospitals, shopping malls, and acoustic movie theater multiplexes.',
      category: 'Commercial',
      displayOrder: 3,
      status: 'published',
    },
    {
      question: 'Is the initial design consultation really free?',
      answer:
        'Absolutely. Your first consultation with our senior architect—including floor-plan review, style discovery, and preliminary budget estimation—is 100% complimentary with no obligation.',
      category: 'Consultation',
      displayOrder: 4,
      status: 'published',
    },
  ]);

  // 12. Seed Sample Enquiries for Admin Lead Management
  await Enquiry.insertMany([
    {
      name: 'Vikram Singhania',
      email: 'vikram.singhania@example.com',
      phone: '+91 98450 11223',
      location: 'Jubilee Hills, Hyderabad',
      serviceInterestedIn: 'Villa Interior Design',
      budgetRange: '₹75 Lakhs – ₹1.5 Crore',
      projectDetails: 'Looking for complete turnkey interior design and home automation for our 6,500 sq. ft. triplex villa in Jubilee Hills.',
      sourcePage: 'Home Page',
      status: 'New',
      assignedToName: 'Ar. Vikramaditya Rao',
      internalNotes: [
        {
          note: 'High-priority luxury villa inquiry. Floor plans requested via WhatsApp.',
          addedBy: 'Ar. Vikramaditya Rao',
          addedAt: new Date(),
        },
      ],
    },
    {
      name: 'Priya & Karthik Iyer',
      email: 'priya.iyer@example.com',
      phone: '+91 99001 44556',
      location: 'Banjara Hills, Hyderabad',
      serviceInterestedIn: 'Apartment Interior Design',
      budgetRange: '₹30 Lakhs – ₹50 Lakhs',
      projectDetails: 'Possession of our 3.5 BHK apartment is next month. Interested in warm minimalist European interiors.',
      sourcePage: 'Services Page',
      status: 'In Discussion',
      assignedToName: 'Kabir Malhotra',
      internalNotes: [
        {
          note: 'Initial studio presentation completed. Preparing 3D moodboard.',
          addedBy: 'Kabir Malhotra',
          addedAt: new Date(),
        },
      ],
    },
    {
      name: 'Raghavendra Rao – Horizon Tech',
      email: 'raghav@horizontech.io',
      phone: '+91 98802 77889',
      location: 'HITEC City, Hyderabad',
      serviceInterestedIn: 'Office Interior Design',
      budgetRange: '₹1.5 Crore+',
      projectDetails: 'Need turnkey bare-shell to plug-and-play office interior for 18,000 sq. ft. R&D center.',
      sourcePage: 'Contact Page',
      status: 'Contacted',
      assignedToName: 'Kabir Malhotra',
      internalNotes: [],
    },
  ]);

  // 13. Seed Home Page & Dynamic Page Sections matching the exact attached layout
  const homeSectionsSeed = [
    {
      pageSlug: 'home',
      sectionKey: 'hero',
      blockType: 'hero' as const,
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
        highlightWords: 'Living & Working',
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
          },
          {
            number: '02',
            eyebrow: 'BESPOKE LUXURY RESIDENCES & VILLAS',
            titleLine1: 'Timeless Spaces',
            titleLine2: 'Crafted For',
            titleHighlight: 'Modern Elegance',
            subtitle:
              'Every home we architect blends Italian stone, bespoke millwork, and warm architectural lighting to create a sanctuary tailored exclusively around your family.',
            image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
          },
          {
            number: '03',
            eyebrow: 'TURNKEY COMMERCIAL & HOSPITALITY',
            titleLine1: 'High-Impact',
            titleLine2: 'Environments For',
            titleHighlight: 'Leading Brands',
            subtitle:
              'From Fortune-500 offices and fine-dining restaurants to NABH hospitals and luxury multiplexes, our turnkey contracting team delivers on time with zero compromise.',
            image:
              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85',
          },
        ],
      },
    },
    {
      pageSlug: 'home',
      sectionKey: 'services-overview',
      blockType: 'services-overview' as const,
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
      pageSlug: 'home',
      sectionKey: 'value-pillars',
      blockType: 'value-pillars' as const,
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
      pageSlug: 'home',
      sectionKey: 'why-choose-us',
      blockType: 'why-choose-us' as const,
      eyebrow: 'WHY CHOOSE US',
      title: 'Your Vision, Our Expertise',
      subtitle:
        'With years of experience and a passion for design, we turn ordinary spaces into extraordinary experiences. Our team of designers, architects and project managers work closely with you at every step.',
      mediaUrl:
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
      pageSlug: 'home',
      sectionKey: 'tailored-solutions',
      blockType: 'tailored-solutions' as const,
      eyebrow: 'OUR SERVICES',
      title: 'Tailored Solutions for Every Space',
      subtitle: 'Explore our specialized residential and commercial interior architecture capabilities.',
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
      pageSlug: 'home',
      sectionKey: 'featured-projects',
      blockType: 'featured-projects' as const,
      eyebrow: 'FEATURED PROJECTS',
      title: 'Our Latest Work',
      ctaPrimaryText: 'View All Projects',
      ctaPrimaryLink: '/projects',
      order: 6,
      isEnabled: true,
      data: {},
    },
    {
      pageSlug: 'home',
      sectionKey: 'our-process',
      blockType: 'our-process' as const,
      eyebrow: 'OUR DESIGN PROCESS',
      title: 'From Concept Sketch to Turnkey Handover',
      subtitle: 'A transparent, milestone-driven methodology engineered for peace of mind.',
      order: 7,
      isEnabled: true,
      data: {
        steps: [
          {
            step: '01',
            title: 'Discovery & Spatial Audit',
            description: 'We meet to understand your lifestyle or brand goals, evaluate site dimensions, and establish a clear budget framework.',
          },
          {
            step: '02',
            title: '3D Architecture & Material Curation',
            description: 'Experience photorealistic 3D renders and touch curated stone, timber, and fabric samples in our design lounge.',
          },
          {
            step: '03',
            title: 'Precision Factory & Site Execution',
            description: 'Our engineers manage civil, MEP, acoustic, and custom factory joinery with weekly quality checkpoints.',
          },
          {
            step: '04',
            title: 'Styling & On-Time Handover',
            description: 'Final lighting calibration, soft-furnishing styling, deep cleaning, and key handover with comprehensive warranty.',
          },
        ],
      },
    },
    {
      pageSlug: 'home',
      sectionKey: 'testimonials',
      blockType: 'testimonials' as const,
      eyebrow: 'TESTIMONIALS',
      title: 'What Our Clients Say',
      subtitle:
        "Real stories. Real people. Real satisfaction. Here's what our clients have to say about working with Vision Tech Solutions.",
      order: 8,
      isEnabled: true,
      data: {},
    },
    {
      pageSlug: 'home',
      sectionKey: 'trusted-brands',
      blockType: 'trusted-brands' as const,
      eyebrow: 'CLIENTELE & PARTNERSHIPS',
      title: 'Trusted by Leading Brands',
      subtitle:
        'We are proud to have worked with some of the most respected brands across industries.',
      order: 9,
      isEnabled: true,
      data: {
        brands: [
          { name: 'TATA', subtitle: 'TATA GROUP' },
          { name: 'Infosys', subtitle: 'INFOSYS' },
          { name: 'HDFC BANK', subtitle: 'HDFC BANK' },
          { name: 'Marriott', subtitle: 'MARRIOTT INTERNATIONAL' },
          { name: 'SAMSUNG', subtitle: 'SAMSUNG' },
          { name: 'Reliance', subtitle: 'Industries Limited' },
          { name: 'WIPRO', subtitle: 'WIPRO' },
          { name: 'Apollo', subtitle: 'HOSPITALS' },
          { name: 'KFC', subtitle: 'KFC RESTAURANTS' },
          { name: 'DECATHLON', subtitle: 'DECATHLON' },
        ],
      },
    },
    {
      pageSlug: 'home',
      sectionKey: 'consultation-cta',
      blockType: 'consultation-cta' as const,
      eyebrow: 'READY TO GET STARTED?',
      title: "Let's Build Something Beautiful Together",
      subtitle:
        'Book a free consultation with our design experts and take the first step towards your dream space.',
      mediaUrl:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      ctaPrimaryText: 'Request Consultation',
      order: 10,
      isEnabled: true,
      data: {
        promises: [
          { icon: 'MessagesSquare', label: 'Free Consultation' },
          { icon: 'Award', label: 'Expert Guidance' },
          { icon: 'Sliders', label: 'Customized Solutions' },
          { icon: 'ShieldCheck', label: 'No Obligation' },
        ],
      },
    },
  ];

  const createdHomeSections = await PageSection.insertMany(
    homeSectionsSeed.map((s) => ({
      ...s,
      locale: 'en',
      updatedBy: superAdmin._id,
    }))
  );

  // Create System & Additional Pages
  await Page.insertMany([
    {
      title: 'Home',
      slug: 'home',
      description:
        'Vision Tech Solutions – End-to-End Luxury Interior Design & Turnkey Contracting Studio.',
      bannerImage:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
      sections: createdHomeSections.map((s) => s._id),
      status: 'published',
      locale: 'en',
      isSystemPage: true,
      seo: {
        metaTitle: 'Vision Tech Solutions | Good Design Creates Better Living & Working',
        metaDescription:
          'At Vision Tech Solutions, we design inspiring residential, villa, apartment, and commercial spaces with creativity, precision, and excellence.',
        slug: 'home',
      },
      createdBy: superAdmin._id,
    },
    {
      title: 'About Us',
      slug: 'about',
      description:
        'Discover the story, architectural philosophy, leadership team, and turnkey engineering excellence behind Vision Tech Solutions.',
      bannerImage:
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=85',
      bannerSubtitle: 'DESIGN • BUILD • TRANSFORM',
      sections: [],
      status: 'published',
      locale: 'en',
      isSystemPage: true,
      seo: {
        metaTitle: 'About Us | Vision Tech Solutions – Luxury Interior Architecture',
        metaDescription:
          'Learn about our story, vision, mission, design philosophy, and team of 65+ architects, interior designers, and project engineers.',
        slug: 'about',
      },
      createdBy: superAdmin._id,
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      description:
        'How Vision Tech Solutions collects, safeguards, and processes client consultation and project information.',
      bannerImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      sections: [],
      status: 'published',
      locale: 'en',
      isSystemPage: true,
      seo: {
        metaTitle: 'Privacy Policy | Vision Tech Solutions',
        metaDescription: 'Privacy Policy and data protection practices at Vision Tech Solutions.',
        slug: 'privacy-policy',
      },
      createdBy: superAdmin._id,
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      description:
        'Terms of service, design consultation guidelines, and intellectual property policies of Vision Tech Solutions.',
      bannerImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      sections: [],
      status: 'published',
      locale: 'en',
      isSystemPage: true,
      seo: {
        metaTitle: 'Terms & Conditions | Vision Tech Solutions',
        metaDescription: 'Terms and conditions governing website usage and design consultations.',
        slug: 'terms-and-conditions',
      },
      createdBy: superAdmin._id,
    },
  ]);

  await ActivityLog.create({
    userId: superAdmin._id,
    userName: superAdmin.name,
    userRole: superAdmin.roleName,
    action: 'Initialized Vision Tech Solutions CMS & Portfolio Database',
    module: 'System',
    details: 'Seeded 8 services, 8 portfolio projects, homepage sections, RBAC roles, and global settings.',
  });

  logger.info('Vision Tech Solutions database seeding completed successfully.');
}
