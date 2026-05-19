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

Phase 3B is in progress. The project has completed Phase 1, Phase 1.5, Phase 2, Phase 2.1 and Phase 3A. The current focus is the Claim Validator as the first lightweight executable compliance checker.
