import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_10%,var(--color-gold)/0.02,transparent_70%)]" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em]">Voltar</span>
          </Link>
        </div>
      </header>

      <PageContainer maxWidth="md" className="py-8 pb-20 relative z-10">
        <div className="mx-auto mb-10 w-px h-10 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 text-center">Termos de Uso</h1>
        <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <p className="mt-5 text-[13px] text-muted-foreground/35 text-center leading-[1.8]">Condições de uso da plataforma Paz em Canção.</p>

        <div className="mt-12 space-y-8 text-[14px] leading-[2] text-foreground/55">
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma Paz em Canção, você concorda com estes Termos de Uso. Caso não concorde, interrompa o uso imediatamente.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">2. Uso Individual</h2>
            <p>O acesso é individual e intransferível. Cada compra garante acesso exclusivo ao e-mail cadastrado no momento da aquisição. O acesso é pessoal e não pode ser compartilhado com terceiros.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">3. Proteção de Conteúdo</h2>
            <p>Todo o conteúdo disponível na plataforma — incluindo músicas, letras, arranjos e gravações — é protegido por direitos autorais. O download é permitido exclusivamente para uso pessoal e privado.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">4. Proibição de Compartilhamento</h2>
            <p>É expressamente proibido redistribuir, revender, publicar, transmitir ou disponibilizar o conteúdo da plataforma em qualquer meio, físico ou digital, sem autorização prévia por escrito.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">5. Direitos Autorais</h2>
            <p>Todos os direitos autorais são reservados. A violação destes termos pode resultar no cancelamento imediato do acesso, sem reembolso.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">6. Contato</h2>
            <p>Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:suporte@pazemcancao.com" className="text-gold/45 hover:text-gold/65 transition-colors duration-500 underline underline-offset-2">suporte@pazemcancao.com</a>.</p>
          </section>
        </div>
      </PageContainer>

      <footer className="relative z-10 py-6 text-center text-[10px] text-muted-foreground/18">
        © {new Date().getFullYear()} Paz em Canção
      </footer>
    </div>
  );
}
