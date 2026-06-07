import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseServiceClient } from '@/lib/supabaseServerClient'
import { generateSignedDownloadUrl, PRIVATE_BUCKET } from '@/lib/r2Client'
import { sendPurchaseEmail } from '@/lib/resend'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as {
    payment_status: string
    id: string
    amount_total: number | null
    payment_intent: string | { id: string } | null
    customer_details: { email: string | null } | null
    metadata: Record<string, string> | null
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  const planId = session.metadata?.planId
  const customerEmail = session.customer_details?.email

  if (!planId || !customerEmail) {
    console.error('Webhook missing planId or customerEmail', session.id)
    return NextResponse.json({ received: true })
  }

  const service = getSupabaseServiceClient()

  // Idempotency — skip if already recorded
  const { data: existing } = await service
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ received: true })

  // Fetch plan + creator
  const { data: plan } = await service
    .from('floorplan')
    .select('id, title, file_paths, creator_id, creators(stripe_account_id)')
    .eq('id', planId)
    .single()

  if (!plan) {
    console.error('Plan not found for id', planId)
    return NextResponse.json({ received: true })
  }

  // Generate signed download URLs
  const filePaths: Record<string, string> = plan.file_paths ?? {}
  const downloadLinks: { label: string; url: string }[] = []

  await Promise.all(
    Object.entries(filePaths).map(async ([type, key]) => {
      const url = await generateSignedDownloadUrl(PRIVATE_BUCKET(), key, 86400)
      downloadLinks.push({ label: type.toUpperCase(), url })
    })
  )

  // Send delivery email
  if (downloadLinks.length > 0) {
    await sendPurchaseEmail(customerEmail, plan.title ?? 'Your Floor Plan', downloadLinks)
  }

  // Record purchase
  await service.from('purchases').insert({
    customer_email: customerEmail,
    customer_id: session.metadata?.customerId ?? null,
    plan_id: plan.id,
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    amount_paid: session.amount_total,
  })

  // Transfer to creator via Stripe Connect
  const creatorAny = plan.creators as any
  const stripeAccountId = Array.isArray(creatorAny)
    ? creatorAny[0]?.stripe_account_id
    : creatorAny?.stripe_account_id

  if (stripeAccountId && session.amount_total) {
    // Transfer 80% to creator (adjust split as needed)
    const transferAmount = Math.floor(session.amount_total * 0.8)
    try {
      await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        destination: stripeAccountId,
        source_transaction: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        metadata: { planId: String(plan.id), sessionId: session.id },
      })
    } catch (err) {
      // Log but don't fail the webhook — purchase is already recorded
      console.error('Stripe transfer failed:', err)
    }
  }

  return NextResponse.json({ received: true })
}
