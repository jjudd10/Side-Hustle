'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION TIMING
// All values are in seconds.
// ─────────────────────────────────────────────────────────────────────────────
const TIMING = {
  archDraw:    4,
  outlineDraw: 4,
  lineDraw:    4,
  diagDraw:    4,
  centerDraw:  4,
  baseDraw:    4,
  lineStagger: 0.12,
  diagStagger: 0.10,
  hold:        0,
  drawEase:    'power2.inOut',
  fadeIn:      0.35,
}

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT GROUPS
// ─────────────────────────────────────────────────────────────────────────────
const GROUP = {
  archOuter:  '[data-group="arch-outer"]',
  archMid:    '[data-group="arch-mid"]',
  outline:    '[data-group="outline"]',
  base:       '[data-group="base"]',
  hLines:     '[data-group="h-line"]',
  diagLines:  '[data-group="diag"]',
  centerLine: '[data-group="center"]',
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG — embedded so the loader renders with zero network round-trips.
// ─────────────────────────────────────────────────────────────────────────────
const SVG_MARKUP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 259.2 354.494" aria-hidden="true">

  <!-- ── Outer arches (left + right) ───────────────────────────────────────-->
  <path data-group="arch-outer" d="M47.36,299.726h-1V109.914c0-46.843,37.383-84.952,83.333-84.952v1c-45.398,0-82.333,37.661-82.333,83.952v189.812Z"/>
  <path data-group="arch-outer" d="M213.019,299.726h-1V109.914c0-46.292-36.931-83.952-82.326-83.952v-1c45.946,0,83.326,38.109,83.326,84.952v189.812Z"/>

  <!-- ── Middle arch ────────────────────────────────────────────────────────-->
  <path data-group="arch-mid" d="M204.722,110.088c.25-20.107-8.202-40.168-23.186-55.04-14.286-14.179-33.244-22.104-51.926-21.722v.013c-18.71-.374-37.606,7.541-51.892,21.715-14.989,14.872-23.441,34.923-23.19,54.986-.014.375-.012,59.74-.008,131.42.001,30.572.003,55.216,0,58.266h1c.002-3.049,0-27.692,0-58.266-.003-55.15-.007-130.681.008-131.408-.247-19.818,8.098-39.605,22.895-54.288,14.1-13.99,32.752-21.82,51.188-21.425l.01-.506.01.493c18.482-.377,37.107,7.444,51.202,21.432,14.793,14.682,23.136,34.48,22.892,54.365.058,1.029.032,59.144.009,110.416-.017,38.744-.033,75.34-.008,79.19l1-.006c-.025-3.848-.009-40.441.008-79.184.035-77.679.04-110.205-.011-110.452Z"/>

  <!-- ── Diagonal cross lines ───────────────────────────────────────────────-->
  <rect data-group="diag" x="99.15"   y="64.38"  width="1.005" height="66.867" transform="translate(-31.775 144.984) rotate(-64.21)"/>
  <rect data-group="diag" x="112.018" y="49.025" width="1.006" height="68.025" transform="translate(-26.562 68.468)  rotate(-30.446)"/>
  <rect data-group="diag" x="126.431" y="97.336" width="66.753" height="1.005" transform="translate(-26.65  79.285)  rotate(-25.794)"/>
  <rect data-group="diag" x="113.063" y="82.605" width="67.954" height="1.006" transform="translate(.696   167.436) rotate(-59.427)"/>

  <!-- ── Building outline ───────────────────────────────────────────────────-->
  <path data-group="outline" d="M196.5,292.718H62.886V111.948c0-37.851,29.97-68.645,66.807-68.645s66.807,30.794,66.807,68.645v180.77ZM63.886,291.718h131.614V111.948c0-37.299-29.521-67.645-65.807-67.645s-65.807,30.345-65.807,67.645v179.77Z"/>

  <!-- ── Base / plinth ──────────────────────────────────────────────────────-->
  <path data-group="base" d="M208.185,322.44h-.238c-38.813-.078-117.893-.078-156.695,0h-.238s-.151-.183-.151-.183c-7.691-9.332-13.1-13.086-26.307-18.258l-.319-.126v-4.649h210.727v4.649l-.319.126c-13.207,5.172-18.616,8.926-26.307,18.258l-.151.184ZM129.597,321.377c29.354,0,58.707.019,78.116.056,7.593-9.174,13.314-13.153,26.245-18.245v-2.958H25.243v2.958c12.931,5.092,18.652,9.071,26.245,18.245,19.405-.037,48.755-.056,78.109-.056Z"/>

  <!-- ── Vertical center line ───────────────────────────────────────────────-->
  <rect data-group="center" x="129.253" y="43.804"  width="1.006"   height="248.414"/>

  <!-- ── Horizontal floor lines ─────────────────────────────────────────────-->
  <rect data-group="h-line" x="63.386" y="111.857" width="132.614" height="1.006"/>
  <rect data-group="h-line" x="63.386" y="169.687" width="132.614" height="1.006"/>
  <rect data-group="h-line" x="63.386" y="234.283" width="132.614" height="1.006"/>

</svg>
`

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LogoTraceLoader() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const svgContainer = svgRef.current
    if (!svgContainer) return

    const svg = svgContainer.querySelector('svg')
    if (!svg) return

    // ── Pre-compute all path lengths in one pass ──────────────────────────
    //
    // getTotalLength() causes a layout reflow on each call. We batch them here
    // once at mount and store results in a WeakMap so the animation loop never
    // needs to touch the DOM for measurements.
    const allElements = Array.from(svg.querySelectorAll<SVGGeometryElement>('path, rect'))
    const lengthOf = new WeakMap<SVGGeometryElement, number>()
    allElements.forEach(el => {
      lengthOf.set(el, el.getTotalLength ? el.getTotalLength() : 200)
    })

    // Set the initial (hidden) stroke state for every element once.
    allElements.forEach(el => {
      const len = lengthOf.get(el)!
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
    })

    // ── Pre-cache group selectors ─────────────────────────────────────────
    //
    // Previously these were re-queried on every loop cycle inside playLoop().
    // Querying once here eliminates that repeated DOM work entirely.
    const q = (sel: string) => Array.from(svg.querySelectorAll<SVGGeometryElement>(sel))
    const groups = {
      archOuter:  q(GROUP.archOuter),
      archMid:    q(GROUP.archMid),
      outline:    q(GROUP.outline),
      hLines:     q(GROUP.hLines),
      diagLines:  q(GROUP.diagLines),
      centerLine: q(GROUP.centerLine),
      base:       q(GROUP.base),
    }

    // GSAP function-based "from" value: resolves each element's pre-computed
    // length without touching the DOM. Called once per element when the tween
    // is first activated; on repeat the stored value is used directly.
    const fromLength = (_i: number, el: Element) =>
      lengthOf.get(el as SVGGeometryElement) ?? 200

    // ── Fade the wrapper in ───────────────────────────────────────────────
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0 },
      { opacity: 1, duration: TIMING.fadeIn, ease: 'power1.out' }
    )

    // ── Single repeating timeline ─────────────────────────────────────────
    //
    // Previously a manual playLoop() function rebuilt the entire timeline on
    // every cycle (new Timeline object, forEach gsap.set() resets, re-queried
    // selectors). That rebuild caused a measurable stutter at every loop point.
    //
    // With repeat: -1, GSAP handles the loop entirely internally — no rebuild,
    // no DOM queries, no style invalidations between cycles. The fromTo tweens
    // ensure each repeat correctly starts from the "fully hidden" state.
    const tl = gsap.timeline({ repeat: -1, repeatDelay: TIMING.hold })

    tl.fromTo(groups.archOuter,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.archDraw, ease: TIMING.drawEase, stagger: 0 },
      0
    )
    tl.fromTo(groups.archMid,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.archDraw, ease: TIMING.drawEase },
      0
    )
    tl.fromTo(groups.outline,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.outlineDraw, ease: TIMING.drawEase },
      0
    )
    tl.fromTo(groups.hLines,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.lineDraw, ease: 'power1.out', stagger: TIMING.lineStagger },
      0
    )
    tl.fromTo(groups.diagLines,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.diagDraw, ease: TIMING.drawEase, stagger: TIMING.diagStagger },
      0
    )
    tl.fromTo(groups.centerLine,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.centerDraw, ease: 'power1.out' },
      0
    )
    tl.fromTo(groups.base,
      { strokeDashoffset: fromLength },
      { strokeDashoffset: 0, duration: TIMING.baseDraw, ease: TIMING.drawEase },
      0
    )

    return () => { tl.kill() }
  }, [])

  return (
    <div ref={wrapperRef} className="logo-loader" role="status" aria-label="Loading">
      {/* dangerouslySetInnerHTML is safe here — SVG_MARKUP is a hardcoded
          string in this file, not derived from user input. */}
      <div
        ref={svgRef}
        className="logo-loader-mark"
        dangerouslySetInnerHTML={{ __html: SVG_MARKUP }}
      />
      <span className="logo-loader-text" aria-hidden="true">Loading</span>
    </div>
  )
}
