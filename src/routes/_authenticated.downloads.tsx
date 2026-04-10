import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: () => <Navigate to="/musicas" />,
});
