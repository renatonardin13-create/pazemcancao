import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Disc3,
  Gift,
  Headphones,
  ListMusic,
  Play,
  Search,
} from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { SafeBoundary } from "@/components/SafeBoundary";
import { useArea } from "@/providers/AreaProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/TrackCard";
import { HighlightTrackCard } from "@/components/HighlightTrackCard";
import { UpcomingReleaseBlock } from "@/components/UpcomingReleaseBlock";
import { InspirationalBlock } from "@/components/InspirationalBlock";
import { POSTER_GRID } from "@/lib/card-grid";
import { CardScopeProvider } from "@/hooks/use-cards-config";
import { PosterShelfRow, PosterShelfItem } from "@/components/PosterShelfRow";
import { listAllTracks } from "@/lib/tracks.functions";
import { listPlaylistsWithCounts, getPlaylistWithTracks } from "@/lib/playlists.functions";
import { checkBuyerAccess } from "@/lib/access.functions";
import { logDownload } from "@/lib/analytics.functions";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";

// Normalize a category name: remove emojis/symbols, lowercase, trim, collapse spaces.
// This makes "⭐ Destaques (Top 10)" → "destaques (top 10)" so categorias com emoji
// no banco continuam visíveis na UI.
function normalizeCategorySlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const Route = createFileRoute("/_authenticated/musicas")({
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => ({
    categoria: typeof search.categoria === "string" ? search.categoria : undefined,
  }),
  component: MusicLibraryPageWithScope,
  errorComponent: MusicLibraryError,
  pendingComponent: MusicLibraryPending,
});

function MusicLibraryPageWithScope() {
  return (
    <CardScopeProvider scope="musicas">
      <MusicLibraryPage />
    </CardScopeProvider>
  );
}

