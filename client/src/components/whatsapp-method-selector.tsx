import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Chrome, Smartphone, Globe, Settings, CheckCircle, AlertTriangle } from "lucide-react";

interface WhatsAppMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "inactive" | "recommended";
  pros: string[];
  cons: string[];
  setup: string;
}

const methods: WhatsAppMethod[] = [
  {
    id: "chrome-extension",
    name: "Extensão Chrome",
    description: "Automação através de extensão do Chrome no WhatsApp Web",
    icon: <Chrome className="h-8 w-8" />,
    status: "active",
    pros: [
      "Configuração rápida e simples",
      "Não requer aprovação do WhatsApp",
      "Funciona com qualquer conta pessoal",
      "Sem limitações de mensagens"
    ],
    cons: [
      "Requer Chrome sempre aberto",
      "Dependente do WhatsApp Web",
      "Menos estável que API oficial"
    ],
    setup: "1. Instale a extensão Chrome\n2. Faça login no WhatsApp Web\n3. Configure token de autenticação\n4. Sincronize funis"
  },
  {
    id: "official-api",
    name: "API Oficial WhatsApp",
    description: "Integração direta com a API oficial do WhatsApp Business",
    icon: <Smartphone className="h-8 w-8" />,
    status: "recommended",
    pros: [
      "Máxima estabilidade e confiabilidade",
      "Suporte oficial do WhatsApp",
      "Recursos avançados (templates, botões)",
      "Melhor performance"
    ],
    cons: [
      "Requer conta WhatsApp Business",
      "Processo de aprovação necessário",
      "Custos por mensagem",
      "Configuração mais complexa"
    ],
    setup: "1. Criar conta WhatsApp Business\n2. Configurar webhook\n3. Obter token de acesso\n4. Configurar templates"
  }
];

export default function WhatsAppMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState<string>("chrome-extension");
  const [isConfiguring, setIsConfiguring] = useState(false);

  const selectedMethodData = methods.find(m => m.id === selectedMethod);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleConfigureMethod = () => {
    setIsConfiguring(true);
    // Aqui seria implementada a lógica de configuração específica
    setTimeout(() => {
      setIsConfiguring(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Método WhatsApp
          </CardTitle>
          <CardDescription>
            Escolha o método de integração com o WhatsApp que melhor atende às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {methods.map((method) => (
              <div
                key={method.id}
                className={`relative p-6 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">{method.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      method.status === "active" ? "default" :
                      method.status === "recommended" ? "secondary" : "outline"
                    }
                  >
                    {method.status === "active" ? "Ativo" :
                     method.status === "recommended" ? "Recomendado" : "Inativo"}
                  </Badge>
                </div>

                {selectedMethod === method.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMethodData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedMethodData.icon}
              {selectedMethodData.name}
            </CardTitle>
            <CardDescription>
              Detalhes e configuração do método selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">✅ Vantagens</h4>
                <ul className="space-y-2">
                  {selectedMethodData.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-3">⚠️ Limitações</h4>
                <ul className="space-y-2">
                  {selectedMethodData.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">🔧 Passos de Configuração</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{selectedMethodData.setup}</pre>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleConfigureMethod}
                disabled={isConfiguring}
                className="flex items-center gap-2"
              >
                {isConfiguring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Configurar {selectedMethodData.name}
                  </>
                )}
              </Button>

              {selectedMethod === "chrome-extension" && (
                <Button variant="outline" asChild>
                  <a href="/chrome-extension" target="_blank" rel="noopener noreferrer">
                    <Chrome className="h-4 w-4 mr-2" />
                    Baixar Extensão
                  </a>
                </Button>
              )}
            </div>

            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                {selectedMethod === "chrome-extension" ? (
                  <>
                    <strong>Método Ativo:</strong> Extensão Chrome está configurada e funcionando. 
                    Certifique-se de que o WhatsApp Web está aberto no Chrome para envio de mensagens.
                  </>
                ) : (
                  <>
                    <strong>Método Recomendado:</strong> A API oficial oferece maior estabilidade 
                    e recursos avançados para empresas que precisam de alta confiabilidade.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}