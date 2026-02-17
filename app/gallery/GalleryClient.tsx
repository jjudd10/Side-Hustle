// app/gallery/GalleryClient.tsx
'use client'

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Plan } from '../../lib/planRepository'

type GalleryClientProps = {
  plans: Plan[]
}

type Range = {
  min: number | null
  max: number | null
}

const getRange = (values: Array<number | null | undefined>): Range => {
  const cleaned = values.filter((value): value is number => typeof value === 'number')
  if (!cleaned.length) {
    return { min: null, max: null }
  }
  return {
    min: Math.min(...cleaned),
    max: Math.max(...cleaned),
  }
}

const formatNumber = (value: number | null) =>
  typeof value === 'number' ? value.toLocaleString() : '—'

const formatCurrency = (value: number | null) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '—'

const getPercent = (value: number, range: Range) => {
  if (range.min === null || range.max === null || range.max === range.min) {
    return 0
  }
  return ((value - range.min) / (range.max - range.min)) * 100
}

const SLIDER_THUMB_SIZE = 18

const useSliderLabelPosition = (value: number, range: Range) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [left, setLeft] = useState(0)

  const update = () => {
    if (!inputRef.current || range.min === null || range.max === null) {
      return
    }
    const percent = getPercent(value, range) / 100
    const styles = getComputedStyle(inputRef.current)
    const thumbSize =
      parseFloat(styles.getPropertyValue('--slider-thumb-size')) || SLIDER_THUMB_SIZE
    const paddingLeft = parseFloat(styles.paddingLeft) || 0
    const paddingRight = parseFloat(styles.paddingRight) || 0
    const width = inputRef.current.clientWidth - paddingLeft - paddingRight
    const usableTrack = Math.max(width - thumbSize, 0)
    const nextLeft = paddingLeft + usableTrack * percent + thumbSize / 2
    setLeft(nextLeft)
  }

  useLayoutEffect(() => {
    update()
  }, [value, range.min, range.max])

  useLayoutEffect(() => {
    if (!inputRef.current || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(() => update())
    observer.observe(inputRef.current)
    return () => observer.disconnect()
  }, [range.min, range.max])

  return { inputRef, left }
}

