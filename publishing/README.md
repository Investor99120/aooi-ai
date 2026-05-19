# Publishing Layer

The `publishing/` folder defines output safety modes for Aooi-generated assets.

中文描述：
`publishing/` 文件夹用于定义 Aooi 生成资产的发布安全模式。

It does not publish, does not connect to Shopify, does not generate content, and does not create adapter exports.

中文描述：
它不发布内容、不连接 Shopify、不生成内容，也不创建 adapter 导出。

This layer only defines review, export, draft creation, and auto-publish boundaries. Future adapters must read `publishing/modes.yml` before exporting content.

中文描述：
这一层只定义 review、export、draft creation 和 auto-publish 的边界。未来 adapter 在导出内容前必须读取 `publishing/modes.yml`。

## Default Safety Position

Auto-publishing is disabled by default. Manual review is required by default. Final publication requires human approval.

中文描述：
默认禁止自动发布，默认需要人工审核，最终发布必须有人类确认。

## Relationship To Validators

Publishing decisions should depend on Template Validation, Claim Validator, Source Status Validator, Manual Review, and Publishing Target Validation.

中文描述：
发布决策应依赖 Template Validation、Claim Validator、Source Status Validator、Manual Review 和 Publishing Target Validation。
