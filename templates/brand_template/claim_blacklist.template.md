# {{BRAND_NAME}} Claim Blacklist

Do not use these claims in generated copy, schema, product pages, FAQs, ads, email, social, comparison content, or publishing adapter outputs unless future legal and regulatory review explicitly approves them.

## Banned Language

- {{BANNED_TERM_1}}
- {{BANNED_TERM_2}}
- guaranteed results
- miracle
- risk-free outcome
- fake review
- fake testimonial
- invented endorsement
- unverified certification claim
- unverified delivery promise
- unverified warranty promise

## Banned Category-Specific Claims

- {{CATEGORY_RISK_CLAIM_1}}
- {{CATEGORY_RISK_CLAIM_2}}

## Banned Result Claims

- guaranteed improvement
- guaranteed transformation
- instant results
- permanent results
- clinically guaranteed

## Banned Trust And Evidence Claims

- fake Trustpilot reviews
- fake Reddit mentions
- fake YouTube reviews
- fake TikTok testimonials
- fake customer testimonials
- invented before-and-after claims
- invented expert endorsements
- unverified stock location claims

## Safer Rewrite Patterns

- Replace "{{RISKY_CLAIM_EXAMPLE_1}}" with "{{SAFER_REWRITE_1}}".
- Replace "{{RISKY_CLAIM_EXAMPLE_2}}" with "{{SAFER_REWRITE_2}}".
- Replace unverified product specifications with `TBC`, `unverified`, or `needs_owner_confirmation`.

## Compliance Notes

- If generated output includes a banned phrase or an equivalent risky claim, block it before adapter export.
- Reusable engines must read blacklist files from `brands/{brand}/`.
- Do not hard-code brand-specific blacklist logic into engines or adapters.

## Market-Specific Risk Notes

- {{MARKET_RISK_NOTE_1}}
- {{MARKET_RISK_NOTE_2}}
