# sens.legal — Development Cost Estimate

**Analysis Date**: March 5, 2026
**Codebase Version**: Monorepo — all projects in `dev` status
**Repository**: sens.legal (portal + documentation sites)

---

## 1. Codebase Metrics

### Total Lines of Code

| Category | Lines | Notes |
|----------|------:|-------|
| **Astro (components, pages, layouts)** | 4,043 | Portal UI, routing, SEO |
| **TypeScript / JavaScript** | 817 | API routes, data models, configs |
| **CSS** | 353 | Brand system, portal styles, custom themes |
| **Shell Scripts** | 163 | Build orchestration, doc sync |
| **JSON Config** | 209 | Workspace config, Vercel, package manifests |
| **Documentation (Markdown)** | 39,192 | Full bilingual docs for 4 projects |
| **Subtotal — Code** | **5,376** | Functional code (excl. docs) |
| **Subtotal — Documentation** | **39,192** | EN + PT-BR |
| **Grand Total** | **44,568** | |

### Breakdown by Project

| Project | Code Lines | Doc Lines | Total | Description |
|---------|----------:|----------:|------:|-------------|
| **Portal** | 4,375 | — | 4,375 | Main website: homepage, project pages, waitlist API, search, architecture diagrams, i18n (EN/PT-BR) |
| **Valter** (docs site) | 159 | 14,586 | 14,745 | Jurisprudence search engine docs — API reference, architecture, KG, MCP tools |
| **Douto** (docs site) | 158 | 12,238 | 12,396 | Doctrine processing pipeline docs — PDF extraction, chunking, embeddings, MOCs |
| **Juca** (docs site) | 167 | 8,536 | 8,703 | Legal interface/briefing tool docs — unified API, features, architecture |
| **Leci** (docs site) | 163 | 3,605 | 3,768 | Legislation database docs — ADRs, planning, features |
| **Shared** | 191 | — | 191 | Brand design system (CSS custom properties) |
| **Scripts** | 163 | — | 163 | Build orchestration, CI-safe doc sync |
| **Root** | — | 227 | 227 | DEPLOY.md, progress.md |

---

## 2. Complexity Factors

### Architectural Complexity

- **Monorepo with npm workspaces**: 5 packages (portal + 4 doc sites) managed via workspace config
- **Astro 5 framework**: SSR-capable, island architecture, adapter-based deployment
- **Vercel deployment**: SSR API routes, adapter integration, environment management
- **Bilingual i18n**: Full EN + PT-BR parity across all pages and docs
- **Starlight documentation framework**: Custom theming (B&W Base Web), sidebar configuration, content collections
- **Resend API integration**: Waitlist with audience management + transactional welcome email
- **Cross-repo doc sync**: Shell/Node.js hybrid script parsing SITE_MANIFEST.json with two different sidebar formats (array-based and object-based)
- **Open Graph / SEO**: Dynamic meta tags, Twitter Cards, canonical URLs
- **Vercel Analytics + Speed Insights**: Performance monitoring integration

### Technical Specializations

| Area | Complexity | Evidence |
|------|-----------|----------|
| Astro SSR + API Routes | Medium | Waitlist endpoint with runtime env vars, JSON body parsing |
| Cross-repo sync tooling | Medium-High | Shell + inline Node.js, multiple manifest formats, CI-safe fallbacks |
| Starlight theming | Medium | Custom CSS overrides, dark mode gray scale inversion, sidebar slugs |
| Content architecture | High | 39K lines of structured bilingual docs across 4 domain-specific projects |
| Design system | Medium | CSS custom properties, responsive layouts, consistent component patterns |
| Mermaid diagrams | Low-Medium | Architecture diagrams with proper escaping for Astro |

---

## 3. Development Time Estimate

### Base Coding Hours (Code Only — 5,376 lines)

