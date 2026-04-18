import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { requireProductAccess } from "@/lib/require-product-access";

export const Route = createFileRoute("/_authenticated/cursos/$courseId")({
  beforeLoad: async ({ params }) => {
    try {
      await requireProductAccess({ data: { courseId: params.courseId } });
    } catch {
      // Sem entitlement real → manda para a Vitrine (oferta).
      throw redirect({ to: "/vitrine" });
    }
  },
  component: () => <Outlet />,
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-6">
      <p className="text-foreground">Não foi possível carregar este curso.</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Link to="/vitrine" className="text-gold underline">Ver vitrine</Link>
    </div>
  ),
});
