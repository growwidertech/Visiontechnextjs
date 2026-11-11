import mongoose, { Schema, Document } from 'mongoose';
import {
  RoleName,
  PermissionKey,
  PublicationStatus,
  ProjectCategory,
  EnquiryStatus,
  SeoMetadata,
  SupportedLocale,
} from '@vision/shared';

const SeoSchema = new Schema<SeoMetadata>(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    slug: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    noIndex: { type: Boolean, default: false },
    keywords: [{ type: String }],
  },
  { _id: false }
);

// 1. Permission Model (collection: permissions)
export interface IPermission extends Document {
  key: PermissionKey;
  name: string;
  module: string;
  description: string;
}

const PermissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    module: { type: String, required: true, index: true },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'permissions' }
);

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);

// 2. Role Model (collection: roles)
export interface IRole extends Document {
  name: RoleName;
  slug: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'roles' }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);

// 3. User Model (collection: users)
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  designation?: string;
  role: mongoose.Types.ObjectId;
  roleName: RoleName;
  customPermissions?: PermissionKey[];
  isActive: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    designation: { type: String, default: '' },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    roleName: { type: String, required: true, index: true },
    customPermissions: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastLoginAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.model<IUser>('User', UserSchema);

// 4. MediaAsset Model (collection: mediaAssets)
export interface IMediaAsset extends Document {
  title: string;
  caption: string;
  altText: string;
  category: string;
  publicId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl: string;
  responsiveUrls: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  resourceType: 'image' | 'video';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  tags: string[];
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    title: { type: String, required: true, trim: true, index: true },
    caption: { type: String, default: '' },
    altText: { type: String, default: '' },
    category: { type: String, default: 'General', index: true },
    publicId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    responsiveUrls: {
      sm: { type: String, default: '' },
      md: { type: String, default: '' },
      lg: { type: String, default: '' },
      xl: { type: String, default: '' },
    },
    resourceType: { type: String, enum: ['image', 'video'], default: 'image', index: true },
    format: { type: String, default: 'jpg' },
    bytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    tags: [{ type: String, index: true }],
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'mediaAssets' }
);

export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);

// 5. PageSection Model (collection: pageSections)
export type SectionBlockType =
  | 'hero'
  | 'services-overview'
  | 'value-pillars'
  | 'why-choose-us'
  | 'tailored-solutions'
  | 'featured-projects'
  | 'testimonials'
  | 'trusted-brands'
  | 'consultation-cta'
  | 'our-process'
  | 'architectural-showcase'
  | 'gallery-showcase'
  | 'stats'
  | 'text'
  | 'image-text-split'
  | 'full-width-image'
  | 'video'
  | 'faq'
  | 'cta';

export interface IPageSection extends Document {
  pageSlug: string;
  sectionKey: string;
  blockType: SectionBlockType;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  content?: string;
  mediaUrl?: string;
  videoUrl?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  order: number;
  isEnabled: boolean;
  data: Record<string, any>;
  locale: SupportedLocale;
  updatedBy?: mongoose.Types.ObjectId;
}

