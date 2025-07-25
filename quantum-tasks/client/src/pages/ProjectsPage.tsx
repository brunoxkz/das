import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FolderOpen, Users, Calendar, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['/projects', { search: searchTerm }],
    retry: false,
  });

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
          <h1 className="text-3xl font-bold quantum-heading">Projetos</h1>
          <p className="quantum-text-muted">Organize suas tarefas em projetos</p>
        </div>
        <button className="quantum-btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 quantum-text-muted" />
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="quantum-input pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length ? (
          projects.map((project: any) => (
            <div key={project.id} className="quantum-card-elevated p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold quantum-heading">{project.name}</h3>
                    <p className="text-sm quantum-text-muted">{project.tasksCount || 0} tarefas</p>
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="quantum-text text-sm mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="quantum-text-muted">Progresso</span>
                    <span className="quantum-text font-medium">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm quantum-text-muted">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{project.membersCount || 1}</span>
                  </div>
                  
                  {project.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{project.completedTasks || 0}/{project.totalTasks || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <button className="quantum-btn-ghost text-sm">Ver Tarefas</button>
                  <button className="quantum-btn-ghost text-sm">Editar</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-16 h-16 quantum-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold quantum-heading mb-2">Nenhum projeto encontrado</h3>
            <p className="quantum-text-muted mb-4">
              {searchTerm 
                ? 'Tente ajustar o termo de busca.'
                : 'Comece criando seu primeiro projeto para organizar suas tarefas.'}
            </p>
            <button className="quantum-btn-primary">
              Criar primeiro projeto
            </button>
          </div>
        )}
      </div>

      {/* Demo info */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">📁 Dica: Organização de Projetos</h3>
        <p className="text-sm">
          Projetos ajudam a agrupar tarefas relacionadas. Você pode acompanhar o progresso,
          definir prazos e colaborar com outros membros da equipe. Use projetos para grandes
          iniciativas que requerem múltiplas tarefas coordenadas.
        </p>
      </div>
    </div>
  );
}