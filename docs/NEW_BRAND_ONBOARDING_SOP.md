# New Brand Onboarding SOP

## Goal

Create a new `brands/{brand_id}/` folder from `templates/brand_template/` without copying FriendRedLight-specific content.

## Steps

1. Choose a stable `brand_id`.
2. Copy the template folder:

```bash
cp -R templates/brand_template brands/{brand_id}
```

3. Rename template files:

```text
brand_profile.template.yml -> brand_profile.yml
product_facts.template.yml -> product_facts.yml
claim_whitelist.template.md -> claim_whitelist.md
claim_blacklist.template.md -> claim_blacklist.md
localisation_rules.template.md -> localisation_rules.md
semantic_map.template.yml -> semantic_map.yml
search_intent_map.template.yml -> search_intent_map.yml
content_cluster_map.template.yml -> content_cluster_map.yml
faq_bank.template.yml -> faq_bank.yml
publishing_targets.template.yml -> publishing_targets.yml
```

4. Replace placeholders such as `{{BRAND_NAME}}`, `{{BRAND_DOMAIN}}`, `{{PRIMARY_MARKET}}`, and `{{PRODUCT_CATEGORY}}`.
5. Mark unknown product data as `needs_owner_confirmation`.
6. Mark researched search data as `needs_research` until sources are reviewed.
7. Fill claim whitelist and blacklist for the brand category and target market.
8. Fill localisation rules for the target market and language.
9. Define publishing targets, keeping `auto_publish_allowed: false`.
10. Run a manual review before any adapter output is created.

## Required Checks

- No invented product facts.
- No fake reviews.
- No unreviewed risky claims.
- No hard-coded adapter logic.
- No automatic publishing.
- Source-status fields are present for product and research-sensitive facts.

## FriendRedLight Note

FriendRedLight is useful as a completed reference case, but it should not be copied directly into new brand folders unless the new brand genuinely shares the same facts and market context.
