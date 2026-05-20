# Prompt Universe Field Guide

## Purpose

This guide defines recommended fields for Prompt Universe entries.

中文描述：
本指南定义 Prompt Universe entry 的推荐字段。

## Recommended Entry Fields

| Field | Meaning | Notes |
| --- | --- | --- |
| `id` | Unique prompt candidate ID | Required |
| `prompt` | User-like AI-search question | Required |
| `prompt_type` | Prompt category | Required |
| `market` | Target market | Example: UK |
| `language` | Prompt language | Example: en-GB |
| `target_ai_surface` | Future AI surfaces to test | Array |
| `intent_cluster` | Search or AI intent cluster | Required |
| `emotional_cluster` | Human emotional scenario | Optional but recommended |
| `trust_objection` | Main trust concern | Optional but recommended |
| `funnel_stage` | TOFU, MOFU, BOFU, post_purchase or retention | Required |
| `commercial_intent` | low, medium or high | Required |
| `content_opportunity_type` | Future content asset type | Candidate only |
| `related_product_category` | Category context | Avoid unsupported claims |
| `related_product` | Specific product if confirmed | Use `needs_owner_confirmation` if unknown |
| `competitor_context` | Competitor angle | Use `needs_research` unless verified |
| `claim_risk_level` | low, medium or high | Required |
| `source_status` | Source status | Required |
| `monitoring_eligible` | Future monitoring status | Default: candidate |
| `content_generation_eligible` | Future content eligibility | Default: needs_review |
| `manual_review_required` | Owner review gate | Default: true |
| `owner_notes` | Internal notes | No customer-facing claims |

## Prompt Type Values

Allowed `prompt_type` values:

中文描述：
允许的 `prompt_type` 值：

- informational
- comparison
- recommendation
- safety
- how_to
- product_fit
- alternative
- local_market
- price_value
- trust_objection
- routine_based

## Target AI Surface Values

Allowed `target_ai_surface` values:

中文描述：
允许的 `target_ai_surface` 值：

- chatgpt
- gemini
- perplexity
- google_ai_overview
- google_ai_mode
- future_ai_shopping_agent
- generic_ai_search

## Funnel Stage Values

Allowed `funnel_stage` values:

中文描述：
允许的 `funnel_stage` 值：

- TOFU
- MOFU
- BOFU
- post_purchase
- retention

## Source Status Values

Allowed `source_status` values:

中文描述：
允许的 `source_status` 值：

- owner_defined
- needs_research
- verified
- unverified
- needs_owner_confirmation

## Default Values

Recommended defaults:

中文描述：
建议默认值：

- `manual_review_required: true`
- `monitoring_eligible: candidate`
- `content_generation_eligible: needs_review`

## Safety Notes

Prompt candidates are planning assets. They do not prove demand, visibility, ranking or market share.

中文描述：
Prompt candidates 是规划资产，不能证明需求、可见度、排名或市场份额。

No prompt candidate can become customer-facing copy without claim review, source status review and manual approval.

中文描述：
任何 prompt candidate 未经过 claim review、source status review 和人工批准，都不能变成用户可见文案。
