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

Manual Snapshot Import Gate is implemented in Phase 8F.

中文描述：
Manual Snapshot Import Gate 在 Phase 8F 实现。

It validates imported manual AI answer snapshots before they can enter future observation reports.

中文描述：
它会在人工 AI 回答快照进入未来 observation report 之前进行导入校验。

It confirms `answer_snapshot` is filled, `contains_real_ai_answer` is true, no system AI platform calls were used, no scraping was used, AI answers are not treated as verified facts, `claim_risk_notes` and matched risk terms are aggregated, and `publish_ready` remains false.

中文描述：
它会确认 `answer_snapshot` 已填写、`contains_real_ai_answer` 为 true、系统没有调用 AI 平台、没有抓取外部数据、AI 回答没有被当作 verified fact，并聚合 `claim_risk_notes` 与风险词，同时保持 `publish_ready` 为 false。

Manual AI Visibility Observation Report is implemented in Phase 8G.

中文描述：
Manual AI Visibility Observation Report 在 Phase 8G 实现。

It summarises manually collected AI answer snapshots, observes brand mention, recommendation, competitor and citation presence, compares AI surface framing, summarises claim risk observations, and classifies whether a prompt is a visibility sample or content opportunity sample.

中文描述：
它总结人工采集的 AI 回答快照，观察品牌提及、推荐、竞品和引用情况，对比不同 AI surface 的 framing，总结 claim risk observations，并判断某个 prompt 更像 visibility sample 还是 content opportunity sample。

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

The Phase 8F import gate does not call AI platforms, scrape external data, run automated monitoring, generate AI visibility scores, generate SEO content, publish or connect Shopify API.

中文描述：
Phase 8F import gate 不调用 AI 平台、不抓取外部数据、不运行自动 monitoring、不生成 AI visibility score、不生成 SEO 内容、不发布，也不连接 Shopify API。

The Phase 8G observation report does not generate final visibility scores, generate share of voice scores, treat AI answers as verified facts, generate customer-facing claims, generate SEO content, publish or connect Shopify API.

中文描述：
Phase 8G observation report 不生成最终 visibility score，不生成 share of voice score，不把 AI 回答当作 verified fact，不生成用户可见 claim，不生成 SEO 内容，不发布，也不连接 Shopify API。

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

Run the manual snapshot import gate:

中文描述：
运行 manual snapshot import gate：

```bash
node engines/ai_answer_audit/manual_snapshot_import_gate.js friendredlight
```

Build the manual AI visibility observation report:

中文描述：
生成 manual AI visibility observation report：

```bash
node engines/ai_answer_audit/manual_visibility_observation_report_builder.js friendredlight
```
