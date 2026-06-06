'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function PaymentForm({ planTitle, amount }: { planTitle: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-card">
        <p className="checkout-section-label">Order Summary</p>
        <div className="checkout-summary-row">
          <span className="checkout-plan-title">{planTitle}</span>
          <span className="checkout-total">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="checkout-card">
        <p className="checkout-section-label">Payment Details</p>
        {!ready && <div className="checkout-skeleton" />}
        <PaymentElement onReady={() => setReady(true)} />
      </div>

      {error && <p className="checkout-error">{error}</p>}

      <button
        className="btn btn-primary checkout-submit"
        disabled={!stripe || !ready || loading}
        type="submit"
      >
        {loading ? 'Processing…' : `Pay ${formatPrice(amount)}`}
      </button>

      <p className="checkout-secure-note">
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
          <path d="M6 0L0 2.5V6.5C0 9.8 2.6 12.9 6 14C9.4 12.9 12 9.8 12 6.5V2.5L6 0Z" fill="currentColor" opacity="0.5"/>
        </svg>
        Secured by Stripe
      </p>
    </form>
  )
}

export default function CheckoutForm({
  clientSecret,
  amount,
  planTitle,
}: {
  clientSecret: string
  amount: number
  planTitle: string
}) {
  if (!stripePromise) {
    return (
      <div className="checkout-card checkout-error">
        Stripe is not configured. Please add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your
        environment and restart the server.
      </div>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#c7a07a',
      colorText: '#3e3e3e',
      colorTextSecondary: '#6a5c57',
      colorBackground: '#ffffff',
      colorDanger: '#b91c1c',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      borderRadius: '6px',
      spacingUnit: '5px',
    },
  }

  return (
    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
      <PaymentForm amount={amount} planTitle={planTitle} />
    </Elements>
  )
}