'use client';

interface ClientLogoCarouselProps {
  logos: string[];
  label?: string;
}

export default function ClientLogoCarousel({
  logos,
  label = 'Trusted by leading brands',
}: ClientLogoCarouselProps) {
  // Duplicate for seamless loop
  const items = [...logos, ...logos];

  return (
    <div style={wrapperStyle}>
      {label && <p style={labelStyle}>{label}</p>}
      <div style={trackWrapperStyle}>
        {/* Fade edges */}
        <div style={{ ...fadeStyle, left: 0, background: 'linear-gradient(to right, var(--fade-color, #0a0a0f), transparent)' }} />
        <div style={{ ...fadeStyle, right: 0, background: 'linear-gradient(to left, var(--fade-color, #0a0a0f), transparent)' }} />

        <div style={trackStyle} className="logo-marquee">
          {items.map((name, i) => (
            <div key={i} style={logoItemStyle}>
              <span style={logoTextStyle}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-marquee {
          animation: marquee 28s linear infinite;
        }
        .logo-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  padding: '3rem 0 2.5rem',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: '1.75rem',
};

const trackWrapperStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
};

const fadeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 80,
  zIndex: 2,
  pointerEvents: 'none',
};

const trackStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  width: 'max-content',
};

const logoItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
  padding: '0 1.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 10,
  flexShrink: 0,
  transition: 'background 0.2s, border-color 0.2s',
  cursor: 'default',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  whiteSpace: 'nowrap',
  letterSpacing: '0.02em',
};
