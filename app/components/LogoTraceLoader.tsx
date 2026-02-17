'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

const TRACE_SELECTOR =
  'path, line, polyline, polygon, circle, rect, ellipse'

const ANIMATION_CONFIG = {
  // Set to false while testing if your OS/browser has reduced motion enabled.
  respectReducedMotion: false,
  drawDuration: 3,
  holdDuration: 0.7,
  elementStagger: 0.03,
  ease: 'power1.inOut',
} as const

export default function LogoTraceLoader() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [svgMarkup, setSvgMarkup] = useState<string>('')
  const [isPrepared, setIsPrepared] = useState(false)

  const svgFile = 'Logo - Wireframe - Most Detail - v1.svg'
  const svgUrl = useMemo(
    () => `/api/logo-svg?file=${encodeURIComponent(svgFile)}`,
    [svgFile]
  )

  useLayoutEffect(() => {
    let isActive = true

    const loadSvg = async () => {
      try {
        const response = await fetch(svgUrl)
        if (!response.ok) {
          return
        }
        const text = await response.text()
        if (isActive) {
          setSvgMarkup(text)
        }
      } catch {
        // Ignore fetch errors; loader will remain blank.
      }
    }

    loadSvg()

    return () => {
      isActive = false
    }
  }, [svgUrl])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const svg = container.querySelector('svg')
    if (!svg) {
      return
    }

    const shouldReduceMotion =
      ANIMATION_CONFIG.respectReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const elements = Array.from(
      svg.querySelectorAll<SVGGeometryElement>(TRACE_SELECTOR)
    )

    if (!elements.length) {
      return
    }

    const drawables = elements
      .map((element) => {
        let length = 0
        try {
          length = element.getTotalLength()
        } catch {
          length = 0
        }
        return {
          element,
          length: Math.max(length, 1),
        }
      })
      .filter((item) => item.length > 0)

    if (!drawables.length) {
      return
    }

    drawables.forEach(({ element, length }) => {
      element.setAttribute('stroke-dasharray', `${length} ${length}`)
      element.setAttribute('stroke-dashoffset', `${length}`)
    })

    setIsPrepared(true)

    if (shouldReduceMotion) {
      drawables.forEach(({ element }) => {
        element.setAttribute('stroke-dashoffset', '0')
      })
      return
    }

    const timeline = gsap.timeline({ repeat: -1 })
    const drawableElements = drawables.map((item) => item.element)

    timeline.to(drawableElements, {
      attr: { 'stroke-dashoffset': 0 },
      duration: ANIMATION_CONFIG.drawDuration,
      ease: ANIMATION_CONFIG.ease,
      stagger: ANIMATION_CONFIG.elementStagger,
    })
    timeline.to({}, { duration: ANIMATION_CONFIG.holdDuration })
    timeline.add(() => {
      drawables.forEach(({ element, length }) => {
        element.setAttribute('stroke-dashoffset', `${length}`)
      })
    })

    return () => {
      timeline.kill()
    }
  }, [svgMarkup])

  return (
    <div className="logo-loader" role="status" aria-live="polite">
      <div
        ref={containerRef}
        className="logo-loader-mark"
        style={{ visibility: isPrepared ? 'visible' : 'hidden' }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      <span className="logo-loader-text">Loading</span>
    </div>
  )
}
