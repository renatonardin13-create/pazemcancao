import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Globe, ArrowLeft, Loader2, Check, AlertCircle, Sparkles, Layout, BookOpen, GraduationCap, Copy, ExternalLink, PartyPopper, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createArea, checkSlugAvailability } from "@/lib/admin-areas.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/areas/new")({
  component: NewAreaPage,
});

function NewAreaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [status, setStatus] = useState("active");
  const [productId, setProductId] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-courses-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    }
  });

  // Debounced slug check
  useEffect(() => {
    const error = validateSlug(slug);
    setSlugError(error);

    if (slug.length < 3 || error) {
      setIsSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { available } = await checkSlugAvailability({ data: { slug } });
        setIsSlugAvailable(available);
      } catch (error) {
        console.error("Error checking slug:", error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const validateSlug = (val: string) => {
    if (val.length === 0) return null;
    if (val.length < 3) return "O identificador deve ter pelo menos 3 caracteres.";
    if (val.length > 63) return "O identificador deve ter no máximo 63 caracteres.";
    if (!/^[a-z0-9-]+$/.test(val)) return "Use apenas letras minúsculas, números e hifens.";
    if (val.startsWith("-")) return "Não pode começar com hífen.";
    if (val.endsWith("-")) return "Não pode terminar com hífen.";
    if (val.includes("--")) return "Não pode conter hifens consecutivos.";
    return null;
  };

  const mutation = useMutation({
    mutationFn: (vars: any) => createArea({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área de membros criada com sucesso!");
      setShowSuccess(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao criar área");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !isSlugAvailable || !productId) {
      if (!productId) toast.error("Selecione um produto vinculado");
      return;
    }
    mutation.mutate({ 
      name, 
      slug, 
      language, 
      status, 
      product_id: productId, 
      is_primary: isPrimary 
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setSlug(value);
  };

  if (showSuccess) {
    const areaUrl = `https://${slug}.suaplataforma.com.br`;

    const handleCopyUrl = () => {
      navigator.clipboard.writeText(areaUrl);
      toast.success("URL copiada!");
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full text-center space-y-12"
        >
          {/* Visual Highlight */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.1 
              }}
              className="relative h-32 w-32 bg-gold rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(212,175,55,0.3)] border-4 border-background z-10 rotate-3"
            >
              <PartyPopper className="h-16 w-16 text-black" />
            </motion.div>
            
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 blur-[120px] rounded-full -z-10" />
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest"
            >
              <Check className="h-3 w-3" /> Configuração Concluída
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black tracking-tight leading-[1.1]"
            >
              Sua área está <br /> <span className="text-gold">oficialmente online!</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg max-w-sm mx-auto"
            >
              A área <strong>{name}</strong> foi configurada com sucesso. Copie o link abaixo para compartilhar.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-8"
          >
            {/* Premium URL Box */}
            <div className="relative group p-1 bg-gradient-to-b from-border/50 to-transparent rounded-[2rem]">
              <div className="bg-card/40 border border-border/20 p-8 rounded-[1.8rem] backdrop-blur-xl shadow-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Link de acesso dos alunos</span>
                  <div className="flex items-center justify-between gap-4 p-4 bg-background/80 rounded-2xl border border-gold/20 group-hover:border-gold/40 transition-colors">
                    <Globe className="h-5 w-5 text-gold shrink-0" />
                    <span className="text-lg font-bold truncate flex-1 font-mono">{areaUrl}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUrl}
                        className="h-10 w-10 rounded-xl hover:bg-gold/10 hover:text-gold transition-colors"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-10 w-10 rounded-xl hover:bg-gold/10 hover:text-gold transition-colors"
                      >
                        <a href={areaUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Action Button */}
            <div className="flex flex-col gap-6">
              <Button
                size="lg"
                onClick={() => navigate({ to: "/admin/courses" })}
                className="h-20 bg-gold text-black font-black text-2xl shadow-[0_20px_50px_-15px_rgba(212,175,55,0.4)] hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-[1.5rem] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-3">
                  Ir para o Catálogo
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </span>
              </Button>
              
              <button
                onClick={() => navigate({ to: "/admin" })}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 group mx-auto"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para o Dashboard
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-4 border-t border-border/10"
          >
            <p className="text-sm text-muted-foreground italic flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              Próximo passo: Adicione seu primeiro produto para começar a vender.
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/admin" })}
          className="rounded-full hover:bg-gold/10 hover:text-gold"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Criar Nova Área</h1>
          <p className="text-muted-foreground">Configure o ambiente onde seus alunos terão acesso aos conteúdos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black uppercase tracking-widest text-gold">
                  <Sparkles className="h-3 w-3" /> Configuração Essencial
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-relaxed">
                    Você está criando um ambiente exclusivo para seus usuários.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aqui eles terão acesso aos seus conteúdos, produtos e materiais.
                  </p>
                  <div className="pt-2 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Exemplos:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-gold" /> Curso online
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-gold" /> Área VIP
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-gold" /> Biblioteca de conteúdo
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-bold">Nome da área</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Comunidade Premium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 bg-background/50 focus-visible:ring-gold"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="slug" className="text-sm font-bold">Identificador (subdomínio)</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        placeholder="minha-area"
                        value={slug}
                        onChange={handleSlugChange}
                        required
                        className={`h-12 bg-background/50 pr-10 focus-visible:ring-gold ${
                          slug.length >= 3 && isSlugAvailable === false ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingSlug ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isSlugAvailable === true ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : isSlugAvailable === false ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    </div>
                    {slug && (
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                        Preview: <span className="text-gold font-bold">{slug}.suaplataforma.com.br</span>
                      </p>
                    )}
                    {slug.length >= 3 && isSlugAvailable === false && (
                      <p className="text-[11px] text-destructive font-medium">Este identificador já está em uso.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productId" className="text-sm font-bold">Produto Vinculado</Label>
                      <Select value={productId} onValueChange={setProductId}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-sm font-bold">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="draft">Rascunho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Star className={`h-4 w-4 ${isPrimary ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
                        Área Principal
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Esta será a área padrão para novos alunos.
                      </p>
                    </div>
                    <Switch
                      checked={isPrimary}
                      onCheckedChange={setIsPrimary}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending || !isSlugAvailable || !name}
                  className="w-full h-14 bg-gold text-black font-black text-lg rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando área...
                    </>
                  ) : (
                    "Criar área"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40 border-border/20 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" /> Resumo do Ambiente
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/20">
                  <Layout className="h-5 w-5 text-muted-foreground/60 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identidade</p>
                    <p className="text-sm font-medium">{name || "Aguardando nome..."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/20">
                  <GraduationCap className="h-5 w-5 text-muted-foreground/60 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Produtos</p>
                    <p className="text-sm font-medium">Catálogo completo</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/20">
                  <BookOpen className="h-5 w-5 text-muted-foreground/60 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acesso</p>
                    <p className="text-sm font-medium">Liberado por oferta</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                <p className="text-[11px] text-gold/70 leading-relaxed italic">
                  "Após criar a área, você será levado ao catálogo para adicionar seu primeiro produto e seção."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
