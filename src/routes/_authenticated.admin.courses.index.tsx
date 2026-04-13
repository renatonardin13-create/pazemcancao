import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCourses, deleteCourse, updateCourse } from "@/lib/admin-courses.functions";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCourse({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Curso excluído com sucesso");
    },
    onError: (e: Error) => toast.error(e.message),
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
    return list;
  }, [allCourses, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Cursos
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            Gerencie seu catálogo e conteúdo de cursos.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/courses/new">
            <Plus className="h-4 w-4 mr-1" />
            Criar Novo Curso
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
          <Input
            placeholder="Buscar por nome do curso..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10 bg-card/20 border-border/20 text-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-10 bg-card/20 border-border/20 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-border/15 bg-card/5">
          <Video className="h-10 w-10 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/40">
            {allCourses.length === 0
              ? "Nenhum curso cadastrado."
              : "Nenhum curso encontrado com esses filtros."}
          </p>
          {allCourses.length === 0 && (
            <Button asChild size="sm" className="mt-4">
              <Link to="/admin/courses/new">
                <Plus className="h-4 w-4 mr-1" />
                Criar primeiro curso
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="w-[52px] text-[10px] uppercase tracking-widest text-muted-foreground/30">
                  Capa
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30">
                  Nome do Curso
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30 w-[90px]">
                  Tipo
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30 w-[100px]">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30 w-[80px] text-center">
                  Módulos
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30 w-[80px] text-center">
                  Aulas
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/30 w-[60px] text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((course: any) => (
                <TableRow
                  key={course.id}
                  className="border-border/8 hover:bg-card/10"
                >
                  {/* Cover */}
                  <TableCell className="py-2.5">
                    <div className="h-10 w-10 rounded-lg bg-muted/15 overflow-hidden shrink-0">
                      {course.cover_image_url ? (
                        <img
                          src={course.cover_image_url}
                          alt=""
                          className="h-10 w-10 object-cover"
                        />
                      ) : course.course_type === "video" ? (
                        <div className="h-10 w-10 flex items-center justify-center">
                          <Video className="h-4 w-4 text-gold/30" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center">
                          <BookText className="h-4 w-4 text-blue-400/30" />
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
                      <span className="text-[11px] text-muted-foreground/30">
                        {course.categories.name}
                      </span>
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
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

                  {/* Modules */}
                  <TableCell className="text-center">
                    <span className="text-xs text-muted-foreground/50">
                      {course.modules_count ?? 0}
                    </span>
                  </TableCell>

                  {/* Lessons */}
                  <TableCell className="text-center">
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
                            Editar curso
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: course.id }}
                            className="flex items-center gap-2"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            Gerenciar módulos e aulas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Copy className="h-3.5 w-3.5" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja excluir este curso?"
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
            <div className="flex items-center justify-center px-5 py-3 border-t border-border/10 gap-1">
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
