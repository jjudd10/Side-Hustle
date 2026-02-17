import './plan.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPlanBySlug } from '../../../lib/planRepository'
import PlanOptionsCard from './PlanOptionsCard'

type PlanParams = {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 60
export const dynamic = 'force-dynamic'

// Tailor the metadata per plan using the placeholder data so previews look polished.
export async function generateMetadata({ params }: PlanParams): Promise<Metadata> {
  const { slug } = await params
  const plan = await getPlanBySlug(slug)

  if (!plan) {
    return {
      title: 'Plan Detail - Interior Plans',
      description: 'Preview this plan detail template and wire it to your own data.',
    }
  }

  return {
    title: `${plan.title} - Interior Plans`,
    description: plan.introParagraphs[0] ?? 'Explore this floorplan template.',
  }
}

export default async function PlanDetailPage({ params }: PlanParams) {
  const { slug } = await params
  const plan = await getPlanBySlug(slug)

  // If the slug is missing from the fake data source, show a 404 so you notice the missing entry.
  if (!plan) {
    notFound()
  }

  const collageSlots = [0, 1, 2]
  const overviewBlock = plan.infoBlocks[0]
  const remainingInfoBlocks = plan.infoBlocks.slice(1)
  const specificationRows = [
    {
      category: 'Square Feet',
      value:
        typeof plan.galleryCard.areaValue === 'number'
          ? plan.galleryCard.areaValue.toLocaleString()
          : 'TBD',
    },
    {
      category: 'Bedrooms',
      value:
        typeof plan.galleryCard.bedsValue === 'number' ? String(plan.galleryCard.bedsValue) : 'TBD',
    },
    {
      category: 'Bathrooms',
      value:
        typeof plan.galleryCard.bathsValue === 'number' ? String(plan.galleryCard.bathsValue) : 'TBD',
    },
    { category: 'Ceiling Height', value: '' },
    { category: 'Garage', value: '' },
    { category: 'Stories', value: '' },
    { category: 'Lot Width', value: '' },
    { category: 'Lot Depth', value: '' },
    { category: 'Foundation', value: '' },
  ]

  return (
    <article className="plan-shell">
      {/* Header section gives context about which plan is being viewed */}
      <header className="plan-header">
        <p className="eyebrow">{plan.eyebrow}</p>
        <h1>{plan.title}</h1>
      </header>

      {/* Primary layout: body content on the left, configuration sidebar on the right */}
      <div className="plan-grid">
        <div className="plan-main">
          <section className="plan-media">
            {/* Reserve generous space for photography or renders */}
            <div className="plan-media-primary">
              {plan.media.hero ? (
                <Image
                  alt={plan.media.hero.alt}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  src={plan.media.hero.src}
                />
              ) : (
                <span>Upload a hero render for this plan</span>
              )}
            </div>

            {/* Three connected slots below the hero form a single collage block */}
            <div className="plan-media-secondary">
              {collageSlots.map((slotIndex) => {
                const image = plan.media.gallery[slotIndex]
                return (
                  <div className="plan-media-thumb" key={`${plan.slug}-thumb-${slotIndex}`}>
                    {image ? (
                      <Image
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 230px, (min-width: 768px) 30vw, 33vw"
                        src={image.src}
                      />
                    ) : (
                      <span>Add gallery image {slotIndex + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Information blocks for narrative + technical data */}
          <section className="plan-info-grid">
            {overviewBlock && (
              <article className="plan-info-card" key={`${plan.slug}-${overviewBlock.title}`}>
                <h3>{overviewBlock.title}</h3>
                {overviewBlock.body && <p>{overviewBlock.body}</p>}
                {overviewBlock.list && (
                  <ul>
                    {overviewBlock.list.map((item, idx) => (
                      <li key={`${overviewBlock.title}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            )}

            <div className="plan-floorplan-stack" aria-label="Floorplan images">
              {[0, 1].map((slotIndex) => (
                <div className="plan-floorplan-frame" key={`${plan.slug}-floorplan-${slotIndex}`}>
                  <span>Add floorplan image {slotIndex + 1}</span>
                </div>
              ))}
            </div>

            {remainingInfoBlocks.map((block) => (
              <article
                className={`plan-info-card${block.title === 'Specifications' ? ' is-full-width' : ''}`}
                key={`${plan.slug}-${block.title}`}
              >
                <h3>{block.title}</h3>
                {block.title === 'Specifications' ? (
                  <table className="plan-spec-table">
                    <tbody>
                      {specificationRows.map((row) => (
                        <tr key={`${block.title}-${row.category}`}>
                          <th scope="row">{row.category}</th>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <>
                    {block.body && <p>{block.body}</p>}
                    {block.list && (
                      <ul>
                        {block.list.map((item, idx) => (
                          <li key={`${block.title}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </article>
            ))}
          </section>
        </div>

        {/* Right column for pricing/options selections styled like the gallery sidebar */}
        <PlanOptionsCard optionCard={plan.optionCard} />
      </div>
    </article>
  )
}
