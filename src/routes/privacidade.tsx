import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="text-gold hover:underline mb-8 inline-block">← Voltar para Login</Link>
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        <div className="prose prose-invert">
          <p>Sua privacidade é importante para nós. Esta política explica como lidamos com seus dados.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">1. Coleta de Dados</h2>
          <p>Coletamos apenas o e-mail necessário para sua autenticação e acesso aos conteúdos adquiridos.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">2. Uso das Informações</h2>
          <p>Seus dados são usados exclusivamente para garantir seu acesso individual à plataforma Paz em Canção.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">3. Segurança</h2>
          <p>Utilizamos tecnologias seguras para proteger sua conta e garantir que seu acesso seja pessoal e intransferível.</p>
        </div>
      </div>
    </div>
  );
}