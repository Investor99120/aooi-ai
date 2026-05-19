# Claim Validator

Claim Validator is the first lightweight content risk checker in the aooi.com AI SEO/GEO operating system.

**Claim Validator is a safety gate, not a content generator.**

It should run before any downstream content or publishing workflow, including:

- FAQ Generator
- Schema Generator
- Product Page Copy Generator
- Blog Brief Generator
- Shopify Adapter
- WordPress Adapter
- Webflow Adapter
- Static Export Adapter

## What It Does

Claim Validator checks a text string against brand-level claim rules and conservative fallback rules. It returns a structured decision that tells later engines whether the text may continue, needs manual review, or must be blocked.

It does not:

- generate SEO content
- generate Shopify pages
- publish anything
- scrape external data
- verify product facts
- replace legal, regulatory, or owner review

## Brand Rules

The validator reads rules from:

- `brands/{brand_id}/claim_whitelist.md`
- `brands/{brand_id}/claim_blacklist.md`
- `docs/SOURCE_STATUS_POLICY.md`
- `validation/rules.yml`

FriendRedLight is the default test case, but the logic must remain reusable for future brands. Do not hard-code FriendRedLight-specific compliance rules into reusable engines.

## Default Safety Policy

The default policy is conservative:

- high-risk claims return `blocked`
- uncertain wording returns `needs_review`
- safe whitelist-aligned wording may return `pass`
- file loading failures return `needs_review`, not `pass`

Adapters should treat `blocked` and `needs_review` as stop signals unless a human reviewer explicitly approves the content.

## CLI Usage

Run with the default brand, `friendredlight`:

```bash
node engines/compliance_checker/claim_validator.js "This device treats pain and cures insomnia."
```

Run with an explicit brand id:

```bash
node engines/compliance_checker/claim_validator.js "This device treats pain" friendredlight
```

The command prints JSON to the terminal.

## Output Fields

- `decision`: `pass`, `needs_review`, or `blocked`
- `risk_level`: `none`, `low`, `medium`, or `high`
- `matched_terms`: risky or approved terms found in the input
- `risk_categories`: risk group names such as `banned_medical_claim`
- `suggested_rewrites`: safer wording options when a known rewrite exists
- `manual_review_required`: whether a human must review before export
- `notes`: implementation notes and conservative review reasons

## Current Risk Categories

- banned medical claim verbs
- banned result claims
- banned condition claims
- banned trust and evidence claims
- banned tone and positioning
- possible overstated wellness claims

## Current Limits

- It uses simple phrase matching, not AI semantic judgement.
- It does not verify source evidence.
- It does not parse product facts or schema fields yet.
- It does not detect every possible paraphrase of a risky claim.
- It is intentionally conservative and may return `needs_review` for acceptable wording.

## Future Extensions

Later phases can add:

- a small test runner
- source-status checks on structured content
- schema field claim validation
- multi-market risk profiles
- adapter-level enforcement
- richer rewrite suggestions
- AI-assisted review after deterministic checks
