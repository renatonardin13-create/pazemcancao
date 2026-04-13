import { createFileRoute } from "@tanstack/react-router";
import AdminVitrinePage from "@/components/AdminVitrinePage";

export const Route = createFileRoute("/_authenticated/admin/shelves")({
  component: AdminVitrinePage,
});
