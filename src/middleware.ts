import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only process CORS for /api routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
    
    let allowOrigin = "*";
    if (allowedOriginsEnv) {
      const allowedList = allowedOriginsEnv.split(",").map((o) => o.trim());
      if (origin && (allowedList.includes(origin) || allowedList.includes("*"))) {
        allowOrigin = origin;
      } else {
        allowOrigin = allowedList[0] || "*";
      }
    } else if (origin) {
      allowOrigin = origin;
    }

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Origin", allowOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, X-CSRF-Token"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Max-Age", "86400");
      return response;
    }

    // For other methods, continue and append CORS headers to response
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, X-CSRF-Token"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

