import './home.css'
import Link from 'next/link'
import Image from 'next/image'
import { getPlans } from '../../lib/planRepository'
import blueprintAsset from '../../data/BlueprintAsset.png'
import { HeroParallax } from './HeroParallax'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let plans: Awaited<ReturnType<typeof getPlans>> = []

  try {
    plans = await getPlans()
  } catch (error) {
    console.error('Failed to fetch home plans:', error)
  }

  return (
    <>
      <section className="hero">
        <HeroParallax />
        <div className="hero-media" aria-hidden="true">
          <Image
            alt=""
            fill
            priority
            sizes="100vw"
            src={blueprintAsset}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="container hero-content" style={{ textAlign: 'center' }}>
          <h1 className="hero-title">Your Next Home, 
            <br />
            Waiting to Become a Reality.</h1>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/shop">
              Browse Floorplans
            </Link>
          </div>
        </div>
      </section>

      {/* Soft background wash to blend this section into the page. */}
      <section className="section section-soft">
        <div className="container">
          <h2>Featured Floorplans</h2>
          <p className="muted">Handpicked designs customers love for function and style.</p>
          {plans.length ? (
            <div className="cards" style={{ marginTop: 16 }}>
              {plans.map((plan) => (
                <article className="card" key={plan.slug}>
                  <div className="card-media" style={{ position: 'relative', overflow: 'hidden' }}>
                    {plan.galleryCard.image ? (
                      <Image
                        alt={plan.galleryCard.image.alt}
                        fill
                        sizes="(min-width: 768px) 400px, 90vw"
                        src={plan.galleryCard.image.src}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ padding: 24 }}>Image coming soon</span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{plan.title}</h3>
                    <p className="card-meta">
                      {plan.galleryCard.beds} • {plan.galleryCard.baths} • {plan.galleryCard.area}
                    </p>
                    <div className="card-actions">
                      <Link className="btn btn-primary" href={`/plans/${plan.slug}`}>
                        Explore Plan
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>
              Add plans in Supabase to showcase them here.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
