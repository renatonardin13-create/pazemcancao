import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
            <Music className="h-3.5 w-3.5 text-gold" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Paz em Canção</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: abril de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma Paz em Canção, você concorda com estes Termos de Uso. Caso não concorde, interrompa o uso imediatamente.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Acesso à Plataforma</h2>
            <p>O acesso é individual e intransferível. Cada compra garante acesso exclusivo ao e-mail cadastrado no momento da aquisição. É proibido compartilhar credenciais de acesso.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Conteúdo</h2>
            <p>Todo o conteúdo disponível na plataforma — incluindo músicas, letras, arranjos e gravações — é protegido por direitos autorais. O download é permitido exclusivamente para uso pessoal e privado.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Proibições</h2>
            <p>É expressamente proibido redistribuir, revender, publicar, transmitir ou disponibilizar o conteúdo da plataforma em qualquer meio, físico ou digital, sem autorização prévia por escrito.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Contato</h2>
            <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:suporte@pazemcancao.com" className="text-gold underline">suporte@pazemcancao.com</a>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paz em Canção · Todos os direitos reservados
      </footer>
    </div>
  );
}
