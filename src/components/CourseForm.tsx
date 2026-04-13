import { useState, useEffect, forwardRef } from "react";
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

interface CourseFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  hideSubmitButton?: boolean;
}

const inputClass = "h-9 bg-background/50 border-border/20 focus:border-gold/40 rounded-lg text-sm";
const labelClass = "text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider";

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/12 bg-card shadow-md shadow-black/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/8 bg-card/90">
        <h3 className="text-[11px] font-black text-foreground/85 tracking-wider uppercase">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3.5">{children}</div>
    </div>
  );
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

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-4">

        {/* ===== LEFT: Informações + Configurações ===== */}
        <div className="space-y-4 order-1 lg:col-start-1">
          <CardSection title="Informações do Curso">
            <div className="space-y-1">
              <Label htmlFor="title" className={labelClass}>
                Título <span className="text-gold">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Curso Completo de Marketing Digital"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="shortDesc" className={labelClass}>Descrição Curta</Label>
              <Textarea
                id="shortDesc"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Uma breve descrição do curso (aparece na vitrine)"
                rows={3}
                className="bg-background/50 border-border/20 focus:border-gold/40 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fullDesc" className={labelClass}>Descrição Completa</Label>
              <Textarea
                id="fullDesc"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Descrição detalhada do curso"
                rows={4}
                className="bg-background/50 border-border/20 focus:border-gold/40 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={labelClass}>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Selecionar" />
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
              <div className="space-y-1">
                <Label className={labelClass}>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardSection>

          <CardSection title="Configurações">
            <div className="space-y-1">
              <Label className={labelClass}>Modalidade</Label>
              <div className="flex gap-2">
                {[
                  { value: "video", label: "Vídeo", icon: Video },
                  { value: "ebook", label: "eBook", icon: BookText },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCourseType(type.value)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      courseType === type.value
                        ? "border-gold/30 bg-gold/10 text-gold"
                        : "border-border/15 bg-background/30 text-muted-foreground/40 hover:border-border/30"
                    }`}
                  >
                    <type.icon className="h-3.5 w-3.5" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price" className={labelClass}>Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="launchDate" className={labelClass}>Lançamento</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </CardSection>
        </div>

        {/* ===== RIGHT: Preview ===== */}
        <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="rounded-xl border border-border/12 bg-card lg:sticky lg:top-6 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/8 bg-card/90">
              <h3 className="text-[10px] font-black text-foreground/70 tracking-wider uppercase">Preview</h3>
            </div>
            <div className="p-3">
              <div className="rounded-lg overflow-hidden border border-border/8 bg-background/20">
                <div className="aspect-[16/9] bg-muted/5 flex items-center justify-center overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground/15">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[7px] uppercase tracking-[0.2em]">Sem capa</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 space-y-0.5">
                  <p className="text-xs font-bold text-foreground/80 leading-snug line-clamp-2">
                    {title || "Título do curso"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 line-clamp-2 leading-relaxed">
                    {shortDesc || "Descrição curta aparecerá aqui..."}
                  </p>
                </div>
              </div>
              <p className="text-[7px] text-center text-muted-foreground/20 uppercase tracking-[0.2em] mt-2">
                Atualização em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* ===== LEFT: Imagens ===== */}
        <div className="order-3 lg:col-start-1">
          <CardSection title="Imagens">
            {/* Capa */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label className={labelClass}>Capa do Curso</Label>
                <span className="text-[9px] text-muted-foreground/30">400×225 px · 16:9</span>
              </div>
              <div className="rounded-lg border border-dashed border-border/15 bg-background/20 overflow-hidden">
                {coverUrl ? (
                  <div className="relative group">
                    <img src={coverUrl} alt="Capa" className="w-full aspect-video object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl("")}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center gap-1 text-muted-foreground/15">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[8px] uppercase tracking-widest">Sem imagem</span>
                  </div>
                )}
              </div>
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="URL da imagem de capa..."
                className="h-8 bg-background/50 border-border/15 rounded-lg text-[11px]"
              />
            </div>

            <div className="border-t border-border/6" />

            {/* Banner */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label className={labelClass}>Banner Principal</Label>
                <span className="text-[9px] text-muted-foreground/30">1920×600 px</span>
              </div>
              <div className="rounded-lg border border-dashed border-border/15 bg-background/20 overflow-hidden">
                {bannerUrl ? (
                  <div className="relative group">
                    <img src={bannerUrl} alt="Banner" className="w-full object-cover" style={{ aspectRatio: "1920/600" }} />
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/15 py-5">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[8px] uppercase tracking-widest">Sem banner</span>
                  </div>
                )}
              </div>
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="URL do banner..."
                className="h-8 bg-background/50 border-border/15 rounded-lg text-[11px]"
              />
            </div>
          </CardSection>
        </div>
      </div>

      {/* Submit */}
      {!hideSubmitButton && (
        <div className="flex justify-end pt-4 mt-4 border-t border-border/8">
          <Button type="submit" size="sm" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            {initialValues ? "Salvar Alterações" : "Criar Curso"}
          </Button>
        </div>
      )}
    </form>
  );
});
