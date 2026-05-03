import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";

export const Route = createFileRoute("/_authenticated/cursos")({
  component: () => (
    <ModuleGuard moduleKey="cursos">
      <Outlet />
    </ModuleGuard>
  ),
});
