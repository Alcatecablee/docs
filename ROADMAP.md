# ViberDoc Pivot Roadmap: Competitive Intelligence Platform (Lean Execution)

**Last Updated:** November 14, 2025  
**Status:** Strategic Pivot - CI-Only Focus  
**Target Launch:** 30 days to first paying customer

---

## Executive Summary

**The Pivot:** From "DevRel documentation generator" to **"Competitive Intelligence Engine that tracks what competitors' CUSTOMERS say, not what competitors SAY."**

**Why This Works:**
- ✅ 90% of our multi-source research engine is ready
- ✅ Proven market demand ($405M → $989M market by 2032)
- ✅ Enterprise willingness to pay ($50k-200k/year for tools like Klue/Crayon)
- ✅ We can close $5k/month deals THIS WEEK with existing tech

**Critical Decision:** 
**FOCUS ONLY on Competitive Intelligence for first 60 days.**  
RFP Automation delayed until we hit $30k MRR from CI.

**Path to $1M ARR:** 10-20 customers at $50k-100k/year

---

## Product Strategy: One Thing Only

### The MVP (Stupidly Simple)

**One-Click Competitor Battlecard Generator**

**Input:**
- Competitor name or URL (one text box)

**Output:**
- Professional PDF battlecard containing:
  - **Pricing** (scraped from community discussions, not marketing sites)
  - **Top 5 Strengths** (from positive reviews, case studies)
  - **Top 5 Weaknesses** (from Reddit complaints, GitHub issues)
  - **Migration Patterns** ("switching from X to Y" mentions)
  - **GitHub Issues Summary** (most common bugs, feature requests)
  - **Sentiment Analysis** (trending up/down based on community chatter)
  - **7-Day Trends** (recent spikes in mentions, complaints, launches)
  - **What Customers Secretly Hate** (Reddit/forum deep dive)
  - **Why Customers Switch Away** (competitive win/loss insights)

**That's it. Nothing more.**

---

## Our Unfair Advantage

### What Makes Us Different from Klue/Crayon

**Klue ($200k/year):**
- Tracks what companies SAY (press releases, marketing sites, filings)
- Slow manual curation
- Focuses on enterprise analyst reports

**ViberDoc ($50k/year):**
- Tracks what CUSTOMERS say (Reddit, GitHub, StackOverflow, YouTube, forums)
- Automated AI synthesis with quality validation
- Real-time community intelligence

**Our Positioning:**
> "Klue is a $200k/year tool that only tracks what companies SAY.  
> We track what their CUSTOMERS say."

---

## 30-Day Execution Plan

### Week 1: Build the MVP
**Goal:** One-click battlecard generator working end-to-end  
**Status as of Nov 14, 2025:** BACKEND 100% COMPLETE | FRONTEND PENDING

**Technical Tasks:**
- [x] Create battlecard template (professional PDF design) - ✅ DONE (349 lines)
- [ ] Build competitor input form (single text box + generate button) - ⏳ PENDING UI
- [x] Wire up existing research engine to battlecard template - ✅ DONE (orchestrator)
- [x] Add pricing extraction from community discussions - ✅ DONE (AI-powered)
- [x] Add sentiment scoring (positive/negative analysis) - ✅ DONE
- [x] Add migration pattern detection ("switching from X") - ✅ DONE
- [ ] Test with 3 competitors (Stripe, Auth0, Twilio) - ⏳ BLOCKED BY UI

**Reuse from existing codebase:**
- ✅ Multi-source scraping (Reddit, YouTube, GitHub, StackOverflow, forums)
- ✅ AI synthesis pipeline (multi-agent validation)
- ✅ Quality scoring system
- ✅ PDF export engine

**What we're NOT building:**
- ❌ Dashboards
- ❌ Real-time monitoring
- ❌ Alerts/notifications
- ❌ Integrations (Slack, Salesforce)
- ❌ RFP features
- ❌ Content library

---

### Week 2: Create Killer Demos
**Goal:** 3 demo battlecards that make VPs say "holy shit"

