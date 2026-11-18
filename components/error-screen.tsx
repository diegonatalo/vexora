"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BUTTON } from "@/components/ui/styles";

type ErrorScreenProps = {
  error: unknown;
  retry: () => void;
};

export const ErrorScreen = ({ error, retry }: ErrorScreenProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">Algo deu errado</h1>
        <p className="text-muted mx-auto mt-3 max-w-md">
          Esta página encontrou um erro inesperado. Tente de novo ou volte ao início.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className={BUTTON.primary}>
            Tentar de novo
          </button>
          <Link href="/" className={BUTTON.secondary}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
};
