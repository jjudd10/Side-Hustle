import Link from 'next/link'

type ProductCardProps = {
  id: string
  name: string
  description: string
  area: string
  suites: number
  price: string
}

export function ProductCard({ id, name, description, area, suites, price }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-secondary-800/60 bg-black/40 p-8 shadow-luxury transition hover:-translate-y-1 hover:border-accent-gold/60">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-secondary-400">Signature Floorplan</p>
        <h3 className="text-2xl font-serif text-white">{name}</h3>
        <p className="text-sm text-secondary-200">{description}</p>
        <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.2em] text-secondary-400">
          <div>
            <span className="block text-secondary-500">Area</span>
            <span className="text-lg font-serif text-white">{area}</span>
          </div>
          <div>
            <span className="block text-secondary-500">Suites</span>
            <span className="text-lg font-serif text-white">{suites}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-lg font-serif text-accent-gold">{price}</p>
        <Link
          href={`/product/${id}`}
          className="text-xs font-semibold uppercase tracking-[0.4em] text-accent-gold hover:text-white"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}