**Tasks:**
- [ ] Generate battlecard for Stripe's top 3 competitors (Adyen, Checkout.com, PayPal)
- [ ] Generate battlecard for Auth0's competitors (Okta, Clerk, Supabase Auth)
- [ ] Generate battlecard for Twilio's competitors (Vonage, Plivo, MessageBird)
- [ ] Record 2-minute demo video showing battlecard generation
- [ ] Build landing page with positioning and demo video
- [ ] Create pitch deck (10 slides max)

**Landing Page Messaging:**
- Headline: "Track What Your Competitors' Customers Actually Say"
- Subheadline: "Auto-generate competitive battlecards from Reddit, GitHub, StackOverflow, and 10+ community sources in 2 minutes"
- Social proof: "Klue charges $200k/year to track press releases. We track real customer pain for $50k/year."
- CTA: "See a demo battlecard for your competitor"

---

### Week 3-4: Sell to First 3 Customers
**Goal:** $10k-15k MRR from pilot customers

**Outbound Strategy:**
1. **Target List:** 50 Product/Sales VPs at B2B SaaS companies ($10M-100M revenue)
2. **Outreach Message:**
   - Subject: "[Competitor] customer complaints you don't know about"
   - Body: "I generated a competitive battlecard for [their competitor] using Reddit, GitHub, and community data. Want to see what their customers are actually saying? [demo link]"
3. **Demo Call:**
   - Show live battlecard generation (2 minutes)
   - "Here's what your competitor's customers complained about this week"
   - "Here's why customers are switching away from them"
4. **Close:** Free pilot for 1 month, then $2k-5k/month

**Success Metrics:**
- 50 outreach emails → 15 responses → 10 demos → 3 pilots → 2 paid conversions
- Target: $10k MRR by end of Week 4

---

## Technical Roadmap (30 Days)

### What We're Building (Minimal Version)

**Frontend:**
- Simple form: "Enter competitor name or URL"
- Loading screen with progress updates (using existing research feed)
- PDF preview and download

**Backend (Reuse 90% of Existing Engine):**
- Competitor input → trigger existing research pipeline
- Sources: Reddit, GitHub issues, StackOverflow, YouTube, forums
- AI synthesis focused on:
  - Pricing mentions
  - Complaint patterns
  - Feature comparison
  - Migration signals
  - Sentiment trends
- Output: Structured data → battlecard template → PDF

**New Components (20% of work):**
1. **Battlecard Template** (PDF design)
2. **Pricing Extractor** (AI prompt tuned for pricing discussions)
3. **Migration Pattern Detector** (regex + AI for "switching from X to Y")
4. **Competitor Input Handler** (normalize company names/URLs)

---

## Positioning & Messaging

### Elevator Pitch
"ViberDoc auto-generates competitive battlecards by analyzing what customers say about your competitors across Reddit, GitHub, StackOverflow, and 10+ sources. Get real-time intelligence on pricing, weaknesses, and migration patterns—without manual research."

### Key Value Props
1. **Speed:** Battlecard in 2 minutes vs. 20 hours of manual research
2. **Depth:** Real customer complaints, not sanitized marketing
3. **Accuracy:** Multi-source validation, 85%+ quality score
4. **Fresh:** Weekly updated intelligence, not stale analyst reports

### Competitor Comparison

| Feature | Klue | Crayon | ViberDoc |
|---------|------|--------|----------|
| **Pricing** | $200k+/year | $150k+/year | $50k/year |
| **Data Sources** | Press releases, filings | Marketing sites | Customer communities |
| **Speed** | Manual curation | Semi-automated | Fully automated (2 min) |
| **Community Intel** | ❌ | Limited | ✅ Core feature |
| **GitHub Analysis** | ❌ | ❌ | ✅ |
| **Reddit/Forums** | ❌ | ❌ | ✅ |
| **Real-time** | Weekly updates | Daily | On-demand |

---

## Pricing Strategy

