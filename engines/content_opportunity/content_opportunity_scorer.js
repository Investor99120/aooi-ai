const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_JSON_INPUTS = [
  "outputs/{brand}/content_gap/content_gap_diagnosis_report.json",
  "outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json",
  "outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json",
  "outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json",
];

const REQUIRED_TEXT_INPUTS = [
  "outputs/{brand}/content_gap/content_gap_diagnosis_summary.md",
  "outputs/{brand}/content_gap/content_gap_review_checklist.md",
  "brands/{brand}/brand_profile.yml",
  "brands/{brand}/product_facts.yml",
  "brands/{brand}/semantic_map.yml",
  "brands/{brand}/claim_whitelist.md",
  "brands/{brand}/claim_blacklist.md",
  "brands/{brand}/prompt_universe.yml",
  "brands/{brand}/prompt_clusters.yml",
  "docs/AI_VISIBILITY_METRICS_DRAFT.md",
  "docs/PROMPT_UNIVERSE_POLICY.md",
  "docs/PUBLISHING_SAFETY_POLICY.md",
];

const DIMENSIONS = [
  "geo_relevance",
  "brand_visibility_gap_fit",
  "commercial_intent_fit",
  "claim_safety_score",
  "source_readiness",
  "production_effort_score",
  "shopify_impact",
  "email_value",
  "social_video_value",
  "manual_review_burden",
];

const WEIGHTS = {
  geo_relevance: 15,
  brand_visibility_gap_fit: 15,
  commercial_intent_fit: 15,
  claim_safety_score: 15,
  source_readiness: 10,
  production_effort_score: 10,
  shopify_impact: 10,
  email_value: 5,
  social_video_value: 5,
  manual_review_burden: 10,
};

