'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Client partners for the hero marquee.
//
// Logos live in /public/images/clients/. Entries with a `logo` render the image
// on a light plate; entries without fall back to a wordmark - so new logos can be
// added one at a time without breaking the row.
//
// The plate is deliberate: these logos are heterogeneous (FOCAS is black type,
// UNSVCC has navy elements) and would be invisible or muddy directly on black.
// A uniform light plate makes every brand legible and the row consistent.
//
// Deliberately excludes MAPL Tours: it is our own product (see /labs), so listing
// it among client partners would misrepresent it as an external client.
const PARTNERS: { name: string; logo?: string }[] = [
  { name: 'LRO Staffing', logo: '/images/clients/lro-staffing.png' },
  { name: 'Loop', logo: '/images/clients/loop.webp' },
  { name: 'FOCAS Canada', logo: '/images/clients/focas-canada.png' },
  { name: 'UNSVCC', logo: '/images/clients/unsvcc.svg' },
  { name: 'CHHA-NCR', logo: '/images/clients/chha-ncr.svg' },
  { name: 'Crowned Spice', logo: '/images/clients/crowned-spice.png' },
  { name: 'Akuma Patterson' },
  { name: 'Crowngate' },
];

const RingsSvg = () => (
  <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true" focusable="false">
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
);

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-medium sm:text-[11px]">
      {label}
    </span>
  </div>
);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const parallaxOn = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const noReduce = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    parallaxOn.current = fine && noReduce;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!parallaxOn.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const cx = e.clientX;
    const cy = e.clientY;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--hx', ((cx - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--hy', ((cy - r.top) / r.height - 0.5).toFixed(3));
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Scoped animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes heroRingPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.5; }
        }
        .hero-fade-in {
          animation: fadeSlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .hero-marquee {
          animation: marquee 36s linear infinite;
        }
        .hero-marquee:hover {
          animation-play-state: paused;
        }
        /* Uniform light plate: normalizes six logos of different colors,
           aspect ratios and ink coverage into one consistent row. */
        .hero-partner {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          height: 56px;
          min-width: 128px;
          padding: 0 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.14);
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .hero-partner:hover {
          background: #fff;
          transform: translateY(-2px);
        }
        .hero-partner__logo {
          max-height: 30px;
          max-width: 132px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        .hero-partner__name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #111;
          white-space: nowrap;
        }
        .hero-rings {
          animation: heroRingPulse 7s ease-in-out infinite;
        }
        .hero-delay-100 { animation-delay: 0.08s; }
        .hero-delay-200 { animation-delay: 0.18s; }
        .hero-delay-300 { animation-delay: 0.28s; }
        .hero-delay-400 { animation-delay: 0.38s; }
        .hero-delay-500 { animation-delay: 0.52s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in { animation-duration: 0.01ms; }
          .hero-marquee, .hero-rings { animation: none; }
        }
      `}</style>

      {/* Atmospheric glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '8%',
          right: '-8%',
          width: '64%',
          height: '92%',
          background: 'radial-gradient(ellipse at center, rgba(240,51,80,0.09) 0%, transparent 68%)',
          transform: 'translate3d(calc(var(--hx, 0) * -32px), calc(var(--hy, 0) * -32px), 0)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-20%',
          left: '-12%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(196,33,60,0.07) 0%, transparent 70%)',
          transform: 'translate3d(calc(var(--hx, 0) * 28px), calc(var(--hy, 0) * 28px), 0)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Fine engineering grid, faded toward edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 30% 40%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, black 10%, transparent 70%)',
        }}
      />

      {/* Concentric circles - engineering blueprint motif (desktop: cursor-parallax) */}
      <div
        className="hero-rings absolute pointer-events-none hidden lg:block"
        style={{
          top: '50%',
          right: '2%',
          transform: 'translateY(-45%) translate3d(calc(var(--hx, 0) * 24px), calc(var(--hy, 0) * 24px), 0)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          width: '42vw',
          maxWidth: '620px',
          aspectRatio: '1',
        }}
      >
        <RingsSvg />
      </div>

      {/* Mobile: static rings, clipped off the right edge - designed degradation,
          the motif survives touch instead of disappearing. Deliberately NOT
          .hero-rings: that class animates opacity, which would override this one. */}
      <div
        className="hero-rings-static absolute pointer-events-none lg:hidden"
        style={{
          top: '4%',
          right: '-38%',
          width: 'min(88vw, 420px)',
          aspectRatio: '1',
          opacity: 0.55,
        }}
      >
        <RingsSvg />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-28 pb-14 md:pt-36 md:pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 items-start">

          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-7 sm:space-y-8 pt-4 sm:pt-8">

            {/* Eyebrow */}
            <div className="hero-fade-in hero-delay-100 flex items-center gap-4">
              <span className="block w-10 h-[2px] bg-[#F03350] flex-shrink-0" />
              <span
                className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: '#ff5c73' }}
              >
                Systems &middot; Automation &middot; Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-fade-in hero-delay-200 text-[2.6rem] sm:text-[3.4rem] lg:text-[4rem] font-extrabold leading-[1.08] tracking-tight"
              style={{ color: '#fff' }}
            >
              The <span style={{ color: '#F03350' }}>engineering backbone</span> behind
              agencies that refuse to cut corners
            </h1>

            {/* Subtitle */}
            <p
              className="hero-fade-in hero-delay-300 max-w-xl text-base sm:text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              We partner with agencies to build, ship, and scale the systems, automation,
              and infrastructure their most ambitious projects demand.
            </p>

            {/* Buttons */}
            <div className="hero-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 sm:px-9 sm:py-4 text-[1.0625rem] font-semibold tracking-[0.04em] transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #c4213c 0%, #F03350 50%, #ff3d5a 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 24px rgba(240,51,80,0.3)',
                }}
              >
                Start a Project
              </Link>

              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 sm:px-9 sm:py-4 text-[1.0625rem] font-semibold tracking-[0.04em] transition-all hover:bg-white/10 active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#fff',
                }}
              >
                Explore Services
              </a>
            </div>

            {/* Office locations - quiet global-footprint signal */}
            <div
              className="hero-fade-in hero-delay-500 flex items-center gap-3 pt-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              <span>Toronto</span>
              <span style={{ color: 'rgba(240,51,80,0.6)' }}>/</span>
              <span>Lagos</span>
              <span style={{ color: 'rgba(240,51,80,0.6)' }}>/</span>
              <span>Kingston</span>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-5 space-y-6 lg:mt-10">

            {/* Stats Card */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#F03350]/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="text-5xl font-extrabold tracking-tight text-white leading-none">
                      200+
                    </div>
                    <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Projects Supported
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] text-zinc-300 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    ACCEPTING&nbsp;PROJECTS
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Client Satisfaction</span>
                    <span className="text-white font-semibold">100%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/60">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[#c4213c] to-[#F03350]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="25+" label="Years" />
                  <StatItem value="24/7" label="Support" />
                  <StatItem value="3" label="Countries" />
                </div>
              </div>
            </div>

            {/* Client partner marquee - scrolls continuously, pauses on hover */}
            <div className="hero-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] py-7 backdrop-blur-xl">
              <h2 className="mb-5 px-7 sm:px-8 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                Selected Client Partners
              </h2>

              <div
                className="relative flex overflow-hidden"
                style={{
                  // Full fade to transparent at both edges so nothing is ever
                  // half-visible / clipped mid-logo as it enters or leaves.
                  maskImage: 'linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)',
                }}
              >
                {/* Duplicated once so the -50% translate loops seamlessly */}
                <div className="hero-marquee flex items-center gap-4 whitespace-nowrap px-4">
                  {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                    <div key={`${partner.name}-${i}`} className="hero-partner" aria-hidden={i >= PARTNERS.length}>
                      {partner.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- plain <img>: these
                        // are tiny pre-sized logos duplicated in a marquee; next/image adds no
                        // benefit and its lazy default causes visible pop-in as items scroll in.
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          loading="eager"
                          decoding="async"
                          className="hero-partner__logo"
                        />
                      ) : (
                        <span className="hero-partner__name">{partner.name}</span>
                      )}
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
