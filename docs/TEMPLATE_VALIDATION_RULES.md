# Template Validation Rules

## Purpose

A brand folder must pass validation before it can be used by engines or publishing adapters.

Template validation is the first readiness and risk gate for `brands/{brand_id}/`. It protects Aooi from incomplete configuration, unsafe claims, fake proof, unverified facts, and accidental publishing.

Validation should protect the system from:

- missing required files
- unresolved placeholders
- invented product facts
- missing `source_status`
- unverified schema-ready facts
- fake reviews
- risky claims
- auto-publishing enabled by mistake
- incomplete manual review

## A. Required File Validation

Check whether `brands/{brand_id}/` contains:

- `brand_profile.yml`
- `product_facts.yml`
- `claim_whitelist.md`
- `claim_blacklist.md`
- `localisation_rules.md`
- `semantic_map.yml`
- `search_intent_map.yml`
- `content_cluster_map.yml`
- `faq_bank.yml`
- `publishing_targets.yml`

Missing required files should block validation.

## B. Placeholder Validation

Block unresolved template placeholders, including:

- `{{BRAND_NAME}}`
- `{{BRAND_DOMAIN}}`
- `{{PRIMARY_MARKET}}`
- `{{PRODUCT_CATEGORY}}`
- `{{PLATFORM}}`

Any unresolved `{{...}}` placeholder in a customer-facing field should block validation.

## C. Source Status Validation

Rules:

- Missing `source_status` should block or mark for review.
- `unverified` facts cannot be customer-facing.
- `needs_owner_confirmation` cannot be exported.
- `needs_research` cannot be used as final content.
- `schema_ready_fields` must be verified.
- Output inherits the most restrictive `source_status`.

When uncertain, validation should return `blocked` or `needs_review`, not `pass`.

## D. Product Facts Validation

Block:

- product specifications without `source_status`
- logistics without confirmation
- certifications without proof
- warranty promises without confirmation
- delivery timelines without confirmation
- reviews without source proof

Product facts are high-risk because they directly affect user trust, schema accuracy, and purchase decisions.

## E. Claim Risk Validation

Check:

- `claim_blacklist` terms
- medicalised claims
- guaranteed result claims
- fake trust signals
- invented authority endorsements

Any high-risk claim should block adapter export until rewritten and reviewed.

## F. Publishing Target Validation

Rules:

- `auto_publish_allowed` must default to `false`.
- `manual_review_required` must be `true`.
- Adapter must not publish automatically in early phases.
- `platform` must be one of supported targets or marked `custom`.

Supported targets:

- `shopify`
- `wordpress`
- `webflow`
- `static_export`
- `custom`

## G. Manual Review Validation

Rules:

- Brand cannot pass final validation until `manual_review_completed: true`.
- If uncertain, status should be `blocked` or `needs_review`.
- Manual review must cover facts, source status, claims, localisation, publishing targets, and fake-proof checks.

## Decision Values

- `pass` - brand folder can enter engines or adapters.
- `needs_review` - brand folder has issues requiring human review before use.
- `blocked` - brand folder cannot enter engines or adapters.