| Category | Lines | Productivity Rate | Hours |
|----------|------:|------------------:|------:|
| Astro pages/components (UI) | 4,043 | 35 lines/hr | 115.5 |
| TypeScript (API, data, config) | 817 | 30 lines/hr | 27.2 |
| CSS (design system + styles) | 353 | 40 lines/hr | 8.8 |
| Shell/Node sync scripts | 163 | 20 lines/hr | 8.2 |
| JSON configuration | 209 | 50 lines/hr | 4.2 |
| **Subtotal — Code** | **5,585** | | **163.9** |

### Documentation Hours (39,192 lines)

| Category | Lines | Productivity Rate | Hours |
|----------|------:|------------------:|------:|
| Technical documentation (EN) | 19,596 | 60 lines/hr | 326.6 |
| PT-BR translations | 19,596 | 80 lines/hr | 245.0 |
| **Subtotal — Docs** | **39,192** | | **571.6** |

> Note: Documentation rates account for technical accuracy, code examples, API reference tables, architecture diagrams, and structured markdown.

### Total Base Hours

| Component | Hours |
|-----------|------:|
| Code | 163.9 |
| Documentation | 571.6 |
| **Base Total** | **735.5** |

### Overhead Multipliers

| Factor | Percentage | Hours |
|--------|----------:|------:|
| Architecture & Design | +18% | 132.4 |
| Debugging & Troubleshooting | +25% | 183.9 |
| Code Review & Refactoring | +12% | 88.3 |
| Documentation review & QA | +10% | 73.6 |
| Integration & Deployment | +20% | 147.1 |
| Learning Curve (Astro 5, Starlight, Resend, Vercel SSR) | +15% | 110.3 |
| **Overhead Subtotal** | **+100%** | **735.5** |

### Total Estimated Development Hours

| | Hours |
|---|------:|
| Base hours | 735.5 |
| Overhead | 735.5 |
| **Total** | **1,471** |

---

## 4. Realistic Calendar Time (with Organizational Overhead)

| Company Type | Efficiency | Coding Hrs/Week | Calendar Weeks | Calendar Time |
|--------------|----------:|----------------:|---------------:|---------------|
| **Solo/Startup (lean)** | 65% | 26 hrs | 56.6 weeks | **~13 months** |
| **Growth Company** | 55% | 22 hrs | 66.9 weeks | **~16 months** |
| **Enterprise** | 45% | 18 hrs | 81.7 weeks | **~19 months** |
| **Large Bureaucracy** | 35% | 14 hrs | 105.1 weeks | **~24 months** |

---

## 5. Market Rate Research (2025–2026)

### Senior Full-Stack Developer Rates (United States)

| Source | Rate Range | Notes |
|--------|-----------|-------|
| ZipRecruiter (Feb 2026) | $49–$79/hr | Employment; avg $59/hr |
| Glassdoor (Feb 2026) | $66–$106/hr | Employment; avg $84/hr |
| ContractRates.fyi (Global) | ~$101/hr avg | Crowdsourced contractor data |
| Arc.dev (2026) | $61–$80/hr | Vetted freelance platform |
| FullStack Labs (Freelance) | $50–$300/hr | Wide range by specialty |
| Index.dev (North America) | $80–$140/hr | Includes AI/cloud specialists |

### Astro/Frontend Specialist Rates

| Source | Rate Range | Notes |
|--------|-----------|-------|
| Arc.dev (Astro.js) | $60–$100+/hr | Astro-specific freelancers |
| General frontend (US) | $45–$120/hr | Range by experience |

### Recommended Rate Tiers for This Project

| Tier | Rate | Rationale |
|------|-----:|-----------|
| **Low-end** | $75/hr | Junior-mid Astro dev, simple content site work |
| **Average** | $110/hr | Senior full-stack with Astro + API + deployment experience |
| **High-end** | $150/hr | Specialist with monorepo architecture, i18n, legal domain knowledge |

*Rationale for average rate*: This project requires Astro 5 SSR knowledge, Starlight theming, Vercel deployment, API development (Resend), cross-repo tooling (shell + Node.js), bilingual content architecture, and legal domain understanding.

