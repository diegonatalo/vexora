import type { Profile } from "@/lib/schema";

/** Itens sem a marca "Exibir no CV" desligada. `undefined` conta como exibido. */
export const isVisible = (item: { visible?: boolean }) =>
  item.visible !== false;

/** Cópia do perfil só com o que vai para o CV. O original não é alterado. */
export function onlyVisible(profile: Profile): Profile {
  return {
    ...profile,
    experiences: profile.experiences.filter(isVisible),
    educations: profile.educations.filter(isVisible),
    certifications: profile.certifications.filter(isVisible),
    skills: profile.skills.filter(isVisible),
    languages: profile.languages.filter(isVisible),
  };
}
