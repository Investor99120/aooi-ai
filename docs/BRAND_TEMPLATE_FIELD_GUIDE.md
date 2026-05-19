# Brand Template Field Guide

## Purpose

This guide explains the core fields used in `templates/brand_template/`.

## Shared Source Status Values

- `verified` - confirmed by reliable source or owner documentation.
- `owner_defined` - strategic positioning or business context defined by the owner.
- `unverified` - observed but not confirmed.
- `needs_owner_confirmation` - must be confirmed before customer-facing use.
- `needs_research` - requires source gathering and quality scoring.

## brand_profile.template.yml

Defines who the brand is, who it serves, what it should mean to AI systems, what it must not claim, and how it should be reused by platform engines.

Key fields:

- `brand_name`
- `brand_domain`
- `platform`
- `market_focus`
- `brand_positioning`
- `brand_entity_definition`
- `audience_profile`
- `core_emotional_jobs`
- `trust_positioning`
- `differentiation`
- `ai_visibility_goal`
- `primary_use_cases`
- `prohibited_positioning`
- `reusable_framework_notes`

## product_facts.template.yml

Separates verified facts from unverified data and prepares schema-ready fields.

Key fields:

- `source_of_truth_notice`
- `verified_product_facts`
- `unverified_fields`
- `owner_confirmation_required`
- `product_catalog`
- `usage_contexts`
- `conversion_contexts`
- `schema_ready_fields`
- `delivery_policy`
- `returns_policy`
- `warranty_policy`
- `trust_notes`
- `compliance_notes`

## claim templates

Define what can and cannot be said.

Required sections:

- allowed language
- banned language
- safer rewrite patterns
- compliance notes
- market-specific risk notes

## localisation_rules.template.md

Defines target-market language, tone, lifestyle scenarios, trust language and conversion phrasing.

Human-readable review outputs should follow the Bilingual Review Output Rule: English strategy text, page copy, FAQ drafts, brand descriptions, content briefs and adapter output previews should be paired with a Chinese explanation immediately after the English text.

Do not apply this rule inside template YAML, JSON, schema JSON-LD, code, test cases or other machine-readable files. Do not add Chinese text to final customer-facing export files unless the output mode is explicitly set to bilingual review.

## semantic_map.template.yml

Defines the brand's entity system and content architecture.

Required sections:

- core_entities
- product_entities
- audience_entities
- emotional_clusters
- intent_clusters
- trust_clusters
- content_clusters
- internal_link_clusters
- schema_entity_map

## faq_bank.template.yml

Stores FAQ candidates with review metadata.

Required fields:

- question
- answer_draft
- intent_cluster
- funnel_stage
- claim_risk_level
- source_status
- schema_eligible

## publishing_targets.template.yml

Defines where outputs can go and how they must be reviewed.

Required fields:

- platform
- adapter
- output_format
- manual_review_required
- auto_publish_allowed: false by default
