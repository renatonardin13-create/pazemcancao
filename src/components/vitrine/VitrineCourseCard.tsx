import { memo, useCallback, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, BookOpenCheck, Clock3, Lock, Play, ShoppingCart } from "lucide-react";
import { PosterCard } from "@/components/PosterCard";
import { UnlockModal } from "@/components/UnlockModal";
import { VitrineLockedModal } from "./VitrineLockedModal";
import { isContentUnlocked, isContentComingSoon } from "@/lib/vitrine-access";
import type { VitrineCourse } from "./types";

interface VitrineCourseCardProps {
  course: VitrineCourse;
  index?: number;
  badge?: ReactNode;
}

export const VitrineCourseCard = memo(function VitrineCourseCard({
  course,
  index = 0,
  badge,
}: VitrineCourseCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unlockOpen, setUnlockOpen] = useState(false);

  const progress = course.progress_pct ?? 0;
  const isReleased = isContentUnlocked(course);
  const isNotLaunched = isContentComingSoon(course);
  const isLocked = !isReleased && !isNotLaunched;
  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;
  const salesUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      if (!isReleased) {
        setUnlockOpen(true);
        return;
      }

      navigate({ to: "/cursos/$courseId", params: { courseId: course.id } });
    },
    [course.id, isReleased, navigate],
  );

  const fallback = (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm">
      <BookOpen className="h-7 w-7 text-white/25" />
    </div>
  );

  const badgeTopLeft = badge
    ? badge
    : isNotLaunched
      ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/95 to-orange-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-black shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
            <Clock3 className="h-2.5 w-2.5" />
            {t('coming_soon')}
          </span>
        )
      : isLocked
        ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gradient-to-r from-gold/95 to-amber-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-gold-foreground shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
              <Lock className="h-2.5 w-2.5" />
              {t('premium')}
            </span>
          )
        : isCompleted
          ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
                <BookOpenCheck className="h-2.5 w-2.5" />
                {t('completed')}
              </span>
            )
          : isInProgress
            ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-gold-foreground shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
                  <Play className="h-2.5 w-2.5 fill-current" />
                  {t('in_progress')}
                </span>
              )
            : undefined;

  const badgeTopRight = isLocked
    ? (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/50 backdrop-blur-sm">
          <Lock className="h-3 w-3 text-white/45" />
        </div>
      )
    : undefined;

  const overlay = isNotLaunched
    ? (
        <div className="flex h-full flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-[2px]">
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-lg">
            {t('coming_soon')}
          </span>
          <span className="text-[10px] font-medium text-white/60">{t('tap_for_details')}</span>
        </div>
      )
    : isLocked
      ? (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 bg-black/40 backdrop-blur-[2px]">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-gold/10 blur-xl animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/20 to-amber-600/10 shadow-lg shadow-gold/10">
                <Lock className="h-6 w-6 text-gold/70" />
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60">{t('premium_content')}</span>
            {salesUrl ? (
              <span className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-gold/35">
                <ShoppingCart className="h-2.5 w-2.5" />
                {t('tap_to_unlock')}
              </span>
            ) : null}
          </div>
        )
      : undefined;

  const centerAction = isReleased
    ? (
        <div className="flex h-full flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold shadow-2xl shadow-gold/40 transition-transform duration-300 group-hover/card:scale-110">
            <Play className="h-5 w-5 fill-current text-black" />
          </div>
          <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white">Assistir agora</span>
        </div>
      )
    : undefined;

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as unknown as MouseEvent);
          }
        }}
        className="group/card relative block cursor-pointer"
      >
        <PosterCard
          cover={course.cover_image_url || null}
          coverAlt={course.title}
          fallback={fallback}
          gradientClass={isLocked ? "from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "from-sky-900/40 via-blue-950/30 to-slate-950/50"}
          badgeTopLeft={badgeTopLeft}
          badgeTopRight={badgeTopRight}
          overlay={overlay}
          centerAction={centerAction}
          title={course.title}
          subtitle={course.category_name}
          meta={
            <div className="flex items-center gap-3">
              {course.total_duration && (
                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {course.total_duration}
                </span>
              )}
              {!isLocked && progress > 0 && (
                <span className="text-gold font-black">
                  {progress}%
                </span>
              )}
            </div>
          }
          progress={!isLocked && progress > 0 ? progress : null}
          progressColorClass={isCompleted ? "bg-emerald-400" : "bg-gold"}
          locked={isLocked}
          index={index}
        />
      </div>

      {isLocked && (
        <VitrineLockedModal open={unlockOpen} onOpenChange={setUnlockOpen} course={course} />
      )}

      {isNotLaunched && (
        <UnlockModal
          open={unlockOpen}
          onOpenChange={setUnlockOpen}
          productType={course.product_type === "assinatura" ? "assinatura" : "curso_individual"}
          productId={course.id}
          title={course.title}
          description={course.sales_description || course.short_description || course.full_description}
          coverUrl={course.cover_image_url || undefined}
          checkoutUrl={null}
          benefits={Array.isArray(course.benefits) ? course.benefits.filter(Boolean) : []}
          totalLessons={course.total_lessons}
          totalDuration={course.total_duration}
          categoryName={course.category_name}
          comingSoon
        />
      )}
    </>
  );
});