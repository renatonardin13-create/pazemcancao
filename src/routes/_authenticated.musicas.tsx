import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
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
import { listActiveTracks, listCategories } from "@/lib/tracks.functions";
import { listPlaylistsWithCounts, getPlaylistWithTracks } from "@/lib/playlists.functions";
import { checkBuyerAccess } from "@/lib/access.functions";
import { logDownload } from "@/lib/analytics.functions";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";

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

  const { data: tracksData, isLoading: tracksLoading, isError: tracksFailed } = useQuery({
    queryKey: ["music-library-tracks"],
    queryFn: () => listActiveTracks(),
    staleTime: 30_000,
    retry: 2,
  });

  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesFailed } = useQuery({
    queryKey: ["music-library-categories"],
    queryFn: () => listCategories(),
    staleTime: 60_000,
  });

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
  const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
  const playlists = Array.isArray(playlistsData?.playlists) ? playlistsData.playlists : [];
  const playlistTracks = Array.isArray(playlistTracksData?.tracks) ? playlistTracksData.tracks : [];

  // Validação segura da categoria vinda da URL: nunca quebra,
  // cai em "destaques-top-10" → primeira categoria → "" (todas).
  const rawCategoryFilter = typeof search?.categoria === "string" ? search.categoria : "";
  const categorySlugs = categories
    .map((c: any) => safeSlug(c?.slug || c?.name))
    .filter(Boolean);
  const requestedSlug = safeSlug(rawCategoryFilter);
  const isRequestedValid = Boolean(requestedSlug) && categorySlugs.includes(requestedSlug);
  const fallbackSlug = categorySlugs.includes("destaques-top-10")
    ? "destaques-top-10"
    : categorySlugs[0] || "";
  const categoryFilter = isRequestedValid
    ? requestedSlug
    : rawCategoryFilter
      ? fallbackSlug
      : "";

  const isLocked = accessData?.trialExpired === true || accessData?.isBlocked === true;
  const canDownload = accessData?.canDownload !== false;

  console.log("[musicas-route] init");
  console.log("[musicas-route] categoria-param", rawCategoryFilter || "(nenhuma)");
  console.log("[musicas-route] categorias-loaded", categories.length);
  console.log("[musicas-route] musicas-loaded", tracks.length);
  if (tracksFailed || categoriesFailed || playlistsFailed) {
    console.error("[musicas-route] error", { tracksFailed, categoriesFailed, playlistsFailed });
  }

  const filteredTracks = useMemo(() => {
    return tracks.filter((track: any) => {
      const matchesCategory = !categoryFilter || safeSlug(track?.category) === safeSlug(categoryFilter);
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
                    <span className="text-xs font-semibold uppercase tracking-[0.32em]">Louvores</span>
                  </div>
                  <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Músicas</h1>
                  <p className="max-w-xl text-sm text-muted-foreground/80 sm:text-base">
                    Sua coleção completa de louvores para acalmar a alma e renovar a fé.
                  </p>
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
                {categories.map((category: any) => {
                  const slug = safeSlug(category?.slug || category?.name);
                  const active = slug === safeSlug(categoryFilter);
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
                      {category?.name || "Sem categoria"}
                    </Link>
                  );
                })}
              </div>
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

            <section className="space-y-6">
              <div className="flex items-end justify-between gap-3 border-b border-border/30 pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Coleção</p>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Todas as músicas
                  </h2>
                  <p className="text-sm text-muted-foreground/70">
                    {categoryFilter ? "Filtrando por categoria" : "Sua biblioteca completa de louvores"}
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
              ) : (
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredTracks.map((track: any) => {
                    const playerTrack = dbTrackToPlayerTrack(track);
                    const isCurrent = currentTrack?.id === playerTrack.id;
                    const isPlaying = isCurrent && playing;
                    const canPlay = Boolean(playerTrack.audioUrl);

                    return (
                      <div
                        key={track.id}
                        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-b from-card/70 via-card/40 to-background/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.35)]"
                      >
                        {/* Poster */}
                        <Link
                          to="/musicas/$trackId"
                          params={{ trackId: String(track.id) }}
                          className="relative block aspect-[4/5] w-full overflow-hidden"
                        >
                          {playerTrack.coverUrl ? (
                            <img
                              src={playerTrack.coverUrl}
                              alt={playerTrack.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                          ) : (
                            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background/30 to-background">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.25),transparent_60%)]" />
                              <Music className="relative h-20 w-20 text-primary/50 drop-shadow-[0_4px_20px_hsl(var(--primary)/0.4)]" />
                            </div>
                          )}

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                          {/* Category badge */}
                          {track?.category ? (
                            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/90 backdrop-blur-md">
                              {track.category}
                            </span>
                          ) : null}

                          {/* Floating play button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (canPlay) handleTrackPlay(track, filteredTracks);
                            }}
                            disabled={!canPlay}
                            aria-label={isPlaying ? "Pausar" : "Ouvir"}
                            className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-5px_hsl(var(--primary)/0.6)] ring-1 ring-primary/30 transition-all duration-300 hover:scale-110 disabled:opacity-40"
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[2px]" />}
                          </button>
                        </Link>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
                          <div className="flex flex-1 flex-col gap-1">
                            <Link
                              to="/musicas/$trackId"
                              params={{ trackId: String(track.id) }}
                              className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary"
                            >
                              {track?.title || "Música sem título"}
                            </Link>
                            <p className="text-xs font-medium text-muted-foreground/60">
                              {track?.duration || "0:00"}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-full border-border/50 bg-background/40 text-xs font-semibold tracking-wide hover:border-primary/40 hover:bg-primary/5"
                            onClick={() => handleDownload(track)}
                            disabled={isLocked || !canDownload || !playerTrack.downloadUrl}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
          </SafeBoundary>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
