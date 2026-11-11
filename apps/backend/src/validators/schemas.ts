import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const enquirySubmissionSchema = z.object({
  name: z.string().min(2, 'Full name is required').max(120),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(7, 'Valid phone number is required').max(25),
  location: z.string().max(120).optional().default(''),
  serviceInterestedIn: z.string().min(2, 'Please select a service').max(150),
  budgetRange: z.string().max(100).optional().default('Consultation Request'),
  projectDetails: z.string().max(3000).optional().default(''),
  sourcePage: z.string().max(120).optional().default('Home Page'),
});

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
