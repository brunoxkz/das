import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, ExternalLink, Code, Globe, ShoppingCart } from 'lucide-react';

export default function CheckoutEmbedCodes() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast({
      title: "Código copiado!",
      description: `Código ${type} copiado para área de transferência`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const planId = "plan_1752718530673_uqs8yuk7e";
  const baseUrl = "https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev";

  const htmlEmbedCode = `<!-- Vendzz Checkout Embed - R$ 1,00 + R$ 29,90/mês -->
<div id="vendzz-checkout-embed" style="text-align: center; padding: 20px;">
  <button onclick="openVendzz()" style="
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    transition: all 0.3s ease;
  " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    💎 ATIVAR PLANO - R$ 1,00 → R$ 29,90/mês
  </button>
</div>

<script>
function openVendzz() {
  const checkoutData = {
    planId: "${planId}",
    customerName: prompt("Nome completo:") || "Cliente",
    customerEmail: prompt("Email:") || "cliente@email.com",
    customerPhone: prompt("Telefone:") || "11999999999",
    returnUrl: window.location.href,
    cancelUrl: window.location.href
  };

  fetch("${baseUrl}/api/public/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.open(data.checkoutUrl, "_blank");
    } else {
      alert("Erro ao criar checkout. Tente novamente.");
    }
  })
  .catch(error => {
    console.error("Erro:", error);
    alert("Erro de conexão. Tente novamente.");
  });
}
</script>`;

  const directLinkCode = `${baseUrl}/checkout/${planId}`;

  const iframeCode = `<!-- Vendzz Checkout iFrame -->
<iframe 
  src="${baseUrl}/checkout/${planId}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>`;

  const wordpressCode = `<?php
// Adicione este código no functions.php do seu tema WordPress

function vendzz_checkout_shortcode($atts) {
    $atts = shortcode_atts(array(
        'plan' => '${planId}',
        'text' => '💎 ATIVAR PLANO - R$ 1,00 → R$ 29,90/mês',
        'style' => 'green'
    ), $atts);

    return '<div style="text-align: center; margin: 20px 0;">
        <a href="${baseUrl}/checkout/' . $atts['plan'] . '" 
           target="_blank" 
           style="
               background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
               color: white;
               padding: 15px 30px;
               text-decoration: none;
               border-radius: 8px;
               font-weight: 600;
               display: inline-block;
               box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
               transition: all 0.3s ease;
           ">' . $atts['text'] . '</a>
    </div>';
}
add_shortcode('vendzz_checkout', 'vendzz_checkout_shortcode');

// Uso: [vendzz_checkout]
// Uso personalizado: [vendzz_checkout text="Comprar Agora" plan="outro_plano"]
?>`;

  const reactCode = `import React from 'react';

const VendzCheckout = ({ planId = "${planId}", customerData = {} }) => {
  const handleCheckout = async () => {
    try {
      const response = await fetch("${baseUrl}/api/public/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customerName: customerData.name || "Cliente",
          customerEmail: customerData.email || "cliente@email.com",
          customerPhone: customerData.phone || "11999999999",
          returnUrl: window.location.href,
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();
      if (data.success) {
        window.open(data.checkoutUrl, "_blank");
      } else {
        alert("Erro ao criar checkout");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <button 
        onClick={handleCheckout}
        style={{
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
        }}
      >
        💎 ATIVAR PLANO - R$ 1,00 → R$ 29,90/mês
      </button>
    </div>
  );
};

export default VendzCheckout;`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Códigos de Embed - Checkout Vendzz
          </h1>
          <p className="text-gray-300 text-lg">
            Integre nosso sistema de pagamento em qualquer site ou aplicação
          </p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <Badge className="bg-green-600">R$ 1,00 Ativação</Badge>
            <Badge className="bg-blue-600">R$ 29,90/mês</Badge>
            <Badge className="bg-purple-600">3 Dias Trial</Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="html" className="text-white">
              <Code className="w-4 h-4 mr-2" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="link" className="text-white">
              <ExternalLink className="w-4 h-4 mr-2" />
              Link Direto
            </TabsTrigger>
            <TabsTrigger value="iframe" className="text-white">
              <Globe className="w-4 h-4 mr-2" />
              iFrame
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              WordPress
            </TabsTrigger>
            <TabsTrigger value="react" className="text-white">
              <Code className="w-4 h-4 mr-2" />
              React
            </TabsTrigger>
          </TabsList>

          {/* HTML Embed */}
          <TabsContent value="html">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Código HTML Completo
                </CardTitle>
                <p className="text-gray-300">
                  Código HTML com JavaScript integrado - funciona em qualquer site
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-slate-600">
                    <code>{htmlEmbedCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(htmlEmbedCode, "HTML")}
                    className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {copiedCode === "HTML" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Link */}
          <TabsContent value="link">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Link Direto
                </CardTitle>
                <p className="text-gray-300">
                  URL direta para checkout - ideal para emails e redes sociais
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
                    <code className="text-green-400 break-all">{directLinkCode}</code>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(directLinkCode, "Link")}
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    {copiedCode === "Link" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => window.open(directLinkCode, "_blank")}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Testar Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* iFrame */}
          <TabsContent value="iframe">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Código iFrame
                </CardTitle>
                <p className="text-gray-300">
                  Incorpora o checkout diretamente na sua página
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-slate-600">
                    <code>{iframeCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(iframeCode, "iFrame")}
                    className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {copiedCode === "iFrame" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress */}
          <TabsContent value="wordpress">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  WordPress Plugin
                </CardTitle>
                <p className="text-gray-300">
                  Código PHP para WordPress com shortcode personalizado
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-slate-600">
                    <code>{wordpressCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(wordpressCode, "WordPress")}
                    className="absolute top-2 right-2 bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    {copiedCode === "WordPress" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <p className="text-orange-300 text-sm">
                    <strong>Como usar:</strong> Adicione o código no functions.php e use o shortcode{' '}
                    <code className="bg-orange-800 px-2 py-1 rounded">[vendzz_checkout]</code> em qualquer página
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* React */}
          <TabsContent value="react">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Componente React
                </CardTitle>
                <p className="text-gray-300">
                  Componente React pronto para uso em aplicações modernas
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-slate-600">
                    <code>{reactCode}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(reactCode, "React")}
                    className="absolute top-2 right-2 bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    {copiedCode === "React" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Sistema de Pagamento Vendzz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Badge className="bg-green-600 mb-2">Pagamento Único</Badge>
                  <p className="text-gray-300">R$ 1,00 taxa de ativação</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-blue-600 mb-2">Trial Gratuito</Badge>
                  <p className="text-gray-300">3 dias sem cobrança</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-purple-600 mb-2">Recorrente</Badge>
                  <p className="text-gray-300">R$ 29,90/mês após trial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}