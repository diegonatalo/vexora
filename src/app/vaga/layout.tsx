import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adaptar à vaga",
  description:
    "Cole a descrição da vaga e veja quais palavras-chave o seu perfil já cobre. A análise acontece no seu navegador.",
  alternates: { canonical: "/vaga" },
};

export default function VagaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
