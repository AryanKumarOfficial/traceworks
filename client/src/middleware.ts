import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Routes to redirect *away* from if you are logged in
const AUTH_ROUTES = ['/sign-in', '/sign-up'];
// Routes to protect if you are *not* logged in
const PROTECTED_ROUTES = ['/me'];

// Redirect destinations
const HOME_ROUTE = '/';
const LOGIN_ROUTE = '/sign-in';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('access_token')?.value;
    const {pathname} = req.nextUrl;

    // Skip middleware for static assets and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route),
    );

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL("/me", req.url));
    }

    // Redirect logged-out users away from protected pages
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}

// Match which routes the middleware runs for
export const config = {
    matcher: [
        /*
         * Match all page routes
         * Exclude: API routes, Next.js internals, static files
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
