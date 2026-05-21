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
