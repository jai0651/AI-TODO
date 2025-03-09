import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to the home page
        if (req.nextUrl.pathname === "/") {
          return true;
        }

        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                          req.nextUrl.pathname.startsWith("/signup");
        
        // Allow public paths without authentication
        if (isAuthPage) {
          return true;
        }

        // Require token for protected paths
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Specify which routes should be protected
export const config = {
  matcher: [
    // Only protect specific routes
    "/dashboard/:path*",
    "/api/todos/:path*",
    "/api/chat/:path*",
    "/login",
    "/signup",
  ],
}; 