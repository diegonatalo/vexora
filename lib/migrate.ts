/**
 * Converte dados salvos ou exportados em formatos antigos para o formato atual.
 * Duas mudanças já aconteceram:
 *  1. Os campos tinham nomes em português (nomeCompleto, experiencias, titulo…)
 *     e passaram a ter nomes em inglês.
 *  2. As habilidades eram três listas fixas (linguagens, frameworks,
 *     ferramentas) e viraram grupos livres.
 * Qualquer outra forma passa intacta e é validada pelo schema.
 */
type Loose = Record<string, unknown>;

const isObject = (v: unknown): v is Loose =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function renameKeys(value: unknown, map: Record<string, string>): unknown {
  if (!isObject(value)) return value;
  const out: Loose = {};
  for (const [k, v] of Object.entries(value)) out[map[k] ?? k] = v;
  return out;
}

const LEGACY_PROFILE = {
  nomeCompleto: "fullName",
  cargoDesejado: "desiredJobTitle",
  cidadeUf: "cityState",
  telefone: "phone",
  resumo: "summary",
  experiencias: "experiences",
  formacoes: "educations",
  certificacoes: "certifications",
  habilidades: "skills",
  idiomas: "languages",
};
const LEGACY_EXPERIENCE = {
  cargo: "jobTitle",
  empresa: "company",
  cidadeUf: "cityState",
  inicio: "start",
  fim: "end",
  atual: "current",
  exibir: "visible",
  topicos: "bullets",
};
const LEGACY_EDUCATION = {
  curso: "course",
  instituicao: "institution",
  inicio: "start",
  fim: "end",
  atual: "current",
  exibir: "visible",
};
const LEGACY_CERTIFICATION = {
  nome: "name",
  instituicao: "institution",
  ano: "year",
  exibir: "visible",
};
const LEGACY_LANGUAGE = { idioma: "language", nivel: "level", exibir: "visible" };
const LEGACY_SKILL_GROUP = { titulo: "title", itens: "items", exibir: "visible" };

const LEGACY_LISTS = [
  ["linguagens", "Linguagens"],
  ["frameworks", "Frameworks e bibliotecas"],
  ["ferramentas", "Ferramentas"],
] as const;

const renameAll = (list: unknown, map: Record<string, string>): unknown =>
  Array.isArray(list) ? list.map((item) => renameKeys(item, map)) : list;

export function migrateProfile(raw: unknown): unknown {
  if (!isObject(raw)) return raw;
  const profile = renameKeys(raw, LEGACY_PROFILE) as Loose;

  const skills = profile.skills;
  // Habilidades em listas fixas (formato mais antigo): viram grupos.
  const groups = isObject(skills)
    ? LEGACY_LISTS.flatMap(([key, title]) => {
        const items = skills[key];
        return Array.isArray(items) && items.length > 0
          ? [{ title, items, visible: true }]
          : [];
      })
    : renameAll(skills, LEGACY_SKILL_GROUP);

  const migrated = {
    ...profile,
    experiences: renameAll(profile.experiences, LEGACY_EXPERIENCE),
    educations: renameAll(profile.educations, LEGACY_EDUCATION),
    certifications: renameAll(profile.certifications, LEGACY_CERTIFICATION),
    skills: groups,
    languages: renameAll(profile.languages, LEGACY_LANGUAGE),
  };
  // Só inclui as listas que existiam, para não inventar campos.
  for (const key of Object.keys(migrated) as (keyof typeof migrated)[]) {
    if (migrated[key] === undefined) delete migrated[key];
  }
  return migrated;
}

/** Backup exportado antes da troca de nomes: `formato`, `exportadoEm`, `perfil`. */
export function migrateBackup(raw: unknown): unknown {
  if (!isObject(raw)) return raw;
  const backup = renameKeys(raw, {
    formato: "format",
    exportadoEm: "exportedAt",
    perfil: "profile",
  }) as Loose;
  if ("profile" in backup) {
    return { ...backup, profile: migrateProfile(backup.profile) };
  }
  return backup;
}
