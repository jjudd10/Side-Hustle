import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Navigation } from '@/components/navigation'
import { products } from '@/lib/content'

type ProductPageProps = {
  params: {
    id: string
  }
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = products.find((item) => item.id === params.id)

  if (!product) {
    return {}
  }

  return {
    title: `${product.name} | Architectural Design Platform`,
    description: product.description,
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((item) => item.id === params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="pb-20">
      <Navigation />
      <main className="mx-auto max-w-5xl px-6 py-24">
        <Link href={`/${product.style}`} className="text-xs uppercase tracking-[0.4em] text-secondary-400 hover:text-accent-gold">
          ← Back to {product.style} collection
        </Link>
        <div className="mt-6 flex flex-col gap-12 md:flex-row md:items-start">
          <div className="flex-1 space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary-400">Signature Floorplan</p>
            <h1 className="text-4xl font-serif text-accent-gold md:text-5xl">{product.name}</h1>
            <p className="text-lg text-secondary-100">{product.description}</p>
            <div className="grid gap-6 rounded-3xl border border-secondary-800/60 bg-black/30 p-8 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary-400">Total Area</p>
                <p className="mt-2 text-2xl font-serif text-white">{product.area}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary-400">Suites</p>
                <p className="mt-2 text-2xl font-serif text-white">{product.suites}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary-400">Investment</p>
                <p className="mt-2 text-2xl font-serif text-accent-gold">{product.price}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
              <h2 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Program Highlights</h2>
              <ul className="mt-4 space-y-3 text-secondary-100">
                {product.specifications.map((spec) => (
                  <li key={spec} className="flex items-start gap-3">
                    <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="w-full max-w-md space-y-6 rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary-400">Client Concierge</p>
            <p className="text-sm text-secondary-100">
              Each acquisition includes white-glove implementation oversight, custom interior styling options, and integration
              with your preferred construction partners.
            </p>
            <a
              href="mailto:atelier@architecturaldesign.com"
              className="inline-flex rounded-full bg-accent-gold px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze"
            >
              Reserve Package
            </a>
            <div className="rounded-2xl border border-accent-gold/40 bg-gradient-to-br from-accent-gold/20 via-transparent to-transparent p-6 text-sm text-secondary-100">
              <p className="font-serif text-white">Included Concierge Services</p>
              <ul className="mt-3 space-y-2">
                <li>• Implementation roadmap</li>
                <li>• Material procurement coordination</li>
                <li>• Virtual reality walk-throughs</li>
                <li>• Post-delivery design refinements</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
