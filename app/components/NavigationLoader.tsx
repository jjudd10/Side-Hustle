'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import LogoTraceLoader from './LogoTraceLoader'
import '../loading.css'

// ── Timing knobs ─────────────────────────────────────────────────────────────
//
// SHOW_DELAY  — Wait this long before making the loader visible. If the page
//               is ready before this fires, the loader is skipped entirely.
//               Prevents a flash for fast navigations.
//
// MIN_MS      — Once visible, stay visible for at least this long. Matches one
//               full animation draw cycle so the animation is never cut short.
//               Must stay in sync with the longest tween in LogoTraceLoader.tsx
//               (currently TIMING.archDraw = 4 → 4000 ms).
//
// FADE_MS     — Duration of the CSS opacity fade-out when hiding.
//
const SHOW_DELAY = 150
const MIN_MS     = 4000
const FADE_MS    = 400

export default function NavigationLoader() {
  const pathname = usePathname()

  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // All timing state lives in refs so callbacks never go stale.
  const showTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownRef      = useRef(false)   // loader is currently rendered
  const pageReadyRef  = useRef(false)   // page finished loading
  const minDoneRef    = useRef(false)   // MIN_MS has elapsed since the loader appeared
  const leavingRef    = useRef(false)   // fade-out in progress
  const prevPathRef   = useRef(pathname)

  // ── startFadeOut ──────────────────────────────────────────────────────────
  // Begins a CSS opacity transition then unmounts. The leavingRef guard
  // prevents a second concurrent fade if endLoading fires multiple times
  // (e.g. both a pathname change and an app:loaded event in the same tick).
  const startFadeOut = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    fadeTimerRef.current = setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      shownRef.current   = false
      leavingRef.current = false
    }, FADE_MS)
  }, [])

  // ── endLoading ────────────────────────────────────────────────────────────
  // Called when the page is ready (pathname change or app:loaded event).
  // If the loader was never shown, cancels the pending show timer silently.
  // If it was shown, waits until MIN_MS elapses before fading out.
  const endLoading = useCallback(() => {
    if (!shownRef.current) {
      // Loader never appeared — just cancel the pending show timer.
      clearTimeout(showTimerRef.current!)
      showTimerRef.current = null
      return
    }
    pageReadyRef.current = true
    if (minDoneRef.current) startFadeOut()
  }, [startFadeOut])

  // ── beginLoading ──────────────────────────────────────────────────────────
  // Called when a navigation starts (link click or app:loading event).
  // Cancels any in-flight timers, then either resets the min timer (if the
  // loader is already visible) or schedules a delayed show (if not).
  const beginLoading = useCallback(() => {
    pageReadyRef.current = false
    minDoneRef.current   = false
    leavingRef.current   = false

    clearTimeout(showTimerRef.current!)
    clearTimeout(minTimerRef.current!)
    clearTimeout(fadeTimerRef.current!)
    showTimerRef.current = null

    if (shownRef.current) {
      // Already on screen — keep it there and restart the minimum timer.
      setLeaving(false)
      minTimerRef.current = setTimeout(() => {
        minDoneRef.current = true
        if (pageReadyRef.current) startFadeOut()
      }, MIN_MS)
      return
    }

    // Wait SHOW_DELAY before appearing so fast page loads skip the loader.
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null
      setLeaving(false)
      setVisible(true)
      shownRef.current = true

      // Start the minimum-display countdown from the moment it becomes visible.
      minTimerRef.current = setTimeout(() => {
        minDoneRef.current = true
        if (pageReadyRef.current) startFadeOut()
      }, MIN_MS)
    }, SHOW_DELAY)
  }, [startFadeOut])

  // ── Navigation click listener ─────────────────────────────────────────────
  // Detects any internal link click to start loading before Next.js fires
  // its Suspense boundary.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        /^https?:/.test(href) ||
        href.startsWith('mailto:')
      ) return
      beginLoading()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [beginLoading])

  // ── Suspense / loading.tsx signals ────────────────────────────────────────
  // loading.tsx dispatches app:loading on mount and app:loaded on unmount.
  // This lets the loader survive loading.tsx being unmounted by Next.js —
  // the animation lives here in the layout and keeps running.
  useEffect(() => {
    const onStart = () => beginLoading()
    const onEnd   = () => endLoading()
    window.addEventListener('app:loading', onStart)
    window.addEventListener('app:loaded',  onEnd)
    return () => {
      window.removeEventListener('app:loading', onStart)
      window.removeEventListener('app:loaded',  onEnd)
    }
  }, [beginLoading, endLoading])

  // ── Pathname change = new page is ready ───────────────────────────────────
  useEffect(() => {
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname
    endLoading()
  }, [pathname, endLoading])

  // ── Global cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(showTimerRef.current!)
      clearTimeout(minTimerRef.current!)
      clearTimeout(fadeTimerRef.current!)
    }
  }, [])

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
