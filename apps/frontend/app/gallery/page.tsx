'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const GALLERY_CATEGORIES = [
  'All',
  'Residential',
  'Villa',
  'Apartment',
  'Office',
  'Restaurant',
  'Hospital',
  'Shopping Mall',
  'Movie Theater',
];

const EXTENDED_CURATED_GALLERY = [
  {
    title: 'The Aurelia Double-Height Living Room',
    caption: 'Italian travertine walls, custom walnut ceiling coffers, and floor-to-ceiling glazing',
    altText: 'Luxury Villa Living Room',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    category: 'Villa',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Twilight Pool Pavilion & Cantilevered Deck',
    caption: 'Mediterranean-inspired private villa overlooking the illuminated infinity pool',
    altText: 'Villa Pool Pavilion',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    category: 'Villa',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Bespoke Master Bedroom Sanctuary',
    caption: 'Warm beige bouclé textures, fluted walnut paneling, and ambient cove lighting',
    altText: 'Master Bedroom Suite',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
    category: 'Apartment',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Sculptural Quartzite Island Kitchen',
    caption: 'Handleless champagne lacquer cabinetry with integrated European appliances',
    altText: 'Luxury Modular Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
    category: 'Residential',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Skyline Lounge & Private Library',
    caption: 'Panoramic floor-to-ceiling windows framing the twilight cityscape',
    altText: 'Skyline Living Room',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
    category: 'Residential',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Nexus Global Tech Headquarters',
    caption: 'Biophilic open workspace with acoustic timber baffles and ergonomic stations',
    altText: 'Modern Office Interior',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
    category: 'Office',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Saffron & Sage Fine Dining Salon',
    caption: 'Warm terracotta plaster and hand-blown amber glass chandeliers',
    altText: 'Fine Dining Restaurant',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    category: 'Restaurant',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Asteria Wellness Hospital Welcome Atrium',
    caption: 'Daylit healing architecture with hospitality-grade concierge lounge',
    altText: 'Hospital Interior Atrium',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85',
    category: 'Hospital',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'The Grand Galleria Retail Concourse',
    caption: 'Multi-level luxury shopping atrium with panoramic skylight canopy',
    altText: 'Shopping Mall Interior',
    url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1600&q=85',
    category: 'Shopping Mall',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Lumiere Gold Class Cinema Lounge',
    caption: 'THX-certified acoustic luxury auditorium with motorized leather recliners',
    altText: 'Movie Theater Interior',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85',
    category: 'Movie Theater',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'The Verve Sky Apartment Living Salon',
    caption: 'Open-plan urban apartment in ivory bouclé, smoked oak, and brushed brass',
    altText: 'Sky Apartment Living Room',
    url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=85',
    category: 'Apartment',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Contemporary Warm Minimalist Master Suite',
    caption: 'Floor-to-ceiling fluted glass wardrobe and tailored linen upholstery',
    altText: 'Minimalist Master Bedroom',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
    category: 'Residential',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Bookmatched Statuario Marble Spa Ensuite',
    caption: 'Freestanding sculptural soaking tub with brushed champagne gold fixtures',
    altText: 'Luxury Villa Bathroom',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85',
    category: 'Villa',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'The Solana Heritage Courtyard Dining',
    caption: 'Double-height formal dining pavilion anchored by a sculptural staircase',
    altText: 'Villa Formal Dining Room',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    category: 'Residential',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
  {
    title: 'Executive Telepresence Boardroom',
    caption: 'STC-45 acoustic glass partitions, custom walnut conference table, and linear lighting',
    altText: 'Executive Office Boardroom',
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85',
    category: 'Office',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Corporate Concierge & Reception Lobby',
    caption: 'Double-height marble reception with custom brass architectural screens',
    altText: 'Corporate Office Reception',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=85',
    category: 'Office',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Biophilic Work-Resort Breakout Café',
    caption: 'Hospitality-inspired employee lounge and barista bar',
    altText: 'Office Breakout Cafe',
    url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=85',
    category: 'Office',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Private Sommelier Tasting Room & Onyx Bar',
    caption: 'Backlit green onyx bar counter with custom velvet barstools',
    altText: 'Luxury Restaurant Bar',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
    category: 'Restaurant',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Botanical Courtyard Al-Fresco Dining',
    caption: 'Indoor-outdoor hospitality terrace with warm 2400K pendant lighting',
    altText: 'Courtyard Restaurant Design',
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=85',
    category: 'Restaurant',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Presidential VIP Hospital Recovery Suite',
    caption: 'Five-star hotel comfort with concealed medical headwalls and family lounge',
    altText: 'VIP Hospital Suite',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=85',
    category: 'Hospital',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Executive Diagnostic & Wellness Studio',
    caption: 'Calming sage and warm timber clinical consultation lounge',
    altText: 'Hospital Wellness Clinic',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85',
    category: 'Hospital',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Luxury Flagship Boutique Concourse',
    caption: 'Champagne anodized aluminum soffits and terrazzo retail promenade',
    altText: 'Luxury Shopping Mall Boutique',
    url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1600&q=85',
    category: 'Shopping Mall',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Art-Deco VIP Cinema Champagne Foyer',
    caption: 'Obsidian marble lobby with custom brass geometric lighting',
    altText: 'VIP Movie Theater Foyer',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85',
    category: 'Movie Theater',
    albumTitle: 'Commercial, Hospitality & Healthcare Landmarks',
  },
  {
    title: 'Penthouse Waterfall Quartz Kitchen & Bar',
    caption: 'Custom walnut breakfast counter and concealed pantry joinery',
    altText: 'Apartment Modular Kitchen',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
    category: 'Apartment',
    albumTitle: 'Signature Luxury Villas & Residences',
  },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['public-gallery', selectedCategory],
    queryFn: () =>
      apiFetch(
        `/gallery${
          selectedCategory !== 'All'
            ? `?category=${encodeURIComponent(selectedCategory)}`
            : ''
        }`
      ),
  });

  // Merge API items with the 24 curated high-resolution photographs without duplicate URLs
  const apiItems = data?.items || [];
  const mergedMap = new Map<string, any>();
  for (const item of [...apiItems, ...EXTENDED_CURATED_GALLERY]) {
    if (
      selectedCategory === 'All' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase()
    ) {
      mergedMap.set(item.url, item);
    }
  }
  const items = Array.from(mergedMap.values());

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Banner with Strong Dark Luxury Overlay */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center bg-navy-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1920&q=85"
          alt="Interior Design Gallery"
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
            VISUAL ARCHIVE & MASONRY GALLERY ({items.length} PHOTOGRAPHS)
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-white max-w-3xl leading-[1.1]">
            Curated Spaces & Material Details
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            Browse high-resolution interior photography across our residential villas, luxury apartments, and commercial landmarks.
          </p>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] text-navy-950 shadow-sm'
                  : 'bg-white text-charcoal-muted hover:text-charcoal border border-[#E8DEC8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Image Grid */}
        {isLoading && items.length === 0 ? (
          <div className="py-20 text-center text-sm text-charcoal-muted">
            Loading curated gallery...
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {items.map((item: any, idx: number) => (
              <div
                key={item.url || idx}
                onClick={() => {
                  setLightboxIdx(idx);
                  setZoomed(false);
                }}
                className="group break-inside-avoid bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-luxury cursor-pointer relative"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.altText || item.title}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      idx % 3 === 0 ? 'h-80' : idx % 3 === 1 ? 'h-64' : 'h-72'
                    }`}
                  />
                  <div
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(7,15,25,0.10) 0%, rgba(7,15,25,0.88) 100%)',
                    }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5"
                  >
                    <div className="flex justify-end">
                      <span className="w-9 h-9 rounded-full bg-navy-950/80 border border-gold/40 text-gold flex items-center justify-center">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-xl text-white font-medium mt-0.5">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-white/80 mt-1 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2 bg-white">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[#B88B38] font-semibold">
                      {item.category}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-charcoal truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full-Screen Gallery Viewer */}
      {lightboxIdx !== null && items[lightboxIdx] && (
        <div
          style={{ backgroundColor: 'rgba(7, 15, 25, 0.96)' }}
          className="fixed inset-0 z-[90] backdrop-blur-lg flex flex-col justify-between p-4 sm:p-8"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="flex items-center justify-between text-white gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-gold block">
                {items[lightboxIdx].albumTitle || items[lightboxIdx].category} — Image{' '}
                {lightboxIdx + 1} of {items.length}
              </span>
              <span className="font-serif text-xl sm:text-2xl">
                {items[lightboxIdx].title}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {items[lightboxIdx].associatedProject?.slug && (
                <Link
                  href={`/projects/${items[lightboxIdx].associatedProject.slug}`}
                  className="text-xs bg-gold text-navy-950 font-semibold px-3.5 py-2 rounded-full hidden sm:flex items-center gap-1.5"
                >
                  <span>View Project</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => setZoomed(!zoomed)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setLightboxIdx(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                setLightboxIdx((lightboxIdx - 1 + items.length) % items.length)
              }
              className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-navy-900/90 border border-white/20 text-white hover:border-gold"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img
              src={items[lightboxIdx].url}
              alt={items[lightboxIdx].title}
              className={`max-h-[75vh] max-w-[88vw] object-contain rounded-xl transition-transform duration-300 ${
                zoomed ? 'scale-125' : 'scale-100'
              }`}
            />
            <button
              onClick={() => setLightboxIdx((lightboxIdx + 1) % items.length)}
              className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-navy-900/90 border border-white/20 text-white hover:border-gold"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-xs sm:text-sm text-white/85">
            {items[lightboxIdx].caption}
          </div>
        </div>
      )}
    </main>
  );
}
