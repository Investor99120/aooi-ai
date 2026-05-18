# Generic Brand Framework

## Purpose

The generic brand framework turns one independent-store implementation into a repeatable AI SEO/GEO system for future brands.

FriendRedLight is the first example case, but the templates in `templates/brand_template/` must not contain FriendRedLight-specific defaults.

## What The Framework Solves

Independent commerce brands often start with product pages. Aooi upgrades them into semantic asset systems that AI and search engines can understand, cite, compare, recommend and route toward conversion.

The generic framework captures:

- Brand facts.
- Product facts.
- Claim boundaries.
- Human intent.
- Emotional scenarios.
- Trust objections.
- Search demand.
- Content architecture.
- Schema structure.
- Publishing targets.
- Feedback loops.

## Template Set

`templates/brand_template/` contains reusable starting points for:

- brand profile
- product facts
- claim whitelist
- claim blacklist
- localisation rules
- semantic map
- search intent map
- content cluster map
- FAQ bank
- publishing targets

## Adapter Neutrality

Every template must support Shopify, WordPress, Webflow and static export. Publishing adapters are output channels only. They do not contain core brand intelligence and must not auto-publish by default.

## Source Status Discipline

Template fields should preserve source-status discipline:

- `verified`
- `owner_defined`
- `unverified`
- `needs_owner_confirmation`
- `needs_research`

Unverified fields must not become customer-facing claims.

## Example Case Rule

FriendRedLight can be referenced in documentation as the first case implementation. It must not be used as default template content.
