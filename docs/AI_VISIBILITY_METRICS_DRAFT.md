# AI Visibility Metrics Draft

## Purpose

This document defines future AI visibility metrics. Phase 8A does not measure these metrics yet.

中文描述：
本文档定义未来 AI visibility 指标。Phase 8A 只定义指标，不进行实际测量。

## Metrics

### Mention Rate

What it means: how often the brand appears in AI answers for monitored prompts.

中文描述：
含义：品牌在被监测 prompts 的 AI 回答中出现的频率。

Why it matters: shows basic brand discoverability in AI answers.

中文描述：
重要性：反映品牌在 AI 回答中的基础可发现性。

Future data source: AI answer snapshots.

Current status: not implemented.

## Phase 8C Boundary

Phase 8C prepares templates that may support future measurement, but it still does not measure AI visibility, store real AI answers or generate visibility scores.

中文描述：
Phase 8C 会准备未来可能用于测量的模板，但仍然不测量 AI visibility，不存储真实 AI 回答，也不生成 visibility score。

## Phase 8D Boundary

Phase 8D may summarise manually provided snapshots, but it still does not generate a final AI visibility score. Any mention or citation counts from manual snapshots are preliminary audit observations, not statistically reliable visibility metrics.

中文描述：
Phase 8D 可以总结人工提供的回答快照，但仍然不生成最终 AI visibility score。任何来自人工快照的提及或引用计数都只是初步审计观察，不是统计可靠的可见度指标。

## Phase 8E Boundary

Phase 8E creates manual snapshot collection templates only. It does not collect real AI answers by itself, does not generate visibility scores and does not turn prompt candidates into measured visibility metrics.

中文描述：
Phase 8E 只创建人工 snapshot 采集模板。它不会自行采集真实 AI 回答，不生成可见度分数，也不会把 prompt candidates 变成已测量的 visibility metrics。

## Phase 8F Boundary

Phase 8F validates manually imported AI answer snapshots before they can be used for future observation reports. It does not generate final visibility scores, does not treat AI answers as verified facts and does not convert AI answer text into customer-facing claims.

中文描述：
Phase 8F 会校验人工导入的 AI 回答快照，确认它们能否进入未来 observation report。它不生成最终 visibility score，不把 AI 回答当作 verified fact，也不会把 AI 回答文本转成用户可见 claim。

## Phase 8G Boundary

Phase 8G generates a review-only manual AI visibility observation report from imported manual snapshots. It may summarise observed mentions, recommendations, citations, competitor presence and surface framing, but it still does not generate final visibility scores, statistically representative metrics or customer-facing claims.

中文描述：
Phase 8G 会基于导入的人工快照生成 review-only AI visibility observation report。它可以总结观察到的品牌提及、推荐、引用、竞品出现和不同 AI surface 的 framing，但仍然不生成最终 visibility score、不生成统计代表性指标，也不生成用户可见 claim。

## Phase 8H Boundary

Phase 8H diagnoses content gaps from review-only manual AI visibility observations. It may identify missing brand-owned content assets and future content candidates, but it does not generate final SEO content, content opportunity scores, visibility scores or customer-facing claims.

中文描述：
Phase 8H 基于 review-only AI visibility observations 诊断内容缺口。它可以识别缺失的品牌自有内容资产和未来内容候选，但不生成最终 SEO 内容、不生成内容机会评分、不生成 visibility score，也不生成用户可见 claim。

## Phase 8I Boundary

> 中文解释：
> Phase 8I 边界。

Phase 8I scores content opportunity candidates from review-only content gap diagnosis reports. It may prioritise asset candidates and provide future adapter routing hints, but it does not generate SEO content, customer-facing copy, final visibility scores or publishable outputs.

中文描述：
Phase 8I 会基于 review-only content gap diagnosis 给内容机会候选资产评分。它可以排序候选资产并提供未来 adapter routing hints，但不生成 SEO 内容、不生成用户可见文案、不生成最终 visibility score，也不生成可发布内容。

