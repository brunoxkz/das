import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'wouter';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { RegisterCredentials } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

interface RegisterPageProps {
  onSuccess: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
}

export default function RegisterPage({ onSuccess }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterCredentials & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials & { confirmPassword: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = data;
      const result = await onSuccess(registerData);
      if (!result.success) {
        setError(result.error || 'Registro falhou');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Quantum Tasks
              </h1>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Criar nova conta
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Junte-se ao futuro da organização de tarefas
          </p>
        </div>

        {/* Form */}
        <div className="quantum-card p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome completo
              </label>
              <input
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
                type="text"
                className="quantum-input"
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                className="quantum-input"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 8,
                      message: 'Senha deve ter pelo menos 8 caracteres',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="quantum-input pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmar senha
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === password || 'As senhas não coincidem',
                })}
                type={showPassword ? 'text' : 'password'}
                className="quantum-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="quantum-error p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full quantum-btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Criando conta...</span>
                </>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Já tem uma conta?{' '}
              <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Security info */}
        <div className="quantum-info p-4 rounded-lg">
          <h3 className="font-medium mb-2">Segurança da senha:</h3>
          <ul className="text-sm space-y-1">
            <li>• Pelo menos 8 caracteres</li>
            <li>• Uma letra minúscula</li>
            <li>• Uma letra maiúscula</li>
            <li>• Um número</li>
          </ul>
        </div>
      </div>
    </div>
  );
}