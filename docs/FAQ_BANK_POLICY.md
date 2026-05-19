# FAQ Bank Policy

## A. Purpose

FAQ Bank stores reviewable FAQ candidates before any FAQ draft, FAQPage schema, Shopify FAQ block, or customer-facing answer is generated.

中文描述：
FAQ Bank 用于存储可审核的 FAQ 候选问题，在生成 FAQ 草稿、FAQPage Schema、Shopify FAQ 模块或客户可见答案之前先进行管理。

FAQ Bank is not a final FAQ page. It is a structured question asset library for search intent, emotional concerns, trust objections, claim risk, source status, schema readiness, Shopify block readiness and manual review.

中文描述：
FAQ Bank 不是最终 FAQ 页面，而是一个结构化问题资产库，用来管理搜索意图、情绪顾虑、信任障碍、claim 风险、source status、schema 准入、Shopify 模块准入和人工审核。

## B. What FAQ Bank Stores

Each FAQ candidate should store:

中文描述：
每条 FAQ 候选问题应存储：

- question
- answer_draft
- intent_cluster
- emotional_cluster
- trust_objection
- funnel_stage
- claim_risk_level
- source_status
- source_notes
- schema_eligible
- shopify_block_eligible
- requires_claim_validator
- requires_source_status_validator
- manual_review_required
- publishing_mode
- last_reviewed_at
- owner_notes

## C. Source Status Rules

Verified FAQ facts may be used after review. Owner-defined positioning can support answer direction. Unverified facts cannot become customer-facing answers. `needs_owner_confirmation` cannot be exported. `needs_research` cannot be used as a final answer. Missing `source_status` returns `needs_review` or `blocked`.

中文描述：
已验证 FAQ 事实可在审核后使用。owner_defined 定位可支持回答方向。未验证事实不能成为用户可见答案。`needs_owner_confirmation` 不能导出。`needs_research` 不能作为最终答案。缺失 `source_status` 时应进入 `needs_review` 或 `blocked`。

FAQ answers must not invent product facts, reviews, certifications, delivery timelines, warranties, or medical outcomes.

中文描述：
FAQ 答案不能编造产品事实、评价、认证、配送时效、保修承诺或医疗结果。

## D. Claim Risk Rules

FAQ answers must pass Claim Validator before export.

中文描述：
FAQ 答案导出前必须通过 Claim Validator。

FAQ answers must not include:

中文描述：
FAQ 答案不能包含：

- cure
- treat
- diagnose
- guaranteed results
- guaranteed pain relief
- insomnia treatment
- arthritis treatment
- fake reviews
- invented NHS association
- unverified certifications
- unverified delivery or warranty claims

## E. Schema Eligibility Rules

FAQ Bank may mark a question as `schema_eligible: candidate`, but FAQPage Schema is not generated in Phase 5A.

中文描述：
FAQ Bank 可以将问题标记为 `schema_eligible: candidate`，但 Phase 5A 不生成 FAQPage Schema。

FAQPage Schema must wait for later phases after Claim Validator passes, Source Status Validator passes, manual review completes and Publishing Safety Policy allows export.

中文描述：
FAQPage Schema 必须等到后续阶段，并且 Claim Validator、Source Status Validator、人工审核和 Publishing Safety Policy 全部通过后才能处理。

## F. Shopify FAQ Block Rules

Shopify FAQ Block output is not generated in Phase 5A.

中文描述：
Phase 5A 不生成 Shopify FAQ Block。

Future Shopify FAQ output must go to `outputs/{brand}/shopify/`, be manually reviewed, avoid automatic publishing, avoid Chinese review descriptions in final export and follow Publishing Safety Policy.

中文描述：
未来 Shopify FAQ 输出必须进入 `outputs/{brand}/shopify/`，必须人工审核，不得自动发布，最终导出中不得包含中文 review 描述，并且必须遵守 Publishing Safety Policy。

## G. Bilingual Review Boundary

Human-readable FAQ review materials may include English plus Chinese explanations for owner review.

中文描述：
人类可读的 FAQ 审核材料可以包含英文和中文解释，方便 owner 审核。

Do not add Chinese descriptions inside YAML, JSON, schema JSON-LD, code, tests or machine-readable files. Final customer-facing FAQ exports should remain in the target market language unless output mode is explicitly bilingual review.

中文描述：
不要在 YAML、JSON、schema JSON-LD、代码、测试或机器可读文件中加入中文描述。最终用户可见 FAQ 导出默认应保持目标市场语言，除非输出模式明确设为 bilingual review。

## H. Decision Values

FAQ candidate decision values:

中文描述：
FAQ 候选问题的决策值包括：

- draft_candidate
- needs_review
- blocked
- approved_for_draft
- approved_for_export

Default values:

中文描述：
默认值：

- `manual_review_required: true`
- `publishing_mode: review_mode`
- `auto_publish_allowed: false`

## I. FAQ Bank Validator

FAQ Bank Validator sits between FAQ Bank and future FAQ Draft Generator.

中文描述：
FAQ Bank Validator 位于 FAQ Bank 和未来 FAQ Draft Generator 之间。

Workflow:

中文描述：
流程：

```text
FAQ Bank
↓
FAQ Bank Validator
↓
FAQ Draft Generator
↓
Claim Validator
↓
Source Status Validator
↓
Publishing Safety Policy
↓
Manual Review
```

In Phase 5A.1, FAQ Bank Validator only checks structure, source status, claim risk, eligibility conflicts, manual review requirements and decision values. It does not generate FAQ drafts, FAQPage Schema, Shopify FAQ blocks or final customer-facing FAQ output.

中文描述：
Phase 5A.1 中，FAQ Bank Validator 只检查结构、source status、claim 风险、eligibility 冲突、人工审核要求和 decision 值。它不会生成 FAQ 草稿、FAQPage Schema、Shopify FAQ 模块或最终用户可见 FAQ 输出。
