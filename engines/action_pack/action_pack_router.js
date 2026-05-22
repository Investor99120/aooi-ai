const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_JSON_INPUTS = [
  "outputs/{brand}/content_opportunity/content_opportunity_score_report.json",
  "outputs/{brand}/content_gap/content_gap_diagnosis_report.json",
  "outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json",
];

const REQUIRED_TEXT_INPUTS = [
  "outputs/{brand}/content_opportunity/content_opportunity_score_summary.md",
  "outputs/{brand}/content_opportunity/content_opportunity_review_checklist.md",
  "brands/{brand}/brand_profile.yml",
  "brands/{brand}/product_facts.yml",
  "brands/{brand}/claim_whitelist.md",
  "brands/{brand}/claim_blacklist.md",
  "brands/{brand}/prompt_universe.yml",
  "brands/{brand}/prompt_clusters.yml",
  "docs/AI_VISIBILITY_METRICS_DRAFT.md",
  "docs/DASHBOARD_DATA_SOURCES.md",
  "docs/PUBLISHING_SAFETY_POLICY.md",
  "docs/PROJECT_CONTEXT.md",
  "docs/SYSTEM_ARCHITECTURE.md",
];

const ROUTING_RULES = {
  "FAQ cluster": {
    route_to: ["future_faq_adapter", "future_manual_review_gate"],
    routing_reason: "High-priority asset suitable for future FAQ development after manual review.",
    allowed_next_steps: ["prepare future FAQ adapter input", "manual review"],
    not_allowed_now: ["generate FAQ answer body", "publish FAQ", "create FAQPage Schema"],
  },
  "Claim-safe terminology page": {
    route_to: ["future_claim_safety_adapter", "future_manual_review_gate"],
    routing_reason: "High-priority safety asset suitable for future claim-safe terminology preparation after manual review.",
    allowed_next_steps: ["prepare future claim safety adapter input", "manual review"],
    not_allowed_now: ["generate terminology page copy", "publish claim guidance", "approve AI wording as claims"],
  },
  "Product routine support block": {
    route_to: ["future_shopify_adapter", "future_manual_review_gate"],
    routing_reason: "Product routine support can inform a future Shopify adapter after owner and claim review.",
    allowed_next_steps: ["prepare future Shopify adapter input", "manual review"],
    not_allowed_now: ["generate product-page copy", "connect Shopify API", "modify live theme", "publish product routine block"],
  },
  "Shopify product-page routine section": {
    route_to: ["future_shopify_adapter", "future_manual_review_gate"],
    routing_reason: "Shopify product-page routine section has commercial fit but must stay future-only until manual review.",
    allowed_next_steps: ["prepare future Shopify adapter input", "manual review"],
    not_allowed_now: ["generate Shopify copy", "connect Shopify API", "modify live theme", "publish product page content"],
  },
  "Email education flow": {
    route_to: ["future_email_adapter", "future_manual_review_gate"],
    routing_reason: "Email education flow can be routed to a future email adapter after owner and claim review.",
    allowed_next_steps: ["prepare future email adapter input", "manual review"],
    not_allowed_now: ["generate email body", "connect email platform", "send email"],
  },
  "Educational guide": {
    route_to: ["future_educational_guide_adapter", "future_manual_review_gate"],
    routing_reason: "Educational guide requires source readiness and claim review before future guide preparation.",
    allowed_next_steps: ["prepare future educational guide adapter input", "manual review"],
    not_allowed_now: ["generate full article", "publish guide", "create customer-facing claims"],
  },
  "Social video brief": {
    route_to: ["future_social_video_adapter", "future_video_factory_adapter", "future_manual_review_gate"],
    routing_reason: "Social video brief can only be routed as a future candidate for a separate video workflow after manual review.",
    allowed_next_steps: ["prepare future social video adapter input", "manual review", "future video factory adoption gate"],
    not_allowed_now: [
      "generate social video script",
      "generate storyboard",
      "generate image prompt",
      "generate video prompt",
      "generate editing plan",
      "call video factory",
      "call video API",
      "publish social content",
    ],
  },
  "Citation-ready source page": {
    route_to: ["future_citation_source_adapter", "future_manual_review_gate"],
    routing_reason: "Citation-ready source page needs more source readiness and claim review before future source page preparation.",
    allowed_next_steps: ["prepare future citation source adapter input", "manual review"],
    not_allowed_now: ["generate source page copy", "publish source page", "treat AI answer as verified source", "create customer-facing claims"],
  },
};

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveTemplate(template, brandId) {
  return template.replace("{brand}", brandId);
}

function outputDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "action_pack");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function writeJson(filePath, data) {
  writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function readTextIfExists(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    return {
      exists: false,
      path: relativePath,
      content: "",
    };
  }
  return {
    exists: true,
    path: relativePath,
    content: fs.readFileSync(fullPath, "utf8"),
  };
}

function readJsonIfExists(relativePath) {
  const text = readTextIfExists(relativePath);
  if (!text.exists) {
    return {
      exists: false,
      path: relativePath,
      value: null,
      error: null,
    };
  }
  try {
    return {
      exists: true,
      path: relativePath,
      value: JSON.parse(text.content),
      error: null,
    };
  } catch (error) {
    return {
      exists: true,
      path: relativePath,
      value: null,
      error: error.message,
    };
  }
}

function loadInputs(brandId) {
  const jsonInputs = {};
  const textInputs = {};
  const missingInputs = [];
  const parseErrors = [];

  for (const template of REQUIRED_JSON_INPUTS) {
    const relativePath = resolveTemplate(template, brandId);
    const result = readJsonIfExists(relativePath);
    jsonInputs[relativePath] = {
      exists: result.exists,
      path: relativePath,
      parse_ok: result.exists && !result.error,
    };
    if (!result.exists) missingInputs.push(relativePath);
    if (result.error) parseErrors.push({ path: relativePath, error: result.error });
    jsonInputs[template] = result.value;
  }

  for (const template of REQUIRED_TEXT_INPUTS) {
    const relativePath = resolveTemplate(template, brandId);
    const result = readTextIfExists(relativePath);
    textInputs[relativePath] = {
      exists: result.exists,
      path: relativePath,
    };
    if (!result.exists) missingInputs.push(relativePath);
  }

  return {
    jsonInputs,
    textInputs,
    missingInputs,
    parseErrors,
  };
}

function routeConfidence(missingInputs) {
  if (missingInputs.length === 0) return "high";
  if (missingInputs.length <= 2) return "medium";
  return "low";
}

function routeForScore(score, missingInputs) {
  const rule = ROUTING_RULES[score.asset_type] || {
    route_to: [...(score.allowed_future_adapters || []), "future_manual_review_gate"],
    routing_reason: "Candidate requires manual routing review.",
    allowed_next_steps: ["manual review"],
    not_allowed_now: ["generate customer-facing content"],
  };

  return {
    asset_type: score.asset_type,
    source_score: score.weighted_total_score,
    priority_tier: score.priority_tier,
    route_to: rule.route_to,
    routing_confidence: routeConfidence(missingInputs),
    routing_reason: rule.routing_reason,
    allowed_next_steps: rule.allowed_next_steps,
    not_allowed_now: rule.not_allowed_now,
    adapter_status: "future_only",
    content_generated: false,
    manual_review_required: true,
    publish_ready: false,
  };
}

function routesByAsset(actionRoutes, assetTypes) {
  return assetTypes
    .map((assetType) => actionRoutes.find((route) => route.asset_type === assetType))
    .filter(Boolean);
}

