import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/modul"],
        disallow: ["/dashboard", "/api"],
      },
    ],
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
