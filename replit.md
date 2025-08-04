# Dual Project: Browser Extension + WordPress Theme

## Overview
Two concurrent development projects: 
1) **Chrome/Opera Browser Extension** - Screen-splitting sidebar with productivity tools (to-do list, Pomodoro timer, ambient sounds) with universal website compatibility
2) **WordPress Theme** - Professional B2C2.com replica theme for fintech/blockchain companies with complete Elementor compatibility

## Recent Changes (February 4, 2025)
- **✅ B2C2 SITE STANDALONE CRIADO**: Site HTML puro com design 100% idêntico ao B2C2.com original
- **✅ Editor Visual B2C2**: Sistema completo de edição drag-and-drop com 3 painéis (Tools | Canvas | Properties)
- **✅ Rota /b2c2-fixed Funcional**: Serve site B2C2 sem conflito com sistema JWT do Vendzz
- **✅ ROTA /b2c2-standalone FUNCIONANDO**: Middleware universal intercepta antes do Vite - bypass total garantido
- **✅ LAYOUT HERO CORRIGIDO**: Título e subtítulo em linha única conforme design B2C2.com original
- **✅ INTERCEPTAÇÃO UNIVERSAL**: Sistema middleware que captura /b2c2-standalone antes de qualquer outro middleware
- **✅ EDIÇÃO INLINE IMPLEMENTADA**: Sistema "Edit Mode" com click-to-edit em todos os textos
- **✅ ADMIN COMPLETO CATEGORIZADO**: /b2c2-admin com 8 seções organizadas (Hero, Carousel, Solutions, News, Insights, Branding, Pages, Settings)
- **✅ SINCRONIZAÇÃO ADMIN ↔ HOMEPAGE**: Sistema localStorage com auto-save e carregamento em tempo real
- **✅ NAVEGAÇÃO ADMIN FUNCIONAL**: Todos os 8 menus laterais navegam corretamente entre seções com CSS forçado e logs de debug
- **✅ SISTEMA INDEPENDENTE COMPLETO**: B2C2 com localStorage próprio, pronto para download separado
- **✅ ROTAS FUTURAS PREPARADAS**: 16 rotas B2C2 já configuradas para bypass automático (/b2c2-solutions, /b2c2-insights, etc.) + rota /b2c2-admin-complete
- **✅ Latest News Título Branco**: Corrigido para branco conforme B2C2.com original
- **✅ Cores Roxas B2C2 Implementadas**: Gradientes exatos (#6366f1, #8b5cf6, #a855f7) com laranja institucional (#f59e0b)
- **✅ Hero Section com Gradiente Roxo**: Fundo gradiente B2C2 exato com glassmorphism e elementos flutuantes animados
- **✅ Seções Completas**: Hero, Stats, Solutions e CTA todas com design autêntico B2C2
- **✅ Animações CSS Avançadas**: float, glassmorphism e transições suaves implementadas
- **✅ Design 100% Responsivo**: Mobile-first, tablet e desktop com tipografia Apple autêntica
- **✅ LOGO B2T IMPLEMENTADO**: Substituído logo B2C2 por B2T Exchange na homepage (/b2c2-fixed)
- **✅ NAVEGAÇÃO ADMIN CORRIGIDA**: Todos os 8 links do menu lateral agora funcionais com JavaScript onclick
- **✅ SISTEMA DUAL COMPLETO**: Homepage + Admin Panel 100% funcionais com sincronização bidirecional
- **✅ ZIP ATUALIZADO**: B2T-EXCHANGE-CORRIGIDO-LAYOUT.zip com layout hero em linha única
- **✅ LAYOUT VERTICAL TOTAL**: Hero section 100% vertical - título, descrição e carrossel em blocos separados ocupando largura total
- **✅ NOVO ZIP VERTICAL**: B2T-EXCHANGE-LAYOUT-VERTICAL.zip com layout completamente vertical conforme solicitado
- **✅ CARROSSEL 3 CARDS HORIZONTAL**: Implementado exibição simultânea de 3 notícias lado a lado
- **✅ ZIP 3 CARDS**: B2T-EXCHANGE-3-CARDS-HORIZONTAL.zip com 3 cards de notícias visíveis simultaneamente
- **✅ CARROSSEL 4 CARDS FINAL**: Altura reduzida para 280px, 4 cards com cores B2C2 autênticas conforme referência
- **✅ CORES E ESTILOS B2C2**: Gradientes roxos, cinza escuro, verde - exatamente como nas imagens de referência
- **✅ ZIP FINAL**: B2T-EXCHANGE-4-CARDS-FINAL.zip com layout otimizado e cores corretas

## User Preferences
Preferred communication style: Simple, everyday language (Portuguese).
Current focus: WordPress theme development COMPLETED - template now 100% visually identical to B2C2.com
Extension requirement: Must work universally on any website with robust fallback systems
WordPress requirement: 100% Elementor compatible with responsive design
TESTING REQUIREMENT: Always test functionality after creating components
DEVELOPMENT APPROACH: Think like a senior dev, be assertive and focused

## System Architecture

### Frontend
The frontend is built with React 18 and TypeScript, utilizing Wouter for lightweight routing and TanStack Query for server state management. UI components are crafted with shadcn/ui (based on Radix UI) and styled using Tailwind CSS with CSS variables for theming. Vite serves as the build tool, providing hot module replacement. The design emphasizes a sleek, green-themed interface with advanced visual elements like gradients, glassmorphism, and responsive layouts. Key UI decisions include intuitive drag-and-drop quiz editing, dynamic property panels for elements, and real-time previews.

### Backend
The backend runs on Express.js with TypeScript and Node.js (ES modules). The primary database is SQLite, managed via Drizzle ORM. Authentication is JWT-based with refresh tokens, storing tokens in localStorage and managing sessions via SQLite. Payment processing is integrated with Stripe. Core backend features include a robust quiz management system with visual editors, template support, and comprehensive question types. Lead data is automatically extracted and processed. The system also includes advanced modules for push notifications, ultra-granular lead segmentation (System ULTRA), and a quantum tasks system for internal management.

### Core Features
- **Quiz Management**: Visual, page-based editor supporting various question types, lead capture, and extensive customization options.
- **Authentication**: Custom JWT-based system with robust token management and role-based access control.
- **Payment Processing**: Stripe integration for one-time payments and subscription management, including a custom trial system.
- **Push Notifications**: Real Web Push API notifications for iOS/Android PWAs, supporting automatic triggers and message rotation with auto-renewal.
- **Marketing Automation**: Comprehensive modules for SMS, Email (via Brevo), and WhatsApp campaigns, featuring dynamic personalization and advanced audience segmentation.
- **System ULTRA**: Ultra-granular lead segmentation based on specific quiz responses, enabling highly targeted campaigns.
- **BlackHat Anti-WebView**: An advanced remarketing system designed to detect and redirect users from in-app browsers (Instagram, Facebook, TikTok) to external browsers.
- **Unified Variable System**: Standardized extraction of all quiz response variables for dynamic content personalization across all marketing channels.
- **Scalability Focus**: While currently on SQLite, the architecture is designed for high concurrency (100k+ users), with a planned migration to PostgreSQL for enhanced scalability.
- **Modularity (Ongoing)**: Efforts are in progress to modularize the backend's monolithic structure into more manageable components.

## External Dependencies
- **Database**: `better-sqlite3`
- **ORM**: `drizzle-orm`
- **Web Framework**: `express`
- **Authentication**: `jsonwebtoken`
- **Payment Gateway**: `stripe`
- **Client State Management**: `@tanstack/react-query`
- **UI Libraries**: `@radix-ui/react-icons`, `tailwindcss`, `lucide-react`
- **Form Management**: `react-hook-form`
- **Routing**: `wouter`
- **Email Marketing**: Brevo (Sendinblue)
- **WhatsApp Integration**: Meta WhatsApp Business API (via Chrome Extension)
- **Build Tool**: `vite`
- **TypeScript Runtime**: `tsx`