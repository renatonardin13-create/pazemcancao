import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, ArrowLeft, Loader2, Check, AlertCircle, Sparkles, Layout, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createArea, checkSlugAvailability } from "@/lib/admin-areas.functions";
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
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Debounced slug check
  useEffect(() => {
    if (slug.length < 3) {
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

  const mutation = useMutation({
    mutationFn: (vars: any) => createArea({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Área de membros criada com sucesso!");
      setShowSuccess(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao criar área");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !isSlugAvailable) return;
    mutation.mutate({ name, slug, language, status });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setSlug(value);
  };

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
                      <Label htmlFor="language" className="text-sm font-bold">Idioma</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en">Inglês</SelectItem>
                          <SelectItem value="es">Espanhol</SelectItem>
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
