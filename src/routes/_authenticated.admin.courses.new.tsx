import { toastError } from "@/lib/toast-utils";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { createCourse } from "@/lib/admin-courses.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef, useState, useEffect } from "react";
import { useAdminActiveArea } from "@/hooks/use-admin-active-area";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeArea } = useAdminActiveArea();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState("detalhes");
  const [courseType, setCourseType] = useState("aula");

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories", activeArea?.id],
    queryFn: () => listAdminCategories({ data: { areaId: activeArea?.id } }),
    enabled: !!activeArea?.id,
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
        <EmptyState
          icon={Layers}
          title="Nenhum conteúdo criado ainda"
          description="Para vender, você precisa primeiro criar uma seção. Seções organizam seus conteúdos (ex: Módulo 1, Bônus, Aulas)"
          actionLabel="Criar primeira seção"
          actionTo="/admin/categories"
        />
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
              loading={mutation.isPending}
            >
              <Save className="h-4 w-4 mr-1.5" />
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
            {courseType === "louvores" ? "Gerenciar Músicas" : "Módulos e Aulas"}
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
                <h3 className="text-base font-bold text-foreground">
                  {courseType === "louvores" ? "Gerenciar Músicas" : "Módulos e Aulas"}
                </h3>
                <p className="text-sm text-muted-foreground/50 mt-0.5">
                  {courseType === "louvores" 
                    ? "Adicione e organize os louvores deste pack" 
                    : "Organize a estrutura do seu curso de forma hierárquica"}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" disabled>
                        + Criar Módulo
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Salve o produto primeiro para gerenciar módulos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
