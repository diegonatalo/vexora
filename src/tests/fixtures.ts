import {
  criarExperienciaVazia,
  criarPerfilVazio,
  type Perfil,
} from "@/lib/schema";

/** Perfil que usa todas as seções, no limite de 3 experiências x 3 tópicos. */
export function perfilCompleto(): Perfil {
  const p = criarPerfilVazio();
  p.nomeCompleto = "Ana Çéã Souza";
  p.cargoDesejado = "Desenvolvedora Front-end";
  p.cidadeUf = "São Paulo, SP";
  p.telefone = "(11) 90000-0000";
  p.email = "ana@exemplo.com";
  p.links = {
    linkedin: "https://linkedin.com/in/ana",
    github: "https://github.com/ana",
    portfolio: "https://ana.dev",
  };
  p.resumo =
    "Desenvolvedora com formação em computação e foco em aplicações web acessíveis.";
  p.experiencias = [1, 2, 3].map((n) => ({
    ...criarExperienciaVazia(),
    cargo: `Cargo ${n}`,
    empresa: `Empresa ${n}`,
    cidadeUf: "São Paulo/SP",
    inicio: "01/2020",
    fim: n === 1 ? "" : "12/2021",
    atual: n === 1,
    topicos: [
      "Implementei a migração do sistema de autenticação para OAuth, reduzindo chamados.",
      "Reduzi o tempo de carregamento em 40% com otimização de imagens e divisão de código.",
      "Liderei a criação de um design system usado por três squads.",
    ],
  }));
  p.formacoes = [
    {
      id: "f1",
      curso: "Bacharelado em Ciência da Computação",
      instituicao: "Universidade Exemplo",
      inicio: "02/2016",
      fim: "12/2019",
      atual: false,
    },
  ];
  p.certificacoes = [
    { id: "c1", nome: "Certificação ação", instituicao: "Órgão", ano: "2023" },
    {
      id: "c2",
      nome: "Outra certificação",
      instituicao: "Escola",
      ano: "2022",
    },
  ];
  p.habilidades = {
    linguagens: ["TypeScript", "JavaScript"],
    frameworks: ["React", "Next.js"],
    ferramentas: ["Git", "Docker"],
  };
  p.idiomas = [
    { idioma: "Português", nivel: "nativo" },
    { idioma: "Inglês", nivel: "avançado" },
  ];
  return p;
}
