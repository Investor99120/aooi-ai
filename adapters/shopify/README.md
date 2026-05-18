# Shopify Adapter

## Role

The Shopify adapter is a publishing-output layer for Aooi-generated SEO/GEO assets. It is not the core system and must not contain the primary brand intelligence.

## What It May Output

- Shopify page briefs.
- FAQ block structures.
- JSON-LD snippets.
- Product-page copy suggestions.
- Internal-link recommendations.
- Theme implementation notes.

## What It Must Not Do In Phase 1

- Auto-publish to Shopify.
- Modify a live Shopify theme automatically.
- Invent product specifications.
- Generate fake reviews.
- Bypass claim rules.
- Hard-code FriendRedLight logic into reusable adapter code.

## Expected Input

The adapter should consume brand profiles, product facts, claim rules, localisation rules, and semantic maps from `brands/{brand}/`.

## Expected Output

Generated files should go to `outputs/{brand}/shopify/`.

All output must be manually reviewed before publication.
