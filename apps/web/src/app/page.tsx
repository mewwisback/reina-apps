import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        background: '#0D0B10',
        color: '#EDE7DC',
        textAlign: 'center',
        padding: 40,
      }}
    >
      <div className="reina-logo">
        <div className="reina-logo-mark">
          <span>R</span>
        </div>
        <div className="reina-logo-word">REINA</div>
      </div>
      <h1
        style={{
          fontFamily: "'Zen Old Mincho', serif",
          fontWeight: 700,
          fontSize: 'clamp(28px,4vw,44px)',
          letterSpacing: '0.04em',
          color: '#F5F1E8',
          margin: 0,
        }}
      >
        Enter the arena
      </h1>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: 'rgba(237,231,220,.55)' }}>
        LOG IN OR CREATE A DUELIST ACCOUNT
      </p>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <Link href="/login" className="btn-crimson" style={{ padding: '14px 32px' }}>
          LOG IN
        </Link>
        <Link
          href="/signup"
          style={{
            padding: '14px 32px',
            border: '1px solid rgba(237,231,220,.35)',
            clipPath: 'polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px))',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#EDE7DC',
          }}
        >
          SIGN UP
        </Link>
      </div>
    </div>
  );
}
