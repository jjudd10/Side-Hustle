import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if creator already has a Stripe account
  const service = getSupabaseServiceClient()
  const { data: creator } = await service
    .from('creators')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  let accountId = creator?.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: { transfers: { requested: true } },
    })
    accountId = account.id

    await service
      .from('creators')
      .update({ stripe_account_id: accountId })
      .eq('id', user.id)
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://homeintime.cc'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/creator/stripe-connect?refresh=1`,
    return_url: `${origin}/api/creator/stripe-connect/return?account=${accountId}&creator=${user.id}`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
