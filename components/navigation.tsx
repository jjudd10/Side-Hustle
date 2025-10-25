'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavLink = {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/modern', label: 'Modern' },
  { href: '/traditional', label: 'Traditional' },
  { href: '/luxury', label: 'Luxury' },
  { href: '#catalog', label: 'Catalog' },
]

export function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-secondary-800/60 bg-black/30">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-serif tracking-[0.35em] uppercase text-accent-gold">
          Atelier
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-[0.25em] text-secondary-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/consultation"
            className="rounded-full bg-accent-gold px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-luxury transition hover:bg-accent-bronze"
          >
            Consultation
          </Link>
        </div>
        <button
          className="md:hidden text-secondary-200"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
          <div className="flex h-6 w-6 items-center justify-center">
            <div className="relative h-4 w-4">
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 transform rounded-full bg-secondary-200 transition ${
                  open ? 'rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 transform rounded-full bg-secondary-200 transition ${
                  open ? '-rotate-45' : 'translate-y-1'
                }`}
              />
              {!open && (
                <span className="absolute left-0 block h-0.5 w-full translate-y-2 rounded-full bg-secondary-200 transition" />
              )}
            </div>
          </div>
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="border-t border-secondary-800/60 bg-black/70 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.25em] text-secondary-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/consultation"
              onClick={() => setOpen(false)}
              className="rounded-full bg-accent-gold px-5 py-2 text-center text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-luxury transition hover:bg-accent-bronze"
            >
              Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
