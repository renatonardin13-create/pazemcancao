import { createFileRoute } from "@tanstack/react-router";
import { Download, Music, Flame, Star, BookOpen, ShoppingBag, Lock } from "lucide-react";
import { sampleTracks } from "@/lib/sample-tracks";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { PageContainer } from "@/components/PageContainer";
import { ValueMessageCard } from "@/components/ValueMessageCard";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: DownloadsPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const featuredIds = [1, 3, 6, 15, 29, 30];
const featuredTracks = sampleTracks.filter((t) => featuredIds.includes(t.id));

const categoryGroups = [
  { key: "Paz", icon: "🕊️" },
  { key: "Cura", icon: "💛" },
  { key: "Força", icon: "🔥" },
  { key: "Oração", icon: "🙏" },
  { key: "Madrugada", icon: "🌙" },
  { key: "Presença", icon: "✨" },
  { key: "Refúgio", icon: "🏔️" },
].map((cat) => ({
  ...cat,
  tracks: sampleTracks.filter((t) => t.category === cat.key),
})).filter((cat) => cat.tracks.length > 0);

function SectionHeader({ icon: Icon, tag, title, count }: { icon: React.ElementType; tag: string; title: string; count?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="flex items-center gap-3 mb-10"
    >
      <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 flex-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/10">
          <Icon className="h-3.5 w-3.5 text-gold/45" />
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gold/35">{tag}</p>
          <h2 className="text-[13px] font-bold text-foreground/80 tracking-tight mt-0.5">{title}</h2>
        </div>
        {count !== undefined && (
          <span className="ml-auto text-[10px] text-muted-foreground/25 font-medium">
            {count} {count === 1 ? "item" : "itens"}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

function HorizontalRow({ title, tag, icon: Icon, tracks, emoji }: { title: string; tag: string; icon: React.ElementType; tracks: typeof sampleTracks; emoji?: string }) {
  return (
    <section className="pt-14 sm:pt-18">
      {/* Divider line */}
      <PageContainer>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/10 to-transparent mb-10" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/10">
              {emoji ? (
                <span className="text-sm">{emoji}</span>
              ) : (
                <Icon className="h-3.5 w-3.5 text-gold/45" />
              )}
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gold/35">{tag}</p>
              <h2 className="text-[14px] font-bold text-foreground/80 tracking-tight mt-0.5">{title}</h2>
            </div>
            <span className="ml-auto text-[10px] text-muted-foreground/25 font-medium">
              {tracks.length} {tracks.length === 1 ? "louvor" : "louvores"}
            </span>
          </motion.div>
        </motion.div>
      </PageContainer>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-none -mx-0 px-6 sm:px-10 lg:px-16">
        <div className="flex gap-5 pb-4" style={{ minWidth: "max-content" }}>
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-[280px] sm:w-[320px] flex-shrink-0"
            >
              <TrackCard track={track} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadsPage() {
  return (
    <div className="min-h-screen bg-background pb-32 relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_5%,var(--color-gold)/0.03,transparent_70%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-gold/[0.008] blur-[200px] animate-breathe" />

      <AppHeader />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative">
        <PageContainer className="pt-24 pb-16 sm:pt-32 sm:pb-20 text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="mx-auto mb-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold/10 bg-gold/[0.04]">
                <Music className="h-5 w-5 text-gold/50" />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={0.1} className="mb-4 text-[10px] font-semibold uppercase tracking-[0.6em] text-gold/45">
              Sua Biblioteca Espiritual
            </motion.p>

            <motion.h1 variants={fadeUp} custom={0.2} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.04] tracking-tight">
              Seus Louvores <span className="text-gold">Exclusivos</span>
            </motion.h1>

            <motion.div variants={fadeUp} custom={0.3}>
              <div className="mx-auto mt-8 h-px w-28 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
            </motion.div>

            <motion.p variants={fadeUp} custom={0.4} className="mx-auto mt-8 max-w-md text-[15px] leading-[2.2] text-muted-foreground/55 font-light">
              Acesse, ouça e baixe sua coleção privada de 30 louvores inéditos.
              <br />
              <span className="text-muted-foreground/40">Ouça sem pressa. Este é o seu espaço.</span>
            </motion.p>

            <motion.p variants={fadeUp} custom={0.55} className="mx-auto mt-6 max-w-lg text-[14px] leading-[2.3] text-muted-foreground/45 font-light italic">
              Essas canções foram preparadas para ser paz nos seus dias difíceis, força na sua caminhada e presença de Deus nos seus momentos mais silenciosos.
            </motion.p>
          </motion.div>
        </PageContainer>
      </section>

      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <ValueMessageCard />
        </motion.div>
      </PageContainer>

      {/* ═══════════ MAIS ACESSADOS ═══════════ */}
      <HorizontalRow
        icon={Flame}
        tag="Destaques"
        title="Mais Acessados"
        tracks={featuredTracks}
      />

      {/* ═══════════ CATEGORIAS ═══════════ */}
      {categoryGroups.map((cat) => (
        <HorizontalRow
          key={cat.key}
          icon={Star}
          emoji={cat.icon}
          tag={cat.key}
          title={`Louvores de ${cat.key}`}
          tracks={cat.tracks}
        />
      ))}

      {/* ═══════════ BAIXAR TODOS ═══════════ */}
      <PageContainer className="pt-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto w-px h-14 bg-gradient-to-b from-transparent via-gold/10 to-transparent mb-10" />
          </motion.div>
          <motion.p variants={fadeUp} custom={0.1} className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gold/35 mb-4">
            Leve com você
          </motion.p>
          <motion.h3 variants={fadeUp} custom={0.2} className="font-display text-xl font-bold text-foreground/85">
            Baixe Toda a Coleção
          </motion.h3>
          <motion.p variants={fadeUp} custom={0.3} className="mt-3 text-[13px] text-muted-foreground/40 leading-relaxed">
            30 faixas em alta qualidade para a sua jornada de fé
          </motion.p>
          <motion.div variants={fadeUp} custom={0.4}>
            <Button className="mt-8 gap-2.5 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-10 py-4 h-auto text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-gold/25 hover:text-gold/85 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/15 shadow-none transition-all duration-700 active:scale-95">
              <Download className="h-3.5 w-3.5" />
              Baixar Todos
            </Button>
          </motion.div>
        </motion.div>
      </PageContainer>

      {/* ═══════════ SEÇÃO 3: CONTEÚDOS ═══════════ */}
      <PageContainer className="pt-16 sm:pt-20 pb-8">
        <SectionHeader icon={BookOpen} tag="Recursos" title="Conteúdos" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {[
            { title: "Devocional Diário", desc: "Reflexões breves para iniciar o dia com propósito e presença." },
            { title: "Guia de Oração", desc: "Um roteiro para seus momentos de intimidade com Deus." },
            { title: "Letras dos Louvores", desc: "Todas as letras para acompanhar e meditar enquanto ouve." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i * 0.1}
              className="group relative rounded-2xl border border-border/10 bg-card/10 p-7 transition-all duration-500 hover:border-gold/10 hover:bg-card/15"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-gold/30" />
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/30 bg-gold/[0.06] rounded-full px-2.5 py-0.5">
                  Em breve
                </span>
              </div>
              <h3 className="font-display text-[15px] font-bold text-foreground/75 tracking-tight mb-2">{item.title}</h3>
              <p className="text-[12px] leading-[2] text-muted-foreground/35 font-light">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </PageContainer>

      {/* ═══════════ SEÇÃO 4: PRODUTOS ═══════════ */}
      <PageContainer className="pt-16 sm:pt-20 pb-8">
        <SectionHeader icon={ShoppingBag} tag="Loja" title="Produtos" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 gap-5"
        >
          {[
            { title: "Paz em Canção — Vol. 2", desc: "Uma nova coleção de louvores inéditos está sendo preparada com o mesmo cuidado e propósito." },
            { title: "Kit Adoração em Família", desc: "Materiais especiais para viver momentos de adoração com quem você ama." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i * 0.1}
              className="group relative rounded-2xl border border-border/10 bg-card/10 p-7 transition-all duration-500 hover:border-gold/10 hover:bg-card/15"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-4 w-4 text-gold/30" />
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold/30 bg-gold/[0.06] rounded-full px-2.5 py-0.5">
                  Em breve
                </span>
              </div>
              <h3 className="font-display text-[15px] font-bold text-foreground/75 tracking-tight mb-2">{item.title}</h3>
              <p className="text-[12px] leading-[2] text-muted-foreground/35 font-light">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </PageContainer>

      {/* ═══════════ EXCLUSIVIDADE ═══════════ */}
      <PageContainer className="pt-12 pb-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-gold/10 to-transparent mb-8" />
          </motion.div>
          <motion.div variants={fadeUp} custom={0.1} className="flex items-center justify-center gap-2 mb-3">
            <Lock className="h-3 w-3 text-gold/25" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-gold/30">Acesso Exclusivo</span>
          </motion.div>
          <motion.p variants={fadeUp} custom={0.15} className="text-[11px] leading-[2.2] text-muted-foreground/30 font-light italic max-w-sm mx-auto">
            Esta coleção é exclusiva e disponível apenas para membros. Não está disponível em plataformas públicas.
          </motion.p>
        </motion.div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
