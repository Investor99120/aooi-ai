# Dashboard Data Sources

## Purpose

This document lists the files the future Aooi Internal Review Dashboard may read.

中文描述：
本文档列出未来 Aooi 内部审核后台可以读取的文件。

The first dashboard should be file-based and read-only. It should not create a database in Phase 7A.

中文描述：
第一版 dashboard 应基于文件读取并保持只读。Phase 7A 不创建数据库。

## Data Source Rules

Each data source should be displayed with:

中文描述：
每个数据源应展示：

- purpose
- file type
- human-readable or machine-readable
- whether Chinese descriptions are allowed
- whether it can be customer-facing

## A. Brand Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `brands/{brand}/brand_profile.yml` | Brand identity, positioning and audience context | YAML | machine-readable | no | no |
| `brands/{brand}/product_facts.yml` | Product facts, verification status and policy facts | YAML | machine-readable | no | no |
| `brands/{brand}/semantic_map.yml` | Entity, intent, trust and content cluster map | YAML | machine-readable | no | no |
| `brands/{brand}/uk_localisation.md` | UK localisation and tone rules | Markdown | human-readable | yes | no |
| `brands/{brand}/claim_whitelist.md` | Allowed claim language and safer wording | Markdown | human-readable | yes | no |
| `brands/{brand}/claim_blacklist.md` | Banned claim language and risk rules | Markdown | human-readable | yes | no |
| `brands/{brand}/faq_bank.yml` | Structured FAQ candidate bank | YAML | machine-readable | no | no |

## B. Validation Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `validation/rules.yml` | Template validation rules | YAML | machine-readable | no | no |
| `docs/SOURCE_STATUS_POLICY.md` | Source status policy | Markdown | human-readable | yes | no |
| `docs/TEMPLATE_VALIDATION_RULES.md` | Template validation policy | Markdown | human-readable | yes | no |
| `outputs/{brand}/faq/faq_bank_validation_report.json` | FAQ Bank validation report | JSON | machine-readable | no | no |
| `outputs/{brand}/faq/faq_draft_generation_report.json` | FAQ draft generation report | JSON | machine-readable | no | no |
| `outputs/{brand}/faq/faq_draft_review_gate_report.json` | FAQ draft review gate report | JSON | machine-readable | no | no |

## C. Schema Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/jsonld/organization.schema.json` | Organization schema candidate | JSON-LD | machine-readable | no | candidate only |
| `outputs/{brand}/jsonld/brand.schema.json` | Brand schema candidate | JSON-LD | machine-readable | no | candidate only |
| `outputs/{brand}/jsonld/website.schema.json` | WebSite schema candidate | JSON-LD | machine-readable | no | candidate only |
| `outputs/{brand}/jsonld/schema_generation_report.json` | Schema generation report | JSON | machine-readable | no | no |
| `outputs/{brand}/jsonld/blocked_fields_report.json` | Schema blocked fields report | JSON | machine-readable | no | no |
| `outputs/{brand}/jsonld/schema_review_checklist.md` | Schema manual review checklist | Markdown | human-readable | yes | no |

## D. FAQ Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/faq/faq_drafts_review.md` | Review-mode FAQ drafts | Markdown | human-readable | yes | no |
| `outputs/{brand}/faq/blocked_faq_drafts_report.json` | Blocked FAQ draft report | JSON | machine-readable | no | no |
| `outputs/{brand}/faq/export_candidate/faq_export_candidate.md` | Clean FAQ export candidate | Markdown | human-readable | no | candidate only |
| `outputs/{brand}/faq/export_candidate/faq_export_candidate_review.md` | FAQ export owner review version | Markdown | human-readable | yes | no |
| `outputs/{brand}/faq/export_candidate/faq_export_candidate_report.json` | FAQ export candidate report | JSON | machine-readable | no | no |
| `outputs/{brand}/faq/export_candidate/faq_export_blocked_items_report.json` | FAQ export blocked items report | JSON | machine-readable | no | no |
| `outputs/{brand}/faq/export_candidate/faq_export_approval_checklist.md` | FAQ export approval checklist | Markdown | human-readable | yes | no |

## E. Shopify Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/shopify/shopify_faq_block_clean.md` | Shopify clean manual-copy candidate | Markdown | human-readable | no | candidate only |
| `outputs/{brand}/shopify/shopify_faq_block_review.md` | Shopify owner review output | Markdown | human-readable | yes | no |
| `outputs/{brand}/shopify/shopify_faq_output_report.json` | Shopify adapter output report | JSON | machine-readable | no | no |
| `outputs/{brand}/shopify/shopify_faq_blocked_items_report.json` | Shopify blocked items report | JSON | machine-readable | no | no |
| `outputs/{brand}/shopify/shopify_manual_publish_checklist.md` | Manual publish checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/shopify/shopify_manual_review_gate_report.json` | Shopify manual review gate report | JSON | machine-readable | no | no |
| `outputs/{brand}/shopify/shopify_manual_package_manifest.md` | Shopify manual package manifest | Markdown | human-readable | yes | no |
| `outputs/{brand}/shopify/shopify_manual_package_manifest_report.json` | Shopify manual package manifest report | JSON | machine-readable | no | no |

## F. Publishing Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `publishing/modes.yml` | Publishing mode rules | YAML | machine-readable | no | no |
| `docs/PUBLISHING_SAFETY_POLICY.md` | Publishing safety policy | Markdown | human-readable | yes | no |

## G. Prompt Universe Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `brands/{brand}/prompt_universe.yml` | AI-search prompt candidates | YAML | machine-readable | no | no |
| `brands/{brand}/prompt_clusters.yml` | Prompt cluster map | YAML | machine-readable | no | no |
| `brands/{brand}/competitor_prompt_map.yml` | Competitor prompt planning map | YAML | machine-readable | no | no |
| `docs/PROMPT_UNIVERSE_POLICY.md` | Prompt Universe policy | Markdown | human-readable | yes | no |
| `docs/PROMPT_UNIVERSE_FIELD_GUIDE.md` | Prompt Universe field guide | Markdown | human-readable | yes | no |
| `docs/AI_VISIBILITY_METRICS_DRAFT.md` | Future AI visibility metric definitions | Markdown | human-readable | yes | no |

Prompt candidates are not AI visibility proof.

中文描述：
Prompt candidates 不是 AI 可见度证明。

Prompt candidates are not final SEO content.

中文描述：
Prompt candidates 不是最终 SEO 内容。

## Dashboard Handling Notes

Machine-readable files should be parsed and displayed as structured status cards or tables.

中文描述：
机器可读文件应解析后以结构化状态卡片或表格展示。

Human-readable review files may be previewed directly, but the dashboard must label them as review-only when they contain Chinese explanations.

中文描述：
人类可读审核文件可以直接预览，但如果包含中文说明，dashboard 必须标注为 review-only。
