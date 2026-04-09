import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { PageContainer } from "@/components/PageContainer";
import { FooterLinks } from "@/components/FooterLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, Music, Trash2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const categories = ["Paz", "Cura", "Força", "Oração", "Madrugada", "Presença", "Refúgio"];

function AdminPage() {
  const { user, isAdmin, adminLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tracks
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !adminLoading && isAdmin,
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Paz");
  const [duration, setDuration] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!audioFile || !title || !duration) throw new Error("Preencha todos os campos");

      setUploading(true);
      const ext = audioFile.name.split(".").pop();
      const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("tracks")
        .upload(path, audioFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("tracks").getPublicUrl(path);

      const sortOrder = (tracks?.length || 0) + 1;

      const { error: insertError } = await supabase.from("tracks").insert({
        title,
        description,
        category,
        duration,
        storage_path: path,
        download_url: urlData.publicUrl,
        sort_order: sortOrder,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Louvor adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("Paz");
      setDuration("");
      setAudioFile(null);
      setUploading(false);
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const track = tracks?.find((t) => t.id === trackId);
      if (track?.storage_path) {
        await supabase.storage.from("tracks").remove([track.storage_path]);
      }
      const { error } = await supabase.from("tracks").delete().eq("id", trackId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Louvor removido.");
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    },
  });

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold/25">Verificando acesso...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground/85">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground/50">Você não tem permissão de administrador.</p>
          <Link to="/downloads" className="mt-6 inline-flex items-center gap-2 text-[11px] text-gold/50 hover:text-gold/70 uppercase tracking-wider transition-colors">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <AppHeader />

      <PageContainer className="pt-10 sm:pt-14">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground/85">Painel Admin</h1>
            <p className="mt-1 text-xs text-muted-foreground/40">Gerencie os louvores da coleção</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 rounded-full"
            variant={showForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancelar" : "Novo Louvor"}
          </Button>
        </div>

        {/* Upload form */}
        {showForm && (
          <div className="mb-10 rounded-2xl border border-border/25 bg-card/20 p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="font-display text-lg font-bold text-foreground/80 mb-6">Adicionar Louvor</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do louvor" className="bg-background/40 border-border/25" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Duração</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="4:32" className="bg-background/40 border-border/25" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Categoria</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background/40 border border-border/25 text-sm text-foreground"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Arquivo de Áudio</Label>
                <Input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="bg-background/40 border-border/25"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Descrição</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Uma breve descrição emocional do louvor" className="bg-background/40 border-border/25" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={uploading || !title || !audioFile || !duration}
                className="gap-2 rounded-full"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Enviando..." : "Enviar Louvor"}
              </Button>
            </div>
          </div>
        )}

        {/* Track list */}
        <div className="space-y-2">
          {tracksLoading ? (
            <p className="text-center text-xs text-muted-foreground/30 py-12">Carregando...</p>
          ) : !tracks?.length ? (
            <div className="text-center py-16">
              <Music className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/35">Nenhum louvor adicionado ainda.</p>
            </div>
          ) : (
            tracks.map((track, i) => (
              <div
                key={track.id}
                className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/10 px-5 py-4 transition-colors hover:bg-card/20"
              >
                <span className="text-[11px] font-mono text-muted-foreground/25 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">{track.title}</p>
                  <p className="text-[11px] text-muted-foreground/30">
                    {track.category} · {track.duration}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Deseja remover este louvor?")) {
                      deleteMutation.mutate(track.id);
                    }
                  }}
                  className="text-destructive/40 hover:text-destructive/70 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </PageContainer>

      <FooterLinks variant="minimal" />
    </div>
  );
}