const PageSectionSchema = new Schema<IPageSection>(
  {
    pageSlug: { type: String, required: true, index: true },
    sectionKey: { type: String, required: true, index: true },
    blockType: { type: String, required: true },
    title: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    content: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    ctaPrimaryText: { type: String, default: '' },
    ctaPrimaryLink: { type: String, default: '' },
    ctaSecondaryText: { type: String, default: '' },
    ctaSecondaryLink: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    isEnabled: { type: Boolean, default: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    locale: { type: String, default: 'en', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'pageSections' }
);

export const PageSection = mongoose.model<IPageSection>('PageSection', PageSectionSchema);

// 6. Page Model (collection: pages)
export interface IPage extends Document {
  title: string;
  slug: string;
  description: string;
  bannerImage?: string;
  bannerSubtitle?: string;
  sections: mongoose.Types.ObjectId[];
  status: PublicationStatus;
  scheduledPublishAt?: Date;
  publishedAt?: Date;
  locale: SupportedLocale;
  translations?: Record<string, { title?: string; description?: string; seo?: SeoMetadata }>;
  seo: SeoMetadata;
  isSystemPage: boolean;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    bannerSubtitle: { type: String, default: '' },
    sections: [{ type: Schema.Types.ObjectId, ref: 'PageSection' }],
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    scheduledPublishAt: { type: Date },
    publishedAt: { type: Date, default: Date.now },
    locale: { type: String, default: 'en', index: true },
    translations: { type: Schema.Types.Mixed, default: {} },
    seo: { type: SeoSchema, default: () => ({}) },
    isSystemPage: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'pages' }
);

export const Page = mongoose.model<IPage>('Page', PageSchema);

// 7. Service Model (collection: services)
export interface IService extends Document {
  title: string;
  slug: string;
  categoryType: 'Residential' | 'Commercial';
  shortDescription: string;
  heroBanner: string;
  cardImage: string;
  iconName: string;
  introduction: string;
  detailedDescription: string;
  ourApproach: { title: string; description: string; stepNumber: string }[];
  keyFeatures: { title: string; description: string; icon?: string }[];
  designSolutions: { title: string; description: string; image?: string }[];
  benefits: string[];
  galleryImages: { url: string; caption: string; alt: string }[];
  faqs: { question: string; answer: string }[];
  relatedProjects: mongoose.Types.ObjectId[];
  displayOrder: number;
  isFeatured: boolean;
  status: PublicationStatus;
  locale: SupportedLocale;
  seo: SeoMetadata;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    categoryType: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential', index: true },
    shortDescription: { type: String, required: true },
    heroBanner: { type: String, required: true },
    cardImage: { type: String, required: true },
    iconName: { type: String, default: 'Home' },
    introduction: { type: String, default: '' },
    detailedDescription: { type: String, default: '' },
    ourApproach: [
      {
        stepNumber: { type: String },
        title: { type: String },
        description: { type: String },
      },
    ],
    keyFeatures: [
      {
        title: { type: String },
        description: { type: String },
        icon: { type: String },
      },
    ],
    designSolutions: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
      },
    ],
    benefits: [{ type: String }],
    galleryImages: [
      {
        url: { type: String },
        caption: { type: String },
        alt: { type: String },
      },
    ],
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    relatedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    displayOrder: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    locale: { type: String, default: 'en', index: true },
    seo: { type: SeoSchema, default: () => ({}) },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'services' }
);

export const Service = mongoose.model<IService>('Service', ServiceSchema);

// 8. ProjectImage Model (collection: projectImages)
export interface IProjectImage extends Document {
  project: mongoose.Types.ObjectId;
  mediaAsset?: mongoose.Types.ObjectId;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  order: number;
  isBeforeAfter?: boolean;
  beforeUrl?: string;
}

const ProjectImageSchema = new Schema<IProjectImage>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    mediaAsset: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    altText: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    isBeforeAfter: { type: Boolean, default: false },
    beforeUrl: { type: String, default: '' },
  },
  { timestamps: true, collection: 'projectImages' }
);

export const ProjectImage = mongoose.model<IProjectImage>('ProjectImage', ProjectImageSchema);

// 9. Project Model (collection: projects)
export interface IProject extends Document {
  title: string;
  slug: string;
  category: ProjectCategory;
  projectType: 'Residential' | 'Commercial';
  location: string;
  completionDate: string;
  clientName?: string;
  projectSize?: string;
  duration?: string;
  shortSummary: string;
  description: string;
  designConcept: string;
  challenges: string;
  solutions: string;
  coverImage: string;
  images: {
    url: string;
    thumbnailUrl?: string;
    caption: string;
    altText?: string;
    order: number;
  }[];
  beforeAfterImages: {
    title: string;
    beforeUrl: string;
    afterUrl: string;
    caption: string;
  }[];
  videos: {
    title: string;
    url: string;
    thumbnailUrl?: string;
    isExternal?: boolean;
  }[];
  isFeatured: boolean;
  displayOrder: number;
  status: PublicationStatus;
  locale: SupportedLocale;
  seo: SeoMetadata;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    projectType: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential', index: true },
    location: { type: String, required: true, index: true },
    completionDate: { type: String, required: true },
    clientName: { type: String, default: '' },
    projectSize: { type: String, default: '' },
    duration: { type: String, default: '' },
    shortSummary: { type: String, default: '' },
    description: { type: String, required: true },
    designConcept: { type: String, default: '' },
    challenges: { type: String, default: '' },
    solutions: { type: String, default: '' },
    coverImage: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        caption: { type: String, default: '' },
        altText: { type: String, default: '' },
        order: { type: Number, default: 0 },
      },
    ],
    beforeAfterImages: [
      {
        title: { type: String },
        beforeUrl: { type: String },
        afterUrl: { type: String },
        caption: { type: String },
      },
    ],
    videos: [
      {
        title: { type: String },
        url: { type: String },
        thumbnailUrl: { type: String },
        isExternal: { type: Boolean, default: false },
      },
    ],
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    locale: { type: String, default: 'en', index: true },
    seo: { type: SeoSchema, default: () => ({}) },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'projects' }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

