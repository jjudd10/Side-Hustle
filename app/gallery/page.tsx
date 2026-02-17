import './gallery.css'
import type { Metadata } from 'next'
import { getPlans } from '../../lib/planRepository'
import GalleryClient from './GalleryClient'

// Provide metadata so the Gallery route has descriptive head tags
export const metadata: Metadata = {
  title: 'Plan Gallery - Interior Plans',
  description: 'Filter curated house plans by square footage, price, bedrooms, and bathrooms.',
}

export const revalidate = 60

export default async function GalleryPage() {
  const plans = await getPlans()

  if (!plans.length) {
    return (
      <section className="gallery">
        <div className="gallery-shell">
          <p>No plans available yet. Add a row to your Supabase table to populate this gallery.</p>
        </div>
      </section>
    )
  }

  return <GalleryClient plans={plans} />
}
