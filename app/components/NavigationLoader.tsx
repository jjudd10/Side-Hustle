'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import LogoTraceLoader from './LogoTraceLoader'
import '../loading.css'

// Minimum milliseconds the loader stays visible after a navigation click.
// Even if the page loads in 200ms, the animation plays for the full MIN_MS.
const MIN_MS = 2200
// CSS fade-out duration (matches the transition below).
const FADE_MS = 400

export default function NavigationLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const pageReadyRef = useRef(false)
  const minDoneRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const prevPathRef = useRef(pathname)

  const startFadeOut = () => {
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      setLeaving(false)
    }, FADE_MS)
  }

  // Show loader on any internal link click (navigation start).
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      // Ignore anchors, external links, mailto links.
      if (!href || href.startsWith('#') || /^https?:/.test(href) || href.startsWith('mailto:')) return

      pageReadyRef.current = false
      minDoneRef.current = false
      setLeaving(false)
      setVisible(true)

      // Minimum display timer — hides only after both conditions are met.
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        minDoneRef.current = true
        if (pageReadyRef.current) startFadeOut()
      }, MIN_MS)
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the pathname changes the new page is ready — hide if min time is also done.
  useEffect(() => {
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname
    pageReadyRef.current = true
    if (minDoneRef.current) startFadeOut()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <LogoTraceLoader />
    </div>
  )
}