import { createFileRoute } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile, changePassword } from "@/lib/profile.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Loader2,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
  const timeWatchedLabel = data?.timeWatchedLabel || '0h';

  const totalCourses = enrollments.length;
  const totalLessonsCompleted = Object.values(completedByCourse).reduce(
    (a: number, b: number) => a + b,
    0
  );
  const overallProgressPct = contentStats.totalItems > 0
    ? Math.round((contentStats.completed / contentStats.totalItems) * 100)
    : 0;

  const email = data?.email || "";
  const name = displayName || data?.profile?.display_name || email.split("@")[0] || "Aluno";
  const initials = name.slice(0, 2).toUpperCase();
  const memberSince = data?.profile && "created_at" in data.profile && data.profile.created_at
    ? new Date(data.profile.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "";

  return (
    <ModuleGuard moduleKey="perfil">
    <StudentLayout>
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 mx-auto w-full max-w-[800px] px-4 sm:px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="text-center py-24">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
              Carregando perfil...
            </p>
          </div>
        ) : (
          <>
            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <User className="h-7 w-7 text-gold" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                  Meu Perfil
                </h1>
                <p className="text-[13px] text-muted-foreground/50 mt-0.5 italic">
                  Sua história na caminhada espiritual
                </p>
              </div>
            </motion.div>

            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="rounded-xl border border-border/30 bg-card/8 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-xl font-bold text-gold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-foreground/90 truncate">
                    {name}
                  </h2>
                  <p className="text-[13px] text-muted-foreground/50 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </p>
                  {memberSince && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Membro desde {memberSince}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-xl border border-border/30 bg-card/8 p-5 space-y-5"
            >
              <h3 className="text-[12px] font-semibold text-muted-foreground/50 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-gold/60" />
                Sua Caminhada
              </h3>

              {/* Overall progress */}
              {contentStats.totalItems > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/60">Sua evolução espiritual</span>
                    <span className="text-xs font-bold text-foreground/70">{overallProgressPct}%</span>
                  </div>
                  <Progress value={overallProgressPct} className="h-2 bg-muted/15" />
                  <p className="text-[10px] text-muted-foreground/40">
                    {contentStats.completed} de {contentStats.totalItems} conteúdos vivenciados
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 shrink-0">
                    <BookOpen className="h-5 w-5 text-gold/60" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-foreground/85">
                      {totalCourses}
                    </p>
                    <p className="text-xs text-muted-foreground/70">Cursos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400/60" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-foreground/85">
                      {totalLessonsCompleted}
                    </p>
                    <p className="text-xs text-muted-foreground/70">Aulas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-purple-400/60" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-foreground/85">
                      {contentStats.completed}
                    </p>
                    <p className="text-xs text-muted-foreground/70">Conteúdos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 shrink-0">
                    <Clock className="h-5 w-5 text-blue-400/60" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-foreground/85">
                      {timeWatchedLabel}
                    </p>
                    <p className="text-xs text-muted-foreground/70">Tempo</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Personal info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-xl border border-border/30 bg-card/8 p-6 space-y-5"
            >
              <h3 className="text-base font-bold text-foreground/85">
                Informações Pessoais
              </h3>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[13px] font-semibold text-foreground/70">
                  Nome completo
                </Label>
                <Input
                  id="fullName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-card/20 border-border/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-foreground/70">
                  Email
                </Label>
                <Input
                  value={email}
                  disabled
                  className="bg-muted/10 border-border/25 text-muted-foreground/70"
                />
                <p className="text-xs text-muted-foreground/60">
                  O email não pode ser alterado
                </p>
              </div>

              <Button
                onClick={() => profileMutation.mutate()}
                disabled={profileMutation.isPending}
                className="bg-gold/90 text-gold-foreground hover:bg-gold text-[12px] font-bold"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : null}
                Salvar Alterações
              </Button>
            </motion.div>

            {/* Change password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl border border-border/30 bg-card/8 p-6 space-y-5"
            >
              <h3 className="text-base font-bold text-foreground/85 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground/50" />
                Alterar Senha
              </h3>

              <div className="space-y-2">
                <Label htmlFor="currentPwd" className="text-[13px] font-semibold text-foreground/70">
                  Senha atual
                </Label>
                <Input
                  id="currentPwd"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-card/20 border-border/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPwd" className="text-[13px] font-semibold text-foreground/70">
                  Nova senha
                </Label>
                <Input
                  id="newPwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-card/20 border-border/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPwd" className="text-[13px] font-semibold text-foreground/70">
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirmPwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="bg-card/20 border-border/30"
                />
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={
                  passwordMutation.isPending ||
                  !newPassword ||
                  !confirmPassword
                }
                variant="outline"
                className="border-gold/20 text-gold/70 hover:bg-gold/10 text-[12px] font-bold"
              >
                {passwordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : null}
                Alterar Senha
              </Button>
            </motion.div>
          </>
        )}
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
    </ModuleGuard>
  );
}
