# Validation Layer

## Purpose

The `validation/` folder defines the rule layer before engines and adapters.

Validation does not generate content.

Validation does not publish.

Validation checks readiness, risk and source discipline.

## What Validation Protects

- Required file completeness.
- Placeholder replacement.
- Source-status discipline.
- Product fact safety.
- Claim risk.
- Publishing target safety.
- Manual review completion.

## Future Validators

Future code validators should read `validation/rules.yml`.

The first implementation should be conservative and simple: report missing fields, unresolved placeholders, unsafe source status, claim risks, publishing risks, and manual-review gaps.

## Default Behaviour

Default behaviour is:

```text
block or needs_review
```

not:

```text
publish
```
