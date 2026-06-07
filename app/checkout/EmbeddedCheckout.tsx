'use client'

import { useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function EmbeddedCheckout({ clientSecret }: { clientSecret: string }) {
  const checkoutRef = useRef<{ destroy: () => void } | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current || !PUBLISHABLE_KEY) return
    mountedRef.current = true

    loadStripe(PUBLISHABLE_KEY).then((stripe) => {
      if (!stripe) return
      stripe.createEmbeddedCheckoutPage({ clientSecret }).then((checkout) => {
        checkoutRef.current = checkout
        checkout.mount('#checkout')
      })
    })

    return () => {
      checkoutRef.current?.destroy()
    }
  }, [clientSecret])

  if (!PUBLISHABLE_KEY) {
    return (
      <div className="co-stripe-error">
        Stripe is not configured. Add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your
        environment and restart.
      </div>
    )
  }

  return (
    <div className="co-stripe-wrap">
      <div id="checkout" />
    </div>
  )
}
