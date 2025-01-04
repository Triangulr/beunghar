import '../styles/globals.css';
import '../styles/module1.css';
import '../styles/module2.css';
import '../styles/module3.css';
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const trackVisit = async () => {
      // Generate a visitor ID if not exists
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('visitorId', visitorId);
      }

      try {
        await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visitorId }),
        });
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <main className={inter.className}>
        <Component {...pageProps} />
        <SpeedInsights />
      </main>
      <Toaster />
    </ClerkProvider>
  )
}
