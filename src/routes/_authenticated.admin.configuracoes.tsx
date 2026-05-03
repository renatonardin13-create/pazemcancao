import { createFileRoute } from "@tanstack/react-router";
import { Settings, Save, Upload, Image as ImageIcon, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("Paz em Canção");

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Configurações</h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Gerencie a identidade da sua plataforma.</p>
        </div>
        <Button onClick={handleSave} className="rounded-xl bg-gold text-background font-bold hover:bg-gold/90">
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-gold" />
              Identidade Visual
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">Upload de logo e favicon da plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Logo da Plataforma</Label>
                <div className="h-32 rounded-2xl border-2 border-dashed border-border/20 flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors cursor-pointer group">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/20 group-hover:text-gold/30 transition-colors" />
                  <span className="text-[10px] font-bold text-muted-foreground/40 mt-2 uppercase tracking-widest">Clique para trocar</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Favicon</Label>
                <div className="h-32 w-32 mx-auto sm:mx-0 rounded-2xl border-2 border-dashed border-border/20 flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors cursor-pointer group">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/20 group-hover:text-gold/30 transition-colors" />
                  <span className="text-[10px] font-bold text-muted-foreground/40 mt-2 uppercase tracking-widest">Favicon</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Nome da Plataforma</Label>
              <Input 
                value={platformName} 
                onChange={(e) => setPlatformName(e.target.value)}
                className="bg-background/40 border-border/20 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-gold" />
              Segurança e Acesso
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">Configurações de autenticação e proteção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 border border-border/10">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground/80">Bloqueio de Compartilhamento</p>
                <p className="text-xs text-muted-foreground/50">Impede múltiplos acessos simultâneos.</p>
              </div>
              <div className="h-6 w-11 bg-gold rounded-full relative">
                <div className="h-4 w-4 bg-background rounded-full absolute right-1 top-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}