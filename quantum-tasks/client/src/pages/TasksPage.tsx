import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/tasks', { search: searchTerm, status: statusFilter }],
    retry: false,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'todo':
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in_progress':
        return 'Em Progresso';
      case 'todo':
        return 'A Fazer';
      default:
        return 'A Fazer';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'quantum-priority-urgent';
      case 'high':
        return 'quantum-priority-high';
      case 'normal':
        return 'quantum-priority-normal';
      case 'low':
        return 'quantum-priority-low';
      default:
        return 'quantum-priority-normal';
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold quantum-heading">Tarefas</h1>
          <p className="quantum-text-muted">Gerencie todas as suas tarefas</p>
        </div>
        <button className="quantum-btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 quantum-text-muted" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="quantum-input pl-10"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 quantum-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="quantum-input w-auto"
          >
            <option value="all">Todos os status</option>
            <option value="todo">A Fazer</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks?.length ? (
          tasks.map((task: any) => (
            <div key={task.id} className="quantum-card-elevated p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="text-lg font-semibold quantum-heading">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority || 'Normal'}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="quantum-text mb-3">{task.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm quantum-text-muted">
                    <span className="flex items-center space-x-1">
                      <span>Status:</span>
                      <span>{getStatusText(task.status)}</span>
                    </span>
                    
                    {task.dueDate && (
                      <span className="flex items-center space-x-1">
                        <span>Prazo:</span>
                        <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                      </span>
                    )}

                    {task.project && (
                      <span className="flex items-center space-x-1">
                        <span>Projeto:</span>
                        <span className="text-blue-600 dark:text-blue-400">{task.project.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="quantum-btn-ghost">Editar</button>
                  <button className="quantum-btn-ghost">Concluir</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 quantum-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold quantum-heading mb-2">Nenhuma tarefa encontrada</h3>
            <p className="quantum-text-muted mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira tarefa.'}
            </p>
            <button className="quantum-btn-primary">
              Criar primeira tarefa
            </button>
          </div>
        )}
      </div>

      {/* Demo info */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">💡 Dica: Gerenciamento de Tarefas</h3>
        <p className="text-sm">
          Use a busca para encontrar tarefas específicas, filtros por status para organizar sua visualização,
          e crie tarefas com diferentes prioridades para manter o foco no que é mais importante.
        </p>
      </div>
    </div>
  );
}