import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle,
  Package
} from 'lucide-react';
import quantumQueryClient from '@/lib/quantumQueryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Atendente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  meta_vendas_diaria: number;
  comissao_percentual: number;
}

interface VendaResumo {
  atendente_id: string;
  atendente_nome: string;
  vendas_hoje: number;
  vendas_agendadas_hoje: number;
  comissao_paga: number;
  comissao_pendente: number;
  gasto_campanha_hoje: number;
}

interface PedidoAgendado {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  valor_venda: number;
  data_agendamento: string;
  periodo_entrega: string;
  atendente_nome: string;
}

export default function ControleDashboard() {
  const [userRole, setUserRole] = useState<'admin' | 'atendente'>('admin');
  const [atendenteLogado, setAtendenteLogado] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: atendentes = [] } = useQuery({
    queryKey: ['/api/controle/atendentes'],
    queryFn: () => fetch('/api/controle/atendentes').then(res => res.json()),
  });

  const { data: resumoDiario = [] } = useQuery({
    queryKey: ['/api/controle/resumo-diario'],
    queryFn: () => fetch('/api/controle/resumo-diario').then(res => res.json()),
  });

  const { data: pedidosAgendados = [] } = useQuery({
    queryKey: ['/api/controle/pedidos-agendados-hoje'],
    queryFn: () => fetch('/api/controle/pedidos-agendados-hoje').then(res => res.json()),
  });

  const { data: metricsGerais } = useQuery({
    queryKey: ['/api/controle/metrics-gerais'],
    queryFn: () => fetch('/api/controle/metrics-gerais').then(res => res.json()),
  });

  // Para atendentes - filtrar apenas seus dados
  const dadosAtendente = userRole === 'atendente' && atendenteLogado 
    ? resumoDiario.find((r: VendaResumo) => r.atendente_id === atendenteLogado)
    : null;

  const pedidosDoAtendente = userRole === 'atendente' && atendenteLogado
    ? pedidosAgendados.filter((p: PedidoAgendado) => 
        resumoDiario.find((r: VendaResumo) => r.atendente_id === atendenteLogado && r.atendente_nome === p.atendente_nome)
      )
    : pedidosAgendados;

  // Simulação de login (em produção seria via autenticação real)
  useEffect(() => {
    // Por enquanto, simular que é admin
    // Em produção: verificar token JWT e role do usuário
    setUserRole('admin');
  }, []);

  const AdminDashboard = () => (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumoDiario.reduce((acc: number, r: VendaResumo) => acc + r.vendas_hoje, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: {atendentes.length * 4} vendas/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumoDiario.reduce((acc: number, r: VendaResumo) => acc + r.comissao_paga, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendente: R$ {resumoDiario.reduce((acc: number, r: VendaResumo) => acc + r.comissao_pendente, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Campanhas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumoDiario.reduce((acc: number, r: VendaResumo) => acc + r.gasto_campanha_hoje, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje - {atendentes.length} atendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pedidosAgendados.length}</div>
            <p className="text-xs text-muted-foreground">
              Agendadas para hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Atendente */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Atendente - Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumoDiario.map((atendente: VendaResumo) => (
              <div key={atendente.atendente_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{atendente.atendente_nome}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Vendas: {atendente.vendas_hoje}/4</span>
                    <span>Agendadas: {atendente.vendas_agendadas_hoje}</span>
                    <span>Gasto: R$ {atendente.gasto_campanha_hoje.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    R$ {atendente.comissao_paga.toFixed(2)}
                  </div>
                  <div className="text-sm text-orange-600">
                    +R$ {atendente.comissao_pendente.toFixed(2)} pendente
                  </div>
                </div>
                <Badge variant={atendente.vendas_hoje >= 4 ? "default" : "secondary"}>
                  {atendente.vendas_hoje >= 4 ? "Meta atingida" : "Trabalhando"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entregas Agendadas */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas Agendadas - Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidosAgendados.map((pedido: PedidoAgendado) => (
              <div key={pedido.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{pedido.cliente_nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {pedido.cliente_telefone} • {pedido.atendente_nome}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">R$ {pedido.valor_venda.toFixed(2)}</div>
                  <Badge variant="outline">{pedido.periodo_entrega}</Badge>
                </div>
              </div>
            ))}
            {pedidosAgendados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma entrega agendada para hoje
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AtendenteDashboard = () => (
    <div className="space-y-6">
      {/* Seletor de Atendente (simulação - em produção seria automático) */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Atendente (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {atendentes.map((atendente: Atendente) => (
              <Button
                key={atendente.id}
                variant={atendenteLogado === atendente.id ? "default" : "outline"}
                onClick={() => setAtendenteLogado(atendente.id)}
              >
                {atendente.nome}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {dadosAtendente && (
        <>
          {/* Métricas do Atendente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosAtendente.vendas_hoje}</div>
                <p className="text-xs text-muted-foreground">
                  Meta: 4 vendas/dia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissão</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {dadosAtendente.comissao_paga.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +R$ {dadosAtendente.comissao_pendente.toFixed(2)} pendente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pedidosDoAtendente.length}</div>
                <p className="text-xs text-muted-foreground">
                  Agendadas para avisar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Entregas para Avisar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Clientes para Avisar - Entrega Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pedidosDoAtendente.map((pedido: PedidoAgendado) => (
                  <div key={pedido.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex-1">
                      <div className="font-medium">{pedido.cliente_nome}</div>
                      <div className="text-sm text-muted-foreground">
                        📱 {pedido.cliente_telefone}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">R$ {pedido.valor_venda.toFixed(2)}</div>
                      <Badge variant="outline">{pedido.periodo_entrega}</Badge>
                    </div>
                    <Button size="sm" className="ml-4">
                      Avisar Cliente
                    </Button>
                  </div>
                ))}
                {pedidosDoAtendente.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    🎉 Nenhuma entrega agendada para hoje!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Controle de Operações</h1>
            <p className="text-muted-foreground">
              Sistema de controle cash-on-delivery • Logzz Partnership
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={userRole === 'admin' ? "default" : "outline"}
              onClick={() => setUserRole('admin')}
            >
              Visão Admin
            </Button>
            <Button 
              variant={userRole === 'atendente' ? "default" : "outline"}
              onClick={() => setUserRole('atendente')}
            >
              Visão Atendente
            </Button>
          </div>
        </div>

        {userRole === 'admin' ? <AdminDashboard /> : <AtendenteDashboard />}
      </div>
    </div>
  );
}