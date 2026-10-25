'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aws_sbg_admin_tab_active');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aws_sbg_admin_tab_active', '1');
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#262626] py-8 px-6 shadow-2xl rounded-xl sm:px-10">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition"
              placeholder="Username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-[#181818] border border-[#333333] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-xs font-bold uppercase tracking-widest text-black bg-[#FF9900] hover:bg-[#FFAA22] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF9900]/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-[#222222]">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-[#FF9900] shrink-0" />
          <span>Strictly restricted to appointed community organizers. No public registration.</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF9900]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="relative w-16 h-10">
            <Image src="/aws-logo.svg" alt="AWS" fill className="object-contain" priority />
          </div>
          <div className="h-6 w-px bg-[#262626]" />
          <div className="relative w-9 h-9">
            <Image src="/sbg-logo.svg" alt="SBG" fill className="object-contain" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-white font-heading">
          Organizer Admin Console
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400">
          {siteConfig.chapterName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Suspense fallback={
          <div className="bg-[#111111] border border-[#262626] py-12 px-6 rounded-xl text-center text-xs text-gray-500">
            Loading Admin Console...
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="hover:text-white transition underline underline-offset-4">
            ← Return to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
