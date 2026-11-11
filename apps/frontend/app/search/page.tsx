'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [inputQ, setInputQ] = useState(initialQ);

  useEffect(() => {
    setInputQ(initialQ);
  }, [initialQ]);

  const { data, isLoading } = useQuery({
    queryKey: ['global-search', initialQ],
    queryFn: () =>
      apiFetch(`/dashboard/search?q=${encodeURIComponent(initialQ)}`),
    enabled: Boolean(initialQ.trim()),
  });

  const projects = data?.projects || [];
  const services = data?.services || [];

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="relative bg-navy-950 text-white pt-32 pb-16 px-4 overflow-hidden">
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(7,15,25,0.97) 0%, rgba(11,22,35,0.90) 100%)',
          }}
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-5xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.24em] text-gold font-semibold">
            GLOBAL PORTFOLIO & SITE SEARCH
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium">
            Search Results {initialQ ? `for "${initialQ}"` : ''}
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(inputQ.trim())}`);
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl pt-2"
          >
            <input
              type="text"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Search projects, villas, offices, or interior services..."
              className="flex-1 bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="bg-gold text-navy-950 font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>
      </section>

      <section className="py-14 max-w-5xl mx-auto px-4 space-y-12">
        {isLoading ? (
          <div className="text-sm text-charcoal-muted">Searching...</div>
        ) : (
          <>
            {services.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">
                  Matching Interior Services ({services.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s: any) => (
                    <Link
                      key={s._id}
                      href={`/services/${s.slug}`}
                      className="bg-white p-5 rounded-xl border border-[#E8DEC8] shadow-sm hover:border-gold flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-serif text-xl font-semibold text-charcoal">
                          {s.title}
                        </div>
                        <p className="text-xs text-charcoal-muted mt-1 line-clamp-1">
                          {s.shortDescription}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B88B38] shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">
                  Matching Portfolio Projects ({projects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p: any) => (
                    <Link
                      key={p._id}
                      href={`/projects/${p.slug}`}
                      className="bg-white p-4 rounded-xl border border-[#E8DEC8] shadow-sm hover:border-gold flex items-center gap-4"
                    >
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-20 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#B88B38] font-semibold">
                          {p.category} • {p.location}
                        </div>
                        <div className="font-serif text-xl font-semibold text-charcoal">
                          {p.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {initialQ && services.length === 0 && projects.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[#E8DEC8] text-center">
                <p className="font-serif text-2xl text-charcoal">
                  No results found for &ldquo;{initialQ}&rdquo;
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <SearchResultsInner />
    </Suspense>
  );
}
