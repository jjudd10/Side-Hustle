import { HeroSection } from '@/components/hero-section'
import { Navigation } from '@/components/navigation'
import { ProductCard } from '@/components/product-card'
import { StyleSection } from '@/components/style-section'
import { products, styleHighlights } from '@/lib/content'

export default function HomePage() {
  return (
    <div className="pb-20">
      <Navigation />
      <main>
        <HeroSection />
        <section className="mx-auto max-w-6xl space-y-10 px-6 pb-24" id="catalog">
          <div className="space-y-4 text-center">
            <h2 className="section-heading">Curated Design Collections</h2>
            <p className="section-subheading mx-auto">
              Each collection embodies a distinct architectural narrative enriched with bespoke interior detailing and curated
              amenities tailored for elite lifestyles.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {styleHighlights.map((style) => (
              <StyleSection key={style.title} {...style} />
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-6xl space-y-10 px-6 pb-24">
          <div className="space-y-4 text-center">
            <h2 className="section-heading">Signature Floorplans</h2>
            <p className="section-subheading mx-auto">
              Exclusive architectural plans with comprehensive documentation, immersive renderings, and bespoke concierge
              services for implementation.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-5xl rounded-3xl border border-secondary-800/60 bg-black/40 px-8 py-16 text-center shadow-luxury">
          <p className="text-sm uppercase tracking-[0.4em] text-secondary-400">Private Client Services</p>
          <h2 className="mt-4 text-4xl font-serif text-white md:text-5xl">Request a bespoke consultation</h2>
          <p className="mx-auto mt-6 max-w-2xl text-secondary-200">
            Collaborate with our atelier to commission a tailor-made architectural concept. From estate masterplanning to
            penthouse transformations, our designers craft environments that resonate with your personal narrative.
          </p>
          <a
            href="mailto:atelier@architecturaldesign.com"
            className="mt-10 inline-flex rounded-full bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-luxury transition hover:bg-accent-bronze"
          >
            Schedule Consultation
          </a>
        </section>
      </main>
      <footer className="mx-auto mt-20 max-w-6xl border-t border-secondary-800/60 px-6 py-10 text-center text-xs uppercase tracking-[0.35em] text-secondary-500">
        © {new Date().getFullYear()} Atelier Architectural Design. All rights reserved.
      </footer>
    </div>
  )
}
