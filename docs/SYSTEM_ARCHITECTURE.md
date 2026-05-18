# System Architecture

## Platform Overview

```text
aooi.com AI SEO/GEO Automation Platform
│
├─ Brand Knowledge Layer
│  ├─ brand profiles
│  ├─ product facts
│  ├─ claim whitelist / blacklist
│  ├─ localisation rules
│  └─ semantic maps
│
├─ Data Source Intelligence Layer
│  ├─ search data
│  ├─ social listening
│  ├─ review language analysis
│  ├─ competitor intelligence
│  ├─ AI-answer monitoring
│  └─ compliance / authority sources
│
├─ Generation Layer
│  ├─ FAQ briefs
│  ├─ schema JSON-LD
│  ├─ landing-page briefs
│  ├─ glossary structures
│  ├─ internal-link maps
│  └─ GEO audit reports
│
├─ Safety Layer
│  ├─ claim checker
│  ├─ factuality checker
│  ├─ source-quality scoring
│  ├─ fake-review blocker
│  └─ medical-claim blocker
│
├─ Publishing Adapter Layer
│  ├─ Shopify adapter
│  ├─ WordPress adapter
│  ├─ Webflow adapter
│  ├─ static export
│  └─ manual export
│
└─ Outputs
   ├─ markdown
   ├─ YAML / JSON
   ├─ JSON-LD
   ├─ adapter-ready snippets
   └─ audit reports
```

## Key Boundary

Core brand intelligence belongs in `brands/*` and platform docs. Publishing-specific implementation belongs in `adapters/*`. Generated artefacts belong in `outputs/*`.

No adapter should own brand truth.

## Brand Onboarding Flow

1. Create `brands/{brand}/brand_profile.yml`.
2. Create product facts and claim rules.
3. Define localisation rules.
4. Build semantic map.
5. Run data-source research and score sources.
6. Generate content briefs and schema outputs.
7. Export through an adapter.
8. Review manually before publishing.

## Future Code Modules

The first-stage repository is documentation-first. Future implementation can add `engines/data_source_engine/`, `engines/claim_checker/`, `engines/schema_generator/`, `engines/faq_generator/`, `engines/internal_link_generator/`, and `engines/geo_audit_engine/`.
