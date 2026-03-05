import './global.css'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import logoMark from '../lib/Logo - Wireframe - Low Detail - v1.svg'

export const metadata: Metadata = {
  title: 'Interior Plans — Modern Floorplans & Design',
  description: 'Browse premium floorplans and interior design packages tailored to your lifestyle.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link className="brand" href="/">
             
              <Image
                className="brand-mark"
                src={logoMark}
                alt="Brand Logo"
                width={60}
                height={60}
                priority
              />
             <span className="brand-name">Home in Time</span>
            </Link>
            <nav className="nav">
              <Link href="/home">Home</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>© {new Date().getFullYear()} Interior Plans. All rights reserved.</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
