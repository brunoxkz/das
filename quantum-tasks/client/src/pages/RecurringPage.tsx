import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, RotateCcw, Calendar, Clock, Settings } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RecurringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: patterns, isLoading } = useQuery({
    queryKey: ['/recurring/patterns', { search: searchTerm, type: typeFilter }],
    retry: false,
  });

  const getFrequencyText = (pattern: any) => {
    switch (pattern.frequency) {
      case 'daily':
        return 'Diário';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'yearly':
        return 'Anual';
      case 'custom':
        return 'Personalizado';
      default:
        return pattern.frequency;
    }
  };

  const getNextDueText = (pattern: any) => {
    if (!pattern.nextDue) return 'Não agendado';
    
    const date = new Date(pattern.nextDue);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 7) return `Em ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-BR');
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
          <h1 className="text-3xl font-bold quantum-heading">Tarefas Recorrentes</h1>
          <p className="quantum-text-muted">Gerencie padrões e lembretes automáticos</p>
        </div>
        <button className="quantum-btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Padrão</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 quantum-text-muted" />
          <input
            type="text"
            placeholder="Buscar padrões recorrentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="quantum-input pl-10"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="quantum-input w-auto"
        >
          <option value="all">Todos os tipos</option>
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {/* Patterns List */}
      <div className="space-y-4">
        {patterns?.length ? (
          patterns.map((pattern: any) => (
            <div key={pattern.id} className="quantum-card-elevated p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold quantum-heading">{pattern.title}</h3>
                      <p className="text-sm quantum-text-muted">{getFrequencyText(pattern)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pattern.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {pattern.isActive ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>

                  {pattern.description && (
                    <p className="quantum-text mb-3">{pattern.description}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 quantum-text-muted" />
                      <div>
                        <p className="quantum-text-muted">Próxima execução</p>
                        <p className="quantum-text font-medium">{getNextDueText(pattern)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 quantum-text-muted" />
                      <div>
                        <p className="quantum-text-muted">Horário</p>
                        <p className="quantum-text font-medium">
                          {pattern.time ? `${pattern.time.hour}:${pattern.time.minute.toString().padStart(2, '0')}` : 'Não definido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 quantum-text-muted" />
                      <div>
                        <p className="quantum-text-muted">Execuções</p>
                        <p className="quantum-text font-medium">
                          {pattern.executionCount || 0} vez{(pattern.executionCount || 0) !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced settings preview */}
                  {(pattern.weekdays?.length > 0 || pattern.notifications?.length > 0 || pattern.endCondition) && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-4 text-xs quantum-text-muted">
                        {pattern.weekdays?.length > 0 && (
                          <span>Dias: {pattern.weekdays.join(', ')}</span>
                        )}
                        {pattern.notifications?.length > 0 && (
                          <span>Lembretes: {pattern.notifications.length}</span>
                        )}
                        {pattern.endCondition && (
                          <span>Limite: {pattern.endCondition.type}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="quantum-btn-ghost">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className={`quantum-btn-ghost ${
                    pattern.isActive ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {pattern.isActive ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <RotateCcw className="w-16 h-16 quantum-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold quantum-heading mb-2">Nenhum padrão recorrente encontrado</h3>
            <p className="quantum-text-muted mb-4">
              {searchTerm || typeFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Crie padrões recorrentes para automatizar tarefas repetitivas.'}
            </p>
            <button className="quantum-btn-primary">
              Criar primeiro padrão
            </button>
          </div>
        )}
      </div>

      {/* Demo info */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">🔄 Dica: Tarefas Recorrentes Avançadas</h3>
        <p className="text-sm">
          O sistema Quantum Tasks oferece precisão de hora/minuto, dias específicos da semana,
          múltiplas notificações antes do prazo, condições de término personalizadas e exceções
          para feriados. Configure uma vez e automatize para sempre!
        </p>
      </div>
    </div>
  );
}