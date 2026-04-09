import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Video, BookText, Filter, Search } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { useQuery } from "@tanstack/react-query";
import { listPublishedCourses, listCategories } from "@/lib/courses.functions";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: CourseShowcasePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function CourseShowcasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"all" | "video" | "ebook">("all");

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["published-courses"],
    queryFn: () => listPublishedCourses(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const courses = coursesData?.courses || [];
  const categories = categoriesData?.categories || [];

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch =
      !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || course.category_id === activeCategory;
    const matchesType = activeType === "all" || course.course_type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Group by category for shelves
  const coursesByCategory = categories
    .map((cat: any) => ({
      ...cat,
      courses: filteredCourses.filter((c: any) => c.category_id === cat.id),
    }))
    .filter((cat: any) => cat.courses.length > 0);

  const uncategorized = filteredCourses.filter(
    (c: any) => !c.category_id || !categories.find((cat: any) => cat.id === c.category_id)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="font-display text-3xl sm:text-4xl font-bold text-foreground/90 tracking-tight"
          >
            Vitrine de Cursos
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-2 text-[14px] text-muted-foreground/50 font-light"
          >
            Explore nossos cursos disponíveis
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cursos..."
              className="pl-9 bg-card/10 border-border/15 text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type filters */}
            {[
              { key: "all" as const, label: "Todos" },
              { key: "video" as const, label: "Vídeo", icon: Video },
              { key: "ebook" as const, label: "eBook", icon: BookText },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                  activeType === type.key
                    ? "border-gold/30 bg-gold/10 text-gold/80"
                    : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
                }`}
              >
                {type.icon && <type.icon className="h-3 w-3" />}
                {type.label}
              </button>
            ))}

            {/* Category filter */}
            <div className="h-4 w-px bg-border/20 mx-1 hidden sm:block" />
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                !activeCategory
                  ? "border-gold/30 bg-gold/10 text-gold/80"
                  : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
              }`}
            >
              Todas categorias
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? "border-gold/30 bg-gold/10 text-gold/80"
                    : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {coursesLoading ? (
          <div className="text-center py-24">
            <div className="w-px h-12 mx-auto bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe mb-6" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold/25">
              Carregando cursos...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-10 w-10 text-muted-foreground/15 mx-auto mb-5" />
            <p className="text-sm text-muted-foreground/40">
              Nenhum curso encontrado.
            </p>
            <p className="text-[12px] text-muted-foreground/25 mt-1">
              Tente ajustar os filtros ou aguarde novos lançamentos.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Category shelves */}
            {coursesByCategory.map((category: any, catIdx: number) => (
              <motion.section
                key={category.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.3 + catIdx * 0.1}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-lg">{category.icon || "📁"}</span>
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                  <span className="text-[10px] text-muted-foreground/25">
                    {category.courses.length} curso{category.courses.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.courses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </motion.section>
            ))}

            {/* Uncategorized */}
            {uncategorized.length > 0 && (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    Outros Cursos
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {uncategorized.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* All courses flat view when no category filter */}
            {coursesByCategory.length === 0 && uncategorized.length === 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <div className="group rounded-2xl border border-border/15 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/15 hover:bg-card/20 hover:shadow-[0_8px_30px_-12px] hover:shadow-gold/10">
      {/* Cover */}
      <div className="relative aspect-video bg-muted/10 overflow-hidden">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {course.course_type === "video" ? (
              <Video className="h-8 w-8 text-gold/20" />
            ) : (
              <BookText className="h-8 w-8 text-blue-400/20" />
            )}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge
            className={`text-[9px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${
              course.course_type === "video"
                ? "bg-gold/20 text-gold border-gold/25"
                : "bg-blue-400/20 text-blue-300 border-blue-400/25"
            } border backdrop-blur-sm`}
          >
            {course.course_type === "video" ? (
              <><Video className="h-2.5 w-2.5 mr-1 inline" />Vídeo</>
            ) : (
              <><BookText className="h-2.5 w-2.5 mr-1 inline" />eBook</>
            )}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-base font-bold text-foreground/85 tracking-tight line-clamp-2 group-hover:text-gold/80 transition-colors duration-300">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="mt-2 text-[12px] leading-[1.8] text-muted-foreground/40 line-clamp-2">
            {course.short_description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.total_lessons > 0 && (
              <span className="text-[10px] text-muted-foreground/30">
                {course.total_lessons} aulas
              </span>
            )}
            {course.total_duration && course.total_duration !== "0h" && (
              <span className="text-[10px] text-muted-foreground/25">
                · {course.total_duration}
              </span>
            )}
          </div>
          {course.price > 0 && (
            <span className="font-display text-sm font-bold text-gold/70">
              R$ {Number(course.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
