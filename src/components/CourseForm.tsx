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
import { Video, FileText, Save, Loader2, ImageIcon, File, Link as LinkIcon } from "lucide-react";
import { ImageUploadField } from "@/components/ImageUploadField";

interface CourseFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  hideSubmitButton?: boolean;
}

const inputClass = "h-11 bg-background/50 border-border/20 focus:border-gold/40 rounded-lg text-sm";
const labelClass = "text-sm font-semibold text-foreground/80";

const COURSE_TYPE_OPTIONS = [
  { value: "video", label: "Vídeo", icon: Video },
  { value: "ebook", label: "PDF", icon: FileText },
  { value: "file", label: "Arquivo", icon: File },
  { value: "link", label: "Link", icon: LinkIcon },
] as const;

const normalizeCourseType = (value?: string) => (value === "video" ? "video" : "ebook");

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/12 bg-card shadow-md shadow-black/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/20 bg-card/90">
        <h3 className="text-sm font-bold text-foreground/90 tracking-wide">{title}</h3>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
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
  // areaId state removed
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [courseType, setCourseType] = useState("video");
  const [launchDate, setLaunchDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  // areas query removed

  // areas state removed

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
      // setAreaId removed
      setPromotionalPrice(initialValues.promotional_price != null ? String(initialValues.promotional_price) : "");
      setStatus(initialValues.status || "draft");
      setCourseType(normalizeCourseType(initialValues.course_type));
      setLaunchDate(initialValues.launch_date || "");
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "O título do curso é obrigatório";
    else if (title.trim().length < 3) newErrors.title = "O título deve ter pelo menos 3 caracteres";
    if (promotionalPrice.trim() && parseFloat(promotionalPrice) >= parseFloat(price))
      newErrors.promotionalPrice = "Preço promocional deve ser menor que o preço normal";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true });
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.getElementById(Object.keys(newErrors)[0] === "promotionalPrice" ? "promotionalPrice" : "title");
      firstErrorField?.focus();
      return;
    }

    onSubmit({
      title: title.trim(),
      short_description: shortDesc.trim() || null,
      full_description: fullDesc.trim() || null,
      cover_image_url: coverUrl.trim() || null,
      banner_image_url: bannerUrl.trim() || null,
      category_id: categoryId || null,
      // area_id removed
      price: parseFloat(price) || 0,
      promotional_price: promotionalPrice.trim() ? parseFloat(promotionalPrice) : null,
      status,
      course_type: normalizeCourseType(courseType),
      launch_date: launchDate || null,
    });
  };

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-5">

        {/* ===== LEFT: Informações + Configurações ===== */}
        <div className="space-y-5 order-1 lg:col-start-1">
          <CardSection title="Informações do Curso">
            <div className="space-y-1.5">
              <Label htmlFor="title" className={labelClass}>
                Título do Curso <span className="text-gold">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (touched.title) setErrors((prev) => { const n = { ...prev }; delete n.title; return n; }); }}
                onBlur={() => { setTouched((p) => ({ ...p, title: true })); if (!title.trim()) setErrors((p) => ({ ...p, title: "O título do curso é obrigatório" })); }}
                placeholder="Ex: Curso Completo de Marketing Digital"
                className={`${inputClass} ${errors.title ? "border-destructive" : ""}`}
              />
              {errors.title && <p className="text-[0.8rem] font-medium text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label htmlFor="fullDesc" className={labelClass}>Descrição Completa</Label>
              <Textarea
                id="fullDesc"
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Descrição detalhada do curso (aparece na página do curso)"
                rows={4}
                className="bg-background/50 border-border/20 focus:border-gold/40 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Selecione uma categoria" />
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

            {/* area selection removed */}
          </CardSection>

          <CardSection title="Configurações">
            <div className="space-y-1">
              <Label className={labelClass}>Tipo de Conteúdo</Label>
              <div className="flex gap-2">
                {COURSE_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCourseType(type.value)}
                    className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border text-xs font-semibold transition-all min-w-[72px] ${
                      courseType === type.value
                        ? "border-gold/40 bg-gold text-black shadow-lg shadow-gold/20"
                        : "border-border/30 bg-background/30 text-muted-foreground/50 hover:border-border/30 hover:text-muted-foreground/70"
                    }`}
                  >
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price" className={labelClass}>Preço Normal (R$)</Label>
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
                <Label htmlFor="promotionalPrice" className={labelClass}>Preço Promocional (R$)</Label>
                <Input
                  id="promotionalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={promotionalPrice}
                  onChange={(e) => { setPromotionalPrice(e.target.value); if (errors.promotionalPrice) setErrors((p) => { const n = { ...p }; delete n.promotionalPrice; return n; }); }}
                  placeholder="Opcional"
                  className={`${inputClass} ${errors.promotionalPrice ? "border-destructive" : ""}`}
                />
                {errors.promotionalPrice && <p className="text-[0.8rem] font-medium text-destructive">{errors.promotionalPrice}</p>}
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
            <div className="px-4 py-3 border-b border-border/20 bg-card/90">
              <h3 className="text-xs font-bold text-foreground/80">Preview</h3>
            </div>
            <div className="p-3">
              <div className="rounded-lg overflow-hidden border border-border/20 bg-background/20">
                <div className="aspect-[16/9] bg-muted/5 flex items-center justify-center overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-bold text-foreground/90 leading-snug line-clamp-2">
                    {title || "Título do Curso"}
                  </p>
                  <p className="text-xs text-muted-foreground/50 line-clamp-3 leading-relaxed">
                    {shortDesc || "Descrição do curso aparecerá aqui"}
                  </p>
                  {(parseFloat(price) > 0 || promotionalPrice) && (
                    <div className="flex items-center gap-2 pt-1">
                      {promotionalPrice && parseFloat(promotionalPrice) > 0 ? (
                        <>
                          <span className="text-xs text-muted-foreground/70 line-through">
                            R$ {parseFloat(price).toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-gold">
                            R$ {parseFloat(promotionalPrice).toFixed(2)}
                          </span>
                        </>
                      ) : parseFloat(price) > 0 ? (
                        <span className="text-sm font-bold text-foreground/70">
                          R$ {parseFloat(price).toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== LEFT: Imagens ===== */}
        <div className="order-3 lg:col-start-1">
          <CardSection title="Imagens">
            <ImageUploadField
              label="Capa do Curso"
              hint="Imagem exibida na listagem de cursos"
              value={coverUrl}
              onChange={setCoverUrl}
              folder="courses/covers"
              aspectClass="aspect-video"
              expectedRatio="16:9"
              recommendedSize="400x225"
            />

            <div className="border-t border-border/6" />

            <ImageUploadField
              label="Banner Principal"
              hint="Banner grande exibido na vitrine"
              value={bannerUrl}
              onChange={setBannerUrl}
              folder="courses/banners"
              aspectRatio="1920/600"
              aspectClass=""
              uploadLabel="Clique para fazer upload do banner"
              expectedRatio="3:1"
              recommendedSize="1920x600"
            />
          </CardSection>
        </div>
      </div>

      {/* Submit */}
      {!hideSubmitButton && (
        <div className="flex justify-end pt-4 mt-4 border-t border-border/20">
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
