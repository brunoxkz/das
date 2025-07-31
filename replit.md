# Dual Project: Browser Extension + WordPress Theme

## Overview
Two concurrent development projects: 
1) **Chrome/Opera Browser Extension** - Screen-splitting sidebar with productivity tools (to-do list, Pomodoro timer, ambient sounds) with universal website compatibility
2) **WordPress Theme** - Professional B2C2.com replica theme for fintech/blockchain companies with complete Elementor compatibility

## Recent Changes (January 31, 2025)
- **✅ TEMPLATE 100% IDÊNTICO AO B2C2.COM**: Replicação visual exata concluída com sucesso
- **✅ Header B2C2 Exato**: Navegação minimalista (Solutions, About, Insights, Join B2C2) com logo B2C2 autêntico
- **✅ Hero Section Fiel**: Título "More than just a liquidity provider, B2C2 is a digital asset pioneer" com botões exatos
- **✅ Footer Minimalista**: Layout clean com estrutura 4 colunas (Company, Solutions, Company, Legal) idêntico ao original
- **✅ Cores e Tipografia Autênticas**: Sistema de fontes Apple (-apple-system, BlinkMacSystemFont) e cores exatas (#007bff, #1a1a1a, #666)
- **✅ Editabilidade WordPress Completa**: Hero section, valores e estatísticas 100% editáveis via Customizer
- **✅ Responsividade B2C2**: Mobile-first design com breakpoints profissionais (768px, 480px)
- **✅ Estrutura de Navegação Real**: URLs exatos (/solutions/trading-overview, /about, /insights, /join-b2c2)
- **✅ Sistema de Menu Nativo**: wp_nav_menu com fallback automático para navegação B2C2
- **✅ Arquivo Final Atualizado**: B2C2-WordPress-Theme-Complete.zip recriado com template idêntico

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