"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-fd-popover)",
          "--normal-text": "var(--color-fd-popover-foreground)",
          "--normal-border": "var(--color-fd-border)",
          "--border-radius": "0.5rem",
          "--success-bg": "color-mix(in oklab, var(--color-fd-success) 20%, var(--color-fd-background))",
          "--success-text": "var(--color-fd-success)",
          "--success-border": "color-mix(in oklab, var(--color-fd-success) 45%, var(--color-fd-background))",
          "--error-bg": "color-mix(in oklab, var(--color-fd-error) 20%, var(--color-fd-background))",
          "--error-text": "var(--color-fd-error)",
          "--error-border": "color-mix(in oklab, var(--color-fd-error) 45%, var(--color-fd-background))",
          "--info-bg": "color-mix(in oklab, var(--color-fd-info) 20%, var(--color-fd-background))",
          "--info-text": "var(--color-fd-info)",
          "--info-border": "color-mix(in oklab, var(--color-fd-info) 45%, var(--color-fd-background))",
          "--warning-bg": "color-mix(in oklab, var(--color-fd-warning) 20%, var(--color-fd-background))",
          "--warning-text": "var(--color-fd-warning)",
          "--warning-border": "color-mix(in oklab, var(--color-fd-warning) 45%, var(--color-fd-background))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
