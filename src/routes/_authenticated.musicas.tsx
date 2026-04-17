import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Download,
  Headphones,
  ListMusic,
  Music,
  Pause,
  Play,
  Search,
} from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { SafeBoundary } from "@/components/SafeBoundary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/TrackCard";
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
  component: MusicLibraryPage,
  errorComponent: MusicLibraryError,
  pendingComponent: MusicLibraryPending,
});

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

  const { currentTrack, playing, toggle, setQueue } = usePlayer();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  // Catálogo Louvores: lista TODAS as músicas (inclusive bônus com liberação
  // programada / inativas) para exibir badge "Em breve" — a reprodução é
  // bloqueada no TrackCard quando a faixa não está liberada.
  const { data: tracksData, isLoading: tracksLoading, isError: tracksFailed } = useQuery({
    queryKey: ["music-library-tracks"],
    queryFn: () => listAllTracks(),
    staleTime: 30_000,
    retry: 2,
  });

  const categoriesLoading = false;
  const categoriesFailed = false;

  const { data: playlistsData, isError: playlistsFailed } = useQuery({
    queryKey: ["music-library-playlists"],
    queryFn: () => listPlaylistsWithCounts(),
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 via-card/30 to-background/60 p-6 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)] sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Headphones className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.32em]">
                      {activeCategoryName ? "Categoria" : "Visão geral"}
                    </span>
                  </div>
                  <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {activeCategoryName || "Louvores"}
                  </h1>
                  <p className="max-w-xl text-sm text-muted-foreground/80 sm:text-base">
                    {activeCategoryName
                      ? `Louvores selecionados da categoria ${activeCategoryName}.`
                      : "Todos os louvores disponíveis."}
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="premium"
                      size="lg"
                      onClick={handlePlayAll}
                      disabled={!filteredTracks.length}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {activeCategoryName ? "Tocar todos da categoria" : "Tocar todos"}
                    </Button>
                  </div>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar músicas..."
                    className="h-12 rounded-2xl border-border/50 bg-background/60 pl-11 text-sm shadow-inner backdrop-blur-md focus-visible:ring-primary/40"
                  />
                </div>
              </div>
            </section>

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



            <section className="space-y-6">
              <div className="flex items-end justify-between gap-3 border-b border-border/30 pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Coleção</p>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {activeCategoryName || "Todas as músicas"}
                  </h2>
                  <p className="text-sm text-muted-foreground/70">
                    {activeCategoryName ? `Somente louvores de ${activeCategoryName}` : "Sua biblioteca completa de louvores"}
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
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
              ) : (() => {
                const playerTracks = filteredTracks.map(dbTrackToPlayerTrack);

                const cards = playerTracks.map((pt, idx) => (
                  <div
                    key={pt.id}
                    className={
                      categoryFilter
                        ? "snap-start shrink-0 w-[46vw] sm:w-[200px] md:w-[210px] lg:w-[220px] xl:w-[230px]"
                        : ""
                    }
                  >
                    <TrackCard track={pt} index={idx} />
                  </div>
                ));

                if (categoryFilter) {
                  return (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => scrollCarousel("prev")}
                        aria-label="Anterior"
                        className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 -translate-x-2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:flex"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel("next")}
                        aria-label="Próximo"
                        className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 translate-x-2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:flex"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div
                        ref={carouselRef}
                        className="flex gap-4 sm:gap-5 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
                      >
                        {cards}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {cards}
                  </div>
                );
              })()}
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Disc3 className="h-4 w-4 text-primary/70" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Playlists</h2>
              </div>

              {playlists.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground/70">
                  Nenhuma playlist disponível.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {playlists.map((playlist: any) => {
                    const isActive = playlist.id === activePlaylistId;
                    return (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => setActivePlaylistId(isActive ? null : playlist.id)}
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                          isActive
                            ? "border-primary/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)]"
                            : "border-border/40 bg-gradient-to-br from-card/60 to-card/20 hover:border-primary/30 hover:shadow-lg"
                        }`}
                      >
                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
                            <Disc3 className="h-6 w-6 text-primary" />
                          </div>
                          <span className="rounded-full border border-border/40 bg-background/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 backdrop-blur">
                            {playlist?.track_count || 0} faixas
                          </span>
                        </div>
                        <h3 className="relative mt-4 line-clamp-1 text-base font-bold tracking-tight text-foreground">
                          {playlist?.name || "Playlist"}
                        </h3>
                        {playlist?.description ? (
                          <p className="relative mt-1 line-clamp-2 text-xs text-muted-foreground/70">{playlist.description}</p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {activePlaylistId ? (
                <div className="mt-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-5">
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
          </div>
          </SafeBoundary>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
