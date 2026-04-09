import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile, changePassword } from "@/lib/profile.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  BookOpen,
  Video,
  BookText,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: ProfilePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
};

function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setDisplayName(data.profile.display_name || "");
      setBio(data.profile.bio || "");
    }
  }, [data?.profile]);

  const profileMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        data: { display_name: displayName.trim(), bio: bio.trim() },
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

  // Stats
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e: any) => e.status === "completed"
  ).length;
  const totalLessonsCompleted = Object.values(completedByCourse).reduce(
    (a: number, b: number) => a + b,
    0
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-10">
        {isLoading ? (
          <div className="text-center py-24">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
              Carregando perfil...
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial="hidden" animate="visible">
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="font-display text-3xl font-bold text-foreground/90 tracking-tight"
              >
                Meu Perfil
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="mt-1 text-[13px] text-muted-foreground/40"
              >
                Gerencie suas informações e acompanhe seu progresso
              </motion.p>
            </motion.div>

            {/* Stats cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.15}
              className="grid grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Cursos",
                  value: totalCourses,
                  icon: BookOpen,
                  color: "text-gold/60",
                },
                {
                  label: "Concluídos",
                  value: completedCourses,
                  icon: Trophy,
                  color: "text-emerald-500/60",
                },
                {
                  label: "Aulas Completas",
                  value: totalLessonsCompleted,
                  icon: CheckCircle2,
                  color: "text-blue-400/60",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/15 bg-card/10 p-5"
                >
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="font-display text-2xl font-bold text-foreground/80">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Course progress */}
            {enrollments.length > 0 && (
              <motion.section
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.2}
                className="space-y-4"
              >
                <h2 className="text-sm font-semibold text-foreground/70 tracking-tight">
                  Progresso nos Cursos
                </h2>

                <div className="space-y-3">
                  {enrollments.map((enrollment: any) => {
                    const course = enrollment.courses;
                    if (!course) return null;
                    const total = course.total_lessons || 0;
                    const completed = completedByCourse[course.id] || 0;
                    const pct =
                      total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <div
                        key={enrollment.id}
                        className="rounded-2xl border border-border/15 bg-card/10 p-5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/15 shrink-0">
                            {course.course_type === "video" ? (
                              <Video className="h-4 w-4 text-gold/40" />
                            ) : (
                              <BookText className="h-4 w-4 text-blue-400/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground/80 truncate">
                              {course.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/30">
                              {completed} de {total} aulas · {pct}%
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gold/60">
                            {pct}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Personal info form */}
            <motion.section
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.3}
              className="space-y-5"
            >
              <h2 className="text-sm font-semibold text-foreground/70 tracking-tight">
                Informações Pessoais
              </h2>

              <div className="rounded-2xl border border-border/15 bg-card/10 p-6 space-y-5">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-muted-foreground/50">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input
                    value={data?.email || ""}
                    disabled
                    className="bg-muted/10 border-border/10 text-muted-foreground/40"
                  />
                  <p className="text-[10px] text-muted-foreground/25">
                    O email não pode ser alterado.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="displayName"
                    className="flex items-center gap-1.5"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Nome
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-card/10 border-border/15"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre você</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    className="bg-card/10 border-border/15"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => profileMutation.mutate()}
                    disabled={profileMutation.isPending}
                    size="sm"
                  >
                    {profileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.section>

            {/* Change password */}
            <motion.section
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.4}
              className="space-y-5"
            >
              <h2 className="text-sm font-semibold text-foreground/70 tracking-tight">
                Alterar Senha
              </h2>

              <div className="rounded-2xl border border-border/15 bg-card/10 p-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="flex items-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Nova Senha
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-card/10 border-border/15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="bg-card/10 border-border/15"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      passwordMutation.isPending ||
                      !newPassword ||
                      !confirmPassword
                    }
                    size="sm"
                    variant="outline"
                  >
                    {passwordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4 mr-1" />
                    )}
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}
