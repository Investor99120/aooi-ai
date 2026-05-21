# Prompt Universe Policy

## A. Purpose

Prompt Universe stores reviewable AI-search prompt candidates before any AI answer monitoring, competitor visibility tracking or content opportunity scoring.

中文描述：
Prompt Universe 用于存储可审核的 AI 搜索问题候选，在进行 AI 回答监测、竞品可见度追踪或内容机会评分之前先建立问题资产。

Prompt Universe is an AI-search question asset library. It helps Aooi understand how users may ask AI systems about a brand, category, routine, comparison, trust concern or buying decision.

中文描述：
Prompt Universe 是 AI 搜索问题资产库。它帮助 Aooi 理解用户可能如何向 AI 系统询问品牌、品类、日常场景、对比、信任顾虑或购买决策。

Prompt Universe is not:

中文描述：
Prompt Universe 不是：

- final SEO content
- final FAQ
- external scraped data
- AI answer result
- ranking guarantee
- publishing output

## B. What Prompt Universe Stores

Each prompt candidate should store:

中文描述：
每条 prompt candidate 应存储：

- prompt text
- prompt type
- market
- language
- target AI surface
- intent cluster
- emotional cluster
- trust objection
- funnel stage
- commercial intent
- content opportunity type
- related product category
- related product
- competitor context
- claim risk level
- source status
- monitoring eligibility
- content generation eligibility
- manual review status
- owner notes

## C. Source Status Rules

Prompts can be `owner_defined` or `needs_research`.

中文描述：
Prompts 可以是 `owner_defined` 或 `needs_research`。

Prompt demand must not be treated as verified until data is gathered and reviewed.

中文描述：
在收集并审核数据之前，prompt demand 不能被当作已验证事实。

Prompt candidates do not prove search volume, AI visibility, user demand or commercial value.

中文描述：
Prompt candidates 不能证明搜索量、AI 可见度、用户需求或商业价值。

## D. Claim Risk Rules

Prompt candidates must not become content without claim review.

中文描述：
Prompt candidates 未经过 claim 审核前，不能变成内容。

Medicalised prompts, guaranteed-result prompts or risky comparison prompts must be marked `needs_review` or `blocked` before future content generation.

中文描述：
医疗化 prompt、保证结果 prompt 或高风险对比 prompt，在未来内容生成前必须标记为 `needs_review` 或 `blocked`。

## E. AI Monitoring Readiness

`monitoring_eligible: candidate` means a prompt can be considered for future monitoring. It does not mean it has been monitored.

中文描述：
`monitoring_eligible: candidate` 表示该 prompt 可以被未来监测考虑，但不代表已经被监测。

Future monitoring must record the AI surface, answer snapshot, date, brand mention, competitor mention, citations and risk notes.

中文描述：
未来监测必须记录 AI 平台、回答快照、日期、品牌提及、竞品提及、引用来源和风险备注。

## F. Competitor Prompt Boundaries

Competitor mentions must not be invented as market facts.

中文描述：
竞品提及不能被编造成市场事实。

Competitor prompt maps are planning candidates only. They do not prove competitor share of voice, AI visibility or ranking.

中文描述：
竞品 prompt map 只是规划候选，不证明竞品声量、AI 可见度或排名。

## G. Content Opportunity Relationship

Prompt Universe can support future FAQ expansion, blog brief generation, comparison planning, email marketing adapters and social creative adapters.

中文描述：
Prompt Universe 可以支持未来 FAQ 扩展、blog brief 生成、对比内容规划、邮件营销 adapter 和社媒创意 adapter。

Prompt candidates are not final briefs. Content opportunity scoring must wait for future data, review and validation.

中文描述：
Prompt candidates 不是最终 brief。内容机会评分必须等待未来数据、审核和 validation。

## H. Manual Review Requirements

Every prompt candidate should default to `manual_review_required: true`.

中文描述：
每条 prompt candidate 默认应为 `manual_review_required: true`。

Before a prompt can feed future content generation, the owner must review intent, claim risk, source status and commercial context.

中文描述：
prompt 进入未来内容生成前，owner 必须审核 intent、claim risk、source status 和商业语境。

## I. Bilingual Review Boundary

Human-readable policy and review documents may include Chinese explanations.

中文描述：
人类可读的 policy 和 review 文档可以包含中文说明。

Machine-readable YAML and JSON prompt files must not contain Chinese descriptions.

中文描述：
机器可读 YAML 和 JSON prompt 文件不能包含中文说明。

Final customer-facing content should remain in the target-market language unless a future output mode explicitly allows bilingual review.

中文描述：
最终用户可见内容应保持目标市场语言，除非未来 output mode 明确允许 bilingual review。

## J. Prompt Universe Validator

Prompt Universe Validator is implemented in Phase 8B.

中文描述：
Prompt Universe Validator 在 Phase 8B 实现。

It validates prompt universe assets before they can become future AI monitoring or content opportunity scoring candidates.

中文描述：
它在 prompt universe 资产进入未来 AI monitoring 或 content opportunity scoring 候选流程之前进行验证。

The validator checks required fields, source_status discipline, claim risk terms, monitoring eligibility boundaries, content generation eligibility boundaries, competitor context boundaries and machine-readable file safety.

中文描述：
validator 会检查必填字段、source_status 纪律、claim 风险词、monitoring eligibility 边界、content generation eligibility 边界、竞品语境边界和机器可读文件安全。

The validator does not call AI platforms, scrape external data, run AI answer monitoring, generate SEO content, publish or connect to Shopify API.

中文描述：
validator 不调用 AI 平台，不抓取外部数据，不运行 AI answer monitoring，不生成 SEO 内容，不发布，也不连接 Shopify API。
