# Overview

Linkhub Pro is a comprehensive Link-in-Bio SaaS platform that allows users to create customizable bio link pages with multiple blocks of content. The application follows a freemium model where free users get 1 page with basic blocks, while Pro users unlock unlimited pages and premium features. Built with modern technologies including React, TypeScript, Node.js serverless functions, and PostgreSQL with Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18 + TypeScript**: Component-based UI with type safety
- **Vite**: Fast development build tool with hot module replacement
- **Tailwind CSS + shadcn/ui**: Utility-first styling with pre-built component library
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **@dnd-kit**: Drag-and-drop functionality for page builder

## Backend Architecture
- **Domain-Driven Design (DDD)**: Clean architecture with separated business logic
  - Domain layer: Core business entities and repository interfaces
  - Application layer: Use cases and business services
  - Infrastructure layer: Database implementations and external integrations
  - Presentation layer: API handlers and controllers
- **Netlify Functions**: Serverless API endpoints for scalable backend
- **Express.js**: Development server with middleware support
- **JWT Authentication**: Token-based user sessions with bcrypt password hashing

## Data Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database for production
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Connection Pooling**: Efficient database connections via @neondatabase/serverless
- **Structured Schema**: Tables for users, pages, blocks, subscriptions, payments, analytics events, and admin audit logs

## Key Design Patterns
- **Repository Pattern**: Abstract database operations behind interfaces
- **Service Layer**: Business logic encapsulation in application services
- **Command/Query Separation**: Clear distinction between read and write operations
- **Event Tracking**: Analytics system for user interactions and conversions

## Authentication & Authorization
- **Multi-provider Auth**: Email/password credentials with Google OAuth integration
- **Role-Based Access Control**: Admin and tenant roles with feature restrictions
- **Plan-based Feature Gates**: Free vs Pro plan limitations enforced at service layer
- **JWT Token Management**: Secure session handling with token verification middleware

## Block System
- **20+ Block Types**: Flexible content blocks including links, social media, contact forms, product cards, galleries, and premium features
- **Drag-and-Drop Editor**: Visual page builder with real-time preview
- **Pro Block Restrictions**: Premium blocks (dynamic_feed, product_card, paywall) limited to Pro users
- **Position-based Ordering**: Sortable block positions with atomic reordering

# External Dependencies

## Payment Processing
- **Midtrans**: Indonesian payment gateway for subscription billing
- **Webhook Integration**: Automated payment status updates and subscription management
- **Subscription Management**: Monthly/yearly billing cycles with automatic renewals

## Database Services
- **Neon**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle Kit**: Schema migrations and database management tools

## Authentication
- **Google OAuth**: Social login integration for user convenience
- **bcrypt**: Secure password hashing and verification

## Development Tools
- **Replit Integration**: Development environment with runtime error handling
- **ESLint + TypeScript**: Code quality and type checking
- **Vite Plugins**: Development experience enhancements

## Deployment
- **Netlify**: Static site hosting with serverless functions
- **Environment Variables**: Secure configuration management for database URLs, API keys, and JWT secrets
- **Build Pipeline**: Automated builds with client-side bundling and server function compilation

## Analytics & Monitoring
- **Custom Analytics**: Event tracking system for page views, clicks, and conversions
- **Shortlink Management**: URL shortening service with click tracking
- **Admin Dashboard**: User management and system metrics monitoring