import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// "/" só redireciona para /editor, então fica de fora.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ["/editor"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
  }));
}
