import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'C³ Athlete Tracker - Counter Culture Collective',
  description: 'Track achievements, manage teams, and excel in your athletic journey',
  keywords: ['athlete tracking', 'sports management', 'team coaching', 'achievement tracking'],
  authors: [{ name: 'Counter Culture Collective' }],
  openGraph: {
    title: 'C³ Athlete Tracker',
    description: 'Track achievements, manage teams, and excel in your athletic journey',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C³ Athlete Tracker',
    description: 'Track achievements, manage teams, and excel in your athletic journey',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}