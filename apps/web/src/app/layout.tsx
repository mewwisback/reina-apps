import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';
import '../styles/responsive-product.css';
import type { ReactNode } from 'react';

const bodyFont = localFont({
  src: './fonts/zen-kaku-gothic-new-latin.woff2',
  variable: '--font-zen-kaku',
  weight: '400 900',
  display: 'swap',
});

const displayFont = localFont({
  src: './fonts/zen-old-mincho-latin.woff2',
  variable: '--font-zen-mincho',
  weight: '600 900',
  display: 'swap',
});

const monoFont = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  variable: '--font-jetbrains-mono',
  weight: '400 700',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Reina',
    template: '%s | Reina',
  },
  description: 'Reina card battles. Build your deck, collect heroes, and enter the arena.',
};

export const viewport: Viewport = {
  themeColor: '#0D0B10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
