# Publishing Safety Policy

Publishing Safety Policy defines how Aooi-generated outputs may move from internal review to draft export, adapter output, or manual publication.

中文描述：
Publishing Safety Policy 定义 Aooi 生成的内容如何从内部审核进入草稿导出、adapter 输出或人工发布流程。

## A. Purpose

The purpose of this policy is to prevent accidental publishing, prevent unreviewed health or wellness claims, prevent unverified facts from reaching customer-facing pages, protect Shopify and other live storefronts, and keep human approval as the final gate.

中文描述：
这份政策的目的，是防止误发布、防止未经审核的健康或 wellness claim 进入页面、防止未验证事实出现在用户可见内容中、保护 Shopify 和其他线上独立站，并确保最终发布必须经过人工批准。

Aooi may automatically research, score, generate briefs, create drafts, and check risk. Aooi must not publish by default.

中文描述：
Aooi 可以自动研究、评分、生成 brief、生成 draft、检查风险，但默认不能自动发布。

## B. Publishing Modes

### 1. Review Mode

Review Mode is for owner review only. It may include bilingual review output, including English copy with Chinese explanations. Review Mode output cannot be customer-facing and cannot be exported as final Shopify content.

中文描述：
Review Mode 只用于 owner 内部审核。它可以包含英文 copy 和中文解释，但不能作为用户可见内容，也不能作为最终 Shopify 内容导出。

### 2. Export Mode

Export Mode produces clean target-market language output. It does not include Chinese explanations by default. It may generate files for manual copy and paste, but it requires Claim Validator and Source Status Validator to pass before export.

中文描述：
Export Mode 生成干净的目标市场语言内容，默认不包含中文解释。它可以生成供人工复制粘贴的文件，但必须先通过 Claim Validator 和 Source Status Validator。

### 3. Draft Creation Mode

Draft Creation Mode may create draft posts or pages in future phases. Drafts must remain unpublished, require validation pass, and require manual review before publishing. This mode is policy-defined only and is not implemented yet.

中文描述：
Draft Creation Mode 未来可以创建草稿文章或页面，但草稿必须保持未发布状态，必须通过 validation，并且发布前必须人工审核。当前只定义政策，不实现功能。

### 4. Auto Publish Mode

Auto Publish Mode is disabled by default. It is not allowed for health, wellness, product claims, warranties, logistics, certifications, reviews, or comparison pages. It may only be considered in the future for low-risk, verified, non-claim content with explicit owner approval and adapter-level safeguards.

中文描述：
Auto Publish Mode 默认关闭。健康、wellness、产品 claim、保修、物流、认证、评价或对比页都不允许自动发布。未来只有低风险、已验证、非 claim 内容，且 owner 明确批准并具备 adapter 级保护时，才可以考虑。

## C. Required Pre-Publish Gates

Before any output enters an adapter or publishing workflow, it must pass:

中文描述：
任何输出进入 adapter 或发布流程前，必须通过以下检查：

- Template Validation
- Claim Validator
- Source Status Validator
- Manual Review
- Publishing Target Validation

## D. High-Risk Content That Cannot Auto-Publish

The following content types cannot auto-publish:

中文描述：
以下内容类型禁止自动发布：

- health or wellness claims
- product benefit claims
- product specifications
- delivery timelines
- warranty promises
- certification claims
- customer reviews
- Trustpilot, Reddit, YouTube, or TikTok proof
- competitor comparison pages
- medical-adjacent content
- schema involving Product, FAQPage, HowTo, OfferShippingDetails, or MerchantReturnPolicy

## E. Shopify Safety Rules

Shopify is a publishing adapter only. Aooi must not modify live Shopify themes automatically, must not publish automatically, and must send Shopify outputs to `outputs/{brand}/shopify/`. Draft creation is allowed only in future phases after validation. Final publishing must be manual unless explicitly approved in a future phase.

中文描述：
Shopify 只是 publishing adapter。Aooi 不能自动修改线上 Shopify theme，不能自动发布，Shopify 输出应进入 `outputs/{brand}/shopify/`。草稿创建只能在未来阶段通过 validation 后开放。最终发布必须人工完成，除非未来阶段明确批准。

Phase 6A Shopify Adapter Review Output only generates manual-review outputs and manual-copy candidates. It does not connect to Shopify API, does not auto-publish, does not modify live themes and does not create final Shopify pages.

中文描述：
Phase 6A 的 Shopify Adapter Review Output 只生成审核输出和人工复制候选内容，不连接 Shopify API，不自动发布，不修改线上主题，也不创建最终 Shopify 页面。

Phase 6B Shopify Manual Review Gate validates Shopify review outputs and manual-copy candidates. It does not create new Shopify content, connect to Shopify API, auto-publish, modify live themes, or generate final Shopify pages.

中文描述：
Phase 6B 的 Shopify Manual Review Gate 用于验证 Shopify 审核输出和人工复制候选内容。它不会创建新的 Shopify 内容，不连接 Shopify API，不自动发布，不修改线上主题，也不生成最终 Shopify 页面。

Phase 6C Shopify Manual Package Manifest creates a read-only delivery manifest for existing Shopify manual-copy outputs, review outputs, reports, blocked item reports, checklists and review gate reports. It does not create new Shopify content, connect to Shopify API, auto-publish, modify live themes, or generate final Shopify pages.

中文描述：
Phase 6C 的 Shopify Manual Package Manifest 为已有 Shopify 人工复制输出、审核输出、报告、blocked item report、checklist 和 review gate report 创建只读交付清单。它不会创建新的 Shopify 内容，不连接 Shopify API，不自动发布，不修改线上主题，也不生成最终 Shopify 页面。

## F. Bilingual Review Boundary

Review Mode may include Chinese descriptions. Export Mode and final customer-facing exports should remain in the target market language by default.

中文描述：
Review Mode 可以包含中文描述。Export Mode 和最终用户可见内容默认应保持目标市场语言。

Do not add Chinese descriptions inside Liquid, HTML, CSS, JSON-LD, JavaScript, YAML, CLI output, tests, or machine-readable files.

中文描述：
不要在 Liquid、HTML、CSS、JSON-LD、JavaScript、YAML、CLI 输出、测试或机器可读文件中加入中文描述。

## G. Default Decision Policy

The default decision policy is:

中文描述：
默认决策策略如下：

- blocked when uncertain
- needs_review when risk is unclear
- pass only when validation, claim checks, source status checks and manual review are complete
