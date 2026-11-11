import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visiontechsolutions',
  JWT_SECRET: process.env.JWT_SECRET || 'vision-tech-super-secret-jwt-key-2026-production-grade',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'vision-tech-super-secret-refresh-key-2026-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'vision-tech-solutions',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  COMPANY_NOTIFICATION_EMAIL:
    process.env.COMPANY_NOTIFICATION_EMAIL || 'info@visiontechsolutions.co.in',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@visiontechsolutions.co.in',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
};
