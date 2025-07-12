import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { queryClient } from "@/lib/queryClient";
import { Bot, Plus, Eye, Settings, Trash2, Copy, Share, MessageSquare, BarChart3, FileCode, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TypebotProject {
  id: string;
  name: string;
  description?: string;
  isPublished: boolean;
  publicId: string;
  totalViews: number;
  totalConversations: number;
  totalCompletions: number;
  createdAt: string;
  updatedAt: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
}

export default function TypebotPage() {
  const [selectedProject, setSelectedProject] = useState<TypebotProject | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Buscar projetos TypeBot
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["/api/typebot/projects"],
  });

  // Buscar quizzes para conversão
  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Mutation para criar projeto
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch("/api/typebot/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar projeto");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
      setCreateDialogOpen(false);
    },
  });

  // Mutation para converter quiz
  const convertQuizMutation = useMutation({
    mutationFn: async (data: { quizId: string; name: string; description?: string }) => {
      const response = await fetch(`/api/typebot/convert-quiz/${data.quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, description: data.description }),
      });
      if (!response.ok) throw new Error("Erro ao converter quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
      setConvertDialogOpen(false);
    },
  });

  // Mutation para publicar/despublicar
  const publishMutation = useMutation({
    mutationFn: async ({ projectId, action }: { projectId: string; action: 'publish' | 'unpublish' }) => {
      const response = await fetch(`/api/typebot/projects/${projectId}/${action}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(`Erro ao ${action} projeto`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
    },
  });

  // Mutation para deletar projeto
  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/typebot/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar projeto");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typebot/projects"] });
    },
  });

  const createForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const convertForm = useForm({
    defaultValues: {
      quizId: "",
      name: "",
      description: "",
    },
  });

  const handleCreateProject = (data: { name: string; description?: string }) => {
    createProjectMutation.mutate(data);
  };

  const handleConvertQuiz = (data: { quizId: string; name: string; description?: string }) => {
    convertQuizMutation.mutate(data);
  };

  const handlePublishToggle = (project: TypebotProject) => {
    publishMutation.mutate({
      projectId: project.id,
      action: project.isPublished ? 'unpublish' : 'publish'
    });
  };

  const handleDelete = (projectId: string) => {
    if (confirm("Tem certeza que deseja deletar este projeto TypeBot?")) {
      deleteMutation.mutate(projectId);
    }
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
        
        <div className="flex gap-3">
          <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <FileCode className="h-4 w-4 mr-2" />
                Converter Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Converter Quiz para TypeBot</DialogTitle>
              </DialogHeader>
              <Form {...convertForm}>
                <form onSubmit={convertForm.handleSubmit(handleConvertQuiz)} className="space-y-4">
                  <FormField
                    control={convertForm.control}
                    name="quizId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selecionar Quiz</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um quiz..." />
                            </SelectTrigger>
                            <SelectContent>
                              {quizzes.map((quiz: Quiz) => (
                                <SelectItem key={quiz.id} value={quiz.id}>
                                  {quiz.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={convertForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Chatbot</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Assistente de Vendas" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={convertForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descreva a função do chatbot..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConvertDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={convertQuizMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {convertQuizMutation.isPending ? "Convertendo..." : "Converter"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto TypeBot</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateProject)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Assistente de Vendas" />
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
                          <Textarea {...field} placeholder="Descreva a função do chatbot..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createProjectMutation.isPending ? "Criando..." : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Chatbots</p>
                <p className="text-2xl font-bold text-blue-800">{projects.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total de Visualizações</p>
                <p className="text-2xl font-bold text-green-800">
                  {projects.reduce((sum: number, p: TypebotProject) => sum + p.totalViews, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total de Conversas</p>
                <p className="text-2xl font-bold text-purple-800">
                  {projects.reduce((sum: number, p: TypebotProject) => sum + p.totalConversations, 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-orange-800">
                  {projects.length > 0 
                    ? Math.round(
                        (projects.reduce((sum: number, p: TypebotProject) => sum + p.totalCompletions, 0) /
                         projects.reduce((sum: number, p: TypebotProject) => sum + p.totalConversations, 0)) * 100
                      ) || 0
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhum chatbot criado ainda</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro chatbot ou convertendo um quiz existente
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Chatbot
              </Button>
              <Button onClick={() => setConvertDialogOpen(true)} variant="outline">
                <FileCode className="h-4 w-4 mr-2" />
                Converter Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: TypebotProject) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={project.isPublished ? "default" : "secondary"}>
                    {project.isPublished ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-blue-600">{project.totalViews}</p>
                    <p className="text-xs text-muted-foreground">Visualizações</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{project.totalConversations}</p>
                    <p className="text-xs text-muted-foreground">Conversas</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-purple-600">{project.totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Completas</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePublishToggle(project)}
                    disabled={publishMutation.isPending}
                    className="flex-1"
                  >
                    {project.isPublished ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Share className="h-3 w-3 mr-1" />
                        Publicar
                      </>
                    )}
                  </Button>
                  
                  {project.isPublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPublicUrl(project.publicId)}
                      className="px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(project.id)}
                    disabled={deleteMutation.isPending}
                    className="px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Public URL */}
                {project.isPublished && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <p className="text-muted-foreground mb-1">URL Público:</p>
                    <p className="font-mono break-all text-green-600">
                      /typebot/{project.publicId}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}