### Pilot Pricing (First 10 Customers)
- **Free:** 1-month pilot, 1 competitor battlecard/week
- **Paid:** $2k-5k/month after pilot
  - $2k/month: 4 competitors, weekly updates
  - $5k/month: Unlimited competitors, daily updates

### Production Pricing (After 10 Customers)
- **Starter:** $3k/month (5 competitors, weekly updates)
- **Professional:** $8k/month (Unlimited competitors, daily updates, Slack integration)
- **Enterprise:** $15k-20k/month (Custom, API access, Salesforce integration)

**Annual contracts:** 15% discount

---

## Go-to-Market Strategy

### Ideal Customer Profile
- **Company:** B2B SaaS, $10M-100M revenue
- **Team Size:** 50-500 employees
- **Target Buyer:** VP Product, VP Sales, Head of Strategy
- **Pain:** Losing deals to competitors, lack of competitive intelligence
- **Competitors:** 3+ direct competitors in their space
- **Budget:** $50k-200k/year for competitive intelligence tools

### Sales Motion
1. **Outbound LinkedIn/Email:** "See what [competitor]'s customers are saying"
2. **Demo:** Live battlecard generation on their competitor
3. **Pilot:** Free 1 month, 1 competitor
4. **Close:** $2k-5k/month annual contract

### Launch Channels
1. **LinkedIn outbound** to Product/Sales VPs (primary)
2. **Product Hunt launch** (positioning: "Klue alternative for 1/4 the price")
3. **Reddit ads** in r/product, r/saas, r/b2bmarketing
4. **Cold email** to companies who just lost a deal to a competitor

---

## Revenue Projections

### 30-Day Target
- **Pilots:** 3 customers × $0/month = $0 MRR
- **Conversions:** 2 customers × $5k/month = $10k MRR
- **Run rate:** $120k ARR

### 90-Day Target (Optimistic)
- **Customers:** 10 paying customers
- **Average:** $6k/month
- **MRR:** $60k = $720k ARR

### 12-Month Target
- **Customers:** 20 paying customers
- **Average:** $8k/month
- **MRR:** $160k = $1.92M ARR

**Path to $1M ARR:** Just need 10 customers at $8k/month

---

## Success Metrics

### Technical Metrics (Week 1-2)
- Battlecard generation time: <5 minutes
- Quality score: >85/100 (our existing validation)
- Source diversity: 10+ sources per competitor
- Accuracy: 90%+ verified facts

### Business Metrics (Week 3-4)
- Outreach conversion: 30% response rate
- Demo booking: 20% of responses
- Pilot conversion: 30% of demos
- Pilot-to-paid: 50% conversion

### Product Metrics (Month 2-3)
- Battlecards generated: >100/month
- Customer engagement: Weekly active usage >80%
- NPS: >50
- Churn: <10%/month

---

## What We're NOT Building (Yet)

These features are intentionally delayed until we hit $30k MRR:

❌ **RFP Automation** (moved to Phase 2 after CI success)  
❌ **Real-time monitoring dashboard**  
❌ **Slack/Teams integrations**  
❌ **Salesforce connector**  
❌ **Email digest automation**  
❌ **Competitive alerts**  
❌ **Content library system**  
❌ **API access**  
❌ **White-label customization**  

**Reason:** Focus = survival. One product, one market, one month.

---

## Risk Mitigation

### Technical Risks
- **Hallucinations:** Multi-agent validation loop prevents this (already built)
- **API rate limits:** Fallback chains already implemented
- **Data freshness:** On-demand generation ensures latest data

