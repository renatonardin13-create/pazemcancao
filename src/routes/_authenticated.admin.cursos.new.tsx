import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/cursos/new")({
  component: () => <div>Novo Curso</div>,
});