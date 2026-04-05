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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // Refresh the session (important for token rotation)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // /login — redirect if already logged in
  if (pathname === '/login' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role === 'creator') {
      return NextResponse.redirect(new URL('/studio', request.url))
    }
    if (role === 'parent') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // /studio/* — requires auth + creator role
  if (pathname.startsWith('/studio')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'creator') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // /dashboard/* — requires auth + parent role
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'parent') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // /play/* and everything else — no auth required
  return supabaseResponse
}

export const config = {
  matcher: ['/login', '/studio/:path*', '/dashboard/:path*'],
}
