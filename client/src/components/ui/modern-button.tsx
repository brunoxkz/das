import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { animations, microInteractions } from '@/lib/animations';

const modernButtonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    microInteractions.buttonPress,
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white shadow-md',
          'hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5',
          'focus-visible:ring-primary-500',
          'active:bg-primary-800',
        ],
        secondary: [
          'bg-white text-gray-900 border border-gray-300 shadow-sm',
          'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-gray-500',
          'active:bg-gray-100',
        ],
        outline: [
          'border border-primary-300 text-primary-700 bg-transparent',
          'hover:bg-primary-50 hover:border-primary-400 hover:-translate-y-0.5',
          'focus-visible:ring-primary-500',
          'active:bg-primary-100',
        ],
        ghost: [
          'text-gray-700 bg-transparent',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:ring-gray-500',
          'active:bg-gray-200',
        ],
        success: [
          'bg-green-600 text-white shadow-md',
          'hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5',
          'focus-visible:ring-green-500',
          'active:bg-green-800',
        ],
        destructive: [
          'bg-red-600 text-white shadow-md',
          'hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5',
          'focus-visible:ring-red-500',
          'active:bg-red-800',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      loading: false,
    },
  }
);

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    );
  }
);

ModernButton.displayName = 'ModernButton';

export { ModernButton, modernButtonVariants };