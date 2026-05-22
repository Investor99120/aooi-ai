# Manual Snapshot Import Gate Checklist

This checklist is for Phase 8F review-mode manual snapshot imports only.

中文描述：
此清单用于 Phase 8F 人工 AI 回答快照导入门禁审核。

- [ ] Confirm manual snapshots exist
- [ ] Confirm answer_snapshot is filled
- [ ] Confirm contains_real_ai_answer is true
- [ ] Confirm test_date is filled
- [ ] Confirm ai_surface is valid
- [ ] Confirm brand_mentioned is true/false
- [ ] Confirm brand_recommended is true/false
- [ ] Confirm competitors_mentioned is array
- [ ] Confirm citations and source_urls are arrays
- [ ] Confirm no system AI platform calls
- [ ] Confirm no scraping
- [ ] Confirm no automated monitoring
- [ ] Confirm no visibility score
- [ ] Confirm AI answers are observations only
- [ ] Confirm AI answers are not verified facts
- [ ] Confirm claim_risk_notes are aggregated
- [ ] Confirm manual_review_required remains true
- [ ] Confirm publish_ready remains false
- [ ] Confirm no Shopify API
- [ ] Confirm no SEO content generated

中文描述：
导入门禁只判断人工 snapshots 是否可进入未来 observation report。它不会调用 AI 平台、不会抓取外部数据、不会生成 visibility score、不会生成 SEO 内容、不会连接 Shopify API，也不会自动发布。
