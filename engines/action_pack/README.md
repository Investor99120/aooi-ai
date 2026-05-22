# Action Pack Router

> 中文解释：
> 行动包路由器。

Action Pack Router（行动包路由器） is implemented in Phase 8J（在 Phase 8J 实现）.

It routes recommended asset candidates from Phase 8I（路由 Phase 8I 推荐的候选资产）, maps candidates to future adapters（将候选资产映射到未来适配器）, prepares for future adapter input preparation（为未来适配器输入准备做准备）, preserves review-only boundaries（保持仅审核边界）, and protects Social Video / Video Factory separation（保护社媒视频与视频工厂边界）.

## Boundaries

> 中文解释：
> 边界。

It does not generate FAQ content（不生成 FAQ 内容）.

It does not generate Shopify copy（不生成 Shopify 文案）.

It does not generate Email copy（不生成邮件文案）.

It does not generate Social Video scripts（不生成社媒视频脚本）.

It does not generate storyboards（不生成分镜）.

It does not generate image prompts（不生成图片提示词）.

It does not generate video prompts（不生成视频提示词）.

It does not call Video Factory（不调用视频工厂）.

It does not publish（不发布）.

It does not connect Shopify API（不连接 Shopify API）.

## Markdown Language Rule

> 中文解释：
> Markdown 语言规则。

Markdown can include bilingual owner review notes（Markdown 可包含双语 owner 审核说明）.

Machine-readable files must remain English-only（机器可读文件必须保持纯英文）.

Customer-facing outputs must remain target-market language only（用户可见输出必须保持目标市场语言）.

## CLI Usage

> 中文解释：
> CLI 用法。

```bash
node engines/action_pack/action_pack_router.js friendredlight
```
