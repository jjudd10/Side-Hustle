'use client'

import { useEffect } from 'react'
import gsap from 'gsap'

const FILL_BG     = '#f7f0e2'
const TEXT_FILLED = '#3e3e3e'
const TEXT_RESET  = '#f7f0e2'

const prepared = new WeakSet<HTMLElement>()

function getPosPercent(e: MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * 100,
    y: ((e.clientY - r.top) / r.height) * 100,
  }
}

function prepare(btn: HTMLElement) {
  if (prepared.has(btn)) return
  prepared.add(btn)

  if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative'
  btn.style.overflow = 'hidden'

  const fill = document.createElement('span')
  fill.className = 'btn-hover-fill'
  Object.assign(fill.style, {
    position:      'absolute',
    inset:         '0',
    background:    FILL_BG,
    borderRadius:  'inherit',
    zIndex:        '0',
    pointerEvents: 'none',
    clipPath:      'circle(0% at 50% 50%)',
    willChange:    'clip-path',
  })
  btn.insertBefore(fill, btn.firstChild)

  // Lift existing children above the fill layer
  Array.from(btn.childNodes).forEach((node) => {
    if (node === fill) return
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent?.trim()) return
      const wrap = document.createElement('span')
      wrap.style.cssText = 'position:relative;z-index:1;'
      btn.insertBefore(wrap, node)
      wrap.appendChild(node)
    } else if (node instanceof HTMLElement) {
      node.style.position = 'relative'
      node.style.zIndex   = '1'
    }
  })
}

export function ButtonHoverEffect() {
  useEffect(() => {
    // Track bound elements in memory — never touch the DOM for tracking
    const bound = new WeakSet<HTMLElement>()

    function onEnter(e: Event) {
      const btn = e.currentTarget as HTMLElement
      if ((btn as HTMLButtonElement).disabled) return

      prepare(btn)
      const fill = btn.querySelector<HTMLElement>('.btn-hover-fill')!
      const { x, y } = getPosPercent(e as MouseEvent, btn)

      gsap.killTweensOf(fill)
      gsap.killTweensOf(btn)
      gsap.set(fill, { clipPath: `circle(0% at ${x}% ${y}%)` })
      gsap.to(fill,  { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 0.85, ease: 'power2.out' })
      gsap.to(btn,   { color: TEXT_FILLED, duration: 0.25, ease: 'none' })
    }

    function onLeave(e: Event) {
      const btn = e.currentTarget as HTMLElement
      const fill = btn.querySelector<HTMLElement>('.btn-hover-fill')
      if (!fill) return

      const { x, y } = getPosPercent(e as MouseEvent, btn)

      gsap.killTweensOf(fill)
      gsap.killTweensOf(btn)
      gsap.to(fill, { clipPath: `circle(0% at ${x}% ${y}%)`, duration: 0.6, ease: 'power2.in' })
      gsap.to(btn,  {
        color: TEXT_RESET,
        duration: 0.4,
        ease: 'none',
        onComplete() { gsap.set(btn, { clearProps: 'color' }) },
      })
    }

    function bind() {
      document.querySelectorAll<HTMLElement>('.btn.btn-primary').forEach((btn) => {
        if (bound.has(btn)) return
        bound.add(btn)
        btn.addEventListener('mouseenter', onEnter)
        btn.addEventListener('mouseleave', onLeave)
      })
    }

    bind()

    const observer = new MutationObserver(bind)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
