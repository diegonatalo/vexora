import type { Profile } from "@/lib/schema";
import { isVisible } from "@/lib/visibility";

export const SECTIONS = [
  { id: "personal", title: "Dados pessoais" },
  { id: "summary", title: "Resumo" },
  { id: "experience", title: "Experiência" },
  { id: "education", title: "Formação" },
  { id: "certifications", title: "Certificações" },
  { id: "skills", title: "Habilidades" },
  { id: "links", title: "Links e portfólio" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export type SectionStatus = {
  completed: boolean;
};

const filled = (v: string) => v.trim() !== "";

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sectionStatuses(p: Profile): Record<SectionId, SectionStatus> {
  const personalComplete =
    filled(p.fullName) &&
    filled(p.desiredJobTitle) &&
    filled(p.cityState) &&
    filled(p.phone) &&
    SIMPLE_EMAIL.test(p.email);

  const expCount = p.experiences.filter(isVisible).length;
  const eduCount = p.educations.filter(isVisible).length;
  const certCount = p.certifications.filter(isVisible).length;
  const hasSkills = p.skills.some(
    (g) => isVisible(g) && g.items.length > 0,
  );

  return {
    personal: { completed: personalComplete },
    summary: { completed: filled(p.summary) },
    experience: {
      completed: expCount > 0,
    },
    education: {
      completed: eduCount > 0,
    },
    certifications: {
      completed: certCount > 0,
    },
    skills: { completed: hasSkills },
    links: {
      completed: filled(p.links.linkedin),
    },
  };
}
