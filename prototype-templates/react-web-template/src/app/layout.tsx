import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'PROJECT_NAME_PLACEHOLDER',
    template: '%s | PROJECT_NAME_PLACEHOLDER',
  },
  description: 'A modern web application built with Next.js',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'PROJECT_AUTHOR_PLACEHOLDER' }],
  creator: 'PROJECT_AUTHOR_PLACEHOLDER',
  metadataBase: new URL('PROJECT_URL_PLACEHOLDER'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'PROJECT_URL_PLACEHOLDER',
    title: 'PROJECT_NAME_PLACEHOLDER',
    description: 'A modern web application built with Next.js',
    siteName: 'PROJECT_NAME_PLACEHOLDER',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROJECT_NAME_PLACEHOLDER',
    description: 'A modern web application built with Next.js',
    creator: '@PROJECT_TWITTER_PLACEHOLDER',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}