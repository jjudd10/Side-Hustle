import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-28 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm uppercase tracking-[0.5em] text-secondary-400">Bespoke Architectural Narratives</p>
          <h1 className="text-4xl font-serif text-white drop-shadow md:text-6xl">
            Crafting timeless spaces for discerning visionaries
          </h1>
          <p className="text-lg text-secondary-100 md:text-xl">
            Explore a curated collection of architectural floorplans and interior design packages rooted in classical elegance
            and elevated by modern precision.
          </p>
          <div className="flex flex-col gap-4 md:flex-row">
            <Link
              href="#catalog"
              className="rounded-full bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-luxury transition hover:bg-accent-bronze"
            >
              Explore Catalog
            </Link>
            <Link
              href="/modern"
              className="rounded-full border border-accent-gold/60 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent-gold transition hover:border-accent-gold hover:text-white"
            >
              Modern Collection
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-secondary-800/60 bg-gradient-to-br from-black/40 via-secondary-900/40 to-black/10 p-10 shadow-luxury">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary-400">Featured Concept</p>
            <h2 className="text-2xl font-serif text-accent-gold">The Aurelia Residence</h2>
            <p className="text-secondary-200">
              A sweeping 7,800 sq.ft. estate blending hand-carved limestone facades with bespoke bronze detailing. Designed for
              elevated entertaining and intimate retreats.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-2xl font-serif text-white">7,800</p>
                <p className="uppercase tracking-[0.2em] text-secondary-400">Sq.Ft.</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-white">5</p>
                <p className="uppercase tracking-[0.2em] text-secondary-400">Suites</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-white">3</p>
                <p className="uppercase tracking-[0.2em] text-secondary-400">Lounges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-gold/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-accent-bronze/20 blur-3xl" aria-hidden="true" />
    </section>
  )
}
