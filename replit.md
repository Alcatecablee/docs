# ViberDoc - Competitive Intelligence Platform

## Strategic Direction (Updated November 14, 2025)

**PIVOT COMPLETE:** Transitioning from "DevRel documentation generator" to **"Competitive Intelligence Engine that tracks what competitors' CUSTOMERS say."**

### Product Vision
ViberDoc is an AI-powered competitive intelligence platform that auto-generates battlecards by analyzing what customers say about your competitors across Reddit, GitHub, StackOverflow, YouTube, forums, and 10+ community sources. We provide real-time intelligence on competitor pricing, weaknesses, and migration patterns—without manual research.

**Target Market:**
- **Primary:** Product/Sales teams at B2B SaaS companies ($10M-$100M revenue)
- **Buyers:** VP Product, VP Sales, Head of Strategy
- **Budget:** $50k-$200k/year (competing with Klue, Crayon, AlphaSense)

**Path to $1M ARR:** 10-20 customers at $50k-100k/year

**Current Focus:** Competitive Intelligence ONLY (RFP automation delayed until $30k MRR)

---

## Our Unfair Advantage

**Positioning:**
> "Klue is a $200k/year tool that only tracks what companies SAY.  
> We track what their CUSTOMERS say."

**What Makes Us Different:**
- ✅ Community intelligence (Reddit, GitHub, StackOverflow, forums)
- ✅ Automated AI synthesis with 85%+ accuracy validation
- ✅ 2-minute battlecard generation (vs. 20 hours manual research)
- ✅ Real customer complaints, not sanitized marketing
- ✅ 75% cheaper than Klue/Crayon

---

## The MVP (30-Day Focus)

**One-Click Competitor Battlecard Generator**

**Input:** Competitor name or URL  
**Output:** Professional PDF battlecard with:
- Pricing (from community discussions)
- Top 5 strengths (positive reviews, case studies)
- Top 5 weaknesses (Reddit complaints, GitHub issues)
- Migration patterns ("switching from X to Y")
- GitHub issues summary (bugs, feature requests)
- Sentiment analysis (trending up/down)
- 7-day trends (recent mentions, complaints)
- What customers secretly hate
- Why customers switch away

**That's it. Nothing more for first 30 days.**

---

## User Preferences
Preferred communication style: Simple, everyday language.
Design preferences: Clean cyan-blue color scheme like Replit using rgb(102,255,228) - NO emojis in production UI, NO gradients (except dark background gradients), dark theme (rgb(14,19,23) to rgb(34,38,46)), modern glassmorphism effects (from-white/10 to-white/5 with backdrop-blur-sm), Heroicons for consistency.

---

## System Architecture

### UI/UX & Design
The frontend uses React with TypeScript and Vite, styled with Tailwind CSS and Shadcn/ui components (built on Radix UI). The design emphasizes a modern, elegant aesthetic inspired by Replit, featuring a cyan-blue color scheme, dark theme, Inter font, and glassmorphism effects. 

**Current MVP UI:**
- Simple competitor input form (one text box)
- Loading screen with research progress
- PDF battlecard preview and download
- Clean, professional design

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

**Current Features (Reusable for CI Pivot):**
- ✅ Multi-source scraping with official APIs (Reddit, GitHub, YouTube, StackOverflow, forums)
- ✅ AI synthesis pipeline with multi-agent validation
- ✅ Export system (PDF, DOCX, Markdown, JSON, HTML)
- ✅ Subscription system (PayPal integration)
- ✅ Dashboard system with analytics
- ✅ White-label customization
- ✅ Enterprise API access with authentication
- ✅ Audit trails and security features

**New Features (30-Day MVP - See ROADMAP.md):**
- [ ] Competitor battlecard generator (PDF template)
- [ ] Pricing extraction from community discussions
- [ ] Migration pattern detection ("switching from X to Y")
- [ ] Sentiment trend analysis
- [ ] Competitor input form (simple, one-field)

**Delayed Features (After $30k MRR):**
- RFP automation
- Real-time monitoring dashboard
- Slack/Salesforce integrations
- Competitive alerts
- Content library

### Data Storage
The project uses PostgreSQL via Supabase, managed with Drizzle ORM for type-safe operations. The data model includes 20 tables covering users, intelligence reports, payments, subscriptions, organizations, webhooks, and analytics. Schema will be extended for competitive battlecards and monitoring data.

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
*   **GitHub REST API**: Issue tracking, feature requests, code discussions, bug patterns
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
- ✅ Strategic pivot approved: Competitive Intelligence Platform (CI-only, RFP delayed)
- ✅ Cleaned up outdated DevRel-focused documentation
- ✅ Created lean ROADMAP.md with 30-day execution plan
- ✅ Updated replit.md with new vision
- ✅ Positioning finalized: "Track what customers say, not what companies say"
- ⏳ In progress: Build one-click battlecard generator MVP
- 📋 Next: Generate 3 demo battlecards, launch outbound campaign

**Technical Debt:**
- LSP type errors in youtube-service.ts and reddit-service.ts (non-critical, packages are installed)
- Database setup needed for fresh environment
- Remove unused DevRel-specific UI components

**Key Learnings:**
- Our multi-source intelligence engine is the core asset (90% ready for CI pivot)
- Documentation was output format, not the product
- Competitive intelligence has 10x higher willingness to pay than DevRel
- Community intelligence (Reddit, GitHub, forums) is our unique moat vs. Klue/Crayon
- Dual-track strategy (CI + RFP) was too ambitious - focus = survival

---

## Development Notes

**Current Focus:** See ROADMAP.md for 30-day execution plan
**Target:** First paying customer by December 2025 ($5k/month)
**Goal:** $10k-15k MRR in 30 days → $30k MRR in 90 days

**Architecture Decisions:**
- Keep 90% of existing codebase (intelligence engine, AI pipeline, export system)
- Build new 10% (battlecard template, competitor input form, pricing/migration extractors)
- No feature creep - MVP only for first 30 days
- RFP automation moved to Phase 2 (after CI hits $30k MRR)

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

**Next Steps:** 
1. See ROADMAP.md for detailed 30-day implementation plan
2. Focus on battlecard generator MVP this week
3. Generate 3 demo battlecards by end of Week 2
4. Launch outbound campaign Week 3

---

## Success Criteria (30 Days)

**Technical:**
- ✅ Battlecard generation time: <5 minutes
- ✅ Quality score: >85/100
- ✅ Source diversity: 10+ sources per competitor

**Business:**
- 🎯 3 pilot customers (free)
- 🎯 2 paid conversions at $5k/month = $10k MRR
- 🎯 $120k ARR run rate

**Product:**
- 🎯 3 killer demo battlecards (Stripe, Auth0, Twilio competitors)
- 🎯 Landing page live with demo video
- 🎯 50 outbound emails sent to target buyers
