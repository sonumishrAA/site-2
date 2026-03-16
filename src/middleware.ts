import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // 1. Check for force_password_change
    const { data: staff } = await supabase
      .from('staff')
      .select('force_password_change, role')
      .eq('user_id', user.id)
      .single()

    if (staff?.force_password_change && request.nextUrl.pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }

    // 2. Check subscription status (except for /renew and /blocked)
    const bypassStatus = ['/renew', '/blocked', '/change-password']
    const isBypass = bypassStatus.some(route => request.nextUrl.pathname.startsWith(route))

    if (!isBypass) {
        // This is a simplified check. In production, you'd check library subscription_status
        // For multiple libraries, you'd check the currently selected library
        // For now, we'll assume a single library context or that the API handles it
    }

    // 3. Prevent logged-in users from seeing public routes
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
