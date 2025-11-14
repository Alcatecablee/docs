# ViberDoc - Enterprise Intelligence Platform

## Strategic Direction (Updated November 14, 2025)

**PIVOT IN PROGRESS:** Transitioning from "DevRel documentation generator" to "Enterprise Intelligence Platform" serving two high-value markets with proven demand and willingness to pay.

### New Product Vision
ViberDoc is an AI-powered competitive intelligence and RFP automation platform that aggregates scattered information from 10+ sources (Reddit, YouTube, GitHub, StackOverflow, forums, documentation sites) and synthesizes it into actionable business intelligence. The platform serves enterprise sales and product teams with automated competitive battlecards, RFP response generation, and real-time market intelligence.

**Target Markets:**
1. **Competitive Intelligence:** Product/Strategy teams at B2B SaaS ($50k-200k/year contracts)
2. **RFP Automation:** Sales teams at enterprise companies ($200/user/month)

**Path to $1M ARR:** 10-20 customers at $50k-100k/year (vs. 50-100 customers in old DevRel positioning)

---

## Core Asset: Multi-Source Intelligence Engine

**What Makes Us Different:**
Our engine doesn't just scrape - it intelligently synthesizes community knowledge with AI validation:
- ✅ Multi-source aggregation (10+ platforms)
- ✅ AI synthesis with quality validation (85%+ accuracy)
- ✅ Trust scoring and cross-verification
- ✅ Multi-agent architecture (Research → Analysis → Validation)
- ✅ Export to multiple formats (PDF, DOCX, JSON, HTML)

---

## User Preferences
Preferred communication style: Simple, everyday language.
Design preferences: Clean cyan-blue color scheme like Replit using rgb(102,255,228) - NO emojis in production UI, NO gradients (except dark background gradients), dark theme (rgb(14,19,23) to rgb(34,38,46)), modern glassmorphism effects (from-white/10 to-white/5 with backdrop-blur-sm), Heroicons for consistency.

---

## System Architecture

### UI/UX & Design
The frontend uses React with TypeScript and Vite, styled with Tailwind CSS and Shadcn/ui components (built on Radix UI). The design emphasizes a modern, elegant aesthetic inspired by Replit, featuring a cyan-blue color scheme, dark theme, Inter font, and glassmorphism effects. The UI is being refactored from "documentation generation" to "intelligence extraction" with dashboards for competitive analysis and RFP management.

### Technical Implementation
The backend is built with Node.js and Express, utilizing a RESTful API structure. Key architectural decisions include:

- **Agent-Based Architecture**: Production-ready intelligent multi-agent system (Research, Code, Structure agents with Critic validation) for intelligence synthesis, including auto-refinement based on quality scores.
- **Multi-Source Data Pipeline**: Scrapes and synthesizes from Reddit, YouTube (with transcript analysis), GitHub, StackOverflow, Dev.to, forums, Quora, and documentation sites.
- **Queue System**: BullMQ with Redis for robust job queuing.
- **Database Transactions**: Drizzle ORM ensures atomic operations.
- **Input Validation**: Comprehensive Zod schemas, including SSRF prevention and AI output validation.
- **Memory Management**: LRU caches prevent unbounded memory growth.
- **Circuit Breaker Pattern**: Prevents cascading failures from AI providers.
- **Pipeline Timeout**: 10-minute hard timeout for jobs with automatic cleanup.
- **Multi-Provider LLM Integration**: Supports 7 AI providers with intelligent free-first routing, token bucket rate limiting, and quota management, ensuring automatic fallback to available providers.
- **Security Hardening**: Comprehensive credential management, removal of hardcoded API keys, and verification of all external services.

### Feature Specifications

**Intelligence Extraction Pipeline:**
- 3-stage AI pipeline (Research & Extraction → Synthesis & Analysis → Quality Validation)
- Dynamic scaling of research depth based on complexity
- Source trust scoring (StackOverflow: 0.90, GitHub: 0.85, Reddit: 0.80, etc.)
- Cross-verification and auto-refinement loops
- Comprehensive quality scoring system (0-100 scale)

