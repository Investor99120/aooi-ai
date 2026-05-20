# System Architecture

## Platform Definition

`aooi.com` is an AI SEO/GEO Operating System for Independent Commerce Brands.

It helps independent-store brands become understandable, citable, comparable, recommendable and conversion-ready across Google, ChatGPT, Gemini, Perplexity and future AI shopping agents.

## Architecture Overview

```text
aooi.com AI SEO/GEO Operating System
│
├─ Brand Intelligence Engine
│  ├─ brand facts
│  ├─ brand entity definition
│  ├─ audience profile
│  ├─ differentiation
│  └─ AI visibility goal
│
├─ Product Facts Engine
│  ├─ verified product facts
│  ├─ unverified fields
│  ├─ owner confirmation requirements
│  ├─ schema-ready fields
│  └─ trust notes
│
├─ Claim & Compliance Engine
│  ├─ claim whitelist
│  ├─ claim blacklist
│  ├─ safer rewrites
│  ├─ fake-review blocker
│  └─ medicalised-claim blocker
│
├─ Human Intent Engine
│  ├─ search intent
│  ├─ emotional pressure
│  ├─ buying hesitation
│  ├─ trust gaps
│  ├─ identity signals
│  └─ lifestyle scenarios
│
├─ Content Architecture Engine
│  ├─ TOFU / MOFU / BOFU maps
│  ├─ FAQ centre structure
│  ├─ guide maps
│  ├─ comparison maps
│  ├─ routine maps
│  └─ internal-link strategy
│
├─ Schema & GEO Engine
│  ├─ Organization
│  ├─ Brand
│  ├─ WebSite
│  ├─ Product
│  ├─ FAQPage
│  ├─ Article
│  ├─ HowTo where appropriate
│  └─ commerce policy schema where appropriate
│
├─ Publishing Adapter Engine
│  ├─ Shopify adapter
│  ├─ WordPress adapter
│  ├─ Webflow adapter
│  ├─ static export
│  └─ manual export
│
├─ Internal Review Dashboard
│  ├─ file-based review layer
│  ├─ brand facts review
│  ├─ validator report review
│  ├─ schema candidate review
│  ├─ FAQ pipeline review
│  └─ Shopify manual package review
│
├─ Prompt Universe Engine
│  ├─ prompt candidates
│  ├─ prompt clusters
│  ├─ competitor prompt map
│  ├─ future AI answer monitoring
│  ├─ future visibility scoring
│  └─ future content opportunity scoring
│
└─ Feedback Loop Engine
   ├─ Search Console signals
   ├─ AI answer audits
   ├─ user feedback
   ├─ conversion signals
   └─ content opportunity updates
```

## Data Boundary

Core brand intelligence belongs in `brands/{brand}/`.

Publishing-specific output belongs in `adapters/{platform}/` and `outputs/{brand}/`.

No adapter should own brand truth. No reusable engine should hard-code FriendRedLight.

## Output Review Boundary

The project follows the Bilingual Review Output Rule for human-readable review materials. The full rule is defined in `docs/PROJECT_CONTEXT.md`.

In architecture terms, bilingual explanations are allowed only for human-readable owner review materials. They must not be added to code, structured data, CLI output, test cases or machine-readable files. Final customer-facing exports should remain in the target market language by default unless an output mode is explicitly set to bilingual review.

Internal Review Dashboard is a read-only review layer after Shopify Manual Package Manifest. It reads existing files and reports without publishing, connecting to Shopify API or modifying live themes.

中文描述：
Internal Review Dashboard 是 Shopify Manual Package Manifest 之后的只读审核层。它读取现有文件和报告，不发布、不连接 Shopify API，也不修改线上主题。

Prompt Universe is a future AI visibility foundation layer. In Phase 8A it defines prompt candidates, prompt clusters and competitor prompt maps only. It does not run AI monitoring, scrape external data or publish content.

中文描述：
Prompt Universe 是未来 AI visibility 的基础层。Phase 8A 只定义 prompt candidates、prompt clusters 和 competitor prompt maps，不运行 AI 监测、不抓取外部数据，也不发布内容。

## Brand Onboarding Flow

1. Create `brands/{brand}/brand_profile.yml`.
2. Create `product_facts.yml` with verified and unverified fields separated.
3. Create claim whitelist and blacklist.
4. Create localisation rules.
5. Create semantic map.
6. Build search-intent and content-cluster maps.
7. Generate schema and adapter outputs.
8. Run claim, source-status and fake-review checks.
9. Human reviews generated output.
10. Operator publishes manually through the selected channel.

## FriendRedLight Role

FriendRedLight is the first serviced brand case. It demonstrates how a Shopify independent store can be lifted from product pages into a semantic asset system. The implementation must remain reusable for future brands under `brands/{new_brand}/`.

## Shopify Role

Shopify is a publishing adapter only.

Shopify adapter output may include page briefs, FAQ blocks, JSON-LD snippets, product-page copy suggestions, and internal-link recommendations. It must not publish automatically.

## Prohibited System Behaviour

- No fake reviews.
- No invented product facts.
- No medicalised claims.
- No automatic Shopify publishing.
- No hard-coded FriendRedLight logic in reusable engines or adapters.
- No customer-facing output from `unverified` or `needs_owner_confirmation` fields.

## Current Stage

Current Stage: Phase 8A Prompt Universe Foundation.

No AI monitoring. No scraping. No Shopify API. No auto-publishing.

中文描述：
当前阶段是 Phase 8A Prompt Universe Foundation。此阶段不运行 AI 监测，不抓取外部数据，不连接 Shopify API，也不自动发布。
