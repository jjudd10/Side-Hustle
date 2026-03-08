import './global.css'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import logoMark from '../lib/Logo - Wireframe - Low Detail - v1.svg'

export const metadata: Metadata = {
  title: 'Home in Time - Premium Floorplans',
  description: 'Browse floorplans tailored to your lifestyle.',
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
                width={70}
                height={70}
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
            <p style={{ fontSize: '0.90rem' }}> Questions? Email us at info@homeintime.cc </p>
            <p>© 2025 - {new Date().getFullYear()} Strictly Business L.C. All rights reserved.</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
