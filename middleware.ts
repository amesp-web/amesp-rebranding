import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for routes that don't need authentication
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/maricultor/dashboard")) {
    return
  }

  try {
    return await updateSession(request)
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return
  }
}

export const config = {
  matcher: ["/admin/:path*", "/maricultor/dashboard/:path*"],
}
