import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-[#0B1623] text-white flex items-center justify-center px-4 pt-24">
      <div className="max-w-lg text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.28em] text-gold font-semibold">
          404 • ARCHITECTURAL SPACE NOT FOUND
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl font-medium text-white">
          Page Under Blueprint
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          The page you are looking for may have been moved, unpublished, or renamed in our CMS. Let us guide you back to our portfolio.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="bg-gold hover:bg-gold-light text-navy-950 font-semibold text-xs px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            href="/projects"
            className="border border-white/25 hover:border-gold text-white hover:text-gold font-semibold text-xs px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            Explore Portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