export default function GalleryClient({ plans }: GalleryClientProps) {
  const areaRange = getRange(plans.map((plan) => plan.galleryCard.areaValue))
  const priceRange = getRange(plans.map((plan) => plan.galleryCard.priceValue))

  const [areaMax, setAreaMax] = useState<number>(areaRange.max ?? 0)
  const [priceMax, setPriceMax] = useState<number>(priceRange.max ?? 0)
  const [bedSelections, setBedSelections] = useState<number[]>([])
  const [bathSelections, setBathSelections] = useState<number[]>([])
  const areaLabel = useSliderLabelPosition(areaMax, areaRange)
  const priceLabel = useSliderLabelPosition(priceMax, priceRange)
  const sliderScrollY = useRef<number | null>(null)

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const { areaValue, priceValue, bedsValue, bathsValue } = plan.galleryCard

      if (areaRange.max && typeof areaValue === 'number' && areaValue > areaMax) {
        return false
      }
      if (priceRange.max && typeof priceValue === 'number' && priceValue > priceMax) {
        return false
      }
      if (bedSelections.length && (!bedsValue || !bedSelections.includes(bedsValue))) {
        return false
      }
      if (bathSelections.length && (!bathsValue || !bathSelections.includes(bathsValue))) {
        return false
      }

      return true
    })
  }, [plans, areaMax, priceMax, bedSelections, bathSelections, areaRange.max, priceRange.max])

  const countLabel =
    filteredPlans.length === 1 ? 'Showing 1 plan' : `Showing ${filteredPlans.length} plans`

  useLayoutEffect(() => {
    if (sliderScrollY.current !== null) {
      window.scrollTo({ top: sliderScrollY.current })
    }
  }, [areaMax, priceMax])

  const handleSliderPointerDown = () => {
    sliderScrollY.current = window.scrollY
  }

  const handleSliderPointerUp = () => {
    sliderScrollY.current = null
  }

  return (
    <section className="gallery">
      <div className="gallery-shell">
        <div className="gallery-intro">
          <h2 className="eyebrow" style={{ fontSize: '1.3rem' }}>
            Product Gallery
          </h2>
          <p>
            Explore plans created by real people for real families.
            <br />
            At <em>Home in Time</em>, we believe in accessible living spaces that foster togethereness
            and connection.
            <br />
            Use the filters to find plans that fit your needs.
          </p>
        </div>

        <div className="gallery-content-header">
          <div>
            <p className="eyebrow">{countLabel}</p>
          </div>
        </div>

        <div className="gallery-layout">
          <aside className="gallery-sidebar">
            <p className="muted" style={{ marginBottom: 20 }}>
              Refine the collection with sliders and quick filters.
            </p>

            <section className="filter-group">
              <header className="filter-group-header">
                <div>
                  <p className="filter-label">Square Footage</p>
                </div>
              </header>
              <label className="sr-only" htmlFor="square-footage">
                Choose a square footage range
              </label>
              <div className="filter-slider-wrap">
                <input
                  className="filter-slider"
                  disabled={!areaRange.max}
                  id="square-footage"
                  max={areaRange.max ?? 0}
                  min={areaRange.min ?? 0}
                  onChange={(event) => setAreaMax(Number(event.target.value))}
                  onPointerDown={handleSliderPointerDown}
                  onPointerUp={handleSliderPointerUp}
                  onPointerCancel={handleSliderPointerUp}
                  step={1}
                  type="range"
                  value={areaMax}
                  ref={areaLabel.inputRef}
                  style={{ '--value-percent': `${getPercent(areaMax, areaRange)}%` } as CSSProperties}
                />
                <span
                  className="filter-slider-value"
                  style={{ left: `${areaLabel.left}px` }}
                >
                  {formatNumber(areaMax)}
                </span>
              </div>
            </section>

            <section className="filter-group">
              <header className="filter-group-header">
                <div>
                  <p className="filter-label">Bedrooms</p>
                </div>
              </header>
              <div className="chip-group" role="group" aria-label="Bedrooms">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    aria-pressed={bedSelections.includes(count)}
                    className={`chip${bedSelections.includes(count) ? ' is-active' : ''}`}
                    key={`bed-${count}`}
                    onClick={() =>
                      setBedSelections((current) =>
                        current.includes(count)
                          ? current.filter((value) => value !== count)
                          : [...current, count]
                      )
                    }
                    type="button"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-group">
              <header className="filter-group-header">
                <div>
                  <p className="filter-label">Bathrooms</p>
                </div>
              </header>
              <div className="chip-group" role="group" aria-label="Bathrooms">
                {[2, 3, 4].map((count) => (
                  <button
                    aria-pressed={bathSelections.includes(count)}
                    className={`chip${bathSelections.includes(count) ? ' is-active' : ''}`}
                    key={`bath-${count}`}
                    onClick={() =>
                      setBathSelections((current) =>
                        current.includes(count)
                          ? current.filter((value) => value !== count)
                          : [...current, count]
                      )
                    }
                    type="button"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <div className="gallery-content">
            <div className="gallery-cards">
              {filteredPlans.map((plan) => (
                <article className="gallery-card" key={plan.slug}>
                  <div className="gallery-card-media">
                    {plan.galleryCard.image ? (
                      <Image
                        alt={plan.galleryCard.image.alt}
                        fill
                        sizes="(min-width: 768px) 320px, 90vw"
                        src={plan.galleryCard.image.src}
                      />
                    ) : (
                      <span>Image coming soon</span>
                    )}
                  </div>

                  <div className="gallery-card-body">
                    <h3>{plan.title}</h3>
                    <p>{plan.galleryCard.description}</p>
                    <dl className="gallery-card-specs">
                      <div>
                        <dt>Area</dt>
                        <dd>{plan.galleryCard.area}</dd>
                      </div>
                      <div>
                        <dt>Bedrooms</dt>
                        <dd>{plan.galleryCard.beds}</dd>
                      </div>
                      <div>
                        <dt>Bathrooms</dt>
                        <dd>{plan.galleryCard.baths}</dd>
                      </div>
                    </dl>
                    <div className="gallery-card-actions">
                      <Link className="btn btn-primary" href={`/plans/${plan.slug}`}>
                        Explore details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
