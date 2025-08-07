import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  RotateCcw, 
  Mail, 
  Settings, 
  Zap,
  X 
} from 'lucide-react';
import { User } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Projetos', href: '/projects', icon: FolderOpen },
  { name: 'Recorrentes', href: '/recurring', icon: RotateCcw },
  { name: 'Email', href: '/email', icon: Mail },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow quantum-card border-r-0 rounded-none">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold quantum-heading">Quantum Tasks</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== '/' && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <a className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'quantum-text hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'quantum-text-muted'
                    }`} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium quantum-text truncate">
                  {user.name}
                </p>
                <p className="text-xs quantum-text-muted truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-50 lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-black transition-opacity ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`} onClick={onClose} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full quantum-card transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold quantum-heading">Quantum Tasks</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== '/' && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'quantum-text hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'quantum-text-muted'
                    }`} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium quantum-text truncate">
                  {user.name}
                </p>
                <p className="text-xs quantum-text-muted truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}