import { useQuery } from "@tanstack/react-query";
import { getPlatformSettings } from "@/lib/platform-settings.functions";

export type ProjectMode = "somente_musica" | "somente_cursos" | "hibrido";

export const MODULE_KEYS = [
  "vitrine",
  "louvores",
  "cursos",
  "ebooks",
  "trilhas",
  "perfil",
  "comunidade",
  "bonus",
  "lancamentos",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

/** Default enabled state per project mode */
const MODE_DEFAULTS: Record<ProjectMode, Record<ModuleKey, boolean>> = {
  hibrido: { vitrine: true, louvores: true, cursos: true, ebooks: true, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_musica: { vitrine: true, louvores: true, cursos: false, ebooks: false, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_cursos: { vitrine: true, louvores: false, cursos: true, ebooks: true, trilhas: false, perfil: true, comunidade: false, bonus: false, lancamentos: true },
};

export type PlatformModules = Record<ModuleKey, boolean>;

export function useProjectMode() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const settings = data?.settings || {};
  const mode: ProjectMode = (settings.general?.project_mode as ProjectMode) || "hibrido";

  // Merge: mode defaults ← admin overrides
  const savedModules: Partial<PlatformModules> = settings.modules || {};
  const defaults = MODE_DEFAULTS[mode];
  const modules: PlatformModules = { ...defaults };
  for (const key of MODULE_KEYS) {
    if (key in savedModules) {
      modules[key] = !!savedModules[key];
    }
  }

  return {
    mode,
    isLoading,
    modules,
    // convenience shortcuts (combine mode + module toggles)
    showMusic: modules.louvores,
    showCourses: modules.cursos,
    showVitrine: modules.vitrine,
    showEbooks: modules.ebooks,
    showTrilhas: modules.trilhas,
    showPerfil: modules.perfil,
    showComunidade: modules.comunidade,
    showBonus: modules.bonus,
    showLancamentos: modules.lancamentos,
  };
}
