import { useEffect, useState } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import RecurringPage from './pages/RecurringPage';
import EmailPage from './pages/EmailPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

// Utils
import { apiRequest } from './lib/queryClient';

function App() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['/api/health'],
    queryFn: () => apiRequest('GET', '/api/health'),
    refetchInterval: 60000, // Check every minute
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Router>
          <Switch>
            <Route path="/register">
              <RegisterPage onSuccess={login} />
            </Route>
            <Route>
              <LoginPage onSuccess={login} />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Router>
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            user={user}
          />

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header
              user={user}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onThemeToggle={toggleTheme}
              theme={theme}
              onLogout={logout}
              healthStatus={healthData?.status}
            />

            {/* Page content */}
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/tasks" component={TasksPage} />
                <Route path="/projects" component={ProjectsPage} />
                <Route path="/recurring" component={RecurringPage} />
                <Route path="/email" component={EmailPage} />
                <Route path="/settings" component={SettingsPage} />
                
                {/* 404 */}
                <Route>
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        404
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Página não encontrada
                      </p>
                      <a
                        href="/"
                        className="quantum-btn-primary"
                      >
                        Voltar ao início
                      </a>
                    </div>
                  </div>
                </Route>
              </Switch>
            </main>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </Router>
    </div>
  );
}

export default App;