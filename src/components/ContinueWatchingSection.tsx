import { useQuery } from "@tanstack/react-query";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { VitrineCourseCard } from "./vitrine/VitrineCourseCard";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ContinueWatchingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: () => getContinueWatching(),
  });

  if (isLoading || !data?.courses || data.courses.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xs font-black uppercase tracking-[0.2em] text-white/30">
          Continue assistindo
        </h2>
      </div>

      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:gap-6 sm:px-0">
        {data.courses.map((course: any, idx: number) => (
          <motion.a
            key={course.id}
            href={`/cursos/${course.id}/aula/${course.resume_lesson_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative w-[260px] shrink-0 sm:w-[320px] lg:w-[380px] aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/5 transition-all duration-300 hover:scale-[1.03] hover:border-gold/30 shadow-2xl"
          >
            <img 
              src={course.banner_image_url || course.cover_image_url || ""} 
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gold shadow-2xl shadow-gold/40 scale-75 group-hover:scale-100 transition-transform">
                <Play className="h-6 w-6 fill-current text-black" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1 truncate">
                {course.title}
              </p>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight mb-3 truncate">
                {course.resume_lesson_title || "Continuar Aula"}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>{course.progress_pct}% concluído</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress_pct}%` }}
                    className="h-full bg-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  />
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
