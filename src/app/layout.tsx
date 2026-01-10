import './globals.css';

import type { Metadata } from 'next';
import { DM_Sans, Poppins } from 'next/font/google';
import Script from 'next/script';

import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://martialmovies.com'),
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
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${poppins.variable}`}>
      <body>
        {process.env.NODE_ENV === 'production' && (
          <Script src="/stats.js" data-website-id={process.env.UMAMI_WEBSITE_ID} />
        )}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="container mx-auto px-6 py-8 sm:px-8 lg:px-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
