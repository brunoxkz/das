import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Eye, Code, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StripeElementsPage() {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Buscar links existentes
  const { data: linksData, isLoading, refetch } = useQuery({
    queryKey: ["/api/stripe/checkout-links"],
  });

  const links = linksData?.links || [];

  // Gerar código embed para o link
  const generateEmbedCode = (link: any) => {
    const embedCode = `<!-- Stripe Elements Embed - ${link.name} -->
<iframe 
  src="${link.checkoutUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="Checkout ${link.name}">
</iframe>

<!-- Código JavaScript para integração avançada -->
<script>
  // Escutar eventos do checkout
  window.addEventListener('message', function(event) {
    if (event.data.type === 'checkout_success') {
      // Redirecionar após sucesso
      window.location.href = '/sucesso';
    }
    if (event.data.type === 'checkout_error') {
      // Tratar erro
      console.error('Erro no checkout:', event.data.error);
    }
  });
</script>`;

    return embedCode;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado!",
      description: "O código embed foi copiado para a área de transferência.",
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "A URL do checkout foi copiada para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando links de checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stripe Elements</h1>
        <p className="text-gray-600">
          Gerencie códigos embed e integre checkouts em qualquer site
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total de Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{links.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Links Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {links.filter((link: any) => link.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total de Usos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {links.reduce((sum: number, link: any) => sum + link.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {links.map((link: any) => (
          <Card key={link.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{link.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {link.isActive ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Pricing Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Taxa de Ativação</Label>
                    <p className="font-medium">R$ {link.immediateAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Valor Recorrente</Label>
                    <p className="font-medium">R$ {link.recurringAmount?.toFixed(2)}/mês</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Trial</Label>
                    <p className="font-medium">{link.trialDays} dias</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Usos</Label>
                    <p className="font-medium">{link.usageCount}</p>
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-2">
                  <Label className="text-gray-500">URL do Checkout</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={link.checkoutUrl}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(link.checkoutUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.checkoutUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLink(link);
                      setShowEmbedCode(true);
                    }}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Código Embed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.checkoutUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>Criado em {format(new Date(link.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  <p>Expira em {format(new Date(link.expiresAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Code className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum link encontrado</h3>
              <p>Crie seu primeiro checkout link para começar a usar o Stripe Elements</p>
            </div>
            <Button onClick={() => window.location.href = '/stripe-checkout-manager'}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Link de Checkout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Embed Code Modal */}
      {showEmbedCode && selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Código Embed - {selectedLink.name}</CardTitle>
              <CardDescription>
                Cole este código em qualquer site para integrar o checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Código HTML/JavaScript</Label>
                  <Textarea
                    value={generateEmbedCode(selectedLink)}
                    readOnly
                    className="font-mono text-sm h-64"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedLink))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedCode(false)}
                  >
                    Fechar
                  </Button>
                </div>

                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Instruções de Uso:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cole o código em qualquer página HTML</li>
                    <li>O iframe carregará automaticamente o checkout</li>
                    <li>Personalize width e height conforme necessário</li>
                    <li>O JavaScript captura eventos de sucesso/erro</li>
                    <li>Redirecione para páginas de sucesso personalizadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}