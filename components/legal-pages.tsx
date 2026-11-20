import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-20";

const linkClass = "text-accent-deep font-semibold underline underline-offset-2";

const Header = () => (
  <div className="mb-10">
    <BrandLink />
  </div>
);

const Footer = () => <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />;

const Contact = () => (
  <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
    {PRIVACY_EMAIL}
  </a>
);

export const PrivacyPage = () => (
  <>
    <LegalPage
      header={<Header />}
      title="Privacidade"
      summary="O Vexora guarda o seu perfil só no seu navegador. Nada do que você preenche vai para um servidor."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                Tudo o que você preenche no editor: nome, cargo desejado, cidade, telefone, e-mail, links (LinkedIn,
                GitHub, portfólio), resumo, experiências, formação, cursos, idiomas e habilidades. Também guardamos a
                sua escolha de tema claro ou escuro.
              </p>
              <p>
                Esses dados ficam no armazenamento deste navegador (IndexedDB), neste aparelho. O PDF também é gerado
                aqui. Nós não temos acesso a nada disso.
              </p>
            </>
          ),
        },
        {
          id: "terceiros",
          title: "Quem mais recebe dados",
          content: (
            <p>
              Só a <strong>Vercel</strong>, a hospedagem do site, que registra dados técnicos de acesso (como IP e
              navegador) para entregar as páginas. Não usamos cookies, estatísticas de visita nem propaganda.
            </p>
          ),
        },
        {
          id: "backup",
          title: "Backup",
          content: (
            <p>
              O botão &quot;Exportar (JSON)&quot; baixa um arquivo com todo o seu perfil. Depois de baixado, ele fica sob
              o seu cuidado: guarde em lugar seguro e não compartilhe.
            </p>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Limpe os dados deste site nas configurações do navegador. O perfil é apagado de vez e só volta se você
              tiver um backup.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Dúvidas sobre esta página: <Contact />.
            </p>
          ),
        },
      ]}
    />
    <Footer />
  </>
);

export const TermsPage = () => (
  <>
    <LegalPage
      header={<Header />}
      title="Termos de uso"
      summary="As regras para usar o Vexora. Ao usar o editor, você concorda com elas."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-e",
          title: "O que é o Vexora",
          content: (
            <p>
              Um editor gratuito de currículo de uma página, pensado para sistemas de triagem (ATS), mantido por Diego
              Natalo como projeto pessoal. O código é aberto, no{" "}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                GitHub
              </a>
              .
            </p>
          ),
        },
        {
          id: "sem-garantia",
          title: "O que ele não garante",
          content: (
            <p>
              A verificação ATS segue boas práticas conhecidas, mas cada empresa usa um sistema diferente. O Vexora não
              garante que o currículo será aprovado em nenhuma triagem nem que vai chegar a um recrutador.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Seus dados",
          content: (
            <p>
              O perfil fica só no seu navegador, e fazer backup é responsabilidade sua: limpar o navegador, trocar de
              aparelho ou usar uma aba anônima pode apagar tudo. Detalhes em{" "}
              <Link href="/privacidade" className={linkClass}>
                Privacidade
              </Link>
              .
            </p>
          ),
        },
        {
          id: "disponibilidade",
          title: "Disponibilidade",
          content: (
            <p>
              O Vexora é oferecido &quot;como está&quot;, sem garantia de que vai funcionar sempre ou sem erros. Ele pode
              mudar ou sair do ar.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              <Contact />
            </p>
          ),
        },
      ]}
    />
    <Footer />
  </>
);
