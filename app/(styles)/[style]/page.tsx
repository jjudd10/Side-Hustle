import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Navigation } from '@/components/navigation'
import { products, styleDetails } from '@/lib/content'

type StylePageProps = {
  params: {
    style: string
  }
}

export function generateStaticParams() {
  return styleDetails.map((style) => ({ style: style.slug }))
}

export function generateMetadata({ params }: StylePageProps) {
  const detail = styleDetails.find((style) => style.slug === params.style)

  if (!detail) {
    return {}
  }

  return {
    title: `${detail.title} | Architectural Design Platform`,
    description: detail.description,
  }
}

export default function StylePage({ params }: StylePageProps) {
  const detail = styleDetails.find((style) => style.slug === params.style)

  if (!detail) {
    notFound()
  }

  const curatedProducts = products.filter((product) => product.style === detail.slug)

  return (
    <div className="pb-20">
      <Navigation />
      <main className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-sm uppercase tracking-[0.4em] text-secondary-400">Collection</p>
        <h1 className="mt-4 text-4xl font-serif text-accent-gold md:text-5xl">{detail.title}</h1>
        <p className="mt-6 max-w-3xl text-lg text-secondary-100">{detail.description}</p>
        <section className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white">Design Philosophy</h2>
              <p className="mt-4 text-secondary-200">{detail.philosophy}</p>
            </div>
            <div className="rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
              <h3 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Signature Materials</h3>
              <ul className="mt-4 space-y-3 text-secondary-100">
                {detail.materials.map((material) => (
                  <li key={material} className="flex items-center gap-3">
                    <span className="h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
            <h3 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Curated Amenities</h3>
            <ul className="mt-4 space-y-3 text-secondary-100">
              {detail.amenities.map((amenity) => (
                <li key={amenity} className="flex items-start gap-3">
                  <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                  <span>{amenity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-accent-gold/40 bg-gradient-to-br from-accent-gold/20 via-transparent to-transparent p-6 text-secondary-100">
              <p className="text-xs uppercase tracking-[0.4em]">Client Services</p>
              <p className="mt-3 text-sm">
                Engage our atelier for bespoke modifications, procurement management, and white-glove implementation oversight.
              </p>
            </div>
          </div>
        </section>
        <section className="mt-16 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif text-white">Featured Floorplans</h2>
            <p className="text-secondary-200">
              Explore detailed floorplan packages curated for the {detail.title.toLowerCase()}.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {curatedProducts.map((product) => (
              <div key={product.id} className="rounded-3xl border border-secondary-800/60 bg-black/30 p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-secondary-400">Signature Plan</p>
                <h3 className="mt-3 text-2xl font-serif text-white">{product.name}</h3>
                <p className="mt-3 text-sm text-secondary-200">{product.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-secondary-100">
                  {product.galleries.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-6 rounded-full bg-accent-gold" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="font-serif text-accent-gold">Starting {product.price}</span>
                  <Link href={`/product/${product.id}`} className="uppercase tracking-[0.3em] text-accent-gold hover:text-white">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
