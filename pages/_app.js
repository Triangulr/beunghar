import '../styles/globals.css';
import '../styles/module1.css';
import '../styles/module2.css';
import '../styles/module3.css';
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <main className={inter.className}>
        <Component {...pageProps} />
        <SpeedInsights />
        {/* Cloudflare Web Analytics */}
        <Script
          id="cloudflare-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "60ef3d5801454111a434da853fddee03"}'
        />
      </main>
      <Toaster />
    </ClerkProvider>
  )
}
