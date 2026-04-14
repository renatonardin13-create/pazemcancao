import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_10%,var(--color-gold)/0.02,transparent_70%)]" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground/50 transition-colors duration-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs font-medium uppercase tracking-[0.3em]">Voltar</span>
          </Link>
        </div>
      </header>

      <PageContainer maxWidth="md" className="py-8 pb-20 relative z-10">
        <div className="mx-auto mb-10 w-px h-10 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 text-center">Política de Privacidade</h1>
        <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <p className="mt-5 text-[13px] text-muted-foreground/70 text-center leading-[1.8]">Como protegemos seus dados e seu acesso.</p>

        <div className="mt-12 space-y-8 text-[14px] leading-[2] text-foreground/55">
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">1. Dados de Login</h2>
            <p>Coletamos apenas os dados necessários para garantir o acesso à plataforma: nome, e-mail e informações de autenticação. Dados de pagamento são processados por terceiros seguros.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">2. Proteção de Acesso</h2>
            <p>Seu acesso é individual e protegido por senha. Utilizamos criptografia e práticas de segurança atualizadas para proteger sua conta.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">3. Segurança da Conta</h2>
            <p>Não compartilhamos, vendemos ou cedemos seus dados pessoais a terceiros, exceto quando exigido por lei ou para processamento de pagamento.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">4. Privacidade do Usuário</h2>
            <p>Seus dados são utilizados exclusivamente para autenticação na plataforma e suporte ao cliente. Respeitamos integralmente a sua privacidade.</p>
          </section>
          <section>
            <h2 className="text-[13px] font-semibold text-foreground/70 mb-3 uppercase tracking-wider">5. Comunicação</h2>
            <p>Podemos enviar comunicações relacionadas à sua compra e atualizações importantes. Para questões de privacidade, entre em contato pelo e-mail <a href="mailto:suporte@pazemcancao.com" className="text-gold/45 hover:text-gold/65 transition-colors duration-500 underline underline-offset-2">suporte@pazemcancao.com</a>.</p>
          </section>
        </div>
      </PageContainer>

      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground/18">
        © {new Date().getFullYear()} Paz em Canção
      </footer>
    </div>
  );
}
