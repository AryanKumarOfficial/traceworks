import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes to redirect *away* from if you are logged in
const AUTH_ROUTES = ['/sign-in', '/sign-up'];
// Routes to protect if you are *not* logged in
const PROTECTED_ROUTES = ['/me'];

// Redirect destinations
const HOME_ROUTE = '/';
const LOGIN_ROUTE = '/sign-in';

export function proxy(req: NextRequest) {
    // 1. Get the access token cookie (fast)
    const token = req.cookies.get('access_token')?.value;
    const { pathname } = req.nextUrl;

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route),
    );

    // 2. Redirect logged-in users from auth pages
    if (isAuthRoute && token) {
        const url = req.nextUrl.clone();
        url.pathname = HOME_ROUTE;
        return NextResponse.redirect(url);
    }

    // 3. Redirect logged-out users from protected pages
    if (isProtectedRoute && !token) {
        const url = req.nextUrl.clone();
        url.pathname = LOGIN_ROUTE;
        return NextResponse.redirect(url);
    }

    // 4. Allow the request to proceed
    return NextResponse.next();
}

// Match which routes the middleware runs for
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};