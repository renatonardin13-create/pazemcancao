import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { AreaProvider } from "@/providers/AreaProvider";
import { PlayerProvider } from "@/hooks/use-player";
import { GlobalPlayer } from "@/components/GlobalPlayer";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { Toaster } from "@/components/ui/sonner";
import { SafeBoundary } from "@/components/SafeBoundary";

import "../styles.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { title: "Paz em Canção — 30 Louvores Inéditos" },
      { name: "description", content: "Sua biblioteca espiritual privada com 30 louvores inéditos que tocam a alma." },
      { name: "author", content: "Paz em Canção" },
      { property: "og:title", content: "Paz em Canção — 30 Louvores Inéditos" },
      { property: "og:description", content: "Sua biblioteca espiritual privada com 30 louvores inéditos que tocam a alma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Paz em Canção — 30 Louvores Inéditos" },
      { name: "twitter:description", content: "Sua biblioteca espiritual privada com 30 louvores inéditos que tocam a alma." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/22114c34-0a3b-4085-8a82-b7fc792964ac" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/22114c34-0a3b-4085-8a82-b7fc792964ac" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap", as: "style" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AreaProvider>
          <PlayerProvider>
            <ImpersonationBanner />
            <SafeBoundary fallbackTitle="Erro ao carregar a página">
              <Outlet />
            </SafeBoundary>
            <GlobalPlayer />
            <Toaster richColors position="top-right" />
          </PlayerProvider>
        </AreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