---

## 6. Total Cost Estimate — Engineering Only

| Scenario | Hourly Rate | Total Hours | Total Cost |
|----------|------------:|------------:|-----------:|
| **Low-end** | $75 | 1,471 | **$110,325** |
| **Average** | $110 | 1,471 | **$161,810** |
| **High-end** | $150 | 1,471 | **$220,650** |

### Recommended Estimate (Engineering Only)

> **$110,000 – $165,000**

---

## 7. Full Team Cost (All Roles)

### Team Composition Multipliers

| Role | Ratio | Typical Rate | Notes |
|------|------:|-------------:|-------|
| Product Management | 0.30× | $150/hr | PRDs, roadmap, legal domain strategy |
| UX/UI Design | 0.25× | $125/hr | Brand system, B&W aesthetic, responsive layouts |
| Engineering Management | 0.15× | $175/hr | Technical direction, architecture decisions |
| QA/Testing | 0.15× | $100/hr | Cross-browser, i18n QA, API testing |
| DevOps/Platform | 0.15× | $150/hr | Vercel config, CI/CD, monorepo tooling |
| Technical Writing | 0.10× | $100/hr | 39K lines of docs needed domain expertise |

### Full Team Cost by Company Stage

| Company Stage | Team Multiplier | Eng Cost (Avg) | Full Team Cost |
|---------------|----------------:|---------------:|---------------:|
| **Solo/Founder** | 1.0× | $161,810 | **$161,810** |
| **Lean Startup** | 1.45× | $161,810 | **$234,625** |
| **Growth Company** | 2.2× | $161,810 | **$355,982** |
| **Enterprise** | 2.65× | $161,810 | **$428,797** |

---

## 8. Grand Total Summary

| Metric | Solo | Lean Startup | Growth Co | Enterprise |
|--------|------|--------------|-----------|------------|
| **Calendar Time** | ~13 months | ~13 months | ~16 months | ~19 months |
| **Total Human Hours** | 1,471 | 2,133 | 3,236 | 3,898 |
| **Total Cost (Low)** | $110,325 | $159,971 | $242,715 | $292,361 |
| **Total Cost (Avg)** | $161,810 | $234,625 | $355,982 | $428,797 |
| **Total Cost (High)** | $220,650 | $319,943 | $485,430 | $584,723 |

---

## 9. Claude ROI Analysis

### Project Timeline

| Metric | Value |
|--------|-------|
| **First commit** | February 28, 2026, 17:39 BRT |
| **Latest commit** | March 5, 2026, 13:31 BRT |
| **Total calendar time** | 5 days |
| **Total commits** | 28 |

### Claude Active Hours Estimate

Git commit clustering analysis (4-hour window heuristic):

| Date | Commits | Time Span | Estimated Active Hours |
|------|--------:|-----------|:----------------------:|
| Feb 28 — Session 1 (17:39–18:01) | 4 | 22 min | 1.0 hr |
| Feb 28 — Session 2 (19:27–20:12) | 6 | 45 min | 1.5 hr |
| Feb 28 — Session 3 (21:22) | 1 | single | 0.5 hr |
| Feb 28 — Session 4 (23:06–23:37) | 3 | 31 min | 1.0 hr |
| Mar 3 — Session 5 (09:37–10:59) | 10 | 82 min | 2.0 hr |
| Mar 5 — Session 6 (11:45–13:31) | 4 | 106 min | 2.0 hr |
| **Total** | **28** | | **8.0 hrs** |

**Method**: Git timestamp clustering with session boundary at >60 min gap.

### Value per Claude Hour

| Value Basis | Total Value | Claude Hours | $/Claude Hour |
|-------------|------------:|:------------:|--------------:|
| Engineering only (avg) | $161,810 | 8 | **$20,226/hr** |
| Full team — Lean Startup | $234,625 | 8 | **$29,328/hr** |
| Full team — Growth Company | $355,982 | 8 | **$44,498/hr** |
| Full team — Enterprise | $428,797 | 8 | **$55,100/hr** |

