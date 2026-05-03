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
      <DialogContent className="p-0 bg-[#0B1220] border-[#1F2937] text-[#F9FAFB] max-w-[850px] rounded-[24px] overflow-hidden shadow-2xl border">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-[90vh] md:h-[700px] bg-[#111827]"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 bg-[#111827] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">Criar Nova Área de Membros</h2>
                    <p className="text-sm text-slate-500 font-medium">Configure as bases do seu novo ecossistema</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Novo Ambiente</span>
                </div>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-[#111827]">
                {/* 1. IDENTIDADE DA ÁREA */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                      <Layers className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">1. Identidade da Área</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pl-4">
                    <div className="space-y-3 group">
                      <Label htmlFor="nome" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Título (Obrigatório)</Label>
                      <Input 
                        id="nome" 
                        placeholder="Ex: Reino das Cores Kids" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus-visible:ring-[#D4AF37] text-base font-bold transition-all hover:bg-white/[0.02]"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <Label htmlFor="rotuloCurto" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Rótulo curto</Label>
                      <Input 
                        id="rotuloCurto" 
                        placeholder="Ex: Kids" 
                        value={rotuloCurto}
                        onChange={(e) => setRotuloCurto(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus-visible:ring-[#D4AF37] text-base font-bold transition-all hover:bg-white/[0.02]"
                      />
                      <p className="text-[10px] text-slate-600 font-medium flex items-center gap-1.5 pl-1 italic">
                        <Info className="h-3 w-3" />
                        Versão compacta usada em badges e chips.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 group pl-4">
                    <Label htmlFor="descricao" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descreva para quem é essa área e o que ela entrega de valor..." 
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="bg-[#1F2937] border-white/5 min-h-[120px] rounded-xl focus-visible:ring-[#D4AF37] text-base font-medium resize-none transition-all hover:bg-white/[0.02] p-4 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. ENDEREÇO DA ÁREA */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                      <Globe className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">2. Endereço da Área</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pl-4">
                    <div className="space-y-3 group">
                      <Label htmlFor="subdominio" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Identificador (Obrigatório)</Label>
                      <Input 
                        id="subdominio" 
                        placeholder="Ex: desafio24dias" 
                        value={subdominio}
                        onChange={(e) => setSubdominio(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                        className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus-visible:ring-[#D4AF37] font-mono text-sm transition-all hover:bg-white/[0.02]"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <Label htmlFor="rootDomain" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Domínio raiz</Label>
                      <Input 
                        id="rootDomain" 
                        placeholder="Ex: seudominio.com" 
                        value={rootDomain}
                        onChange={(e) => setRootDomain(e.target.value)}
                        className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus-visible:ring-[#D4AF37] font-mono text-sm transition-all hover:bg-white/[0.02]"
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0B1220] border border-[#D4AF37]/10 space-y-4 shadow-inner relative overflow-hidden group/url ml-4">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/70 ml-1 italic">Preview do link de acesso</span>
                    <div className="flex items-center justify-between gap-4 p-4 bg-black/30 rounded-xl border border-white/5 group-hover/url:border-[#D4AF37]/20 transition-all">
                      <Globe className="h-5 w-5 text-[#D4AF37] group-hover/url:scale-110 transition-transform duration-500" />
                      <span className="text-base font-black text-slate-300 truncate flex-1 font-mono tracking-tight">
                        https://<span className="text-[#D4AF37]">{subdominio || "subdominio"}</span>.<span className="text-white/90">{rootDomain || "dominio.com"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. CONFIGURAÇÕES DA ÁREA */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                      <Layout className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">3. Configurações da Área</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pl-4">
                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status Inicial</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus:ring-[#D4AF37] font-black text-sm transition-all hover:bg-white/[0.02]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/10 text-white">
                          <SelectItem value="active" className="focus:bg-[#D4AF37] focus:text-black font-black">Ativa</SelectItem>
                          <SelectItem value="draft" className="focus:bg-[#D4AF37] focus:text-black font-black">Rascunho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="language" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Idioma Padrão</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus:ring-[#D4AF37] font-black text-sm transition-all hover:bg-white/[0.02]">
                          <SelectValue placeholder="Idioma" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/10 text-white">
                          <SelectItem value="pt-BR" className="focus:bg-[#D4AF37] focus:text-black font-black">Português (Brasil)</SelectItem>
                          <SelectItem value="en" className="focus:bg-[#D4AF37] focus:text-black font-black">English (US)</SelectItem>
                          <SelectItem value="es" className="focus:bg-[#D4AF37] focus:text-black font-black">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 pl-4">
                    <Label htmlFor="produto" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Produto Principal (Vínculo Inicial)</Label>
                    <Select value={produtoId} onValueChange={setProdutoId}>
                      <SelectTrigger className="bg-[#1F2937] border-white/5 h-14 rounded-xl focus:ring-[#D4AF37] font-black text-sm transition-all hover:bg-white/[0.02]">
                        <SelectValue placeholder="Selecione um produto do seu catálogo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/10 text-white max-h-[250px]">
                        {courses?.map(course => (
                          <SelectItem key={course.id} value={course.id} className="focus:bg-[#D4AF37] focus:text-black font-black">
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. IDENTIDADE VISUAL RÁPIDA */}
                <div className="space-y-8 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                      <Palette className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">4. Identidade Visual Rápida</h3>
                  </div>

                  <div className="p-8 rounded-[24px] bg-[#1F2937]/40 border border-white/5 space-y-6 ml-4">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Cor de destaque (Primary)</Label>
                      <div className="flex gap-6">
                        <div className="relative group/picker">
                          <Input 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)} 
                            className="w-16 h-16 p-1 bg-[#1F2937] border-white/10 cursor-pointer rounded-xl transition-transform active:scale-95" 
                          />
                          <div className="absolute inset-0 rounded-xl ring-2 ring-[#D4AF37]/30 pointer-events-none opacity-0 group-hover/picker:opacity-100 transition-opacity" />
                        </div>
                        <Input 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)} 
                          className="flex-1 h-16 bg-[#1F2937] border-white/5 font-mono text-center font-black text-xl rounded-xl focus-visible:ring-[#D4AF37] transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-8 border-t border-white/5 bg-[#111827] flex gap-6">
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-16 rounded-2xl hover:bg-white/5 text-slate-500 font-black text-base transition-all uppercase tracking-widest"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={mutation.isPending || !nome || !subdominio || !produtoId}
                  className="flex-[2] h-16 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0F172A] font-black text-lg shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-tight"
                >
                  {mutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-7 w-7 animate-spin" />
                      Processando...
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
