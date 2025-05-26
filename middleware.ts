import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register"

  // Get the authentication cookie
  const userId = request.cookies.get("userId")?.value

  // Redirect logic
  if (isPublicPath && userId) {
    // If user is authenticated and tries to access login/register, redirect to home
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isPublicPath && !userId && !path.startsWith("/api/auth")) {
    // If user is not authenticated and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth routes (for login/register API)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /robots.txt (common files)
     */
    "/((?!_next|static|favicon.ico|robots.txt).*)",
  ],
}
