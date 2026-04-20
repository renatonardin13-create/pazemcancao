import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Play, CheckCircle2 } from "lucide-react";
import type { VitrineCourse } from "./types";
import { getCourseAccessState } from "@/lib/course-access";
import { LockedCourseModal } from "./LockedCourseModal";

interface Props {
  course: VitrineCourse;
}

export function CoursePosterCard({ course }: Props) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  if (!course?.id) return null;

  const access = getCourseAccessState(course);
  const isUnlocked = access === "unlocked";
  const isComingSoon = access === "coming_soon";
  const cover = course.cover_image_url || course.banner_image_url;
  const title = course.title || "Curso sem título";
  const categoryName = course.category_name || null;
  const progress = Number(course.progress_pct ?? 0);
  const isCompleted = isUnlocked && progress >= 100;
  const isInProgress = isUnlocked && progress > 0 && progress < 100;

  const handleClick = () => {
    if (isUnlocked) {
      navigate({ to: "/cursos/$courseId", params: { courseId: course.id } });
      return;
    }
    setModalOpen(true);
  };


  const badge = isCompleted
    ? { label: "Concluído", className: "bg-emerald-500/90 text-white" }
    : isInProgress
      ? { label: "Continuar", className: "bg-primary/90 text-primary-foreground" }
      : isUnlocked
        ? { label: "Liberado", className: "bg-emerald-500/90 text-white" }
        : isComingSoon
          ? { label: "Em breve", className: "bg-primary/90 text-primary-foreground" }
          : null;

  return (
    <>
      <button
        onClick={handleClick}
        className="group relative flex w-full max-w-[185px] min-w-0 snap-start flex-col gap-2 text-left transition-transform duration-300 hover:scale-[1.05]"
      >
        <div className="relative aspect-[9/13] w-full overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-shadow duration-300 group-hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)] group-hover:ring-primary/40">
          {cover ? (
            <img
              src={cover}
              alt={title}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                !isUnlocked ? "brightness-[0.55]" : ""
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center">
              <span className="font-display text-sm font-semibold text-foreground/80">
                {title}
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />

          {/* Lock icon (top-right) for locked */}
          {!isUnlocked && !isComingSoon && (
            <div className="absolute right-2 top-2 rounded-full bg-black/75 p-1.5 backdrop-blur-sm ring-1 ring-primary/40">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
          )}

          {/* Badge top-left */}
          {badge && (
            <div className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
              {badge.label}
            </div>
          )}

          {/* Title */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* Progress bar */}
            {isUnlocked && (isInProgress || isCompleted) && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full ${isCompleted ? "bg-emerald-400" : "bg-primary"}`}
                  style={{ width: `${isCompleted ? 100 : Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </div>

          {/* Hover icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className={`rounded-full p-3 shadow-xl ${isUnlocked ? "bg-primary/90" : "bg-black/70 backdrop-blur ring-1 ring-primary/40"}`}>
              {isUnlocked ? (
                isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
                )
              ) : (
                <Lock className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        </div>
      </button>

      <LockedCourseModal open={modalOpen} onOpenChange={setModalOpen} course={course} />
    </>
  );
}
