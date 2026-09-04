import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users away from auth pages
    const isAuthPage =
      pathname.startsWith('/login') || pathname.startsWith('/register');

    if (isAuthPage && token) {
      const redirect = req.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirect, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // Pages that require auth
        const protectedPaths = [
          '/dashboard',
          '/upload',
          '/library',
          '/quiz',
          '/games',
          '/community',
          '/tutors',
          '/analytics',
          '/achievements',
          '/settings',
          '/ai-chat',
          '/pomodoro',
          '/material',
        ];

        const isProtected = protectedPaths.some((path) =>
          pathname.startsWith(path)
        );

        if (isProtected) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
