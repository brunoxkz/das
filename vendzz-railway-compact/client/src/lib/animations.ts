// Animation System with Micro-interactions

// CSS-in-JS Animation Utilities
export const animations = {
  // Entrance animations
  fadeIn: 'animate-in fade-in duration-300 ease-out',
  slideInUp: 'animate-in slide-in-from-bottom-4 duration-300 ease-out',
  slideInDown: 'animate-in slide-in-from-top-4 duration-300 ease-out',
  slideInLeft: 'animate-in slide-in-from-left-4 duration-300 ease-out',
  slideInRight: 'animate-in slide-in-from-right-4 duration-300 ease-out',
  scaleIn: 'animate-in zoom-in-95 duration-200 ease-out',
  
  // Exit animations
  fadeOut: 'animate-out fade-out duration-200 ease-in',
  slideOutUp: 'animate-out slide-out-to-top-4 duration-200 ease-in',
  slideOutDown: 'animate-out slide-out-to-bottom-4 duration-200 ease-in',
  slideOutLeft: 'animate-out slide-out-to-left-4 duration-200 ease-in',
  slideOutRight: 'animate-out slide-out-to-right-4 duration-200 ease-in',
  scaleOut: 'animate-out zoom-out-95 duration-150 ease-in',

  // Continuous animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  ping: 'animate-ping',

  // Hover effects
  hoverScale: 'hover:scale-105 transition-transform duration-200 ease-out',
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out',
  hoverGlow: 'hover:shadow-lg hover:shadow-primary-200 transition-all duration-200 ease-out',

  // Focus effects
  focusRing: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all duration-150',
  focusScale: 'focus:scale-105 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all duration-150',

  // Loading states
  skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  shimmer: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',

  // Interaction feedback
  tapScale: 'active:scale-95 transition-transform duration-75',
  tapFade: 'active:opacity-70 transition-opacity duration-75',
  
  // Drag and drop
  dragPreview: 'scale-105 rotate-2 shadow-xl opacity-90 transition-all duration-200',
  dragOver: 'bg-primary-50 border-primary-300 border-2 border-dashed transition-all duration-200',
  dropZone: 'border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors duration-200',
};

// Stagger animation utilities
export const staggerAnimations = {
  container: 'space-y-1',
  item: (index: number) => `animate-in slide-in-from-left-4 fade-in duration-300 ease-out`,
  itemDelay: (index: number) => `style-[animation-delay:${index * 50}ms]`,
};

// Micro-interaction components
export const microInteractions = {
  // Button press effect
  buttonPress: 'active:scale-95 transition-transform duration-75 ease-out',
  
  // Card hover effect
  cardHover: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out',
  
  // Input focus effect
  inputFocus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150 ease-out',
  
  // Tab activation
  tabActive: 'data-[state=active]:bg-primary-100 data-[state=active]:text-primary-900 transition-all duration-150',
  
  // Dropdown reveal
  dropdownReveal: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  
  // Tooltip animation
  tooltipReveal: 'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade',
  
  // Modal animation
  modalReveal: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  
  // Notification slide
  notificationSlide: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:sm:slide-in-from-bottom-full',
};

// Utility functions
export const createStaggerDelay = (index: number, delayMs: number = 50) => ({
  animationDelay: `${index * delayMs}ms`,
});

export const createSpringAnimation = (
  property: string,
  from: string,
  to: string,
  duration: number = 300
) => ({
  transition: `${property} ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
});

// Advanced animation hooks
export const useStaggerAnimation = (itemCount: number, delayMs: number = 100) => {
  return Array.from({ length: itemCount }, (_, i) => ({
    style: createStaggerDelay(i, delayMs),
    className: animations.slideInUp,
  }));
};

// Drag and drop animation utilities
export const dragDropAnimations = {
  sortableItem: {
    base: 'transition-transform duration-200 ease-out',
    dragging: 'scale-105 rotate-2 shadow-xl z-50 opacity-90',
    dragOver: 'transform translate-y-2',
  },
  
  sortableContainer: {
    base: 'transition-all duration-200 ease-out',
    dragOver: 'bg-primary-50 border-primary-300',
  },
  
  dragHandle: {
    base: 'opacity-50 hover:opacity-100 transition-opacity duration-150',
    active: 'cursor-grabbing',
  },
};

// Animation presets for common UI patterns
export const presets = {
  // Page transitions
  pageTransition: {
    enter: 'animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out',
    exit: 'animate-out fade-out slide-out-to-top-4 duration-200 ease-in',
  },
  
  // List item animations
  listItem: {
    enter: 'animate-in slide-in-from-left-4 fade-in duration-300 ease-out',
    exit: 'animate-out slide-out-to-right-4 fade-out duration-200 ease-in',
  },
  
  // Card animations
  card: {
    hover: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out',
    press: 'active:scale-98 transition-transform duration-75',
  },
  
  // Form interactions
  form: {
    input: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150',
    button: 'hover:scale-105 active:scale-95 transition-transform duration-150',
    error: 'animate-in shake duration-300',
  },
};