'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  /** mono kicker above the heading, e.g. "WELCOME BACK" */
  kicker: string;
  /** main heading */
  heading: string;
  /** left panel decorative mode: 'card' (login) | 'card-blur' (signup) | 'ribbon' */
  panel?: 'card' | 'card-blur' | 'ribbon';
  /** bottom banner text for signup panel */
  panelBanner?: string;
  /** panel banner mono line */
  panelBannerSub?: string;
  children: ReactNode;
}

const PANEL_BG =
  'linear-gradient(120deg,#0D0B10 0%,#0D0B10 30%,#5C1119 52%,#8C1420 72%,#0D0B10 90%)';

function PanelArt({ variant, banner, bannerSub }: { variant: 'card' | 'card-blur' | 'ribbon'; banner?: string; bannerSub?: string }) {
  const shine = (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '30%',
        background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.3),transparent)',
        animation: 'cardShine 3s ease-in-out infinite',
      }}
    />
  );

  const card = (
    <div
      style={{
        width: 180,
        height: 250,
        margin: '0 auto',
        background: 'linear-gradient(160deg,#E03C4E,#0F0C16 65%)',
        border: '2px solid #E03C4E',
        clipPath: 'polygon(0 0,80% 0,100% 15%,100% 100%,0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {shine}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: PANEL_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      {variant === 'card' && (
        <div style={{ position: 'relative', textAlign: 'center' }}>
          {card}
          <div
            style={{
              marginTop: 24,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.16em',
              color: 'rgba(237,231,220,.7)',
            }}
          >
            Your deck is waiting.
          </div>
        </div>
      )}

      {variant === 'card-blur' && (
        <>
          <div style={{ position: 'relative', textAlign: 'center', filter: 'blur(3px)', opacity: 0.5, zIndex: 2 }}>
            {card}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            {banner && (
              <div
                style={{
                  background: '#E03C4E',
                  color: '#0F0C16',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  padding: '10px 20px',
                  clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 12px) 100%,0 100%)',
                  display: 'inline-block',
                }}
              >
                {banner}
              </div>
            )}
            {bannerSub && (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: 'rgba(237,231,220,.7)',
                }}
              >
                {bannerSub}
              </div>
            )}
          </div>
        </>
      )}

      {variant === 'ribbon' && (
        <div style={{ position: 'relative', textAlign: 'center' }}>
          {card}
          <div
            style={{
              marginTop: 24,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.16em',
              color: 'rgba(237,231,220,.7)',
            }}
          >
            Your deck is waiting.
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthLayout({ kicker, heading, panel = 'card', panelBanner, panelBannerSub, children }: AuthLayoutProps) {
  return (
    <div
      className="auth-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <div className="auth-art"><PanelArt variant={panel} banner={panelBanner} bannerSub={panelBannerSub} /></div>

      <div className="auth-form-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link href="/" className="reina-logo" style={{ marginBottom: 40 }}>
            <div className="reina-logo-mark">
              <span>R</span>
            </div>
            <div className="reina-logo-word">REINA</div>
          </Link>

          <div className="mono-label">{kicker}</div>
          <h1
            style={{
              margin: '12px 0 0',
              fontSize: 'clamp(28px,3vw,36px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#F5F1E8',
            }}
          >
            {heading}
          </h1>

          {children}
        </div>
      </div>
    </div>
  );
}
