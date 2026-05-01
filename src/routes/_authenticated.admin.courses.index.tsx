import { toastError } from "@/lib/toast-utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCourses, deleteCourse, updateCourse } from "@/lib/admin-courses.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { EmptyState } from "@/components/EmptyState";
import { FolderOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Plus,
  Video,
  BookText,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/courses/")({
  component: AdminCoursesPage,
});

const PAGE_SIZE = 6;

function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
  });

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const categories = catData?.categories || [];

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCourse({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-shelves"] });
      toast.success("Produto excluído com sucesso");
    },
    onError: (e: Error) => toastError(e),
  });

  const toggleStatusM = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) =>
      updateCourse({ data: { id, status: currentStatus === "published" ? "draft" : "published" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-shelves"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      toast.success("Status atualizado");
    },
    onError: (e: Error) => toastError(e),
  });

  const allCourses = data?.courses || [];

  const filtered = useMemo(() => {
    let list = allCourses;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c: any) => c.title?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((c: any) => c.status === statusFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((c: any) => c.course_type === typeFilter);
    }
    return list;
  }, [allCourses, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              Produtos
            </h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Gerencie seu catálogo de produtos e conteúdos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-10 w-full sm:w-52 bg-background/40 border-border/20 rounded-xl text-sm placeholder:text-muted-foreground/70"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] h-10 bg-background/40 border-border/20 rounded-xl text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
                <SelectItem value="ebook">eBooks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] h-10 bg-background/40 border-border/20 rounded-xl text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      asChild={categories.length > 0}
                      disabled={categories.length === 0}
                      className="h-10 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background font-bold hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {categories.length > 0 ? (
                        <Link to="/admin/courses/new">
                          <Plus className="h-4 w-4 mr-1.5" />
                          Novo Produto
                        </Link>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Novo Produto
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {categories.length === 0 && (
                  <TooltipContent>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-gold" />
                      Você precisa criar uma seção antes de adicionar produtos
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading || catLoading ? (
        <div className="text-center py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum conteúdo criado ainda"
          description="Para vender, você precisa primeiro criar uma seção. Seções organizam seus conteúdos (ex: Módulo 1, Bônus, Aulas)"
          actionLabel="Criar primeira seção"
          actionTo="/admin/categories"
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-border/30 bg-card shadow-lg shadow-black/10">
          <Video className="h-10 w-10 text-gold/45 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/50 font-medium">
            {allCourses.length === 0
              ? "Nenhum produto cadastrado ainda."
              : "Nenhum curso encontrado com esses filtros."}
          </p>
          {allCourses.length === 0 && (
            <Button asChild size="sm" className="mt-4">
              <Link to="/admin/courses/new">
                <Plus className="h-4 w-4 mr-1" />
                Criar primeiro produto
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg shadow-black/10">
          <Table>
            <TableHeader>
              <TableRow className="border-border/25 hover:bg-transparent">
                <TableHead className="w-[72px] text-xs uppercase tracking-widest text-muted-foreground/60">
                  Capa
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground/60">
                  Nome do Produto
                </TableHead>
                <TableHead className="hidden sm:table-cell text-xs uppercase tracking-widest text-muted-foreground/60 w-[90px]">
                  Tipo
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground/60 w-[100px]">
                  Status
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs uppercase tracking-widest text-muted-foreground/60 w-[80px] text-center">
                  Módulos
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs uppercase tracking-widest text-muted-foreground/60 w-[80px] text-center">
                  Aulas
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground/60 w-[60px] text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((course: any) => (
                <TableRow
                  key={course.id}
                  className="border-border/20 hover:bg-card/20"
                >
                  {/* Cover */}
                  <TableCell className="py-3">
                    <div className="h-14 w-14 rounded-lg bg-muted/15 overflow-hidden shrink-0">
                      {course.cover_image_url ? (
                        <img
                          src={course.cover_image_url}
                          alt=""
                          className="h-14 w-14 object-cover"
                        />
                      ) : course.course_type === "video" ? (
                        <div className="h-14 w-14 flex items-center justify-center">
                          <Video className="h-5 w-5 text-gold/55" />
                        </div>
                      ) : (
                        <div className="h-14 w-14 flex items-center justify-center">
                          <BookText className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <p className="text-sm font-medium text-foreground/80 truncate max-w-[260px]">
                      {course.title}
                    </p>
                    {course.categories?.name && (
                      <span className="text-xs text-muted-foreground/60">
                        {course.categories.name}
                      </span>
                    )}
                  </TableCell>

                  {/* Type - hidden on small */}
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      {course.course_type === "video" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <BookText className="h-3 w-3" />
                      )}
                      {course.course_type === "video" ? "Vídeo" : "eBook"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={course.status} />
                  </TableCell>

                  {/* Modules - hidden on small */}
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xs text-muted-foreground/50">
                      {course.modules_count ?? 0}
                    </span>
                  </TableCell>

                  {/* Lessons - hidden on small */}
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xs text-muted-foreground/50">
                      {course.lessons_count ?? 0}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: course.id }}
                            className="flex items-center gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Gerenciar Produto
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() =>
                            toggleStatusM.mutate({ id: course.id, currentStatus: course.status })
                          }
                        >
                          {course.status === "published" ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Despublicar
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Publicar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja excluir este produto?"
                              )
                            ) {
                              deleteM.mutate(course.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center px-5 py-3 border-t border-border/25 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 text-xs ${p === page ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