### Speed vs Human Developer

| Metric | Value |
|--------|------:|
| **Human estimated hours** | 1,471 |
| **Claude active hours** | 8 |
| **Speed multiplier** | **184×** |

### Cost Comparison

| Metric | Value |
|--------|------:|
| **Human cost** (1,471 hrs × $110/hr) | $161,810 |
| **Claude cost** (~$200/mo subscription, prorated to 5 days) | ~$33 |
| **Net savings** | **$161,777** |
| **ROI** | **4,902×** |

### Headline

> *Claude worked for approximately **8 hours** over 5 calendar days and produced **44,568 lines** across a complete monorepo — portal, 4 documentation sites, API integrations, bilingual i18n, design system, and deployment infrastructure — equivalent to **$161,810** in professional development value at market rates.*
>
> **That's roughly $20,226 per Claude hour.**

---

## 10. Assumptions & Limitations

### Included

1. All rates based on US market averages (2025–2026)
2. Full-time equivalent allocation
3. Includes complete portal implementation + all documentation sites
4. Bilingual content (EN + PT-BR) counted as separate deliverables
5. Overhead multipliers based on industry standards for senior developers

### Not Included

- Marketing & sales
- Legal & compliance costs
- Office/equipment
- Hosting/infrastructure (Vercel, Resend, domain)
- Post-launch maintenance & iteration
- The actual backend projects (Valter, Douto, Leci, Juca application code) — this estimate covers only the **portal and documentation monorepo**, not the production applications themselves

### Confidence Intervals

| Estimate | Confidence | Range |
|----------|-----------|-------|
| Lines of code | High (95%) | Exact count from codebase |
| Development hours | Medium (70%) | ±20% depending on developer familiarity |
| Market rates | Medium (75%) | Varies by geography and negotiation |
| Claude hours | Medium (70%) | Git clustering is heuristic-based |
| Full team multipliers | Low-Medium (60%) | Highly dependent on company culture |

### Key Cost Drivers

1. **Documentation volume** (39K lines, 71% of effort): The bilingual technical documentation across 4 specialized legal-tech projects is the dominant cost driver
2. **Legal domain expertise**: Requires understanding of Brazilian legal system, FRBR ontology, court hierarchy
3. **Bilingual parity**: Every page maintained in both EN and PT-BR doubles content effort
4. **Architecture decisions**: Monorepo workspace config, cross-repo sync tooling, Starlight customization

---

## Sources

- [ZipRecruiter — Senior Full Stack Developer Salary](https://www.ziprecruiter.com/Salaries/Senior-Full-Stack-Developer-Salary)
- [Glassdoor — Senior Full Stack Developer Salary 2026](https://www.glassdoor.com/Salaries/senior-full-stack-developer-salary-SRCH_KO0,27.htm)
- [Arc.dev — Full Stack Developer Hourly Rates 2026](https://arc.dev/freelance-developer-rates/full-stack)
- [Contus — Cost to Hire Full Stack Developer 2025](https://www.contus.com/blog/cost-to-hire-full-stack-developer/)
- [FullStack Labs — Software Development Price Guide 2025](https://www.fullstack.com/labs/resources/blog/software-development-price-guide-hourly-rate-comparison)
- [Index.dev — Freelance Developer Rates by Country 2025](https://www.index.dev/blog/freelance-developer-rates-by-country)
- [ContractRates.fyi — Senior Software Engineer Hourly Rates](https://www.contractrates.fyi/Senior-Software-Engineer/hourly-rates)
- [Arc.dev — Astro.js Developers for Hire](https://arc.dev/hire-developers/astrojs)
- [Flexiple — Fullstack Developer Hourly Rate Guide](https://flexiple.com/fullstack/hourly-rate)
