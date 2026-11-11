'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Maximize2,
  User,
  Ruler,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Play,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project-detail', slug],
    queryFn: () => apiFetch(`/projects/${slug}`),
    enabled: Boolean(slug),
  });

  const project = data?.project;
  const relatedProjects = data?.relatedProjects || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center">
        <div className="text-gold text-sm uppercase tracking-widest animate-pulse">
          Loading Project Case Study...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-4xl mb-3">Project Not Found</h1>
        <Link href="/projects" className="text-gold underline text-sm">
          Back to All Projects
        </Link>
      </div>
    );
  }

  const allPhotos =
    project.images?.length > 0
      ? project.images
      : [{ url: project.coverImage, caption: project.title }];

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* 1. Featured Cover Hero with Rich Dark Overlay */}
      <section className="relative h-[68vh] min-h-[480px] flex items-end bg-navy-950 text-white overflow-hidden">
        <img
          src={project.coverImage}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(7,15,25,0.85) 0%, rgba(11,22,35,0.65) 45%, rgba(7,15,25,0.96) 100%)',
          }}
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-24 w-full">
          <span className="inline-block bg-gold text-navy-950 text-[11px] uppercase tracking-[0.2em] font-bold px-3.5 py-1 rounded-full mb-3">
            {project.category} • {project.projectType}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-xs sm:text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold" /> {project.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" /> Completed: {project.completionDate}
            </span>
            {project.projectSize && (
              <span className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-gold" /> Area: {project.projectSize}
              </span>
            )}
            {project.clientName && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gold" /> Client: {project.clientName}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Architectural Narrative, Design Concept, Challenges & Solutions */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold">
              ARCHITECTURAL CASE STUDY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold leading-tight">
              {project.shortSummary || `Inside ${project.title}`}
            </h2>
            <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {project.description}
            </p>

            {project.designConcept && (
              <div className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-sm space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-charcoal">
                  Design Concept & Material Palette
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                  {project.designConcept}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            {project.challenges && (
              <div className="bg-[#0B1623] text-white rounded-2xl p-7 space-y-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                  ENGINEERING CHALLENGES
                </span>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {project.challenges}
                </p>
              </div>
            )}

            {project.solutions && (
              <div className="bg-[#F6F1E7] border border-[#E8DEC8] rounded-2xl p-7 space-y-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#B88B38] font-semibold">
                  OUR ARCHITECTURAL SOLUTION
                </span>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                  {project.solutions}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-7 border border-[#E8DEC8] shadow-luxury space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-charcoal">
                Inspired by This {project.category} Project?
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Speak directly with the lead architect of {project.title} to plan your own bespoke space.
              </p>
              <Link
                href="/contact"
                className="w-full bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 font-semibold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <span>Enquire About a Similar Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Multi-Image Project Gallery with Full-Screen Lightbox */}
      <section className="py-16 bg-[#F6F1E7] border-y border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold block mb-2">
                HIGH-RESOLUTION PHOTOGRAPHY ({allPhotos.length} PHOTOS)
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold">
                Project Photograph Gallery
              </h2>
            </div>
            <span className="text-xs text-charcoal-muted">
              Click any photograph to open full-screen lightbox & zoom
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPhotos.map((img: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  setLightboxIndex(idx);
                  setZoomed(false);
                }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.altText || img.caption || project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/35 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-navy-950/85 text-gold p-3 rounded-full">
                      <Maximize2 className="w-5 h-5" />
                    </span>
                  </div>
                </div>
                {img.caption && (
                  <div className="p-4 text-xs text-charcoal font-medium">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Before-and-After Transformation Showcase */}
      {project.beforeAfterImages?.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-[0.22em] text-[#B88B38] font-semibold block mb-2">
            TURNKEY TRANSFORMATION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mb-8">
            Before & After Execution
          </h2>
          {project.beforeAfterImages.map((ba: any, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#E8DEC8] shadow-luxury space-y-4 mb-6"
            >
              <h3 className="font-serif text-2xl font-semibold text-charcoal">{ba.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative rounded-xl overflow-hidden h-72">
                  <img src={ba.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-navy-950/85 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    BEFORE (Bare Shell)
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden h-72">
                  <img src={ba.afterUrl} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-gold text-navy-950 text-xs font-bold px-3 py-1 rounded-full">
                    AFTER (Completed Handover)
                  </span>
                </div>
              </div>
              {ba.caption && <p className="text-xs text-charcoal-muted">{ba.caption}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 5. Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-16 bg-[#0B1623] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium mb-8">
              Related Portfolio Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rel: any) => (
                <Link
                  key={rel._id || rel.slug}
                  href={`/projects/${rel.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden block"
                >
                  <div className="h-60 overflow-hidden">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gold">{rel.category} • {rel.location}</div>
                    <h3 className="font-serif text-xl text-white group-hover:text-gold mt-1">
                      {rel.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full-Screen Lightbox with Next/Previous & Zoom */}
      {lightboxIndex !== null && allPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[90] bg-navy-950/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs uppercase tracking-widest text-gold">
              {project.title} — Image {lightboxIndex + 1} of {allPhotos.length}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoomed(!zoomed)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                title="Toggle Zoom"
              >
                {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + allPhotos.length) % allPhotos.length
                )
              }
              className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-navy-900/80 border border-white/20 text-white hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={allPhotos[lightboxIndex].url}
              alt={allPhotos[lightboxIndex].caption || project.title}
              className={`max-h-[75vh] max-w-[88vw] object-contain rounded-xl transition-transform duration-300 ${
                zoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
              onClick={() => setZoomed(!zoomed)}
            />

            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex + 1) % allPhotos.length)}
              className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-navy-900/80 border border-white/20 text-white hover:border-gold hover:text-gold"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-sm text-white/85 pb-2">
            {allPhotos[lightboxIndex].caption}
          </div>
        </div>
      )}
    </main>
  );
}
