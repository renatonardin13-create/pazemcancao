import { useNavigate } from "@tanstack/react-router";
import { Play, Info, Lock } from "lucide-react";
import type { VitrineCourse } from "./types";
import { isCourseUnlocked } from "@/lib/course-access";

interface Props {
  course?: VitrineCourse | null;
}

export function HeroBanner({ course }: Props) {
  const navigate = useNavigate();
  if (!course?.id) return null;

  const isOwned = isCourseUnlocked(course);
  const bg = course.banner_image_url || course.cover_image_url;
  const title = course.display_title || course.title || "Curso em destaque";
  const subtitle = course.display_subtitle || course.short_description || null;

  const handlePrimary = () => {
    navigate({
      to: isOwned ? "/cursos/$courseId" : "/produto/$courseId",
      params: { courseId: course.id },
    });
  };

  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {bg ? (
          <img
            src={bg}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
        )}
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12">
        <div className="max-w-2xl space-y-4">
          {course.category_name && (
            <span className="inline-block rounded-md bg-primary/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
              {course.category_name}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="line-clamp-3 max-w-xl text-sm text-white/85 drop-shadow-lg sm:text-base">
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePrimary}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
            >
              {isOwned ? <Play className="h-5 w-5 fill-current" /> : <Lock className="h-5 w-5" />}
              {isOwned ? "Assistir agora" : "Saiba mais"}
            </button>
            {isOwned && (
              <button
                onClick={() =>
                  navigate({ to: "/produto/$courseId", params: { courseId: course.id } })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <Info className="h-5 w-5" />
                Detalhes
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
