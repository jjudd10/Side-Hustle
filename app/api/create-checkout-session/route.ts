import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { getPlanBySlug } from '../../../lib/planRepository'

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }
  const stripe = new Stripe(stripeKey)

  const { planSlug, selectedOptionsByGroup } = await request.json()

  if (!planSlug || typeof planSlug !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const plan = await getPlanBySlug(planSlug)
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const basePriceValue = plan.optionCard.basePriceValue
  if (typeof basePriceValue !== 'number') {
    return NextResponse.json({ error: 'This plan has no price set' }, { status: 400 })
  }

  // Compute add-on cost server-side so the client cannot tamper with the total
  const additionalCost = plan.optionCard.groups.reduce((sum, group, groupIndex) => {
    const raw = selectedOptionsByGroup?.[groupIndex]
    const indices: number[] = Array.isArray(raw) ? raw : typeof raw === 'number' ? [raw] : []
    return sum + indices.reduce(
      (groupSum: number, idx: number) => groupSum + (group.options?.[idx]?.priceAdjustment ?? 0),
      0
    )
  }, 0)

  const totalCents = Math.round((basePriceValue + additionalCost) * 100)

  const host = request.headers.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const origin = `${proto}://${host}`

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: totalCents,
          product_data: { name: plan.title },
        },
        quantity: 1,
      },
    ],
    // Stripe replaces {CHECKOUT_SESSION_ID} with the real session ID at redirect time
    return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { planSlug, planTitle: plan.title },
  })

  return NextResponse.json({ clientSecret: session.client_secret })
}
