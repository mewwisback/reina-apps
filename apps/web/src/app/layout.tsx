import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Zen_Kaku_Gothic_New, Zen_Old_Mincho } from 'next/font/google';
import '../styles/globals.css';
import '../styles/responsive-product.css';
import type { ReactNode } from 'react';

const bodyFont = Zen_Kaku_Gothic_New({
  variable: '--font-zen-kaku',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
});

const displayFont = Zen_Old_Mincho({
  variable: '--font-zen-mincho',
  subsets: ['latin'],
  weight: ['600', '700', '900'],
});

const monoFont = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Reina',
    template: '%s | Reina',
  },
  description: 'Reina app. Log in to manage your arena.',
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
