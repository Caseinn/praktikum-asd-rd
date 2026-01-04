import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      nim?: string | null;
      role?: "STUDENT" | "ADMIN";
    } & DefaultSession["user"];
  }
}
