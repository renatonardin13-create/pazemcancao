import { useNavigate } from "@tanstack/react-router";
import { Lock, Play } from "lucide-react";
import type { VitrineCourse } from "./types";

interface Props {
  course: VitrineCourse;
}

export function CoursePosterCard({ course }: Props) {
  const navigate = useNavigate();
  const isOwned = course.access_state === "enrolled" || course.access_state === "owned";
  const comingSoon = course.access_state === "coming_soon";
  const cover = course.cover_image_url || course.banner_image_url;

  const handleClick = () => {
    if (comingSoon) return;
    navigate({
      to: isOwned ? "/cursos/$courseId" : "/produto/$courseId",
      params: { courseId: course.id },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex w-[160px] shrink-0 snap-start flex-col gap-2 text-left transition-transform duration-300 hover:scale-[1.05] sm:w-[180px]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-shadow duration-300 group-hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)] group-hover:ring-primary/40">
        {cover ? (
          <img
            src={cover}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center">
            <span className="font-display text-sm font-semibold text-foreground/80">
              {course.title}
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />

        {/* Lock badge */}
        {!isOwned && !comingSoon && (
          <div className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5 text-primary" />
          </div>
        )}

        {/* Coming soon */}
        {comingSoon && (
          <div className="absolute left-2 top-2 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Em breve
          </div>
        )}

        {/* Owned badge */}
        {isOwned && (
          <div className="absolute left-2 top-2 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Liberado
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 font-display text-sm font-semibold text-white drop-shadow-lg">
            {course.title}
          </h3>
          {course.category_name && (
            <p className="mt-0.5 line-clamp-1 text-[10px] uppercase tracking-wider text-primary/80">
              {course.category_name}
            </p>
          )}
        </div>

        {/* Hover play */}
        {isOwned && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-full bg-primary/90 p-3 shadow-xl">
              <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
