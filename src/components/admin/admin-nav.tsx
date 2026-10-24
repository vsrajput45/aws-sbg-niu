'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, LayoutDashboard, PlusCircle, LogOut, ExternalLink, Shield, Settings, Users, Award, Menu, X, Mic } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface AdminNavProps {
  userEmail?: string;
  userRole?: string;
}

export function AdminNav({ userEmail = 'admin@niu.ac.in', userRole = 'admin' }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/events', label: 'Manage Events', icon: Calendar },
    { href: '/admin/speakers', label: 'Speaker Proposals', icon: Mic },
    { href: '/admin/badges', label: 'Badge Verification', icon: Award },
    { href: '/admin/events/new', label: 'New Event', icon: PlusCircle },
    { href: '/admin/team', label: 'Core Team', icon: Users },
    { href: '/admin/site-settings', label: 'Web Page Details', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A] border-b border-[#262626]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-14 h-9 sm:w-16 sm:h-10">
                <Image src="/aws-logo.svg" alt="AWS" fill className="object-contain" priority />
              </div>
              <div className="h-6 w-px bg-[#262626]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white font-heading leading-tight">Admin Console</span>
                <span className="text-[10px] text-gray-400">{siteConfig.shortName}</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#262626]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#1F1F1F] text-[#FF9900] border border-[#333333]'
                        : 'text-gray-400 hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action & Profile */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-2.5 py-1 rounded bg-[#141414] border border-[#262626]"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-[#262626]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-white truncate max-w-[140px]">{userEmail}</span>
                <span className="text-[10px] text-[#FF9900] font-semibold uppercase flex items-center justify-end gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  {userRole}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#1A1A1A] rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition ml-1"
                aria-label="Toggle Admin Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF9900]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111111] border-b border-[#262626] px-4 py-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#1F1F1F] text-[#FF9900] border border-[#333333]'
                      : 'text-gray-300 hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#FF9900]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#222222] flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="truncate max-w-[200px]">{userEmail}</span>
              <span className="text-[11px] font-mono">
                Role: <strong className="text-[#FF9900]">{userRole}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/"
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-gray-300 hover:text-white transition py-2 px-3 rounded-lg bg-[#181818] border border-[#2B2B2B]"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition py-2 px-3 rounded-lg bg-red-950/30 border border-red-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
