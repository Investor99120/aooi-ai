# Aooi Internal Review Dashboard Blueprint

## A. Purpose

Aooi Internal Review Dashboard is a file-based internal review interface for inspecting brand facts, product facts, validators, schema candidates, FAQ assets, Shopify outputs and manual review states.

中文描述：
Aooi 内部审核后台是一个基于文件读取的内部审核界面，用于查看品牌事实、产品事实、校验器结果、Schema 候选、FAQ 资产、Shopify 输出和人工审核状态。

The dashboard should help the owner understand what can be reviewed, what is blocked, what still needs confirmation and what must not be published.

中文描述：
Dashboard 应帮助 owner 看清楚哪些内容可以审核、哪些被阻断、哪些仍需确认、哪些绝不能发布。

## B. Dashboard Type

The first dashboard version should be:

中文描述：
第一版 dashboard 应该是：

- internal review dashboard
- not public SaaS
- not customer-facing
- file-based first
- no Shopify API in Phase 7A
- no auto-publishing
- no final page creation

The dashboard is a review layer over existing files. It is not an engine, not an adapter and not a publisher.

中文描述：
Dashboard 是覆盖在现有文件之上的审核层。它不是 engine，不是 adapter，也不是发布器。

## C. Core Pages

The dashboard should be designed around these pages:

中文描述：
Dashboard 应围绕以下页面设计：

1. Overview Dashboard
2. Brand Profile Review
3. Product Facts Review
4. Claim Risk Review
5. Source Status Review
6. Schema Review
7. FAQ Review
8. Shopify Package Review
9. Manual Approval Checklist
10. System Safety Boundaries

## D. Page Goals

### 1. Overview Dashboard

Purpose:
Show the current brand, current phase, top-level validation status, blocked items and next human actions.

中文描述：
展示当前品牌、当前阶段、总体校验状态、被阻断项目和下一步人工动作。

Reads:
- `brands/{brand}/brand_profile.yml`
- `outputs/{brand}/faq/*report.json`
- `outputs/{brand}/jsonld/*report.json`
- `outputs/{brand}/shopify/*report.json`

Key fields:
- brand name
- market focus
- latest validator decisions
- blocked count
- needs_review count
- publish_ready
- manual_review_required

Highlight:
- `blocked`
- `needs_review`
- `publish_ready: false`
- missing files
- unverified or needs_owner_confirmation facts

Forbidden actions:
- publish
- auto approve
- connect Shopify
- modify live theme

### 2. Brand Profile Review

Purpose:
Review brand identity, positioning, audience and prohibited positioning.

中文描述：
审核品牌身份、定位、受众和禁止定位。

Reads:
- `brands/{brand}/brand_profile.yml`
- `brands/{brand}/semantic_map.yml`
- `brands/{brand}/uk_localisation.md`

Key fields:
- brand_name
- brand_domain
- market_focus
- brand_positioning
- audience_profile
- ai_visibility_goal
- prohibited_positioning

Highlight:
- missing brand facts
- unclear positioning
- prohibited medical positioning
- hard-coded FriendRedLight assumptions

Forbidden actions:
- publish brand profile
- convert positioning into product claims without validation

### 3. Product Facts Review

Purpose:
Show which product facts are verified, unverified, owner-defined or need owner confirmation.

中文描述：
展示哪些产品事实已验证、未验证、owner-defined 或需要 owner 确认。

Reads:
- `brands/{brand}/product_facts.yml`
- `docs/SOURCE_STATUS_POLICY.md`

Key fields:
- verified_product_facts
- unverified_fields
- owner_confirmation_required
- schema_ready_fields
- delivery_policy
- returns_policy
- warranty_policy
- compliance_notes

Highlight:
- `unverified`
- `needs_owner_confirmation`
- `needs_research`
- schema-ready fields without verified status

Forbidden actions:
- export unverified product facts
- mark logistics, warranty, certification or review claims as publishable without source proof

### 4. Claim Risk Review

Purpose:
Review claim whitelist, blacklist and claim validator outcomes.

中文描述：
审核 claim 白名单、黑名单和 Claim Validator 输出。

Reads:
- `brands/{brand}/claim_whitelist.md`
- `brands/{brand}/claim_blacklist.md`
- `engines/compliance_checker/examples/validation_result.example.json`
- future claim validation reports

Key fields:
- allowed language
- banned medical claim verbs
- banned result claims
- banned condition claims
- safer rewrite patterns

Highlight:
- cure / treat / diagnose
- guaranteed results
- fake reviews
- invented authority
- medicalised positioning

Forbidden actions:
- approve risky claims
- bypass Claim Validator

### 5. Source Status Review

Purpose:
Review whether facts can enter customer-facing outputs, schema candidates or adapter exports.

中文描述：
审核事实是否可以进入用户可见输出、Schema candidate 或 adapter export。

Reads:
- `docs/SOURCE_STATUS_POLICY.md`
- `outputs/{brand}/faq/*report.json`
- `outputs/{brand}/jsonld/blocked_fields_report.json`

Key fields:
- source_status
- blocked_fields
- skipped_fields
- schema_ready_fields

Highlight:
- missing source_status
- unverified customer-facing claims
- needs_owner_confirmation in outputs
- needs_research as final answer

Forbidden actions:
- convert unverified facts into publishable copy
- bypass Source Status Validator

