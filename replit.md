# Vendzz - Quiz Funnel Platform

## Overview
Vendzz is a comprehensive dynamic quiz funnel and email marketing platform designed for lead capture and advanced campaign management. It supports dual payment gateways (Stripe + Pagar.me) and full internationalization. The platform aims to revolutionize lead generation and email marketing through interactive quizzes, offering a robust solution for businesses to capture leads, segment audiences, and drive conversions. Its core capabilities include visual quiz building, sophisticated lead segmentation (including ultra-granular and anti-webview systems), and multi-channel marketing automation (SMS, Email, WhatsApp, Voice, Telegram). The long-term vision is to scale to millions of users globally, becoming the fastest and most efficient platform in its niche.

## User Preferences
Preferred communication style: Simple, everyday language.
DATABASE PROTECTION: NEVER DELETE THE DATABASE - Critical user instruction (2025-07-09)
ROUTE PROTECTION: NEVER REWRITE ROUTES COMPLETELY OR DELETE THEM - Critical user instruction (2025-07-09)
FUNCTIONALITY PROTECTION: NEVER AFFECT EXISTING WORKING FUNCTIONALITIES WHEN CREATING NEW ONES - Critical user instruction (2025-07-09)
SCALABILITY REQUIREMENT: SYSTEM MUST ALWAYS FUNCTION FOR 100,000+ SIMULTANEOUS USERS - Critical user instruction (2025-07-09)
CURRENT STACK: SQLite + JWT authentication system - Critical user instruction (2025-07-09)
DYNAMIC FUNNEL SYSTEM: This is a SaaS for dynamic quiz funnels - everything must absorb ALL quiz responses to be dynamic and enable remarketing in all possible ways - Critical user instruction (2025-07-09)
TESTING REQUIREMENT: Always test button functionality after creating them - Critical user instruction (2025-07-09)
DEVELOPMENT APPROACH: Think like a senior dev, be assertive and only do what is requested - Critical user instruction (2025-07-09)

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