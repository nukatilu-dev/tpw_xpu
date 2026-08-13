import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { I18nProvider } from '@/context/I18nContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'THE PORTAL WE — TPW',
  description: 'The Portal We — Your enterprise gateway to a connected ecosystem of productivity, AI, and collaboration tools.',
  metadataBase: new URL('https://theportalwe.com'),
  openGraph: {
    title: 'THE PORTAL WE',
    description: 'Enterprise SaaS platform for productivity and collaboration.',
    images: [{ url: '/tpw_new_0.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
