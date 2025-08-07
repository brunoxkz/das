import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, ShoppingCart, Users, Star, Zap, 
  Instagram, Facebook, Twitter, Linkedin, Youtube, 
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  CreditCard, Wallet, Gift
} from "lucide-react";

export default function BuyComments() {
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [postUrl, setPostUrl] = useState("");
  const [commentPackage, setCommentPackage] = useState("basic");
  const [customComments, setCustomComments] = useState("");
  const [useCustomComments, setUseCustomComments] = useState(false);
  const [deliverySpeed, setDeliverySpeed] = useState("normal");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", available: true },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", available: true },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-gray-800", available: true },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700", available: true },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600", available: true },
    { id: "tiktok", name: "TikTok", icon: MessageCircle, color: "text-black", available: false }
  ];

  const packages = {
    basic: { comments: 10, price: 9.90, delivery: "24h", quality: "Básica" },
    standard: { comments: 50, price: 39.90, delivery: "12h", quality: "Alta" },
    premium: { comments: 100, price: 69.90, delivery: "6h", quality: "Premium" },
    ultimate: { comments: 500, price: 199.90, delivery: "2h", quality: "Ultra Premium" }
  };

  const deliveryOptions = [
    { id: "slow", name: "Lenta (48h)", multiplier: 0.8, description: "Mais barato, entrega em 2 dias" },
    { id: "normal", name: "Normal (24h)", multiplier: 1.0, description: "Entrega padrão em 1 dia" },
    { id: "fast", name: "Rápida (6h)", multiplier: 1.5, description: "Entrega acelerada em 6 horas" },
    { id: "instant", name: "Instantânea (1h)", multiplier: 2.0, description: "Entrega imediata" }
  ];

  const calculatePrice = () => {
    const basePrice = packages[commentPackage].price;
    const speedMultiplier = deliveryOptions.find(opt => opt.id === deliverySpeed)?.multiplier || 1;
    return (basePrice * speedMultiplier).toFixed(2);
  };

  const handlePurchase = async () => {
    if (!postUrl.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Digite a URL da postagem onde deseja adicionar comentários.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOrder = {
        id: Date.now().toString(),
        platform: selectedPlatform,
        postUrl,
        package: commentPackage,
        comments: packages[commentPackage].comments,
        price: calculatePrice(),
        status: "processing",
        createdAt: new Date().toISOString(),
        deliverySpeed: deliverySpeed,
        customComments: useCustomComments ? customComments : null
      };

      setOrders(prev => [newOrder, ...prev]);

      toast({
        title: "✅ Pedido confirmado!",
        description: `${packages[commentPackage].comments} comentários serão adicionados em ${deliveryOptions.find(opt => opt.id === deliverySpeed)?.name}.`
      });

      // Limpar formulário
      setPostUrl("");
      setCustomComments("");
      setUseCustomComments(false);

    } catch (error) {
      toast({
        title: "Erro no pedido",
        description: "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      processing: { color: "bg-yellow-500", text: "Processando" },
      delivering: { color: "bg-blue-500", text: "Entregando" },
      completed: { color: "bg-green-500", text: "Concluído" },
      failed: { color: "bg-red-500", text: "Falhou" }
    };
    
    return statusConfig[status] || statusConfig.processing;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Comprar Comentários
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Impulsione suas postagens com comentários reais e engajamento autêntico
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Fazer Pedido
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Pacotes
            </TabsTrigger>
          </TabsList>

          {/* Fazer Pedido */}
          <TabsContent value="purchase" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulário de Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Configurar Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seleção de Plataforma */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Plataforma</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((platform) => {
                        const IconComponent = platform.icon;
                        return (
                          <Button
                            key={platform.id}
                            variant={selectedPlatform === platform.id ? "default" : "outline"}
                            className={`p-3 h-auto ${!platform.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => platform.available && setSelectedPlatform(platform.id)}
                            disabled={!platform.available}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <IconComponent className={`w-5 h-5 ${platform.color}`} />
                              <span className="text-xs">{platform.name}</span>
                              {!platform.available && (
                                <Badge variant="secondary" className="text-xs">Em Breve</Badge>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* URL da Postagem */}
                  <div>
                    <Label htmlFor="post-url">URL da Postagem</Label>
                    <Input
                      id="post-url"
                      placeholder="https://instagram.com/p/exemplo123..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                    />
                  </div>

                  {/* Seleção de Pacote */}
                  <div>
                    <Label>Pacote de Comentários</Label>
                    <Select value={commentPackage} onValueChange={setCommentPackage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(packages).map(([key, pkg]) => (
                          <SelectItem key={key} value={key}>
                            {pkg.comments} comentários - R$ {pkg.price} - {pkg.quality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Velocidade de Entrega */}
                  <div>
                    <Label>Velocidade de Entrega</Label>
                    <Select value={deliverySpeed} onValueChange={setDeliverySpeed}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name} - {option.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comentários Personalizados */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={useCustomComments}
                        onCheckedChange={setUseCustomComments}
                      />
                      <Label>Usar comentários personalizados</Label>
                    </div>
                    {useCustomComments && (
                      <Textarea
                        placeholder="Digite seus comentários personalizados (um por linha)&#10;Exemplo:&#10;Que post incrível!&#10;Adorei o conteúdo&#10;Muito inspirador"
                        value={customComments}
                        onChange={(e) => setCustomComments(e.target.value)}
                        rows={4}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Pacote:</span>
                        <span>{packages[commentPackage].comments} comentários</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Qualidade:</span>
                        <Badge variant="secondary">{packages[commentPackage].quality}</Badge>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Entrega:</span>
                        <span>{deliveryOptions.find(opt => opt.id === deliverySpeed)?.name}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Preço base:</span>
                        <span>R$ {packages[commentPackage].price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Multiplicador:</span>
                        <span>{deliveryOptions.find(opt => opt.id === deliverySpeed)?.multiplier}x</span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">R$ {calculatePrice()}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handlePurchase}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Comentários
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>✅ Comentários de contas reais</p>
                      <p>✅ Entrega gradual e natural</p>
                      <p>✅ Garantia de qualidade</p>
                      <p>✅ Suporte 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meus Pedidos */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum pedido realizado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = getStatusBadge(order.status);
                      const platform = platforms.find(p => p.id === order.platform);
                      const IconComponent = platform?.icon || MessageCircle;
                      
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`w-5 h-5 ${platform?.color}`} />
                              <span className="font-medium">{platform?.name}</span>
                              <Badge className={`${status.color} text-white`}>
                                {status.text}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <p className="truncate">{order.postUrl}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              {order.comments} comentários - {deliveryOptions.find(opt => opt.id === order.deliverySpeed)?.name}
                            </span>
                            <span className="font-bold text-green-600">
                              R$ {order.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pacotes */}
          <TabsContent value="packages">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(packages).map(([key, pkg]) => (
                <Card key={key} className={`relative ${key === 'premium' ? 'border-green-500' : ''}`}>
                  {key === 'premium' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="capitalize">{key}</CardTitle>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {pkg.price}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{pkg.comments}</div>
                      <p className="text-sm text-gray-500">comentários</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Qualidade {pkg.quality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Entrega em {pkg.delivery}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Contas verificadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span>Engajamento real</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={key === 'premium' ? 'default' : 'outline'}
                      onClick={() => setCommentPackage(key)}
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}