function MusicLibraryPending() {
  return (
    <ModuleGuard moduleKey="louvores">
      <StudentLayout>
        <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center rounded-3xl border border-border/30 bg-card/20 px-6 py-16 text-sm text-muted-foreground/70">
            Carregando músicas...
          </div>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}

function MusicLibraryError({ error }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <ModuleGuard moduleKey="louvores">
      <StudentLayout>
        <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-3xl border border-border/30 bg-card/20 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Erro ao carregar músicas</h1>
              <p className="mt-2 text-sm text-muted-foreground/70">{error.message || "Tente novamente."}</p>
            </div>
            <Button variant="premiumOutline" size="sm" onClick={() => router.invalidate()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}

function getStoragePublicUrl(storagePath: string | null | undefined) {
  if (!storagePath) return "";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${storagePath}`;
}

function dbTrackToPlayerTrack(track: any): Track {
  const audioUrl = getStoragePublicUrl(track?.storage_path);
  return {
    id: String(track?.id ?? ""),
    title: track?.title || "Música sem título",
    duration: track?.duration || "0:00",
    category: track?.category || "Sem categoria",
    audioUrl,
    downloadUrl: track?.download_url || audioUrl,
    description: track?.description || "",
    coverUrl: track?.cover_url || undefined,
    // Propaga flags de bônus/liberação para o TrackCard exibir os badges
    // ("Bônus", "Em breve") e travar a reprodução quando aplicável.
    isBonus: Boolean(track?.is_bonus),
    bonusReleaseDate: track?.bonus_release_date ?? null,
    isLocked: track?.is_active === false,
  };
}

function safeSlug(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function MusicLibraryState({
  title = "Músicas",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <ModuleGuard moduleKey="louvores">
      <StudentLayout>
        <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-3xl border border-border/30 bg-card/20 px-6 py-16 text-center">
            <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground/70">{message}</p>
            {onRetry ? (
              <Button variant="premiumOutline" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            ) : null}
          </div>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}

function MusicLibraryPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const { currentArea } = useArea();

  const { currentTrack, playing, toggle, setQueue } = usePlayer();

  // Catálogo Louvores: lista TODAS as músicas (inclusive bônus com liberação
  // programada / inativas) para exibir badge "Em breve" — a reprodução é
  // bloqueada no TrackCard quando a faixa não está liberada.
  const { data: tracksData, isLoading: tracksLoading, isError: tracksFailed } = useQuery({
    queryKey: ["music-library-tracks", currentArea?.id],
    queryFn: () => listAllTracks({ data: { areaId: currentArea?.id } }),
    staleTime: 30_000,
    retry: 2,
  });

  const categoriesLoading = false;
  const categoriesFailed = false;

  const { data: playlistsData, isError: playlistsFailed } = useQuery({
    queryKey: ["music-library-playlists", currentArea?.id],
    queryFn: () => listPlaylistsWithCounts({ data: { areaId: currentArea?.id } }),
    staleTime: 60_000,
  });

  const { data: playlistTracksData, isLoading: playlistLoading } = useQuery({
    queryKey: ["music-library-playlist", activePlaylistId],
    queryFn: () => getPlaylistWithTracks({ data: { playlistId: activePlaylistId! } }),
    enabled: Boolean(activePlaylistId),
    staleTime: 30_000,
  });

  const { data: accessData } = useQuery({
    queryKey: ["music-library-access"],
    queryFn: () => checkBuyerAccess(),
    staleTime: 5 * 60_000,
  });

  const tracks = Array.isArray(tracksData?.tracks) ? tracksData.tracks : [];
  const playlists = Array.isArray(playlistsData?.playlists) ? playlistsData.playlists : [];
  const shouldShowPlaylistsSection = playlists.length > 0;

  // Categorias dinâmicas: derivadas das próprias faixas, sem whitelist.
  // Slug é normalizado (sem emojis) para que filtros funcionem mesmo
  // quando o nome no banco contém ícones.
  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; slug: string }>();
    for (const t of tracks as any[]) {
      const name = String(t?.category || "").trim();
      const slug = normalizeCategorySlug(name);
      if (!slug) continue;
      if (!seen.has(slug)) {
        seen.set(slug, { id: slug, name, slug });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [tracks]);
  const playlistTracks = Array.isArray(playlistTracksData?.tracks) ? playlistTracksData.tracks : [];

  const rawCategoryFilter = typeof search?.categoria === "string" ? search.categoria : "";
  const requestedSlug = normalizeCategorySlug(rawCategoryFilter);
  const isRequestedValid = categories.some((c) => c.slug === requestedSlug);
  const categoryFilter = isRequestedValid ? requestedSlug : "";

  const isLocked = accessData?.trialExpired === true || accessData?.isBlocked === true;
  const canDownload = accessData?.canDownload !== false;


  const filteredTracks = useMemo(() => {
    return tracks.filter((track: any) => {
      const matchesCategory =
        !categoryFilter || normalizeCategorySlug(track?.category) === categoryFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        String(track?.title || "").toLowerCase().includes(term) ||
        String(track?.description || "").toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [tracks, categoryFilter, searchTerm]);

  // Bloco de bônus DENTRO da categoria: respeita o filtro de categoria/busca
  // e separa o que é bônus do catálogo regular para que apareçam em destaque
  // sem se confundir com os louvores normais. Quando não há categoria ativa,
  // mantemos a lista única (catálogo geral exibe tudo no grid principal).
  const regularTracks = useMemo(
    () => (categoryFilter ? filteredTracks.filter((t: any) => !t?.is_bonus) : filteredTracks),
    [filteredTracks, categoryFilter],
  );
  const bonusTracks = useMemo(
    () => (categoryFilter ? filteredTracks.filter((t: any) => Boolean(t?.is_bonus)) : []),
    [filteredTracks, categoryFilter],
  );

  const handleTrackPlay = (track: any, trackList: any[]) => {
    const playerTracks = trackList.map(dbTrackToPlayerTrack).filter((item) => item.audioUrl);
    const selectedTrack = dbTrackToPlayerTrack(track);

    if (!selectedTrack.audioUrl) return;

    const selectedIndex = playerTracks.findIndex((item) => item.id === selectedTrack.id);

    if (selectedIndex >= 0) {
      setQueue(playerTracks, selectedIndex);
      return;
    }

    toggle(selectedTrack);
  };

  const handlePlaylistPlay = () => {
    if (!playlistTracks.length) return;
    handleTrackPlay(playlistTracks[0], playlistTracks);
  };

  const handlePlayAll = () => {
    if (!filteredTracks.length) return;
    handleTrackPlay(filteredTracks[0], filteredTracks);
  };

  const handleOpenAllTracks = () => {
    setShowAllTracks(true);
    window.setTimeout(() => {
      document.getElementById("all-tracks-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const activeCategoryName = useMemo(() => {
    if (!categoryFilter) return "";
    const found = categories.find((c: any) => safeSlug(c?.slug || c?.name) === safeSlug(categoryFilter));
    return found?.name || "";
  }, [categories, categoryFilter]);

  const handleDownload = (track: any) => {
    if (isLocked || !canDownload) return;

    const playerTrack = dbTrackToPlayerTrack(track);
    if (!playerTrack.downloadUrl) return;

    logDownload({ data: { trackId: String(track.id) } }).catch(() => undefined);

    const link = document.createElement("a");
    link.href = playerTrack.downloadUrl;
    link.download = `${playerTrack.title}.mp3`;
    link.click();
  };

  if (tracksLoading || categoriesLoading) {
    return <MusicLibraryState message="Carregando músicas..." />;
  }

  if (tracksFailed || categoriesFailed || playlistsFailed) {
    return (
      <MusicLibraryState
        message="Erro ao carregar músicas."
        onRetry={() => router.invalidate()}
      />
    );
  }

  if (tracks.length === 0) {
    return <MusicLibraryState message="Nenhuma música encontrada" />;
  }


  return (
    <ModuleGuard moduleKey="louvores">
      <StudentLayout>
        <div className="min-h-screen bg-background">
          <SafeBoundary fallbackTitle="Erro ao carregar músicas">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/60 via-card/30 to-background/60 px-5 py-4 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)] sm:px-6 sm:py-5">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-4">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Headphones className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">
                      {activeCategoryName ? "Categoria" : "Visão geral"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {activeCategoryName || "Louvores"}
                    </h1>
                    <p className="text-xs text-muted-foreground/75 sm:text-sm">
                      {activeCategoryName
                        ? `Selecionados da categoria ${activeCategoryName}.`
                        : "Todos os louvores disponíveis."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar músicas..."
                      className="h-10 rounded-xl border-border/50 bg-background/60 pl-10 text-sm shadow-inner backdrop-blur-md focus-visible:ring-primary/40"
                    />
                  </div>
                  <Button
                    variant="premium"
                    size="sm"
                    onClick={handlePlayAll}
                    disabled={!filteredTracks.length}
                    className="h-10 gap-2 px-4"
                  >
                    <Play className="h-4 w-4" />
                    {activeCategoryName ? "Tocar categoria" : "Tocar todos"}
                  </Button>
                </div>
              </div>
            </section>

            <InspirationalBlock />

            <section>
              <div className="mb-4 flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-primary/70" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Categorias</h2>
              </div>


              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/musicas"
                  search={{}}
                  className={`rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                    !categoryFilter
                      ? "border-primary/50 bg-primary/15 text-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  Todas
                </Link>
                {categories.map((category) => {
                  const slug = safeSlug(category.slug || category.name);
                  const active = slug === categoryFilter;
                  return (
                    <Link
                      key={category.id}
                      to="/musicas"
                      search={{ categoria: slug }}
                      className={`rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                        active
                          ? "border-primary/50 bg-primary/15 text-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
                          : "border-border/40 bg-card/30 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                  {activeCategoryName || "Todas as músicas"}
                </h2>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  {filteredTracks.length} {filteredTracks.length === 1 ? "música" : "músicas"}
                </span>
              </div>

              {tracksLoading ? (
                <div className="rounded-2xl border border-dashed border-border/40 px-4 py-10 text-center text-sm text-muted-foreground/70">
                  Carregando músicas...
                </div>
              ) : tracksFailed ? (
                <div className="rounded-2xl border border-dashed border-border/40 px-4 py-10 text-center text-sm text-muted-foreground/70">
                  Erro ao carregar músicas
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/40 px-4 py-10 text-center text-sm text-muted-foreground/70">
                  Nenhuma música encontrada
                </div>
              ) : categoryFilter ? (
                // Categoria selecionada → carrossel horizontal com setas.
                // Mostramos APENAS os louvores regulares aqui; os bônus dessa
                // mesma categoria aparecem logo abaixo num bloco em destaque.
                regularTracks.length > 0 ? (
                  <PosterShelfRow>
                    {(() => {
                      const list = regularTracks.map(dbTrackToPlayerTrack);
                      return list.map((pt, idx) => (
                        <PosterShelfItem key={pt.id}>
                          <TrackCard track={pt} index={idx} queue={list} />
                        </PosterShelfItem>
                      ));
                    })()}
                  </PosterShelfRow>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/40 px-4 py-8 text-center text-sm text-muted-foreground/70">
                    Esta categoria ainda não possui louvores regulares.
                  </div>
                )
              ) : (
                // Visão geral → uma prateleira horizontal por categoria
                // (Destaques, Soldado Ferido, Ansiedade, Cura da Alma, etc).
                // Substitui o grid vertical infinito por carrosséis premium.
                <div className="space-y-10">
                  {(() => {
                    const term = searchTerm.trim().toLowerCase();
                    const groups: Array<{ key: string; name: string; slug: string; items: any[] }> = [];

                    // Destaques: top por sort_order entre todas as faixas filtradas
                    const highlights = [...filteredTracks]
                      .sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
                      .slice(0, 8);
                    if (highlights.length) {
                      groups.push({ key: "__destaques", name: "Destaques", slug: "", items: highlights });
                    }
                    // Visão geral / Todos: exibimos APENAS Destaques + bloco
                    // "Liberação em 7 dias". As demais categorias ficam acessíveis
                    // via chips no topo (não duplicamos como prateleiras aqui).

                    if (!groups.length) {
                      return (
                        <div className="rounded-2xl border border-dashed border-border/40 px-4 py-10 text-center text-sm text-muted-foreground/70">
                          {term ? "Nenhuma música encontrada" : "Nenhum louvor disponível"}
                        </div>
                      );
                    }

                    const highlightIds = new Set(
                      (groups.find((g) => g.key === "__destaques")?.items || []).map((t: any) => String(t?.id)),
                    );
                    return groups.map((group) => (
                      <div key={group.key} className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                          <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {group.name}
                          </h3>
                          {group.slug ? (
                            <Link
                              to="/musicas"
                              search={{ categoria: group.slug }}
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 hover:text-primary"
                            >
                              Ver tudo
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={handleOpenAllTracks}
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
                            >
                              Ver todos
                            </button>
                          )}
                        </div>
                        <PosterShelfRow>
                          {(() => {
                            const list = group.items.map(dbTrackToPlayerTrack);
                            return list.map((pt, idx) => (
                              <PosterShelfItem key={`${group.key}-${pt.id}`}>
                                {group.key === "__destaques" ? (
                                  <HighlightTrackCard track={pt} queue={list} />
                                ) : (
                                  <TrackCard track={pt} index={idx} queue={list} />
                                )}
                              </PosterShelfItem>
                            ));
                          })()}
                        </PosterShelfRow>
                        {group.key === "__destaques" && (
                          <div className="pt-4">
                            <UpcomingReleaseBlock
                              tracks={tracks}
                              excludeIds={Array.from(highlightIds)}
                            />
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}

              {!categoryFilter && showAllTracks && (
                <section id="all-tracks-section" className="space-y-4 scroll-mt-20">
                  <div className="flex items-end justify-between gap-3">
                    <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                      Todos os louvores
                    </h2>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      {filteredTracks.length} {filteredTracks.length === 1 ? "música" : "músicas"}
                    </span>
                  </div>

                  <div className={POSTER_GRID}>
                    {(() => {
                      const list = filteredTracks.map(dbTrackToPlayerTrack);
                      return list.map((pt, idx) => (
                        <TrackCard key={`all-${pt.id}`} track={pt} index={idx} queue={list} />
                      ));
                    })()}
                  </div>
                </section>
              )}
            </section>

            {/* Bônus DENTRO da categoria — bloco visualmente distinto, com
                destaque dourado. Respeita data de liberação porque o próprio
                TrackCard já exibe o badge "Em breve" quando aplicável. */}
            {categoryFilter && bonusTracks.length > 0 && (
              <section className="space-y-4">
                <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] via-background to-background p-5 sm:p-6">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-gold/80" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold/80">
                        Bônus de {activeCategoryName}
                      </h2>
                    </div>
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold/90">
                      {bonusTracks.length} {bonusTracks.length === 1 ? "bônus" : "bônus"}
                    </span>
                  </div>
                  <PosterShelfRow>
                    {(() => {
                      const list = bonusTracks.map(dbTrackToPlayerTrack);
                      return list.map((pt, idx) => (
                        <PosterShelfItem key={`bonus-${pt.id}`}>
                          <TrackCard track={pt} index={idx} queue={list} />
                        </PosterShelfItem>
                      ));
                    })()}
                  </PosterShelfRow>
                </div>
              </section>
            )}

            {!categoryFilter && null}

            {shouldShowPlaylistsSection && (
            <section id="playlists-section" className="space-y-4 scroll-mt-20">
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Disc3 className="h-4 w-4 text-primary/70" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                    Playlists <span className="text-muted-foreground/50 normal-case tracking-normal">(Playbacks)</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePlaylistId(playlists[0]?.id ?? null)}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
                >
                  Ver todas
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {playlists.map((playlist: any) => {
                  const isActive = playlist.id === activePlaylistId;
                  return (
                    <button
                      key={playlist.id}
                      type="button"
                      onClick={() => setActivePlaylistId(isActive ? null : playlist.id)}
                      className={`group relative flex h-32 items-center gap-4 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        isActive
                          ? "border-gold/50 bg-gradient-to-r from-gold/15 via-card/40 to-background shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)]"
                          : "border-gold/20 bg-gradient-to-r from-card/60 via-card/30 to-background/60 hover:border-gold/40"
                      }`}
                    >
                      <div className="relative h-full w-28 shrink-0 overflow-hidden rounded-xl">
                        {playlist?.cover_url ? (
                          <img
                            src={playlist.cover_url}
                            alt={playlist?.name || "Playlist"}
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5">
                            <Disc3 className="h-9 w-9 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                        <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-foreground">
                          {playlist?.name || "Playlist"}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                          <ListMusic className="h-3 w-3 text-gold/70" />
                          <span>{playlist?.track_count || 0} faixas</span>
                        </div>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition group-hover:bg-gold/20">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePlaylistId ? (
                <div className="mt-2 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{playlistTracksData?.playlist?.name || "Playlist selecionada"}</h3>
                      <p className="text-sm text-muted-foreground/70">
                        {playlistLoading ? "Carregando músicas da playlist..." : `${playlistTracks.length} música(s) nesta playlist`}
                      </p>
                    </div>
                    <Button variant="premium" size="sm" onClick={handlePlaylistPlay} disabled={!playlistTracks.length || playlistLoading}>
                      <Play className="h-3.5 w-3.5" />
                      Ouvir playlist
                    </Button>
                  </div>
                </div>
              ) : null}
            </section>
            )}

            {!categoryFilter && shouldShowPlaylistsSection && (
              <section>
                <div className="flex flex-col items-start gap-4 rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/[0.06] via-background to-background p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                      <ListMusic className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                        Novos playbacks toda semana
                      </h3>
                      <p className="text-sm text-muted-foreground/75">
                        Atualizamos nossas playlists com novos playbacks para te ajudar a adorar com excelência.
                      </p>
                    </div>
                  </div>
                  <Button variant="premium" size="lg" className="gap-2">
                    Explorar novas playlists
                  </Button>
                </div>
              </section>
            )}
          </div>
          </SafeBoundary>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
