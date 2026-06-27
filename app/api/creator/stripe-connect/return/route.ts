import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: NextRequest) {
  // Verify the caller is the authenticated creator — never trust URL params alone
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/creator/login', req.nextUrl.origin))
  }

  const { searchParams } = req.nextUrl
  const accountId = searchParams.get('account')

  if (!accountId) {
    return NextResponse.redirect(new URL('/creator/stripe-connect?error=missing_params', req.nextUrl.origin))
  }

  const service = getSupabaseServiceClient()

  // Verify the account ID matches what we stored for this creator — prevents
  // an attacker supplying a different account ID in the query string
  const { data: creator } = await service
    .from('creators')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (!creator || creator.stripe_account_id !== accountId) {
    return NextResponse.redirect(new URL('/creator/stripe-connect?error=account_mismatch', req.nextUrl.origin))
  }

  const account = await stripe.accounts.retrieve(accountId)
  const complete = account.details_submitted && account.charges_enabled

  if (complete) {
    await service
      .from('creators')
      .update({ stripe_onboarding_complete: true })
      .eq('id', user.id)
  }

  return NextResponse.redirect(
    new URL(
      complete ? '/creator/dashboard?stripe=connected' : '/creator/stripe-connect?incomplete=1',
      req.nextUrl.origin
    )
  )
}
