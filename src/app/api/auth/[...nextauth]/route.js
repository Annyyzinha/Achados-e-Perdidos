import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {

    
    // 1. Validação de Segurança e Domínio Institucional (RF01)
    async signIn({ user }) {

      
      const email = user.email || "";

      // Permite apenas contas institucionais da UTFPR
      const isInstitutional =
        email.endsWith("@alunos.utfpr.edu.br") ||
        email.endsWith("@utfpr.edu.br");

      if (!isInstitutional) {
        // Redireciona de volta com parâmetro de erro de acesso negado
        return "/login?error=AccessDenied";
      }

      // 2. Persistência e Auditoria LGPD no MongoDB (Quadro 2 e RNF07)
      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          // Cria o registro no primeiro acesso registrando a data de consentimento
          await User.create({
            name: user.name,
            email: user.email,
            role: email.endsWith("@utfpr.edu.br") ? "DERDI" : "ALUNO",
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
          // Registra a nova sessão na trilha de auditoria
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

    async jwt({ token, user }) {
    if (token?.email) {
      try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
        }
      } catch (error) {
        console.error("Erro ao carregar role no JWT:", error);
      }
    }
    return token;
  },

    // 3. Propagação dos dados do usuário para a sessão do cliente
    async session({ session }) {
      if (session?.user?.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error("Erro ao enriquecer sessão:", error);
        }
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