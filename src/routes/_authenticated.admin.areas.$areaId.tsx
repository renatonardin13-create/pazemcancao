import { createFileRoute } from "@tanstack/react-router";
import { AreaEditPage } from "@/components/admin/areas/AreaEditPage";

export const Route = createFileRoute("/_authenticated/admin/areas/$areaId")({
  component: AreaEditPage,
});
