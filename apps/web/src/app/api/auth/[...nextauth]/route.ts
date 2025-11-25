import { handlers } from "@/lib/auth";

if (!handlers) {
  throw new Error("NextAuth handlers are not properly initialized. Please check your NEXTAUTH_SECRET environment variable.");
}

export const { GET, POST } = handlers;