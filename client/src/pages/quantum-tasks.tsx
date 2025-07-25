import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Mail, Settings, Brain, Clock, Users, Target } from "lucide-react";

const QuantumTasksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
                  Gerenciamento completo de projetos com equipes, prazos e acompanhamento em tempo real.
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
                  Sistema de agendamento com suporte a diferentes fusos horários e sincronização com calendários externos.
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
                  Relatórios detalhados sobre produtividade, tempo gasto e padrões de trabalho com insights IA.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    SISTEMA EM DESENVOLVIMENTO
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Quantum Tasks - Versão Demo
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  O sistema está sendo desenvolvido com tecnologias de ponta: SQLite para performance, 
                  JWT para segurança, e React com TypeScript para uma experiência premium.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Backend SQLite + JWT Authentication ✓
                  </div>
                  <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Frontend React + TypeScript ✓
                  </div>
                  <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sistema de Temas e Autenticação ✓
                  </div>
                  <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                    Funcionalidades Avançadas (Em Desenvolvimento)
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => {
                    window.open('https://github.com/replit/quantum-tasks', '_blank');
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Acompanhar Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tech Specs */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Backend</h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      <li>SQLite Database</li>
                      <li>JWT Authentication</li>
                      <li>Express.js Server</li>
                      <li>TypeScript</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Frontend</h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      <li>React 18</li>
                      <li>TypeScript</li>
                      <li>Tailwind CSS</li>
                      <li>React Query</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Características</h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      <li>Separação Completa</li>
                      <li>Sistema Independente</li>
                      <li>Performance Otimizada</li>
                      <li>Escalabilidade</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumTasksPage;