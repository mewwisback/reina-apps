import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import type { ReactNode } from 'react';

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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
