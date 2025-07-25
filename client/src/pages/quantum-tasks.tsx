import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CheckCircle, 
  Mail, 
  Settings, 
  Brain, 
  Clock, 
  Users, 
  Target, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Flag,
  Tag,
  ChevronDown,
  Send,
  Archive,
  Trash2,
  Edit3,
  Repeat,
  Bell,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Laptop,
  MessageSquare,
  Phone,
  Video,
  FileText,
  Image,
  Paperclip,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Link,
  Copy,
  Share2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  User,
  Crown
} from "lucide-react";

// Dados mock realistas para demonstração
const mockTasks = [
  {
    id: 1,
    title: "Implementar autenticação OAuth2",
    description: "Configurar login social com Google e GitHub",
    priority: "alta",
    status: "em_progresso",
    dueDate: "2025-01-26",
    tags: ["desenvolvimento", "segurança"],
    project: "Quantum Tasks v1.0",
    timeEstimate: "4h",
    completedSubtasks: 2,
    totalSubtasks: 5,
    assignee: "João Silva"
  },
  {
    id: 2,
    title: "Design do sistema de notificações",
    description: "Criar interface para configurar lembretes personalizados",
    priority: "média",
    status: "pendente",
    dueDate: "2025-01-28",
    tags: ["ui/ux", "notificações"],
    project: "Quantum Tasks v1.0",
    timeEstimate: "6h",
    completedSubtasks: 0,
    totalSubtasks: 3,
    assignee: "Maria Santos"
  },
  {
    id: 3,
    title: "Integração com API do Gmail",
    description: "Conectar inbox multi-email com Gmail API",
    priority: "alta",
    status: "concluida",
    dueDate: "2025-01-24",
    tags: ["api", "email"],
    project: "Email Integration",
    timeEstimate: "8h",
    completedSubtasks: 4,
    totalSubtasks: 4,
    assignee: "Pedro Costa"
  }
];

const mockProjects = [
  {
    id: 1,
    name: "Quantum Tasks v1.0",
    description: "Sistema revolucionário de produtividade",
    progress: 75,
    totalTasks: 24,
    completedTasks: 18,
    team: ["João Silva", "Maria Santos", "Pedro Costa", "Ana Lima"],
    deadline: "2025-02-15",
    budget: "R$ 50.000",
    status: "ativo"
  },
  {
    id: 2,
    name: "Email Integration",
    description: "Módulo de integração multi-email",
    progress: 90,
    totalTasks: 12,
    completedTasks: 11,
    team: ["Pedro Costa", "Ana Lima"],
    deadline: "2025-01-30",
    budget: "R$ 25.000",
    status: "finalizando"
  }
];

const mockEmails = [
  {
    id: 1,
    from: "cliente@empresa.com",
    subject: "Proposta de novo projeto",
    preview: "Olá, gostaria de discutir uma nova parceria...",
    date: "2025-01-25 14:30",
    read: false,
    important: true,
    account: "Gmail Corporativo",
    category: "Trabalho"
  },
  {
    id: 2,
    from: "team@slack.com",
    subject: "Resumo semanal da equipe",
    preview: "Sua equipe teve 47 mensagens esta semana...",
    date: "2025-01-25 09:15",
    read: true,
    important: false,
    account: "Outlook Pessoal",
    category: "Notificações"
  }
];

const mockRecurringTasks = [
  {
    id: 1,
    title: "Daily Standup",
    time: "09:00",
    frequency: "Diariamente",
    nextOccurrence: "2025-01-26 09:00",
    active: true,
    notifications: ["5 min antes", "Na hora"],
    weekdays: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    title: "Backup dos dados",
    time: "02:00",
    frequency: "Semanalmente",
    nextOccurrence: "2025-01-27 02:00",
    active: true,
    notifications: ["1 hora antes"],
    weekdays: [0]
  }
];

