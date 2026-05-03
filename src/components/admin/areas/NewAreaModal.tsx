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
  BookOpen,
  Info,
  Layout,
  Layers,
  Palette
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";

interface NewAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAreaModal({ open, onOpenChange }: NewAreaModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [rotuloCurto, setRotuloCurto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [rootDomain, setRootDomain] = useState("seudominio.com");
  const [produtoId, setProdutoId] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [principal, setPrincipal] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
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
    setRotuloCurto("");
    setDescricao("");
    setSubdominio("");
    setProdutoId("");
    setAtiva(true);
    setPrincipal(false);
    setPrimaryColor("#D4AF37");
    setShowSuccess(false);
  };

  const handleCreate = () => {
    if (!nome || !subdominio || !produtoId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    mutation.mutate({
      nome,
      rotulo_curto: rotuloCurto,
      descricao,
      subdominio,
      produto_id: produtoId,
      ativa,
      principal,
      status,
      language,
      primary_color: primaryColor,
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
      <DialogContent className="p-0 bg-[#0B1220] border-[#1F2937] text-[#F9FAFB] max-w-[800px] rounded-[16px] overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-[85vh] md:h-[650px]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-[#111827]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                    <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Criar Nova Área de Membros</h2>
                    <p className="text-xs text-[#9CA3AF] font-medium">Configure seu novo ambiente de cursos</p>
                  </div>
                </div>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[#111827]">
                {/* 1. IDENTIDADE DA ÁREA */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">1</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">Identidade da Área</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Título (Obrigatório)</Label>
                      <Input 
                        id="nome" 
                        placeholder="Ex: Reino das Cores Kids" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus-visible:ring-[#D4AF37] text-base font-bold transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rotuloCurto" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Rótulo curto</Label>
                      <Input 
                        id="rotuloCurto" 
                        placeholder="Ex: Kids" 
                        value={rotuloCurto}
                        onChange={(e) => setRotuloCurto(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus-visible:ring-[#D4AF37] text-base font-bold transition-all"
                      />
                      <p className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Versão compacta usada em badges e chips.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descreva para quem é essa área e o que ela entrega" 
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="bg-[#1F2937] border-white/5 min-h-[100px] rounded-xl focus-visible:ring-[#D4AF37] text-base font-medium resize-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. ENDEREÇO DA ÁREA */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">2</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">Endereço da Área</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subdominio" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Identificador (Obrigatório)</Label>
                      <Input 
                        id="subdominio" 
                        placeholder="Ex: desafio24dias" 
                        value={subdominio}
                        onChange={(e) => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                        className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus-visible:ring-[#D4AF37] font-mono text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rootDomain" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Domínio raiz</Label>
                      <Input 
                        id="rootDomain" 
                        placeholder="Ex: seudominio.com" 
                        value={rootDomain}
                        onChange={(e) => setRootDomain(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus-visible:ring-[#D4AF37] font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0B1220] border border-white/5 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60">Preview da URL</span>
                    <div className="flex items-center justify-between gap-3 p-3 bg-black/20 rounded-xl border border-white/5 group/url">
                      <Globe className="h-4 w-4 text-[#D4AF37]/40" />
                      <span className="text-xs font-bold text-slate-400 truncate flex-1 font-mono">
                        https://{subdominio || "subdominio"}.{rootDomain || "dominio.com"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. CONFIGURAÇÕES DA ÁREA */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">3</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">Configurações da Área</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status Inicial</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus:ring-[#D4AF37] font-bold">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/10 text-white">
                          <SelectItem value="active" className="focus:bg-[#D4AF37] focus:text-black font-bold">Ativa</SelectItem>
                          <SelectItem value="draft" className="focus:bg-[#D4AF37] focus:text-black font-bold">Rascunho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Idioma Padrão</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus:ring-[#D4AF37] font-bold">
                          <SelectValue placeholder="Idioma" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/10 text-white">
                          <SelectItem value="pt-BR" className="focus:bg-[#D4AF37] focus:text-black font-bold">Português (Brasil)</SelectItem>
                          <SelectItem value="en" className="focus:bg-[#D4AF37] focus:text-black font-bold">English</SelectItem>
                          <SelectItem value="es" className="focus:bg-[#D4AF37] focus:text-black font-bold">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="produto" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Produto Principal (Vínculo Inicial)</Label>
                    <Select value={produtoId} onValueChange={setProdutoId}>
                      <SelectTrigger className="bg-[#1F2937] border-white/5 h-12 rounded-xl focus:ring-[#D4AF37] font-bold">
                        <SelectValue placeholder="Selecione um produto do seu catálogo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/10 text-white max-h-[200px]">
                        {courses?.map(course => (
                          <SelectItem key={course.id} value={course.id} className="focus:bg-[#D4AF37] focus:text-black font-bold">
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. IDENTIDADE VISUAL RÁPIDA */}
                <div className="space-y-6 pb-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">4</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">Identidade Visual Rápida</h3>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Cor de destaque</Label>
                    <div className="flex gap-4">
                      <Input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        className="w-16 h-12 p-1 bg-[#1F2937] border-white/10 cursor-pointer rounded-xl" 
                      />
                      <Input 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        className="flex-1 h-12 bg-[#1F2937] border-white/5 font-mono text-center font-bold rounded-xl" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-white/5 bg-[#111827] flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-14 rounded-2xl hover:bg-white/5 text-slate-400 font-bold transition-all"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={mutation.isPending || !nome || !subdominio || !produtoId}
                  className="flex-[2] h-14 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0F172A] font-black text-lg shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Criando Área...
                    </div>
                  ) : (
                    "Criar minha área agora"
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-10 flex flex-col items-center justify-center min-h-[500px] bg-[#111827]"
            >
              {/* Visual Highlight */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative h-32 w-32 bg-[#D4AF37] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(212,175,55,0.3)] border-4 border-[#0B1220] z-10"
                >
                  <PartyPopper className="h-16 w-16 text-[#0F172A]" />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/10 blur-[120px] rounded-full -z-10" />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <Check className="h-3 w-3" /> Configuração Concluída
                </div>
                <h1 className="text-4xl font-black tracking-tight leading-tight text-white">
                  Sua área está <br /> <span className="text-[#D4AF37]">oficialmente online!</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-sm mx-auto font-medium">
                  A área <strong>{nome}</strong> foi configurada com sucesso.
                </p>
              </div>

              {/* URL Box */}
              <div className="w-full max-w-lg bg-[#0B1220] border border-white/10 p-8 rounded-[24px] space-y-6 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/50 group-hover:bg-[#D4AF37] transition-colors" />
                
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60 ml-1">Link de acesso exclusivo</span>
                  <div className="flex items-center justify-between gap-4 p-5 bg-black/40 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group/url">
                    <Globe className="h-5 w-5 text-[#D4AF37] shrink-0 group-hover/url:scale-110 transition-transform" />
                    <span className="text-base font-bold truncate flex-1 font-mono text-white/90 selection:bg-[#D4AF37] selection:text-[#0F172A]">
                      https://{subdominio}.{rootDomain}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUrl}
                        className="h-10 w-10 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"
                        title="Copiar URL"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-10 w-10 rounded-xl hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                        title="Abrir em nova aba"
                      >
                        <a href={`https://${subdominio}.${rootDomain}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500/60 italic px-2">
                  * Você pode configurar um domínio personalizado a qualquer momento nas configurações da área.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full max-w-sm gap-4">
                <Button
                  onClick={() => {
                    handleClose(false);
                    navigate({ to: `/admin/areas/${mutation.data?.areaId}/edit` });
                  }}
                  className="h-14 bg-[#D4AF37] text-[#0F172A] font-black text-lg rounded-2xl hover:bg-[#D4AF37]/90 shadow-2xl shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Configurar layout da área
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleClose(false)}
                  className="h-12 text-slate-500 font-bold hover:text-white transition-colors hover:bg-white/5 rounded-xl"
                >
                  Voltar para a listagem
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
