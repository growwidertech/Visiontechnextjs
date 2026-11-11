import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans, Great_Vibes } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#070F19',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in'
  ),
  title: {
    default: 'Vision Tech Solutions | Luxury Interior Design & Turnkey Contracting in Hyderabad',
    template: '%s | Vision Tech Solutions',
  },
  description:
    'At Vision Tech Solutions (visiontechsolutions.co.in), we design inspiring residential, villa, apartment, and commercial spaces in Hyderabad & across India. End-to-end luxury interior architecture and turnkey contracting.',
  keywords: [
    'Vision Tech Solutions',
    'visiontechsolutions.co.in',
    'Luxury Interior Design Hyderabad',
    'Villa Interior Design Jubilee Hills',
    'Apartment Interior Design Hyderabad',
    'Commercial Interior Contracting Hyderabad',
    'Office Interior Design HITEC City',
    'Restaurant Interior Design',
    'Hospital Interior Design',
    'Shopping Mall Interior Design',
    'Movie Theater Interior Design',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Vision Tech Solutions – Good Design Creates Better Living & Working',
    description:
      'End-to-End Interior Design & Turnkey Contracting Solutions for Luxury Villas, Apartments, Offices, Restaurants, Hospitals, Malls & Cinemas.',
    type: 'website',
    siteName: 'Vision Tech Solutions',
    locale: 'en_IN',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
        width: 1920,
        height: 1080,
        alt: 'Vision Tech Solutions Luxury Interior Design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vision Tech Solutions | Luxury Interior Design & Turnkey Contracting',
    description:
      'Designing inspiring residential villas, apartments, and commercial spaces with creativity, precision, and excellence.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'GeneralContractor', 'LocalBusiness'],
        '@id': 'https://visiontechsolutions.co.in/#organization',
        name: 'Vision Tech Solutions',
        slogan: 'DESIGN • BUILD • TRANSFORM',
        description:
          'Premier luxury interior design and turnkey contracting company in Hyderabad specializing in residential, villa, apartment, office, restaurant, hospital, shopping mall, and movie theater interiors.',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in',
        telephone: '+91 98765 43210',
        email: 'info@visiontechsolutions.co.in',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Plot No. 123, Road No. 36, Jubilee Hills',
          addressLocality: 'Hyderabad',
          addressRegion: 'Telangana',
          postalCode: '500033',
          addressCountry: 'IN',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          opens: '09:30',
          closes: '19:00',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://visiontechsolutions.co.in/#website',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in',
        name: 'Vision Tech Solutions',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${
            process.env.NEXT_PUBLIC_SITE_URL || 'https://visiontechsolutions.co.in'
          }/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} ${greatVibes.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E252B] antialiased">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
