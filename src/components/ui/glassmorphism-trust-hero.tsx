'use client';

import Link from 'next/link';
import {
  Target,
  Crown,
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
} from 'lucide-react';

const CLIENTS = [
  { name: 'Acme Corp', icon: Hexagon },
  { name: 'Quantum', icon: Triangle },
  { name: 'Command+Z', icon: Command },
  { name: 'Phantom', icon: Ghost },
  { name: 'Ruby', icon: Gem },
  { name: 'Chipset', icon: Cpu },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] capitalize tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
  </div>
);

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Scoped animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-fade-in {
          animation: fadeSlideIn 0.45s ease-out forwards;
          opacity: 0;
        }
        .hero-marquee {
          animation: marquee 40s linear infinite;
        }
        .hero-delay-100 { animation-delay: 0.05s; }
        .hero-delay-200 { animation-delay: 0.1s; }
        .hero-delay-300 { animation-delay: 0.15s; }
        .hero-delay-400 { animation-delay: 0.2s; }
        .hero-delay-500 { animation-delay: 0.3s; }
      `}</style>

      {/* Subtle radial glow behind the circles */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          right: '-5%',
          width: '60%',
          height: '90%',
          background: 'radial-gradient(ellipse at center, rgba(240,51,80,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Concentric circles SVG — sits behind the right column */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: '50%',
          right: '2%',
          transform: 'translateY(-45%)',
          width: '42vw',
          maxWidth: '620px',
          aspectRatio: '1',
        }}
      >
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="300" cy="300" r="280" stroke="rgba(240,51,80,0.08)" strokeWidth="1" />
          <circle cx="300" cy="300" r="240" stroke="rgba(240,51,80,0.1)" strokeWidth="1" />
          <circle cx="300" cy="300" r="200" stroke="rgba(240,51,80,0.12)" strokeWidth="1" />
          <circle cx="300" cy="300" r="160" stroke="rgba(240,51,80,0.15)" strokeWidth="1" />
          <circle cx="300" cy="300" r="120" stroke="rgba(240,51,80,0.18)" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="80" stroke="rgba(240,51,80,0.22)" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="40" stroke="rgba(240,51,80,0.28)" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="4" fill="#F03350" />
          <circle cx="300" cy="300" r="8" fill="rgba(240,51,80,0.3)" />
          <circle cx="300" cy="300" r="16" fill="rgba(240,51,80,0.08)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">

          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">

            {/* Tagline with red line */}
            <div className="hero-fade-in hero-delay-100 flex items-center gap-4">
              <span className="block w-10 h-[2px] bg-[#F03350] flex-shrink-0" />
              <span
                className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: '#F03350' }}
              >
                Systems &middot; Automation &middot; Infrastructure
              </span>
            </div>

            {/* Heading */}
            <h1
              className="hero-fade-in hero-delay-200 text-[3rem] sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.08] tracking-tight"
              style={{ color: '#fff' }}
            >
              The{' '}
              <span style={{ color: '#F03350' }}>engineering{'\n'}backbone</span>{' '}
              behind agencies that refuse to cut corners on technology
            </h1>

            {/* Subtitle */}
            <p
              className="hero-fade-in hero-delay-300 max-w-xl text-base sm:text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              We partner with agencies to build, ship, and scale the systems, automation,
              and infrastructure their most ambitious projects demand.
            </p>

            {/* Buttons */}
            <div className="hero-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4" style={{ marginTop: 30 }}>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full px-8 py-4 text-[1.0625rem] font-semibold capitalize tracking-[0.08em] transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #c4213c 0%, #F03350 50%, #ff3d5a 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 24px rgba(240,51,80,0.25)',
                }}
              >
                Start a Project
              </Link>

              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full px-8 py-4 text-[1.0625rem] font-semibold capitalize tracking-[0.08em] transition-all hover:bg-white/10 active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">

            {/* Stats Card */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">200+</div>
                    <div className="text-sm text-zinc-400">Projects Supported</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Client Satisfaction</span>
                    <span className="text-white font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-[#c4213c] to-[#F03350]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="25+" label="Years" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="24/7" label="Support" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="100%" label="Quality" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    ACTIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <Crown className="w-3 h-3 text-[#F03350]" />
                    PREMIUM
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Card */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">Trusted by Industry Leaders</h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              >
                <div className="hero-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"
                    >
                      <client.icon className="h-6 w-6 text-white fill-current" />
                      <span className="text-lg font-bold text-white tracking-tight">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
