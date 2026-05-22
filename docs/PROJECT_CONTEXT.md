# Project Context

## Positioning

`aooi.com` is an AI SEO/GEO Operating System for Independent Commerce Brands.

It is not just an AI writing tool, not a Shopify theme, and not a single-brand content generator. Its purpose is to turn independent-store execution into reusable brand-intelligence, search-intent, claim-control, content-architecture, schema, publishing-adapter and feedback-loop systems.

## Commercial Goal

The commercial goal is to abstract reusable SEO/GEO growth knowledge from real independent-store execution.

FriendRedLight is the first serviced brand case. The value is not merely writing SEO content for FriendRedLight; the value is learning from the FriendRedLight implementation and converting that knowledge into a repeatable AI SEO/GEO growth system for future independent commerce brands.

## Core Methodology

```text
Brand Facts
↓
Product Facts
↓
Claim Boundaries
↓
Human Intent
↓
Emotional Scenarios
↓
Trust Objections
↓
Search Demand
↓
Content Architecture
↓
Schema Structure
↓
Publishing Targets
↓
Feedback Loop
```

## First Serviced Brand

FriendRedLight is the first case implementation, not hard-coded platform logic.

FriendRedLight should be understood as a UK-focused home red light therapy wellness brand. Its content should help UK users and AI systems understand who the brand is, what the products are, what lifestyle scenarios they fit, what can and cannot be claimed, why the brand can be trusted, and how red and near-infrared light exposure can fit into non-medical home wellness routines.

## Shopify Role

Shopify is a publishing adapter only.

Shopify may receive generated page briefs, FAQ structures, JSON-LD snippets, product-page support content and internal-link recommendations. Shopify must not own the core logic. Aooi's reusable engines and adapters must read from `brands/{brand}/` configuration files rather than hard-code FriendRedLight logic.

## What Aooi Must Understand

AI content production is not scarce. What is scarce is structured understanding of:

- human search intent
- emotional pressure
- identity signals
- trust objections
- buying hesitation
- product-fit moments
- claim boundaries
- schema-ready facts
- feedback loops from real performance

## Non-Negotiables

- No fake reviews.
- No fake Reddit, Trustpilot, YouTube, TikTok or social proof.
- No invented product facts.
- No medicalised claims.
- No automatic Shopify publishing.
- No hard-coded FriendRedLight logic in reusable engines or adapters.
- Uncertain product parameters must be marked `unverified` or `needs_owner_confirmation`.
- `unverified` and `needs_owner_confirmation` fields cannot become customer-facing outputs.
- Keep FriendRedLight customer-facing outputs in UK English.

## Bilingual Review Output Rule

Purpose: the owner reviews strategy and English copy in Chinese. English output should be paired with a Chinese explanation for review clarity, while machine-readable and code outputs must remain clean and valid.

When generating English customer-facing copy, strategy text, documentation summaries, SEO/GEO explanations, page copy, FAQ drafts, brand descriptions, content briefs, or adapter output previews, add a Chinese explanation or description immediately after the English text.

Example:

English:
FriendRedLight is designed for calm home wellness routines.

中文描述：
FriendRedLight 旨在融入安静、舒适的家庭健康护理日常。

Important exceptions:

- Do not add Chinese descriptions inside code files.
- Do not add Chinese descriptions inside JSON, YAML, JavaScript, TypeScript, Liquid, HTML, CSS, schema JSON-LD, CLI output, test cases, or machine-readable files.
- Do not alter structured data formats.
- Do not add Chinese text to customer-facing export files unless the output mode is explicitly set to bilingual review.
- For adapter outputs, use Chinese descriptions only in internal review notes, not in final customer-facing copy by default.

## Current Stage

Current Stage: Phase 8I Content Opportunity Scorer.

This phase scores content asset candidates from Phase 8H, prioritises future asset production, and provides future adapter routing hints.

中文描述：
当前阶段是 Phase 8I Content Opportunity Scorer。此阶段为 Phase 8H 的候选内容资产评分，排序未来资产生产优先级，并提供未来 adapter routing hints。

It does not call AI platforms, scrape external data, generate final SEO content, generate customer-facing claims, generate social video scripts, call video factory, publish content or call Shopify API.

中文描述：
此阶段不调用 AI 平台，不抓取外部数据，不生成最终 SEO 内容，不生成用户可见 claim，不生成社媒视频脚本，不调用视频工厂，不发布内容，也不调用 Shopify API。
