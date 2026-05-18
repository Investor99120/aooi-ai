# FriendRedLight Claim Blacklist

Do not use these claims in generated copy, schema, product pages, FAQs, ads, email, social, comparison content, or Shopify adapter outputs unless future legal and regulatory review explicitly approves them.

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

- sleep disorder treatment
- insomnia treatment
- arthritis treatment
- eczema treatment
- acne cure
- chronic pain treatment
- injury healing
- wound healing
- depression treatment
- anxiety treatment
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

## Banned Tone And Positioning

- miracle device
- medical breakthrough
- pain-fixing device
- hospital-grade cure
- cheap LED cure
- biohacker secret
- guaranteed transformation
- no-risk health outcome

## Rewrite Rules

- Replace "treats pain" with "can be part of a gentle comfort-focused routine".
- Replace "cures insomnia" with "can support a calmer evening routine".
- Replace "heals inflammation" with "is designed for non-invasive home wellness".
- Replace "guaranteed results" with "consistent use, following the product manual, is recommended".
- Replace "clinically proven to fix" with "explained in conservative, evidence-aware wellness language".
- Replace unverified product specifications with `TBC` and `needs_owner_confirmation`.

## Platform Enforcement

If any generated output includes a banned phrase or an equivalent medicalised claim, it must be blocked before adapter export.
