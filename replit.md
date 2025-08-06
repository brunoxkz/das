# Multi-Project Workspace

## Overview
Four concurrent development projects: 
1) **Sistema Vendas WhatsApp** - COMPLETO: Gestão hierárquica de pedidos com workflow pós-entrega, 3 métodos pagamento, autenticação JWT, tracking real-time (SQLite + PostgreSQL ready)
2) **B2T Exchange Static Site** - HTML/CSS/JS replica of B2C2.com with mobile optimization and admin panel
3) **Vendzz Marketing Platform** - Full-stack quiz/marketing automation system with SQLite
4) **SQL Project Independent** - Standalone SQL project with SQLite + PostgreSQL migration capability

## Recent Changes (August 6, 2025)
- **✅ SISTEMA VENDAS WHATSAPP COMPLETO**: Sistema 100% funcional com autenticação, gestão hierárquica e workflow pós-entrega
- **✅ AUTENTICAÇÃO JWT FUNCIONANDO**: Login admin/atendente com tokens de acesso e refresh implementados
- **✅ CONTROLE HIERÁRQUICO**: Admin vê todos pedidos, atendentes veem apenas os seus
- **✅ DATABASE SQLITE OPERACIONAL**: Banco configurado com tabelas (users, products, orders, order_items, order_logs)
- **✅ API REST COMPLETA**: Rotas para auth, users, products, orders com middleware de autenticação 
- **✅ CREDENCIAIS TESTE CONFIRMADAS**: admin/admin123 e atendente1/admin123 funcionando
- **✅ 3 MÉTODOS PAGAMENTO**: Logzz, online payment, Braip implementados no schema
- **✅ WORKFLOW PÓS-ENTREGA**: Status de confirmação (delivered/rescheduled/cancelled) com razões
- **✅ TRACKING TEMPO REAL**: Sistema de logs de auditoria para todas ações nos pedidos
- **✅ MIGRATION POSTGRESQL PRONTA**: Script completo para migração SQLite → PostgreSQL
- **✅ DASHBOARD WEB CRIADO**: Interface HTML para demonstração com login e gestão
- **✅ SISTEMA TESTE COMPLETO**: Script de teste automatizado validando todas as funcionalidades
- **✅ B2C2 SITE STANDALONE**: Site HTML puro com design 100% idêntico ao B2C2.com original
- **✅ PROJETO SQL INDEPENDENTE**: Nova pasta /sql-project com estrutura completa SQLite + PostgreSQL migration ready
- **✅ CHROME EXTENSION FINALIZADA**: Extensão 100% funcional com ícones PNG/SVG criados, integração real Logzz implementada, normalização telefone automática, botões dinâmicos, interface visual 600x700px responsiva, automação completa com timer 1h, manifest V3 válido para Chrome/Opera

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

#### B2T Exchange (Static Site)
- **Pixel-Perfect Design**: 100% identical to B2C2.com original with B2T branding
- **Mobile Optimization**: Carousel with arrow navigation (‹ ›) showing 1 card at a time
- **Admin Panel**: Complete content management system with localStorage sync
- **GoDaddy Ready**: Pure HTML/CSS/JS for shared hosting deployment

#### Vendzz Platform (Main System)
- **Quiz Management**: Visual, page-based editor supporting various question types, lead capture, and extensive customization options.
- **Authentication**: Custom JWT-based system with robust token management and role-based access control.
- **Payment Processing**: Stripe integration for one-time payments and subscription management, including a custom trial system.
- **Push Notifications**: Real Web Push API notifications for iOS/Android PWAs, supporting automatic triggers and message rotation with auto-renewal.
- **Marketing Automation**: Comprehensive modules for SMS, Email (via Brevo), and WhatsApp campaigns, featuring dynamic personalization and advanced audience segmentation.
- **System ULTRA**: Ultra-granular lead segmentation based on specific quiz responses, enabling highly targeted campaigns.
- **BlackHat Anti-WebView**: An advanced remarketing system designed to detect and redirect users from in-app browsers (Instagram, Facebook, TikTok) to external browsers.
- **Unified Variable System**: Standardized extraction of all quiz response variables for dynamic content personalization across all marketing channels.
- **Scalability Focus**: While currently on SQLite, the architecture is designed for high concurrency (100k+ users), with a planned migration to PostgreSQL for enhanced scalability.

#### Sistema Vendas WhatsApp (COMPLETO - Porta 3002)
- **Autenticação JWT**: Sistema completo com access e refresh tokens
- **Gestão Hierárquica**: Admin vê todos pedidos, atendentes apenas os seus
- **3 Métodos Pagamento**: Logzz, online payment, Braip
- **Workflow Pós-Entrega**: Confirmação com delivered/rescheduled/cancelled + motivos
- **Tracking Real-Time**: Logs de auditoria para todas ações
- **Database**: SQLite operacional + migration PostgreSQL ready
- **API REST**: Todas rotas funcionais (/api/auth, /api/users, /api/orders, /api/products)
- **Dashboard Web**: Interface HTML de demonstração
- **Credenciais**: admin/admin123, atendente1/admin123

#### SQL Project Independent
- **Cross-Database Support**: SQLite for development, PostgreSQL migration ready
- **Express API**: RESTful endpoints with Zod validation and error handling
- **Services Architecture**: Modular service layer with UserService, ProductService, OrderService
- **Migration Scripts**: Automated database setup, seed data, and reset functionality
- **TypeScript Ready**: Full type safety with Drizzle ORM schema generation

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