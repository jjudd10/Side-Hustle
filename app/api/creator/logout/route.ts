import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServerClient'

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/creator/login', req.nextUrl.origin))
}
