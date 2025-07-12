import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Chrome, Clock, BarChart3, Shield, Star } from "lucide-react";

interface ChromeExtension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  version: string;
  downloadUrl: string;
  category: string;
  rating: number;
  downloads: number;
}

export default function ExtensoesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const extensions: ChromeExtension[] = [
    {
      id: "vendzz-pomodoro",
      name: "Vendzz Pomodoro Timer",
      description: "Timer Pomodoro profissional com design moderno da Vendzz. Sticky notes, estatísticas e relatórios de produtividade.",
      icon: <Clock className="w-8 h-8" />,
      features: [
        "Timer Pomodoro customizável (25/5 min)",
        "Sticky notes integradas",
        "Estatísticas de produtividade",
        "Relatórios semanais/mensais",
        "Design moderno Vendzz",
        "Notificações inteligentes",
        "Modo foco avançado",
        "Sincronização na nuvem"
      ],
      version: "1.0.0",
      downloadUrl: "/extensions/vendzz-pomodoro.zip",
      category: "productivity",
      rating: 4.9,
      downloads: 15420
    },
    {
      id: "facebook-ads-checker",
      name: "Facebook Ads Data Checker",
      description: "Verificador completo de dados do Facebook Ads Manager. Análise de campanhas, orçamentos e métricas em tempo real.",
      icon: <BarChart3 className="w-8 h-8" />,
      features: [
        "Análise completa de campanhas",
        "Verificação de orçamentos",
        "Métricas em tempo real",
        "Relatórios de performance",
        "Alertas de anomalias",
        "Exportação de dados",
        "Dashboard personalizado",
        "Integração com Vendzz"
      ],
      version: "1.0.0",
      downloadUrl: "/extensions/facebook-ads-checker.zip",
      category: "marketing",
      rating: 4.8,
      downloads: 12890
    }
  ];

  const categories = [
    { id: "all", name: "Todas", count: extensions.length },
    { id: "productivity", name: "Produtividade", count: extensions.filter(e => e.category === "productivity").length },
    { id: "marketing", name: "Marketing", count: extensions.filter(e => e.category === "marketing").length }
  ];

  const filteredExtensions = activeCategory === "all" 
    ? extensions 
    : extensions.filter(e => e.category === activeCategory);

  const handleDownload = (extension: ChromeExtension) => {
    // Aqui você pode implementar a lógica de download
    console.log(`Downloading ${extension.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Chrome className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Extensões Chrome
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extensões desenvolvidas pela Vendzz para aumentar sua produtividade e otimizar seu marketing digital
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExtensions.map((extension) => (
            <Card 
              key={extension.id} 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                      {extension.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        {extension.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          v{extension.version}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {extension.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {extension.downloads.toLocaleString()} downloads
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {extension.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Principais Funcionalidades:
                  </h4>
                  <ul className="grid grid-cols-1 gap-1">
                    {extension.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Shield className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleDownload(extension)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Chrome Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Instructions */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Como Instalar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Faça o download da extensão clicando no botão "Download"</li>
              <li>Abra o Chrome e digite <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">chrome://extensions/</code> na barra de endereços</li>
              <li>Ative o "Modo do desenvolvedor" no canto superior direito</li>
              <li>Clique em "Carregar sem compactação" e selecione a pasta extraída</li>
              <li>A extensão será instalada e aparecerá na barra de ferramentas</li>
            </ol>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Para melhor experiência, fixe as extensões na barra de ferramentas clicando no ícone de puzzle ao lado da barra de endereços.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}