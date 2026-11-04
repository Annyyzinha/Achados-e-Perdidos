import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Regra para o Painel Administrativo (/admin): apenas servidores do DERDI
    if (path.startsWith("/admin")) {
      const email = token?.email || "";
      const isDerdi = 
        email.endsWith("@utfpr.edu.br") || 
        email === "annycosta@alunos.utfpr.edu.br" || 
        token?.role === "DERDI";

      if (!isDerdi) {
        // Redireciona usuários comuns para a home com aviso
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

// Rotas protegidas que exigem autenticação obrigatória
export const config = {
  matcher: ["/cadastrar/:path*", "/perfil/:path*", "/admin/:path*"],
};