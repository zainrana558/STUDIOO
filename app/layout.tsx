import '../styles/globals.css';
import { PageTransition } from '../components/Layout/PageTransition';
import { ResponsiveLayout } from '../components/Layout/ResponsiveLayout';
import { MobileBottomNav } from '../components/Layout/MobileBottomNav';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { Space_Grotesk, Creepster, Orbitron, Fredoka, Playfair_Display } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const creepster = Creepster({ subsets: ['latin'], weight: '400', variable: '--font-creepster' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const fredokaOne = Fredoka({ subsets: ['latin'], weight: '400', variable: '--font-fredoka-one' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });

export const metadata = {
  title: 'Lumina — Next-Gen Streaming',
  description: 'An elite, high-performance media streaming platform.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${creepster.variable} ${orbitron.variable} ${fredokaOne.variable} ${playfairDisplay.variable}`}>
      <body className="bg-gray-950 text-white">
        <ThemeProvider>
          <ResponsiveLayout>
            <PageTransition>
              {children}
            </PageTransition>
          </ResponsiveLayout>
        </ThemeProvider>
        <MobileBottomNav />
      </body>
    </html>
  );
}