function buildSummaryMarkdown(report) {
  const assetLabels = {
    "FAQ cluster": "FAQ 内容簇",
    "Claim-safe terminology page": "claim-safe 术语页",
    "Product routine support block": "产品日常使用支持模块",
    "Shopify product-page routine section": "Shopify 产品页日常使用区块",
    "Email education flow": "邮件教育流程",
    "Educational guide": "教育指南",
    "Social video brief": "社媒视频简报",
    "Citation-ready source page": "可引用来源页",
  };
  const label = (assetType) => `${assetType}（${assetLabels[assetType] || "候选资产"}）`;
  const firstBatchLines = report.first_batch_routing.recommended_first_batch
    .map((route) => `- ${label(route.asset_type)}：${route.route_to.join(", ")}`)
    .join("\n");
  const deferredLines = report.deferred_routing.deferred_candidates
    .map((route) => `- ${label(route.asset_type)}：${route.route_to.join(", ")}`)
    .join("\n");
  const adapterLines = report.action_routes
    .map((route) => `- ${label(route.asset_type)}：${route.route_to.join(", ")}`)
    .join("\n");

  return `# Action Pack Router Summary（行动包路由器总结）

This is a review-only routing report（这是仅审核用的路由报告）.

It is based on Phase 8I Content Opportunity Scorer（它基于 Phase 8I 内容机会评分器）.

It routes candidate assets only（它只路由候选资产）.

It does not generate customer-facing copy（它不生成用户可见文案）.

It does not generate FAQ / Shopify / Email / Social Video content（它不生成 FAQ、Shopify、邮件或社媒视频内容）.

It does not call Video Factory（它不调用视频工厂）.

It does not publish（它不发布）.

Source prompt（来源 prompt）：${report.source_prompt_ids.join(", ")}

First batch routing（第一批路由）：

${firstBatchLines}

Deferred routing（暂缓路由）：

${deferredLines}

Future adapter targets（未来适配器目标）：

${adapterLines}

Social Video Brief（社媒视频简报）在 aooi-ai GEO 主线中只能作为 future adapter target（未来适配器目标），不能生成 script（脚本）、storyboard（分镜）、image prompt（图片提示词）、video prompt（视频提示词）或 editing plan（剪辑计划）。这些全部属于独立 AI Video Factory（AI 视频工厂）模块。

Next recommended phase（下一建议阶段）：Phase 8K adapter input preparation（Phase 8K 适配器输入准备）或 manual owner review（人工 owner 审核），only after approval（仅在批准后）。

This summary is review-only（本总结仅审核用） and not customer-facing（非用户可见）.
`;
}

function buildChecklistMarkdown() {
  return `# Action Pack Review Checklist（行动包审核清单）

- [ ] Confirm routing is based on Phase 8I Content Opportunity Scorer（确认路由基于 Phase 8I 内容机会评分器）
- [ ] Confirm only candidate assets were routed（确认只路由候选资产）
- [ ] Confirm no FAQ content was generated（确认没有生成 FAQ 内容）
- [ ] Confirm no Shopify copy was generated（确认没有生成 Shopify 文案）
- [ ] Confirm no Email copy was generated（确认没有生成邮件文案）
- [ ] Confirm no Social Video script was generated（确认没有生成社媒视频脚本）
- [ ] Confirm no Storyboard was generated（确认没有生成分镜）
- [ ] Confirm no Image Prompt was generated（确认没有生成图片提示词）
- [ ] Confirm no Video Prompt was generated（确认没有生成视频提示词）
- [ ] Confirm Video Factory was not called（确认没有调用视频工厂）
- [ ] Confirm no final visibility score was generated（确认没有生成最终可见度分数）
- [ ] Confirm no AI answer was treated as verified fact（确认没有把 AI 回答当作已验证事实）
- [ ] Confirm no Shopify API was used（确认没有使用 Shopify API）
- [ ] Confirm no auto-publishing happened（确认没有自动发布）
- [ ] Confirm manual_review_required remains true（确认仍然需要人工审核）
- [ ] Confirm publish_ready remains false（确认 publish_ready 仍为 false）

Review-only（仅审核用）. Not customer-facing（非用户可见）.
`;
}

