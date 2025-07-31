# Vendzz - Interactive Quiz & Marketing Automation Platform

## Overview

Vendzz is a comprehensive SaaS platform for creating interactive quizzes and marketing automation campaigns. The platform enables users to build dynamic quiz funnels, capture leads, and execute sophisticated marketing campaigns through multiple channels including SMS, WhatsApp, email, and social media integrations. Built with a modern full-stack architecture, Vendzz provides enterprise-level features for quiz creation, lead management, payment processing, and multi-channel marketing automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS for utility-first styling with custom design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular component architecture with reusable UI components
- **State Management**: React hooks and context for application state
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for API endpoints
- **Language**: TypeScript for type safety across the entire application
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with refresh token mechanism
- **Security**: Helmet for security headers, rate limiting, and CORS protection
- **File Processing**: Multer for file uploads and media handling

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect for database schema management
- **Schema Location**: Centralized schema definitions in `shared/schema.ts`
- **Migrations**: Database migrations managed through Drizzle Kit
- **Connection**: Environment-based database URL configuration

### API Architecture
- **RESTful Design**: Standard REST endpoints for resource management
- **Middleware Stack**: Compression, security headers, body parsing, and authentication
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Rate Limiting**: Request rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration for frontend integration

### Quiz System Architecture
- **Dynamic Rendering**: Server-side quiz generation with customizable templates
- **Response Processing**: Real-time quiz response collection and analysis
- **Lead Capture**: Integrated lead capture with form validation
- **Analytics**: Quiz performance tracking and conversion metrics

### Marketing Automation
- **Multi-Channel Support**: SMS, WhatsApp, email, and social media campaign management
- **Segmentation**: Advanced lead segmentation based on quiz responses and demographics
- **Scheduling**: Campaign scheduling with automated delivery
- **Pixel Integration**: Support for Facebook Pixel, Google Analytics, TikTok Pixel, and other tracking systems

### Payment Processing
- **Stripe Integration**: Complete Stripe payment processing with subscription management
- **Checkout Flow**: Hosted checkout sessions with trial period support
- **Subscription Management**: Recurring billing and subscription lifecycle management
- **Webhook Handling**: Stripe webhook processing for payment events

## External Dependencies

### Payment Services
- **Stripe**: Primary payment processor for subscriptions and one-time payments
- **Stripe Checkout**: Hosted payment pages with trial period configuration
- **Stripe Webhooks**: Real-time payment event processing

### Communication Services
- **SMS Providers**: Integration with SMS gateway services for bulk messaging
- **WhatsApp Business API**: WhatsApp campaign management and automation
- **Email Services**: SMTP integration for email marketing campaigns

### Analytics and Tracking
- **Facebook Pixel**: Social media conversion tracking and audience building
- **Google Analytics**: Web analytics and conversion measurement
- **TikTok Pixel**: TikTok advertising conversion tracking
- **Custom Analytics**: Internal analytics system for quiz and campaign performance

### Development and Deployment
- **Replit**: Development environment with integrated hosting
- **Environment Variables**: Secure configuration management for API keys and secrets
- **File Storage**: Media file storage and management system

### Security and Infrastructure
- **JWT**: JSON Web Token authentication with refresh token rotation
- **Rate Limiting**: Request throttling to prevent abuse
- **Security Headers**: Helmet.js for security header management
- **CORS**: Cross-origin request handling for frontend-backend communication

### Database and ORM
- **PostgreSQL**: Primary database for data persistence
- **Drizzle ORM**: Type-safe database operations and schema management
- **Database Migrations**: Version-controlled schema changes through Drizzle Kit