import './globals.css';

import type { Metadata } from 'next';
import Script from 'next/script';

import Header from '@/components/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://martialmovies.com'),
  openGraph: {
    siteName: 'Martial Arts Movies',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script src="/stats.js" data-website-id={process.env.UMAMI_WEBSITE_ID} />
        <Header />
        <main className="container mx-auto p-8">{children}</main>
      </body>
    </html>
  );
}
