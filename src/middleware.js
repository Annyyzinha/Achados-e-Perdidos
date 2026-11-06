import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "annycosta@alunos.utfpr.edu.br";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      const email = token?.email || "";
      if (email !== ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/?unauthorized=true", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/cadastrar/:path*", "/perfil/:path*", "/admin/:path*"],
};