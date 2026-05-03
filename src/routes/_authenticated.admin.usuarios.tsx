import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listApprovedBuyers } from "@/lib/admin-users.functions";
import { Users, Search, MoreHorizontal, Shield, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { useState, useMemo } from "react";
import { TableSkeleton } from "@/components/LoadingSkeletons";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listApprovedBuyers(),
  });

  const filtered = useMemo(() => {
    return (data?.buyers || []).filter((u: any) => 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nome?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.buyers, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-card p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Usuários</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Gerencie os alunos e acessos da plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-background/40 border-border/20 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-border/25">
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : filtered.map((user: any) => (
              <TableRow key={user.id} className="border-border/10 hover:bg-card/20">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.nome || "Sem nome"}</span>
                    <span className="text-xs text-muted-foreground/60">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.overall_status === 'active' ? 'published' : 'draft'} />
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium">{user.course_count} produtos</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gold" style={{ width: `${user.progress_pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{user.progress_pct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2"><Shield className="h-3.5 w-3.5" /> Ver Acessos</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Mail className="h-3.5 w-3.5" /> Enviar E-mail</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Calendar className="h-3.5 w-3.5" /> Histórico</DropdownMenuItem>
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