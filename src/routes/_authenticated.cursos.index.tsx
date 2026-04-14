import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Layers, Clock, PlayCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCoursosPage,
});

function MeusCoursosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => getMyCoursesData(),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const courses = data?.courses || [];
  const stats = data?.stats || { total: 0, inProgress: 0, completed: 0 };

  // "Continue de onde parou" — recently accessed, in progress, max 5
  const continueItems = useMemo(() => {
    return courses
      .filter((c: any) => c.last_accessed_at && c.progress_pct > 0 && c.progress_pct < 100)
      .sort((a: any, b: any) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
      .slice(0, 5);
  }, [courses]);

  const filtered = courses.filter((c: any) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "in_progress" && c.progress_pct > 0 && c.progress_pct < 100) ||
      (filter === "completed" && c.progress_pct >= 100) ||
      (filter === "not_started" && c.progress_pct === 0);
    return matchSearch && matchFilter;
  });

  return (
    <StudentLayout>
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 w-full pb-28">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <BookOpen className="h-7 w-7 text-gold" />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                Meus Cursos
              </h1>
              <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                Todos os cursos que você tem acesso
              </p>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 mb-8"
          >
            <div className="rounded-xl border border-border/30 bg-card/8 p-5">
              <p className="text-xs text-muted-foreground/50 mb-1">Total</p>
              <p className="font-display text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/8 p-5">
              <p className="text-xs text-muted-foreground/50 mb-1">Andamento</p>
              <p className="font-display text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.inProgress}
              </p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/8 p-5">
              <p className="text-xs text-muted-foreground/50 mb-1">Concluídos</p>
              <p className="font-display text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.completed}
              </p>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar curso..."
                className="pl-10 bg-card/20 border-border/30"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] bg-card/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="not_started">Não iniciados</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Course List */}
          {isLoading ? (
            <CardGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Você ainda não possui cursos"
                description="Adquira um curso na vitrine para começar sua jornada de aprendizado."
                actionLabel="Explorar Vitrine"
                actionTo="/vitrine"
                actionIcon={ArrowRight}
              />
            ) : (
              <EmptyState
                icon={Search}
                title="Nenhum curso encontrado"
                description="Tente ajustar os filtros para encontrar o que procura."
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course: any, idx: number) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * idx }}
                >
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId: course.id }}
                    className="group block rounded-2xl overflow-hidden border border-border/25 bg-card/10 transition-all duration-500 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 hover:scale-[1.02]"
                  >
                    {/* Cover */}
                    <div className="relative aspect-video overflow-hidden">
                      {course.cover_image_url ? (
                        <img
                          src={course.cover_image_url}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/15 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                      {/* Progress bar at top */}
                      {course.progress_pct > 0 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-black/30">
                          <div
                            className={`h-full rounded-r-full transition-all ${course.progress_pct >= 100 ? "bg-emerald-500" : "bg-gold"}`}
                            style={{ width: `${course.progress_pct}%` }}
                          />
                        </div>
                      )}

                      {/* Status badge */}
                      {course.progress_pct >= 100 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/25 backdrop-blur-md px-2.5 py-1 border border-emerald-500/30">
                          <span className="text-[11px] font-bold text-emerald-400">✓ Concluído</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-display text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
                        {course.title}
                      </h3>
                      {course.short_description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                          {course.short_description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {course.module_count} mód.
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.lesson_count} aulas
                        </span>
                      </div>

                      {/* Progress section */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/15">
                        <Progress value={course.progress_pct} className="h-1.5 flex-1 bg-muted/15" />
                        <span className="text-sm font-bold text-gold tabular-nums">
                          {course.progress_pct}%
                        </span>
                      </div>

                      {/* CTA */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold group-hover:gap-2.5 inline-flex items-center gap-1.5 transition-all">
                          {course.progress_pct > 0 ? "Continuar" : "Iniciar"} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
  );
}
