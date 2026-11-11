export type RoleName =
  | 'Super Administrator'
  | 'Administrator'
  | 'Content Manager'
  | 'Gallery Manager'
  | 'Project Manager';

export type PermissionKey =
  | 'users:read'
  | 'users:write'
  | 'roles:manage'
  | 'pages:read'
  | 'pages:write'
  | 'pages:publish'
  | 'services:read'
  | 'services:write'
  | 'projects:read'
  | 'projects:write'
  | 'gallery:read'
  | 'gallery:write'
  | 'media:read'
  | 'media:write'
  | 'testimonials:read'
  | 'testimonials:write'
  | 'blog:read'
  | 'blog:write'
  | 'enquiries:read'
  | 'enquiries:write'
  | 'settings:read'
  | 'settings:write'
  | 'seo:manage';

export type SupportedLocale = 'en' | 'kn' | 'ta' | 'te' | 'ml' | 'hi';

export const SUPPORTED_LOCALES: { code: SupportedLocale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export type PublicationStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type ProjectCategory =
  | 'Residential'
  | 'Villa'
  | 'Apartment'
  | 'Office'
  | 'Restaurant'
  | 'Hospital'
  | 'Shopping Mall'
  | 'Movie Theater';

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Residential',
  'Villa',
  'Apartment',
  'Office',
  'Restaurant',
  'Hospital',
  'Shopping Mall',
  'Movie Theater',
];

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'In Discussion'
  | 'Converted'
  | 'Closed';

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  'New',
  'Contacted',
  'Follow-up',
  'In Discussion',
  'Converted',
  'Closed',
];

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  imageAlt?: string;
  noIndex?: boolean;
  keywords?: string[];
}
