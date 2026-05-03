import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { sampleTracks } from "@/lib/sample-tracks";
import { Music, Download, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: DownloadsPage,
});

function DownloadsPage() {
  const { logout } = useAuth();

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/10 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-tight text-gold">Paz em Canção</h1>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Seus Louvores Exclusivos</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Essas canções foram preparadas para ser paz nos seus dias difíceis, força na sua caminhada e presença de Deus nos seus momentos mais silenciosos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTracks.map((track) => (
            <div key={track.id} className="group bg-card/30 border border-border/10 rounded-2xl p-6 hover:bg-card/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gold/10 text-gold">
                  <Music className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60 bg-gold/5 px-2 py-1 rounded-md">
                  {track.category}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-gold transition-colors">{track.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-6 font-light leading-relaxed">
                {track.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border/5">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{track.duration}</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDownload(track.downloadUrl, track.title)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-background transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-border/5 text-center">
        <p className="text-[11px] text-muted-foreground/40 font-light tracking-[0.2em] uppercase">
          Que estas canções sejam paz para sua alma.
        </p>
      </footer>
    </div>
  );
}