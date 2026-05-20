# Shopify Adapter

## Role

Shopify Adapter is a publishing-output layer, not the core system.

中文描述：
Shopify Adapter 是发布输出层，不是核心系统。

The adapter must read upstream approved or reviewable assets. It must not own brand intelligence, product facts, claim rules or source-status decisions.

中文描述：
Adapter 必须读取上游已经审核或可审核的资产，不能拥有品牌智能、产品事实、claim 规则或 source_status 判断。

## Phase 6A Scope

Phase 6A only creates review outputs and manual-copy candidates.

中文描述：
Phase 6A 只创建审核输出和人工复制候选内容。

It does not:
- connect to Shopify API
- auto-publish
- modify live theme
- create Shopify pages
- create Shopify sections
- generate FAQPage Schema
- generate Product Schema

中文描述：
它不会连接 Shopify API，不会自动发布，不会修改线上主题，不会创建 Shopify 页面或模块，也不会生成 FAQPage/Product Schema。

## Inputs

Phase 6A reads:

- `outputs/{brand}/faq/export_candidate/faq_export_candidate.md`
- `outputs/{brand}/faq/export_candidate/faq_export_candidate_review.md`
- `outputs/{brand}/faq/export_candidate/faq_export_candidate_report.json`
- `outputs/{brand}/faq/export_candidate/faq_export_blocked_items_report.json`
- `publishing/modes.yml`
- `docs/PUBLISHING_SAFETY_POLICY.md`
- `brands/{brand}/claim_blacklist.md`

中文描述：
Phase 6A 读取 FAQ export candidate pack、发布安全策略和品牌 claim blacklist。

## Outputs

Phase 6A writes to:

- `outputs/{brand}/shopify/shopify_faq_block_clean.md`
- `outputs/{brand}/shopify/shopify_faq_block_review.md`
- `outputs/{brand}/shopify/shopify_faq_output_report.json`
- `outputs/{brand}/shopify/shopify_faq_blocked_items_report.json`
- `outputs/{brand}/shopify/shopify_manual_publish_checklist.md`

中文描述：
Phase 6A 的输出放在 `outputs/{brand}/shopify/`，用于人工审核和人工复制，不是线上 Shopify 内容。

## CLI Usage

Run the default brand:

中文描述：
运行默认品牌：

```bash
node adapters/shopify/shopify_faq_review_output_builder.js
```

Run a specific brand:

中文描述：
运行指定品牌：

```bash
node adapters/shopify/shopify_faq_review_output_builder.js friendredlight
```

## Safety Boundaries

Clean Shopify output must remain in the target-market language only, with no Chinese review descriptions.

中文描述：
Clean Shopify output 必须只保留目标市场语言，不能包含中文审核说明。

Review output may include Chinese descriptions for owner review, but it is not final Shopify output.

中文描述：
Review output 可以包含中文说明，方便 owner 审核，但它不是最终 Shopify 输出。

JSON reports must not contain Chinese descriptions and must keep `publish_ready: false`, `shopify_api_used: false`, `auto_publish_used: false` and `live_theme_modified: false`.

中文描述：
JSON 报告不能包含中文说明，并且必须保持不可发布、不使用 Shopify API、不自动发布、不修改线上主题。

## Bilingual Review Output Rule

Shopify adapter previews may include Chinese descriptions only as internal review notes for the owner. Final customer-facing Shopify copy should remain in the target market language by default unless the output mode is explicitly set to bilingual review.

中文描述：
Shopify adapter 预览可以在内部审核备注中包含中文说明，但最终用户可见 Shopify 文案默认应保持目标市场语言，除非明确设置为 bilingual review。

Do not add Chinese descriptions inside Liquid, HTML, CSS, JSON-LD, schema, JavaScript, YAML, JSON or other machine-readable export formats.

中文描述：
不要在 Liquid、HTML、CSS、JSON-LD、schema、JavaScript、YAML、JSON 或其他机器可读导出格式中加入中文说明。
