'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import './app-shell.css';
import './product-layout.css';

const NAV_ITEMS = [
  { href: '/dashboard', key: 'D', label: 'Dashboard' },
  { href: '/quests', key: 'Q', label: 'Quests' },
  { href: '/arena', key: 'A', label: 'Arena' },
  { href: '/deck-builder', key: 'DB', label: 'Deck Builder' },
  { href: '/shop', key: 'S', label: 'Shop' },
  { href: '/leaderboard', key: 'L', label: 'Leaderboard' },
  { href: '/wiki', key: 'W', label: 'Wiki' },
  { href: '/docs', key: 'Do', label: 'Docs' },
] as const;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState('Kaiba99');
  const [usernameInput, setUsernameInput] = useState('Kaiba99');
  const [walletInput, setWalletInput] = useState('');
  const [enteringArena, setEnteringArena] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const expanded = !collapsed;

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const syncLayout = () => setMobileLayout(query.matches);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    syncLayout();
    query.addEventListener('change', syncLayout);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      query.removeEventListener('change', syncLayout);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-mobile-header">
        <Link href="/" className="app-mobile-brand" aria-label="Reina home">
          <span className="app-mobile-mark">R</span>
          <span>REINA</span>
        </Link>
        <button
          className="app-mobile-menu"
          type="button"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          aria-controls="app-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden="true">{mobileOpen ? '×' : 'Menu'}</span>
        </button>
      </header>
      {mobileOpen && <button className="app-nav-backdrop" data-nav-backdrop type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      {/* ============ SIDEBAR ============ */}
      <aside
        id="app-navigation"
        data-app-sidebar
        data-collapsed={collapsed ? 'true' : 'false'}
        data-mobile-open={mobileOpen ? 'true' : 'false'}
        aria-hidden={mobileLayout && !mobileOpen ? true : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px', minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: '#E03C4E',
                clipPath: 'polygon(30% 0,100% 0,100% 70%,70% 100%,0 100%,0 30%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 15, color: '#0F0C16' }}>R</span>
            </div>
            {expanded && (
              <div style={{ fontFamily: "'Zen Old Mincho', serif", fontWeight: 700, letterSpacing: '.28em', fontSize: 13, color: '#EDE7DC', whiteSpace: 'nowrap' }}>
                REINA
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              cursor: 'pointer',
              flex: 'none',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'rgba(237,231,220,.5)',
              border: '1px solid rgba(237,231,220,.2)',
            }}
          >
            {collapsed ? '\u203A' : '\u2039'}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {expanded && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.24em', color: 'rgba(237,231,220,.35)', padding: '0 10px 4px', whiteSpace: 'nowrap' }}>
              MENU
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            const isDash = item.href === '/dashboard';
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  setMobileOpen(false);
                  if (item.href !== '/arena' || active || enteringArena) return;
                  event.preventDefault();
                  setEnteringArena(true);
                  window.setTimeout(() => router.push(item.href), 320);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 12px',
                  whiteSpace: 'nowrap',
                  background: active ? '#E03C4E' : 'transparent',
                  clipPath: 'polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))',
                  color: active ? '#0F0C16' : 'rgba(237,231,220,.7)',
                  textDecoration: 'none',
                  transition: 'background .2s,color .2s',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(224,60,78,.1)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {!expanded && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 900, flex: 'none', color: active ? '#0F0C16' : 'rgba(237,231,220,.7)' }}>
                    {item.key}
                  </div>
                )}
                {expanded && (
                  <div style={{ fontSize: 13.5, color: active ? '#0F0C16' : 'inherit' }}>{item.label}</div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* profile card */}
        <div
          style={{
            marginTop: 'auto',
            position: 'relative',
            overflow: 'hidden',
            padding: '14px 14px 14px 16px',
            background: '#100C14',
            clipPath: 'polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))',
            borderTop: '2px solid #E8B45C',
          }}
        >
          <button
            onClick={() => setProfileOpen(true)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(160deg,#E03C4E,#0F0C16 65%)',
                border: '1.5px solid #E03C4E',
                clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)',
                flex: 'none',
              }}
            />
            {expanded && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#F5F1E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {username}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#E8B45C' }}>
                  GOLD III, 1,840 MMR
                </div>
              </div>
            )}
          </button>
          {expanded && (
            <>
              <div style={{ marginTop: 10, height: 4, background: 'rgba(237,231,220,.12)', clipPath: 'polygon(0 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>
                <div style={{ height: '100%', width: '64%', background: '#E8B45C' }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, letterSpacing: '.06em', color: 'rgba(237,231,220,.4)', marginTop: 5, whiteSpace: 'nowrap' }}>
                640 / 1000 EXP TO GOLD II
              </div>
            </>
          )}
        </div>
      </aside>

      {enteringArena && (
        <div className="arena-route-exit" role="status" aria-label="Entering Arena" aria-live="polite">
          <img src="/arena/loading/tail-spin.svg" alt="" aria-hidden="true" />
          <span>ENTERING ARENA</span>
        </div>
      )}

      {/* ============ PROFILE MODAL ============ */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,6,11,.72)',
            backdropFilter: 'blur(3px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 380,
              maxWidth: '100%',
              background: '#100C14',
              borderTop: '3px solid #E03C4E',
              clipPath: 'polygon(0 0,100% 0,100% 100%,18px 100%,0 calc(100% - 18px))',
            }}
          >
            <button
              onClick={() => setProfileOpen(false)}
              style={{
                position: 'absolute',
                right: 14,
                top: 12,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: 'rgba(237,231,220,.5)',
                background: 'none',
                border: 'none',
              }}
            >
              &times;
            </button>
            <div style={{ padding: '26px 24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: 'linear-gradient(160deg,#E03C4E,#0F0C16 65%)', border: '2px solid #E03C4E', clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)', flex: 'none' }} />
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.2em', color: 'rgba(237,231,220,.5)' }}>DUELIST PROFILE</div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: '#F5F1E8', marginTop: 2 }}>{username}</div>
                </div>
              </div>

              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.16em', color: 'rgba(237,231,220,.5)' }}>USERNAME</div>
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ marginTop: 8, width: '100%', boxSizing: 'border-box', background: '#0D0A10', border: '1px solid rgba(237,231,220,.2)', color: '#F5F1E8', fontSize: 13, padding: '11px 12px', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.16em', color: 'rgba(237,231,220,.5)' }}>WALLET ADDRESS</div>
                <input
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x... or paste address"
                  style={{ marginTop: 8, width: '100%', boxSizing: 'border-box', background: '#0D0A10', border: '1px solid rgba(237,231,220,.2)', color: '#F5F1E8', fontSize: 12.5, padding: '11px 12px', fontFamily: "'JetBrains Mono', monospace" }}
                />
                {walletInput && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: '#3FA893', marginTop: 6 }}>&#10003; WALLET LINKED</div>
                )}
              </div>

              <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, lineHeight: 1.6, color: '#E8B45C', background: 'rgba(232,180,92,.08)', borderLeft: '2px solid #E8B45C', padding: '8px 10px' }}>
                WARNING: username and wallet address are permanent once set. Choose carefully, neither can be changed after saving.
              </div>

              <button
                onClick={() => {
                  setUsername(usernameInput || username);
                  setProfileOpen(false);
                }}
                style={{
                  cursor: 'pointer',
                  marginTop: 16,
                  width: '100%',
                  textAlign: 'center',
                  background: '#F5F1E8',
                  color: '#0F0C16',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '.12em',
                  padding: 13,
                  clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 10px) 100%,0 100%)',
                }}
              >
                SAVE CHANGES
              </button>

              <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(237,231,220,.1)' }}>
                <Link href="/login" style={{ display: 'block', textAlign: 'center', color: '#E03C4E', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '.14em' }}>
                  LOG OUT
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MAIN ============ */}
      <main className="app-main" data-route={pathname} style={{ flex: 1, minWidth: 0, padding: '0 0 60px' }}>{children}</main>
    </div>
  );
}