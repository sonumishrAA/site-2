import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  // Not logged in → login page
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: staff } = await supabase
      .from('staff')
      .select('role, library_ids')
      .eq('user_id', user.id)
      .single()

    // 1. Library selection check (2+ libraries, no library selected)
    const bypassAll = ['/renew', '/blocked', '/change-password', '/select-library', '/api']
    const isBypass = bypassAll.some(r => request.nextUrl.pathname.startsWith(r))

    if (!isBypass && !isPublicRoute) {
      const libraryIds: string[] = staff?.library_ids || []

      // If owner has 2+ libraries and no cookie selected yet → show selection screen
      if (libraryIds.length > 1 && !request.cookies.get('active_library_id')?.value) {
        return NextResponse.redirect(new URL('/select-library', request.url))
      }

      // Get the selected library id
      const selectedLibId = request.cookies.get('active_library_id')?.value || libraryIds[0]

      if (selectedLibId) {
        const { data: library } = await supabase
          .from('libraries')
          .select('subscription_end, subscription_status, name')
          .eq('id', selectedLibId)
          .single()

        if (library) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const subEnd = new Date(library.subscription_end)
          subEnd.setHours(0, 0, 0, 0)

          const isExpired = today > subEnd

          if (isExpired) {
            if (staff?.role === 'owner') {
              // Owner → renew page for this specific library
              const renewUrl = new URL('/renew', request.url)
              renewUrl.searchParams.set('library_id', selectedLibId)
              return NextResponse.redirect(renewUrl)
            } else {
              // Staff → blocked
              return NextResponse.redirect(new URL('/blocked', request.url))
            }
          }
        }
      }
    }

    // 3. Logged-in users can't see login page
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}