import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { createAreaMembro } from "@/lib/areas-membros.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAreaModal({ open, onOpenChange }: NewAreaModalProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [principal, setPrincipal] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ["courses-simple"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title");
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: (vars: any) => createAreaMembro({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      toast.success("Área de membros criada com sucesso!");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar área");
    }
  });

  const resetForm = () => {
    setNome("");
    setSubdominio("");
    setProdutoId("");
    setAtiva(true);
    setPrincipal(false);
  };

  const handleCreate = () => {
    if (!nome || !subdominio || !produtoId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    mutation.mutate({
      nome,
      subdominio,
      produto_id: produtoId,
      ativa,
      principal
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0D14] border-white/5 text-white max-w-lg rounded-[2rem] overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tight">Nova área</DialogTitle>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome da área</Label>
            <Input 
              id="nome" 
              placeholder="Ex: Alunos Premium" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-gold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdominio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subdomínio</Label>
            <div className="relative">
              <Input 
                id="subdominio" 
                placeholder="ex: alunos" 
                value={subdominio}
                onChange={(e) => setSubdominio(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-gold pr-32"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">.plataforma.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="produto" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Produto vinculado</Label>
            <Select value={produtoId} onValueChange={setProdutoId}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-gold">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-[#121620] border-white/5 text-white">
                {courses?.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Ativa</Label>
              <p className="text-xs text-muted-foreground">Habilitar acesso imediato</p>
            </div>
            <Switch checked={ativa} onCheckedChange={setAtiva} />
          </div>

          <div className="flex items-center space-x-3 p-2">
            <Checkbox 
              id="principal" 
              checked={principal} 
              onCheckedChange={(checked) => setPrincipal(checked as boolean)}
              className="border-white/20 data-[state=checked]:bg-gold data-[state=checked]:text-black"
            />
            <Label htmlFor="principal" className="text-sm font-medium cursor-pointer">Definir como principal</Label>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 bg-white/5 sm:justify-between flex-row gap-4 mt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl hover:bg-white/10 text-white font-bold"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={mutation.isPending}
            className="flex-1 h-12 rounded-xl bg-gold hover:bg-gold/90 text-black font-black"
          >
            {mutation.isPending ? "Criando..." : "Criar área"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
