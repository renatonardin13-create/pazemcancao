import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock3,
  Layers,
  Lock,
  Play,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import { PageLoading } from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { getCourseDetail } from "@/lib/courses.functions";

export const Route = createFileRoute("/_authenticated/produto/$courseId")({
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground/60">Produto não encontrado.</p>
        <Link to="/vitrine" className="mt-4 inline-block text-gold/80 hover:text-gold text-sm">
          Voltar para a vitrine
        </Link>
      </div>
    </div>
  ),
});

const TYPE_LABEL: Record<string, string> = {
  curso_individual: "Curso",
  assinatura: "Assinatura",
  ebook: "Ebook",
  pack: "Pack",
  aula: "Aula",
};

function formatPrice(value?: number | null) {
  if (value == null || isNaN(Number(value))) return null;
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function ProductDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-detail", courseId],
    queryFn: () => getCourseDetail({ data: { courseId } }),
  });

  if (isLoading) return <PageLoading message="Carregando produto..." />;

  if (error || !data?.course) {
    return (
      <StudentLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground/60">Erro ao carregar o produto.</p>
            <Link to="/vitrine" className="mt-4 inline-block text-gold/80 hover:text-gold text-sm">
              Voltar para a vitrine
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { course, lessons, integration, access } = data;
  const canAccess = access?.canAccessCourse;
  const checkoutUrl = integration?.checkout_url;
  const categoryName = (course as any).categories?.name || null;
  const productType = (course as any).product_type;
  const totalLessons = lessons?.length || (course as any).total_lessons || 0;
  const totalDuration = (course as any).total_duration;
  const benefits: string[] = Array.isArray((course as any).benefits)
    ? (course as any).benefits.filter(Boolean)
    : [];

  const promoPrice = formatPrice((course as any).promotional_price);
  const fullPrice = formatPrice((course as any).price);
  const isSubscription = productType === "assinatura";

  const handleCta = () => {
    if (canAccess) {
      navigate({ to: "/cursos/$courseId", params: { courseId } });
      return;
    }
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background pb-24">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-border/10 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-8">
            <Link
              to="/vitrine"
              className="flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                Vitrine
              </span>
            </Link>
          </div>
        </div>

        {/* Hero banner */}
        <section className="relative w-full overflow-hidden">
          <div className="relative aspect-[3/1] max-h-[460px] w-full bg-card/10">
            {(course as any).banner_image_url || (course as any).cover_image_url ? (
              <img
                src={(course as any).banner_image_url ?? (course as any).cover_image_url}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card/30 to-background">
                <BookOpen className="h-20 w-20 text-muted-foreground/15" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="mx-auto w-full max-w-[1200px]">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {categoryName && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/85 backdrop-blur-sm">
                      <Tag className="h-3 w-3" />
                      {categoryName}
                    </span>
                  )}
                  {productType && TYPE_LABEL[productType] && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                      <Layers className="h-3 w-3" />
                      {TYPE_LABEL[productType]}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {course.title}
                </h1>
                {(course as any).short_description && (
                  <p className="mt-3 max-w-2xl text-sm text-muted-foreground/75 sm:text-base">
                    {(course as any).short_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 font-display text-xl font-bold text-foreground/90">
                Sobre o produto
              </h2>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground/85">
                {(course as any).sales_description || (course as any).full_description ? (
                  <p className="whitespace-pre-line">
                    {(course as any).sales_description || (course as any).full_description}
                  </p>
                ) : (
                  <p className="text-muted-foreground/50">Sem descrição adicional.</p>
                )}
              </div>
            </section>

            {benefits.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-xl font-bold text-foreground/90">
                  O que você recebe
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 rounded-xl border border-border/15 bg-card/30 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
                        <Check className="h-3 w-3 text-gold" />
                      </span>
                      <span className="text-sm text-foreground/85">{b}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar — purchase / access card */}
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-card/40 to-card/10 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              <div className="mb-5 space-y-3 text-sm text-muted-foreground/85">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold/80" />
                  <span>{totalLessons} {totalLessons === 1 ? "aula" : "aulas"}</span>
                </div>
                {totalDuration && (
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-gold/80" />
                    <span>{totalDuration}</span>
                  </div>
                )}
                {categoryName && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gold/80" />
                    <span>Categoria: {categoryName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold/80" />
                  <span>Status: {(course as any).status === "published" ? "Disponível" : "Em breve"}</span>
                </div>
              </div>

              {!canAccess && (promoPrice || fullPrice) && (
                <div className="mb-5 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70">
                    {isSubscription ? "Assinatura" : "Pagamento único"}
                  </div>
                  <div className="mt-1 text-3xl font-bold text-gold">
                    {promoPrice || fullPrice}
                  </div>
                  {promoPrice && fullPrice && promoPrice !== fullPrice && (
                    <div className="text-xs text-muted-foreground/55 line-through">
                      {fullPrice}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="premium"
                size="lg"
                className="w-full"
                onClick={handleCta}
                disabled={!canAccess && !checkoutUrl}
              >
                {canAccess ? (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Acessar agora
                  </>
                ) : checkoutUrl ? (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Comprar agora
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Em breve
                  </>
                )}
              </Button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground/55">
                {canAccess
                  ? "Você já tem acesso a este produto."
                  : checkoutUrl
                    ? "Pagamento seguro · acesso liberado automaticamente"
                    : "Em breve estará disponível para compra."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </StudentLayout>
  );
}
