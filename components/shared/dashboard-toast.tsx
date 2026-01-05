"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { SESSION_CREATED_TOAST_KEY } from "@/lib/toast-keys";

export default function DashboardToast() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const message = sessionStorage.getItem(SESSION_CREATED_TOAST_KEY);
    if (!message) return;
    sessionStorage.removeItem(SESSION_CREATED_TOAST_KEY);
    toast.success(message);
  }, [pathname]);

  return null;
}
