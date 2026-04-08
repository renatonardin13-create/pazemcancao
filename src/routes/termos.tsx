import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { PageContainer } from "@/components/PageContainer";

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
          <LogoBrand size="sm" />
        </div>
      </header>

      <PageContainer maxWidth="md" className="py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Leia as condições de uso da plataforma Paz em Canção.</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma Paz em Canção, você concorda com estes Termos de Uso. Caso não concorde, interrompa o uso imediatamente.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Uso Individual</h2>
            <p>O acesso é individual e intransferível. Cada compra garante acesso exclusivo ao e-mail cadastrado no momento da aquisição. O acesso é pessoal e não pode ser compartilhado com terceiros.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Proteção de Conteúdo</h2>
            <p>Todo o conteúdo disponível na plataforma — incluindo músicas, letras, arranjos e gravações — é protegido por direitos autorais. O download é permitido exclusivamente para uso pessoal e privado.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Proibição de Compartilhamento</h2>
            <p>É expressamente proibido redistribuir, revender, publicar, transmitir ou disponibilizar o conteúdo da plataforma em qualquer meio, físico ou digital, sem autorização prévia por escrito.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Direitos Autorais</h2>
            <p>Todos os direitos autorais são reservados. A violação destes termos pode resultar no cancelamento imediato do acesso, sem reembolso.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contato</h2>
            <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:suporte@pazemcancao.com" className="text-gold underline">suporte@pazemcancao.com</a>.</p>
          </section>
        </div>
      </PageContainer>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paz em Canção · Todos os direitos reservados
      </footer>
    </div>
  );
}
