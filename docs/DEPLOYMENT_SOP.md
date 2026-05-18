# Deployment SOP

## Principle

Aooi generates structured outputs. Operators review and publish them. The platform should not auto-publish to Shopify in phase 1.

## Safe Deployment Flow

```text
Brand facts
↓
Claim rules
↓
Data-source research
↓
Content / schema generation
↓
Safety check
↓
Human review
↓
Adapter export
↓
Manual publishing
↓
Post-publish audit
```

## Shopify Adapter Flow

1. Generate adapter-ready output into `outputs/{brand}/shopify/`.
2. Include page copy, FAQ blocks, JSON-LD snippets, and internal-link recommendations.
3. Mark unverified fields as `TBC` and block customer-facing publication.
4. Human reviews copy and schema.
5. Operator publishes through Shopify admin or controlled theme workflow.
6. Run post-publish checks for schema, links, and claim safety.

## Never Do Automatically

- Publish to Shopify.
- Push unreviewed claims live.
- Invent product facts.
- Generate fake testimonials.
- Claim Reddit, Trustpilot, or YouTube evidence without source verification.
