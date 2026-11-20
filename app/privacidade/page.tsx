import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "O Vexora guarda o seu perfil só no seu navegador. Veja o que fica guardado e como apagar.",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <PrivacyPage />;
}
