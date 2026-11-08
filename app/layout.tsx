import type { Metadata } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/geist';
import './globals.css';
import './cards.css';
import './case.css';
import './polish.css';
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'), title: { default: 'CrescenDev — The Ember Studio', template: '%s · CrescenDev' }, description: 'Business systems and AI-powered tools. Explore five projects inside the CrescenDev Ember Studio.', openGraph: { title: 'CrescenDev — The Ember Studio', description: 'Real problems. Thoughtful software.', images: ['/images/portrait.jpg'] } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
