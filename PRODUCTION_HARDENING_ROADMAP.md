## Production Hardening Roadmap

Scope: Elevate the system to enterprise-grade reliability, security, and performance while keeping current feature set intact. This document starts with Phase 1 (now) and focuses on the highest-impact items across Crawling, Research, AI, SEO, Export/Hosting, and Platform.

### Principles
- Prefer deterministic, testable logic over probabilistic LLM behavior for core pipelines
- Fail fast, degrade gracefully, and surface actionable telemetry
- Enforce security and compliance baselines by default
- Keep costs observable and controllable (rate-limits, budgets, backpressure)

---

## Phase 1 (Weeks 0-6): High-Impact Production Hardening

### Goals
- Ship robust crawling and research foundations with strict guardrails
- Enforce JSON schema validation and safety checks for AI steps
- Establish SEO determinism and CI validation gates
- Migrate subdomain hosting to a real edge platform with SSL automation
- Stand up observability, security, and quality gates that scale

### Success Metrics
- P95 end-to-end generation latency ≤ 8 min with 20-page crawl and research
- < 1% pipeline aborts due to unhandled errors across 100 sequential runs
- 100% valid JSON outputs from AI stages (0 schema violations)
- 0 critical/high security findings in CI and dependency scans
- 95%+ schema.org validator pass rate in CI for generated pages

---

### 1) Crawling

Deliverables
- Link-graph and crawl frontier scoring:
  - PageRank-like weighting (internal link counts, depth, canonical hints)
  - Semantic scoring (TF-IDF/BM25 on doc-like keywords, URL/path patterns)
  - Deduplication (normalized URLs, canonical tags, hash of main content)
  - Revisit policies (Etag/Last-Modified, freshness TTL per content type)
- robots.txt parser/enforcer and polite crawling:
  - Respect Disallow/Allow, Crawl-delay, per-host concurrency (tokens)
  - User-Agent support and per-site overrides
- Optional headless mode (for blocked sites):
  - Stealth browser profile, resource blocking (ads/trackers),
  - Retries with exponential backoff + jitter; detect 403/429 and backoff

Milestones
- M1.1: robots.txt parsing/enforcement and per-host concurrency tokens
- M1.2: Link-graph builder and frontier scorer; dedupe + revisit policies
- M1.3: Headless crawl mode with stealth + backoff controls

Validation & Metrics
- Unit tests for robots rules and URL normalization
- Integration test against 3 public doc sites with different robots settings
- Telemetry: per-host request rate, disallow hits, retry distributions

---

### 2) Research

Deliverables
- Centralized rate-limiters (token-bucket) per provider (SERP/Brave, GitHub, SO, Reddit, etc.)
- Budget-aware retries with ceilings; per-source circuit isolation
- Deterministic extraction pipelines for key sources (structural scraping/parsing),
  LLMs only for summarization (never for selection/structure)

Milestones
- M2.1: Provider-specific token buckets + shared retry/budget policy
- M2.2: Circuit breakers per provider with health endpoints
- M2.3: Deterministic extractors for Stack Overflow, GitHub Issues, YouTube metadata

Validation & Metrics
- Soak test: 200 sequential research runs without quota violations
- Error budget dashboard per provider; automatic degradation playbooks

---

### 3) AI

Deliverables
- Strict JSON schema validation with typed parsers for all AI outputs
- Shadow-comparison between primary model and validator model; alert on divergences
- Adversarial input tests and content-safety filters for external ingestion

Milestones
- M3.1: Zod/JSON Schema validators wrapping all AI stages (structure, sections, metadata)
- M3.2: Secondary validator model (e.g., GPT-4) shadow reads; diff + metrics
- M3.3: Safety filters (URL/domain allowlist, profanity/PII heuristic checks)

Validation & Metrics
- 0 invalid JSON outputs across 500 test generations
- Safety test corpus: 100 adversarial cases; 100% filtered or flagged

---

### 4) SEO

Deliverables
- Deterministic schema generation from parsed content (LLM suggestions optional)
- CI gate: schema.org validator; fail build on invalid JSON-LD

Milestones
- M4.1: Parser-backed schema emitters (FAQ, HowTo, SoftwareApplication, VideoObject)
- M4.2: CI validator (structured-data testing via CLI/API) and reporting

Validation & Metrics
- 95%+ pass rate in CI; manual spot-check for top 10 pages

---

### 5) Export / Hosting

Deliverables
- Move subdomain hosting to edge platform (Cloudflare Pages/Workers or Vercel)
- Automate SSL via ACME; enable CDN caching and cache-busting for static assets

Milestones
- M5.1: Deploy pipeline for per-subdomain static output + DNS automation
- M5.2: SSL automation; HSTS; cache headers; immutable asset paths with hashing

Validation & Metrics
- TTFB P95 < 200ms for cached pages; global cache HIT ratio > 90%

---

### 6) Platform

Deliverables
- Observability: OpenTelemetry tracing; RED/USE metrics; structured logs; dashboards/alerts
- Security: Secrets in vault; key rotation; dependency and container scanning; CSP headers on exports/hosted docs
- Quality gates: E2E tests for 3 public test sites; load tests (crawl/extract/research); chaos tests for provider failures
- Compliance: Data retention policies; allow-source whitelist/blacklist; reuse/legal disclaimers

Milestones
- M6.1: OTEL tracing + logs + metrics wired to a backend (e.g., Grafana/Loki/Tempo)
- M6.2: Vault integration and rotation playbooks; CI SCA (e.g., Trivy, npm audit, Snyk)
- M6.3: E2E + load test suites; chaos injection for provider outages
- M6.4: Compliance policies documented and enforced in code/config

Validation & Metrics
- On-call runbook + dashboards with SLOs (availability, latency)
- Security CI must pass for merge; CSP reports show 0 violations after burn-in

---

### Dependencies & Ownership
- Crawling/Research: Backend Platform Team
- AI/SEO: AI/Content Team
- Export/Hosting: Edge/Infra Team
- Platform: SRE/Security Team

### Risks & Mitigations
- Provider quota limits → budget controllers, graceful degradation, caching
- Headless crawling detection → stealth profiles, request shaping, fallback to research-only mode
- LLM drift → schema validators, shadow validation, regression tests

### Rollout
- Canary enablement per feature flag; progressive % rollout
- Weekly Phase 1 review with metrics and incident notes