## Phase 8J Boundary

> 中文解释：
> Phase 8J 边界。

Phase 8J routes review-only content opportunity candidates to future adapter targets. It may produce routing plans and first-batch recommendations, but it does not generate SEO content, customer-facing copy, social video scripts, storyboards, prompts, final visibility scores or publishable outputs.

中文描述：
Phase 8J 会把 review-only 内容机会候选资产路由到未来 adapter target。它可以生成路由计划和第一批建议，但不生成 SEO 内容、不生成用户可见文案、不生成社媒视频脚本、不生成分镜、不生成提示词、不生成最终 visibility score，也不生成可发布内容。

### Recommendation Rate

What it means: how often the brand is actively recommended, not merely mentioned.

中文描述：
含义：品牌被主动推荐的频率，而不仅仅是被提及。

Why it matters: recommendation language is closer to conversion intent.

Future data source: AI answer audit runner.

Current status: not implemented.

### Citation Rate

What it means: how often AI answers cite or reference brand-owned or trusted sources.

中文描述：
含义：AI 回答引用品牌自有或可信来源的频率。

Why it matters: citation can indicate source authority and retrieval strength.

Future data source: answer citations and source extraction.

Current status: not implemented.

### Share of Voice

What it means: brand visibility compared with competitors across a prompt set.

中文描述：
含义：品牌在一组 prompt 中相对竞品的可见度。

Why it matters: helps compare AI visibility in a category.

Future data source: brand and competitor mention extraction.

Current status: not implemented.

### Average Position

What it means: average rank or order of brand appearance in AI answers where ordered lists exist.

中文描述：
含义：在有排序列表的 AI 回答中，品牌出现位置的平均值。

Why it matters: earlier mentions may receive more user attention.

Future data source: structured answer parsing.

Current status: not implemented.

### Competitor Presence

What it means: which competitor categories or brands appear in AI answers.

中文描述：
含义：哪些竞品类别或品牌出现在 AI 回答中。

Why it matters: reveals comparative AI answer context.

Future data source: competitor mention extraction.

Current status: not implemented.

### Source Citation Quality

What it means: whether cited sources are brand-owned, third-party, authoritative, outdated or low quality.

中文描述：
含义：被引用来源是品牌自有、第三方、权威、过时还是低质量。

Why it matters: source quality affects trust and future content strategy.

Future data source: citation classification.

Current status: not implemented.

### Brand Understanding Accuracy

What it means: whether AI correctly describes brand positioning, market and claim boundaries.

中文描述：
含义：AI 是否正确描述品牌定位、市场和 claim 边界。

Why it matters: inaccurate understanding can damage trust or compliance.

Future data source: answer quality review.

Current status: not implemented.

### Sentiment / Framing

What it means: tone and framing of AI answers about the brand.

中文描述：
含义：AI 回答中关于品牌的语气和叙事框架。

Why it matters: positive, neutral or risky framing affects user trust.

Future data source: answer annotation.

Current status: not implemented.

### Answer Stability

What it means: how consistent AI answers remain over repeated checks.

中文描述：
含义：AI 回答在多次检查中的稳定程度。

Why it matters: unstable answers can indicate weak source grounding.

Future data source: repeated answer snapshots.

Current status: not implemented.

### Prompt Coverage

What it means: how many priority prompt clusters have monitoring coverage.

中文描述：
含义：有多少优先 prompt cluster 已被监测覆盖。

Why it matters: identifies monitoring blind spots.

Future data source: prompt universe and monitoring logs.

Current status: not implemented.

### Content Gap Signal

What it means: signals that a prompt lacks a strong brand-owned answer asset.

中文描述：
含义：某个 prompt 缺少强品牌自有回答资产的信号。

Why it matters: helps prioritise future FAQ, guide, comparison or routine content.

Future data source: AI answers, citations and content inventory.

Current status: not implemented.
