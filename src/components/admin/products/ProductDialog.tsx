import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseForm } from "@/components/CourseForm";
import { toast } from "sonner";

export function ProductDialog({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
}) {
  const queryClient = useQueryClient();
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [courseType, setCourseType] = useState<string>("video");

  useEffect(() => {
    if (courseId && open) {
      const fetchCourse = async () => {
        const { data } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();
        if (data) {
          setCurrentCourse(data);
          setCourseType(data.course_type || "video");
        }
      };
      fetchCourse();
    } else {
      setCurrentCourse(null);
      setCourseType("video");
    }
  }, [courseId, open]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (courseId) {
        const { error } = await supabase
          .from("courses")
          .update(values)
          .eq("id", courseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success(courseId ? "Produto atualizado" : "Produto criado");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar produto: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-background shadow-2xl">
        <div className="p-8">
          <Tabs defaultValue="detalhes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14 border border-white/5">
              <TabsTrigger value="detalhes" className="rounded-xl data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all duration-300">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="config" className="rounded-xl data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all duration-300">
                Configurações
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <TabsContent value="detalhes" className="mt-0 outline-none">
                <CourseForm 
                  id="course-form"
                  initialValues={currentCourse}
                  onSubmit={(values) => mutation.mutate(values)}
                  isSubmitting={mutation.isPending}
                  onTypeChange={setCourseType}
                />
              </TabsContent>

              <TabsContent value="config" className="mt-0 outline-none">
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-white/[0.02]">
                  <p className="text-muted-foreground">Configurações avançadas do produto em breve...</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}