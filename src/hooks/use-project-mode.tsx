import { useQuery } from "@tanstack/react-query";
import { getPlatformSettings } from "@/lib/platform-settings.functions";
import { getPlatformModules, type PlatformModule } from "@/lib/platform-modules.functions";

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

/** Default enabled state per project mode (fallback when DB has no rows) */
const MODE_DEFAULTS: Record<ProjectMode, Record<ModuleKey, boolean>> = {
  hibrido: { vitrine: true, louvores: true, cursos: true, ebooks: true, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_musica: { vitrine: true, louvores: true, cursos: false, ebooks: false, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_cursos: { vitrine: true, louvores: false, cursos: true, ebooks: true, trilhas: false, perfil: true, comunidade: false, bonus: false, lancamentos: true },
};

export type PlatformModules = Record<ModuleKey, boolean>;

export function useProjectMode() {
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["platform-modules"],
    queryFn: () => getPlatformModules(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const settings = settingsData?.settings || {};
  const mode: ProjectMode = (settings.general?.project_mode as ProjectMode) || "hibrido";
  const dbModules: PlatformModule[] = modulesData?.modules || [];

  // Build modules map: DB rows take priority, then mode defaults
  const defaults = MODE_DEFAULTS[mode];
  const modules: PlatformModules = { ...defaults };

  if (dbModules.length > 0) {
    for (const mod of dbModules) {
      const key = mod.slug as ModuleKey;
      if (MODULE_KEYS.includes(key)) {
        modules[key] = mod.enabled;
      }
    }
  }

  return {
    mode,
    isLoading: settingsLoading || modulesLoading,
    modules,
    dbModules,
    // convenience shortcuts
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
