# Template Completion Checklist

## Purpose

Before a new brand created from `templates/brand_template/` enters engines or publishing adapters, the brand folder must pass this checklist.

This checklist protects the platform from incomplete brand facts, invented product claims, risky copy, fake reviews, and accidental publishing.

## Required Brand Folder

Expected path:

```text
brands/{brand_id}/
```

Expected files:

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

## Completion Checklist

- [ ] `brand_profile.yml` completed.
- [ ] `product_facts.yml` completed.
- [ ] Verified and unverified facts separated.
- [ ] `claim_whitelist.md` completed.
- [ ] `claim_blacklist.md` completed.
- [ ] `localisation_rules.md` completed.
- [ ] `semantic_map.yml` completed.
- [ ] `search_intent_map.yml` reviewed.
- [ ] `content_cluster_map.yml` reviewed.
- [ ] `faq_bank.yml` reviewed.
- [ ] `publishing_targets.yml` configured.
- [ ] `auto_publish_allowed` remains `false` by default.
- [ ] No invented product facts.
- [ ] No fake reviews.
- [ ] No risky medical claims.
- [ ] Manual review completed.

## Blocking Conditions

Do not pass a brand into engines or adapters if:

- required files are missing
- placeholders remain unresolved in customer-facing fields
- product facts are mixed without source status
- unverified product facts are marked schema-ready
- fake reviews or fake social proof are present
- risky medical, financial, legal, or guaranteed-result claims are present
- `auto_publish_allowed` is set to `true`
- manual review has not been completed

## Default Decision

When in doubt, block or mark for review.

Do not publish.
