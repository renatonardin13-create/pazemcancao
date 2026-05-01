import { toastError } from "@/lib/toast-utils";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { createCourse } from "@/lib/admin-courses.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState("detalhes");

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const categories = catData?.categories || [];

  const mutation = useMutation({
    mutationFn: (values: any) => createCourse({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-shelves"] });
      toast.success("Produto criado com sucesso!", {
        action: {
          label: "Criar Oferta",
          onClick: () => navigate({ to: "/admin/offers/new" })
        },
      });
      navigate({ to: "/admin/courses" });
    },
    onError: (e: Error) => toastError(e),
  });

  const handleSave = () => {
    formRef.current?.requestSubmit();
  };

  if (!catLoading && categories.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/30 rounded-3xl p-10 space-y-6 shadow-2xl shadow-black/20"
        >
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
            <Layers className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Seção Necessária</h2>
            <p className="text-muted-foreground">
              Você precisa criar pelo menos uma <strong>Seção</strong> antes de cadastrar um produto. Isso é essencial para a organização do seu catálogo.
            </p>
          </div>
          <Link
            to="/admin/categories"
            className="inline-flex h-14 px-8 items-center justify-center rounded-2xl bg-gold text-black font-black text-sm hover:scale-105 transition-all shadow-lg shadow-gold/20 gap-2"
          >
            Criar Seção Agora
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/courses"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Criar Novo Produto
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Configure seu produto, adicione módulos e aulas
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/admin/courses" })}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Salvar Produto
            </Button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/60 border border-border/25 p-1 rounded-xl">
          <TabsTrigger
            value="detalhes"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="modulos"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Módulos e Aulas
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="mt-4">
          <CourseForm
            ref={formRef}
            onSubmit={(values) => mutation.mutate(values)}
            isSubmitting={mutation.isPending}
            hideSubmitButton
          />
        </TabsContent>

        <TabsContent value="modulos" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-lg shadow-black/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Módulos e Aulas</h3>
                <p className="text-sm text-muted-foreground/50 mt-0.5">
                  Organize a estrutura do seu curso de forma hierárquica
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                + Criar Módulo
              </Button>
            </div>
            <div className="rounded-xl border border-dashed border-gold/30 bg-gold/[0.03] p-8 text-center">
              <p className="text-sm text-muted-foreground/60">
                Salve o curso primeiro para gerenciar módulos e aulas.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card p-8 shadow-lg shadow-black/10 text-center">
            <p className="text-sm text-muted-foreground/50">
              Salve o curso primeiro para acessar as configurações avançadas.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
