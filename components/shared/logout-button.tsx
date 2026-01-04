// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition hover:opacity-90"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
