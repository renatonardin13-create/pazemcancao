import { useState, useEffect, forwardRef } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { listAdminCategories } from "@/lib/admin-courses.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, BookText, Save, Loader2, ImageIcon, X } from "lucide-react";
import { ImageFieldHint } from "@/components/ImageFieldHint";


interface CourseFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  hideSubmitButton?: boolean;
}

export const CourseForm = forwardRef<HTMLFormElement, CourseFormProps>(function CourseForm({
  initialValues,
  onSubmit,
  isSubmitting,
  hideSubmitButton,
}, ref) {
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("0");
  const [status, setStatus] = useState("draft");
  const [courseType, setCourseType] = useState("video");
  const [launchDate, setLaunchDate] = useState("");
  const [bannerRatio, setBannerRatio] = useState("3.84:1");

  const bannerRatioOptions = [
    { value: "3.84:1", label: "Hero Wide (3.84:1)", size: "1920x500" },
    { value: "21:9", label: "Ultra Wide (21:9)", size: "2100x900" },
    { value: "16:9", label: "Widescreen (16:9)", size: "1920x1080" },
    { value: "3:1", label: "Promo (3:1)", size: "1200x400" },
  ];

  const currentBannerOption = bannerRatioOptions.find((o) => o.value === bannerRatio) || bannerRatioOptions[0];

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const categories = categoriesData?.categories || [];

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "");
      setShortDesc(initialValues.short_description || "");
      setFullDesc(initialValues.full_description || "");
      setCoverUrl(initialValues.cover_image_url || "");
      setBannerUrl(initialValues.banner_image_url || "");
      setCategoryId(initialValues.category_id || "");
      setPrice(String(initialValues.price ?? 0));
      setStatus(initialValues.status || "draft");
      setCourseType(initialValues.course_type || "video");
      setLaunchDate(initialValues.launch_date || "");
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      short_description: shortDesc.trim() || undefined,
      full_description: fullDesc.trim() || undefined,
      cover_image_url: coverUrl.trim() || undefined,
      banner_image_url: bannerUrl.trim() || undefined,
      category_id: categoryId || undefined,
      price: parseFloat(price) || 0,
      status,
      course_type: courseType,
      launch_date: launchDate || undefined,
    });
  };


  const selectedCategory = categories.find((c: any) => c.id === categoryId);

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
      {/* 2-column layout: desktop side-by-side, mobile stacked */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        {/* ========== LEFT COLUMN — Info + Images ========== */}
        <div className="space-y-6 order-1">
          {/* Card: Informações do Curso */}
          <div className="rounded-xl border border-border/10 bg-card/5 p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight border-b border-border/8 pb-3">
              Informações do Curso
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-muted-foreground/60">
                Título do Curso <span className="text-gold/60">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Curso de Piano para Iniciantes"
                required
                className="bg-card/10 border-border/12 focus:border-gold/30"
              />
            </div>

            {/* Short description */}
            <div className="space-y-1.5">
              <Label htmlFor="shortDesc" className="text-xs font-medium text-muted-foreground/60">
                Descrição Curta
              </Label>
              <Input
                id="shortDesc"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Breve descrição exibida nos cards"
                className="bg-card/10 border-border/12 focus:border-gold/30"
              />
            </div>

            {/* Full description */}
            <div className="space-y-1.5">
              <Label htmlFor="fullDesc" className="text-xs font-medium text-muted-foreground/60">
                Descrição Completa
              </Label>
              <Textarea
                id="fullDesc"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Descrição detalhada do curso..."
                rows={5}
                className="bg-card/10 border-border/12 focus:border-gold/30"
              />
            </div>

            {/* Category & Status — side by side */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground/60">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-card/10 border-border/12">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon || "📁"} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground/60">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card/10 border-border/12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Card: Configurações Adicionais */}
          <div className="rounded-xl border border-border/10 bg-card/5 p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight border-b border-border/8 pb-3">
              Configurações Adicionais
            </h3>

            {/* Type selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground/60">
                Modalidade
              </Label>
              <div className="flex gap-3">
                {[
                  { value: "video", label: "Vídeo", icon: Video, color: "text-gold" },
                  { value: "ebook", label: "eBook", icon: BookText, color: "text-blue-400" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCourseType(type.value)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-300 ${
                      courseType === type.value
                        ? `border-gold/30 bg-gold/10 ${type.color}`
                        : "border-border/15 bg-card/5 text-muted-foreground/40 hover:border-border/30"
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Launch date */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-medium text-muted-foreground/60">
                  Preço (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-card/10 border-border/12 focus:border-gold/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="launchDate" className="text-xs font-medium text-muted-foreground/60">
                  Data de Lançamento
                </Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="bg-card/10 border-border/12 focus:border-gold/30"
                />
              </div>
            </div>
          </div>

          {/* Card: Imagens */}
          <div className="rounded-xl border border-border/10 bg-card/5 p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight border-b border-border/8 pb-3">
              Imagens
            </h3>

            {/* CAPA DO CURSO */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground/60">
                Capa do Curso
              </Label>
              <p className="text-[11px] text-muted-foreground/35 -mt-1">
                Imagem exibida na listagem de cursos
              </p>

              {/* Preview or placeholder */}
              <div className="rounded-lg border border-border/10 bg-muted/5 overflow-hidden">
                {coverUrl ? (
                  <div className="relative group">
                    <img
                      src={coverUrl}
                      alt="Capa do curso"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-card/80 border border-border/20 text-xs font-medium text-foreground/80 hover:bg-card transition-colors">
                        Trocar imagem
                        <input type="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverUrl("")}
                        className="p-1.5 rounded-lg bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground/20">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-[10px] uppercase tracking-widest">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* URL input */}
              <Input
                id="coverUrl"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="Cole a URL da imagem..."
                className="bg-card/10 border-border/12 focus:border-gold/30 text-xs"
              />

              {/* Specs */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/30">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card/10 border border-border/8">
                  Proporção: <strong className="text-muted-foreground/50">16:9</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card/10 border border-border/8">
                  Tamanho: <strong className="text-muted-foreground/50">400×225 px</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card/10 border border-border/8">
                  Formatos: <strong className="text-muted-foreground/50">JPG, PNG, WebP</strong>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/8" />

            {/* BANNER PRINCIPAL */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground/60">
                Banner Principal
              </Label>
              <p className="text-[11px] text-muted-foreground/35 -mt-1">
                Banner exibido na vitrine
              </p>

              {/* Preview or placeholder */}
              <div className="rounded-lg border border-border/10 bg-muted/5 overflow-hidden">
                {bannerUrl ? (
                  <div className="relative group">
                    <img
                      src={bannerUrl}
                      alt="Banner do curso"
                      className="w-full object-cover"
                      style={{ aspectRatio: "1920/500" }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-card/80 border border-border/20 text-xs font-medium text-foreground/80 hover:bg-card transition-colors">
                        Trocar imagem
                        <input type="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="p-1.5 rounded-lg bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/20 py-8">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-[10px] uppercase tracking-widest">Sem banner</span>
                  </div>
                )}
              </div>

              {/* URL input */}
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Cole a URL do banner..."
                className="bg-card/10 border-border/12 focus:border-gold/30 text-xs"
              />

              {/* Specs */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/30">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card/10 border border-border/8">
                  Tamanho: <strong className="text-muted-foreground/50">1920×500 px</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card/10 border border-border/8">
                  Formatos: <strong className="text-muted-foreground/50">JPG, PNG, WebP</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== RIGHT COLUMN — Preview ========== */}
        <div>
          <div className="rounded-xl border border-border/10 bg-card/5 p-5 sticky top-6 space-y-1">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight pb-3 border-b border-border/8">
              Preview
            </h3>

            {/* Simulated course card */}
            <div className="rounded-xl overflow-hidden border border-border/10 bg-background/40 shadow-lg">
              {/* Cover */}
              <div className="aspect-video bg-muted/10 flex items-center justify-center overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Capa"
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/15">
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-[9px] uppercase tracking-[0.3em]">Sem capa</span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 space-y-2">
                <p className="text-sm font-bold text-foreground/85 leading-snug line-clamp-2 transition-all duration-300">
                  {title || "Título do curso"}
                </p>
                <p className="text-[11px] text-muted-foreground/40 line-clamp-2 min-h-[2em] transition-all duration-300">
                  {shortDesc || "Descrição curta do curso aparecerá aqui..."}
                </p>
              </div>
            </div>

            <p className="text-[9px] text-center text-muted-foreground/20 uppercase tracking-[0.3em] pt-3">
              Visualização em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      {!hideSubmitButton && (
        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {initialValues ? "Salvar Alterações" : "Criar Curso"}
          </Button>
        </div>
      )}
    </form>
  );
});
