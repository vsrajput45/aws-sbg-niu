'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { EventRecord } from '@/lib/db/types';

interface NavbarProps {
  featuredEvent?: EventRecord | null;
  config?: typeof siteConfig;
}

export function Navbar({ featuredEvent, config }: NavbarProps) {
  const cfg = config || siteConfig;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#about', label: 'About' },
    { href: '/events', label: 'Events' },
    ...(featuredEvent && featuredEvent.speakers && featuredEvent.speakers.length > 0
      ? [{ href: '/#speakers', label: 'Speakers' }]
      : []),
    ...(featuredEvent && featuredEvent.agenda && featuredEvent.agenda.length > 0
      ? [{ href: '/#agenda', label: 'Agenda' }]
      : []),
    { href: '/#team', label: 'Team' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/cfp', label: 'Speak' },
    { href: '/badge', label: 'Badge' },
    { href: '/#venue', label: 'Venue' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080415]/90 backdrop-blur-md border-b border-[#24143D] py-3 shadow-xl shadow-purple-950/30'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Left: Logos */}
        <Link href="/" className="flex items-center shrink-0 gap-3 group">
          <div className="relative w-14 h-9 sm:w-16 sm:h-10">
            <Image
              src="/aws-logo.svg"
              alt="AWS"
              fill
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="w-px h-6 bg-[#2E184A]" />
          <div className="relative w-8 h-8">
            <Image
              src="/sbg-logo.svg"
              alt="Student Builder Group"
              fill
              className="object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-heading leading-tight">
              {cfg.shortName}
            </span>
            <span className="text-xs text-gray-300 font-medium">Greater Noida, UP</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-colors duration-200 py-1 group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#A855F7] to-[#C084FC] transition-all duration-300 w-0 group-hover:w-full opacity-90" />
            </Link>
          ))}
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-3">
          {featuredEvent ? (
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-600/30"
            >
              <span>Register for Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <a
              href={cfg.meetupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-600/30"
            >
              <span>Join on Meetup</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A051A] border-b border-[#24143D] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#C084FC] transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#221338]">
            {featuredEvent ? (
              <Link
                href={`/events/${featuredEvent.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <span>Register for Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <a
                href={cfg.meetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <span>Join Us on Meetup</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
