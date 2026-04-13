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
import { Video, BookText, Save, Loader2, ImageIcon } from "lucide-react";
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
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ========== LEFT COLUMN — Info + Images ========== */}
        <div className="space-y-6">
          {/* Card: Informações do Curso */}
          <div className="rounded-xl border border-border/10 bg-card/5 p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
              Informações do Curso
            </h3>

            {/* Type selector */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Curso de Piano para Iniciantes"
                required
                className="bg-card/10 border-border/15"
              />
            </div>

            {/* Short description */}
            <div className="space-y-2">
              <Label htmlFor="shortDesc">Descrição Curta</Label>
              <Input
                id="shortDesc"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Breve descrição exibida nos cards"
                className="bg-card/10 border-border/15"
              />
            </div>

            {/* Full description */}
            <div className="space-y-2">
              <Label htmlFor="fullDesc">Descrição Completa</Label>
              <Textarea
                id="fullDesc"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Descrição detalhada do curso..."
                rows={5}
                className="bg-card/10 border-border/15"
              />
            </div>

            {/* Category & Status */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-card/10 border-border/15">
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card/10 border-border/15">
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

            {/* Price & Launch date */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-card/10 border-border/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="launchDate">Data de Lançamento</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="bg-card/10 border-border/15"
                />
              </div>
            </div>
          </div>

          {/* Card: Imagens */}
          <div className="rounded-xl border border-border/10 bg-card/5 p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
              Imagens
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Cover image */}
              <div className="space-y-2">
                <Label htmlFor="coverUrl">Capa do Curso</Label>
                <Input
                  id="coverUrl"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/10 border-border/15"
                />
                <ImageFieldHint
                  ratio="16:9"
                  recommendedSize="400x225"
                  autoCrop
                  note="Para melhor resultado nos cards da vitrine, prefira imagem vertical em proporção 2:3."
                  previewUrl={coverUrl || null}
                />
                <p className="text-[10px] text-muted-foreground/30">
                  Formatos aceitos: JPG, PNG, WebP
                </p>
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="Capa"
                    className="mt-2 h-24 w-auto rounded-lg object-cover border border-border/10"
                  />
                )}
              </div>

              {/* Banner image */}
              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Banner Principal</Label>
                <Input
                  id="bannerUrl"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/10 border-border/15"
                />
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground/35 shrink-0">Proporção:</span>
                  {bannerRatioOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBannerRatio(opt.value)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all ${
                        bannerRatio === opt.value
                          ? "border-gold/30 bg-gold/10 text-gold"
                          : "border-border/15 bg-card/5 text-muted-foreground/35 hover:border-border/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <ImageFieldHint
                  ratio={currentBannerOption.value}
                  recommendedSize={currentBannerOption.size}
                  autoCrop
                  previewUrl={bannerUrl || null}
                />
                <p className="text-[10px] text-muted-foreground/30">
                  Formatos aceitos: JPG, PNG, WebP
                </p>
                {bannerUrl && (
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="mt-2 h-24 w-auto rounded-lg object-cover border border-border/10"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== RIGHT COLUMN — Preview ========== */}
        <div>
          <div className="rounded-xl border border-border/10 bg-card/5 p-4 space-y-4 sticky top-6">
            <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
              Preview do Curso
            </h3>

            {/* Cover preview */}
            <div className="rounded-lg overflow-hidden border border-border/10 bg-muted/10 aspect-video flex items-center justify-center">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/20">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[10px] uppercase tracking-widest">Sem capa</span>
                </div>
              )}
            </div>

            {/* Title preview */}
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground/80 leading-tight truncate">
                {title || "Título do curso"}
              </p>
              {shortDesc && (
                <p className="text-[11px] text-muted-foreground/40 line-clamp-2">
                  {shortDesc}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/30">
                {courseType === "video" ? <Video className="h-3 w-3" /> : <BookText className="h-3 w-3" />}
                {courseType === "video" ? "Vídeo" : "eBook"}
              </span>
              {selectedCategory && (
                <span className="text-[10px] text-muted-foreground/30">
                  {selectedCategory.icon || "📁"} {selectedCategory.name}
                </span>
              )}
            </div>

            {price && parseFloat(price) > 0 && (
              <p className="text-xs font-semibold text-gold/60">
                R$ {parseFloat(price).toFixed(2)}
              </p>
            )}

            {/* Banner preview */}
            {bannerUrl && (
              <div className="space-y-1.5 pt-2 border-t border-border/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/25">Banner</p>
                <div className="rounded-lg overflow-hidden border border-border/10">
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}
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
