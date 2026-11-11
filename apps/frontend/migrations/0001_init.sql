CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  permissions TEXT NOT NULL DEFAULT '[]',
  isSystem INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  role TEXT NOT NULL,
  roleName TEXT NOT NULL,
  customPermissions TEXT NOT NULL DEFAULT '[]',
  isActive INTEGER NOT NULL DEFAULT 1,
  failedLoginAttempts INTEGER NOT NULL DEFAULT 0,
  lockUntil TEXT,
  resetPasswordToken TEXT,
  resetPasswordExpires TEXT,
  lastLoginAt TEXT,
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT DEFAULT '',
  altText TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  publicId TEXT NOT NULL,
  url TEXT NOT NULL,
  secureUrl TEXT NOT NULL,
  thumbnailUrl TEXT NOT NULL,
  responsiveUrls TEXT NOT NULL DEFAULT '{}',
  resourceType TEXT NOT NULL DEFAULT 'image',
  format TEXT DEFAULT 'jpg',
  bytes INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  tags TEXT NOT NULL DEFAULT '[]',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  bannerImage TEXT DEFAULT '',
  bannerSubtitle TEXT DEFAULT '',
  sections TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published',
  scheduledPublishAt TEXT,
  publishedAt TEXT,
  locale TEXT DEFAULT 'en',
  translations TEXT NOT NULL DEFAULT '{}',
  seo TEXT NOT NULL DEFAULT '{}',
  isSystemPage INTEGER NOT NULL DEFAULT 0,
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT PRIMARY KEY,
  pageSlug TEXT NOT NULL,
  sectionKey TEXT NOT NULL,
  blockType TEXT NOT NULL,
  title TEXT NOT NULL,
  eyebrow TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  content TEXT DEFAULT '',
  mediaUrl TEXT DEFAULT '',
  videoUrl TEXT DEFAULT '',
  ctaPrimaryText TEXT DEFAULT '',
  ctaPrimaryLink TEXT DEFAULT '',
  ctaSecondaryText TEXT DEFAULT '',
  ctaSecondaryLink TEXT DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  isEnabled INTEGER NOT NULL DEFAULT 1,
  data TEXT NOT NULL DEFAULT '{}',
  locale TEXT DEFAULT 'en',
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoryType TEXT DEFAULT 'Residential',
  shortDescription TEXT NOT NULL,
  heroBanner TEXT NOT NULL,
  cardImage TEXT NOT NULL,
  iconName TEXT DEFAULT 'Home',
  introduction TEXT DEFAULT '',
  detailedDescription TEXT DEFAULT '',
  ourApproach TEXT NOT NULL DEFAULT '[]',
  keyFeatures TEXT NOT NULL DEFAULT '[]',
  designSolutions TEXT NOT NULL DEFAULT '[]',
  benefits TEXT NOT NULL DEFAULT '[]',
  galleryImages TEXT NOT NULL DEFAULT '[]',
  faqs TEXT NOT NULL DEFAULT '[]',
  relatedProjects TEXT NOT NULL DEFAULT '[]',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  isFeatured INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published',
  locale TEXT DEFAULT 'en',
  seo TEXT NOT NULL DEFAULT '{}',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  projectType TEXT DEFAULT 'Residential',
  location TEXT NOT NULL,
  completionDate TEXT NOT NULL,
  clientName TEXT DEFAULT '',
  projectSize TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  shortSummary TEXT DEFAULT '',
  description TEXT NOT NULL,
  designConcept TEXT DEFAULT '',
  challenges TEXT DEFAULT '',
  solutions TEXT DEFAULT '',
  coverImage TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  beforeAfterImages TEXT NOT NULL DEFAULT '[]',
  videos TEXT NOT NULL DEFAULT '[]',
  isFeatured INTEGER NOT NULL DEFAULT 0,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  locale TEXT DEFAULT 'en',
  seo TEXT NOT NULL DEFAULT '{}',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery_albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  coverImage TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]',
  associatedProject TEXT,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  designation TEXT DEFAULT '',
  projectType TEXT DEFAULT '',
  location TEXT DEFAULT '',
  photograph TEXT DEFAULT '',
  reviewContent TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featuredImage TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  authorName TEXT DEFAULT 'Ar. Vikramaditya Rao',
  authorRole TEXT DEFAULT 'Principal Architect & Design Director',
  authorAvatar TEXT DEFAULT '',
  readTimeMinutes INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'published',
  scheduledPublishAt TEXT,
  publishedAt TEXT,
  relatedPosts TEXT NOT NULL DEFAULT '[]',
  locale TEXT DEFAULT 'en',
  seo TEXT NOT NULL DEFAULT '{}',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT NOT NULL,
  location TEXT DEFAULT '',
  serviceInterestedIn TEXT NOT NULL,
  budgetRange TEXT DEFAULT 'Not Specified',
  projectDetails TEXT DEFAULT '',
  sourcePage TEXT DEFAULT 'Home Page',
  status TEXT NOT NULL DEFAULT 'New',
  assignedTo TEXT,
  assignedToName TEXT DEFAULT '',
  internalNotes TEXT NOT NULL DEFAULT '[]',
  ipHash TEXT,
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS website_settings (
  id TEXT PRIMARY KEY,
  companyName TEXT DEFAULT 'Vision Tech Solutions',
  tagline TEXT DEFAULT 'DESIGN • BUILD • TRANSFORM',
  logoUrl TEXT DEFAULT '',
  faviconUrl TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phonePrimary TEXT DEFAULT '',
  phoneSecondary TEXT DEFAULT '',
  emailPrimary TEXT DEFAULT '',
  emailSupport TEXT DEFAULT '',
  whatsappNumber TEXT DEFAULT '',
  businessHours TEXT DEFAULT '',
  googleMapsEmbedUrl TEXT DEFAULT '',
  googleMapsDirectionsUrl TEXT DEFAULT '',
  socialLinks TEXT NOT NULL DEFAULT '{}',
  announcementBar TEXT NOT NULL DEFAULT '{}',
  footerAboutText TEXT DEFAULT '',
  copyrightText TEXT DEFAULT '',
  defaultSeo TEXT NOT NULL DEFAULT '{}',
  notificationEmails TEXT NOT NULL DEFAULT '[]',
  supportedLanguages TEXT NOT NULL DEFAULT '[]',
  defaultLanguage TEXT DEFAULT 'en',
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS navigation_menus (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]',
  locale TEXT DEFAULT 'en',
  updatedBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  locale TEXT DEFAULT 'en',
  isDeleted INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  userName TEXT NOT NULL,
  userRole TEXT DEFAULT 'Admin',
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entityId TEXT,
  entityTitle TEXT,
  details TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_slug ON page_sections(pageSlug, "order");
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_slug ON gallery_albums(slug);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
