import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Mail, Settings, Brain, Clock, Users, Target, Home, Calendar } from "lucide-react";

// Componentes das páginas do Quantum Tasks
const QuantumHomePage = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Quantum Tasks
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Sistema revolucionário de gerenciamento de tarefas com IA integrada, 
          lembretes recorrentes avançados e inbox multi-email inteligente.
        </p>
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Tarefas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Sistema avançado de tarefas com IA para priorização automática e sugestões contextuais.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Lembretes Precisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Lembretes recorrentes com precisão de hora/minuto, exceções para feriados e múltiplas notificações.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              Multi-Email Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Integração com Gmail, Outlook e emails corporativos com classificação IA e criação automática de tarefas.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Projetos Colaborativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Gerenciamento de equipes, deadlines e colaboração em tempo real com sincronização de calendários.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Agendamento Avançado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Suporte para fusos horários e sincronização automática com calendários externos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Analytics Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300">
              Relatórios de produtividade com insights de IA e sugestões de otimização pessoal.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <a href="/quantum-tasks/dashboard">Acessar Dashboard</a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="/quantum-tasks/tasks">Ver Tarefas</a>
        </Button>
      </div>
    </div>
  </div>
);

const QuantumDashboard = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h2>
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Tarefas Hoje</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Emails Não Lidos</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Projetos Ativos</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuantumTasks = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Tarefas Inteligentes</h2>
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Implementar sistema de IA</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Prioridade: Alta • Prazo: Hoje</p>
            </div>
            <CheckCircle className="w-5 h-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Configurar lembretes recorrentes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Prioridade: Média • Prazo: Amanhã</p>
            </div>
            <CheckCircle className="w-5 h-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuantumProjects = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Projetos Colaborativos</h2>
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Quantum Tasks v1.0</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Sistema completo de produtividade</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">75% completo</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuantumRecurring = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Lembretes Precisos</h2>
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Reunião diária</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Todos os dias às 09:00</p>
            </div>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Revisão semanal</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Sextas-feiras às 17:00</p>
            </div>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuantumEmail = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Multi-Email Inbox</h2>
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Gmail Corporativo</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">5 emails não lidos</p>
            </div>
            <Mail className="w-5 h-5 text-red-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Outlook Pessoal</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">3 emails não lidos</p>
            </div>
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuantumSettings = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Configurações</h2>
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Configurações Gerais</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tema, notificações e preferências</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Integrações</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Conectar Gmail, Outlook, calendários</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Sidebar do Quantum Tasks
const QuantumSidebar = ({ currentPath }: { currentPath: string }) => {
  const menuItems = [
    { path: '/quantum-tasks', icon: Home, label: 'Home', exact: true },
    { path: '/quantum-tasks/dashboard', icon: Target, label: 'Dashboard' },
    { path: '/quantum-tasks/tasks', icon: CheckCircle, label: 'Tarefas' },
    { path: '/quantum-tasks/projects', icon: Users, label: 'Projetos' },
    { path: '/quantum-tasks/recurring', icon: Clock, label: 'Lembretes' },
    { path: '/quantum-tasks/email', icon: Mail, label: 'Email' },
    { path: '/quantum-tasks/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white">Quantum Tasks</span>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? currentPath === item.path 
            : currentPath.startsWith(item.path) && item.path !== '/quantum-tasks';
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
};

const QuantumTasksPage = () => {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        <QuantumSidebar currentPath={location} />
        
        <div className="flex-1">
          <Switch>
            <Route path="/quantum-tasks" exact>
              <QuantumHomePage />
            </Route>
            <Route path="/quantum-tasks/dashboard">
              <QuantumDashboard />
            </Route>
            <Route path="/quantum-tasks/tasks">
              <QuantumTasks />
            </Route>
            <Route path="/quantum-tasks/projects">
              <QuantumProjects />
            </Route>
            <Route path="/quantum-tasks/recurring">
              <QuantumRecurring />
            </Route>
            <Route path="/quantum-tasks/email">
              <QuantumEmail />
            </Route>
            <Route path="/quantum-tasks/settings">
              <QuantumSettings />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default QuantumTasksPage;