# aooi.ai 首版里程碑（Sprint 可验收目标）

面向：**订阅制 AI 宠物画像 SaaS**（欧美用户为主）。  
原则：**先跑通「认证 → 订阅/额度 → 生成任务 → 存图 → 作品库」闭环**，再精修首页与定价转化。

以下按 **5 个 Sprint** 组织（可视人力合并为 4 段，但验收项建议保留）。技术栈假设：**Next.js App Router、PostgreSQL、Stripe、对象存储（R2 等）、异步任务（Redis + BullMQ 或等价）、fal.ai 多模型路由**。

---

## 跨 Sprint 的统一定义

### 生成任务状态机（Job）

建议状态：

| 状态 | 含义 |
|------|------|
| `queued` | 已入队，等待 worker |
| `processing` | 已出队，正在调模型 |
| `succeeded` | 出图成功，已写入存储与作品记录 |
| `failed` | 可恢复或不可恢复失败（需 `error_code` / 日志） |
| `cancelled` | 用户或系统取消（少用，首版可占位） |

**额度规则（与用户故事对齐）**

- 创建任务时：**预扣或锁定 1 次额度**（二选一，但必须可审计）。
- `succeeded`：**确认消耗**（若用锁定则核销）。
- `failed`（可归因于平台/供应商）：**自动释放或返还**，并写一条 ledger，避免重复返还（幂等键：`job_id`）。

### Stripe Webhook（首版至少处理）

| 事件 | 用途 |
|------|------|
| `checkout.session.completed` | 新订用户与 `customer` / `subscription` 对齐 |
| `customer.subscription.updated` | 周期、档位、状态同步 |
| `customer.subscription.deleted` | 订阅结束，额度策略降级或冻结 |
| `invoice.paid` | 周期扣款成功，刷新当期额度（若按周期重置） |
| `invoice.payment_failed` | 标记欠费 / 宽限期（策略可简化为「暂停高清档」） |

**工程要求**：事件处理 **幂等**（`stripe_event_id` 唯一去重）、失败可 **重试**、关键步骤打日志便于追踪。

---

## Sprint 1 — 数据库与认证

**目标**  
用户可注册/登录，会话稳定；核心表结构就绪，后续订阅与任务都挂在 `user_id` 上。

**验收标准**

- [ ] 生产形态认证（Auth.js / Clerk / Supabase Auth 等任选其一）跑通：注册、登录、登出、受保护路由。
- [ ] 数据库迁移可重复执行（Prisma / Drizzle / SQL 迁移均可）。
- [ ] 每个登录用户有稳定 `user_id`（UUID），与 Stripe Customer 后续可关联。

**建议 Postgres 表（最小集）**

| 表 | 字段要点 |
|----|----------|
| `users` | `id`, `email`, `created_at`；若用第三方 IdP，存 `external_id` |
| `user_profiles`（可选） | `display_name`, `locale`, `timezone` |
| `stripe_customers` | `user_id`, `stripe_customer_id`（唯一） |

**本 Sprint 不做**  
支付、生成、风格业务逻辑。

---

## Sprint 2 — 订阅、支付与额度

**目标**  
用户可完成订阅购买；系统能识别「当前是否在订、哪一档」；**额度可查询、可扣减、可返还**（为 Sprint 3 预扣做准备）。

**验收标准**

- [ ] Pricing 页可发起 **Stripe Checkout**（测试模式即可），成功后 webhook 将订阅写入 DB。
- [ ] 用户后台或账户区可见：**当前方案、周期结束时间、剩余生成次数**（或等价「积分」）。
- [ ] Webhook 处理 **幂等**；同一事件重复投递不重复加额度。
- [ ] 文档化：各 Price ID 与「每月张数 / 模型档」的映射表（配置或 DB `plans`）。

**建议 Postgres 表**

| 表 | 字段要点 |
|----|----------|
| `plans` | `id`, `name`, `stripe_price_id`, `monthly_credits`, `allowed_models`（jsonb 可选） |
| `subscriptions` | `user_id`, `stripe_subscription_id`, `status`, `plan_id`, `current_period_start`, `current_period_end` |
| `credit_ledger` | `id`, `user_id`, `delta`, `reason`（`subscription_renewal` / `generation_reserve` / `generation_release` / `generation_commit` / `admin_adjust`）, `ref_type`, `ref_id`（如 `job_id`）, `idempotency_key`（唯一）, `created_at` |
| `credit_balance`（可选物化表） | `user_id`, `balance`；与 ledger 对账或单表累计（团队需统一一种策略） |

**Stripe 与本 Sprint 的边界**  
首版可只做「月付订阅 + 固定张数」；**加购包**可作为 Sprint 2 末尾或 Sprint 5 的增量（`checkout.session` 带 `metadata` 区分 SKU）。

---

## Sprint 3 — 上传、风格与 Job 全流程

**目标**  
登录且有余额的用户：**上传参考图 → 选风格 → 创建任务 → 看到状态变化 → 成功后得到可下载地址**（可先同步 worker，队列化可与本 Sprint 并行完成）。

