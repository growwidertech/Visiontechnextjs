'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  LayoutGrid,
  Columns,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { PROJECT_CATEGORIES } from '@vision/shared';

export default function ProjectsPortfolioPage() {
  const [category, setCategory] = useState<string>('All');
  const [projectType, setProjectType] = useState<string>('All');
  const [location, setLocation] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const { data, isLoading } = useQuery({
    queryKey: ['projects-portfolio', category, projectType, location, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (projectType !== 'All') params.set('projectType', projectType);
      if (location !== 'All') params.set('location', location);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '60');
      return apiFetch(`/projects?${params.toString()}`);
    },
  });

  const projects = data?.projects || [];
  const locations = data?.locations || [];
  const visibleProjects = projects.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Banner with Rich Dark Overlay */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85"
          alt="Our Interior Design Portfolio"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(7,15,25,0.94) 0%, rgba(11,22,35,0.84) 55%, rgba(7,15,25,0.68) 100%)',
          }}
          className="absolute inset-0"
        />
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(7,15,25,0.85) 0%, transparent 45%, rgba(7,15,25,0.75) 100%)',
          }}
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 w-full">
          <span className="text-xs uppercase tracking-[0.26em] text-gold font-semibold block mb-3">
            ARCHITECTURAL PORTFOLIO • 500+ DELIVERED SPACES
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl">
            Our Interior Design & Contracting Projects
          </h1>
          <p className="text-white/75 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            Explore our delivered residences, private villas, urban apartments, corporate offices, fine-dining restaurants, wellness hospitals, shopping malls, and luxury cinemas.
          </p>
        </div>
      </section>

      {/* Filters & Search Controls */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-luxury space-y-5">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', ...PROJECT_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 shadow-sm'
                    : 'bg-[#FAF7F2] text-charcoal-muted hover:text-charcoal border border-[#E8DEC8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Project Type, Location, and Layout Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 pt-2 border-t border-[#F3EDE2] items-center">
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project name, location, or style..."
                className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-gold"
              >
                <option value="All">All Project Types (Res & Comm)</option>
                <option value="Residential">Residential Projects</option>
                <option value="Commercial">Commercial Projects</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-gold"
              >
                <option value="All">All Locations</option>
                {locations.map((loc: string) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
                  layoutMode === 'grid'
                    ? 'bg-navy-950 text-gold border-navy-950'
                    : 'bg-[#FAF7F2] text-charcoal-muted border-[#E8DEC8]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('masonry')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
                  layoutMode === 'masonry'
                    ? 'bg-navy-950 text-gold border-navy-950'
                    : 'bg-[#FAF7F2] text-charcoal-muted border-[#E8DEC8]'
                }`}
              >
                <Columns className="w-4 h-4" /> Masonry
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Listing */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-charcoal-muted">
            Loading portfolio projects...
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DEC8] mt-8 p-8">
            <h3 className="font-serif text-2xl text-charcoal">No matching projects found</h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Try clearing your search query or selecting &ldquo;All&rdquo; categories.
            </p>
          </div>
        ) : layoutMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {visibleProjects.map((proj: any) => (
              <Link
                key={proj._id || proj.slug}
                href={`/projects/${proj.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury flex flex-col transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-navy-950/85 backdrop-blur-sm text-gold text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-gold/30">
                      {proj.category}
                    </span>
                    {proj.isFeatured && (
                      <span className="bg-gold text-navy-950 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-charcoal-muted mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B88B38]" /> {proj.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B88B38]" /> {proj.completionDate}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-charcoal group-hover:text-[#B88B38] transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted mt-2 line-clamp-2 leading-relaxed">
                      {proj.shortSummary || proj.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F3EDE2] flex items-center justify-between text-xs font-semibold text-[#B88B38]">
                    <span>{proj.projectSize || 'Turnkey Interior'}</span>
                    <span className="flex items-center gap-1">
                      View Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-7 space-y-7 mt-10">
            {visibleProjects.map((proj: any, idx: number) => (
              <Link
                key={proj._id || proj.slug}
                href={`/projects/${proj.slug}`}
                className="group break-inside-avoid bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury block"
              >
                <div className={`relative overflow-hidden ${idx % 2 === 0 ? 'h-80' : 'h-60'}`}>
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 bg-navy-950/85 text-gold text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full">
                    {proj.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-[11px] text-charcoal-muted">{proj.location}</div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-[#B88B38] mt-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1.5 line-clamp-2">
                    {proj.shortSummary || proj.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Pagination */}
        {visibleCount < projects.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="bg-navy-950 hover:bg-navy-800 text-gold font-semibold text-xs px-8 py-3.5 rounded-full inline-flex items-center gap-2 shadow-md"
            >
              <span>Load More Projects ({projects.length - visibleCount} remaining)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
