import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMyProfile, updateMyProfile, changePassword, deleteMyAccount } from "@/lib/profile.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Mail,
  Lock,
  Loader2,
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  UserCircle2,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setDisplayName(data.profile.display_name || "");
    }
  }, [data?.profile]);

  const profileMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        data: { display_name: displayName.trim() },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ data: { newPassword } }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: () => {
      toast.success("Sua conta foi excluída permanentemente.");
      logout();
      navigate({ to: "/login" });
    },
    onError: (e: Error) => toast.error("Erro ao excluir conta: " + e.message),
  });

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    passwordMutation.mutate();
  };

  const enrollments = data?.enrollments || [];
  const completedByCourse = data?.completedByCourse || {};
  const contentStats = data?.contentStats || { viewed: 0, completed: 0, totalItems: 0 };
  const timeWatchedLabel = data?.timeWatchedLabel || "0h";

  const totalCourses = enrollments.length;
  const totalLessonsCompleted = Object.values(completedByCourse).reduce(
    (a: number, b: number) => a + b,
    0
  );
  const overallProgressPct =
    contentStats.totalItems > 0
      ? Math.round((contentStats.completed / contentStats.totalItems) * 100)
      : 0;

  const email = data?.email || "";
  const name =
    displayName || data?.profile?.display_name || email.split("@")[0] || "Aluno";
  const initials = name.slice(0, 2).toUpperCase();
  const memberSince =
    data?.profile && "created_at" in data.profile && data.profile.created_at
      ? new Date(data.profile.created_at).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    <ModuleGuard moduleKey="perfil">
      <StudentLayout>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
            {isLoading ? (
              <div className="text-center py-24">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                  Carregando perfil...
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                    <UserCircle2 className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      Meu perfil
                    </h1>
                    <p className="text-[13px] text-muted-foreground/70 mt-0.5">
                      Suas informações pessoais e preferências da conta
                    </p>
                  </div>
                </motion.div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
                  {/* LEFT column */}
                  <motion.aside
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="space-y-6"
                  >
                    {/* Identity card */}
                    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 text-2xl font-bold text-gold">
                        {initials}
                      </div>
                      <h2 className="mt-4 text-lg font-bold text-foreground truncate">
                        {name}
                      </h2>
                      <p className="text-[13px] text-muted-foreground/70 flex items-center justify-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[260px]">{email}</span>
                      </p>
                      {memberSince && (
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          Membro desde {memberSince}
                        </p>
                      )}
                    </div>

                    {/* Stats card */}
                    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 space-y-5">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                        Sua caminhada
                      </h3>

                      {contentStats.totalItems > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground/70">
                              Evolução geral
                            </span>
                            <span className="text-xs font-bold text-gold">
                              {overallProgressPct}%
                            </span>
                          </div>
                          <Progress
                            value={overallProgressPct}
                            className="h-1.5 bg-muted/20"
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <StatRow
                          icon={<BookOpen className="h-4 w-4 text-gold" />}
                          label="Cursos"
                          value={totalCourses}
                          tone="gold"
                        />
                        <StatRow
                          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                          label="Aulas concluídas"
                          value={totalLessonsCompleted}
                          tone="emerald"
                        />
                        <StatRow
                          icon={<CheckCircle2 className="h-4 w-4 text-purple-400" />}
                          label="Conteúdos vivenciados"
                          value={contentStats.completed}
                          tone="purple"
                        />
                        <StatRow
                          icon={<Clock className="h-4 w-4 text-blue-400" />}
                          label="Tempo de estudo"
                          value={timeWatchedLabel}
                          tone="blue"
                        />
                      </div>
                    </div>
                  </motion.aside>

                  {/* RIGHT column */}
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-6"
                  >
                    {/* Personal info */}
                    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 sm:p-7 space-y-5">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gold" />
                        <h3 className="text-base font-bold text-foreground">
                          Informações pessoais
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="fullName"
                            className="text-[12px] font-semibold text-foreground/70 uppercase tracking-wide"
                          >
                            Nome completo
                          </Label>
                          <Input
                            id="fullName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="bg-background/40 border-border/40 h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[12px] font-semibold text-foreground/70 uppercase tracking-wide">
                            Email
                          </Label>
                          <Input
                            value={email}
                            disabled
                            className="bg-muted/10 border-border/30 text-muted-foreground/70 h-10"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/60 -mt-1">
                        O email não pode ser alterado
                      </p>

                      <div className="pt-2">
                        <Button
                          onClick={() => profileMutation.mutate()}
                          disabled={profileMutation.isPending}
                          className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold"
                        >
                          {profileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Salvar alterações
                        </Button>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 sm:p-7 space-y-5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gold" />
                        <h3 className="text-base font-bold text-foreground">
                          Segurança
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPwd"
                            className="text-[12px] font-semibold text-foreground/70 uppercase tracking-wide"
                          >
                            Senha atual
                          </Label>
                          <Input
                            id="currentPwd"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-background/40 border-border/40 h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="newPwd"
                            className="text-[12px] font-semibold text-foreground/70 uppercase tracking-wide"
                          >
                            Nova senha
                          </Label>
                          <Input
                            id="newPwd"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="bg-background/40 border-border/40 h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPwd"
                            className="text-[12px] font-semibold text-foreground/70 uppercase tracking-wide"
                          >
                            Confirmar
                          </Label>
                          <Input
                            id="confirmPwd"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a senha"
                            className="bg-background/40 border-border/40 h-10"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={
                            passwordMutation.isPending ||
                            !newPassword ||
                            !confirmPassword
                          }
                          variant="outline"
                          className="border-gold/30 text-gold hover:bg-gold/10 font-bold"
                        >
                          {passwordMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Lock className="h-4 w-4 mr-2" />
                          )}
                          Alterar senha
                        </Button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-6 sm:p-7 space-y-5">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <h3 className="text-base font-bold text-destructive">
                          Zona de perigo
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-[13px] text-muted-foreground/70">
                          Ao excluir sua conta, todos os seus dados, progresso em cursos e acessos serão removidos permanentemente. Esta ação não pode ser desfeita.
                        </p>
                        
                        <Button
                          variant="destructive"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="font-bold"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir minha conta
                        </Button>
                      </div>
                    </div>

                    <ConfirmationDialog
                      isOpen={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                      onConfirm={() => {
                        deleteAccountMutation.mutate();
                      }}
                      title="Excluir conta permanentemente?"
                      description="Esta ação é irreversível. Você perderá acesso a todos os seus cursos e seu progresso será apagado de acordo com a LGPD."
                      confirmText={deleteAccountMutation.isPending ? "Excluindo..." : "Sim, excluir conta"}
                      cancelText="Cancelar"
                      variant="destructive"
                    />
                  </motion.section>
                </div>
              </>
            )}
          </main>

          <FooterLinks />
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}

function StatRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "gold" | "emerald" | "purple" | "blue";
}) {
  const bgMap: Record<string, string> = {
    gold: "bg-gold/10",
    emerald: "bg-emerald-500/10",
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${bgMap[tone]}`}
        >
          {icon}
        </div>
        <span className="text-[13px] text-muted-foreground/80 truncate">
          {label}
        </span>
      </div>
      <span className="font-display text-base font-bold text-foreground">
        {value}
      </span>
    </div>
  );
}
