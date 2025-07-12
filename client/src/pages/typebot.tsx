import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bot, Plus, Edit3, Play, Pause, ArrowRight, Settings, Trash2, Copy, MessageSquare, BarChart3, PlusCircle, Target, Zap, Brain, Layers, Eye, Globe, MousePointer, GitBranch, Clock, Type, Mail, Phone, Hash, Calendar, Link, Upload, Star, List, Image, Video, Volume2, Code, Send, FileSpreadsheet, BarChart, CreditCard, Cog, SkipForward, Shuffle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TypebotProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  source_quiz_id?: string;
  typebot_data: string;
  theme: string;
  settings: string;
  is_published: number;
  public_id: string;
  total_views: number;
  total_conversations: number;
  total_completions: number;
  created_at: number;
  updated_at: number;
}

interface ChatbotBlock {
  id: string;
  type: 'text' | 'input' | 'button' | 'condition' | 'webhook' | 'start' | 'image' | 'video' | 'audio' | 'embed' | 'typing' | 'email' | 'phone' | 'number' | 'url' | 'date' | 'rating' | 'file' | 'picture_choice' | 'set_variable' | 'code' | 'redirect' | 'wait' | 'jump' | 'send_email' | 'google_sheets' | 'openai' | 'google_analytics' | 'payment';
  title: string;
  content: any;
  position: { x: number; y: number };
  connections: string[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
}

// Templates para diferentes plataformas
const TEMPLATES = {
  instagram: {
    name: "Instagram Stories",
    description: "Template otimizado para Instagram Stories e DM",
    icon: "📸",
    blocks: [
      {
        id: "start",
        type: "start" as const,
        title: "Início",
        content: { message: "Olá! 👋 Bem-vindo ao nosso Instagram!" },
        position: { x: 100, y: 100 },
        connections: ["welcome"]
      },
      {
        id: "welcome",
        type: "text" as const,
        title: "Boas-vindas",
        content: { message: "Que bom te ver aqui! 🎉\n\nEu sou seu assistente virtual e vou te ajudar a descobrir nossos produtos incríveis!" },
        position: { x: 100, y: 250 },
        connections: ["interest"]
      },
      {
        id: "interest",
        type: "button" as const,
        title: "Interesse",
        content: { 
          message: "O que você está procurando hoje?",
          buttons: [
            { text: "👗 Roupas", value: "roupas" },
            { text: "👟 Calçados", value: "calcados" },
            { text: "💄 Beleza", value: "beleza" }
          ]
        },
        position: { x: 100, y: 400 },
        connections: ["contact"]
      },
      {
        id: "contact",
        type: "input" as const,
        title: "Contato",
        content: { 
          message: "Perfeito! Para te enviar ofertas exclusivas, me conta seu melhor WhatsApp:",
          inputType: "phone",
          placeholder: "(11) 99999-9999"
        },
        position: { x: 100, y: 550 },
        connections: ["thanks"]
      },
      {
        id: "thanks",
        type: "text" as const,
        title: "Agradecimento",
        content: { message: "Obrigado! 🙏\n\nEm breve você receberá ofertas incríveis no seu WhatsApp! 📱✨" },
        position: { x: 100, y: 700 },
        connections: []
      }
    ]
  },
  whatsapp: {
    name: "WhatsApp Web",
    description: "Template para automação no WhatsApp Web",
    icon: "💬",
    blocks: [
      {
        id: "start",
        type: "start" as const,
        title: "Início",
        content: { message: "Olá! Bem-vindo ao nosso atendimento!" },
        position: { x: 100, y: 100 },
        connections: ["menu"]
      },
      {
        id: "menu",
        type: "button" as const,
        title: "Menu Principal",
        content: { 
          message: "Como posso te ajudar hoje? 🤔",
          buttons: [
            { text: "🛒 Ver Produtos", value: "produtos" },
            { text: "📞 Falar com Atendente", value: "atendente" },
            { text: "📋 Fazer Pedido", value: "pedido" },
            { text: "❓ Dúvidas", value: "duvidas" }
          ]
        },
        position: { x: 100, y: 250 },
        connections: ["info"]
      },
      {
        id: "info",
        type: "input" as const,
        title: "Informações",
        content: { 
          message: "Para personalizar melhor seu atendimento, me conta seu nome:",
          inputType: "text",
          placeholder: "Digite seu nome"
        },
        position: { x: 100, y: 400 },
        connections: ["email"]
      },
      {
        id: "email",
        type: "input" as const,
        title: "E-mail",
        content: { 
          message: "Ótimo! Agora me passa seu e-mail para enviarmos novidades:",
          inputType: "email",
          placeholder: "seu@email.com"
        },
        position: { x: 100, y: 550 },
        connections: ["final"]
      },
      {
        id: "final",
        type: "text" as const,
        title: "Finalização",
        content: { message: "Perfeito! 🎉\n\nEm breve um atendente entrará em contato com você. Obrigado pela preferência!" },
        position: { x: 100, y: 700 },
        connections: []
      }
    ]
  },
  messenger: {
    name: "Messenger",
    description: "Template para Facebook Messenger",
    icon: "💙",
    blocks: [
      {
        id: "start",
        type: "start" as const,
        title: "Início",
        content: { message: "Olá! 👋 Bem-vindo ao nosso Messenger!" },
        position: { x: 100, y: 100 },
        connections: ["greeting"]
      },
      {
        id: "greeting",
        type: "text" as const,
        title: "Saudação",
        content: { message: "Que bom te ver aqui! 😊\n\nSou seu assistente virtual e vou te ajudar com tudo que precisar!" },
        position: { x: 100, y: 250 },
        connections: ["service"]
      },
      {
        id: "service",
        type: "button" as const,
        title: "Serviços",
        content: { 
          message: "Qual serviço você precisa?",
          buttons: [
            { text: "🛍️ Comprar", value: "comprar" },
            { text: "📦 Rastrear Pedido", value: "rastrear" },
            { text: "🔄 Trocar/Devolver", value: "trocar" },
            { text: "💬 Suporte", value: "suporte" }
          ]
        },
        position: { x: 100, y: 400 },
        connections: ["lead"]
      },
      {
        id: "lead",
        type: "input" as const,
        title: "Lead",
        content: { 
          message: "Para te atender melhor, preciso de algumas informações.\n\nQual seu nome completo?",
          inputType: "text",
          placeholder: "Nome completo"
        },
        position: { x: 100, y: 550 },
        connections: ["phone"]
      },
      {
        id: "phone",
        type: "input" as const,
        title: "Telefone",
        content: { 
          message: "Agora me passa seu telefone para contato:",
          inputType: "phone",
          placeholder: "(11) 99999-9999"
        },
        position: { x: 100, y: 700 },
        connections: ["completion"]
      },
      {
        id: "completion",
        type: "text" as const,
        title: "Finalização",
        content: { message: "Excelente! 🎉\n\nTodas as informações foram registradas. Em breve retornaremos o contato!" },
        position: { x: 100, y: 850 },
        connections: []
      }
    ]
  }
};

export default function TypebotPage() {
  const [selectedProject, setSelectedProject] = useState<TypebotProject | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'list' | 'editor'>('list');
  const [chatbotBlocks, setChatbotBlocks] = useState<ChatbotBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ChatbotBlock | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<ChatbotBlock | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Buscar projetos TypeBot
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["/api/typebot/projects"],
  });

  // Buscar quizzes para conversão
  const quizzesQuery = useQuery({
    queryKey: ["/api/quizzes"],
  });
  
  const { data: quizzes = [] } = quizzesQuery;

  // Mutation para criar projeto
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; template?: string }) => {
      let typebotData = {
        version: "6.0",
        name: data.name,
        groups: [],
        variables: [],
        edges: []
      };

      // Se foi selecionado um template, usar os blocos do template
      if (data.template && TEMPLATES[data.template as keyof typeof TEMPLATES]) {
        const template = TEMPLATES[data.template as keyof typeof TEMPLATES];
        typebotData = {
          version: "6.0",
          name: data.name,
          groups: template.blocks.map(block => ({
            id: block.id,
            title: block.title,
            blocks: [{
              id: block.id,
              type: block.type,
              content: block.content
            }]
          })),
          variables: [],
          edges: template.blocks.flatMap(block => 
            block.connections.map(connection => ({
              id: `${block.id}-${connection}`,
              from: { groupId: block.id },
              to: { groupId: connection }
            }))
          )
        };
      }

      return apiRequest("/api/typebot/projects", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          typebotData
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
      setCreateDialogOpen(false);
      setTemplateDialogOpen(false);
    },
  });

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/typebot/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
    },
  });

  // Mutation para deletar projeto
  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest(`/api/typebot/projects/${projectId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
      setSelectedProject(null);
      setEditorMode('list');
    },
  });

  // Mutation para publicar projeto
  const publishProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest(`/api/typebot/projects/${projectId}/publish`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
      // Mostrar notificação de sucesso
      if (data.publicUrl) {
        navigator.clipboard.writeText(window.location.origin + data.publicUrl);
      }
    },
  });

  // Mutation para despublicar projeto
  const unpublishProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest(`/api/typebot/projects/${projectId}/unpublish`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
    },
  });

  // Inicializar blocks do chatbot quando selecionar um projeto
  const initializeChatbotBlocks = (project: TypebotProject) => {
    try {
      const typebotData = JSON.parse(project.typebot_data);
      if (typebotData.groups && typebotData.groups.length > 0) {
        // Converter grupos TypeBot para nossos blocks
        const blocks: ChatbotBlock[] = typebotData.groups.map((group: any, index: number) => ({
          id: group.id || `block_${index}`,
          type: group.blocks?.[0]?.type || 'text',
          title: group.title || `Bloco ${index + 1}`,
          content: group.blocks?.[0]?.content || {},
          position: { x: index * 200, y: 100 },
          connections: []
        }));
        setChatbotBlocks(blocks);
      } else {
        // Criar bloco inicial se não houver nenhum
        setChatbotBlocks([{
          id: 'start',
          type: 'start',
          title: 'Início',
          content: { text: 'Bem-vindo ao chatbot!' },
          position: { x: 100, y: 100 },
          connections: []
        }]);
      }
    } catch (error) {
      console.error('Erro ao inicializar blocks:', error);
      setChatbotBlocks([{
        id: 'start',
        type: 'start',
        title: 'Início',
        content: { text: 'Bem-vindo ao chatbot!' },
        position: { x: 100, y: 100 },
        connections: []
      }]);
    }
  };

  // Funções para manipular blocks
  const addNewBlock = (type: string) => {
    const getDefaultContent = (blockType: string) => {
      switch (blockType) {
        // Bubbles
        case 'text':
          return { message: 'Digite sua mensagem aqui' };
        case 'image':
          return { url: '', caption: '' };
        case 'video':
          return { url: '', caption: '' };
        case 'audio':
          return { url: '' };
        case 'embed':
          return { url: '', height: 400 };
        case 'typing':
          return { duration: 2 };
        
        // Inputs
        case 'input':
          return { message: 'Digite sua pergunta', placeholder: 'Sua resposta...' };
        case 'email':
          return { message: 'Digite seu email', placeholder: 'seu@email.com' };
        case 'phone':
          return { message: 'Digite seu telefone', placeholder: '(11) 99999-9999' };
        case 'number':
          return { message: 'Digite um número', placeholder: '123', min: 0, max: 999 };
        case 'url':
          return { message: 'Digite uma URL', placeholder: 'https://exemplo.com' };
        case 'date':
          return { message: 'Selecione uma data', format: 'dd/mm/yyyy' };
        case 'rating':
          return { message: 'Avalie de 1 a 5', max: 5, buttonType: 'stars' };
        case 'file':
          return { message: 'Envie um arquivo', accept: 'image/*', maxSize: '10MB' };
        
        // Choices
        case 'button':
          return { message: 'Escolha uma opção', buttons: [{ text: 'Opção 1', value: 'opt1' }, { text: 'Opção 2', value: 'opt2' }] };
        case 'picture_choice':
          return { message: 'Escolha uma imagem', options: [{ image: '', title: 'Opção 1' }, { image: '', title: 'Opção 2' }] };
        
        // Logic
        case 'condition':
          return { condition: 'variavel = valor', ifTrue: [], ifFalse: [] };
        case 'set_variable':
          return { variable: 'minha_variavel', value: '{{resposta}}' };
        case 'code':
          return { code: 'console.log("Olá mundo!");' };
        case 'redirect':
          return { url: 'https://exemplo.com', newTab: true };
        case 'wait':
          return { duration: 1000 };
        case 'jump':
          return { target: 'block_id' };
        
        // Integrations
        case 'webhook':
          return { url: 'https://api.exemplo.com/webhook', method: 'POST', headers: {}, body: {} };
        case 'send_email':
          return { recipient: '{{email}}', subject: 'Assunto', body: 'Mensagem' };
        case 'google_sheets':
          return { spreadsheetId: '', range: 'A1' };
        case 'openai':
          return { model: 'gpt-3.5-turbo', prompt: 'Você é um assistente útil' };
        case 'google_analytics':
          return { eventName: 'custom_event', parameters: {} };
        case 'payment':
          return { amount: 1000, currency: 'BRL', description: 'Pagamento' };
        
        default:
          return { message: 'Conteúdo do bloco' };
      }
    };

    const getBlockTitle = (blockType: string) => {
      const titles: { [key: string]: string } = {
        text: 'Texto',
        image: 'Imagem',
        video: 'Vídeo',
        audio: 'Áudio',
        embed: 'Embed',
        typing: 'Digitando',
        input: 'Entrada de Texto',
        email: 'Email',
        phone: 'Telefone',
        number: 'Número',
        url: 'URL',
        date: 'Data',
        rating: 'Avaliação',
        file: 'Arquivo',
        button: 'Botões',
        picture_choice: 'Escolha de Imagem',
        condition: 'Condição',
        set_variable: 'Definir Variável',
        code: 'Código',
        redirect: 'Redirecionamento',
        wait: 'Aguardar',
        jump: 'Pular',
        webhook: 'Webhook',
        send_email: 'Enviar Email',
        google_sheets: 'Google Sheets',
        openai: 'OpenAI',
        google_analytics: 'Google Analytics',
        payment: 'Pagamento'
      };
      return titles[blockType] || blockType;
    };

    const newBlock: ChatbotBlock = {
      id: `block_${Date.now()}`,
      type: type as ChatbotBlock['type'],
      title: getBlockTitle(type),
      content: getDefaultContent(type),
      position: { x: chatbotBlocks.length * 200 + 100, y: 100 },
      connections: []
    };
    setChatbotBlocks([...chatbotBlocks, newBlock]);
  };

  const updateBlock = (blockId: string, updates: Partial<ChatbotBlock>) => {
    setChatbotBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId: string) => {
    setChatbotBlocks(blocks => blocks.filter(block => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const saveProject = async () => {
    if (!selectedProject) return;

    const typebotData = {
      version: "6.0",
      name: selectedProject.name,
      groups: chatbotBlocks.map(block => ({
        id: block.id,
        title: block.title,
        blocks: [{
          id: block.id,
          type: block.type,
          content: block.content
        }]
      })),
      variables: [],
      edges: chatbotBlocks.flatMap(block => 
        block.connections.map(connection => ({
          id: `${block.id}-${connection}`,
          from: { groupId: block.id },
          to: { groupId: connection }
        }))
      )
    };

    try {
      await updateProjectMutation.mutateAsync({
        id: selectedProject.id,
        typebot_data: JSON.stringify(typebotData)
      });
      alert('Projeto salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto');
    }
  };

  // Carregar template
  const loadTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    if (template) {
      setChatbotBlocks(template.blocks);
      setSelectedBlock(null);
    }
  };

  // Criar projeto a partir de template
  const createFromTemplate = (templateKey: string, name: string, description?: string) => {
    createProjectMutation.mutate({
      name,
      description,
      template: templateKey
    });
  };

  // Converter quiz para TypeBot
  const convertQuizToTypebot = async (quiz: Quiz) => {
    try {
      const response = await fetch(`/api/quiz-to-typebot/${quiz.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao converter quiz');
      
      const convertedData = await response.json();
      
      // Criar projeto TypeBot com dados convertidos
      createProjectMutation.mutate({
        name: `Bot - ${quiz.title}`,
        description: `Convertido do quiz: ${quiz.title}`,
        source_quiz_id: quiz.id,
        typebot_data: JSON.stringify(convertedData)
      });
    } catch (error) {
      console.error('Erro na conversão:', error);
      alert('Erro ao converter quiz para TypeBot');
    }
  };

  const createForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleCreateProject = (data: { name: string; description?: string }) => {
    createProjectMutation.mutate(data);
  };

  const handleDelete = (projectId: string) => {
    if (confirm("Tem certeza que deseja deletar este projeto TypeBot?")) {
      deleteMutation.mutate(projectId);
    }
  };

  const openEditor = (project: TypebotProject) => {
    setSelectedProject(project);
    initializeChatbotBlocks(project);
    setEditorMode('editor');
  };

  const copyPublicUrl = (publicId: string) => {
    const url = `${window.location.origin}/typebot/${publicId}`;
    navigator.clipboard.writeText(url);
    alert("URL copiada para a área de transferência!");
  };

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-green-500 animate-spin" />
          <p className="text-muted-foreground">Carregando projetos TypeBot...</p>
        </div>
      </div>
    );
  }

  // Modo Lista - Gerenciamento de Projetos
  if (editorMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              🤖 TypeBot Auto-Hospedado
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie e gerencie chatbots inteligentes integrados com seus quizzes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setTemplateDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Usar Template
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Chatbot Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Chatbot Personalizado</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateProject)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Chatbot</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Chatbot de Vendas" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descreva o objetivo do chatbot..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createProjectMutation.isPending}>
                      {createProjectMutation.isPending ? "Criando..." : "Criar Chatbot"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Dialog para Templates */}
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Escolha um Template</DialogTitle>
                  <p className="text-muted-foreground">
                    Selecione um template otimizado para sua plataforma
                  </p>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(TEMPLATES).map(([key, template]) => (
                    <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                      const name = prompt("Nome do seu chatbot:", template.name);
                      if (name) {
                        const description = prompt("Descrição (opcional):", template.description);
                        createFromTemplate(key, name, description || "");
                      }
                    }}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{template.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Recursos inclusos:</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Fluxo de conversação otimizado</li>
                            <li>• Captura de leads automática</li>
                            <li>• Mensagens personalizadas</li>
                            <li>• {template.blocks.length} blocos pré-configurados</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Chatbots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((sum: number, p: TypebotProject) => sum + p.total_conversations, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((sum: number, p: TypebotProject) => sum + p.total_views, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.length > 0 ? (
                  (projects.reduce((sum: number, p: TypebotProject) => sum + p.total_completions, 0) /
                   projects.reduce((sum: number, p: TypebotProject) => sum + p.total_conversations, 0) * 100 || 0).toFixed(1)
                ) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversão de Quizzes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="h-6 w-6 mr-3 text-green-500" />
            Converter Quiz para TypeBot
          </h2>
          <p className="text-muted-foreground mb-4">
            Transforme suas perguntas de múltipla escolha em chatbots interativos de forma automática
          </p>
          {quizzesQuery.isLoading ? (
            <div className="text-center py-8">Carregando quizzes...</div>
          ) : quizzesQuery.data && quizzesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzesQuery.data.map((quiz: Quiz) => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                      {quiz.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {quiz.description || 'Quiz com perguntas de múltipla escolha'}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => convertQuizToTypebot(quiz)}
                      disabled={createProjectMutation.isPending}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {createProjectMutation.isPending ? "Convertendo..." : "Converter para Bot"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum quiz encontrado. Crie um quiz primeiro para converter em TypeBot.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Projetos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Seus Chatbots</h2>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum chatbot criado ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro chatbot para começar a interagir com seus leads
                </p>
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Chatbot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: TypebotProject) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Bot className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={project.is_published ? "default" : "secondary"}>
                        {project.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{project.total_views}</div>
                          <div className="text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{project.total_conversations}</div>
                          <div className="text-muted-foreground">Conversas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{project.total_completions}</div>
                          <div className="text-muted-foreground">Completas</div>
                        </div>
                      </div>

                      <Separator />

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openEditor(project)}
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        {project.is_published ? (
                          <div className="flex space-x-1 flex-1">
                            <Button
                              onClick={() => copyPublicUrl(project.public_id)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar URL
                            </Button>
                            <Button
                              onClick={() => unpublishProjectMutation.mutate(project.id)}
                              size="sm"
                              variant="outline"
                              className="text-orange-600 hover:text-orange-700"
                              disabled={unpublishProjectMutation.isPending}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => publishProjectMutation.mutate(project.id)}
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            disabled={publishProjectMutation.isPending}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            {publishProjectMutation.isPending ? "Publicando..." : "Publicar"}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(project.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modo Editor - Interface Visual de Edição
  return (
    <div className="h-screen flex flex-col">
      {/* Header do Editor */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setEditorMode('list')}
              variant="outline"
              size="sm"
            >
              ← Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold">{selectedProject?.name}</h1>
              <p className="text-sm text-muted-foreground">Editor de Chatbot</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Editar" : "Visualizar"}
            </Button>
            <Button
              onClick={saveProject}
              disabled={updateProjectMutation.isPending}
              className="bg-green-500 hover:bg-green-600"
            >
              {updateProjectMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar com Elementos */}
        {!previewMode && (
          <div className="w-80 border-r bg-background p-4 overflow-y-auto">
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Elementos TypeBot</h3>
              
              {/* Bubbles */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">💬 Bubbles</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addNewBlock('text')} variant="outline" size="sm" className="h-20 flex-col">
                    <MessageSquare className="h-4 w-4 mb-1" />
                    <span className="text-xs">Texto</span>
                  </Button>
                  <Button onClick={() => addNewBlock('image')} variant="outline" size="sm" className="h-20 flex-col">
                    <Image className="h-4 w-4 mb-1" />
                    <span className="text-xs">Imagem</span>
                  </Button>
                  <Button onClick={() => addNewBlock('video')} variant="outline" size="sm" className="h-20 flex-col">
                    <Video className="h-4 w-4 mb-1" />
                    <span className="text-xs">Vídeo</span>
                  </Button>
                  <Button onClick={() => addNewBlock('audio')} variant="outline" size="sm" className="h-20 flex-col">
                    <Volume2 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Áudio</span>
                  </Button>
                  <Button onClick={() => addNewBlock('embed')} variant="outline" size="sm" className="h-20 flex-col">
                    <Code className="h-4 w-4 mb-1" />
                    <span className="text-xs">Embed</span>
                  </Button>
                  <Button onClick={() => addNewBlock('typing')} variant="outline" size="sm" className="h-20 flex-col">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs">Digitando</span>
                  </Button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">📝 Inputs</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addNewBlock('input')} variant="outline" size="sm" className="h-20 flex-col">
                    <MessageSquare className="h-4 w-4 mb-1" />
                    <span className="text-xs">Texto</span>
                  </Button>
                  <Button onClick={() => addNewBlock('email')} variant="outline" size="sm" className="h-20 flex-col">
                    <Mail className="h-4 w-4 mb-1" />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button onClick={() => addNewBlock('phone')} variant="outline" size="sm" className="h-20 flex-col">
                    <Phone className="h-4 w-4 mb-1" />
                    <span className="text-xs">Telefone</span>
                  </Button>
                  <Button onClick={() => addNewBlock('number')} variant="outline" size="sm" className="h-20 flex-col">
                    <Hash className="h-4 w-4 mb-1" />
                    <span className="text-xs">Número</span>
                  </Button>
                  <Button onClick={() => addNewBlock('url')} variant="outline" size="sm" className="h-20 flex-col">
                    <Link className="h-4 w-4 mb-1" />
                    <span className="text-xs">URL</span>
                  </Button>
                  <Button onClick={() => addNewBlock('date')} variant="outline" size="sm" className="h-20 flex-col">
                    <Calendar className="h-4 w-4 mb-1" />
                    <span className="text-xs">Data</span>
                  </Button>
                  <Button onClick={() => addNewBlock('rating')} variant="outline" size="sm" className="h-20 flex-col">
                    <Star className="h-4 w-4 mb-1" />
                    <span className="text-xs">Avaliação</span>
                  </Button>
                  <Button onClick={() => addNewBlock('file')} variant="outline" size="sm" className="h-20 flex-col">
                    <Upload className="h-4 w-4 mb-1" />
                    <span className="text-xs">Arquivo</span>
                  </Button>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">🎯 Escolhas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addNewBlock('button')} variant="outline" size="sm" className="h-20 flex-col">
                    <MousePointer className="h-4 w-4 mb-1" />
                    <span className="text-xs">Botões</span>
                  </Button>
                  <Button onClick={() => addNewBlock('picture_choice')} variant="outline" size="sm" className="h-20 flex-col">
                    <Image className="h-4 w-4 mb-1" />
                    <span className="text-xs">Imagem</span>
                  </Button>
                </div>
              </div>

              {/* Logic */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">🧠 Lógica</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addNewBlock('condition')} variant="outline" size="sm" className="h-20 flex-col">
                    <GitBranch className="h-4 w-4 mb-1" />
                    <span className="text-xs">Condição</span>
                  </Button>
                  <Button onClick={() => addNewBlock('set_variable')} variant="outline" size="sm" className="h-20 flex-col">
                    <Settings className="h-4 w-4 mb-1" />
                    <span className="text-xs">Variável</span>
                  </Button>
                  <Button onClick={() => addNewBlock('code')} variant="outline" size="sm" className="h-20 flex-col">
                    <Code className="h-4 w-4 mb-1" />
                    <span className="text-xs">Código</span>
                  </Button>
                  <Button onClick={() => addNewBlock('redirect')} variant="outline" size="sm" className="h-20 flex-col">
                    <ArrowRight className="h-4 w-4 mb-1" />
                    <span className="text-xs">Redirecionar</span>
                  </Button>
                  <Button onClick={() => addNewBlock('wait')} variant="outline" size="sm" className="h-20 flex-col">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs">Aguardar</span>
                  </Button>
                  <Button onClick={() => addNewBlock('jump')} variant="outline" size="sm" className="h-20 flex-col">
                    <SkipForward className="h-4 w-4 mb-1" />
                    <span className="text-xs">Pular</span>
                  </Button>
                </div>
              </div>

              {/* Integrations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">🔗 Integrações</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => addNewBlock('webhook')} variant="outline" size="sm" className="h-20 flex-col">
                    <Zap className="h-4 w-4 mb-1" />
                    <span className="text-xs">Webhook</span>
                  </Button>
                  <Button onClick={() => addNewBlock('send_email')} variant="outline" size="sm" className="h-20 flex-col">
                    <Send className="h-4 w-4 mb-1" />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button onClick={() => addNewBlock('google_sheets')} variant="outline" size="sm" className="h-20 flex-col">
                    <FileSpreadsheet className="h-4 w-4 mb-1" />
                    <span className="text-xs">Sheets</span>
                  </Button>
                  <Button onClick={() => addNewBlock('openai')} variant="outline" size="sm" className="h-20 flex-col">
                    <Bot className="h-4 w-4 mb-1" />
                    <span className="text-xs">OpenAI</span>
                  </Button>
                  <Button onClick={() => addNewBlock('google_analytics')} variant="outline" size="sm" className="h-20 flex-col">
                    <BarChart className="h-4 w-4 mb-1" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                  <Button onClick={() => addNewBlock('payment')} variant="outline" size="sm" className="h-20 flex-col">
                    <CreditCard className="h-4 w-4 mb-1" />
                    <span className="text-xs">Pagamento</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Área Principal */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 bg-gray-50 relative overflow-auto">
            {previewMode ? (
              /* Modo Preview */
              <div className="max-w-md mx-auto bg-white h-full shadow-lg">
                <div className="p-4 border-b bg-green-500 text-white">
                  <h3 className="font-medium">Preview do Chatbot</h3>
                </div>
                <div className="p-4 space-y-4">
                  {chatbotBlocks.map((block, index) => (
                    <div key={block.id} className="space-y-2">
                      {/* Bubble Elements */}
                      {block.type === 'text' && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p>{block.content?.message || block.content?.text || 'Mensagem de texto'}</p>
                        </div>
                      )}
                      {block.type === 'image' && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="bg-gray-200 h-24 rounded flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                          {block.content?.caption && <p className="text-sm mt-2">{block.content.caption}</p>}
                        </div>
                      )}
                      {block.type === 'video' && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="bg-gray-200 h-24 rounded flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                          {block.content?.caption && <p className="text-sm mt-2">{block.content.caption}</p>}
                        </div>
                      )}
                      {block.type === 'audio' && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="bg-gray-200 h-12 rounded flex items-center justify-center">
                            <Volume2 className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                      )}
                      {block.type === 'embed' && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="bg-gray-200 h-24 rounded flex items-center justify-center">
                            <Code className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Código incorporado</p>
                        </div>
                      )}
                      {block.type === 'typing' && (
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">Digitando...</span>
                        </div>
                      )}
                      
                      {/* Input Elements */}
                      {(block.type === 'input' || block.type === 'email' || block.type === 'phone' || block.type === 'number' || block.type === 'url') && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Pergunta'}</p>
                          </div>
                          <div className="bg-white border rounded-lg p-2">
                            <input
                              type={block.type === 'email' ? 'email' : block.type === 'phone' ? 'tel' : block.type === 'number' ? 'number' : block.type === 'url' ? 'url' : 'text'}
                              placeholder={block.content?.placeholder || `Digite seu ${block.type}`}
                              className="w-full border-none outline-none"
                              disabled
                            />
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'date' && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Selecione uma data'}</p>
                          </div>
                          <div className="bg-white border rounded-lg p-2">
                            <input type="date" className="w-full border-none outline-none" disabled />
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'rating' && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Avalie de 1 a 5'}</p>
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className="h-6 w-6 text-yellow-400 cursor-pointer" />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'file' && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Envie um arquivo'}</p>
                          </div>
                          <div className="bg-white border-2 border-dashed rounded-lg p-4 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-600 mt-2">Clique para enviar</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Choice Elements */}
                      {block.type === 'button' && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Escolha uma opção'}</p>
                          </div>
                          <div className="space-y-2">
                            {(block.content?.buttons || [{ text: 'Opção 1' }, { text: 'Opção 2' }]).map((button, idx) => (
                              <Button key={idx} variant="outline" className="w-full">
                                {button.text}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'picture_choice' && (
                        <div className="space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p>{block.content?.message || 'Escolha uma imagem'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map(i => (
                              <div key={i} className="bg-white border rounded-lg p-2 text-center cursor-pointer">
                                <div className="bg-gray-200 h-16 rounded flex items-center justify-center">
                                  <Image className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm mt-1">Opção {i}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Logic Elements */}
                      {block.type === 'condition' && (
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-center">
                            <GitBranch className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">Condição: {block.content?.condition || 'Se... então...'}</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'set_variable' && (
                        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                          <div className="flex items-center">
                            <Settings className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium">Definir variável: {block.content?.variable || 'variavel'}</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'code' && (
                        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
                          <div className="flex items-center">
                            <Code className="h-5 w-5 text-gray-600 mr-2" />
                            <span className="text-sm font-medium">Executar código JavaScript</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'redirect' && (
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                          <div className="flex items-center">
                            <ArrowRight className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium">Redirecionar para: {block.content?.url || 'https://exemplo.com'}</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'wait' && (
                        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium">Aguardar {block.content?.duration || 1} segundo(s)</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'jump' && (
                        <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400">
                          <div className="flex items-center">
                            <SkipForward className="h-5 w-5 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium">Pular para: {block.content?.target || 'próximo bloco'}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Integration Elements */}
                      {block.type === 'webhook' && (
                        <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium">Webhook: {block.content?.url || 'https://api.exemplo.com'}</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'send_email' && (
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-center">
                            <Send className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">Enviar email para: {block.content?.recipient || 'destinatário'}</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'google_sheets' && (
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium">Salvar no Google Sheets</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'openai' && (
                        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                          <div className="flex items-center">
                            <Bot className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium">Integração OpenAI</span>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'payment' && (
                        <div className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                            <span className="text-sm font-medium">Pagamento: R$ {block.content?.amount || '0,00'}</span>
                          </div>
                        </div>
                      )}
                      {block.type === 'input' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{block.content?.question || 'Pergunta'}</p>
                          <Input placeholder={block.content?.placeholder || 'Digite sua resposta...'} />
                        </div>
                      )}
                      {block.type === 'button' && (
                        <Button className="w-full">
                          {block.content?.text || 'Botão'}
                        </Button>
                      )}
                      {index < chatbotBlocks.length - 1 && (
                        <div className="flex justify-center">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Modo Edição */
              <div className="p-8 space-y-6">
                {chatbotBlocks.map((block, index) => (
                  <div key={block.id} className="relative group">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedBlock?.id === block.id 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedBlock(block)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {/* Bubble Elements */}
                            {block.type === 'text' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                            {block.type === 'image' && <Image className="h-4 w-4 text-green-500" />}
                            {block.type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                            {block.type === 'audio' && <Volume2 className="h-4 w-4 text-orange-500" />}
                            {block.type === 'embed' && <Code className="h-4 w-4 text-gray-500" />}
                            {block.type === 'typing' && <Clock className="h-4 w-4 text-yellow-500" />}
                            
                            {/* Input Elements */}
                            {block.type === 'input' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                            {block.type === 'email' && <Mail className="h-4 w-4 text-red-500" />}
                            {block.type === 'phone' && <Phone className="h-4 w-4 text-green-500" />}
                            {block.type === 'number' && <Hash className="h-4 w-4 text-blue-500" />}
                            {block.type === 'url' && <Link className="h-4 w-4 text-purple-500" />}
                            {block.type === 'date' && <Calendar className="h-4 w-4 text-orange-500" />}
                            {block.type === 'rating' && <Star className="h-4 w-4 text-yellow-500" />}
                            {block.type === 'file' && <Upload className="h-4 w-4 text-gray-500" />}
                            
                            {/* Choice Elements */}
                            {block.type === 'button' && <MousePointer className="h-4 w-4 text-purple-500" />}
                            {block.type === 'picture_choice' && <Image className="h-4 w-4 text-indigo-500" />}
                            
                            {/* Logic Elements */}
                            {block.type === 'condition' && <GitBranch className="h-4 w-4 text-blue-500" />}
                            {block.type === 'set_variable' && <Settings className="h-4 w-4 text-purple-500" />}
                            {block.type === 'code' && <Code className="h-4 w-4 text-gray-500" />}
                            {block.type === 'redirect' && <ArrowRight className="h-4 w-4 text-green-500" />}
                            {block.type === 'wait' && <Clock className="h-4 w-4 text-yellow-500" />}
                            {block.type === 'jump' && <SkipForward className="h-4 w-4 text-indigo-500" />}
                            
                            {/* Integration Elements */}
                            {block.type === 'webhook' && <Zap className="h-4 w-4 text-red-500" />}
                            {block.type === 'send_email' && <Send className="h-4 w-4 text-blue-500" />}
                            {block.type === 'google_sheets' && <FileSpreadsheet className="h-4 w-4 text-green-500" />}
                            {block.type === 'openai' && <Bot className="h-4 w-4 text-purple-500" />}
                            {block.type === 'google_analytics' && <BarChart className="h-4 w-4 text-orange-500" />}
                            {block.type === 'payment' && <CreditCard className="h-4 w-4 text-emerald-500" />}
                            
                            {block.type === 'start' && <Play className="h-4 w-4 text-green-500" />}
                            <span className="font-medium">{block.title}</span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {block.type === 'text' && (
                          <p className="text-sm text-muted-foreground">
                            {block.content?.text || 'Clique para editar o texto'}
                          </p>
                        )}
                        {block.type === 'input' && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {block.content?.question || 'Pergunta'}
                            </p>
                            <Input 
                              placeholder={block.content?.placeholder || 'Placeholder'} 
                              disabled 
                              className="text-sm"
                            />
                          </div>
                        )}
                        {block.type === 'button' && (
                          <Button disabled className="w-full">
                            {block.content?.text || 'Texto do botão'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                    {index < chatbotBlocks.length - 1 && (
                      <div className="flex justify-center my-4">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
                {chatbotBlocks.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Nenhum elemento ainda</h3>
                    <p className="text-muted-foreground">
                      Adicione elementos usando a barra lateral
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Painel de Propriedades */}
          {!previewMode && selectedBlock && (
            <div className="w-80 border-l bg-background p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Propriedades</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={selectedBlock.title}
                      onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  {selectedBlock.type === 'text' && (
                    <div>
                      <label className="text-sm font-medium">Texto</label>
                      <Textarea
                        value={selectedBlock.content?.text || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { 
                          content: { ...selectedBlock.content, text: e.target.value }
                        })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {selectedBlock.type === 'input' && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Pergunta</label>
                        <Input
                          value={selectedBlock.content?.question || ''}
                          onChange={(e) => updateBlock(selectedBlock.id, { 
                            content: { ...selectedBlock.content, question: e.target.value }
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Placeholder</label>
                        <Input
                          value={selectedBlock.content?.placeholder || ''}
                          onChange={(e) => updateBlock(selectedBlock.id, { 
                            content: { ...selectedBlock.content, placeholder: e.target.value }
                          })}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedBlock.type === 'button' && (
                    <div>
                      <label className="text-sm font-medium">Texto do Botão</label>
                      <Input
                        value={selectedBlock.content?.text || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { 
                          content: { ...selectedBlock.content, text: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}