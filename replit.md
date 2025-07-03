# Quiz Builder Application

## Overview

This is a full-stack quiz builder application that enables users to create, customize, and deploy interactive quizzes for lead generation. Built with React, Express, and PostgreSQL, it features a modern UI with shadcn/ui components, Stripe integration for subscriptions, and Replit authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit OpenID Connect (OIDC)
- **Payment Processing**: Stripe integration

## Key Components

### Database Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Centralized in `shared/schema.ts` with type-safe definitions
- **Migrations**: Managed through Drizzle Kit

### Authentication System
- **Provider**: Replit OIDC authentication
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Middleware**: Passport.js strategy for OIDC integration
- **User Management**: Automatic user creation and profile management

### Quiz Management
- **Builder**: Visual drag-and-drop quiz editor with live preview
- **Templates**: Pre-built quiz templates for different use cases
- **Questions**: Support for multiple choice, text input, rating, and email capture
- **Customization**: Theme selection, progress bars, and lead collection settings

### Payment Integration
- **Provider**: Stripe for subscription management
- **Frontend**: Stripe Elements for payment forms
- **Backend**: Webhook handling for subscription updates
- **Plans**: Free and premium tier support

## Data Flow

### User Authentication Flow
1. User accesses application
2. Redirected to Replit OIDC provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL storage
5. User redirected to dashboard

### Quiz Creation Flow
1. User selects template or creates from scratch
2. Visual editor allows question addition/modification
3. Real-time preview shows user experience
4. Quiz settings configured (theme, lead collection)
5. Quiz saved to database with structured JSON

### Lead Generation Flow
1. Quiz deployed with unique URL
2. Respondents complete quiz questions
3. Lead information collected based on settings
4. Analytics tracked for performance metrics
5. Results stored for owner review

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **passport**: Authentication middleware
- **stripe**: Payment processing
- **@tanstack/react-query**: Client-side state management

### UI/UX Dependencies
- **@radix-ui**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **esbuild**: Server-side bundling
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon serverless PostgreSQL
- **Environment**: Replit with custom domains support

### Production Build
- **Client**: Vite build to static assets
- **Server**: esbuild bundle for Node.js deployment
- **Database**: PostgreSQL with connection pooling
- **Assets**: Served from Express static middleware

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `STRIPE_SECRET_KEY`: Stripe API key
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC provider URL

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```