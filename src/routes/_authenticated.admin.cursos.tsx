import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/courses" });
  },
});
