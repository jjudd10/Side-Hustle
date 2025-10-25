import type { Metadata } from 'next'
import { Inter, Crimson_Text } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const crimson = Crimson_Text({ subsets: ['latin'], display: 'swap', weight: ['400', '600', '700'], variable: '--font-crimson' })

export const metadata: Metadata = {
  title: 'Architectural Design Platform',
  description:
    'Discover luxurious architectural floorplans and interior design packages crafted for discerning clients.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable}`}>
      <body className="bg-gradient-luxury text-white font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
