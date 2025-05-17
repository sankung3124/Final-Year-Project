import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );
          if (!user) {
            throw new Error("No user found with this email");
          }

          const isMatch = await bcrypt.compare(credentials.password, user.password);

          if (isMatch) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          image: profile.picture,
          role: "user",
          onboardingCompleted: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, session, trigger }) {
      if (trigger === "update" && session?.user) {
        token.onboardingCompleted = session.user.onboardingCompleted;
      }

      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
      }

      if (account?.provider === "google" && user) {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const newUser = await User.create({
              firstName: user.firstName || user.name.split(" ")[0],
              lastName: user.lastName || user.name.split(" ")[1] || "",
              email: user.email,
              password: await bcrypt.hash(
                Math.random().toString(36).slice(-8),
                10
              ),
              role: "user",
              onboardingCompleted: false,
            });

            token.id = newUser._id.toString();
            token.firstName = newUser.firstName;
            token.lastName = newUser.lastName;
            token.onboardingCompleted = false;
          } else {
            token.id = existingUser._id.toString();
            token.firstName = existingUser.firstName;
            token.lastName = existingUser.lastName;
            token.onboardingCompleted = existingUser.onboardingCompleted;
            token.role = existingUser.role;
          }
        } catch (error) {}
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/signin",
    newUser: "/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
