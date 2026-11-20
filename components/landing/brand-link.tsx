import Link from "next/link";
import { Icon } from "@/components/ui/icons";

/** Marca do Vexora com link para a página inicial. */
export const BrandLink = () => (
  <Link href="/" aria-label="Vexora, página inicial" className="flex items-center gap-2.5 rounded-xl">
    <span className="bg-accent text-on-accent grid size-10 place-items-center rounded-xl shadow-sm">
      <Icon name="logo" size={22} />
    </span>
    <span className="font-display text-2xl font-bold tracking-tight">Vexora</span>
  </Link>
);
