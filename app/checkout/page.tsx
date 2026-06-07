import { redirect } from 'next/navigation'
import EmbeddedCheckout from './EmbeddedCheckout'
import './checkout.css'

type CheckoutPageProps = {
  searchParams: Promise<{ clientSecret?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { clientSecret } = await searchParams

  if (!clientSecret) {
    redirect('/')
  }

  return (
    <div className="co-layout">
      {/* ── Left: brand panel ── */}
      <aside className="co-brand">
        <div className="co-brand-inner">
          <div className="co-brand-copy">
            <h1 className="co-brand-heading">Secure Checkout</h1>
            <p className="co-brand-sub">
              Your premium floorplan package is one step away.
              Every purchase includes full architectural documentation
              and lifetime access to your digital files.
            </p>
          </div>

          <ul className="co-trust-list">
            <li className="co-trust-item">
              <span className="co-trust-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L3 6.5V12C3 16.97 7.02 21.7 12 23C16.98 21.7 21 16.97 21 12V6.5L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Encrypted & secured by Stripe
            </li>
            <li className="co-trust-item">
              <span className="co-trust-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14 2H6C5.45 2 5 2.45 5 3V21C5 21.55 5.45 22 6 22H18C18.55 22 19 21.55 19 21V7L14 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M14 2V7H19" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 13H15M9 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              Instant PDF delivery after payment
            </li>
            <li className="co-trust-item">
              <span className="co-trust-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </span>
              Questions? Email info@homeintime.cc
            </li>
          </ul>

          <div className="co-brand-footer">
            <p>© {new Date().getFullYear()} Strictly Business L.C.</p>
          </div>
        </div>

        {/* Decorative accent lines */}
        <div className="co-brand-deco" aria-hidden="true">
          <span /><span /><span />
        </div>
      </aside>

      {/* ── Right: Stripe embedded form ── */}
      <section className="co-form-panel">
        <div className="co-form-scroll">
          <EmbeddedCheckout clientSecret={clientSecret} />
        </div>
      </section>
    </div>
  )
}
