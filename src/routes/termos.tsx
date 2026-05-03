import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="text-gold hover:underline mb-8 inline-block">← Voltar para Login</Link>
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
        <div className="prose prose-invert">
          <p>Ao acessar a plataforma Paz em Canção, você concorda com os seguintes termos:</p>
          <h2 className="text-xl font-bold mt-8 mb-4">1. Uso Individual</h2>
          <p>Seu acesso é pessoal e intransferível. O compartilhamento de senhas é proibido.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">2. Direitos Autorais</h2>
          <p>Todo o conteúdo, incluindo áudios e textos, é protegido por direitos autorais. A reprodução ou distribuição não autorizada é proibida.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">3. Acesso à Plataforma</h2>
          <p>O acesso é garantido enquanto a plataforma estiver ativa para o produto adquirido.</p>
        </div>
      </div>
    </div>
  );
}