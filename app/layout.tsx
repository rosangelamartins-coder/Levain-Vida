import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Levain Naturalis Sourdough Companion',
  description: 'An elegant sourdough and long natural fermentation guide with scaling calculators, starter simulator, collection receipts, and AI baking buddy.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="font-sans antialiased bg-[#fcfaf7] text-[#4a3f35]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

