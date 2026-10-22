import Link from 'next/link';
import { Home, Calendar } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-32 px-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF9900]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9900]" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Error 404
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold font-heading text-white tracking-tight">
            Page Not <span className="text-[#FF9900]">Found</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            The page or event record you are looking for does not exist or may have been moved. Return to the homepage to explore community resources.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF9900] hover:bg-[#FFAA22] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#FF9900]/20"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] text-white text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Calendar className="w-4 h-4 text-[#FF9900]" />
              <span>Browse Events</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
