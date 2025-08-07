# Overview

This is a comprehensive full-stack web application called "Vendzz" - a marketing automation platform focused on lead generation, funnel management, and multi-channel campaign delivery (SMS, Email, WhatsApp, Telegram). The system is built as a monorepo with a Express.js backend, React frontend, SQLite database, and includes Chrome extensions for WhatsApp automation.

The application serves as a complete marketing funnel platform where users can create quizzes, capture leads, manage campaigns, and automate message delivery across multiple channels. It includes sophisticated features like push notifications, payment processing, rate limiting, and real-time analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: SQLite with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **File Structure**: Monorepo with shared schema between client and server

## Database Design
- **Primary Database**: SQLite using Drizzle ORM
- **Schema Location**: `shared/schema.ts` for type sharing across frontend/backend
- **Migration Strategy**: Drizzle Kit for database migrations
- **Backup Support**: Multiple database providers supported (Neon, LibSQL)

## API Architecture
- **Pattern**: RESTful API with Express routes
- **Middleware**: CORS, compression, rate limiting, security headers
- **Request Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Security Features
- **Rate Limiting**: Intelligent rate limiting for different endpoints
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all user inputs
- **Security Headers**: Comprehensive security headers implementation

## Campaign System
- **Multi-Channel Support**: SMS (Twilio), Email (Brevo), WhatsApp, Telegram
- **Campaign Types**: Remarketing, live campaigns, A/B testing, ultra-customized campaigns
- **Message Personalization**: Dynamic variable substitution and country-specific formatting
- **Retry Logic**: Smart retry mechanisms with configurable delays

## Chrome Extension Architecture
- **Manifest V3**: Modern Chrome extension using service workers
- **WhatsApp Integration**: Content scripts for WhatsApp Web automation
- **Real-time Sync**: Background sync with main application
- **Local Campaign Management**: Hybrid approach with local storage and server sync

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL (production) via DATABASE_URL environment variable
- **File Storage**: Local file system for uploads and static assets
- **Email Service**: Brevo (SendinBlue) for transactional and marketing emails
- **SMS Service**: Twilio for SMS campaign delivery

## Payment Processing
- **Stripe**: Complete payment processing with React Stripe.js integration
- **PayPal**: PayPal Server SDK for alternative payment methods

## Communication Services
- **SendGrid**: Email delivery service as backup option
- **Push Notifications**: Web Push API for real-time notifications
- **WhatsApp Business API**: For automated WhatsApp messaging

## Development and Deployment
- **Railway**: Primary deployment platform with automatic builds
- **Replit**: Development environment support
- **Vite**: Build tool for client-side bundling
- **TypeScript**: Type safety across the entire application

## UI and Design
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library

## Analytics and Monitoring
- **Custom Analytics**: Built-in campaign performance tracking
- **Rate Limiting**: express-rate-limit for API protection
- **Logging**: Console-based logging with structured output
- **Health Monitoring**: Built-in health check endpoints