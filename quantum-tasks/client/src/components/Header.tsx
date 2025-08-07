import { Moon, Sun, Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { User, Theme } from '../hooks/useAuth';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onThemeToggle: () => void;
  theme: Theme;
  onLogout: () => void;
  healthStatus?: string;
}

export default function Header({ 
  user, 
  onMenuClick, 
  onThemeToggle, 
  theme, 
  onLogout, 
  healthStatus 
}: HeaderProps) {
  return (
    <header className="quantum-card border-b border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 quantum-text" />
          </button>

          {/* Health status */}
          {healthStatus && (
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs quantum-text-muted">
                Sistema {healthStatus === 'healthy' ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors quantum-focus"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors quantum-focus relative">
            <Bell className="w-5 h-5 quantum-text" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block quantum-text text-sm font-medium">
                {user.name}
              </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 quantum-card shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium quantum-text">{user.name}</p>
                <p className="text-xs quantum-text-muted">{user.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm quantum-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  <UserIcon className="w-4 h-4" />
                  <span>Perfil</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}