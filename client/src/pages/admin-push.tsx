import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function AdminPush() {
  const [title, setTitle] = useState('Teste Push Vendzz');
  const [message, setMessage] = useState('Esta é uma notificação push de teste do sistema Vendzz!');
  const { toast } = useToast();

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['/push-stats'],
    queryFn: async () => {
      const response = await fetch('/push-stats', { method: 'POST' });
      return response.json();
    },
    refetchInterval: 5000
  });

  // Mutation para enviar push
  const sendPushMutation = useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      const response = await fetch('/push-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      if (!response.ok) throw new Error('Erro ao enviar push notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Push Enviado!",
        description: "Notificação enviada para todos os dispositivos registrados",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    sendPushMutation.mutate({ title, message });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">📱 Admin Push Notifications</CardTitle>
            <CardDescription>
              Envie push notifications para todos os dispositivos registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total Registrados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.recent || 0}</div>
                  <div className="text-sm text-gray-600">Últimas 24h</div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de envio */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título da Notificação</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nova funcionalidade disponível"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem da notificação..."
                  className="w-full min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={sendPushMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {sendPushMutation.isPending ? 'Enviando...' : '📤 Enviar Push Notification'}
              </Button>
            </div>

            {/* Templates rápidos */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm mb-3">Templates Rápidos:</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle('🎉 Nova Funcionalidade!');
                    setMessage('Confira a nova funcionalidade que acabamos de lançar no Vendzz!');
                  }}
                  className="w-full text-left justify-start"
                >
                  Nova Funcionalidade
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle('⚡ Sistema Atualizado');
                    setMessage('O Vendzz foi atualizado com melhorias de performance e novos recursos!');
                  }}
                  className="w-full text-left justify-start"
                >
                  Atualização
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle('📈 Relatório Disponível');
                    setMessage('Seu relatório mensal de campanhas já está disponível no dashboard.');
                  }}
                  className="w-full text-left justify-start"
                >
                  Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como testar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como testar Push Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>1. No iPhone/iPad:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Acesse o dashboard via Safari</li>
                <li>Toque em "Compartilhar" → "Adicionar à Tela de Início"</li>
                <li>Abra o app PWA (ícone na tela de início)</li>
                <li>O sistema solicitará permissões automaticamente</li>
              </ul>
              
              <p className="mt-4"><strong>2. No Android:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Acesse via Chrome</li>
                <li>Toque nos 3 pontos → "Adicionar à tela inicial"</li>
                <li>Abra o PWA e permita notificações</li>
              </ul>

              <p className="mt-4"><strong>3. Desktop:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Chrome: Clique no ícone de instalação na barra de endereço</li>
                <li>Permita notificações quando solicitado</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}