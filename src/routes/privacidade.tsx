import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { PageContainer } from "@/components/PageContainer";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="font-display text-3xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Saiba como protegemos seus dados e seu acesso à plataforma.</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Dados de Login</h2>
            <p>Coletamos apenas os dados necessários para garantir o acesso à plataforma: nome, e-mail e informações de autenticação. Dados de pagamento são processados por terceiros seguros.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Proteção de Acesso</h2>
            <p>Seu acesso é individual e protegido por senha. Utilizamos criptografia e práticas de segurança atualizadas para proteger sua conta.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Segurança da Conta</h2>
            <p>Não compartilhamos, vendemos ou cedemos seus dados pessoais a terceiros, exceto quando exigido por lei ou para processamento de pagamento.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Privacidade do Usuário</h2>
            <p>Seus dados são utilizados exclusivamente para autenticação na plataforma e suporte ao cliente. Respeitamos integralmente a sua privacidade.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Comunicação</h2>
            <p>Podemos enviar comunicações relacionadas à sua compra e atualizações importantes. Para questões de privacidade, entre em contato pelo e-mail <a href="mailto:suporte@pazemcancao.com" className="text-gold underline">suporte@pazemcancao.com</a>.</p>
          </section>
        </div>
      </PageContainer>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paz em Canção · Todos os direitos reservados
      </footer>
    </div>
  );
}
