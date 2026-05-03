import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/musicas")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/tracks" });
  },
});