const ASSET_SCORING_RULES = {
  "FAQ cluster": {
    dimension_scores: {
      geo_relevance: 5,
      brand_visibility_gap_fit: 5,
      commercial_intent_fit: 3,
      claim_safety_score: 5,
      source_readiness: 4,
      production_effort_score: 5,
      shopify_impact: 4,
      email_value: 3,
      social_video_value: 3,
      manual_review_burden: 5,
    },
    rationale: "Best first low-risk asset because it directly answers the observed routine prompt, can stay claim-safe, and can support both FAQ and Shopify review surfaces.",
    allowed_future_adapters: ["future_faq_adapter", "future_shopify_adapter"],
    not_allowed_now: [
      "generate FAQ copy",
      "publish FAQ content",
      "create customer-facing claims",
    ],
  },
  "Educational guide": {
    dimension_scores: {
      geo_relevance: 5,
      brand_visibility_gap_fit: 5,
      commercial_intent_fit: 3,
      claim_safety_score: 3,
      source_readiness: 3,
      production_effort_score: 3,
      shopify_impact: 3,
      email_value: 2,
      social_video_value: 3,
      manual_review_burden: 3,
    },
    rationale: "Strong GEO foundation candidate, but it needs source review and claim validation before any future article or guide can be drafted.",
    allowed_future_adapters: ["future_educational_guide_adapter", "future_citation_source_adapter"],
    not_allowed_now: [
      "generate full article",
      "publish guide",
      "create customer-facing claims",
    ],
  },
  "Shopify product-page routine section": {
    dimension_scores: {
      geo_relevance: 4,
      brand_visibility_gap_fit: 4,
      commercial_intent_fit: 5,
      claim_safety_score: 3,
      source_readiness: 3,
      production_effort_score: 4,
      shopify_impact: 5,
      email_value: 2,
      social_video_value: 2,
      manual_review_burden: 3,
    },
    rationale: "High Shopify and commercial relevance, but it must wait for manual review and a future Shopify adapter before any copy is produced.",
    allowed_future_adapters: ["future_shopify_adapter"],
    not_allowed_now: [
      "generate Shopify copy",
      "connect Shopify API",
      "modify live theme",
      "publish product page content",
    ],
  },
  "Email education flow": {
    dimension_scores: {
      geo_relevance: 4,
      brand_visibility_gap_fit: 4,
      commercial_intent_fit: 4,
      claim_safety_score: 4,
      source_readiness: 3,
      production_effort_score: 4,
      shopify_impact: 2,
      email_value: 5,
      social_video_value: 3,
      manual_review_burden: 4,
    },
    rationale: "Good lifecycle education candidate, but this phase only scores the opportunity and does not generate email body copy.",
    allowed_future_adapters: ["future_email_adapter"],
    not_allowed_now: [
      "generate email body",
      "connect email platform",
      "send email",
    ],
  },
  "Social video brief": {
    dimension_scores: {
      geo_relevance: 4,
      brand_visibility_gap_fit: 4,
      commercial_intent_fit: 3,
      claim_safety_score: 4,
      source_readiness: 3,
      production_effort_score: 4,
      shopify_impact: 1,
      email_value: 2,
      social_video_value: 5,
      manual_review_burden: 4,
    },
    rationale: "High future social-video value, but GEO only marks it as a candidate; script, storyboard, prompts and video production belong to a separate future Video Factory flow.",
    allowed_future_adapters: ["future_social_video_adapter", "future_video_factory_adapter"],
    not_allowed_now: [
      "generate social video script",
      "generate storyboard",
      "generate video prompt",
      "call video factory",
      "call video API",
      "publish social content",
    ],
  },
  "Citation-ready source page": {
    dimension_scores: {
      geo_relevance: 5,
      brand_visibility_gap_fit: 5,
      commercial_intent_fit: 3,
      claim_safety_score: 2,
      source_readiness: 2,
      production_effort_score: 2,
      shopify_impact: 3,
      email_value: 2,
      social_video_value: 2,
      manual_review_burden: 2,
    },
    rationale: "Long-term GEO value is high, but source readiness, production effort and claim review burden make it a later-stage candidate.",
    allowed_future_adapters: ["future_citation_source_adapter", "future_educational_guide_adapter"],
    not_allowed_now: [
      "generate full article",
      "publish source page",
      "treat AI answer as verified source",
      "create customer-facing claims",
    ],
  },
  "Claim-safe terminology page": {
    dimension_scores: {
      geo_relevance: 5,
      brand_visibility_gap_fit: 5,
      commercial_intent_fit: 4,
      claim_safety_score: 5,
      source_readiness: 4,
      production_effort_score: 4,
      shopify_impact: 4,
      email_value: 2,
      social_video_value: 2,
      manual_review_burden: 5,
    },
    rationale: "Strong safety foundation candidate that can reduce downstream claim risk across FAQ, guide, Shopify, email and social review workflows.",
    allowed_future_adapters: ["future_claim_safety_adapter", "future_educational_guide_adapter"],
    not_allowed_now: [
      "generate terminology page copy",
      "publish claim guidance",
      "turn AI wording into approved claims",
    ],
  },
  "Product routine support block": {
    dimension_scores: {
      geo_relevance: 4,
      brand_visibility_gap_fit: 4,
      commercial_intent_fit: 5,
      claim_safety_score: 3,
      source_readiness: 3,
      production_effort_score: 4,
      shopify_impact: 5,
      email_value: 3,
      social_video_value: 2,
      manual_review_burden: 3,
    },
    rationale: "Useful bridge from routine intent to product understanding, but it remains a future Shopify support candidate and cannot become product copy in this phase.",
    allowed_future_adapters: ["future_shopify_adapter", "future_faq_adapter"],
    not_allowed_now: [
      "generate product-page copy",
      "connect Shopify API",
      "modify live theme",
      "publish product routine block",
    ],
  },
};

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveTemplate(template, brandId) {
  return template.replace("{brand}", brandId);
}

function outputDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "content_opportunity");
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

function totalWeight() {
  return Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);
}

function weightedTotalScore(dimensionScores) {
  const raw = DIMENSIONS.reduce((sum, dimension) => {
    return sum + ((dimensionScores[dimension] || 0) * WEIGHTS[dimension]);
  }, 0);
  return Math.round((raw / (totalWeight() * 5)) * 100);
}

