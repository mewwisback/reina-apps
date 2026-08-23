'use client';

interface SocialButtonsProps {
  size?: 'md' | 'lg';
}

const PROVIDERS = [
  { name: 'Google', color: '#4F8FE8' },
  { name: 'Twitter', color: '#F5F1E8' },
  { name: 'Discord', color: '#8C6FD8' },
];

export function SocialButtons({ size = 'md' }: SocialButtonsProps) {
  const gap = size === 'lg' ? 10 : 10;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: gap, marginTop: 32 }}>
      {PROVIDERS.map((p) => (
        <button
          key={p.name}
          type="button"
          className="social-btn"
          style={{ ['--social-color' as string]: p.color }}
          onClick={(e) => e.preventDefault()}
        >
          CONTINUE WITH {p.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}