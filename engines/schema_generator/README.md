# Schema Generator

Schema Generator creates low-risk JSON-LD schema candidates for brand-level entity understanding.

中文描述：
Schema Generator 用来创建低风险的 JSON-LD schema 候选文件，帮助搜索引擎和 AI 系统理解品牌级实体。

## Phase 4A Scope

Phase 4A only supports:

中文描述：
Phase 4A 只支持：

- Organization
- Brand
- WebSite

It does not generate Product, FAQPage, HowTo, Article, OfferShippingDetails, or MerchantReturnPolicy schema.

中文描述：
它不会生成 Product、FAQPage、HowTo、Article、OfferShippingDetails 或 MerchantReturnPolicy schema。

Those schema types can involve product parameters, FAQ claims, logistics, warranties, returns, health-adjacent language, or review claims, so they are deferred to later phases.

中文描述：
这些 schema 类型可能涉及产品参数、FAQ claim、物流、保修、退货、健康相关表达或评价信息，因此留到后续阶段。

## Inputs

The generator reads:

中文描述：
生成器读取以下输入：

- `brands/{brand_id}/brand_profile.yml`
- `brands/{brand_id}/product_facts.yml` only for safe metadata checks, not product schema export
- `docs/SOURCE_STATUS_POLICY.md`
- `validation/rules.yml`
- `publishing/modes.yml`

## Outputs

Generated candidates are written to:

中文描述：
生成的候选文件会写入：

- `outputs/{brand}/jsonld/`

The files are candidates for manual review. They are not live code and must not be pasted into Shopify before review.

中文描述：
这些文件是用于人工审核的候选文件，不是线上代码，审核前不要粘贴到 Shopify。

## Safety Rules

The generator does not automatically publish, does not modify Shopify, does not connect to Shopify APIs, and does not generate SEO content.

中文描述：
生成器不会自动发布，不会修改 Shopify，不会连接 Shopify API，也不会生成 SEO 内容。

Descriptions must pass Claim Validator. Product facts must not enter schema unless verified. Source Status Validator must be considered before final schema export.

中文描述：
description 必须通过 Claim Validator。产品事实只有 verified 后才能进入 schema。最终导出 schema 前必须考虑 Source Status Validator。

## CLI Usage

Run the default brand:

中文描述：
运行默认品牌：

```bash
node engines/schema_generator/schema_generator.js
```

Run a specific brand:

中文描述：
运行指定品牌：

```bash
node engines/schema_generator/schema_generator.js friendredlight
```

Run a dry run without writing schema candidate files:

中文描述：
运行 dry-run，不写入 schema candidate 文件：

```bash
node engines/schema_generator/schema_generator.js friendredlight --dry-run
```

The command prints a summary JSON to the terminal and writes schema candidate files to `outputs/{brand}/jsonld/`.

中文描述：
命令会在终端输出 summary JSON，并把 schema 候选文件写入 `outputs/{brand}/jsonld/`。

Normal mode writes schema candidate files and review reports. Dry-run mode writes review reports only and does not write schema candidate files.

中文描述：
普通模式会写入 schema candidate 文件和审核报告。Dry-run 模式只写审核报告，不写 schema candidate 文件。