function priorityTier(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function scoreConfidence(missingInputs) {
  if (missingInputs.length === 0) return "high";
  if (missingInputs.length <= 2) return "medium";
  return "low";
}

function scoreAsset(candidate, missingInputs) {
  const rule = ASSET_SCORING_RULES[candidate.asset_type] || {
    dimension_scores: Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 3])),
    rationale: "Candidate requires manual scoring review.",
    allowed_future_adapters: [],
    not_allowed_now: ["generate customer-facing content"],
  };
  const weightedScore = weightedTotalScore(rule.dimension_scores);

  return {
    asset_type: candidate.asset_type,
    weighted_total_score: weightedScore,
    priority_tier: priorityTier(weightedScore),
    dimension_scores: rule.dimension_scores,
    scoring_confidence: scoreConfidence(missingInputs),
    rationale: rule.rationale,
    recommended_next_stage: "future_action_pack_router",
    allowed_future_adapters: rule.allowed_future_adapters,
    not_allowed_now: rule.not_allowed_now,
    manual_review_required: true,
    customer_facing_content_generated: false,
  };
}

function buildPriorityRecommendation(scores) {
  const sorted = [...scores].sort((a, b) => b.weighted_total_score - a.weighted_total_score);
  return {
    top_candidates: sorted.filter((score) => score.priority_tier === "high").map((score) => score.asset_type),
    recommended_first_batch: [
      "FAQ cluster",
      "Claim-safe terminology page",
      "Product routine support block",
    ].filter((assetType) => scores.some((score) => score.asset_type === assetType)),
    defer_candidates: [
      "Citation-ready source page",
      "Social video brief",
      "Educational guide",
    ].filter((assetType) => scores.some((score) => score.asset_type === assetType)),
    requires_more_review: scores
      .filter((score) => ["Citation-ready source page", "Shopify product-page routine section", "Social video brief", "Educational guide"].includes(score.asset_type))
      .map((score) => score.asset_type),
  };
}

function buildSummaryMarkdown(report) {
  const scoreLines = report.opportunity_scores
    .map((score, index) => `${index + 1}. ${score.asset_type}: ${score.weighted_total_score} (${score.priority_tier})`)
    .join("\n");
  const adapterLines = report.opportunity_scores
    .map((score) => `- ${score.asset_type}: ${score.allowed_future_adapters.join(", ")}`)
    .join("\n");

  return `# Content Opportunity Score Summary

This is a review-only opportunity scoring report.

It is based on Phase 8H Content Gap Diagnosis.

It scores asset candidates only.

It does not generate SEO content.

It does not generate customer-facing copy.

It does not generate final visibility scores.

It does not publish.

中文说明：
这是基于 Phase 8H 内容缺口诊断生成的内容机会评分报告，只用于 owner review。它只给候选资产排序，不生成最终 SEO 内容、不生成用户可见文案、不生成最终 visibility score，也不会发布。

Prompt ID: ${report.scoring_scope.prompt_ids_scored.join(", ")}

Asset candidates scored: ${report.scoring_scope.asset_candidates_scored}

Opportunity scores:

${scoreLines}

Top recommended first batch: ${report.priority_recommendation.recommended_first_batch.join(", ")}

Deferred candidates: ${report.priority_recommendation.defer_candidates.join(", ")}

Future adapter hints:

${adapterLines}

Manual review notes: scores are internal prioritisation signals only. Owner review is required before any Phase 8J Action Pack Router work.

中文说明：
以上分数只用于内部排序，不是 visibility score，不是市场数据，也不是发布许可。本阶段不生成正文内容。
`;
}

