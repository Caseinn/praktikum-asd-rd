"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

type ThemeProviderProps = {
  children: ReactNode;
  nonce?: string;
};

export default function ThemeProviderClient({ children, nonce }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </ThemeProvider>
  );
}
