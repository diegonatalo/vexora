import Link from "next/link";
import type { Metadata } from "next";
import { BUTTON } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-accent" aria-hidden="true">
          404
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
          Página não encontrada
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Link href="/" className={`${BUTTON.primary} mt-8`}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
