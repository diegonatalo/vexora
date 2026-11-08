import Link from "next/link";

// Placeholder: a tela "Adaptar à vaga" é a Fase 5.
export default function VagaPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="font-display text-3xl font-bold">Adaptar à vaga</h1>
      <p className="text-muted mt-2">Esta tela chega na Fase 5.</p>
      <Link href="/editor" className="text-accent mt-4 inline-block underline">
        Voltar ao editor
      </Link>
    </main>
  );
}
