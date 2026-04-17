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
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <ModuleGuard moduleKey="louvores">
      <StudentLayout>
        <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-3xl border border-border/30 bg-card/20 px-6 py-16 text-center text-sm text-muted-foreground/70">
            <span>{message}</span>
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
            <section className="rounded-3xl border border-border/30 bg-card/20 p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <Headphones className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.28em]">Louvores</span>
                  </div>
                  <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Músicas</h1>
                  <p className="text-sm text-muted-foreground/70">
                    Todas as músicas liberadas, com categorias como filtro secundário e espaço para playlists.
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar músicas..."
                    className="pl-9"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/30 bg-card/20 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-muted-foreground/70" />
                <h2 className="text-sm font-medium text-foreground">Categorias</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/musicas"
                  search={{}}
                  className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                    !categoryFilter
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/40 bg-background/40 text-muted-foreground hover:text-foreground"
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
                      className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border/40 bg-background/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category?.name || "Sem categoria"}
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-border/30 bg-card/20 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Disc3 className="h-4 w-4 text-muted-foreground/70" />
                <h2 className="text-sm font-medium text-foreground">Playlists</h2>
              </div>

              {playlists.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground/70">
                  Nenhuma playlist disponível.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {playlists.map((playlist: any) => {
                    const isActive = playlist.id === activePlaylistId;
                    return (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => setActivePlaylistId(isActive ? null : playlist.id)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          isActive
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/30 bg-background/40 hover:border-border/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-foreground">{playlist?.name || "Playlist"}</h3>
                            {playlist?.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground/70">{playlist.description}</p>
                            ) : null}
                          </div>
                          <span className="rounded-full border border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground/70">
                            {playlist?.track_count || 0} faixas
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {activePlaylistId ? (
                <div className="mt-5 rounded-2xl border border-border/30 bg-background/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{playlistTracksData?.playlist?.name || "Playlist selecionada"}</h3>
                      <p className="text-sm text-muted-foreground/70">
                        {playlistLoading ? "Carregando músicas da playlist..." : `${playlistTracks.length} música(s) nesta playlist`}
                      </p>
                    </div>
                    <Button variant="premiumOutline" size="sm" onClick={handlePlaylistPlay} disabled={!playlistTracks.length || playlistLoading}>
                      <Play className="h-3.5 w-3.5" />
                      Ouvir playlist
                    </Button>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-border/30 bg-card/20 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-foreground">Todas as músicas liberadas</h2>
                  <p className="text-sm text-muted-foreground/70">
                    {categoryFilter ? "Filtro por categoria aplicado." : "Listagem geral sem filtro automático."}
                  </p>
                </div>
                <span className="rounded-full border border-border/40 px-3 py-1 text-xs text-muted-foreground/70">
                  {filteredTracks.length} música(s)
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredTracks.map((track: any) => {
                    const playerTrack = dbTrackToPlayerTrack(track);
                    const isCurrent = currentTrack?.id === playerTrack.id;
                    const isPlaying = isCurrent && playing;
                    const canPlay = Boolean(playerTrack.audioUrl);

                    return (
                      <div
                        key={track.id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/40 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                      >
                        <Link
                          to="/musicas/$trackId"
                          params={{ trackId: String(track.id) }}
                          className="relative block aspect-[9/13] w-full overflow-hidden bg-background/60"
                        >
                          {playerTrack.coverUrl ? (
                            <img
                              src={playerTrack.coverUrl}
                              alt={playerTrack.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (canPlay) handleTrackPlay(track, filteredTracks);
                            }}
                            disabled={!canPlay}
                            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110 disabled:opacity-50"
                            aria-label={isPlaying ? "Pausar" : "Ouvir"}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
                          </button>
                        </Link>

                        <div className="flex flex-1 flex-col gap-2 p-3">
                          <Link
                            to="/musicas/$trackId"
                            params={{ trackId: String(track.id) }}
                            className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                          >
                            {track?.title || "Música sem título"}
                          </Link>
                          <p className="line-clamp-1 text-xs text-muted-foreground/70">
                            {track?.category || "Sem categoria"} • {track?.duration || "0:00"}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-auto h-8 w-full text-xs"
                            onClick={() => handleDownload(track)}
                            disabled={isLocked || !canDownload || !playerTrack.downloadUrl}
                          >
                            <Download className="h-3 w-3" />
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
