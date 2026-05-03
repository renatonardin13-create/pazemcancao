import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin/musicas")({
  component: () => <AdminDashboard />, // Placeholder until we find the real component
});