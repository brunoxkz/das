import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { animations, microInteractions } from '@/lib/animations';

const modernCardVariants = cva(
  [
    'rounded-xl border bg-white text-gray-950 shadow-sm',
    'transition-all duration-200 ease-out',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        elevated: 'border-gray-200 shadow-lg',
        interactive: [
          'border-gray-200 cursor-pointer',
          microInteractions.cardHover,
          'hover:border-gray-300',
        ],
        outline: 'border-gray-300',
        ghost: 'border-transparent shadow-none',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernCardVariants> {
  hover?: boolean;
}

const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, size, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        modernCardVariants({ variant, size }),
        hover && microInteractions.cardHover,
        className
      )}
      {...props}
    />
  )
);

ModernCard.displayName = 'ModernCard';

const ModernCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));

ModernCardHeader.displayName = 'ModernCardHeader';

const ModernCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-gray-900',
      className
    )}
    {...props}
  />
));

ModernCardTitle.displayName = 'ModernCardTitle';

const ModernCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));

ModernCardDescription.displayName = 'ModernCardDescription';

const ModernCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-4', className)} {...props} />
));

ModernCardContent.displayName = 'ModernCardContent';

const ModernCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-gray-100', className)}
    {...props}
  />
));

ModernCardFooter.displayName = 'ModernCardFooter';

// Loading skeleton card
const ModernCardSkeleton = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
      className
    )}
    {...props}
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <div className={cn('h-4 w-1/3 rounded', animations.skeleton)} />
        <div className={cn('h-3 w-1/2 rounded', animations.skeleton)} />
      </div>
      <div className="space-y-2">
        <div className={cn('h-3 w-full rounded', animations.skeleton)} />
        <div className={cn('h-3 w-4/5 rounded', animations.skeleton)} />
        <div className={cn('h-3 w-3/5 rounded', animations.skeleton)} />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <div className={cn('h-8 w-20 rounded', animations.skeleton)} />
        <div className={cn('h-8 w-16 rounded', animations.skeleton)} />
      </div>
    </div>
  </div>
));

ModernCardSkeleton.displayName = 'ModernCardSkeleton';

export {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  ModernCardFooter,
  ModernCardSkeleton,
  modernCardVariants,
};