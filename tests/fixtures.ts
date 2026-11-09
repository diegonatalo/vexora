import {
  createEmptyExperience,
  createEmptyProfile,
  type Profile,
} from "@/lib/schema";

/** Perfil que usa todas as seções, no limite de 3 experiências x 3 tópicos. */
export function completeProfile(): Profile {
  const p = createEmptyProfile();
  p.fullName = "Ana Çéã Souza";
  p.desiredJobTitle = "Desenvolvedora Front-end";
  p.cityState = "São Paulo, SP";
  p.phone = "(11) 90000-0000";
  p.email = "ana@exemplo.com";
  p.links = {
    linkedin: "https://linkedin.com/in/ana",
    github: "https://github.com/ana",
    portfolio: "https://ana.dev",
  };
  p.summary =
    "Desenvolvedora com formação em computação e foco em aplicações web acessíveis.";
  p.experiences = [1, 2, 3].map((n) => ({
    ...createEmptyExperience(),
    jobTitle: `Cargo ${n}`,
    company: `Empresa ${n}`,
    cityState: "São Paulo/SP",
    start: "01/2020",
    end: n === 1 ? "" : "12/2021",
    current: n === 1,
    bullets: [
      "Implementei a migração do sistema de autenticação para OAuth, reduzindo chamados.",
      "Reduzi o tempo de carregamento em 40% com otimização de imagens e divisão de código.",
      "Liderei a criação de um design system usado por três squads.",
    ],
  }));
  p.educations = [
    {
      id: "f1",
      course: "Bacharelado em Ciência da Computação",
      institution: "Universidade Exemplo",
      start: "02/2016",
      end: "12/2019",
      current: false,
    },
  ];
  p.certifications = [
    { id: "c1", name: "Certificação ação", institution: "Órgão", year: "2023" },
    {
      id: "c2",
      name: "Outra certificação",
      institution: "Escola",
      year: "2022",
    },
  ];
  p.skills = [
    { title: "Linguagens", items: ["TypeScript", "JavaScript"] },
    { title: "Frameworks e bibliotecas", items: ["React", "Next.js"] },
    { title: "Ferramentas", items: ["Git", "Docker"] },
  ];
  p.languages = [
    { language: "Português", level: "nativo" },
    { language: "Inglês", level: "avançado" },
  ];
  return p;
}
