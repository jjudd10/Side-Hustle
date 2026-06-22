import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be called before any redirect logic
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const adminPublicPaths = ['/admin/login', '/admin/totp-setup', '/admin/totp-verify']
    const isPublicAdminPath = adminPublicPaths.some(p => pathname.startsWith(p))

    // Not logged in
    if (!user) {
      if (isPublicAdminPath) return supabaseResponse
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Logged in but not the admin account
    const isAdmin = user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
      if (isPublicAdminPath) return supabaseResponse
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Authenticated admin — check MFA assurance level
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const currentLevel = aalData?.currentLevel
    const nextLevel = aalData?.nextLevel

    // Already aal2 on a public auth page → send to dashboard
    if (isPublicAdminPath && currentLevel === 'aal2') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }

    // Allow public admin paths (login / totp-setup / totp-verify) through
    if (isPublicAdminPath) return supabaseResponse

    // Protected admin pages require aal2
    if (currentLevel !== 'aal2') {
      const url = request.nextUrl.clone()
      // nextLevel === 'aal2' means TOTP is enrolled but not yet verified this session
      url.pathname = nextLevel === 'aal2' ? '/admin/totp-verify' : '/admin/totp-setup'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // ── Creator routes ────────────────────────────────────────────
  const isCreatorRoute = pathname === '/creator' || pathname.startsWith('/creator/')
  const isPublicCreatorRoute =
    pathname === '/creator/signup' || pathname === '/creator/login'

  if (isCreatorRoute && !isPublicCreatorRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/creator/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in creators away from login/signup
  if (isPublicCreatorRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/creator/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
