import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isOnboarding = request.nextUrl.pathname === '/onboarding';
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/');

  if (isPublicApi) {
    return NextResponse.next();
  }

  // Jika tidak ada token dan bukan halaman login/register/onboarding, redirect ke login
  if (!token && !isAuthPage && !isOnboarding && !isRegisterPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah ada token dan mencoba akses halaman login, redirect ke dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
