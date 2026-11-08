import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_DESCRICAO, SITE_NOME, SITE_URL } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NOME} — CV de 1 página para ATS`,
    template: `%s | ${SITE_NOME}`,
  },
  description: SITE_DESCRICAO,
  applicationName: SITE_NOME,
  openGraph: {
    type: "website",
    siteName: SITE_NOME,
    locale: "pt_BR",
    title: `${SITE_NOME} — CV de 1 página para ATS`,
    description: SITE_DESCRICAO,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NOME} — CV de 1 página para ATS`,
    description: SITE_DESCRICAO,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        {/* Aplica o tema salvo antes da primeira pintura (evita o "flash" claro). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("folha:tema");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
