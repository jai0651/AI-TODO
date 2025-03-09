import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle production and development URLs
      const productionUrl = process.env.NEXTAUTH_URL || baseUrl;


      // If the URL starts with a slash, prepend the base URL
      if (url.startsWith("/")) {
        return `${productionUrl}${url}`;
      }
      
      // If it's an absolute URL on the same origin, allow it
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === new URL(productionUrl).origin) {
          return url;
        }
      } catch {
        // If URL parsing fails, return to the base URL
        return productionUrl;
      }

      // Default to the base URL
      return productionUrl;
    }
  },
  events: {
    async signIn({ user }) {
      // You can add any additional logic here when a user signs in
    },
  },
  debug: process.env.NODE_ENV === "development",
}; 