// Design System Tokens
export const designTokens = {
  // Spacing Scale (rem)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
  },

  // Typography Scale
  typography: {
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  // Color Palette
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    }
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation Timing
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  }
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      bg: 'bg-primary-600 hover:bg-primary-700',
      text: 'text-white',
      border: 'border-transparent',
      shadow: 'shadow-md hover:shadow-lg',
      transition: 'transition-all duration-150 ease-in-out',
    },
    secondary: {
      bg: 'bg-white hover:bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-300',
      shadow: 'shadow-sm hover:shadow-md',
      transition: 'transition-all duration-150 ease-in-out',
    },
    ghost: {
      bg: 'bg-transparent hover:bg-gray-100',
      text: 'text-gray-700 hover:text-gray-900',
      border: 'border-transparent',
      shadow: 'shadow-none',
      transition: 'transition-all duration-150 ease-in-out',
    }
  },

  card: {
    elevated: {
      bg: 'bg-white',
      border: 'border border-gray-200',
      shadow: 'shadow-lg',
      radius: 'rounded-xl',
    },
    flat: {
      bg: 'bg-white',
      border: 'border border-gray-200',
      shadow: 'shadow-none',
      radius: 'rounded-lg',
    },
    interactive: {
      bg: 'bg-white hover:bg-gray-50',
      border: 'border border-gray-200 hover:border-gray-300',
      shadow: 'shadow-md hover:shadow-lg',
      radius: 'rounded-lg',
      transition: 'transition-all duration-150 ease-in-out',
    }
  },

  input: {
    default: {
      bg: 'bg-white',
      border: 'border border-gray-300 focus:border-primary-500',
      ring: 'focus:ring-2 focus:ring-primary-200',
      text: 'text-gray-900 placeholder:text-gray-400',
      radius: 'rounded-lg',
      transition: 'transition-all duration-150 ease-in-out',
    },
    error: {
      bg: 'bg-white',
      border: 'border border-error-300 focus:border-error-500',
      ring: 'focus:ring-2 focus:ring-error-200',
      text: 'text-gray-900 placeholder:text-gray-400',
      radius: 'rounded-lg',
      transition: 'transition-all duration-150 ease-in-out',
    }
  }
};

// Utility Functions
export const getSpacing = (size: keyof typeof designTokens.spacing) => designTokens.spacing[size];
export const getColor = (color: string, shade: number) => {
  const [colorName] = color.split('-') as [keyof typeof designTokens.colors];
  return designTokens.colors[colorName]?.[shade as keyof typeof designTokens.colors[keyof typeof designTokens.colors]];
};
export const getBreakpoint = (size: keyof typeof designTokens.breakpoints) => designTokens.breakpoints[size];