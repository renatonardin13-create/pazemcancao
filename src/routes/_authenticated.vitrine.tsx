import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { Store, Lock, Play, ArrowRight, ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

function VitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const shelves = data?.shelves || [];
  const promoBanners = data?.promoBanners || [];
  const featuredCourse = data?.featuredCourse;

  // Filter shelves by search term — filter courses within each shelf
  const filteredShelves = useMemo(() => {
    if (!searchTerm.trim()) return shelves;
    const term = searchTerm.toLowerCase();
    return shelves
      .map((shelf: any) => ({
        ...shelf,
        courses: shelf.courses.filter((c: any) =>
          c.title?.toLowerCase().includes(term) ||
          c.short_description?.toLowerCase().includes(term)
        ),
      }))
      .filter((shelf: any) => shelf.courses.length > 0);
  }, [shelves, searchTerm]);

  return (
    <StudentLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 w-full pb-28">
          {/* Hero Banner */}
          {featuredCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[280px] sm:h-[380px] overflow-hidden"
            >
              <img
                src={featuredCourse.banner_image_url || featuredCourse.cover_image_url}
                alt={featuredCourse.display_title || featuredCourse.title}
                className={`w-full h-full object-${featuredCourse.banner_fit || 'cover'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground/90 tracking-tight mb-2">
                  {featuredCourse.display_title || featuredCourse.title}
                </h2>
                {(featuredCourse.display_subtitle || featuredCourse.short_description) && (
                  <p className="text-[13px] text-muted-foreground/50 mb-4 max-w-lg">
                    {featuredCourse.display_subtitle || featuredCourse.short_description}
                  </p>
                )}
                {featuredCourse.id !== '__custom_banner__' && (
                  <CourseActionButton course={featuredCourse} />
                )}
              </div>
            </motion.div>
          )}

          <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8">
            {!featuredCourse && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-8"
              >
                <Store className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Vitrine
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Explore nossos cursos e conteúdos
                  </p>
                </div>
              </motion.div>
            )}

            {/* Search bar */}
            <div className="relative max-w-sm mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cursos..."
                className="pl-9 bg-card/10 border-border/15 text-sm h-10"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-24">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/25 animate-pulse">
                  Carregando vitrine...
                </p>
              </div>
            ) : filteredShelves.length === 0 ? (
              <div className="text-center py-24">
                <Store className="h-10 w-10 text-muted-foreground/15 mx-auto mb-5" />
                <p className="text-sm text-muted-foreground/40">
                  {searchTerm ? "Nenhum curso encontrado para esta busca." : "Nenhum conteúdo disponível na vitrine no momento."}
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredShelves.map((shelf: any, shelfIdx: number) => (
                  <motion.section
                    key={shelf.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: shelfIdx * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-display text-lg font-bold text-foreground/95 tracking-tight">
                        {shelf.name}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                      <span className="text-xs text-muted-foreground/25">
                        {shelf.courses.length} curso{shelf.courses.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Horizontal scroll */}
                    <div className="relative -mx-4 sm:-mx-8 px-4 sm:px-8">
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {shelf.courses.map((course: any) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </div>

                    {/* Promo banner after shelf */}
                    {promoBanners
                      .filter((b: any) => b.position_after_shelf === shelfIdx + 1)
                      .map((banner: any) => (
                        <motion.div
                          key={banner.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="mt-6"
                        >
                          {banner.link_url ? (
                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full rounded-xl border border-border/10 hover:border-gold/20 transition-colors"
                              />
                            </a>
                          ) : (
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="w-full rounded-xl border border-border/10"
                            />
                          )}
                        </motion.div>
                      ))}
                  </motion.section>
                ))}
              </div>
            )}
          </div>
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

function CourseCard({ course }: { course: any }) {
  const isEnrolled = course.access_state === "enrolled" || course.access_state === "in_progress" || course.access_state === "completed";
  const isInProgress = course.access_state === "in_progress";
  const isCompleted = course.access_state === "completed";
  const isLocked = course.access_state === "locked";
  const hasPreview = course.access_state === "preview";
  const isAvailable = course.access_state === "available";
  const isBlocked = course.access_state === "blocked";
  const isExpired = course.access_state === "expired";

  const handleLockedClick = () => {
    if (course.checkout_url) {
      window.open(course.checkout_url, "_blank");
    }
  };

  const cardContent = (
    <div className="group relative w-[220px] sm:w-[260px] shrink-0 snap-start">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/15 group-hover:border-gold/20 transition-all duration-500">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${(isLocked || isBlocked || isExpired) ? "brightness-[0.35] saturate-[0.3]" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <Store className="h-8 w-8 text-muted-foreground/15" />
          </div>
        )}

        {/* Dark overlay for locked/blocked/expired */}
        <div className={`absolute inset-0 ${(isLocked || isBlocked || isExpired) ? "bg-gradient-to-t from-black/95 via-black/60 to-black/30" : "bg-gradient-to-t from-background/90 via-background/30 to-transparent"}`} />

        {/* Lock icon centered for locked/blocked courses */}
        {(isLocked || isBlocked || isExpired) && (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-gold/20 flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-gold/70" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-gold/50">
                {isBlocked ? "Acesso Bloqueado" : isExpired ? "Acesso Expirado" : "Conteúdo Premium"}
              </span>
            </div>
            {isLocked && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-gold/15 backdrop-blur-sm px-3 py-1.5 border border-gold/25">
                <ShoppingCart className="h-3 w-3 text-gold/70" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold/70">
                  Adquirir
                </span>
              </div>
            )}
          </>
        )}

        {/* Preview badge */}
        {hasPreview && !isLocked && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm px-3 py-1.5 border border-emerald-500/20">
            <Play className="h-3 w-3 text-emerald-400/70" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/70">
              Preview
            </span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className={`font-display text-sm font-bold leading-tight line-clamp-2 transition-colors ${(isLocked || isBlocked || isExpired) ? "text-foreground/60" : "text-foreground/90 group-hover:text-gold"}`}>
            {course.title}
          </h3>
          {course.short_description && (
            <p className="text-xs text-muted-foreground/40 mt-1 line-clamp-1">
              {course.short_description}
            </p>
          )}

          <div className="mt-3">
            {isCompleted ? (
              <>
                <div className="w-full h-1 rounded-full bg-emerald-500/20 mb-2">
                  <div className="h-full rounded-full bg-emerald-500/70" style={{ width: '100%' }} />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400/70">
                  ✓ Concluído
                </span>
              </>
            ) : isInProgress ? (
              <>
                <div className="w-full h-1 rounded-full bg-gold/20 mb-2">
                  <div className="h-full rounded-full bg-gold/70" style={{ width: `${course.progress_pct}%` }} />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold/70">
                  {course.progress_pct}% concluído <ArrowRight className="h-3 w-3" />
                </span>
              </>
            ) : isEnrolled ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold/70">
                Acessar <ArrowRight className="h-3 w-3" />
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold/50">
                <ShoppingCart className="h-3 w-3" /> Comprar Agora
              </span>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400/50">
                <Lock className="h-3 w-3" /> Bloqueado
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-400/50">
                <Lock className="h-3 w-3" /> Expirado
              </span>
            ) : hasPreview ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400/60">
                <Play className="h-3 w-3" /> Pré-visualizar
              </span>
            ) : isAvailable ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold/70">
                Ver Detalhes <ArrowRight className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (isEnrolled || hasPreview || isAvailable) {
    return (
      <Link to="/cursos/$courseId" params={{ courseId: course.id }}>
        {cardContent}
      </Link>
    );
  }

  if (isLocked) {
    return (
      <button onClick={handleLockedClick} className="text-left cursor-pointer">
        {cardContent}
      </button>
    );
  }

  // Blocked/expired — show card but no action
  return cardContent;
}

function CourseActionButton({ course }: { course: any }) {
  const isEnrolled = course.access_state === "enrolled";
  const isLocked = course.access_state === "locked";

  if (isEnrolled) {
    return (
      <Link
        to="/cursos/$courseId"
        params={{ courseId: course.id }}
        className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gold transition-colors"
      >
        Acessar Curso <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  if (isLocked && course.checkout_url) {
    return (
      <a
        href={course.checkout_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-gold/15 text-gold/70 border border-gold/20 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gold/25 hover:text-gold/90 transition-all"
      >
        <ShoppingCart className="h-3.5 w-3.5" /> Adquirir Agora
      </a>
    );
  }

  return null;
}
