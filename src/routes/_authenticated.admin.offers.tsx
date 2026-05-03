import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminOffers, deleteOffer, toggleOfferStatus } from "@/lib/admin-integrations.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit2, Copy, Trash2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/LoadingSkeletons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/offers")({
  component: OffersPage,
});

const gatewayColors: Record<string, { bg: string; text: string; border: string }> = {
  kiwify: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  perfect_pay: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  ativa: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  rascunho: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  inativa: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

function OffersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");

  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: () => listAdminOffers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOffer({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta excluída com sucesso");
    },
    onError: () => toast.error("Erro ao excluir oferta"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => toggleOfferStatus({ data: { id, status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Status atualizado");
    },
  });

  const handleCopyWebhook = (id: string) => {
    const url = `${window.location.origin}/api/webhooks/payment?id=${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link do webhook copiado!");
  };

  const filteredOffers = offers?.filter(offer => {
    const matchesSearch = offer.nome.toLowerCase().includes(search.toLowerCase()) || 
                          offer.codigo_externo.toLowerCase().includes(search.toLowerCase());
    const matchesGateway = gatewayFilter === "all" || offer.gateway === gatewayFilter;
    return matchesSearch && matchesGateway;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 bg-background/50 text-muted-foreground hover:text-gold hover:border-gold/30 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Ofertas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas integrações de pagamento</p>
          </div>
        </div>
        <Link to="/admin/offers/new">
          <Button className="gap-2 bg-gold hover:bg-gold/90 text-black font-bold">
            <Plus className="h-4 w-4" />
            Nova oferta
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou código..." 
            className="pl-10 bg-card border-border/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 px-3 rounded-md border border-border/30 bg-card text-sm"
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
          >
            <option value="all">Todos Gateways</option>
            <option value="kiwify">Kiwify</option>
            <option value="perfect_pay">Perfect Pay</option>
          </select>
          <Button variant="outline" className="gap-2 border-border/30 bg-card">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="w-[120px]">Gateway</TableHead>
                <TableHead>Nome da entrega</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Produtos liberados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : filteredOffers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-10 w-10 opacity-20" />
                      <p>Nenhuma oferta encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers?.map((offer) => (
                  <TableRow key={offer.id} className="border-border/20 group hover:bg-white/[0.02]">
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${gatewayColors[offer.gateway]?.bg} ${gatewayColors[offer.gateway]?.text} ${gatewayColors[offer.gateway]?.border} capitalize font-bold text-[10px]`}
                      >
                        {offer.gateway.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{offer.nome}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">
                        {offer.modalidade === 'unico' ? 'Venda única' : 'Assinatura'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="text-[11px] bg-muted/30 px-1.5 py-0.5 rounded text-gold/80">
                        {offer.codigo_externo}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {offer.ofertas_produtos?.map((op: any) => (
                          <Badge key={op.produto_id} variant="secondary" className="text-[9px] bg-white/5 text-muted-foreground">
                            {op.produtos?.nome}
                          </Badge>
                        )) || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[offer.status]?.bg} ${statusColors[offer.status]?.text} ${statusColors[offer.status]?.border} capitalize font-medium text-[10px]`}
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-card border-border/50">
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit2 className="h-3.5 w-3.5" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                            onClick={() => handleCopyWebhook(offer.id)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copiar Webhook
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                            onClick={() => statusMutation.mutate({ 
                              id: offer.id, 
                              status: offer.status === 'ativa' ? 'inativa' : 'ativa' 
                            })}
                          >
                            {offer.status === 'ativa' ? (
                              <><XCircle className="h-3.5 w-3.5 text-red-400" /> Desativar</>
                            ) : (
                              <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Ativar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                            onClick={() => {
                              if (confirm("Deseja realmente excluir esta oferta?")) {
                                deleteMutation.mutate(offer.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
