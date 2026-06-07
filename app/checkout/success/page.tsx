import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import Link from 'next/link'
import '../checkout.css'

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) redirect('/')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) redirect('/')

  const stripe = new Stripe(stripeKey)

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    redirect('/')
  }

  if (session.payment_status !== 'paid') {
    redirect('/')
  }

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
