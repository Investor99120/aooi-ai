# Dashboard Safety Boundaries

## A. Dashboard Must Not

The Aooi Internal Review Dashboard must not:

中文描述：
Aooi 内部审核后台绝不能：

- auto-publish
- connect to Shopify API
- modify live theme
- create final Shopify pages
- generate FAQPage Schema
- generate Product Schema
- convert `needs_review` to `publish_ready`
- expose review-mode Chinese content as customer-facing output
- export unverified product facts
- bypass Claim Validator
- bypass Source Status Validator
- bypass Publishing Safety Policy

The dashboard should remain a review interface, not an execution authority.

中文描述：
Dashboard 应保持为审核界面，而不是执行权限层。

## B. Bilingual Boundary

Review pages may display Chinese descriptions.

中文描述：
审核页面可以展示中文说明。

Clean output pages must show whether the file contains Chinese descriptions.

中文描述：
Clean output 页面必须显示文件是否包含中文说明。

Machine-readable JSON, YAML, schema and code views must remain clean.

中文描述：
JSON、YAML、schema 和代码等机器可读视图必须保持干净。

Final customer-facing content should remain target-market language only.

中文描述：
最终用户可见内容应只保留目标市场语言。

## C. Risk Labels

The dashboard should display these risk labels:

中文描述：
Dashboard 应展示以下风险标签：

- medical claim risk
- fake review risk
- unverified fact risk
- publishing risk
- Shopify API risk
- schema risk
- bilingual leakage risk

Risk labels should be visible on overview cards, detail pages and manual approval checklists.

中文描述：
风险标签应显示在 overview card、详情页和人工审核清单中。

## D. Default Policy

If uncertain, show `needs_review`.

中文描述：
如果不确定，显示 `needs_review`。

If high risk, show `blocked`.

中文描述：
如果高风险，显示 `blocked`。

Never show `publish_ready` unless upstream reports explicitly allow it and manual approval is recorded in a future phase.

中文描述：
除非上游报告明确允许，并且未来阶段记录了人工批准，否则永远不要显示 `publish_ready`。

The dashboard must treat `publish_ready: false` as the expected normal state in current phases.

中文描述：
在当前阶段，dashboard 必须把 `publish_ready: false` 视为正常预期状态。