### Market Risks
- **"Just another AI tool":** Community intelligence is our moat (Klue doesn't have this)
- **Sales cycle too long:** Free pilots accelerate decisions
- **Price too low:** We're 75% cheaper than Klue, still profitable

### Execution Risks
- **Building too much:** This roadmap prevents feature creep
- **Wrong pricing:** Test with first 10 customers, adjust
- **No product-market fit:** If no traction in 60 days, pivot again

---

## Phase 2: After $30k MRR (Not Before)

Once Competitive Intelligence hits $30k MRR, we have two options:

**Option A: Double Down on CI**
- Add Slack integration
- Add Salesforce connector
- Add real-time monitoring
- Scale to 50+ customers at $10k/month = $500k MRR

**Option B: Launch RFP Automation**
- Use CI revenue to fund development
- Leverage same engine for content matching
- Sell to existing CI customers (upsell motion)

**Decision point:** End of Q1 2026, based on customer feedback

---

## Competitive Positioning (The Knife)

### Our Messaging vs. Competitors

**Klue's Pitch:**
"Track competitor news, product updates, and win/loss insights"

**Our Counter:**
"Klue tracks what competitors SAY. We track what their CUSTOMERS say."

**Crayon's Pitch:**
"Real-time competitive intelligence for enterprise teams"

**Our Counter:**
"Crayon costs $150k/year and misses the most important data source: actual customer complaints."

**Our Unique Claim:**
"The only competitive intelligence tool that analyzes GitHub issues, Reddit complaints, and StackOverflow patterns to reveal what customers actually think."

---

## Next 7 Days: Immediate Actions

### Day 1-2: Build Battlecard Template
- [ ] Design professional PDF battlecard layout
- [ ] Create sections: Pricing, Strengths, Weaknesses, Trends, Migration
- [ ] Test with mock data

### Day 3-4: Wire Up Engine
- [ ] Create competitor input form
- [ ] Connect to existing research pipeline
- [ ] Add pricing extraction logic
- [ ] Add migration pattern detection

### Day 5-6: Generate Demo Battlecards
- [ ] Run for Stripe competitors (Adyen, Checkout.com)
- [ ] Run for Auth0 competitors (Okta, Clerk)
- [ ] Verify quality, fix issues

### Day 7: Launch Prep
- [ ] Record demo video
- [ ] Write landing page copy
- [ ] Create outbound email templates
- [ ] Build prospect list (50 VPs)

---

## Key Learnings from Feedback

**From ChatGPT:**
- ✅ Dual-track strategy was too ambitious
- ✅ CI is the easier beachhead (90% done vs. RFP requiring months)
- ✅ One-click battlecard = instant demo value
- ✅ Community intelligence is our unique moat

**From Market Research:**
- ✅ Companies pay $50k-200k/year for competitive intelligence
- ✅ Sales teams emotionally motivated (hate losing to competitors)
- ✅ Battlecards are the #1 competitive asset sales teams request

**From Reddit Feedback:**
- ✅ Documentation was output format, not the product
- ✅ Intelligence extraction is the real value
- ✅ DevRel market too small, enterprise market much larger

---

## Appendix: Technical Architecture Reuse

**What We Keep (90% of codebase):**
- ✅ Multi-source scraping (Reddit, YouTube, GitHub, StackOverflow, forums, Quora, Dev.to)
- ✅ AI synthesis pipeline (Research → Code → Structure → Critic agents)
- ✅ Quality validation system (85%+ score threshold)
- ✅ Trust scoring (StackOverflow: 0.90, GitHub: 0.85, Reddit: 0.80)
- ✅ Export engine (PDF, DOCX, JSON, HTML)
- ✅ Multi-provider LLM system (7 providers with fallbacks)
- ✅ Database schema (users, reports, payments, subscriptions)
- ✅ Authentication & billing (Supabase + PayPal)

**What We Build New (10%):**
- Battlecard PDF template
- Competitor input form
- Pricing extraction logic
- Migration pattern detector
- Sentiment trend analyzer

**Technical Debt to Fix:**
- LSP errors in youtube-service.ts and reddit-service.ts (non-blocking)
- Database setup for fresh environment

---

**End of Roadmap**

*This is a living document. Update weekly as we learn from customers. Next update: After first 3 pilot customers.*

---

## Decision Log

**November 14, 2025:**
- ✅ Pivot approved: Competitive Intelligence ONLY (RFP delayed)
- ✅ 30-day execution plan created
- ✅ First customer target: December 2025
- ✅ Focus: One-click battlecard generator
- ✅ Positioning finalized: "Track what customers say, not what companies say"