**验收标准**

- [ ] **风格页**：每个风格有名称、示例图、对应后端 `style_id` / 预设 prompt 片段。
- [ ] 上传文件进对象存储，DB 记 `assets`（用户私有）。
- [ ] `POST` 创建 job：**校验额度并预扣/锁定**；返回 `job_id`。
- [ ] Worker 调 fal（经 `routeGenerate`），结果 **上传 R2**，DB 更新 job 为 `succeeded` 并关联 `output_asset_id`。
- [ ] 失败路径：`failed` + 释放额度 + 用户可见错误文案（非技术堆栈）。
- [ ] 前端：**轮询或 SSE** 展示 `queued → processing → succeeded/failed`。

**建议 Postgres 表**

| 表 | 字段要点 |
|----|----------|
| `styles` | `id`, `slug`, `name`, `preview_asset_id`, `prompt_template`, `default_model`, `sort_order`, `active` |
| `assets` | `id`, `user_id`, `r2_key`, `mime`, `bytes`, `width`, `height`, `created_at` |
| `generation_jobs` | `id`, `user_id`, `status`, `style_id`, `model`, `prompt_snapshot`, `input_asset_id`, `output_asset_id`, `error_code`, `error_message`, `idempotency_key`, `created_at`, `started_at`, `completed_at` |

**Job 状态机在本 Sprint 的完成度**  
须实现 **预扣 → 成功提交 / 失败释放** 的闭环；重试策略（如 3 次指数退避）可简化为「失败即释放」，复杂重试放 Sprint 6。

---

## Sprint 4 — 作品库与用户后台（Dashboard）

**目标**  
用户可浏览历史作品、下载、删除（软删）；后台集中展示额度与订阅摘要。

**验收标准**

- [ ] **作品库**：仅本人可见，分页列表，缩略图 + 生成时间 + 风格名；单张下载（含合理文件名）。
- [ ] **Dashboard**：订阅状态、剩余额度、近期任务列表（含失败与返还说明）。
- [ ] 文生图（若 PRD 要求首版）：与图生图共用同一 job 表，`input_asset_id` 可为空。
- [ ] 移动端：**基础可用**（列表可滑、按钮可点、上传可用系统相册）。

**建议 Schema 调整**

- `generation_jobs` 或 `assets` 增加 `deleted_at`（软删）若需「用户删除作品」。
- 列表查询一律 `where user_id = ?`，禁止仅靠 URL 猜 id。

---

## Sprint 5 — 首页、定价转化与法务页

**目标**  
对外转化与信任：**样张、价格、FAQ**；法律与隐私合规占位完整（文案可律师审）。

**验收标准**

- [ ] 首页：Hero、风格样张、社会证明占位、清晰 CTA（注册/开始试用）。
- [ ] 定价页：与 Stripe 实际套餐一致；移动端可读。
- [ ] **法务**：`Terms`、`Privacy`；若明确做欧盟用户，Cookie/同意与数据删除入口列入 backlog 或本 Sprint 简版。
- [ ] 视觉：**奶油白 / 米白 + 浅金 + 柔和蓝灰**，避免重科技蓝（与策划一致）。

**本 Sprint 可顺带验收的运营指标埋点（最小）**

- 首页 → 注册、注册 → Checkout、订阅 → 首次 `succeeded` job（事件名约定即可，工具 PostHog/GA4 择一）。

---

## Sprint 6（推荐）— 稳定与可观测

**目标**  
降低线上事故与成本失控风险；支撑 PRD 中的非功能要求。

**验收标准**

- [ ] Stripe webhook 失败重试 + 死信可查（或 Dashboard 告警）。
- [ ] Job 失败率、平均耗时、P95 耗时可查询（日志或简易指标表）。
- [ ] 对 fal / R2 错误分类，必要时降级模型（可选）。
- [ ] 基础限流：按用户或 IP 创建 job，防止刷接口。

---

## 与当前代码仓库的对应关系（便于 Cursor 执行）

| 已有/进行中 | 后续衔接 |
|-------------|----------|
| `app/[locale]/generate`、`lib/ai/router.ts` | Sprint 3 接真实 fal、job 表与预扣额度 |
| `POST /api/jobs`（Next Route）占位 | 鉴权 + 额度校验；或与 `apps/api` 统一由后端创建 job |
| `app/[locale]/pricing` | Sprint 2 接 Stripe Checkout（经 `apps/api` 或 Next server action） |
| **next-intl** `messages/en|de|fr|es.json` | 前台默认英文 + 欧陆四语；续翻与 SEO/hreflang 在 Sprint 5 |
| `apps/api` FastAPI 支付骨架 | 实现 `StripeAdapter`、webhook、`CreditService`、与 Supabase 迁移 |

---

## 文档维护

本文件随首版范围变更更新；重大表结构或状态机变更请同步修改本节与 `credit_ledger` 规则说明。
