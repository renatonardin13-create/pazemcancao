import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: () => <AdminDashboard />,
});