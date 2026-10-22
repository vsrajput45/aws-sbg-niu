import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aws-sbg-niu.ac.in'),
  title: {
    default: `${siteConfig.shortName} | AWS Student Builder Group at Noida International University`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.tagline,
  keywords: [
    'AWS',
    'AWS Student Builder Group',
    'Noida International University',
    'NIU',
    'Cloud Computing',
    'Greater Noida',
    'Uttar Pradesh',
    'Delhi NCR',
    'AI',
    'Machine Learning',
    'DevOps',
    'Serverless',
    'Students',
  ],
  authors: [{ name: siteConfig.chapterName }],
  creator: siteConfig.chapterName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: siteConfig.chapterName,
    title: `${siteConfig.shortName} | Noida International University`,
    description: siteConfig.tagline,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.shortName} Social Card`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.shortName,
    description: siteConfig.tagline,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/sbg-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070312] text-[#E5E7EB] font-sans selection:bg-purple-600/40 selection:text-white relative">
        {/* Ambient Site Background Campus Layer with AWS Cloud Purple Glow */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <Image
            src="/hero.jpg"
            alt="Noida International University Campus Background"
            fill
            sizes="100vw"
            className="object-cover object-center scale-100 opacity-20"
            priority
          />
          {/* Deep Cosmic Purple & Violet Cloud Aura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070312]/95 via-[#0C061E]/90 to-[#06020D]" />

          {/* Ambient Purple Cloud Lights */}
          <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-violet-600/12 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
        </div>
        {children}
      </body>
    </html>
  );
}
