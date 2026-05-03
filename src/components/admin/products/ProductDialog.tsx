import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseForm } from "@/components/CourseForm";
import { Button } from "@/components/ui/button";
import { Save, Music, Info, Settings, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse, updateCourse } from "@/lib/admin-courses.functions";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: any;
}

export function ProductDialog({ open, onOpenChange, course }: ProductDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("detalhes");
  const [courseType, setCourseType] = useState(course?.course_type || "aula");
  const [currentCourse, setCurrentCourse] = useState(course);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (currentCourse?.id) {
        return updateCourse({ data: { id: currentCourse.id, ...values } });
      }
      return createCourse({ data: values });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success(currentCourse?.id ? "Produto atualizado!" : "Produto criado!");
      
      // Se acabou de criar, precisamos do ID para liberar as outras abas
      if (!currentCourse?.id && data?.course) {
        setCurrentCourse(data.course);
      }
    },
    onError: (e: Error) => toastError(e),
  });

  useEffect(() => {
    if (open) {
      setCurrentCourse(course);
      setCourseType(course?.course_type || "aula");
      setActiveTab("detalhes");
    }
  }, [open, course]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 bg-[#0B1220] border-white/5 text-white overflow-hidden rounded-[32px] shadow-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-[#111827] flex items-center justify-between relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-transparent" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/10">
              {courseType === "louvores" ? <Music className="h-6 w-6 text-gold" /> : <Plus className="h-6 w-6 text-gold" />}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {currentCourse?.id ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest mt-0.5">
                {courseType === "louvores" ? "Pack de Louvores (Spotify Style)" : "Conteúdo da Área de Membros"}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => (document.querySelector('form#course-form') as HTMLFormElement)?.requestSubmit()}
            className="h-12 px-6 bg-gold hover:bg-gold/90 text-black font-bold rounded-xl shadow-lg shadow-gold/20"
            disabled={mutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {mutation.isPending ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-8 py-4 bg-[#111827]/50 border-b border-white/5">
              <TabsList className="bg-black/20 border border-white/5 p-1 rounded-xl w-fit">
                <TabsTrigger value="detalhes" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold rounded-lg text-xs font-bold px-6 py-2">
                  <Info className="h-3.5 w-3.5 mr-2" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger 
                  value="musica" 
                  disabled={!currentCourse?.id}
                  className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold rounded-lg text-xs font-bold px-6 py-2"
                >
                  <Music className="h-3.5 w-3.5 mr-2" />
                  {courseType === "louvores" ? "Músicas" : "Conteúdo"}
                </TabsTrigger>
                <TabsTrigger 
                  value="config" 
                  disabled={!currentCourse?.id}
                  className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold rounded-lg text-xs font-bold px-6 py-2"
                >
                  <Settings className="h-3.5 w-3.5 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <TabsContent value="detalhes" className="mt-0 outline-none">
                <CourseForm 
                  id="course-form"
                  initialValues={currentCourse}
                  onSubmit={(values) => mutation.mutate(values)}
                  isSubmitting={mutation.isPending}
                  hideSubmitButton
                  onTypeChange={setCourseType}
                />
              </TabsContent>

              <TabsContent value="musica" className="mt-0 outline-none">
                {courseType === "louvores" ? (
                  <CourseMusicasTab courseId={currentCourse?.id} />
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-white/[0.02]">
                    <p className="text-muted-foreground">Módulos e aulas em breve...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="config" className="mt-0 outline-none">
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-white/[0.02]">
                  <p className="text-muted-foreground">Configurações avançadas do produto</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
