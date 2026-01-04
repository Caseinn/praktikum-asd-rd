import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import { FaGithub, FaInstagram } from "react-icons/fa";

export const linkItems: LinkItemType[] = [
  {
    type: "icon",
    url: "https://instagram.com/ditorifkii",
    label: "instagram",
    text: "Instagram",
    icon: <FaInstagram className="h-4 w-4" />,
    external: true,
  },
  {
    type: "icon",
    url: "https://github.com/Caseinn",
    label: "github",
    text: "Github",
    icon: <FaGithub className="h-4 w-4" />,
    external: true,
  },
];

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Logo"
          >
            <circle cx={12} cy={12} r={12} fill="currentColor" />
          </svg>
          Praktikum
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: linkItems,
  };
}
