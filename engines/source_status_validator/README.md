# Source Status Validator

Source Status Validator is a lightweight compliance engine for checking whether brand facts can move into customer-facing outputs, schema outputs, or adapter exports.

中文描述：
Source Status Validator 是一个轻量合规引擎，用来检查品牌事实是否可以进入面向用户的内容、Schema 输出或 adapter 导出。

It reads:

中文描述：
它读取以下文件：

- `docs/SOURCE_STATUS_POLICY.md`
- `validation/rules.yml`
- `brands/{brand_id}/product_facts.yml`

## Purpose

The validator protects the system from exporting unconfirmed product facts, policy claims, certification claims, review claims, or schema-ready fields.

中文描述：
这个 validator 的作用是防止未确认的产品事实、政策承诺、认证信息、评价信息或 schema-ready 字段被导出。

It does not generate SEO content, Shopify pages, schema, or adapter exports.

中文描述：
它不生成 SEO 内容、Shopify 页面、Schema 或 adapter 导出。

## Core Rules

- `verified` can be used in customer-facing outputs.
- `owner_defined` can support positioning and strategy, but must not automatically become product facts.
- `unverified` cannot be used as customer-facing claims.
- `needs_owner_confirmation` cannot be exported.
- `needs_research` cannot be used as final content.
- `schema_ready_fields` must be `verified`.
- Missing `source_status` must return `needs_review` or `blocked`.
- The default policy is `blocked_when_uncertain`.

中文描述：
核心规则是：只有已验证事实可以进入面向用户的输出；owner_defined 只适合定位和策略；未验证、待确认、待研究的信息不能作为最终内容；schema-ready 字段必须是 verified；不确定时默认阻断或进入人工审核。

## CLI Usage

Run the default brand:

中文描述：
运行默认品牌：

```bash
node engines/source_status_validator/source_status_validator.js
```

Run a specific brand:

中文描述：
运行指定品牌：

```bash
node engines/source_status_validator/source_status_validator.js friendredlight
```

## Output Fields

- `decision`: `pass`, `needs_review`, or `blocked`
- `risk_level`: `low`, `medium`, or `high`
- `brand_id`: checked brand id
- `checked_files`: whether required files were loaded
- `source_status_summary`: count of observed status values
- `schema_ready_summary`: status of schema-ready candidates
- `findings`: blocked or review-required issues
- `export_permissions`: whether customer-facing, schema, or adapter export is allowed
- `manual_review_required`: whether a human must review before export
- `notes`: conservative policy notes

中文描述：
输出字段会说明最终决策、风险等级、检查的品牌、文件读取状态、source_status 汇总、schema-ready 汇总、发现的问题、导出权限、是否需要人工审核以及保守策略说明。

## Current Limits

The validator uses a lightweight YAML scanner rather than a full YAML parser. It is designed for the current template structure and should stay conservative.

中文描述：
当前版本使用轻量 YAML 扫描逻辑，不是完整 YAML 解析器。它适配当前模板结构，并刻意保持保守。

It does not verify external evidence, inspect live Shopify data, or approve any final publication.

中文描述：
它不会验证外部证据、检查实时 Shopify 数据，也不会批准任何最终发布。
