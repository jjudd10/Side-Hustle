import Link from 'next/link'

export type StyleSectionProps = {
  title: string
  description: string
  highlights: string[]
  href: string
  accent?: 'gold' | 'bronze' | 'copper'
}

const accentMap: Record<NonNullable<StyleSectionProps['accent']>, string> = {
  gold: 'from-accent-gold/40 via-accent-gold/20 to-transparent',
  bronze: 'from-accent-bronze/40 via-accent-bronze/20 to-transparent',
  copper: 'from-accent-copper/40 via-accent-copper/20 to-transparent',
}

export function StyleSection({ title, description, highlights, href, accent = 'gold' }: StyleSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary-800/60 bg-black/30 p-10 shadow-luxury">
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-secondary-400">Design Collection</p>
          <h3 className="text-3xl font-serif text-white md:text-4xl">{title}</h3>
          <p className="max-w-xl text-secondary-200">{description}</p>
          <ul className="grid gap-3 text-sm text-secondary-100 md:grid-cols-2">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <span className="text-xs uppercase tracking-[0.4em] text-secondary-500">Starting from</span>
          <p className="text-3xl font-serif text-accent-gold">$4,500</p>
          <Link
            href={href}
            className="rounded-full border border-accent-gold/50 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-accent-gold transition hover:border-accent-gold hover:text-white"
          >
            View Collection
          </Link>
        </div>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60`} aria-hidden="true" />
    </section>
  )
}
