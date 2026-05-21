# Manual Snapshot Collection Plan

This is a manual collection plan.

It does not call AI platforms.

It does not scrape answers.

It does not prove AI visibility.

It prepares 15 manual snapshot templates for future human testing.

中文描述：
这是人工采集计划，不调用 AI 平台，不抓取回答，不证明 AI 可见度，只准备 15 个未来人工测试用的 snapshot 模板。

Brand: friendredlight

## Selected Prompts

- frl_prompt_005: What should I check before buying a red light therapy device for home use? (trust_objection, MOFU, medium)
- frl_prompt_004: Is red light therapy safe to use at home? (safety, MOFU, medium)
- frl_prompt_013: What are alternatives to CurrentBody red light therapy devices? (alternative, BOFU, high)
- frl_prompt_003: How does red and near-infrared light fit into a home wellness routine? (routine_based, TOFU, low)
- frl_prompt_016: Which red light therapy device should I choose for home use? (product_fit, BOFU, high)

## Selected AI Surfaces

- ChatGPT
- Gemini
- Perplexity

Google AI Overview and Google AI Mode are future surfaces because access and regional triggering can be unstable.

中文描述：
Google AI Overview 和 Google AI Mode 暂列为未来 surfaces，因为访问和地区触发条件可能不稳定。

## Manual Collection Steps

1. Open one AI surface manually.
2. Paste the prompt exactly as written in the template.
3. Copy the answer manually into `answer_snapshot`.
4. Fill `test_date` and keep `test_location_or_market` as UK unless testing another market.
5. Mark `brand_mentioned` and `brand_recommended` as true or false.
6. Record `competitors_mentioned`, `citations` and `source_urls` when present.
7. Add risky medical, authority or factual issues to `claim_risk_notes`.
8. Keep `manual_review_required: true`.

AI answers are not verified facts.

中文描述：
AI 回答不是已验证事实。
