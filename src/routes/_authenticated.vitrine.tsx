import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import { Loader2, Settings, ExternalLink } from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuth } from "@/hooks/use-auth";
import {
  getVitrineAdminOverview,
  updateHeroGlobal,
  updateHeroBannerVisual,
} from "@/lib/admin-vitrine-hero.functions";
import { createHeroBanner } from "@/lib/admin-hero-banners.functions";
import { VitrineStats } from "@/components/admin-vitrine/VitrineStats";
import { VitrineTabs, type VitrineTabKey } from "@/components/admin-vitrine/VitrineTabs";
import {
  HeroBannerSettings,
  type HeroSettingsValue,
  type SaveStatus,
} from "@/components/admin-vitrine/HeroBannerSettings";
import { VitrineLivePreview } from "@/components/admin-vitrine/VitrineLivePreview";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrineAdminPage,
});

function VitrineAdminPage() {
  const { isAdmin, adminLoading } = useAuth();

  if (adminLoading) {
    return (
      <StudentLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      </StudentLayout>
    );
  }

  if (!isAdmin) {
    return (
      <StudentLayout>
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este painel é exclusivo para administradores.
          </p>
          <Link
            to="/home"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium"
          >
            Ir para a vitrine
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return <Inner />;
}

function Inner() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<VitrineTabKey>("hero");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vitrine-overview"],
    queryFn: () => getVitrineAdminOverview(),
  });

  const banner = (data as any)?.primaryBanner || null;
  const heroGlobal = (data as any)?.heroGlobal || {
    enabled: true,
    default_display_mode: "auto",
    default_container_ratio: "auto",
  };

  const initial: HeroSettingsValue = useMemo(
    () => ({
      enabled: !!heroGlobal.enabled,
      image_url: banner?.image_url || "",
      image_width: banner?.image_width ?? null,
      image_height: banner?.image_height ?? null,
      display_mode: (banner?.display_mode || heroGlobal.default_display_mode || "auto") as any,
      container_ratio: (banner?.container_ratio || heroGlobal.default_container_ratio || "auto") as any,
    }),
    [banner, heroGlobal],
  );

  const [hero, setHero] = useState<HeroSettingsValue>(initial);
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current && data) {
      setHero(initial);
      hydrated.current = true;
    }
  }, [data, initial]);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errMsg, setErrMsg] = useState<string>();

  const heroGlobalMut = useMutation({
    mutationFn: (v: { enabled: boolean; default_display_mode: string; default_container_ratio: string }) =>
      updateHeroGlobal({ data: v }),
    onError: (e: any) => {
      setStatus("error");
      setErrMsg(e?.message);
      toastError(e);
    },
  });

  const visualMut = useMutation({
    mutationFn: (v: any) => updateHeroBannerVisual({ data: v }),
    onError: (e: any) => {
      setStatus("error");
      setErrMsg(e?.message);
      toastError(e);
    },
  });

  const createMut = useMutation({
    mutationFn: (v: any) => createHeroBanner({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vitrine-overview"] });
      qc.invalidateQueries({ queryKey: ["admin-hero-banners"] });
    },
    onError: (e: any) => toastError(e),
  });

  // Autosave debounce
  const debounceRef = useRef<number | null>(null);
  const lastSaved = useRef<string>(JSON.stringify(initial));

  useEffect(() => {
    if (!hydrated.current) return;
    const snap = JSON.stringify(hero);
    if (snap === lastSaved.current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setStatus("saving");
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Salva config global (enabled + defaults)
        await heroGlobalMut.mutateAsync({
          enabled: hero.enabled,
          default_display_mode: hero.display_mode,
          default_container_ratio: hero.container_ratio,
        });

        // Salva campos visuais do banner; cria banner se não existir e houver imagem
        if (banner?.id) {
          await visualMut.mutateAsync({
            id: banner.id,
            image_url: hero.image_url,
            image_width: hero.image_width,
            image_height: hero.image_height,
            display_mode: hero.display_mode,
            container_ratio: hero.container_ratio,
          });
        } else if (hero.image_url) {
          await createMut.mutateAsync({
            image_url: hero.image_url,
            image_width: hero.image_width,
            image_height: hero.image_height,
            display_mode: hero.display_mode,
            container_ratio: hero.container_ratio,
            is_active: true,
            sort_order: 0,
          });
        }

        lastSaved.current = snap;
        setStatus("saved");
        qc.invalidateQueries({ queryKey: ["admin-vitrine-overview"] });
        qc.invalidateQueries({ queryKey: ["student-shelves"] });
        qc.invalidateQueries({ queryKey: ["student-shelves-preview"] });
        window.setTimeout(() => setStatus("idle"), 1800);
      } catch (e: any) {
        setStatus("error");
        setErrMsg(e?.message || "Falha ao salvar.");
      }
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero]);

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
              <Settings className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/90">
                Configuração da Vitrine
              </h1>
              <p className="text-sm text-muted-foreground/70">
                Configure banner, cards e prateleiras da área do aluno.
              </p>
            </div>
          </div>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs font-medium text-foreground/80 hover:border-gold/40 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver vitrine do aluno
          </Link>
        </div>

        {/* Stats */}
        <VitrineStats
          coursesPublished={(data as any)?.coursesPublished ?? 0}
          shelvesActive={(data as any)?.shelvesActive ?? 0}
          heroEnabled={hero.enabled}
        />

        {/* Tabs */}
        <VitrineTabs value={tab} onChange={setTab} />

        {/* 2 colunas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <div className="min-w-0 space-y-5">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/30 p-8 text-sm text-muted-foreground/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações…
              </div>
            ) : tab === "hero" ? (
              <HeroBannerSettings
                value={hero}
                onChange={setHero}
                status={status}
                errorMessage={errMsg}
              />
            ) : (
              <ComingSoon
                title={
                  tab === "cards"
                    ? "Configuração de Cards"
                    : tab === "promo"
                    ? "Banners Promocionais"
                    : "Prateleiras"
                }
              />
            )}
          </div>

          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <VitrineLivePreview hero={hero} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/40 bg-card/20 p-10 text-center">
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Em breve neste painel. As configurações atuais continuam disponíveis no admin.
      </p>
    </div>
  );
}
