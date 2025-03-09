import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                      req.nextUrl.pathname.startsWith("/signup");
    
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthPage && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and trying to access protected pages, redirect to login
    if (!isAuthPage && !req.nextauth.token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                          req.nextUrl.pathname.startsWith("/signup");
        
        // Always allow access to auth pages
        if (isAuthPage) {
          return true;
        }

        // For all other pages, require authentication
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
    "/dashboard/:path*",
    "/api/todos/:path*",
    "/api/chat/:path*",
    "/login",
    "/signup",
  ],
}; 