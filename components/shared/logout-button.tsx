// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LOGOUT_TOAST_KEY } from "@/lib/toast-keys";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const toastId = toast.loading("Memproses logout...");
    setIsLoggingOut(true);
    try {
      const result = await signOut({ redirect: false, callbackUrl: "/" });
      if (typeof window !== "undefined") {
        sessionStorage.setItem(LOGOUT_TOAST_KEY, "Logout berhasil.");
      }
      toast.dismiss(toastId);
      const target = result?.url ?? "/";
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Gagal logout.", { id: toastId });
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
