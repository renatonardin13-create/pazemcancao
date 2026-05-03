import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Music, Search, Pencil, Trash2, GripVertical, Check, Star, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/EmptyState";
import { listAdminMusicas, createMusica, updateMusica, deleteMusica } from "@/lib/admin-musicas.functions";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/ImageUploadField";

interface CourseMusicasTabProps {
  courseId: string;
}

export function CourseMusicasTab({ courseId }: CourseMusicasTabProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingMusica, setEditingMusica] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-musicas", courseId, search],
    queryFn: () => listAdminMusicas({ data: { produto_id: courseId, search } }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMusica({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-musicas", courseId] });
      toast.success("Música removida com sucesso");
    },
    onError: (e: Error) => toastError(e),
  });

  const toggleDestaqueMutation = useMutation({
    mutationFn: ({ id, destaque }: { id: string; destaque: boolean }) =>
      updateMusica({ data: { id, destaque } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-musicas", courseId] });
    },
    onError: (e: Error) => toastError(e),
  });

  const musicas = data?.musicas || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar músicas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/20 h-10"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-orange-500 text-black hover:bg-orange-600 h-10 transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Música
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
          <p className="text-sm text-muted-foreground/60">Carregando músicas...</p>
        </div>
      ) : musicas.length === 0 ? (
        <EmptyState
          icon={Music}
          title={search ? "Nenhuma música encontrada" : "Nenhuma música cadastrada"}
          description={search ? "Tente buscar com outros termos." : "Comece adicionando músicas a este pack de louvores."}
          actionLabel={search ? "Limpar busca" : "Adicionar primeira música"}
          onAction={() => search ? setSearch("") : setIsAdding(true)}
        />
      ) : (
        <div className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/20 bg-muted/5">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 w-10">Ordem</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Música</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Artista / Categoria</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 text-center">Destaque</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {musicas.map((musica: any) => (
                  <tr key={musica.id} className="hover:bg-card/40 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                        <span className="text-xs font-medium text-muted-foreground/70">{musica.ordem}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted/20 border border-border/10 overflow-hidden flex-shrink-0">
                          {musica.capa_url ? (
                            <img src={musica.capa_url} alt={musica.titulo} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Music className="h-4 w-4 text-gold/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground/90 truncate">{musica.titulo}</p>
                          <p className="text-[11px] text-muted-foreground/50 truncate font-medium uppercase tracking-tighter">MP3: {musica.audio_url.split('/').pop()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground/70">{musica.artista || "Sem artista"}</p>
                        <p className="text-[10px] text-muted-foreground/50 uppercase font-bold">{musica.categoria || "Geral"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleDestaqueMutation.mutate({ id: musica.id, destaque: !musica.destaque })}
                        className={`p-1.5 rounded-lg transition-colors ${musica.destaque ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground/20 hover:text-muted-foreground/40'}`}
                      >
                        <Star className={`h-4 w-4 ${musica.destaque ? 'fill-orange-500' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-orange-500/10 hover:text-orange-500"
                          onClick={() => setEditingMusica(musica)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (confirm("Deseja realmente excluir esta música?")) {
                              deleteMutation.mutate(musica.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(isAdding || editingMusica) && (
        <MusicaDialog
          isOpen={isAdding || !!editingMusica}
          onClose={() => { setIsAdding(false); setEditingMusica(null); }}
          courseId={courseId}
          musica={editingMusica}
        />
      )}
    </div>
  );
}

function MusicaDialog({ isOpen, onClose, courseId, musica }: { isOpen: boolean; onClose: () => void; courseId: string; musica?: any }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: musica?.titulo || "",
    artista: musica?.artista || "",
    categoria: musica?.categoria || "",
    capa_url: musica?.capa_url || "",
    audio_url: musica?.audio_url || "",
    destaque: musica?.destaque || false,
    ordem: musica?.ordem || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.audio_url) {
      toast.error("Preencha o título e o arquivo de áudio");
      return;
    }

    setIsSubmitting(true);
    try {
      if (musica) {
        await updateMusica({ data: { id: musica.id, ...formData } });
        toast.success("Música atualizada com sucesso");
      } else {
        await createMusica({ data: { produto_id: courseId, ...formData } });
        toast.success("Música adicionada com sucesso");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-musicas", courseId] });
      onClose();
    } catch (e: any) {
      toastError(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error("Por favor, selecione um arquivo de áudio (MP3)");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, audio_url: publicUrl }));
      toast.success("Áudio enviado com sucesso!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{musica ? "Editar Música" : "Adicionar Nova Música"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Título <span className="text-gold">*</span></Label>
            <Input
              value={formData.titulo}
              onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Soldado Ferido"
              className="bg-background/50 border-border/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Artista</Label>
              <Input
                value={formData.artista}
                onChange={e => setFormData(prev => ({ ...prev, artista: e.target.value }))}
                placeholder="Ex: Nome do Cantor"
                className="bg-background/50 border-border/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                value={formData.categoria}
                onChange={e => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                placeholder="Ex: Adoração"
                className="bg-background/50 border-border/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Arquivo de Áudio (MP3) <span className="text-gold">*</span></Label>
            <div className="flex gap-2">
              <Input
                value={formData.audio_url}
                onChange={e => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                placeholder="URL do áudio ou faça upload"
                className="bg-background/50 border-border/20"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10"
                  disabled={isSubmitting}
                />
                <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <ImageUploadField
              label="Capa da Música"
              hint="Opcional - Formato 1:1 recomendado"
              value={formData.capa_url}
              onChange={url => setFormData(prev => ({ ...prev, capa_url: url }))}
              folder="covers"
              aspectClass="aspect-square w-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={formData.ordem}
                onChange={e => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                className="bg-background/50 border-border/20"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="destaque"
                checked={formData.destaque}
                onChange={e => setFormData(prev => ({ ...prev, destaque: e.target.checked }))}
                className="rounded border-border/20 bg-background/50 text-gold focus:ring-gold"
              />
              <Label htmlFor="destaque" className="cursor-pointer">Música em destaque</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gold text-black hover:bg-gold/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {musica ? "Salvar Alterações" : "Adicionar Música"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
