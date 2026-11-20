import Image from "next/image";
import { SCREENSHOT } from "@/lib/landing";

/** Print do editor, no tema claro ou escuro conforme a página (classe `dark` no `<html>`). */
export const Screenshot = ({ priority = false }: { priority?: boolean }) => (
  <div className="border-line bg-surface shadow-sheet overflow-hidden rounded-card border">
    <Image
      src={SCREENSHOT.light}
      alt={SCREENSHOT.alt}
      width={1440}
      height={900}
      priority={priority}
      sizes="(min-width: 1152px) 1104px, 100vw"
      className="block h-auto w-full dark:hidden"
    />
    <Image
      src={SCREENSHOT.dark}
      alt={SCREENSHOT.alt}
      width={1440}
      height={900}
      priority={priority}
      sizes="(min-width: 1152px) 1104px, 100vw"
      className="hidden h-auto w-full dark:block"
    />
  </div>
);
