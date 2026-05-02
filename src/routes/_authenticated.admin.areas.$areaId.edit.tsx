import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Globe, 
  ArrowLeft, 
  Loader2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layout, 
  BookOpen, 
  GraduationCap, 
  Copy, 
  ExternalLink, 
  Save,
  Star,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateArea, getAreas, deleteArea } from "@/lib/admin-areas.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/areas/$areaId/edit")({
  component: EditAreaPage,
});

function EditAreaPage() {
  const { areaId } = useParams({ from: "/_authenticated/admin/areas/$areaId/edit" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: areasData, isLoading: isLoadingArea } = useQuery({
    queryKey: ["admin-areas"],
    queryFn: () => getAreas(),
  });

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

  const area = areasData?.areas?.find((a: any) => a.id === areaId);

  useEffect(() => {
    if (area) {
      setName(area.name);
      setSlug(area.slug);
      setStatus(area.status);
      setProductId(area.product_id || "");
      setIsPrimary(area.is_primary || false);
    }
  }, [area]);

  const mutation = useMutation({
    mutationFn: (vars: any) => updateArea({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área atualizada com sucesso!");
      navigate({ to: "/admin/areas-membros" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar área");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteArea({ data: { id: areaId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área excluída com sucesso");
      navigate({ to: "/admin/areas-membros" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir área");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !productId) {
      if (!productId) toast.error("Selecione um produto vinculado");
      return;
    }
    mutation.mutate({ 
      id: areaId,
      name, 
      status, 
      product_id: productId, 
      is_primary: isPrimary 
    });
  };

  if (isLoadingArea) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!area) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Área não encontrada</h2>
        <Button onClick={() => navigate({ to: "/admin/areas-membros" })} className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin/areas-membros" })}
            className="rounded-full hover:bg-gold/10 hover:text-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Editar Área</h1>
            <p className="text-muted-foreground">Personalize as configurações de {area.name}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-xl"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Excluir área
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-bold">Nome da área</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 bg-background/50 focus-visible:ring-gold"
                    />
                  </div>

                  <div className="grid gap-2 opacity-60">
                    <Label htmlFor="slug" className="text-sm font-bold">Identificador (Subdomínio)</Label>
                    <Input
                      id="slug"
                      value={slug}
                      disabled
                      className="h-12 bg-background/30"
                    />
                    <p className="text-[10px] text-muted-foreground font-mono">
                      O identificador não pode ser alterado após a criação.
                    </p>
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

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/admin/areas-membros" })}
                    className="flex-1 h-14 rounded-xl font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending || !name || !productId}
                    className="flex-1 h-14 bg-gold text-black font-black text-lg rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40 border-border/20 backdrop-blur-sm sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" /> Preview do Acesso
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-background/80 border border-gold/20 group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Link público</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate font-mono text-gold">{slug}.suaplataforma.com.br</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                      <a href={`https://${slug}.suaplataforma.com.br`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border/40 font-bold justify-start gap-3">
                    <Layout className="h-4 w-4 text-muted-foreground" />
                    Customizar Design
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border/40 font-bold justify-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Gerenciar Conteúdos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border/30 rounded-[2rem] p-8 max-w-md">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center">Excluir Área?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg text-muted-foreground">
              Esta ação removerá permanentemente a área <strong>{name}</strong> e todos os seus vínculos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
            <AlertDialogCancel className="h-14 flex-1 rounded-xl border-border/40 font-bold">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate()}
              className="h-14 flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}