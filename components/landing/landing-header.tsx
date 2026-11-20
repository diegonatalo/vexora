import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { BUTTON } from "@/components/ui/styles";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const LandingHeader = () => (
  <header className="border-line/70 bg-paper/80 sticky top-0 z-30 border-b backdrop-blur-md">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
      <BrandLink />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Link href="/app" className={BUTTON.primary}>
          Abrir o editor
        </Link>
      </div>
    </div>
  </header>
);
