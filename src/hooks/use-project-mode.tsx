import { useQuery } from "@tanstack/react-query";
import { getPlatformSettings } from "@/lib/platform-settings.functions";

export type ProjectMode = "somente_musica" | "somente_cursos" | "hibrido";

export function useProjectMode() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const mode: ProjectMode = (data?.settings?.general?.project_mode as ProjectMode) || "hibrido";

  return {
    mode,
    isLoading,
    showMusic: mode === "somente_musica" || mode === "hibrido",
    showCourses: mode === "somente_cursos" || mode === "hibrido",
  };
}