// 10. GalleryAlbum Model (collection: galleryAlbums)
export interface IGalleryAlbum extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string;
  items: {
    mediaAsset?: mongoose.Types.ObjectId;
    title: string;
    caption: string;
    altText: string;
    url: string;
    thumbnailUrl: string;
    resourceType: 'image' | 'video';
    category: string;
    aspectRatio?: 'portrait' | 'landscape' | 'square';
    order: number;
  }[];
  associatedProject?: mongoose.Types.ObjectId;
  displayOrder: number;
  status: PublicationStatus;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const GalleryAlbumSchema = new Schema<IGalleryAlbum>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    coverImage: { type: String, required: true },
    items: [
      {
        mediaAsset: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
        title: { type: String, default: '' },
        caption: { type: String, default: '' },
        altText: { type: String, default: '' },
        url: { type: String, required: true },
        thumbnailUrl: { type: String, default: '' },
        resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
        category: { type: String, default: 'Residential' },
        aspectRatio: { type: String, enum: ['portrait', 'landscape', 'square'], default: 'landscape' },
        order: { type: Number, default: 0 },
      },
    ],
    associatedProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    displayOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'galleryAlbums' }
);

export const GalleryAlbum = mongoose.model<IGalleryAlbum>('GalleryAlbum', GalleryAlbumSchema);

// 11. Testimonial Model (collection: testimonials)
export interface ITestimonial extends Document {
  customerName: string;
  designation: string;
  projectType?: string;
  location?: string;
  photograph?: string;
  reviewContent: string;
  rating: number;
  displayOrder: number;
  status: PublicationStatus;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true, trim: true },
    designation: { type: String, default: '' },
    projectType: { type: String, default: '' },
    location: { type: String, default: '' },
    photograph: { type: String, default: '' },
    reviewContent: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    displayOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'testimonials' }
);

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

// 12. BlogCategory Model (collection: blogCategories)
export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description: string;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'blogCategories' }
);

export const BlogCategory = mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);

// 13. BlogPost Model (collection: blogPosts)
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  readTimeMinutes: number;
  status: PublicationStatus;
  scheduledPublishAt?: Date;
  publishedAt?: Date;
  relatedPosts: mongoose.Types.ObjectId[];
  locale: SupportedLocale;
  seo: SeoMetadata;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    authorName: { type: String, default: 'Ar. Vikramaditya Rao' },
    authorRole: { type: String, default: 'Principal Architect & Design Director' },
    authorAvatar: { type: String, default: '' },
    readTimeMinutes: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    scheduledPublishAt: { type: Date },
    publishedAt: { type: Date, default: Date.now },
    relatedPosts: [{ type: Schema.Types.ObjectId, ref: 'BlogPost' }],
    locale: { type: String, default: 'en', index: true },
    seo: { type: SeoSchema, default: () => ({}) },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'blogPosts' }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

// 14. Enquiry Model (collection: enquiries)
export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone: string;
  location: string;
  serviceInterestedIn: string;
  budgetRange: string;
  projectDetails: string;
  sourcePage: string;
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  internalNotes: {
    note: string;
    addedBy: string;
    addedAt: Date;
  }[];
  ipHash?: string;
  isDeleted: boolean;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    location: { type: String, default: '' },
    serviceInterestedIn: { type: String, required: true, index: true },
    budgetRange: { type: String, default: 'Not Specified' },
    projectDetails: { type: String, default: '' },
    sourcePage: { type: String, default: 'Home Page' },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Follow-up', 'In Discussion', 'Converted', 'Closed'],
      default: 'New',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String, default: '' },
    internalNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    ipHash: { type: String, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'enquiries' }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

