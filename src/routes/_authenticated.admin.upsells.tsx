import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAllUpsells, listProductsByType, createUpsell, deleteUpsell, toggleUpsell } from "@/lib/upsell.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, X, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/_authenticated/admin/upsells")({
  component: AdminUpsellsPage,
});

function AdminUpsellsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-upsells"],
    queryFn: () => listAllUpsells(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUpsell({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upsells"] });
      toast.success("Upsell removido!");
    },
    onError: (err: any) => toastError(err),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) => toggleUpsell({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upsells"] });
    },
    onError: (err: any) => toastError(err),
  });

  const upsells = data?.upsells || [];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" /> Upsells
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Gerencie sugestões de produtos complementares
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancelar" : "Novo Upsell"}
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <CreateUpsellForm
          onCreated={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-upsells"] });
          }}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
        </div>
      ) : upsells.length === 0 ? (
        <Card className="bg-card border-border/30">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/60">Nenhum upsell configurado</p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Crie upsells para sugerir produtos complementares aos seus alunos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {upsells.map((u: any) => (
            <Card key={u.id} className={`bg-card border-border/20 transition-opacity ${!u.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-muted/20 text-[10px] font-bold uppercase">
                      {u.source_type}
                    </span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-bold uppercase">
                      {u.target_type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {u.source_title} → {u.target_title}
                  </p>
                  {u.description && (
                    <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">{u.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={u.is_active}
                    onCheckedChange={() => toggleMut.mutate({ id: u.id, is_active: !u.is_active })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/50 hover:text-destructive"
                    onClick={() => {
                      if (confirm("Remover este upsell?")) deleteMut.mutate(u.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Product selector (combobox with search) ── */
function ProductSelector({
  type,
  value,
  onChange,
  error,
}: {
  type: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["upsell-products", type],
    queryFn: () => listProductsByType({ data: { type } }),
    staleTime: 30_000,
  });

  const products = data?.products || [];

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p: any) => p.title.toLowerCase().includes(q));
  }, [products, search]);

  const selectedProduct = products.find((p: any) => p.id === value);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between mt-1 text-xs font-normal h-9 ${error ? "border-destructive" : ""} ${!value ? "text-muted-foreground" : ""}`}
          >
            <span className="truncate">
              {selectedProduct ? selectedProduct.title : "Selecionar produto..."}
            </span>
            <Search className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar produto..."
              value={search}
              onValueChange={setSearch}
              className="text-xs"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Carregando..." : "Nenhum produto encontrado."}
              </CommandEmpty>
              <CommandGroup>
                {filtered.map((p: any) => (
                  <CommandItem
                    key={p.id}
                    value={p.title}
                    onSelect={() => {
                      onChange(p.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="text-xs"
                  >
                    <span className="truncate flex-1">{p.title}</span>
                    {!p.active && (
                      <span className="text-[10px] text-amber-400 ml-2 shrink-0">inativo</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

/* ── Create form ── */
function CreateUpsellForm({ onCreated }: { onCreated: () => void }) {
  const [sourceType, setSourceType] = useState("course");
  const [sourceId, setSourceId] = useState("");
  const [targetType, setTargetType] = useState("course");
  const [targetId, setTargetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!sourceId) errors.sourceId = "Selecione o produto de origem.";
    if (!targetId) errors.targetId = "Selecione o produto sugerido.";
    if (sourceId && targetId && sourceId === targetId && sourceType === targetType) {
      errors.targetId = "O produto de origem e o produto sugerido não podem ser o mesmo.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createMut = useMutation({
    mutationFn: () =>
      createUpsell({
        data: {
          source_type: sourceType,
          source_id: sourceId,
          target_type: targetType,
          target_id: targetId,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Upsell criado!");
      onCreated();
    },
    onError: (err: any) => toastError(err),
  });

  return (
    <Card className="bg-card border-gold/15">
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Novo Upsell</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Produto de Origem</h4>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={sourceType} onValueChange={(v) => { setSourceType(v); setSourceId(""); setFieldErrors({}); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Curso</SelectItem>
                  <SelectItem value="content">Conteúdo</SelectItem>
                  <SelectItem value="track">Música</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Produto</Label>
              <ProductSelector
                type={sourceType}
                value={sourceId}
                onChange={(id) => { setSourceId(id); setFieldErrors((p) => ({ ...p, sourceId: "" })); }}
                error={fieldErrors.sourceId}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Produto Sugerido (Upsell)</h4>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={targetType} onValueChange={(v) => { setTargetType(v); setTargetId(""); setFieldErrors({}); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Curso</SelectItem>
                  <SelectItem value="content">Conteúdo</SelectItem>
                  <SelectItem value="track">Música</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Produto</Label>
              <ProductSelector
                type={targetType}
                value={targetId}
                onChange={(id) => { setTargetId(id); setFieldErrors((p) => ({ ...p, targetId: "" })); }}
                error={fieldErrors.targetId}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Título (opcional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título customizado" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta" className="mt-1" />
          </div>
        </div>

        <Button
          onClick={() => { if (validateForm()) createMut.mutate(); }}
          disabled={!sourceId || !targetId || createMut.isPending}
          className="gap-2"
        >
          {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Criar Upsell
        </Button>
      </CardContent>
    </Card>
  );
}
