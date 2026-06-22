import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const redirectUrl = new URL('/creator/login', req.nextUrl.origin)
  const res = NextResponse.redirect(redirectUrl)

  // Must use createServerClient targeting the response directly so that
  // the cookie-clearing Set-Cookie headers land on the redirect response.
  // Using getSupabaseServerClient() (next/headers cookieStore) won't work
  // because those writes target a different internal response object.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        }),
      },
    }
  )

  await supabase.auth.signOut()

  return res
}
