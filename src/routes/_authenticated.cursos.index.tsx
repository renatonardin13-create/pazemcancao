import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Layers, Clock } from "lucide-react";
import { useState } from "react";
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
            className="grid grid-cols-3 gap-4 mb-8"
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
            className="flex items-center gap-3 mb-6"
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
            <div className="text-center py-24">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-5" />
              {courses.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground/70 mb-2">
                    Você ainda não possui cursos liberados.
                  </p>
                  <p className="text-[12px] text-muted-foreground/60 mb-6">
                    Adquira um curso na vitrine para começar sua jornada.
                  </p>
                  <Link
                    to="/vitrine"
                    className="inline-flex items-center gap-2 rounded-xl bg-gold/15 text-gold/70 border border-gold/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gold/25 hover:text-gold/90 transition-all"
                  >
                    Explorar Vitrine <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground/70">
                  Nenhum curso encontrado com os filtros aplicados.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="group flex items-center gap-5 rounded-xl border border-border/30 bg-card/8 p-4 sm:p-5 hover:border-gold/20 hover:bg-card/15 transition-all duration-300"
                  >
                    {/* Cover */}
                    {course.cover_image_url ? (
                      <img
                        src={course.cover_image_url}
                        alt={course.title}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base sm:text-lg font-bold text-foreground/90 uppercase tracking-wide truncate group-hover:text-gold transition-colors">
                        {course.title}
                      </h3>
                      {course.short_description && (
                        <p className="text-[12px] text-muted-foreground/70 mt-1 line-clamp-1">
                          {course.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/45">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {course.module_count} mód.
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.lesson_count} aulas
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-muted-foreground/70">Progresso</span>
                        <Progress value={course.progress_pct} className="h-1.5 flex-1 bg-muted/20" />
                        <span className="text-[12px] font-bold text-gold tabular-nums w-10 text-right">
                          {course.progress_pct}%
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 hidden sm:block">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider group-hover:bg-gold transition-colors">
                        {course.progress_pct > 0 ? "Continuar" : "Iniciar"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
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
