import '../styles/globals.css';
import '../styles/module1.css';
import '../styles/module2.css';
import '../styles/module3.css';
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
      <Toaster />
    </ClerkProvider>
  )
}
