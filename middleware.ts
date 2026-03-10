import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedPaths = [
  '/dashboard',
  '/billing',
  '/agenda',
  '/contratos',
  '/financeiro',
  '/planos-recorrentes',
  '/relatorios',
  '/segmento',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  const hasPaid = Boolean(token.hasPaid)

  if (!hasPaid && pathname !== '/billing') {
    return NextResponse.redirect(new URL('/billing', request.url))
  }

  if (hasPaid && pathname === '/billing') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/billing',
    '/agenda/:path*',
    '/contratos/:path*',
    '/financeiro/:path*',
    '/planos-recorrentes/:path*',
    '/relatorios/:path*',
    '/segmento/:path*',
  ],
}
