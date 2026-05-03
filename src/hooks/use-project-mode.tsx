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

/** Per-module visibility info */
export interface ModuleInfo {
  enabled: boolean;
  visibleInMenu: boolean;
  visibleInVitrine: boolean;
}

/** Default enabled state per project mode (fallback when DB has no rows) */
const MODE_DEFAULTS: Record<ProjectMode, Record<ModuleKey, boolean>> = {
  hibrido: { vitrine: true, louvores: true, cursos: true, ebooks: true, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_musica: { vitrine: true, louvores: true, cursos: false, ebooks: false, trilhas: true, perfil: true, comunidade: false, bonus: true, lancamentos: true },
  somente_cursos: { vitrine: true, louvores: false, cursos: true, ebooks: true, trilhas: false, perfil: true, comunidade: false, bonus: false, lancamentos: true },
};

export type PlatformModules = Record<ModuleKey, boolean>;
export type PlatformModuleInfoMap = Record<ModuleKey, ModuleInfo>;

export function useProjectMode() {
  const {
    data: settingsData,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: modulesData,
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: ["platform-modules"],
    queryFn: () => getPlatformModules().catch(() => ({ modules: [] })), // Catch missing table errors
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const settings = settingsData?.settings || {};
  const mode: ProjectMode = (settings.general as any)?.project_mode || "hibrido";
  const dbModules: PlatformModule[] = modulesData?.modules || [];

  const defaults = MODE_DEFAULTS[mode];
  const modules: PlatformModules = { ...defaults };
  const moduleInfo: PlatformModuleInfoMap = {} as PlatformModuleInfoMap;

  for (const key of MODULE_KEYS) {
    moduleInfo[key] = {
      enabled: defaults[key],
      visibleInMenu: defaults[key],
      visibleInVitrine: defaults[key],
    };
  }

  if (dbModules.length > 0) {
    for (const mod of dbModules) {
      const key = mod.slug as ModuleKey;
      if (MODULE_KEYS.includes(key)) {
        modules[key] = mod.enabled;
        moduleInfo[key] = {
          enabled: mod.enabled,
          visibleInMenu: mod.enabled && mod.visible_in_menu,
          visibleInVitrine: mod.enabled && mod.visible_in_vitrine,
        };
      }
    }
  }

  return {
    mode,
    isLoading: settingsLoading || modulesLoading,
    modules,
    moduleInfo,
    dbModules,
    showMusic: modules.louvores,
    showCourses: modules.cursos,
    showVitrine: modules.vitrine,
    showEbooks: modules.ebooks,
    showTrilhas: modules.trilhas,
    showPerfil: modules.perfil,
    showComunidade: modules.comunidade,
    showBonus: modules.bonus,
    showLancamentos: modules.lancamentos,
    showMusicInMenu: moduleInfo.louvores.visibleInMenu,
    showCoursesInMenu: moduleInfo.cursos.visibleInMenu,
    showVitrineInMenu: moduleInfo.vitrine.visibleInMenu,
    showPerfilInMenu: moduleInfo.perfil.visibleInMenu,
    showEbooksInMenu: moduleInfo.ebooks.visibleInMenu,
    showTrilhasInMenu: moduleInfo.trilhas.visibleInMenu,
    showComunidadeInMenu: moduleInfo.comunidade.visibleInMenu,
    showBonusInMenu: moduleInfo.bonus.visibleInMenu,
    showLancamentosInMenu: moduleInfo.lancamentos.visibleInMenu,
    showMusicInVitrine: moduleInfo.louvores.visibleInVitrine,
    showCoursesInVitrine: moduleInfo.cursos.visibleInVitrine,
    showEbooksInVitrine: moduleInfo.ebooks.visibleInVitrine,
    showTrilhasInVitrine: moduleInfo.trilhas.visibleInVitrine,
    showBonusInVitrine: moduleInfo.bonus.visibleInVitrine,
    showLancamentosInVitrine: moduleInfo.lancamentos.visibleInVitrine,
  };
}