function buildActionPackRouter(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const inputs = loadInputs(brandId);
  const opportunityReport = inputs.jsonInputs["outputs/{brand}/content_opportunity/content_opportunity_score_report.json"] || {};
  const contentGapReport = inputs.jsonInputs["outputs/{brand}/content_gap/content_gap_diagnosis_report.json"] || {};
  const visibilityReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json"] || {};
  const scores = opportunityReport.opportunity_scores || [];
  const firstBatchAssetTypes = (opportunityReport.priority_recommendation && opportunityReport.priority_recommendation.recommended_first_batch) || [];
  const deferredAssetTypes = (opportunityReport.priority_recommendation && opportunityReport.priority_recommendation.defer_candidates) || [];
  const actionRoutes = scores.map((score) => routeForScore(score, inputs.missingInputs));
  const firstBatchRoutes = routesByAsset(actionRoutes, firstBatchAssetTypes);
  const deferredRoutes = routesByAsset(actionRoutes, deferredAssetTypes);
  const sourcePromptIds = (opportunityReport.scoring_scope && opportunityReport.scoring_scope.prompt_ids_scored)
    || (contentGapReport.diagnosis_scope && contentGapReport.diagnosis_scope.prompt_ids_diagnosed)
    || [];

  const report = {
    brand_id: brandId,
    phase: "8J",
    report_type: "action_pack_router",
    decision: "needs_review",
    source_files: {
      ...Object.fromEntries(Object.entries(inputs.jsonInputs).filter(([, value]) => value && value.path)),
      ...Object.fromEntries(Object.entries(inputs.textInputs).filter(([, value]) => value && value.path)),
    },
    missing_inputs: inputs.missingInputs,
    parse_errors: inputs.parseErrors,
    upstream_decisions: {
      content_opportunity_score: opportunityReport.decision || "unknown",
      content_gap_diagnosis: contentGapReport.decision || "unknown",
      manual_visibility_observation: visibilityReport.decision || "unknown",
    },
    source_prompt_ids: sourcePromptIds,
    routing_scope: {
      routing_only: true,
      source_phase: "8I",
      asset_candidates_routed: actionRoutes.length,
      first_batch_candidates: firstBatchAssetTypes,
      deferred_candidates: deferredAssetTypes,
      statistically_representative: false,
      population_level_claim: false,
    },
    routing_method: {
      uses_opportunity_scores: true,
      uses_content_gap_diagnosis: true,
      uses_manual_visibility_observation: true,
      review_only: true,
    },
    action_routes: actionRoutes,
    first_batch_routing: {
      recommended_first_batch: firstBatchRoutes,
      rationale: "First batch routes mirror Phase 8I recommended_first_batch and remain future-only until manual review.",
    },
    deferred_routing: {
      deferred_candidates: deferredRoutes,
      rationale: "Deferred routes remain important but need more source readiness, claim review, separate adapter preparation or Video Factory adoption before execution.",
    },
    video_factory_boundary: {
      social_video_brief_is_candidate_only: true,
      video_factory_called: false,
      social_video_script_generated: false,
      storyboard_generated: false,
      image_prompt_generated: false,
      video_prompt_generated: false,
      editing_plan_generated: false,
      video_api_job_generated: false,
      content_generated: false,
    },
    boundary_status: {
      routing_only: true,
      content_generated: false,
      customer_facing_copy_generated: false,
      faq_content_generated: false,
      shopify_copy_generated: false,
      email_copy_generated: false,
      social_video_script_generated: false,
      storyboard_generated: false,
      image_prompt_generated: false,
      video_prompt_generated: false,
      video_factory_called: false,
      final_visibility_score_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
      ai_answers_treated_as_verified_fact: false,
      action_pack_generated: false,
    },
    markdown_language_rule: {
      markdown_can_include_bilingual_owner_review_notes: true,
      machine_readable_files_must_remain_english_only: true,
      customer_facing_outputs_must_remain_target_market_language_only: true,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "Action Pack Router is review-only and routes candidate assets to future adapter targets without generating content or production outputs.",
    ],
  };

  const dir = outputDir(brandId);
  writeJson(path.join(dir, "action_pack_router_report.json"), report);
  writeText(path.join(dir, "action_pack_router_summary.md"), buildSummaryMarkdown(report));
  writeText(path.join(dir, "action_pack_review_checklist.md"), buildChecklistMarkdown());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildActionPackRouter(brandId), null, 2)}\n`);
}

module.exports = {
  buildActionPackRouter,
};
