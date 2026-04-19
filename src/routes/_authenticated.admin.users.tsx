import { EmptyState } from "@/components/EmptyState";
import { toastError } from "@/lib/toast-utils";
import { ListSkeleton } from "@/components/LoadingSkeletons";
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
  const [accessBuyer, setAccessBuyer] = useState<any>(null);
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
  const [addIsTrial, setAddIsTrial] = useState(false);
  const [addTrialDays, setAddTrialDays] = useState(7);

  // Edit form state
  const [editNome, setEditNome] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editIsTrial, setEditIsTrial] = useState(false);
  const [editTrialDays, setEditTrialDays] = useState(7);
  const [editCanDownload, setEditCanDownload] = useState(true);
  const [editStatus, setEditStatus] = useState("active");
  const [editCourseIds, setEditCourseIds] = useState<string[]>([]);

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

  const { data: accessDetail, isLoading: accessLoading } = useQuery({
    queryKey: ["student-detail", accessBuyer?.email],
    queryFn: () => getStudentDetails({ data: { email: accessBuyer!.email } }),
    enabled: !!accessBuyer,
  });

  const toggleCourseAccess = useMutation({
    mutationFn: (input: { email: string; courseId: string; grant: boolean }) =>
      toggleStudentCourseAccess({ data: input }),
    onSuccess: (_d, vars) => {
      toast.success(vars.grant ? "Acesso liberado!" : "Acesso removido!");
      queryClient.invalidateQueries({ queryKey: ["student-detail"] });
    },
    onError: (err: any) => toastError(err),
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
      toastError(err, "Erro ao cadastrar cliente");
    },
  });

  const addStudentMut = useMutation({
    mutationFn: (input: { nome: string; email: string; access_enabled: boolean; courseIds: string[]; is_trial?: boolean; trialDays?: number }) =>
      addStudent({ data: input }),
    onSuccess: (result: any) => {
      toast.success("Aluno adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setAddPassword(result.generatedPassword || null);
    },
    onError: (err: any) => {
      toastError(err, "Erro ao adicionar aluno");
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
      toastError(err, "Erro ao atualizar");
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
      toastError(err, "Erro ao alterar acesso");
    },
  });

  const removeBuyer = useMutation({
    mutationFn: (buyerId: string) => deleteBuyer({ data: { buyerId } }),
    onSuccess: () => {
      toast.success("Usuário excluído!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toastError(err, "Erro ao excluir");
    },
  });

  // Fetch student detail for edit dialog
  const { data: editStudentDetail } = useQuery({
    queryKey: ["student-detail-edit", editBuyer?.email],
    queryFn: () => getStudentDetails({ data: { email: editBuyer!.email } }),
    enabled: !!editBuyer && editOpen,
  });

  // Sync editCourseIds when detail loads
  const editEnrolledIds = (editStudentDetail?.courses || [])
    .filter((c: any) => c.hasAccess)
    .map((c: any) => c.id);

  const openEditDialog = (buyer: any) => {
    setEditBuyer(buyer);
    setEditNome(buyer.nome || "");
    setEditEnabled(buyer.access_enabled);
    setEditStatus(!buyer.access_enabled ? "blocked" : buyer.is_trial ? "trial" : "active");
    setEditIsTrial(buyer.is_trial || false);
    setEditCanDownload(buyer.can_download !== false);
    setEditTrialDays(7);
    setEditCourseIds([]);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
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

    // Handle course enrollment changes
    if (editCourseIds.length > 0) {
      const toGrant = editCourseIds.filter((id: string) => !editEnrolledIds.includes(id));
      const toRevoke = editEnrolledIds.filter((id: string) => !editCourseIds.includes(id));

      for (const courseId of toGrant) {
        await toggleStudentCourseAccess({ data: { email: editBuyer.email, courseId, grant: true } });
      }
      for (const courseId of toRevoke) {
        await toggleStudentCourseAccess({ data: { email: editBuyer.email, courseId, grant: false } });
      }
    }

    update.mutate(payload);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = addName.trim();
    const trimmedEmail = addEmail.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("E-mail inválido.");
      return;
    }

    // Check for duplicate email in already-loaded buyers list
    const emailExists = buyers.some((b: any) => b.email?.toLowerCase() === trimmedEmail);
    if (emailExists) {
      toast.error("Já existe um aluno com este e-mail.");
      return;
    }

    addStudentMut.mutate({
      nome: trimmedName,
      email: trimmedEmail,
      access_enabled: addEnabled,
      courseIds: addCourseIds,
      is_trial: addIsTrial,
      trialDays: addIsTrial ? addTrialDays : undefined,
    });
  };

  const resetAddForm = () => {
    setAddName("");
    setAddEmail("");
    setAddEnabled(true);
    setAddCourseIds([]);
    setAddPassword(null);
    setAddIsTrial(false);
    setAddTrialDays(7);
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

  const getOverallStatus = (buyer: any): 'active' | 'blocked' | 'refunded' | 'expired' | 'no_access' | 'trial_expired' => {
    const s = buyer.overall_status as string | undefined;
    if (buyer.is_trial && isTrialExpired(buyer)) return 'trial_expired';
    if (s === 'active' || s === 'blocked' || s === 'refunded' || s === 'expired' || s === 'no_access') {
      return s;
    }
    if (buyer.access_enabled === false) return 'blocked';
    return (buyer.course_count ?? 0) > 0 ? 'active' : 'no_access';
  };

  const renderStatusBadge = (buyer: any) => {
    const status = getOverallStatus(buyer);
    const map: Record<string, { label: string; cls: string }> = {
      active:        { label: 'Ativo',        cls: 'bg-emerald-500/15 text-emerald-400/80' },
      blocked:       { label: 'Bloqueado',    cls: 'bg-destructive/15 text-destructive/80' },
      refunded:      { label: 'Reembolsado',  cls: 'bg-rose-500/15 text-rose-400/80' },
      expired:       { label: 'Vencido',      cls: 'bg-amber-500/15 text-amber-400/80' },
      trial_expired: { label: 'Expirado',     cls: 'bg-amber-500/15 text-amber-400/80' },
      no_access:     { label: 'Sem acesso',   cls: 'bg-muted/30 text-muted-foreground' },
    };
    const { label, cls } = map[status];
    return <Badge className={`${cls} border-0 text-xs font-semibold`}>{label}</Badge>;
  };

  const renderCourseStatusBadge = (status?: string | null) => {
    const normalized = (status || 'none').toLowerCase();
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: 'Ativo', cls: 'bg-emerald-500/15 text-emerald-400/80' },
      trial: { label: 'Teste', cls: 'bg-sky-500/15 text-sky-400/80' },
      refunded: { label: 'Reembolsado', cls: 'bg-rose-500/15 text-rose-400/80' },
      chargedback: { label: 'Chargeback', cls: 'bg-rose-500/15 text-rose-400/80' },
      chargeback: { label: 'Chargeback', cls: 'bg-rose-500/15 text-rose-400/80' },
      cancelled: { label: 'Cancelado', cls: 'bg-slate-500/15 text-slate-300/80' },
      canceled: { label: 'Cancelado', cls: 'bg-slate-500/15 text-slate-300/80' },
      expired: { label: 'Vencido', cls: 'bg-amber-500/15 text-amber-400/80' },
      blocked: { label: 'Bloqueado', cls: 'bg-destructive/15 text-destructive/80' },
      none: { label: 'Sem acesso', cls: 'bg-muted/20 text-muted-foreground/70' },
    };
    const { label, cls } = map[normalized] || map.none;
    return <Badge className={`${cls} border-0 text-[10px] px-1.5 py-0 h-4`}>{label}</Badge>;
  };

  const renderOriginBadge = (origin?: string | null) => {
    const normalized = (origin || 'manual').toLowerCase();
    const map: Record<string, { label: string; cls: string }> = {
      manual: { label: 'Manual', cls: 'bg-violet-500/15 text-violet-300/80' },
      webhook: { label: 'Webhook', cls: 'bg-blue-500/15 text-blue-300/80' },
      kiwify: { label: 'Kiwify', cls: 'bg-blue-500/15 text-blue-300/80' },
      hotmart: { label: 'Hotmart', cls: 'bg-orange-500/15 text-orange-300/80' },
      cakto: { label: 'Cakto', cls: 'bg-teal-500/15 text-teal-300/80' },
      trial: { label: 'Trial', cls: 'bg-sky-500/15 text-sky-300/80' },
      test: { label: 'Teste', cls: 'bg-sky-500/15 text-sky-300/80' },
    };
    const { label, cls } = map[normalized] || { label: normalized, cls: 'bg-muted/20 text-muted-foreground/70' };
    return <Badge className={`${cls} border-0 text-[10px] px-1.5 py-0 h-4`}>{label}</Badge>;
  };

  const totalUsers = buyers.length;
  const enabledUsers = buyers.filter((buyer: any) => getOverallStatus(buyer) === 'active').length;
  const inactiveUsers = buyers.filter((buyer: any) => {
    const s = getOverallStatus(buyer);
    return s === 'no_access' || s === 'expired' || s === 'trial_expired';
  }).length;
  const blockedUsers = buyers.filter((buyer: any) => {
    const s = getOverallStatus(buyer);
    return s === 'blocked' || s === 'refunded';
  }).length;
  const onlineUsers = buyers.filter((buyer: any) => activeSessionEmails.has(buyer.email.toLowerCase())).length;
  const trialUsers = buyers.filter((buyer: any) => buyer.is_trial).length;

  const filteredBuyers = buyers.filter((buyer: any) => {
    const matchesSearch = !searchQuery ||
      buyer.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const overallStatus = getOverallStatus(buyer);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && overallStatus === 'active') ||
      (statusFilter === "trial" && buyer.is_trial) ||
      (statusFilter === "blocked" && ['blocked', 'refunded', 'expired', 'trial_expired', 'no_access'].includes(overallStatus));

    const matchesCourse =
      courseFilter === "all" ||
      (courseFilter === "with_courses" && (buyer.courses || []).length > 0) ||
      (courseFilter === "no_courses" && (buyer.courses || []).length === 0);

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / ITEMS_PER_PAGE));
  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              Alunos
            </h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Gerencie os alunos da sua plataforma ({totalUsers} total)
            </p>
          </div>

          <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetAddForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background font-bold hover:shadow-lg hover:shadow-gold/20 transition-all gap-2">
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-gold/70 hover:bg-gold/10 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {addCourseIds.length > 0 && (
                    <p className="text-xs text-emerald-400/60 mt-3">
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
                <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/25 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">Status</p>
                    <p className="text-xs text-muted-foreground/70">
                      {addEnabled ? "Ativo — aluno pode acessar a plataforma" : "Inativo — acesso bloqueado"}
                    </p>
                  </div>
                  <Switch checked={addEnabled} onCheckedChange={setAddEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/25 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">Período de Teste</p>
                    <p className="text-xs text-muted-foreground/70">
                      {addIsTrial ? `Teste por ${addTrialDays} dia(s) — sem download` : "Acesso completo — sem limitação"}
                    </p>
                  </div>
                  <Switch checked={addIsTrial} onCheckedChange={setAddIsTrial} />
                </div>
                {addIsTrial && (
                  <div className="space-y-2">
                    <Label htmlFor="add-trial-days">Dias de Teste</Label>
                    <Select value={String(addTrialDays)} onValueChange={(v) => setAddTrialDays(Number(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="14">14 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gold/60" />
                    Cursos Liberados
                  </Label>
                  {courses.length === 0 ? (
                    <div className="rounded-xl border border-border/25 bg-muted/5 p-4 text-center">
                      <p className="text-[12px] text-muted-foreground/70">Nenhum curso cadastrado ainda.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/25 bg-muted/5 max-h-48 overflow-y-auto divide-y divide-border/5">
                      {courses.map((course: any) => {
                        const isSelected = addCourseIds.includes(course.id);
                        return (
                          <div key={course.id} role="button" tabIndex={0} onClick={() => toggleCourseSelection(course.id)} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleCourseSelection(course.id); }}} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/10 ${isSelected ? "bg-gold/5" : ""}`}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleCourseSelection(course.id)} onClick={(e) => e.stopPropagation()} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground/70 truncate">{course.title}</p>
                            </div>
                            <Badge variant="outline" className={`text-[11px] shrink-0 ${course.status === "published" ? "text-emerald-400/70 border-emerald-500/20" : "text-muted-foreground/70 border-border/30"}`}>
                              {course.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {addCourseIds.length > 0 && (
                    <p className="text-xs text-gold/60">{addCourseIds.length} curso(s) selecionado(s)</p>
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
      </div>

      {/* Stat Cards */}
      {(() => {
        const avgProgress = buyers.length > 0
          ? Math.round(buyers.reduce((sum: number, b: any) => sum + (b.progress_pct || 0), 0) / buyers.length)
          : 0;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Ativos", value: enabledUsers, color: "text-gold" },
              { label: "Inativos", value: inactiveUsers, color: "text-muted-foreground/60" },
              { label: "Bloqueados", value: blockedUsers, color: "text-destructive/70" },
              { label: "Progresso Médio", value: `${avgProgress}%`, color: "text-gold" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/30 bg-card/8 p-5"
              >
                <p className="text-xs text-muted-foreground/45 mb-1">{stat.label}</p>
                <p className={`font-display text-2xl font-bold ${stat.color}`}>
                  {isLoading ? "—" : stat.value}
                </p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nome ou email..."
            className="pl-10 bg-card/20 border-border/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[140px] bg-card/20 border-border/30">
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
            <SelectTrigger className="w-full sm:w-[180px] bg-card/20 border-border/30">
              <SelectValue placeholder="Todos os cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os alunos</SelectItem>
              <SelectItem value="with_courses">Com cursos</SelectItem>
              <SelectItem value="no_courses">Sem cursos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : !filteredBuyers.length ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno encontrado"
          description="Quando novos alunos se cadastrarem ou forem adicionados, eles aparecerão aqui."
          actionLabel="Adicionar Aluno"
          onAction={() => setAddOpen(true)}
          actionIcon={UserPlus}
        />
      ) : (
        <div className="rounded-xl border border-border/30 overflow-hidden">
          {/* Desktop Table header - hidden on mobile */}
          <div className="hidden lg:grid grid-cols-[1fr_1fr_100px_80px_140px_120px_50px] gap-4 px-5 py-3 border-b border-border/25 bg-muted/8">
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Aluno</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Email</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Status</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider text-center">Cursos</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Progresso</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Último Acesso</span>
            <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider text-center">Ações</span>
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
                className="flex flex-col gap-2 px-4 py-4 border-b border-border/15 hover:bg-muted/15 transition-colors last:border-0 lg:grid lg:grid-cols-[1fr_1fr_100px_80px_140px_120px_50px] lg:gap-4 lg:items-center lg:px-5"
              >
                {/* Top row on mobile: avatar + name + status + actions */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold shrink-0">
                    {(buyer.nome || buyer.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground truncate block">
                      {buyer.nome || "Sem nome"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate block lg:hidden">
                      {buyer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:hidden shrink-0">
                    {renderStatusBadge(buyer)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => { setDetailBuyer(buyer); setDetailTab("info"); }} className="gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(buyer)} className="gap-2">
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAccessBuyer(buyer)} className="gap-2">
                          <BookOpen className="h-3.5 w-3.5" />
                          Gerenciar Acessos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => toggleAccess.mutate({ buyerId: buyer.id, access_enabled: !isEnabledBuyer })}
                          className="gap-2"
                        >
                          {isEnabledBuyer ? <ShieldAlert className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                          {isEnabledBuyer ? "Bloquear" : "Liberar acesso"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(buyer)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Mobile bottom info row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground/60 lg:hidden pl-12">
                  <span>{buyer.courses?.length ?? 0} vínculo(s)</span>
                  <span>·</span>
                  <span>{buyer.progress_pct ?? 0}%</span>
                  <span>·</span>
                  <span>{buyer.last_login_at ? formatDate(buyer.last_login_at) : "Nunca"}</span>
                </div>

                <span className="hidden lg:block text-sm text-muted-foreground truncate">
                  {buyer.email}
                </span>

                <div className="hidden lg:block">
                  {renderStatusBadge(buyer)}
                </div>

                <div className="hidden lg:flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-foreground/60 font-medium">{buyer.courses?.length ?? 0} vínculo(s)</span>
                  <div className="flex flex-col gap-1">
                    {(buyer.courses || []).slice(0, 3).map((course: any) => {
                      const origin = buyer.is_trial ? 'trial' : (course.access_origin || 'manual');
                      return (
                        <div key={course.course_id} className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px] text-foreground/70 truncate max-w-[120px]" title={course.course_title}>
                            {course.course_title}
                          </span>
                          {renderCourseStatusBadge(course.status)}
                          {renderOriginBadge(origin)}
                        </div>
                      );
                    })}
                    {(buyer.courses || []).length > 3 ? (
                      <Badge className="bg-muted/20 text-muted-foreground/80 border-0 text-[10px] w-fit">+{(buyer.courses || []).length - 3} mais</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  <Progress value={buyer.progress_pct ?? 0} className="h-1.5 flex-1 bg-muted/20" />
                  <span className="text-xs text-muted-foreground/70 tabular-nums w-8 text-right">{buyer.progress_pct ?? 0}%</span>
                </div>

                <span className="hidden lg:block text-[12px] text-muted-foreground/70">
                  {buyer.last_login_at ? formatDate(buyer.last_login_at) : "Nunca"}
                </span>

                <div className="hidden lg:flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => { setDetailBuyer(buyer); setDetailTab("info"); }} className="gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(buyer)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAccessBuyer(buyer)} className="gap-2">
                        <BookOpen className="h-3.5 w-3.5" />
                        Gerenciar Acessos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleAccess.mutate({ buyerId: buyer.id, access_enabled: !isEnabledBuyer })}
                        className="gap-2"
                      >
                        {isEnabledBuyer ? <ShieldAlert className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                        {isEnabledBuyer ? "Bloquear" : "Liberar acesso"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(buyer)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground/70 hover:bg-muted/15 disabled:opacity-25 transition-all"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground/70 hover:bg-muted/15 disabled:opacity-25 transition-all"
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
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input id="edit-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input id="edit-email" value={editBuyer.email} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => {
                  setEditStatus(v);
                  setEditEnabled(v !== "blocked");
                  setEditIsTrial(v === "trial");
                }}>
                  <SelectTrigger className="bg-card/20 border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Em teste</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cursos Liberados</Label>
                {courses.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground/70 py-2">Nenhum curso cadastrado.</p>
                ) : (
                  <div className="rounded-xl border border-border/25 bg-muted/5 max-h-48 overflow-y-auto divide-y divide-border/5">
                    {courses.map((course: any) => {
                      const isEnrolled = editEnrolledIds.includes(course.id);
                      const isSelected = editCourseIds.includes(course.id);
                      const checked = isSelected !== isEnrolled; // toggled
                      const effectiveChecked = isSelected ? true : (!isSelected && isEnrolled && !editCourseIds.includes(course.id));
                      // Simple: show enrolled state, track toggles
                      const currentlyHasAccess = editCourseIds.length > 0
                        ? editCourseIds.includes(course.id)
                        : isEnrolled;

                      return (
                        <label key={course.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/10 ${currentlyHasAccess ? "bg-gold/5" : ""}`}>
                          <Checkbox
                            checked={currentlyHasAccess}
                            onCheckedChange={() => {
                              // On first interaction, seed from enrolled
                              if (editCourseIds.length === 0 && editEnrolledIds.length > 0) {
                                const newIds = currentlyHasAccess
                                  ? editEnrolledIds.filter((id: string) => id !== course.id)
                                  : [...editEnrolledIds, course.id];
                                setEditCourseIds(newIds);
                              } else {
                                setEditCourseIds((prev) =>
                                  prev.includes(course.id)
                                    ? prev.filter((id) => id !== course.id)
                                    : [...prev, course.id]
                                );
                              }
                            }}
                          />
                          <span className="text-sm text-foreground/70 truncate">{course.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gold/60">
                  {(editCourseIds.length > 0 ? editCourseIds.length : editEnrolledIds.length)} curso(s) selecionado(s)
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={update.isPending}>
                  {update.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-gold/70 hover:bg-gold/10 transition-all"
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
                <p className="text-xs text-muted-foreground/70">O cliente poderá apenas ouvir (sem download). Após o prazo, o acesso será bloqueado.</p>
              </div>
              <Button type="submit" className="w-full" disabled={createTrial.isPending}>
                {createTrial.isPending ? "Cadastrando..." : "Cadastrar Cliente de Teste"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={!!detailBuyer} onOpenChange={(v) => { if (!v) setDetailBuyer(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Detalhes do Aluno</DialogTitle>
          </DialogHeader>
          {detailBuyer && (
            <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="courses">Cursos</TabsTrigger>
                <TabsTrigger value="progress">Progresso</TabsTrigger>
              </TabsList>

              {/* Tab: Informações */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-xl font-bold text-gold shrink-0">
                    {(detailBuyer.nome || detailBuyer.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground/90 truncate">{detailBuyer.nome || "Sem nome"}</p>
                    <p className="text-[13px] text-muted-foreground/50 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {detailBuyer.email}
                    </p>
                    <div className="mt-1">
                      {renderStatusBadge(detailBuyer)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/30 bg-card/8 p-4">
                    <p className="text-xs text-muted-foreground/45 flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3 w-3" />
                      Cadastrado em
                    </p>
                    <p className="text-sm font-semibold text-foreground/80">
                      {detailBuyer.created_at
                        ? new Date(detailBuyer.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-card/8 p-4">
                    <p className="text-xs text-muted-foreground/45 flex items-center gap-1.5 mb-1">
                      <Clock className="h-3 w-3" />
                      Último acesso
                    </p>
                    <p className="text-sm font-semibold text-foreground/80">
                      {detailBuyer.last_login_at ? formatDate(detailBuyer.last_login_at) : "Nunca"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-card/8 p-4">
                    <p className="text-xs text-muted-foreground/45 flex items-center gap-1.5 mb-1">
                      <BookOpen className="h-3 w-3" />
                      Cursos liberados
                    </p>
                    <p className="text-sm font-semibold text-foreground/80">
                      {detailLoading ? "..." : studentDetail?.enrolledCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-card/8 p-4">
                    <p className="text-xs text-muted-foreground/45 flex items-center gap-1.5 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      Progresso geral
                    </p>
                    <p className="text-sm font-semibold text-foreground/80">
                      {detailLoading ? "..." : `${studentDetail?.overallProgress ?? 0}%`}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Cursos */}
              <TabsContent value="courses" className="mt-4">
                <p className="text-[13px] text-muted-foreground/50 mb-3">
                  Cursos, status real, tipo de vínculo e último evento aplicado ao aluno.
                </p>
                {detailLoading ? (
                  <p className="text-center text-xs text-muted-foreground/60 py-8 animate-pulse">Carregando cursos...</p>
                ) : !studentDetail?.courses?.length ? (
                  <p className="text-center text-sm text-muted-foreground/70 py-8">Nenhum curso cadastrado.</p>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {studentDetail.courses.map((course: any) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/8 p-3"
                      >
                        {course.cover_image_url ? (
                          <img src={course.cover_image_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-muted-foreground/60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground/80 truncate">{course.title}</p>
                            {renderCourseStatusBadge(course.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground/70">
                            <span>Vínculo: {course.accessOrigin || '—'}</span>
                            <span>Último evento: {course.lastEventType || '—'}</span>
                            {course.lastEventAt ? <span>Em: {formatDate(course.lastEventAt)}</span> : null}
                          </div>
                          {course.lastEventMessage ? (
                            <p className="text-[11px] text-muted-foreground/55 truncate">{course.lastEventMessage}</p>
                          ) : null}
                        </div>
                        <Switch
                          checked={course.hasAccess}
                          onCheckedChange={(checked) =>
                            toggleCourseAccess.mutate({
                              email: detailBuyer.email,
                              courseId: course.id,
                              grant: checked,
                            })
                          }
                          disabled={toggleCourseAccess.isPending}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Progresso */}
              <TabsContent value="progress" className="mt-4 space-y-4">
                <div className="rounded-xl border border-border/30 bg-card/8 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground/80">Progresso Geral</p>
                    <span className="text-sm font-bold text-foreground/70">
                      {detailLoading ? "..." : `${studentDetail?.overallProgress ?? 0}%`}
                    </span>
                  </div>
                  <Progress value={studentDetail?.overallProgress ?? 0} className="h-2 bg-muted/20" />
                </div>

                <p className="text-[13px] text-muted-foreground/50">Progresso por curso:</p>

                {detailLoading ? (
                  <p className="text-center text-xs text-muted-foreground/60 py-8 animate-pulse">Carregando...</p>
                ) : (() => {
                  const enrolled = (studentDetail?.courses || []).filter((c: any) => c.hasAccess);
                  if (!enrolled.length) {
                    return (
                      <p className="text-center text-sm text-muted-foreground/70 py-8">
                        O aluno não tem acesso a nenhum curso.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {enrolled.map((course: any) => (
                        <div key={course.id} className="rounded-xl border border-border/30 bg-card/8 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground/80 truncate">{course.title}</p>
                            <span className="text-[12px] text-muted-foreground/50 shrink-0 ml-2">{course.progressPct}%</span>
                          </div>
                          <Progress value={course.progressPct} className="h-1.5 bg-muted/20" />
                          <p className="text-xs text-muted-foreground/70 mt-1.5">
                            {course.completedLessons}/{course.totalLessons} aulas concluídas
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Access Dialog */}
      <Dialog open={!!accessBuyer} onOpenChange={(v) => { if (!v) setAccessBuyer(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gold/60" />
              Gerenciar Acesso a Cursos
            </DialogTitle>
          </DialogHeader>
          {accessBuyer && (
            <div className="space-y-4 mt-2">
              {/* Student info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold shrink-0">
                  {(accessBuyer.nome || accessBuyer.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground/90 truncate">{accessBuyer.nome || "Sem nome"}</p>
                  <p className="text-[12px] text-muted-foreground/50">{accessBuyer.email}</p>
                </div>
              </div>

              {/* Bulk actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-emerald-500/20 text-emerald-400/80 hover:bg-emerald-500/10"
                  disabled={toggleCourseAccess.isPending || accessLoading}
                  onClick={async () => {
                    const toGrant = (accessDetail?.courses || []).filter((c: any) => !c.hasAccess);
                    for (const c of toGrant) {
                      await toggleStudentCourseAccess({ data: { email: accessBuyer.email, courseId: c.id, grant: true } });
                    }
                    queryClient.invalidateQueries({ queryKey: ["student-detail"] });
                    toast.success("Todos os cursos liberados!");
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  Liberar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/20 text-destructive/80 hover:bg-destructive/10"
                  disabled={toggleCourseAccess.isPending || accessLoading}
                  onClick={async () => {
                    const toRevoke = (accessDetail?.courses || []).filter((c: any) => c.hasAccess);
                    for (const c of toRevoke) {
                      await toggleStudentCourseAccess({ data: { email: accessBuyer.email, courseId: c.id, grant: false } });
                    }
                    queryClient.invalidateQueries({ queryKey: ["student-detail"] });
                    toast.success("Todos os acessos revogados!");
                  }}
                >
                  <Ban className="h-3.5 w-3.5" />
                  Revogar Todos
                </Button>
              </div>

              {/* Course list */}
              {accessLoading ? (
                <p className="text-center text-xs text-muted-foreground/60 py-8 animate-pulse">Carregando cursos...</p>
              ) : !accessDetail?.courses?.length ? (
                <p className="text-center text-sm text-muted-foreground/70 py-8">Nenhum curso cadastrado.</p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {accessDetail.courses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/8 p-3"
                    >
                      {course.cover_image_url ? (
                        <img src={course.cover_image_url} alt="" className="h-11 w-11 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-11 w-11 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/80 truncate">{course.title}</p>
                        <Badge
                          className={`text-[11px] mt-0.5 border-0 ${
                            course.hasAccess
                              ? "bg-emerald-500/15 text-emerald-400/80"
                              : "bg-muted/20 text-muted-foreground/50"
                          }`}
                        >
                          {course.hasAccess ? "Com acesso" : "Sem acesso"}
                        </Badge>
                      </div>
                      <Calendar className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      <Switch
                        checked={course.hasAccess}
                        onCheckedChange={(checked) =>
                          toggleCourseAccess.mutate({
                            email: accessBuyer.email,
                            courseId: course.id,
                            grant: checked,
                          })
                        }
                        disabled={toggleCourseAccess.isPending}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/25">
                <p className="text-[12px] text-gold/60">
                  <span className="font-semibold">{accessDetail?.enrolledCount ?? 0}</span> de{" "}
                  {accessDetail?.courses?.length ?? 0} cursos liberados
                </p>
                <Button variant="outline" size="sm" onClick={() => setAccessBuyer(null)}>
                  Fechar
                </Button>
              </div>
            </div>
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
