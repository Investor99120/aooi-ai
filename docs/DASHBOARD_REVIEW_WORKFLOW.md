# Dashboard Review Workflow

## A. Main Workflow

The internal dashboard should present the review pipeline in this order:

中文描述：
内部 dashboard 应按以下顺序展示审核流程：

```text
Brand Profile
↓
Product Facts
↓
Claim Rules
↓
Source Status
↓
Schema Candidates
↓
FAQ Bank
↓
FAQ Drafts
↓
FAQ Export Candidate
↓
Shopify Review Output
↓
Shopify Manual Package Manifest
↓
Manual Review
↓
Future Manual Publish
```

The dashboard should make it clear that future manual publishing is outside Phase 7A.

中文描述：
Dashboard 必须明确 future manual publish 不属于 Phase 7A。

## B. Status Values

The dashboard should display the following status values:

中文描述：
Dashboard 应展示以下状态值：

- `pass`
- `needs_review`
- `blocked`
- `draft_candidate`
- `export_candidate`
- `manual_review_required`
- `publish_ready_false`
- `future_only`

Status interpretation:

中文描述：
状态解释：

- `pass`: rule-based checks passed, but not necessarily legally approved
- `needs_review`: human review is required
- `blocked`: item must not move forward
- `draft_candidate`: can be considered for draft review
- `export_candidate`: can be considered for clean candidate review
- `manual_review_required`: owner approval is still required
- `publish_ready_false`: output is not ready for publication
- `future_only`: feature or action is outside current phase

## C. Button Rules

### Allowed Future Read-Only Buttons

The following buttons may be considered in a future UI if they remain read-only or local-only:

中文描述：
未来 UI 可以考虑以下按钮，但必须保持只读或本地操作：

- View file
- Copy clean output
- Open report
- Download package
- Mark as reviewed locally, in a future phase only

### Forbidden In Phase 7A / 7B

The following buttons must not exist in Phase 7A or the first Phase 7B implementation:

中文描述：
以下按钮不得出现在 Phase 7A 或第一版 Phase 7B 实现中：

- Publish to Shopify
- Connect Shopify
- Modify live theme
- Generate Product Schema
- Generate FAQPage Schema
- Auto approve
- Auto publish
- Push live
- Create Shopify section

## D. Human Review Role

The dashboard can support human review, but it cannot replace human approval.

中文描述：
Dashboard 可以辅助人工审核，但不能替代人工批准。

Human review should focus on:

中文描述：
人工审核应重点关注：

- whether product facts are verified
- whether source status is clear
- whether claim risk is acceptable
- whether clean outputs remain target-market language only
- whether blocked content is excluded
- whether publishing remains manual

The dashboard must never convert `needs_review` into `publish_ready`.

中文描述：
Dashboard 绝不能把 `needs_review` 自动变成 `publish_ready`。
