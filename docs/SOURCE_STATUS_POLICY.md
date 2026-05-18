# Source Status Policy

## Purpose

`source_status` tells Aooi whether a piece of information can be used in customer-facing outputs, internal strategy, schema candidates, or only as a research/owner-confirmation placeholder.

Engines and adapters must preserve `source_status` metadata.

## Status Values

### verified

Can be used in customer-facing outputs.

Use for facts confirmed by reliable documentation, owner-provided proof, product manuals, verified policies, or other accepted sources.

### owner_defined

Can be used for positioning, strategy, brand voice and internal logic.

Use for brand strategy, audience definitions, desired positioning, tone, and internal semantic direction. It should not be used to imply product facts, logistics, warranties, certifications, or reviews unless those facts are separately verified.

### unverified

Cannot be used as a customer-facing claim.

Use for observed or suspected information that has not been confirmed. It may inform research tasks, but must not appear as a factual claim in pages, schema, FAQs, ads, or adapter exports.

### needs_owner_confirmation

Must be confirmed by the owner before output.

Use for product specifications, policy details, logistics, warranties, certifications, reviews, support details, and any claim that depends on business documentation.

### needs_research

Requires source gathering and quality scoring before use.

Use for search queries, customer language, competitor claims, market assumptions, content opportunities, and AI answer observations that require data collection and review.

## Adapter Rules

Adapters must not export `unverified` or `needs_owner_confirmation` facts as customer-facing claims.

Adapters may include those facts only in internal review notes, blocked-fields reports, or owner-confirmation checklists.

## Engine Rules

Engines must preserve `source_status` metadata through every transformation.

If generated output combines multiple inputs, the output should inherit the most restrictive status unless a human reviewer verifies the final claim.

## Strict Source Discipline Areas

The following require strict source discipline:

- product facts
- product specifications
- logistics
- delivery timelines
- returns policies
- warranties
- certifications
- reviews
- social proof
- expert endorsements
- compliance-sensitive claims

## Default Behaviour

Default behaviour should be:

```text
block or mark for review
```

not:

```text
publish
```

When source status is missing, treat the field as `needs_owner_confirmation` or `needs_research`, depending on whether it is a business fact or a research task.
