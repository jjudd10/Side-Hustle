'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION TIMING
// These are the primary knobs. Change a number, save, and refresh to experiment.
// All values are in seconds.
// ─────────────────────────────────────────────────────────────────────────────
const TIMING = {
  // How long each stroke takes to travel from its start point to its end.
  // Raise archDraw for a slower, more architectural reveal.
  archDraw:    4,   // outer arches + middle arch
  outlineDraw: 4,   // main rectangular building silhouette
  lineDraw:    4,  // horizontal floor-level lines
  diagDraw:    4,  // diagonal cross / hash lines
  centerDraw:  4,   // single vertical center line
  baseDraw:    4,   // base platform at the bottom

  // Stagger = delay between the start of each element within a group.
  // 0 = all draw simultaneously; 0.15 = distinctly one after another.
  lineStagger: 0.12,  // between each horizontal floor line  (3 lines)
  diagStagger: 0.10,  // between each diagonal cross line     (4 lines)

  // How long the fully-drawn logo holds on screen before the cycle restarts.
  // ┌ The total first-cycle duration works out to ~3.0 s:
  // │  last element finishes at t ≈ 2.3 s  +  hold 0.7 s  = 3.0 s
  // └ This guarantees ≥ 2 seconds of visibility even on a fast connection.
  hold: 0,

  // Easing applied to every stroke draw.
  // "power3.out"   → starts fast, decelerates to a near-stop at the end (current)
  // "power2.inOut" → slow start, fast middle, slow end (natural hand-draw feel)
  // Other options to try: "expo.out", "sine.out", "power1.out", "linear"
  drawEase: 'power2.inOut',

  // How quickly the loader wrapper fades in when it first mounts.
  fadeIn: 0.35,
}

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT GROUPS
// Each selector targets SVG elements by their data-group attribute.
// Rename a group here AND in the SVG_MARKUP below to reorganise the sequence.
// ─────────────────────────────────────────────────────────────────────────────
const GROUP = {
  archOuter:  '[data-group="arch-outer"]',  // two tall flanking arches
  archMid:    '[data-group="arch-mid"]',    // middle connecting arch curve
  outline:    '[data-group="outline"]',     // main building rectangle outline
  base:       '[data-group="base"]',        // base / plinth at the bottom
  hLines:     '[data-group="h-line"]',      // three horizontal floor-level lines
  diagLines:  '[data-group="diag"]',        // four diagonal cross / glazing lines
  centerLine: '[data-group="center"]',      // single vertical bisecting line
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG
// The markup is embedded directly so the loader renders with zero network
// round-trips — no API route, no fetch, no delay.
//
// Each element carries a data-group attribute that maps to GROUP above.
// To swap logos: replace the path/rect data and re-assign data-group values.
// ─────────────────────────────────────────────────────────────────────────────
const SVG_MARKUP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 259.2 354.494" aria-hidden="true">

  <!-- ── Outer arches (left + right) ───────────────────────────────────────
       The two tall flanking arches that form the outer frame of the logo.
       Both carry data-group="arch-outer" so GSAP animates them as one group. -->
  <path data-group="arch-outer" d="M47.36,299.726h-1V109.914c0-46.843,37.383-84.952,83.333-84.952v1c-45.398,0-82.333,37.661-82.333,83.952v189.812Z"/>
  <path data-group="arch-outer" d="M213.019,299.726h-1V109.914c0-46.292-36.931-83.952-82.326-83.952v-1c45.946,0,83.326,38.109,83.326,84.952v189.812Z"/>

  <!-- ── Middle arch ────────────────────────────────────────────────────────
       The inner arching curve that bridges the two outer arches. -->
  <path data-group="arch-mid" d="M204.722,110.088c.25-20.107-8.202-40.168-23.186-55.04-14.286-14.179-33.244-22.104-51.926-21.722v.013c-18.71-.374-37.606,7.541-51.892,21.715-14.989,14.872-23.441,34.923-23.19,54.986-.014.375-.012,59.74-.008,131.42.001,30.572.003,55.216,0,58.266h1c.002-3.049,0-27.692,0-58.266-.003-55.15-.007-130.681.008-131.408-.247-19.818,8.098-39.605,22.895-54.288,14.1-13.99,32.752-21.82,51.188-21.425l.01-.506.01.493c18.482-.377,37.107,7.444,51.202,21.432,14.793,14.682,23.136,34.48,22.892,54.365.058,1.029.032,59.144.009,110.416-.017,38.744-.033,75.34-.008,79.19l1-.006c-.025-3.848-.009-40.441.008-79.184.035-77.679.04-110.205-.011-110.452Z"/>

  <!-- ── Diagonal cross lines ───────────────────────────────────────────────
       Four thin rotated rects forming an X / hash pattern at the top of the
       arch — a common architectural convention for glazed openings. -->
  <rect data-group="diag" x="99.15"   y="64.38"  width="1.005" height="66.867" transform="translate(-31.775 144.984) rotate(-64.21)"/>
  <rect data-group="diag" x="112.018" y="49.025" width="1.006" height="68.025" transform="translate(-26.562 68.468)  rotate(-30.446)"/>
  <rect data-group="diag" x="126.431" y="97.336" width="66.753" height="1.005" transform="translate(-26.65  79.285)  rotate(-25.794)"/>
  <rect data-group="diag" x="113.063" y="82.605" width="67.954" height="1.006" transform="translate(.696   167.436) rotate(-59.427)"/>

  <!-- ── Building outline ───────────────────────────────────────────────────
       The main rectangular silhouette that encloses the interior detail. -->
  <path data-group="outline" d="M196.5,292.718H62.886V111.948c0-37.851,29.97-68.645,66.807-68.645s66.807,30.794,66.807,68.645v180.77ZM63.886,291.718h131.614V111.948c0-37.299-29.521-67.645-65.807-67.645s-65.807,30.345-65.807,67.645v179.77Z"/>

  <!-- ── Base / plinth ──────────────────────────────────────────────────────
       The trapezoidal platform the building sits on. Drawn last to "complete"
       the structure from top down to the ground. -->
  <path data-group="base" d="M208.185,322.44h-.238c-38.813-.078-117.893-.078-156.695,0h-.238s-.151-.183-.151-.183c-7.691-9.332-13.1-13.086-26.307-18.258l-.319-.126v-4.649h210.727v4.649l-.319.126c-13.207,5.172-18.616,8.926-26.307,18.258l-.151.184ZM129.597,321.377c29.354,0,58.707.019,78.116.056,7.593-9.174,13.314-13.153,26.245-18.245v-2.958H25.243v2.958c12.931,5.092,18.652,9.071,26.245,18.245,19.405-.037,48.755-.056,78.109-.056Z"/>

  <!-- ── Vertical center line ───────────────────────────────────────────────
       Bisects the building vertically — the axis of symmetry. -->
  <rect data-group="center" x="129.253" y="43.804"  width="1.006"   height="248.414"/>

  <!-- ── Horizontal floor lines ─────────────────────────────────────────────
       Three lines at different heights representing floor levels inside the
       building. They stagger downward to suggest storeys being added. -->
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

    // ── Prepare every element for stroke-dasharray animation ──────────────
    //
    // The "pen-drawing" effect works by setting:
    //   stroke-dasharray  = total path length   (one full stroke = one dash)
    //   stroke-dashoffset = total path length   (offset by its own length = invisible)
    //
    // Animating dashoffset from (full length) → 0 progressively reveals the
    // stroke as if a pen is drawing it in real time.
    const allElements = Array.from(
      svg.querySelectorAll<SVGGeometryElement>('path, rect')
    )
    const prepared = allElements.map((el) => {
      // getTotalLength() returns the exact perimeter/arc-length of the shape.
      // Falls back to 200 for any element that doesn't support it.
      const length = el.getTotalLength ? el.getTotalLength() : 200
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
      return { el, length }
    })

    // Helper: returns all elements in the SVG matching a data-group selector.
    const q = (selector: string) =>
      Array.from(svg.querySelectorAll<SVGGeometryElement>(selector))

    // ── Fade the wrapper in on first mount ────────────────────────────────
    // Prevents a harsh pop-in if the loader appears between navigations.
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0 },
      { opacity: 1, duration: TIMING.fadeIn, ease: 'power1.out' }
    )

    // ── Animation loop ────────────────────────────────────────────────────
    //
    // We rebuild the timeline each iteration (rather than repeat: -1) so
    // we can reliably reset all dashoffsets to "hidden" at the start of
    // every cycle without fighting GSAP's internal state.
    let isActive = true
    let activeTl: gsap.core.Timeline | null = null

    const playLoop = () => {
      if (!isActive) return

      // Reset every element back to fully hidden before each cycle starts.
      prepared.forEach(({ el, length }) => {
        gsap.set(el, { strokeDashoffset: length })
      })

      // Create a new timeline; when it finishes it calls playLoop again.
      const tl = gsap.timeline({ onComplete: playLoop })
      activeTl = tl

      // ── Phase 1 · Outer arches  (t = 0.0 s) ──────────────────────────
      // Both flanking arches draw at the same time (stagger: 0), establishing
      // the outer frame of the logo first.
      tl.to(q(GROUP.archOuter), {
        strokeDashoffset: 0,
        duration: TIMING.archDraw,
        ease: TIMING.drawEase,
        stagger: 0,             // 0 = both arches start simultaneously
      }, 0)

      // ── Phase 2 · Middle arch  (t = 0.3 s) ───────────────────────────
      // Starts 0.3 s after the outer arches, layering the reveal rather than
      // making everything appear at once.
      tl.to(q(GROUP.archMid), {
        strokeDashoffset: 0,
        duration: TIMING.archDraw,
        ease: TIMING.drawEase,
      }, 0)

      // ── Phase 3 · Building outline  (t = 0.6 s) ──────────────────────
      // The rectangular silhouette draws next, grounding the arches inside a
      // defined structure.  Slightly longer duration for a deliberate feel.
      tl.to(q(GROUP.outline), {
        strokeDashoffset: 0,
        duration: TIMING.outlineDraw,
        ease: TIMING.drawEase,
      }, 0)

      // ── Phase 4 · Horizontal floor lines  (t = 1.0 s) ────────────────
      // Three lines stagger top-to-bottom (lineStagger seconds apart), giving
      // the impression of storeys being filled in one by one.
      tl.to(q(GROUP.hLines), {
        strokeDashoffset: 0,
        duration: TIMING.lineDraw,
        ease: 'power1.out',
        stagger: TIMING.lineStagger,  // each line starts lineStagger s after the previous
      }, 0)

      // ── Phase 5 · Diagonal cross lines  (t = 1.3 s) ──────────────────
      // Four diagonal lines stagger quickly for a sketchy, hand-drafted look —
      // like an architect quickly hatching a glazed opening.
      tl.to(q(GROUP.diagLines), {
        strokeDashoffset: 0,
        duration: TIMING.diagDraw,
        ease: TIMING.drawEase,
        stagger: TIMING.diagStagger,  // each diagonal starts diagStagger s after the previous
      }, 0)

      // ── Phase 6 · Center vertical line  (t = 1.6 s) ──────────────────
      // The axis of symmetry — a single confident stroke bisecting the building.
      tl.to(q(GROUP.centerLine), {
        strokeDashoffset: 0,
        duration: TIMING.centerDraw,
        ease: 'power1.out',
      }, 0)

      // ── Phase 7 · Base / plinth  (t = 1.7 s) ─────────────────────────
      // The bottom platform draws last, completing the structure from top down
      // to the ground and finishing the architectural story.
      tl.to(q(GROUP.base), {
        strokeDashoffset: 0,
        duration: TIMING.baseDraw,
        ease: TIMING.drawEase,
      }, 0)

      // ── Hold ──────────────────────────────────────────────────────────
      // An empty tween appended after all phases finish (t ≈ 2.3 s).
      // This extends the timeline so the completed logo stays visible for
      // TIMING.hold seconds before the cycle restarts.
      //
      // Total cycle duration: ~2.3 s (last stroke) + 0.7 s (hold) = ~3.0 s
      // This guarantees the animation is visible for well over 2 seconds
      // even on a connection fast enough to load the page almost instantly.
      tl.to({}, { duration: TIMING.hold })
    }

    playLoop()

    // Cleanup: kill the active timeline when Next.js unmounts the loader
    // (i.e., when the actual page finishes loading and replaces loading.tsx).
    return () => {
      isActive = false
      activeTl?.kill()
    }
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
