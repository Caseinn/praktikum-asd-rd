"use client";

import { usePathname } from "next/navigation";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider";
import { baseOptions, linkItems } from "@/lib/layout.shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login";

  return (
    <RootProvider>
      <HomeLayout
        {...baseOptions()}
        links={hideNavbar ? [] : linkItems}
      >
        {children}
      </HomeLayout>
    </RootProvider>
  );
}
