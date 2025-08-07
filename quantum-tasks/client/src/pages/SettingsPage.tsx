import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, User, Bell, Shield, Globe, Palette, Database, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['/settings/user'],
    retry: false,
  });

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'preferences', name: 'Preferências', icon: Globe },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'data', name: 'Dados', icon: Database },
  ];

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
      <div>
        <h1 className="text-3xl font-bold quantum-heading">Configurações</h1>
        <p className="quantum-text-muted">Personalize sua experiência no Quantum Tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="quantum-card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'quantum-text hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="quantum-card p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold quantum-heading">Informações do Perfil</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium quantum-text mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      defaultValue={userSettings?.name || 'Usuário Admin'}
                      className="quantum-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium quantum-text mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={userSettings?.email || 'admin@quantumtasks.com'}
                      className="quantum-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium quantum-text mb-2">
                      Fuso horário
                    </label>
                    <select className="quantum-input">
                      <option>America/Sao_Paulo (GMT-3)</option>
                      <option>America/New_York (GMT-5)</option>
                      <option>Europe/London (GMT+0)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium quantum-text mb-2">
                      Idioma
                    </label>
                    <select className="quantum-input">
                      <option>Português (Brasil)</option>
                      <option>English (US)</option>
                      <option>Español</option>
                    </select>
                  </div>
                </div>

                <button className="quantum-btn-primary">
                  Salvar alterações
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold quantum-heading">Preferências de Notificação</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium quantum-text">Tarefas vencendo</h3>
                      <p className="text-sm quantum-text-muted">Receber alertas antes do prazo</p>
                    </div>
                    <input type="checkbox" className="quantum-checkbox" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium quantum-text">Lembretes recorrentes</h3>
                      <p className="text-sm quantum-text-muted">Notificações de tarefas repetitivas</p>
                    </div>
                    <input type="checkbox" className="quantum-checkbox" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium quantum-text">Emails importantes</h3>
                      <p className="text-sm quantum-text-muted">IA identifica emails prioritários</p>
                    </div>
                    <input type="checkbox" className="quantum-checkbox" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium quantum-text">Relatórios semanais</h3>
                      <p className="text-sm quantum-text-muted">Resumo de produtividade</p>
                    </div>
                    <input type="checkbox" className="quantum-checkbox" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold quantum-heading">Segurança</h2>
                
                <div className="space-y-4">
                  <div className="quantum-card-elevated p-4">
                    <h3 className="text-sm font-medium quantum-text mb-2">Alterar senha</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Senha atual"
                        className="quantum-input"
                      />
                      <input
                        type="password"
                        placeholder="Nova senha"
                        className="quantum-input"
                      />
                      <input
                        type="password"
                        placeholder="Confirmar nova senha"
                        className="quantum-input"
                      />
                      <button className="quantum-btn-primary">
                        Alterar senha
                      </button>
                    </div>
                  </div>
                  
                  <div className="quantum-card-elevated p-4">
                    <h3 className="text-sm font-medium quantum-text mb-2">Autenticação de dois fatores</h3>
                    <p className="text-sm quantum-text-muted mb-3">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                    <button className="quantum-btn-ghost">
                      Configurar 2FA
                    </button>
                  </div>
                  
                  <div className="quantum-card-elevated p-4">
                    <h3 className="text-sm font-medium quantum-text mb-2">Sessões ativas</h3>
                    <p className="text-sm quantum-text-muted mb-3">
                      Gerencie os dispositivos conectados à sua conta
                    </p>
                    <button className="quantum-btn-ghost">
                      Ver sessões
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold quantum-heading">Gerenciamento de Dados</h2>
                
                <div className="space-y-4">
                  <div className="quantum-card-elevated p-4">
                    <h3 className="text-sm font-medium quantum-text mb-2">Exportar dados</h3>
                    <p className="text-sm quantum-text-muted mb-3">
                      Baixe uma cópia de todos os seus dados
                    </p>
                    <button className="quantum-btn-ghost">
                      Solicitar exportação
                    </button>
                  </div>
                  
                  <div className="quantum-card-elevated p-4 border-red-200 dark:border-red-800">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir conta</span>
                    </h3>
                    <p className="text-sm quantum-text-muted mb-3">
                      Esta ação é irreversível e removerá permanentemente todos os seus dados
                    </p>
                    <button className="quantum-btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Excluir minha conta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Default content for other tabs */}
            {!['profile', 'notifications', 'security', 'data'].includes(activeTab) && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold quantum-heading">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                <div className="quantum-info p-4 rounded-lg">
                  <p className="text-sm">
                    Esta seção está em desenvolvimento. Em breve você terá acesso a mais
                    configurações avançadas para personalizar sua experiência no Quantum Tasks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo info */}
      <div className="quantum-info p-4 rounded-lg">
        <h3 className="font-medium mb-2">⚙️ Configurações Avançadas</h3>
        <p className="text-sm">
          O sistema Quantum Tasks oferece configurações granulares para notificações,
          segurança avançada com 2FA, múltiplos temas, sincronização de dados em tempo real
          e compliance total com LGPD para proteção dos seus dados.
        </p>
      </div>
    </div>
  );
}