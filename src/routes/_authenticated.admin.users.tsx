import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, ShieldCheck, Ban, Activity, UserPlus, Clock, Pencil, ToggleLeft, ToggleRight, Trash2, Copy, KeyRound, BookOpen, Check, Search, MoreHorizontal, ChevronLeft, ChevronRight, TrendingUp, Eye, Mail, Calendar, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listApprovedBuyers } from "@/lib/admin-users.functions";
import { createTrialUser, updateBuyer, toggleBuyerAccess, deleteBuyer, addStudent, listCoursesForSelector, getStudentDetails, toggleStudentCourseAccess } from "@/lib/admin-trial.functions";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [detailBuyer, setDetailBuyer] = useState<any>(null);
  const [detailTab, setDetailTab] = useState("info");
  const [editBuyer, setEditBuyer] = useState<any>(null);
  const [trialEmail, setTrialEmail] = useState("");
  const [trialName, setTrialName] = useState("");
  const [trialDays, setTrialDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Add student form state
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addEnabled, setAddEnabled] = useState(true);
  const [addCourseIds, setAddCourseIds] = useState<string[]>([]);
  const [addPassword, setAddPassword] = useState<string | null>(null);

  // Edit form state
  const [editNome, setEditNome] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editIsTrial, setEditIsTrial] = useState(false);
  const [editTrialDays, setEditTrialDays] = useState(7);
  const [editCanDownload, setEditCanDownload] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listApprovedBuyers(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-selector"],
    queryFn: () => listCoursesForSelector(),
  });

  const courses = coursesData?.courses ?? [];

  const { data: studentDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["student-detail", detailBuyer?.email],
    queryFn: () => getStudentDetails({ data: { email: detailBuyer!.email } }),
    enabled: !!detailBuyer,
  });

  const toggleCourseAccess = useMutation({
    mutationFn: (input: { email: string; courseId: string; grant: boolean }) =>
      toggleStudentCourseAccess({ data: input }),
    onSuccess: (_d, vars) => {
      toast.success(vars.grant ? "Acesso liberado!" : "Acesso removido!");
      queryClient.invalidateQueries({ queryKey: ["student-detail", detailBuyer?.email] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createTrial = useMutation({
    mutationFn: (input: { email: string; nome: string; trialDays: number }) =>
      createTrialUser({ data: input }),
    onSuccess: (result: any) => {
      toast.success("Cliente de teste cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setGeneratedPassword(result.generatedPassword || null);
      setTrialEmail("");
      setTrialName("");
      setTrialDays(7);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao cadastrar cliente de teste");
    },
  });

  const addStudentMut = useMutation({
    mutationFn: (input: { nome: string; email: string; access_enabled: boolean; courseIds: string[] }) =>
      addStudent({ data: input }),
    onSuccess: (result: any) => {
      toast.success("Aluno adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setAddPassword(result.generatedPassword || null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao adicionar aluno");
    },
  });

  const update = useMutation({
    mutationFn: (input: { buyerId: string; nome?: string; access_enabled?: boolean; is_trial?: boolean; trialDays?: number; can_download?: boolean }) =>
      updateBuyer({ data: input }),
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditOpen(false);
      setEditBuyer(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar");
    },
  });

  const toggleAccess = useMutation({
    mutationFn: (input: { buyerId: string; access_enabled: boolean }) =>
      toggleBuyerAccess({ data: input }),
    onSuccess: (_data, variables) => {
      toast.success(variables.access_enabled ? "Acesso liberado!" : "Acesso bloqueado!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao alterar acesso");
    },
  });

  const removeBuyer = useMutation({
    mutationFn: (buyerId: string) => deleteBuyer({ data: { buyerId } }),
    onSuccess: () => {
      toast.success("Usuário excluído!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir");
    },
  });

  const openEditDialog = (buyer: any) => {
    setEditBuyer(buyer);
    setEditNome(buyer.nome || "");
    setEditEnabled(buyer.access_enabled);
    setEditIsTrial(buyer.is_trial || false);
    setEditCanDownload(buyer.can_download !== false);
    setEditTrialDays(7);
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBuyer) return;

    const payload: any = {
      buyerId: editBuyer.id,
      nome: editNome,
      access_enabled: editEnabled,
      can_download: editCanDownload,
    };

    if (editIsTrial) {
      payload.trialDays = editTrialDays;
    } else {
      payload.is_trial = false;
    }

    update.mutate(payload);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentMut.mutate({
      nome: addName,
      email: addEmail,
      access_enabled: addEnabled,
      courseIds: addCourseIds,
    });
  };

  const resetAddForm = () => {
    setAddName("");
    setAddEmail("");
    setAddEnabled(true);
    setAddCourseIds([]);
    setAddPassword(null);
  };

  const toggleCourseSelection = (courseId: string) => {
    setAddCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const buyers = data?.buyers ?? [];
  const activeSessions = data?.activeSessions ?? [];
  const activeSessionEmails = new Set(
    activeSessions.map((session: { email: string }) => session.email.toLowerCase())
  );

  const totalUsers = buyers.length;
  const enabledUsers = buyers.filter((buyer: any) => buyer.access_enabled).length;
  const inactiveUsers = buyers.filter((buyer: any) => buyer.is_trial && isTrialExpired(buyer)).length;
  const blockedUsers = buyers.filter((buyer: any) => !buyer.access_enabled).length;
  const onlineUsers = buyers.filter((buyer: any) => activeSessionEmails.has(buyer.email.toLowerCase())).length;
  const trialUsers = buyers.filter((buyer: any) => buyer.is_trial).length;

  // Filter buyers
  const filteredBuyers = buyers.filter((buyer: any) => {
    const matchesSearch = !searchQuery ||
      buyer.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && buyer.access_enabled && !buyer.is_trial) ||
      (statusFilter === "trial" && buyer.is_trial) ||
      (statusFilter === "blocked" && !buyer.access_enabled);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / ITEMS_PER_PAGE));
  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const isTrialExpired = (buyer: any) => {
    if (!buyer.is_trial || !buyer.trial_expires_at) return false;
    return new Date(buyer.trial_expires_at) < new Date();
  };

  const daysLeft = (buyer: any) => {
    if (!buyer.is_trial || !buyer.trial_expires_at) return null;
    const diff = new Date(buyer.trial_expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gold/60" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground/90 tracking-tight">
              Alunos
            </h1>
            <p className="text-[13px] text-muted-foreground/45">
              Gerencie os alunos da sua plataforma ({totalUsers} total)
            </p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetAddForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold">
              <UserPlus className="h-4 w-4" />
              Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Adicionar Aluno</DialogTitle>
            </DialogHeader>

            {addPassword ? (
              <div className="space-y-4 mt-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <KeyRound className="h-8 w-8 text-emerald-400/60 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground/80 mb-1">Aluno cadastrado!</p>
                  <p className="text-[12px] text-muted-foreground/50 mb-4">Envie a senha abaixo para o aluno acessar:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="rounded-lg bg-card/20 border border-border/20 px-4 py-2 text-lg font-mono font-bold text-gold tracking-wider">
                      {addPassword}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(addPassword);
                        toast.success("Senha copiada!");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-gold/70 hover:bg-gold/10 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {addCourseIds.length > 0 && (
                    <p className="text-[11px] text-emerald-400/60 mt-3">
                      <Check className="h-3 w-3 inline mr-1" />
                      {addCourseIds.length} curso(s) liberado(s) automaticamente
                    </p>
                  )}
                </div>
                <Button className="w-full" onClick={() => { resetAddForm(); setAddOpen(false); }}>
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Nome</Label>
                  <Input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Nome do aluno" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">E-mail</Label>
                  <Input id="add-email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@exemplo.com" required />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">Status</p>
                    <p className="text-[11px] text-muted-foreground/40">
                      {addEnabled ? "Ativo — aluno pode acessar a plataforma" : "Inativo — acesso bloqueado"}
                    </p>
                  </div>
                  <Switch checked={addEnabled} onCheckedChange={setAddEnabled} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gold/60" />
                    Cursos Liberados
                  </Label>
                  {courses.length === 0 ? (
                    <div className="rounded-xl border border-border/10 bg-muted/5 p-4 text-center">
                      <p className="text-[12px] text-muted-foreground/40">Nenhum curso cadastrado ainda.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/10 bg-muted/5 max-h-48 overflow-y-auto divide-y divide-border/5">
                      {courses.map((course: any) => {
                        const isSelected = addCourseIds.includes(course.id);
                        return (
                          <label key={course.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/10 ${isSelected ? "bg-gold/5" : ""}`}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleCourseSelection(course.id)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground/70 truncate">{course.title}</p>
                            </div>
                            <Badge variant="outline" className={`text-[9px] shrink-0 ${course.status === "published" ? "text-emerald-400/70 border-emerald-500/20" : "text-muted-foreground/40 border-border/15"}`}>
                              {course.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {addCourseIds.length > 0 && (
                    <p className="text-[11px] text-gold/60">{addCourseIds.length} curso(s) selecionado(s)</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-gold/90 text-gold-foreground hover:bg-gold" disabled={addStudentMut.isPending}>
                  {addStudentMut.isPending ? "Salvando..." : "Adicionar Aluno"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ativos", value: enabledUsers, color: "text-gold" },
          { label: "Inativos", value: inactiveUsers, color: "text-muted-foreground/60" },
          { label: "Bloqueados", value: blockedUsers, color: "text-destructive/70" },
          { label: "Progresso Médio", value: "0%", color: "text-gold", isProgress: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/15 bg-card/8 p-5"
          >
            <p className="text-[11px] text-muted-foreground/45 mb-1">{stat.label}</p>
            <p className={`font-display text-2xl font-bold ${stat.color}`}>
              {isLoading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nome ou email..."
            className="pl-10 bg-card/10 border-border/15"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[140px] bg-card/10 border-border/15">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="trial">Em teste</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={(v) => { setCourseFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px] bg-card/10 border-border/15">
            <SelectValue placeholder="Todos os cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando alunos...
          </p>
        </div>
      ) : !filteredBuyers.length ? (
        <div className="rounded-xl border border-border/15 bg-card/5 py-16 text-center">
          <Users className="mx-auto mb-4 h-8 w-8 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/35">Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/15 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_100px_80px_140px_120px_50px] gap-4 px-5 py-3 border-b border-border/10 bg-card/5">
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Aluno</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Email</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider text-center">Cursos</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Progresso</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Último Acesso</span>
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider text-center">Ações</span>
          </div>

          {/* Table rows */}
          {paginatedBuyers.map((buyer: any) => {
            const isOnline = activeSessionEmails.has(buyer.email.toLowerCase());
            const isEnabledBuyer = buyer.access_enabled;
            const isTrial = buyer.is_trial;
            const expired = isTrialExpired(buyer);

            return (
              <div
                key={buyer.id}
                className="grid grid-cols-[1fr_1fr_100px_80px_140px_120px_50px] gap-4 items-center px-5 py-3.5 border-b border-border/6 hover:bg-card/8 transition-colors last:border-0"
              >
                {/* Aluno */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold shrink-0">
                    {(buyer.nome || buyer.email).slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-foreground/85 truncate">
                    {buyer.nome || "Sem nome"}
                  </span>
                </div>

                {/* Email */}
                <span className="text-[13px] text-muted-foreground/50 truncate">
                  {buyer.email}
                </span>

                {/* Status */}
                <div>
                  {!isEnabledBuyer ? (
                    <Badge className="bg-destructive/15 text-destructive/80 border-0 text-[10px] font-semibold">
                      Bloqueado
                    </Badge>
                  ) : isTrial && expired ? (
                    <Badge className="bg-amber-500/15 text-amber-400/80 border-0 text-[10px] font-semibold">
                      Expirado
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/15 text-emerald-400/80 border-0 text-[10px] font-semibold">
                      Ativo
                    </Badge>
                  )}
                </div>

                {/* Cursos */}
                <span className="text-sm text-foreground/60 text-center font-medium">0</span>

                {/* Progresso */}
                <div className="flex items-center gap-2">
                  <Progress value={0} className="h-1.5 flex-1 bg-muted/20" />
                  <span className="text-[11px] text-muted-foreground/40 tabular-nums w-8 text-right">0%</span>
                </div>

                {/* Último Acesso */}
                <span className="text-[12px] text-muted-foreground/40">
                  {buyer.last_login_at ? formatDate(buyer.last_login_at) : "Nunca"}
                </span>

                {/* Ações */}
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/20 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEditDialog(buyer)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar aluno
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleAccess.mutate({ buyerId: buyer.id, access_enabled: !isEnabledBuyer })}
                        className="gap-2"
                      >
                        {isEnabledBuyer ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                        {isEnabledBuyer ? "Bloquear acesso" : "Liberar acesso"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(buyer)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir aluno
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/15 disabled:opacity-25 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                page === currentPage
                  ? "bg-gold/90 text-gold-foreground"
                  : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/15"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/15 disabled:opacity-25 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Aluno</DialogTitle>
          </DialogHeader>
          {editBuyer && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                <p className="text-[11px] text-muted-foreground/40 uppercase tracking-wider">E-mail</p>
                <p className="text-sm font-medium text-foreground/70 mt-0.5">{editBuyer.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input id="edit-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Acesso ativo</p>
                  <p className="text-[11px] text-muted-foreground/40">Habilitar ou bloquear acesso</p>
                </div>
                <Switch checked={editEnabled} onCheckedChange={setEditEnabled} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Modo teste</p>
                  <p className="text-[11px] text-muted-foreground/40">Apenas ouvir, sem download</p>
                </div>
                <Switch checked={editIsTrial} onCheckedChange={setEditIsTrial} />
              </div>
              {editIsTrial && (
                <div className="space-y-2">
                  <Label htmlFor="edit-trial-days">Renovar dias de teste</Label>
                  <Input id="edit-trial-days" type="number" min={1} max={90} value={editTrialDays} onChange={(e) => setEditTrialDays(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground/40">
                    {editBuyer.trial_expires_at ? `Expira em: ${formatDate(editBuyer.trial_expires_at)}` : "Sem data de expiração definida"}.
                    Ao salvar, será renovado por {editTrialDays} dias a partir de hoje.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground/70">Permitir download</p>
                  <p className="text-[11px] text-muted-foreground/40">Baixar músicas em MP3</p>
                </div>
                <Switch checked={editCanDownload} onCheckedChange={setEditCanDownload} disabled={editIsTrial} />
              </div>
              <Button type="submit" className="w-full bg-gold/90 text-gold-foreground hover:bg-gold" disabled={update.isPending}>
                {update.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Trial Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setGeneratedPassword(null); }}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Cadastrar Cliente de Teste</DialogTitle>
          </DialogHeader>
          {generatedPassword ? (
            <div className="space-y-4 mt-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <KeyRound className="h-8 w-8 text-emerald-400/60 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground/80 mb-1">Cliente cadastrado!</p>
                <p className="text-[12px] text-muted-foreground/50 mb-4">Envie a senha abaixo para o cliente acessar:</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="rounded-lg bg-card/20 border border-border/20 px-4 py-2 text-lg font-mono font-bold text-gold tracking-wider">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success("Senha copiada!"); }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-gold/70 hover:bg-gold/10 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setGeneratedPassword(null); setOpen(false); }}>Fechar</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); createTrial.mutate({ email: trialEmail, nome: trialName, trialDays }); }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="trial-name">Nome</Label>
                <Input id="trial-name" value={trialName} onChange={(e) => setTrialName(e.target.value)} placeholder="Nome do cliente" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-email">E-mail</Label>
                <Input id="trial-email" type="email" value={trialEmail} onChange={(e) => setTrialEmail(e.target.value)} placeholder="email@exemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-days">Dias de teste</Label>
                <Input id="trial-days" type="number" min={1} max={90} value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} required />
                <p className="text-[11px] text-muted-foreground/40">O cliente poderá apenas ouvir (sem download). Após o prazo, o acesso será bloqueado.</p>
              </div>
              <Button type="submit" className="w-full" disabled={createTrial.isPending}>
                {createTrial.isPending ? "Cadastrando..." : "Cadastrar Cliente de Teste"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground/85">Excluir aluno</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/50">
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-foreground/70">{deleteTarget?.nome || deleteTarget?.email}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground/50">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteTarget) removeBuyer.mutate(deleteTarget.id); setDeleteTarget(null); }}
              className="bg-destructive/80 text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
