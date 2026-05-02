import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
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
import { createAreaMembro } from "@/lib/areas-membros.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Sparkles, 
  Check, 
  Loader2, 
  Star, 
  PartyPopper, 
  Copy, 
  ExternalLink,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface NewAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAreaModal({ open, onOpenChange }: NewAreaModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [principal, setPrincipal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [language, setLanguage] = useState("pt-BR");
  const [status, setStatus] = useState("active");

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
      setShowSuccess(true);
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
    setShowSuccess(false);
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
      principal,
      status,
      language
    });
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(resetForm, 300);
    }
    onOpenChange(newOpen);
  };

  const areaUrl = `https://${subdominio}.suaplataforma.com.br`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(areaUrl);
    toast.success("URL copiada!");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 bg-[#07090E] border-white/5 text-white max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col md:flex-row h-full"
            >
              {/* Sidebar Info */}
              <div className="md:w-[320px] bg-white/[0.02] p-8 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <div className="space-y-6 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Nova Área</h2>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      Configure o ambiente exclusivo para seus alunos.
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold shrink-0">1</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Defina o nome e o subdomínio único da sua área.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">2</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Vincule um produto do seu catálogo.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">3</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Configure visibilidade e preferência.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold">DICA PREMIUM</p>
                  <p className="text-xs text-muted-foreground italic">Use nomes curtos e subdomínios fáceis de lembrar para seus alunos.</p>
                </div>

                {/* Ambient Light */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/5 blur-[80px] rounded-full" />
              </div>

              {/* Form Content */}
              <div className="flex-1 p-10 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="grid gap-8">
                  {/* Basic Info Group */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Nome da área</Label>
                        <Input 
                          id="nome" 
                          placeholder="Ex: Comunidade Premium" 
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus-visible:ring-gold text-base font-medium placeholder:text-white/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subdominio" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Identificador (Subdomínio)</Label>
                        <div className="relative group">
                          <Input 
                            id="subdominio" 
                            placeholder="ex: alunos" 
                            value={subdominio}
                            onChange={(e) => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                            className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus-visible:ring-gold pr-32 text-base font-mono"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs font-bold">.plataforma.com</span>
                        </div>
                        {subdominio && (
                          <p className="text-[10px] text-gold/60 font-mono pl-1">
                            Acesso via: <span className="font-bold underline">{subdominio}.plataforma.com</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Group */}
                  <div className="space-y-4">
                    <Label htmlFor="produto" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Produto vinculado</Label>
                    <Select value={produtoId} onValueChange={setProdutoId}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-gold text-base">
                        <SelectValue placeholder="Selecione um produto do seu catálogo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0D14] border-white/10 text-white rounded-2xl p-2">
                        {courses?.map(course => (
                          <SelectItem key={course.id} value={course.id} className="rounded-xl h-12 focus:bg-gold focus:text-black font-medium">
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language and Status Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Idioma da Área</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-gold text-base">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0D14] border-white/10 text-white rounded-2xl">
                          <SelectItem value="pt-BR" className="rounded-xl h-12">Português (Brasil)</SelectItem>
                          <SelectItem value="en" className="rounded-xl h-12">English</SelectItem>
                          <SelectItem value="es" className="rounded-xl h-12">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Status Inicial</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-gold text-base">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0D14] border-white/10 text-white rounded-2xl">
                          <SelectItem value="active" className="rounded-xl h-12">Ativo</SelectItem>
                          <SelectItem value="draft" className="rounded-xl h-12">Rascunho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-black flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${ativa ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                          Área Ativa
                        </Label>
                        <p className="text-xs text-muted-foreground">Disponível para os alunos</p>
                      </div>
                      <Switch 
                        checked={ativa} 
                        onCheckedChange={setAtiva} 
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-black flex items-center gap-2">
                          <Star className={`h-4 w-4 ${principal ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
                          Área Principal
                        </Label>
                        <p className="text-xs text-muted-foreground">Padrão da plataforma</p>
                      </div>
                      <Switch 
                        checked={principal} 
                        onCheckedChange={setPrincipal}
                        className="data-[state=checked]:bg-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-14 rounded-2xl hover:bg-white/5 text-white font-bold"
                  >
                    Descartar
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={mutation.isPending || !nome || !subdominio || !produtoId}
                    className="flex-[2] h-14 rounded-2xl bg-gold hover:bg-gold/90 text-black font-black text-lg shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {mutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Criando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Criar Área Agora
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-10 flex flex-col items-center justify-center min-h-[500px]"
            >
              {/* Visual Highlight */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative h-32 w-32 bg-gold rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(212,175,55,0.3)] border-4 border-[#07090E] z-10"
                >
                  <PartyPopper className="h-16 w-16 text-black" />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 blur-[120px] rounded-full -z-10" />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <Check className="h-3 w-3" /> Configuração Concluída
                </div>
                <h1 className="text-4xl font-black tracking-tight leading-tight">
                  Sua área está <br /> <span className="text-gold">oficialmente online!</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto font-medium">
                  A área <strong>{nome}</strong> foi configurada com sucesso.
                </p>
              </div>

              {/* URL Box */}
              <div className="w-full max-w-lg bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] space-y-4 backdrop-blur-xl">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Link de acesso dos alunos</span>
                  <div className="flex items-center justify-between gap-4 p-4 bg-black/40 rounded-2xl border border-gold/20 hover:border-gold/40 transition-colors">
                    <Globe className="h-5 w-5 text-gold shrink-0" />
                    <span className="text-base font-bold truncate flex-1 font-mono">{areaUrl}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUrl}
                        className="h-10 w-10 rounded-xl hover:bg-gold/10 hover:text-gold"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-10 w-10 rounded-xl hover:bg-gold/10 hover:text-gold"
                      >
                        <a href={areaUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full max-w-sm gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    handleClose(false);
                    navigate({ to: "/admin/courses" });
                  }}
                  className="h-16 bg-gold text-black font-black text-xl shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all rounded-2xl flex items-center gap-3"
                >
                  <BookOpen className="h-6 w-6" />
                  Ir para o Catálogo
                </Button>
                
                <button
                  onClick={() => handleClose(false)}
                  className="text-sm font-bold text-muted-foreground hover:text-white transition-colors"
                >
                  Fechar e voltar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
