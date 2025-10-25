import { Navigation } from '@/components/navigation'

export const metadata = {
  title: 'Private Consultation | Architectural Design Platform',
  description:
    'Arrange a bespoke consultation with our architectural design atelier for custom floorplans and interior styling.',
}

export default function ConsultationPage() {
  return (
    <div className="pb-20">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-sm uppercase tracking-[0.4em] text-secondary-400">Private Client Services</p>
        <h1 className="mt-4 text-4xl font-serif text-accent-gold md:text-5xl">Bespoke Consultation</h1>
        <p className="mt-6 text-lg text-secondary-100">
          Engage directly with our principal architects and interior curators to commission a fully bespoke concept tailored to
          your lifestyle, site, and aesthetic aspirations.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <section className="rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
            <h2 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Consultation Includes</h2>
            <ul className="mt-4 space-y-3 text-secondary-100">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                <span>Comprehensive design briefing and lifestyle analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                <span>Preliminary spatial concepts and mood direction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                <span>Material and finishes curation with sourcing strategy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-8 rounded-full bg-accent-gold" aria-hidden="true" />
                <span>Timeline, investment, and delivery roadmap</span>
              </li>
            </ul>
          </section>
          <section className="rounded-3xl border border-secondary-800/60 bg-black/30 p-8">
            <h2 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Schedule Your Session</h2>
            <p className="text-secondary-100">
              Share your project vision and our concierge will coordinate a private session with the atelier team within 48
              hours.
            </p>
            <div className="mt-6 space-y-4 text-sm text-secondary-100">
              <p>Email: <a href="mailto:atelier@architecturaldesign.com">atelier@architecturaldesign.com</a></p>
              <p>Phone: <a href="tel:+13125551234">+1 (312) 555-1234</a></p>
              <p>Hours: Monday – Friday, 9am – 6pm CST</p>
            </div>
            <a
              href="mailto:atelier@architecturaldesign.com?subject=Consultation%20Request"
              className="mt-8 inline-flex rounded-full bg-accent-gold px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze"
            >
              Request Consultation
            </a>
          </section>
        </div>
      </main>
    </div>
  )
}
