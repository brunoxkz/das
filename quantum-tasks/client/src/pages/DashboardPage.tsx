import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, Clock, Plus, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/dashboard/stats'],
    retry: false,
  });

  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/tasks/recent'],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold quantum-heading">Dashboard</h1>
          <p className="quantum-text-muted">Visão geral das suas tarefas e projetos</p>
        </div>
        <button className="quantum-btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="quantum-card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="quantum-text-muted text-sm">Tarefas Pendentes</p>
              <p className="text-2xl font-bold quantum-heading">{stats?.pending || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="quantum-card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="quantum-text-muted text-sm">Concluídas Hoje</p>
              <p className="text-2xl font-bold quantum-heading">{stats?.completedToday || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="quantum-card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="quantum-text-muted text-sm">Esta Semana</p>
              <p className="text-2xl font-bold quantum-heading">{stats?.thisWeek || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="quantum-card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="quantum-text-muted text-sm">Produtividade</p>
              <p className="text-2xl font-bold quantum-heading">{stats?.productivity || 0}%</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="quantum-card p-6">
          <h2 className="text-xl font-semibold quantum-heading mb-4">Tarefas Recentes</h2>
          {tasksLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks?.length ? (
                recentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-slate-300 dark:bg-slate-600'
                    }`} />
                    <div className="flex-1">
                      <p className="quantum-text font-medium">{task.title}</p>
                      <p className="quantum-text-muted text-sm">{task.project?.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="quantum-text-muted text-center py-8">Nenhuma tarefa encontrada</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quantum-card p-6">
          <h2 className="text-xl font-semibold quantum-heading mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full quantum-btn-ghost text-left p-3 flex items-center space-x-3">
              <Plus className="w-5 h-5" />
              <span>Criar nova tarefa</span>
            </button>
            <button className="w-full quantum-btn-ghost text-left p-3 flex items-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Agendar tarefa recorrente</span>
            </button>
            <button className="w-full quantum-btn-ghost text-left p-3 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" />
              <span>Ver tarefas concluídas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo message */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">🚀 Bem-vindo ao Quantum Tasks!</h3>
        <p className="text-sm">
          Este é o seu dashboard principal. Aqui você pode ver um resumo de todas as suas tarefas,
          projetos e estatísticas de produtividade. Use o menu lateral para navegar pelas diferentes
          funcionalidades do sistema.
        </p>
      </div>
    </div>
  );
}