// Componente principal com abas
const QuantumTasksPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('task');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'tasks', label: 'Tarefas', icon: CheckCircle },
    { id: 'projects', label: 'Projetos', icon: Users },
    { id: 'recurring', label: 'Lembretes', icon: Clock },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'tasks':
        return <TasksTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'recurring':
        return <RecurringTab />;
      case 'email':
        return <EmailTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quantum Tasks</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Sistema Ultra-Avançado de Produtividade</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </Button>
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <TabContent />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// Dashboard Tab - Visão geral com métricas e estatísticas
const DashboardTab = () => (
  <div className="space-y-6">
    {/* Métricas principais */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tarefas Hoje</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
              <p className="text-xs text-green-600">+3 desde ontem</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Emails Não Lidos</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
              <p className="text-xs text-blue-600">Gmail + Outlook</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Projetos Ativos</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">4</p>
              <p className="text-xs text-purple-600">2 finalizando</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Produtividade</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">94%</p>
              <p className="text-xs text-green-600">+12% esta semana</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Tarefas recentes e agenda */}
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tarefas Urgentes</span>
            <Badge variant="destructive">3 pendentes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <CheckCircle className={`w-5 h-5 ${task.status === 'concluida' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{task.project}</p>
              </div>
              <Badge variant={task.priority === 'alta' ? 'destructive' : 'secondary'}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Próximos Lembretes</span>
            <Bell className="w-5 h-5 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRecurringTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{task.nextOccurrence}</p>
              </div>
              <Badge variant={task.active ? 'default' : 'secondary'}>
                {task.frequency}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

// Tasks Tab - Gerenciamento completo de tarefas
const TasksTab = () => (
  <div className="space-y-6">
    {/* Filtros e controles */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
        <Select defaultValue="todas">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="em_progresso">Em Progresso</SelectItem>
            <SelectItem value="concluida">Concluídas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Buscar tarefas..." className="w-64" />
        <Button variant="outline" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </div>

    {/* Lista de tarefas */}
    <div className="space-y-3">
      {mockTasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <CheckCircle className={`w-6 h-6 cursor-pointer ${
                task.status === 'concluida' ? 'text-green-600' : 'text-slate-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                  <Badge variant={task.priority === 'alta' ? 'destructive' : task.priority === 'média' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.timeEstimate}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.assignee}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{width: `${(task.completedSubtasks / task.totalSubtasks) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {task.completedSubtasks}/{task.totalSubtasks}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Projects Tab - Gerenciamento de projetos
const ProjectsTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {mockProjects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{project.name}</span>
              <Badge variant={project.status === 'ativo' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">{project.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{width: `${project.progress}%`}}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Tarefas</p>
                <p className="font-semibold">{project.completedTasks}/{project.totalTasks}</p>
              </div>
              <div>
                <p className="text-slate-500">Prazo</p>
                <p className="font-semibold">{project.deadline}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Equipe ({project.team.length})</p>
              <div className="flex -space-x-2">
                {project.team.map((member, index) => (
                  <div key={index} className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Recurring Tab - Lembretes recorrentes
const RecurringTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>
    </div>

    <div className="space-y-4">
      {mockRecurringTasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${task.active ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat className="w-4 h-4" />
                      {task.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.nextOccurrence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {task.notifications.map((notif, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        {notif}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Email Tab - Multi-email inbox
const EmailTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Conectar Conta
        </Button>
        <Select defaultValue="todas">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Contas</SelectItem>
            <SelectItem value="gmail">Gmail</SelectItem>
            <SelectItem value="outlook">Outlook</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Sincronizar
      </Button>
    </div>

    <div className="space-y-3">
      {mockEmails.map((email) => (
        <Card key={email.id} className={`hover:shadow-md transition-shadow ${!email.read ? 'border-l-4 border-l-blue-600' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {email.important && <Star className="w-5 h-5 text-yellow-500" />}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${!email.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {email.from}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {email.account}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{email.date}</span>
                </div>
                <h3 className={`font-medium mb-1 ${!email.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                  {email.subject}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{email.preview}</p>
                <Badge variant="secondary" className="text-xs mt-2">
                  {email.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Analytics Tab - Relatórios e métricas
const AnalyticsTab = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Produtividade Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">94%</div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            +12% vs semana anterior
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Tempo Médio por Tarefa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">2.4h</div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock3 className="w-4 h-4" />
            Otimizado em 15min
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Taxa de Conclusão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">87%</div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Meta: 85%
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Tarefas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Desenvolvimento', value: 45, color: 'bg-blue-600' },
            { name: 'UI/UX', value: 25, color: 'bg-purple-600' },
            { name: 'API Integration', value: 20, color: 'bg-green-600' },
            { name: 'Documentação', value: 10, color: 'bg-yellow-600' }
          ].map((category) => (
            <div key={category.name} className="flex items-center gap-4">
              <div className="w-24 text-sm text-slate-600 dark:text-slate-300">{category.name}</div>
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${category.color}`} style={{width: `${category.value}%`}}></div>
              </div>
              <div className="w-12 text-sm text-slate-600 dark:text-slate-300">{category.value}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Settings Tab - Configurações do sistema
const SettingsTab = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tema</label>
            <Select defaultValue="auto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Idioma</label>
            <Select defaultValue="pt-br">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-br">Português (BR)</SelectItem>
                <SelectItem value="en-us">English (US)</SelectItem>
                <SelectItem value="es-es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificações Push</span>
            <div className="w-10 h-6 bg-purple-600 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lembretes por Email</span>
            <div className="w-10 h-6 bg-slate-300 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sons de Notificação</span>
            <div className="w-10 h-6 bg-purple-600 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Gmail</span>
            </div>
            <Badge variant="default">Conectado</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Outlook</span>
            </div>
            <Button size="sm" variant="outline">Conectar</Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="font-medium">Google Calendar</span>
            </div>
            <Button size="sm" variant="outline">Conectar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados e Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          <Button variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </Button>
          <Button variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Modal de criação
const CreateModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Novo Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex-col">
            <CheckCircle className="w-6 h-6 mb-2 text-green-600" />
            <span>Tarefa</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2 text-purple-600" />
            <span>Projeto</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Clock className="w-6 h-6 mb-2 text-blue-600" />
            <span>Lembrete</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Mail className="w-6 h-6 mb-2 text-orange-600" />
            <span>Email</span>
          </Button>
        </div>
        <Button onClick={onClose} variant="outline" className="w-full">
          Cancelar
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default QuantumTasksPage;