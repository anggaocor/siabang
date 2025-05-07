import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('sb-access-token')?.value

  const protectedPaths = ['/InputPage']
  const { pathname } = request.nextUrl

  if (protectedPaths.includes(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
