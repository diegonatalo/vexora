import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// "/" só redireciona para /editor, então fica de fora.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/editor`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/vaga`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