**Current Features (Reusable for Pivot):**
- ✅ Multi-source scraping with official APIs (not web scraping)
- ✅ AI synthesis pipeline with multi-agent validation
- ✅ Export system (PDF, DOCX, Markdown, JSON, HTML)
- ✅ Subscription system (PayPal integration)
- ✅ Dashboard system with analytics
- ✅ White-label customization
- ✅ Enterprise API access with authentication
- ✅ Audit trails and security features

**New Features (In Development - See ROADMAP.md):**
- [ ] Competitive battlecard generator
- [ ] RFP requirement parser and response generator
- [ ] Content library management with semantic search
- [ ] Real-time competitive monitoring and alerts
- [ ] Salesforce, Slack, Google Drive, SharePoint integrations
- [ ] Confidence scoring for AI-generated content

### Data Storage
The project uses PostgreSQL via Supabase, managed with Drizzle ORM for type-safe operations. The data model includes 20 tables covering users, intelligence reports, payments, subscriptions, organizations, webhooks, and analytics. Schema will be extended for competitive intelligence and RFP content libraries.

---

## External Dependencies

### Core Services
*   **Multi-Provider LLM System** (Free-First Priority):
    *   **Google AI (Gemini)**: Primary provider
    *   **Together AI**: Secondary
    *   **OpenRouter**: Tertiary
    *   **Groq**: Fast inference
    *   **Hyperbolic**: Alternative
    *   **DeepSeek**: Cost-effective
    *   **OpenAI**: Last resort paid fallback
*   **Supabase**: PostgreSQL database hosting and user authentication
*   **PayPal**: Recurring subscription billing (adapting for enterprise contracts)
*   **BullMQ**: Job queue system
*   **Redis**: BullMQ job persistence
*   **SerpAPI**: Search API
*   **Brave Search API**: Automatic fallback search API
*   **YouTube API**: Video research and transcript analysis

### Data Sources (Official APIs)
*   **Stack Exchange API 2.3**: Developer Q&A, error patterns, solutions
*   **YouTube Data API v3**: Tutorial content, product walkthroughs, competitor demos
*   **Reddit JSON API**: Community sentiment, pain points, product comparisons
*   **GitHub REST API**: Issue tracking, feature requests, code discussions
*   **Dev.to API**: Technical articles and tutorials
*   **Quora API**: User questions and expert answers

### Third-party Libraries
*   **UI Components**: Radix UI primitives, Shadcn/ui
*   **Form Validation**: Zod
*   **Database**: Drizzle ORM
*   **Styling**: Tailwind CSS, `class-variance-authority`
*   **State**: TanStack Query
*   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`, `sharp`

---

## Recent Changes & Migration Status

**November 14, 2025:**
- ✅ Strategic pivot approved: Enterprise Intelligence Platform
- ✅ Cleaned up outdated DevRel-focused documentation
- ✅ Created comprehensive ROADMAP.md with 90-day execution plan
- ✅ Updated replit.md with new vision
- ⏳ In progress: Rebrand UI from documentation to intelligence
- ⏳ In progress: Build competitive intelligence MVP
- 📋 Next: Fix LSP errors, set up development workflow

**Technical Debt:**
- LSP type errors in youtube-service.ts and reddit-service.ts (non-critical, packages are installed)
- Remove unused DevRel-specific features from UI
- Optimize caching for intelligence queries vs. documentation generation

**Key Learnings:**
- Our multi-source intelligence engine is the core asset (80% ready for pivot)
- Documentation was output format, not the product
- Market demand is 10x higher for competitive intelligence than DevRel docs
- Enterprise buyers pay $50k-200k/year vs. $300-5k one-time for DevRel teams

---

## Development Notes

**Current Focus:** See ROADMAP.md for detailed execution plan
**Target:** Ship competitive intelligence MVP in 4 weeks, RFP automation MVP in 8 weeks
**Goal:** First paying customer by end of Q1 2026

**Architecture Decisions:**
- Keep 80% of existing codebase (intelligence engine, AI pipeline, export system)
- Build new 20% (battlecard templates, RFP parser, content library, integrations)
- Maintain backward compatibility during transition
- Run dual-track development: Competitive Intelligence + RFP Automation

---

## Quick Start for Development

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.example)
# Required: DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
# Optional but recommended: GOOGLE_API_KEY (Gemini), YOUTUBE_API_KEY

# Run development server
npm run dev

# Access at http://localhost:5000
```

**Next Steps:** See ROADMAP.md for detailed implementation plan and priorities.
