# FAQ Generator

FAQ Generator is not implemented in Phase 5A.

中文描述：
FAQ Generator 在 Phase 5A 不实现。

Phase 5A only defines the FAQ Bank structure and review policy.

中文描述：
Phase 5A 只定义 FAQ Bank 结构和审核规则。

## Future Inputs

Future FAQ Generator must read:

中文描述：
未来 FAQ Generator 必须读取：

- `brands/{brand_id}/faq_bank.yml`
- `brands/{brand_id}/claim_whitelist.md`
- `brands/{brand_id}/claim_blacklist.md`
- `brands/{brand_id}/semantic_map.yml`
- `docs/SOURCE_STATUS_POLICY.md`
- `validation/rules.yml`
- `publishing/modes.yml`

## Required Gates

Future FAQ Generator must pass through:

中文描述：
未来 FAQ Generator 输出前必须经过：

- Template Validation
- Claim Validator
- Source Status Validator
- Publishing Safety Policy
- Manual Review

## Phase 5A Limits

In Phase 5A, this folder does not generate final customer-facing FAQ, does not generate FAQPage Schema, does not generate Shopify FAQ blocks and does not auto-publish.

中文描述：
Phase 5A 中，这个文件夹不会生成最终用户可见 FAQ，不会生成 FAQPage Schema，不会生成 Shopify FAQ 模块，也不会自动发布。

FriendRedLight is only the first case, not hard-coded logic.

中文描述：
FriendRedLight 只是第一个案例，不是硬编码逻辑。
