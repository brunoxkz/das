import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Mail, Inbox, Archive, Trash2, Star, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmailPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('inbox');

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['/email/accounts'],
    retry: false,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/email/messages', { folder: folderFilter, search: searchTerm }],
    retry: false,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold quantum-heading">Email Inteligente</h1>
          <p className="quantum-text-muted">Gerencie múltiplas contas com IA integrada</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="quantum-btn-ghost flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Sincronizar</span>
          </button>
          <button className="quantum-btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Conectar Conta</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="quantum-card p-4 space-y-4">
            {/* Email accounts */}
            <div>
              <h3 className="text-sm font-medium quantum-heading mb-3">Contas de Email</h3>
              {accountsLoading ? (
                <LoadingSpinner size="sm" />
              ) : accounts?.length ? (
                <div className="space-y-2">
                  {accounts.map((account: any) => (
                    <div key={account.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium quantum-text truncate">{account.email}</p>
                        <p className="text-xs quantum-text-muted">{account.provider}</p>
                      </div>
                      <span className="text-xs quantum-text-muted">
                        {account.unreadCount || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm quantum-text-muted">Nenhuma conta conectada</p>
              )}
            </div>

            {/* Folders */}
            <div>
              <h3 className="text-sm font-medium quantum-heading mb-3">Pastas</h3>
              <div className="space-y-1">
                {[
                  { id: 'inbox', name: 'Caixa de Entrada', icon: Inbox, count: 12 },
                  { id: 'starred', name: 'Favoritos', icon: Star, count: 3 },
                  { id: 'sent', name: 'Enviados', icon: Mail, count: 0 },
                  { id: 'archive', name: 'Arquivados', icon: Archive, count: 45 },
                  { id: 'trash', name: 'Lixeira', icon: Trash2, count: 2 },
                ].map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setFolderFilter(folder.id)}
                    className={`w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors ${
                      folderFilter === folder.id 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'quantum-text hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <folder.icon className="w-4 h-4" />
                      <span>{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">
                        {folder.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and filters */}
          <div className="quantum-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 quantum-text-muted" />
              <input
                type="text"
                placeholder="Buscar emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="quantum-input pl-10"
              />
            </div>
          </div>

          {/* Messages list */}
          <div className="quantum-card">
            {messagesLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : messages?.length ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {messages.map((message: any) => (
                  <div key={message.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {message.from?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium quantum-text truncate">
                            {message.from || 'Remetente desconhecido'}
                          </p>
                          <div className="flex items-center space-x-2">
                            {message.aiCategory && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                {message.aiCategory}
                              </span>
                            )}
                            <span className="text-xs quantum-text-muted">
                              {message.receivedAt ? new Date(message.receivedAt).toLocaleDateString('pt-BR') : ''}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm quantum-heading mt-1 truncate">
                          {message.subject || 'Sem assunto'}
                        </p>
                        <p className="text-sm quantum-text-muted mt-1 line-clamp-2">
                          {message.preview || 'Sem prévia disponível'}
                        </p>
                        {message.aiSuggestions?.length > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs quantum-text-muted">IA sugere:</span>
                            <div className="flex space-x-1">
                              {message.aiSuggestions.slice(0, 2).map((suggestion: string, index: number) => (
                                <button key={index} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50">
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 quantum-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold quantum-heading mb-2">Nenhum email encontrado</h3>
                <p className="quantum-text-muted mb-4">
                  {searchTerm 
                    ? 'Tente ajustar o termo de busca.'
                    : 'Conecte uma conta de email para começar.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo info */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">🤖 IA Integrada para Email</h3>
        <p className="text-sm">
          O sistema Quantum Tasks classifica automaticamente emails por categoria, sugere respostas
          inteligentes, cria tarefas a partir do conteúdo dos emails e oferece suporte para múltiplas
          contas (Gmail, Outlook, corporativo). Mantenha sua caixa de entrada sempre organizada!
        </p>
      </div>
    </div>
  );
}