# FriendRedLight Claim Blacklist

Do not use these claims in generated copy, schema, product pages, FAQs, ads, email, social, comparison content, or Shopify adapter outputs unless future legal and regulatory review explicitly approves them.

The categories below are reusable for future independent-store brands. Brand-specific examples may be added under the same headings.

## Banned Medical Claim Verbs

- cure
- treat
- heal disease
- diagnose
- prevent disease
- reverse disease
- medically proven to fix
- clinically guaranteed
- clinically proven to cure
- prescribed for

## Banned Result Claims

- guaranteed pain relief
- guaranteed better sleep
- guaranteed sleep improvement
- guaranteed recovery
- guaranteed inflammation reduction
- guaranteed skin cure
- guaranteed anxiety relief
- guaranteed depression relief
- instant results
- permanent results

## Banned Condition Claims

- insomnia treatment
- arthritis treatment
- eczema treatment
- chronic pain treatment
- depression treatment
- anxiety treatment
- injury healing
- wound healing
- sleep disorder treatment
- acne cure
- hormonal treatment
- anti-inflammatory cure
- chronic fatigue treatment
- seasonal affective disorder treatment

## Banned Trust And Evidence Claims

- fake Trustpilot reviews
- fake Reddit mentions
- fake YouTube reviews
- fake TikTok testimonials
- fake customer testimonials
- invented before-and-after claims
- invented clinical endorsements
- invented doctor recommendations
- invented NHS association
- unverified certification claims
- unverified UK warehouse claims
- unverified delivery timelines
- unverified warranty promises
- unverified UK plug claims

## Banned Tone And Positioning

- miracle device
- medical breakthrough
- pain-fixing device
- hospital-grade cure
- cheap LED cure
- biohacker secret
- guaranteed transformation
- no-risk health outcome
- disease solution
- medical brand

## Rewrite Rules

- Replace "treats pain" with "supports a calming self-care routine".
- Replace "cures insomnia" with "can be used as part of an evening wind-down routine".
- Replace "heals inflammation" with "designed for gentle red and near-infrared light exposure".
- Replace "guaranteed results" with "results may vary depending on consistency and individual use".
- Replace "clinically proven to fix" with "explained in conservative, evidence-aware wellness language".
- Replace unverified product specifications with `TBC`, `unverified`, or `needs_owner_confirmation`.

## Platform Enforcement

If any generated output includes a banned phrase or an equivalent medicalised claim, it must be blocked before adapter export.

No engine or adapter should hard-code FriendRedLight-specific blacklist logic. Reusable systems must read blacklist files from `brands/{brand}/`.