function buildChecklistMarkdown() {
  return `# Content Opportunity Review Checklist

This checklist is for Phase 8I review-only content opportunity scoring.

中文说明：
此清单用于 Phase 8I review-only 内容机会评分。

- [ ] Confirm score is based on Phase 8H diagnosis
- [ ] Confirm only asset candidates were scored
- [ ] Confirm no SEO content was generated
- [ ] Confirm no customer-facing copy was generated
- [ ] Confirm no final visibility score was generated
- [ ] Confirm score is review-only
- [ ] Confirm AI answer was not treated as verified fact
- [ ] Confirm claim risk constraints were considered
- [ ] Confirm social video brief did not generate script/storyboard/prompt
- [ ] Confirm Shopify candidate did not generate Shopify copy
- [ ] Confirm email candidate did not generate email body
- [ ] Confirm no Shopify API was used
- [ ] Confirm no auto-publishing happened
- [ ] Confirm manual_review_required remains true
- [ ] Confirm publish_ready remains false
- [ ] Confirm owner review is required before Phase 8J

中文说明：
请确认本阶段只输出评分和未来 adapter hints，不生成 SEO 内容、Shopify 文案、Email 正文、社媒视频脚本、分镜或 video prompt。
`;
}

function buildContentOpportunityScore(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const inputs = loadInputs(brandId);
  const contentGapReport = inputs.jsonInputs["outputs/{brand}/content_gap/content_gap_diagnosis_report.json"] || {};
  const visibilityReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json"] || {};
  const importGateReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json"] || {};
  const manualAuditReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json"] || {};
  const assetCandidates = contentGapReport.recommended_asset_candidates || [];
  const opportunityScores = assetCandidates
    .map((candidate) => scoreAsset(candidate, inputs.missingInputs))
    .sort((a, b) => b.weighted_total_score - a.weighted_total_score);

  const report = {
    brand_id: brandId,
    phase: "8I",
    report_type: "content_opportunity_score",
    decision: "needs_review",
    source_files: {
      ...Object.fromEntries(Object.entries(inputs.jsonInputs).filter(([, value]) => value && value.path)),
      ...Object.fromEntries(Object.entries(inputs.textInputs).filter(([, value]) => value && value.path)),
    },
    missing_inputs: inputs.missingInputs,
    parse_errors: inputs.parseErrors,
    upstream_decisions: {
      content_gap_diagnosis: contentGapReport.decision || "unknown",
      manual_visibility_observation: visibilityReport.decision || "unknown",
      manual_snapshot_import_gate: importGateReport.decision || "unknown",
      manual_ai_answer_audit: manualAuditReport.decision || "unknown",
    },
    scoring_scope: {
      scoring_only: true,
      source_phase: "8H",
      prompt_ids_scored: (contentGapReport.diagnosis_scope && contentGapReport.diagnosis_scope.prompt_ids_diagnosed) || [],
      asset_candidates_scored: opportunityScores.length,
      statistically_representative: false,
      population_level_claim: false,
      visibility_score_generated: false,
    },
    scoring_method: {
      score_range: "0-100",
      dimensions: DIMENSIONS,
      weights_used: WEIGHTS,
      weight_total: totalWeight(),
      formula: "weighted dimension score normalised from 0-5 inputs to a 0-100 internal review score",
      review_only: true,
    },
    opportunity_scores: opportunityScores,
    priority_recommendation: buildPriorityRecommendation(opportunityScores),
    boundary_status: {
      scoring_only: true,
      content_generated: false,
      customer_facing_copy_generated: false,
      content_opportunity_score_generated: true,
      final_visibility_score_generated: false,
      seo_content_generated: false,
      shopify_copy_generated: false,
      email_body_generated: false,
      social_video_script_generated: false,
      video_storyboard_generated: false,
      video_prompt_generated: false,
      video_factory_called: false,
      shopify_api_used: false,
      auto_publish_used: false,
      ai_answers_treated_as_verified_fact: false,
      action_pack_generated: false,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "Content opportunity scores are internal review-only prioritisation signals and are not visibility scores, market data or production approvals.",
    ],
  };

  const dir = outputDir(brandId);
  writeJson(path.join(dir, "content_opportunity_score_report.json"), report);
  writeText(path.join(dir, "content_opportunity_score_summary.md"), buildSummaryMarkdown(report));
  writeText(path.join(dir, "content_opportunity_review_checklist.md"), buildChecklistMarkdown());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildContentOpportunityScore(brandId), null, 2)}\n`);
}

module.exports = {
  buildContentOpportunityScore,
  weightedTotalScore,
};
