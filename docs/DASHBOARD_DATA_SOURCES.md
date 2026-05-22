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
| `outputs/{brand}/prompt_universe/prompt_universe_validation_report.json` | Prompt Universe validation report | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/prompt_universe_blocked_items_report.json` | Prompt Universe blocked items report | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/prompt_universe_review_checklist.md` | Prompt Universe review checklist | Markdown | human-readable | yes | no |

Prompt candidates are not AI visibility proof.

中文描述：
Prompt candidates 不是 AI 可见度证明。

Prompt candidates are not final SEO content.

中文描述：
Prompt candidates 不是最终 SEO 内容。

Prompt Universe JSON reports are machine-readable and must not include Chinese descriptions. The review checklist may include Chinese descriptions for owner review.

中文描述：
Prompt Universe JSON 报告是机器可读文件，不得包含中文描述。review checklist 可以包含中文说明，方便 owner 审核。

## H. Prompt Monitoring Readiness Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/prompt_universe/monitoring_readiness/priority_prompt_list.md` | Future monitoring prompt candidate list | Markdown | human-readable | yes | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/ai_surface_matrix.md` | Future AI surface testing matrix | Markdown | human-readable | yes | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/manual_answer_snapshot_template.md` | Future manual AI answer snapshot template | Markdown | human-readable | yes | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/mention_extraction_template.json` | Mention extraction template | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/citation_recording_template.json` | Citation recording template | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/risk_annotation_template.json` | Risk annotation template | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/prompt_monitoring_readiness_report.json` | Monitoring readiness report | JSON | machine-readable | no | no |
| `outputs/{brand}/prompt_universe/monitoring_readiness/prompt_monitoring_readiness_checklist.md` | Monitoring readiness checklist | Markdown | human-readable | yes | no |

No real AI answers are stored in Phase 8C, and no AI visibility has been measured.

中文描述：
Phase 8C 不存储真实 AI 回答，也不测量 AI visibility。

## I. AI Answer Audit Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/ai_answer_audit/manual_snapshots/` | Future manually provided AI answer snapshots | JSON folder | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json` | Manual AI answer audit report | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_summary.md` | Manual AI answer audit summary | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_blocked_items_report.json` | Blocked manual audit items | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_checklist.md` | Manual audit checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json` | Manual Snapshot Import Gate report | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_import_blocked_items_report.json` | Manual Snapshot Import Gate blocked and needs-review items | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_import_checklist.md` | Manual Snapshot Import Gate checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json` | Manual AI Visibility Observation report | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_visibility_observation_summary.md` | Manual AI Visibility Observation summary | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_visibility_observation_checklist.md` | Manual AI Visibility Observation checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/content_gap/content_gap_diagnosis_report.json` | Content Gap Diagnosis report | JSON | machine-readable | no | no |
| `outputs/{brand}/content_gap/content_gap_diagnosis_summary.md` | Content Gap Diagnosis summary | Markdown | human-readable | yes | no |
| `outputs/{brand}/content_gap/content_gap_review_checklist.md` | Content Gap Diagnosis review checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/content_opportunity/content_opportunity_score_report.json` | Content Opportunity Score report | JSON | machine-readable | no | no |
| `outputs/{brand}/content_opportunity/content_opportunity_score_summary.md` | Content Opportunity Score summary | Markdown | human-readable | yes | no |
| `outputs/{brand}/content_opportunity/content_opportunity_review_checklist.md` | Content Opportunity Score review checklist | Markdown | human-readable | yes | no |

Manual snapshots are human-provided. Reports are review-only. Phase 8D does not run automated AI calls and does not generate a final visibility score.

中文描述：
manual snapshots 由人工提供。报告仅用于 review。Phase 8D 不运行自动 AI 调用，也不生成最终 visibility score。

Manual Snapshot Import Gate reports validate manually imported snapshots. Reports are review-only. They do not generate visibility scores and do not prove population-level AI visibility.

中文描述：
Manual Snapshot Import Gate 报告用于校验人工导入的 snapshots。报告仅用于 review，不生成 visibility score，也不证明总体层面的 AI visibility。

Observation reports are review-only. They do not generate final visibility scores and do not prove population-level AI visibility. They are suitable for a future Dashboard AI Audit View.

中文描述：
Observation reports 仅用于 review，不生成最终 visibility score，也不证明总体层面的 AI visibility。它们适合未来 Dashboard AI Audit View 读取。

Content Gap Diagnosis reports are review-only. They do not generate customer-facing content and do not generate content opportunity scores. They are suitable for a future Dashboard Content Gap View.

中文描述：
Content Gap Diagnosis 报告仅用于 review，不生成用户可见内容，也不生成内容机会评分。它们适合未来 Dashboard Content Gap View 读取。

Content Opportunity Score reports are review-only. They score candidate assets only and do not generate customer-facing content. They are suitable for a future Dashboard Opportunity View.

中文描述：
Content Opportunity Score 报告仅用于 review，只给候选资产评分，不生成用户可见内容。它们适合未来 Dashboard Opportunity View 读取。

## J. AI Answer Audit Snapshot Pack Data

| File | Purpose | File type | Readability | Chinese allowed | Customer-facing |
| --- | --- | --- | --- | --- | --- |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/manual_snapshot_collection_plan.md` | Manual snapshot collection plan | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/selected_prompt_surface_matrix.md` | Selected prompt and surface matrix | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/manual_snapshot_batch_manifest.json` | Manual snapshot batch manifest | JSON | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/snapshot_templates/` | Empty snapshot template folder | JSON folder | machine-readable | no | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/manual_snapshot_collection_checklist.md` | Manual collection checklist | Markdown | human-readable | yes | no |
| `outputs/{brand}/ai_answer_audit/manual_snapshot_pack/manual_snapshot_pack_report.json` | Manual snapshot pack report | JSON | machine-readable | no | no |

Snapshot templates are empty by default. The system does not collect real AI answers. JSON files are machine-readable and must not include Chinese descriptions. Markdown files may include Chinese descriptions.

中文描述：
snapshot templates 默认是空白的。系统不会采集真实 AI 回答。JSON 文件是机器可读文件，不得包含中文描述；Markdown 文件可以包含中文说明。

## Dashboard Handling Notes

Machine-readable files should be parsed and displayed as structured status cards or tables.

中文描述：
机器可读文件应解析后以结构化状态卡片或表格展示。

Human-readable review files may be previewed directly, but the dashboard must label them as review-only when they contain Chinese explanations.

中文描述：
人类可读审核文件可以直接预览，但如果包含中文说明，dashboard 必须标注为 review-only。
