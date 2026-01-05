"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider";
import { toast } from "sonner";
import ToasterProvider from "@/components/shared/toaster-provider";
import { LOGOUT_TOAST_KEY } from "@/lib/toast-keys";
import { baseOptions, linkItems } from "@/lib/layout.shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const message = sessionStorage.getItem(LOGOUT_TOAST_KEY);
    if (!message) return;
    sessionStorage.removeItem(LOGOUT_TOAST_KEY);
    toast.success(message);
  }, []);

  return (
    <RootProvider>
      <ToasterProvider />
      <HomeLayout
        {...baseOptions()}
        links={hideNavbar ? [] : linkItems}
      >
        {children}
      </HomeLayout>
    </RootProvider>
  );
}
