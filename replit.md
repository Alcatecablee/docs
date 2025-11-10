# Viberdoc - AI-Powered Documentation Generator

## Overview
Viberdoc is an AI-powered documentation intelligence platform designed for Developer Relations teams. It aggregates scattered community knowledge from over 10 sources (e.g., Stack Overflow, GitHub, YouTube, Reddit) to generate professional, Apple-style documentation. The system utilizes an intelligent agent-based architecture to analyze websites, research community sources, and produce enterprise-quality documentation in various formats (PDF, DOCX, web). The platform aims to provide significant cost savings compared to manual documentation efforts, targeting a market of established companies with vibrant developer ecosystems.

## User Preferences
Preferred communication style: Simple, everyday language.
Design preferences: Clean cyan-blue color scheme like Replit using rgb(102,255,228) - NO emojis in production UI, NO gradients (except dark background gradients), dark theme (rgb(14,19,23) to rgb(34,38,46)), modern glassmorphism effects (from-white/10 to-white/5 with backdrop-blur-sm), Heroicons for consistency.

## System Architecture

### UI/UX & Design
The frontend uses React with TypeScript and Vite, styled with Tailwind CSS and Shadcn/ui components (built on Radix UI). The design emphasizes a modern, elegant aesthetic inspired by Replit, featuring a cyan-blue color scheme, dark theme, Inter font, and glassmorphism effects. It includes 5 professional themes with a live switcher and a UI for custom theme creation. The documentation editor supports block-level editing, advanced features like undo/redo and find & replace, and section management with drag-and-drop. Hosted documentation includes enterprise-quality, full-text search with a professional UI, real-time results, and accessibility features.

### Technical Implementation
The backend is built with Node.js and Express, utilizing a RESTful API structure. Key architectural decisions include:
- **Agent-Based Architecture**: A production-ready intelligent multi-agent system (Research, Code, Structure agents with Critic validation) for documentation generation, including auto-refinement based on quality scores.
- **Queue System**: BullMQ with Redis for robust job queuing.
- **Database Transactions**: Drizzle ORM ensures atomic operations.
- **Input Validation**: Comprehensive Zod schemas, including SSRF prevention and AI output validation.
- **Memory Management**: LRU caches prevent unbounded memory growth.
- **Circuit Breaker Pattern**: Prevents cascading failures from AI providers.
- **Pipeline Timeout**: 10-minute hard timeout for jobs with automatic cleanup.
- **Multi-Provider LLM Integration**: Supports 7 AI providers with intelligent free-first routing, token bucket rate limiting, and quota management, ensuring automatic fallback to available providers.
- **Security Hardening**: Comprehensive credential management, removal of hardcoded API keys, and verification of all external services.

### Feature Specifications
- **AI Pipeline**: A 3-stage AI pipeline (Structure Understanding & Content Extraction, Professional Documentation Writing, Metadata Generation & SEO Optimization) with implicit quality validation and auto-refinement. Features dynamic scaling of research depth, source trust scoring, dynamic section generation, and source attribution.
- **Export System**: Comprehensive export to PDF, DOCX, Markdown, JSON, HTML, and Custom Domain hosting.
- **Subscription System**: PayPal recurring subscriptions with Free, Pro, and Enterprise tiers, integrated with Supabase Auth.
- **Quotation-Based Pricing System**: Instant pricing calculator for DevRel projects with a transparent formula, premium add-ons, and ROI comparison.
- **Dashboard System**: Three-tier architecture (Creator Hub, Team Command Center, Enterprise Insights) providing role-based analytics.
- **Research Feed & Quality Scoring**: Live, granular updates during AI documentation generation, with a comprehensive quality scoring system (0-100 scale).
- **White-Label Customization**: Full system for white-labeling, including custom branding and email templates.
- **Enterprise API Access**: Dedicated API endpoint for programmatic generation with API key authentication.
- **Security Features**: Fail-closed webhook verification, email validation, audit trails, and secure API key management.

### Data Storage
The project uses PostgreSQL via Supabase, managed with Drizzle ORM for type-safe operations. The data model includes 20 tables covering users, documentation, payments, subscriptions, organizations, webhooks, and analytics.

## External Dependencies

### Core Services
*   **Multi-Provider LLM System** (Free-First Priority):
    *   **Google AI (Gemini)**: Primary provider
    *   **Together AI**:
    *   **OpenRouter**:
    *   **Groq**:
    *   **Hyperbolic**:
    *   **DeepSeek**:
    *   **OpenAI**: Last resort paid fallback
*   **Supabase**: PostgreSQL database hosting and user authentication.
*   **PayPal**: Recurring subscription billing.
*   **BullMQ**: Job queue system.
*   **Redis**: BullMQ job persistence.
*   **SerpAPI**: Search API.
*   **Brave Search API**: Automatic fallback search API.
*   **YouTube API**: Video research.

### Third-party Libraries
*   **UI Components**: Radix UI primitives, Shadcn/ui.
*   **Form Validation**: Zod.
*   **Database**: Drizzle ORM.
*   **Styling**: Tailwind CSS, `class-variance-authority`.
*   **State**: TanStack Query.
*   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`, `sharp`.