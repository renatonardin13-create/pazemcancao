import { useQuery } from "@tanstack/react-query";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { VitrineCourseCard } from "./vitrine/VitrineCourseCard";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ContinueWatchingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: () => getContinueWatching({ data: {} }),
  });

  if (isLoading || !data?.courses || data.courses.length === 0) {
    return null;
  }

  const mainCourse = data.courses[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-bold uppercase tracking-widest text-gold mb-1">
            <Sparkles className="h-3 w-3" /> Foco no objetivo
          </div>
          <h2 className="font-display text-2xl font-black text-foreground tracking-tight">
            Continue de onde parou
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main highlight */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 xl:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-card border border-border/40 shadow-2xl shadow-black/20"
        >
          <div className="aspect-[21/9] w-full overflow-hidden relative">
            <img 
              src={mainCourse.banner_image_url || mainCourse.cover_image_url || ""} 
              alt={mainCourse.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {mainCourse.title}
                </h3>
                <p className="text-sm text-white/70 max-w-lg line-clamp-2">
                  {mainCourse.short_description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1 w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
                    <span>Progresso</span>
                    <span className="text-gold">{mainCourse.progress_pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${mainCourse.progress_pct}%` }}
                      className="h-full bg-gold shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                    />
                  </div>
                </div>

                <a 
                  href={`/cursos/${mainCourse.id}/aula/${mainCourse.resume_lesson_id}`}
                  className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-gold text-background font-black text-sm hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-gold/20"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Continuar Aula
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small list */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1 px-2">
            Recentemente acessados
          </div>
          <div className="flex flex-col gap-3">
            {data.courses.slice(1, 4).map((course: any, idx: number) => (
              <motion.a
                key={course.id}
                href={`/cursos/${course.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex items-center gap-4 p-3 rounded-3xl bg-card/40 border border-border/20 hover:border-gold/30 hover:bg-card transition-all"
              >
                <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-border/30">
                  <img src={course.cover_image_url || ""} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate group-hover:text-gold transition-colors">
                    {course.title}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gold/60" style={{ width: `${course.progress_pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{course.progress_pct}%</span>
                  </div>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
