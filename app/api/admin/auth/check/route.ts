import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const hasTOTP = (factors?.totp?.length ?? 0) > 0

  return NextResponse.json({ isAdmin: true, hasTOTP })
}
