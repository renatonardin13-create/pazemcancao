import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings" });
  },
});
