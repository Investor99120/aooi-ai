# Schema Generator Policy

Schema Generator creates machine-readable schema candidates that help search engines and AI systems understand brand entities while keeping every output reviewable before publication.

中文描述：
Schema Generator 用来生成机器可读的 schema 候选文件，帮助搜索引擎和 AI 系统理解品牌实体，同时确保所有输出在发布前都可以人工审核。

## A. Purpose

The purpose of Schema Generator is to generate machine-readable schema candidates, support SEO/GEO visibility, help AI systems understand safe brand-level entities, and keep output reviewable before publication.

中文描述：
Schema Generator 的目的，是生成机器可读的 schema 候选文件，支持 SEO/GEO 可见性，帮助 AI 系统理解安全的品牌级实体，并确保输出发布前可审核。

## B. Phase 4A Scope

Phase 4A only allows:

中文描述：
Phase 4A 只允许生成：

- Organization
- Brand
- WebSite

Phase 4A explicitly excludes:

中文描述：
Phase 4A 明确禁止生成：

- Product
- FAQPage
- HowTo
- Article
- OfferShippingDetails
- MerchantReturnPolicy

These schema types are more likely to involve product specifications, FAQ claims, logistics, returns, warranties, or health-related content. They require later phase handling.

中文描述：
这些 schema 类型更容易涉及产品参数、FAQ claim、物流、退货、保修或健康相关内容，必须留到后续阶段处理。

## C. Source Status Rules

- `verified` can be used for facts.
- `owner_defined` can be used for brand positioning where appropriate.
- `unverified` cannot be exported.
- `needs_owner_confirmation` cannot be exported.
- `needs_research` cannot be exported.
- `schema_ready` fields must be `verified`.
- Missing `source_status` should result in `needs_review` or `blocked`.

中文描述：
Source status 规则要求：verified 可用于事实；owner_defined 可用于适当的品牌定位；unverified、needs_owner_confirmation、needs_research 不能导出；schema_ready 字段必须是 verified；缺失 source_status 时应进入 needs_review 或 blocked。

## D. Claim Safety Rules

Description fields must pass Claim Validator. Schema candidates must not include medicalised claims, fake reviews, fake authority association, guaranteed result claims, invented certifications, invented UK warehouse claims, or invented delivery claims.

中文描述：
description 字段必须通过 Claim Validator。Schema 候选文件不能包含医疗化 claim、假评价、假权威背书、保证结果、编造认证、编造英国仓库信息或编造配送承诺。

## E. Output Rules

Generated output goes to `outputs/{brand}/jsonld/`. Generated files are schema candidates, not live code. Generated files require manual review. There is no automatic publishing and no Shopify live theme modification.

中文描述：
生成文件进入 `outputs/{brand}/jsonld/`。这些文件只是 schema 候选文件，不是线上代码。所有文件都需要人工审核，不允许自动发布，也不允许修改 Shopify live theme。

## F. Bilingual Review Boundary

Docs and README files may include Chinese explanations. JSON-LD files must not include Chinese review descriptions. Machine-readable outputs must remain clean and valid.

中文描述：
docs 和 README 可以包含中文解释。JSON-LD 文件不能包含中文 review 描述。机器可读输出必须保持干净、有效。
