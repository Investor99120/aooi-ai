# Reusable SEO/GEO System

## Core Thesis

`aooi.com` is not just an AI writing tool.

It is a reusable AI SEO/GEO operating system for independent commerce brands.

AI content production is not scarce. What matters is the structured understanding of brand facts, product facts, claim boundaries, human intent, emotional scenarios, trust objections, search demand, content architecture, schema structure, publishing targets and feedback loops.

## System Modules

### 1. Brand Intelligence Engine

Purpose:

- Defines who the brand is.
- Creates brand entity structure.
- Stores positioning and audience context.
- Defines differentiation and AI visibility goals.

Inputs:

- `brands/{brand}/brand_profile.yml`
- market and language settings
- audience profile
- trust positioning

Outputs:

- brand entity definition
- canonical positioning
- AI visibility target
- reusable brand context for generators and adapters

### 2. Product Facts Engine

Purpose:

- Stores verified product facts.
- Separates verified and unverified data.
- Identifies owner-confirmation requirements.
- Prepares schema-ready fields.

Inputs:

- `brands/{brand}/product_facts.yml`

Outputs:

- verified facts
- blocked unverified fields
- Product schema candidates
- trust gaps requiring owner confirmation

### 3. Claim & Compliance Engine

Purpose:

- Prevents risky medical claims.
- Applies whitelist and blacklist rules.
- Suggests safer wording.
- Blocks fake reviews and invented evidence.

Inputs:

- `claim_whitelist.md`
- `claim_blacklist.md`
- brand-specific compliance notes

Outputs:

- claim-safe copy guidance
- blocked phrases
- rewrite suggestions
- adapter export warnings

### 4. Human Intent Engine

Purpose:

- Maps search intent.
- Maps emotional pressure.
- Maps buying hesitation.
- Maps trust gaps.
- Maps lifestyle scenarios.

Inputs:

- search data
- user language
- review language
- competitor gaps
- brand semantic map

Outputs:

- intent clusters
- emotional clusters
- product-fit moments
- content-to-conversion paths

### 5. Content Architecture Engine

Purpose:

- Creates TOFU / MOFU / BOFU structure.
- Builds FAQ, guide, comparison and routine page maps.
- Creates internal link strategy.

Outputs:

- FAQ centre map
- educational guide map
- routine content map
- comparison content map
- product support content map
- internal-link graph

### 6. Schema & GEO Engine

Purpose:

- Generates machine-readable schema.
- Improves AI and search-engine understanding.
- Supports AI visibility audits.

Schema candidates:

- Organization
- Brand
- WebSite
- Product
- FAQPage
- BreadcrumbList
- Article
- HowTo where appropriate
- OfferShippingDetails where appropriate
- MerchantReturnPolicy where appropriate

### 7. Publishing Adapter Engine

Purpose:

- Exports assets to Shopify, WordPress, Webflow or static formats.
- Does not contain core brand intelligence.
- Does not auto-publish in Phase 1.

Rule:

Adapters consume `brands/{brand}/` and emit reviewable outputs into `outputs/{brand}/`.

### 8. Feedback Loop Engine

Purpose:

- Tracks performance.
- Learns from Search Console, AI answer audits, user feedback and conversion signals.
- Updates content opportunities over time.

Inputs:

- Google Search Console data
- AI answer audit results
- user questions
- support tickets
- conversion signals
- product updates

Outputs:

- refreshed opportunity map
- content updates
- trust-gap updates
- schema improvements
- new source requirements

## Platform Rule

FriendRedLight is the first case. The system must remain reusable for future independent commerce brands under `brands/{new_brand}/`.
