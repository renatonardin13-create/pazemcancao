import { createFileRoute } from "@tanstack/react-router";
import { AdminHeroBannersPage } from "@/components/AdminHeroBannersPanel";

export const Route = createFileRoute("/_authenticated/admin/hero-banners")({
  component: AdminHeroBannersPage,
});
