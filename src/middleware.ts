import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // 🚨 Allow all auth-related routes
    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup")
    ) {
        return NextResponse.next()
    }

    // Check for ANY Supabase token to cover naming variations
    const hasSession =
        req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) ||
        req.cookies.get("sb-access-token") ||
        req.cookies.get("sb-refresh-token")

    if (!hasSession) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/projects/:path*", "/team/:path*", "/settings/:path*", "/map/:path*", "/timeline/:path*", "/workloard/:path*"],
}
