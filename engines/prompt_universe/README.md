# Prompt Universe

## Status

Prompt Universe Engine automatic monitoring is not implemented in Phase 8A or Phase 8B.

中文描述：
Prompt Universe Engine 在 Phase 8A 或 Phase 8B 不实现自动监控。

Phase 8A only defines:

中文描述：
Phase 8A 只定义：

- prompt data structure
- prompt clusters
- competitor prompt map
- field guide
- policy
- examples
- test cases

Prompt Universe Validator is implemented in Phase 8B.

中文描述：
Prompt Universe Validator 在 Phase 8B 实现。

It validates prompt universe fields, prompt clusters, competitor prompt maps, source_status discipline, claim risk terms, monitoring eligibility boundaries and content generation eligibility boundaries.

中文描述：
它用于验证 prompt universe 字段、prompt clusters、competitor prompt maps、source_status 纪律、claim 风险词、monitoring eligibility 边界和 content generation eligibility 边界。

It generates validation reports under `outputs/{brand}/prompt_universe/`.

中文描述：
它会在 `outputs/{brand}/prompt_universe/` 下生成验证报告。

## Future Scope

Future phases may implement:

中文描述：
未来 Phase 8B 可以实现：

- AI answer audit runner
- manual prompt testing workflow
- answer snapshot storage
- brand mention extraction
- competitor mention extraction
- visibility report generation

## Boundaries

No external AI platform calls in Phase 8A or Phase 8B.

中文描述：
Phase 8A 和 Phase 8B 不调用外部 AI 平台。

No scraping.

中文描述：
不抓取外部数据。

No publishing.

中文描述：
不发布。

No Shopify API.

中文描述：
不连接 Shopify API。

The validator does not run answer monitoring, generate SEO content, publish content or create Shopify outputs.

中文描述：
validator 不运行 AI answer monitoring，不生成 SEO 内容，不发布内容，也不创建 Shopify 输出。

## CLI Usage

Run the default brand:

中文描述：
运行默认品牌：

```bash
node engines/prompt_universe/prompt_universe_validator.js
```

Run a specific brand:

中文描述：
运行指定品牌：

```bash
node engines/prompt_universe/prompt_universe_validator.js friendredlight
```
