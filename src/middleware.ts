import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register');
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding');
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/');

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (!token && !isAuthPage && !isOnboarding && !isRegisterPage) {
    if (request.nextUrl.pathname === '/') {
      console.log(`MIDDLEWARE REDIRECTING ROOT TO /wa`);
      return NextResponse.redirect(new URL('/wa', request.url));
    }
    
    // Allow public access to /wa for demo
    if (request.nextUrl.pathname.startsWith('/wa')) {
      return NextResponse.next();
    }

    console.log(`MIDDLEWARE REDIRECTING TO LOGIN from: ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah ada token dan mencoba akses halaman login, redirect ke dashboard
  if (token && isAuthPage) {
    console.log(`MIDDLEWARE REDIRECTING TO DASHBOARD from: ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`MIDDLEWARE ALLOWING: ${request.nextUrl.pathname}`);
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