// 15. WebsiteSettings Model (collection: websiteSettings)
export interface IWebsiteSettings extends Document {
  companyName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  phonePrimary: string;
  phoneSecondary: string;
  emailPrimary: string;
  emailSupport: string;
  whatsappNumber: string;
  businessHours: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  footerAboutText: string;
  copyrightText: string;
  defaultSeo: SeoMetadata;
  notificationEmails: string[];
  supportedLanguages: SupportedLocale[];
  defaultLanguage: SupportedLocale;
  updatedBy?: mongoose.Types.ObjectId;
}

const WebsiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    companyName: { type: String, default: 'Vision Tech Solutions' },
    tagline: { type: String, default: 'DESIGN • BUILD • TRANSFORM' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    address: {
      type: String,
      default: 'Plot No. 123, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033',
    },
    phonePrimary: { type: String, default: '+91 98765 43210' },
    phoneSecondary: { type: String, default: '+91 40 4123 5678' },
    emailPrimary: { type: String, default: 'info@visiontechsolutions.co.in' },
    emailSupport: { type: String, default: 'projects@visiontechsolutions.co.in' },
    whatsappNumber: { type: String, default: '+919876543210' },
    businessHours: { type: String, default: 'Mon – Sat: 9:30 AM – 7:00 PM IST' },
    googleMapsEmbedUrl: {
      type: String,
      default:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.6789123456!2d78.4071!3d17.4319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9144f4b1b111%3A0x6d3b0b8c52b1a8e0!2sRoad%20No.%2036%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    },
    googleMapsDirectionsUrl: {
      type: String,
      default: 'https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad+500033',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/visiontechsolutions' },
      instagram: { type: String, default: 'https://instagram.com/visiontechsolutions' },
      linkedin: { type: String, default: 'https://linkedin.com/company/visiontechsolutions' },
      youtube: { type: String, default: 'https://youtube.com/@visiontechsolutions' },
      pinterest: { type: String, default: 'https://pinterest.com/visiontechsolutions' },
    },
    announcementBar: {
      enabled: { type: Boolean, default: false },
      text: {
        type: String,
        default: 'Book a complimentary 3D architectural spatial consultation with our Principal Designers.',
      },
      linkText: { type: String, default: 'Schedule Now' },
      linkUrl: { type: String, default: '/contact' },
    },
    footerAboutText: {
      type: String,
      default: 'Creating beautiful, functional and sustainable spaces for a better tomorrow.',
    },
    copyrightText: {
      type: String,
      default: '© 2026 Vision Tech Solutions. All rights reserved.',
    },
    defaultSeo: { type: SeoSchema, default: () => ({}) },
    notificationEmails: [{ type: String }],
    supportedLanguages: [{ type: String }],
    defaultLanguage: { type: String, default: 'en' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'websiteSettings' }
);

export const WebsiteSettings = mongoose.model<IWebsiteSettings>(
  'WebsiteSettings',
  WebsiteSettingsSchema
);

// 16. NavigationMenu Model (collection: navigationMenus)
export interface INavigationMenu extends Document {
  location: 'header' | 'footer-quick-links' | 'footer-services';
  title: string;
  items: {
    label: string;
    href: string;
    order: number;
    isExternal?: boolean;
    children?: {
      label: string;
      href: string;
      description?: string;
    }[];
  }[];
  locale: SupportedLocale;
  updatedBy?: mongoose.Types.ObjectId;
}

const NavigationMenuSchema = new Schema<INavigationMenu>(
  {
    location: {
      type: String,
      enum: ['header', 'footer-quick-links', 'footer-services'],
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true },
    items: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 },
        isExternal: { type: Boolean, default: false },
        children: [
          {
            label: { type: String },
            href: { type: String },
            description: { type: String },
          },
        ],
      },
    ],
    locale: { type: String, default: 'en' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'navigationMenus' }
);

export const NavigationMenu = mongoose.model<INavigationMenu>(
  'NavigationMenu',
  NavigationMenuSchema
);

// 17. Faq Model (collection: faqs)
export interface IFaq extends Document {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  status: PublicationStatus;
  locale: SupportedLocale;
  isDeleted: boolean;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'General', index: true },
    displayOrder: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    locale: { type: String, default: 'en' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'faqs' }
);

export const Faq = mongoose.model<IFaq>('Faq', FaqSchema);

// 18. ActivityLog Model (collection: activityLogs)
export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entityId?: string;
  entityTitle?: string;
  details?: string;
  ipAddress?: string;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'Admin' },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    entityId: { type: String },
    entityTitle: { type: String },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true, collection: 'activityLogs' }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
