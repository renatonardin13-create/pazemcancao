import { useState, useEffect } from "react";
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
import { Video, BookText, Save, Loader2 } from "lucide-react";
import { ImageFieldHint } from "@/components/ImageFieldHint";

interface CourseFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

export function CourseForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: CourseFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selector */}
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Modalidade
        </Label>
        <div className="flex gap-3">
          {[
            { value: "video", label: "Vídeo", icon: Video, color: "text-gold" },
            {
              value: "ebook",
              label: "eBook",
              icon: BookText,
              color: "text-blue-400",
            },
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

      {/* Images */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coverUrl">URL da Imagem de Capa</Label>
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
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Capa"
              className="mt-2 h-24 w-auto rounded-lg object-cover border border-border/15"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bannerUrl">URL do Banner</Label>
          <Input
            id="bannerUrl"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="bg-card/10 border-border/15"
          />
          <ImageFieldHint
            ratio="3.84:1"
            recommendedSize="1920x500"
            autoCrop
            previewUrl={bannerUrl || null}
          />
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner"
              className="mt-2 h-24 w-auto rounded-lg object-cover border border-border/15"
            />
          )}
        </div>
      </div>

      {/* Category & Price */}
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
      </div>

      {/* Status & Launch date */}
      <div className="grid sm:grid-cols-2 gap-4">
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

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-border/15">
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {initialValues ? "Salvar Alterações" : "Criar Curso"}
        </Button>
      </div>
    </form>
  );
}
