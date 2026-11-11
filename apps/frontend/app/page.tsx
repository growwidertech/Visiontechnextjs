import React from 'react';
import { HomeClient } from '@/components/HomeClient';
import { fetchPublicBundle } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialBundle = await fetchPublicBundle();
  return <HomeClient initialBundle={initialBundle} />;
}
