import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function getCfEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

export async function getDb(): Promise<D1Database> {
  const env = await getCfEnv();
  if (!env.DB) {
    throw new Error('D1 database binding DB is not configured');
  }
  return env.DB;
}

export async function getMediaBucket(): Promise<R2Bucket | null> {
  const env = await getCfEnv();
  return env.MEDIA || null;
}

export async function getJwtSecret(): Promise<string> {
  const env = await getCfEnv();
  return (
    env.JWT_SECRET ||
    process.env.JWT_SECRET ||
    'vision-tech-super-secret-jwt-key-2026-production-grade'
  );
}

export async function getAdminEmail(): Promise<string> {
  try {
    const env = await getCfEnv();
    return env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@visiontechsolutions.co.in';
  } catch {
    return process.env.ADMIN_EMAIL || 'admin@visiontechsolutions.co.in';
  }
}

export async function getAdminPassword(): Promise<string> {
  try {
    const env = await getCfEnv();
    return env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@123456';
  } catch {
    return process.env.ADMIN_PASSWORD || 'Admin@123456';
  }
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in';
}