### 6. Schema Review

Purpose:
Review Organization, Brand and WebSite schema candidates and blocked field reports.

中文描述：
审核 Organization、Brand、WebSite Schema 候选和 blocked field 报告。

Reads:
- `outputs/{brand}/jsonld/organization.schema.json`
- `outputs/{brand}/jsonld/brand.schema.json`
- `outputs/{brand}/jsonld/website.schema.json`
- `outputs/{brand}/jsonld/schema_generation_report.json`
- `outputs/{brand}/jsonld/blocked_fields_report.json`
- `outputs/{brand}/jsonld/schema_review_checklist.md`

Key fields:
- generated_files
- excluded_schema_types
- blocked_fields
- publish_ready
- manual_review_required

Highlight:
- Product Schema requested too early
- FAQPage Schema requested too early
- unverified fields
- Chinese text inside JSON-LD

Forbidden actions:
- generate Product Schema
- generate FAQPage Schema
- paste JSON-LD into live Shopify without review

### 7. FAQ Review

Purpose:
Review FAQ Bank, drafts, export candidates, blocked FAQs and needs_review items.

中文描述：
审核 FAQ Bank、草稿、export candidate、blocked FAQ 和 needs_review 项。

Reads:
- `brands/{brand}/faq_bank.yml`
- `outputs/{brand}/faq/faq_bank_validation_report.json`
- `outputs/{brand}/faq/faq_drafts_review.md`
- `outputs/{brand}/faq/faq_draft_generation_report.json`
- `outputs/{brand}/faq/faq_draft_review_gate_report.json`
- `outputs/{brand}/faq/export_candidate/*`

Key fields:
- total_entries
- draft candidates
- blocked entries
- needs_review entries
- claim_validator_summary
- source_status_summary

Highlight:
- blocked FAQ in clean output
- answer_draft with risky claims
- unverified logistics or warranty facts
- FAQPage Schema readiness set too early

Forbidden actions:
- generate final FAQ page
- generate FAQPage Schema
- approve blocked FAQ

### 8. Shopify Package Review

Purpose:
Review Shopify manual-copy candidate, review output, reports, blocked items, checklist, review gate report and manual package manifest.

中文描述：
审核 Shopify manual-copy candidate、review output、报告、blocked items、checklist、review gate report 和 manual package manifest。

Reads:
- `outputs/{brand}/shopify/shopify_faq_block_clean.md`
- `outputs/{brand}/shopify/shopify_faq_block_review.md`
- `outputs/{brand}/shopify/shopify_faq_output_report.json`
- `outputs/{brand}/shopify/shopify_faq_blocked_items_report.json`
- `outputs/{brand}/shopify/shopify_manual_publish_checklist.md`
- `outputs/{brand}/shopify/shopify_manual_review_gate_report.json`
- `outputs/{brand}/shopify/shopify_manual_package_manifest.md`
- `outputs/{brand}/shopify/shopify_manual_package_manifest_report.json`

Key fields:
- shopify_clean_items
- blocked_items
- needs_review_items
- publish_ready
- shopify_api_used
- auto_publish_used
- live_theme_modified

Highlight:
- clean output contains Chinese
- blocked FAQ appears in clean output
- publish_ready true
- Shopify API used
- live theme modified

Forbidden actions:
- connect Shopify
- create Shopify section
- push live
- auto-publish

### 9. Manual Approval Checklist

Purpose:
Show the manual approval tasks the owner must complete before any future publishing decision.

中文描述：
展示 owner 在未来任何发布决定前必须完成的人工审核事项。

Reads:
- `outputs/{brand}/shopify/shopify_manual_publish_checklist.md`
- `outputs/{brand}/faq/export_candidate/faq_export_approval_checklist.md`
- `outputs/{brand}/jsonld/schema_review_checklist.md`

Key fields:
- manual approval tasks
- policy confirmations
- risk reminders

Highlight:
- unchecked high-risk items
- missing review gate reports

Forbidden actions:
- mark publish_ready in Phase 7A
- final approve without future approval workflow

### 10. System Safety Boundaries

Purpose:
Show system-wide safety rules so the owner can see what the dashboard must never do.

中文描述：
展示系统级安全规则，让 owner 清楚 dashboard 永远不能做什么。

Reads:
- `docs/PUBLISHING_SAFETY_POLICY.md`
- `docs/DASHBOARD_SAFETY_BOUNDARIES.md`
- `publishing/modes.yml`

Key fields:
- auto_publish_allowed
- manual_review_required
- final_publish_requires_human_approval
- blocked_when_uncertain

Highlight:
- any path suggesting auto-publishing
- any adapter bypassing validators

Forbidden actions:
- override safety policies
- bypass manual review

## E. Recommended Phase 7B Implementation Direction

Phase 7B can implement a minimal internal dashboard, but it should remain read-only first.

中文描述：
Phase 7B 可以实现最小内部 dashboard，但第一版应保持只读。

Recommended direction:

中文描述：
建议方向：

- minimal Next.js internal dashboard
- Tailwind UI
- file-based readers
- read-only views first
- no write actions except future local review notes
- no Shopify API
- no database in first implementation unless explicitly approved
- no publishing actions

Phase 7B should not turn the project into a public SaaS product.

中文描述：
Phase 7B 不应把项目直接变成公开 SaaS 产品。
