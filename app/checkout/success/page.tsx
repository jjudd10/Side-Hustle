import Link from 'next/link'
import '../checkout.css'

export default function CheckoutSuccessPage() {
  return (
    <main className="checkout-success-shell">
      <div className="checkout-success-card">
        <div className="checkout-success-icon">✓</div>
        <h1>Order Confirmed</h1>
        <p>
          Thank you for your purchase. You&apos;ll receive a confirmation email shortly with your
          plan details and next steps.
        </p>
        <div className="checkout-success-actions">
          <Link className="btn btn-primary" href="/gallery">
            Browse More Plans
          </Link>
          <Link className="btn btn-secondary" href="/">
            Return Home
          </Link>
        </div>
      </div>
    </main>
  )
}
