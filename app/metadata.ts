import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: 'DStech - Knowledge Hub',
    template: '%s | DStech'
  },
  description: 'A comprehensive knowledge base for data scientists and developers. Share code, datasets, and insights.',
  keywords: ['data science', 'programming', 'knowledge base', 'code sharing', 'datasets', 'collaboration'],
  authors: [{ name: 'DStech Team' }],
  creator: 'DStech',
  publisher: 'DStech',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'DStech - Knowledge Hub',
    description: 'A comprehensive knowledge base for data scientists and developers',
    siteName: 'DStech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DStech - Knowledge Hub',
    description: 'A comprehensive knowledge base for data scientists and developers',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b1e' }
  ],
}