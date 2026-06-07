import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseServiceClient } from '@/lib/supabaseServerClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const accountId = searchParams.get('account')
  const creatorId = searchParams.get('creator')

  if (!accountId || !creatorId) {
    return NextResponse.redirect(new URL('/creator/stripe-connect?error=missing_params', req.nextUrl.origin))
  }

  const account = await stripe.accounts.retrieve(accountId)
  const complete = account.details_submitted && account.charges_enabled

  if (complete) {
    const service = getSupabaseServiceClient()
    await service
      .from('creators')
      .update({
        stripe_account_id: accountId,
        stripe_onboarding_complete: true,
      })
      .eq('id', creatorId)
  }

  return NextResponse.redirect(
    new URL(
      complete ? '/creator/dashboard?stripe=connected' : '/creator/stripe-connect?incomplete=1',
      req.nextUrl.origin
    )
  )
}
