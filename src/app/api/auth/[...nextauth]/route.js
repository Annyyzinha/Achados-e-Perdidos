import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const ADMIN_EMAIL = "annycosta@alunos.utfpr.edu.br";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email || "";
      const isInstitutional =
        email.endsWith("@alunos.utfpr.edu.br") ||
        email.endsWith("@utfpr.edu.br");

      if (!isInstitutional) {
        return "/login?error=AccessDenied";
      }

      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email });
        const userRole = email === ADMIN_EMAIL ? "DERDI" : "ALUNO";

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            role: userRole,
            consentDate: new Date(),
            auditLog: [
              {
                action: "PRIMEIRO_LOGIN_CONSENTIMENTO_LGPD",
                date: new Date(),
                ip: "Google_OAuth_OIDC",
              },
            ],
          });
        } else {
          existingUser.role = userRole;
          existingUser.auditLog.push({
            action: "LOGIN_EFETUADO",
            date: new Date(),
            ip: "Google_OAuth_OIDC",
          });
          await existingUser.save();
        }
      } catch (error) {
        console.error("Erro ao sincronizar usuário no banco:", error);
      }

      return true;
    },

    async jwt({ token }) {
      if (token?.email) {
        token.role = token.email === ADMIN_EMAIL ? "DERDI" : "ALUNO";
      }
      return token;
    },

    async session({ session }) {
      if (session?.user?.email) {
        session.user.role = session.user.email === ADMIN_EMAIL ? "DERDI" : "ALUNO";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };