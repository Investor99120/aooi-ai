# Manual AI Answer Audit Framework

Manual AI Answer Audit Framework is implemented in Phase 8D.

中文描述：
Manual AI Answer Audit Framework 在 Phase 8D 实现。

It validates manually provided AI answer snapshots, summarises brand mentions, summarises competitor mentions, summarises citation presence, flags claim and authority risks and generates manual audit reports.

中文描述：
它用于校验人工提供的 AI 回答快照，总结品牌提及、竞品提及、引用情况，标记 claim 和权威背书风险，并生成手动审计报告。

Manual Audit Snapshot Pack is implemented in Phase 8E.

中文描述：
Manual Audit Snapshot Pack 在 Phase 8E 实现。

It selects a small prompt batch, creates a prompt and AI surface matrix, creates empty manual snapshot templates, creates manual collection instructions, and creates a batch manifest and checklist.

中文描述：
它会选择一小批 prompt，创建 prompt × AI surface 矩阵，创建空白人工 snapshot 模板，创建人工采集说明，并创建批次 manifest 和 checklist。

## Boundaries

It does not call AI platforms.

中文描述：
它不调用 AI 平台。

It does not scrape external data.

中文描述：
它不抓取外部数据。

It does not run automated monitoring.

中文描述：
它不运行自动化 monitoring。

It does not generate AI visibility scores.

中文描述：
它不生成 AI visibility score。

It does not generate SEO content, publish or connect Shopify API.

中文描述：
它不生成 SEO 内容，不发布，也不连接 Shopify API。

It does not call AI platforms, scrape AI answers, store real AI answers automatically, generate AI visibility scores, publish content or connect Shopify API.

中文描述：
它不调用 AI 平台，不抓取 AI 回答，不自动存储真实 AI 回答，不生成 AI visibility score，不发布内容，也不连接 Shopify API。

## CLI Usage

Validate manually provided snapshots:

中文描述：
校验人工提供的 snapshots：

```bash
node engines/ai_answer_audit/manual_ai_answer_audit_validator.js friendredlight
```

Build the manual audit report:

中文描述：
生成 manual audit report：

```bash
node engines/ai_answer_audit/manual_ai_answer_audit_builder.js friendredlight
```

Build the manual snapshot collection pack:

中文描述：
生成 manual snapshot collection pack：

```bash
node engines/ai_answer_audit/manual_snapshot_pack_builder.js friendredlight
```
