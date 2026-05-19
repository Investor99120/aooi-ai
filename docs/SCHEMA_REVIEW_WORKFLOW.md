# Schema Review Workflow

Schema candidates are not live code.

中文描述：
Schema 候选文件不是线上代码。

Generated JSON-LD must be manually reviewed before use. Do not paste generated schema into Shopify, WordPress, Webflow, static sites, or any live storefront before review.

中文描述：
生成的 JSON-LD 必须人工审核后才能使用。审核前不要把生成的 schema 粘贴到 Shopify、WordPress、Webflow、静态站点或任何线上独立站。

## Phase 4A And 4A.1 Scope

Product, FAQPage, HowTo, Article, OfferShippingDetails, and MerchantReturnPolicy schema are excluded in Phase 4A and Phase 4A.1.

中文描述：
Phase 4A 和 Phase 4A.1 明确排除 Product、FAQPage、HowTo、Article、OfferShippingDetails 和 MerchantReturnPolicy schema。

The current generator only creates Organization, Brand, and WebSite schema candidates.

中文描述：
当前生成器只创建 Organization、Brand 和 WebSite schema 候选文件。

## Validation Order

Before schema candidates can move toward future publication, they must pass:

中文描述：
Schema 候选文件进入未来发布流程前，必须通过：

- Claim Validator for description fields
- Source Status Validator for source-status discipline
- Publishing Safety Policy checks
- Manual review

## Source Status Boundary

Schema Generator must not use `unverified`, `needs_owner_confirmation`, or `needs_research` facts in schema output.

中文描述：
Schema Generator 不能在 schema 输出中使用 `unverified`、`needs_owner_confirmation` 或 `needs_research` 事实。

Source Status Validator should block unverified fields before they reach schema exports.

中文描述：
Source Status Validator 应在未验证字段进入 schema 导出前阻断它们。

## Claim Boundary

Claim Validator should check description fields. Schema descriptions must not include medicalised claims, fake reviews, fake authority associations, guaranteed result claims, product benefit overclaims, warranty claims, delivery claims, or certification claims.

中文描述：
Claim Validator 应检查 description 字段。Schema description 不能包含医疗化 claim、假评价、假权威背书、保证结果、夸大的产品利益、保修承诺、配送承诺或认证承诺。

## Review Reports

Schema Generator should write:

中文描述：
Schema Generator 应写入：

- `schema_generation_report.json`
- `blocked_fields_report.json`
- `schema_review_checklist.md`

These reports explain generated files, skipped fields, blocked fields, excluded schema types, validation summaries, manual review requirements, and publish readiness.

中文描述：
这些报告说明生成文件、跳过字段、阻断字段、排除的 schema 类型、验证摘要、人工审核要求和发布准备度。

## Publishing Boundary

Publishing must follow the Publishing Safety Policy. Generated schema candidates are not publish-ready until all gates pass and manual approval is complete.

中文描述：
发布必须遵守 Publishing Safety Policy。生成的 schema 候选文件只有在所有关卡通过并完成人工批准后，才可以进入发布准备状态。
