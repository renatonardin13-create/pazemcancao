import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { Tag, Plus, MoreHorizontal, Pencil, Trash2, FolderOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { TableSkeleton } from "@/components/LoadingSkeletons";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const filtered = useMemo(() => {
    return (data?.categories || []).filter((c: any) => 
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.categories, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-card p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Categorias</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Gerencie as categorias de louvores e cursos.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-background/40 border-border/20 rounded-xl"
              />
            </div>
            <Button className="rounded-xl bg-gold text-background font-bold hover:bg-gold/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-border/25">
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/40">Nenhuma categoria encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((cat: any) => (
              <TableRow key={cat.id} className="border-border/10 hover:bg-card/20">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{cat.icon} {cat.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-[10px] bg-muted/20 px-1.5 py-0.5 rounded text-muted-foreground">{cat.slug}</code>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}