'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function DynamicCmsPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const { data, isLoading } = useQuery({
    queryKey: ['dynamic-cms-page', slug],
    queryFn: () => apiFetch(`/pages/${slug}?preview=true`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center">
        <span className="text-gold text-xs uppercase tracking-widest">
          Loading Page...
        </span>
      </div>
    );
  }

  const page = data?.page;
  const sections = data?.sections || [];

  if (!page) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-4xl mb-3">Page Not Found</h1>
        <Link href="/" className="text-gold underline text-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="relative h-[48vh] min-h-[360px] flex items-center bg-navy-950 text-white overflow-hidden">
        {page.bannerImage && (
          <img
            src={page.bannerImage}
            alt={page.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(7,15,25,0.94) 0%, rgba(11,22,35,0.84) 55%, rgba(7,15,25,0.68) 100%)',
          }}
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 w-full">
          {page.bannerSubtitle && (
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold block mb-2">
              {page.bannerSubtitle}
            </span>
          )}
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-white/75 text-sm sm:text-base max-w-2xl mt-3">
              {page.description}
            </p>
          )}
        </div>
      </section>

      {sections.map((sec: any) => (
        <section
          key={sec._id}
          className="py-16 border-b border-[#E8DEC8] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
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
                <p className="text-sm text-charcoal-muted leading-relaxed">
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
        </section>
      ))}
    </main>
  );
}
