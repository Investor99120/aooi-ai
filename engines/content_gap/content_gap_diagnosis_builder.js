const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_JSON_INPUTS = [
  "outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json",
  "outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json",
  "outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json",
];

const REQUIRED_TEXT_INPUTS = [
  "outputs/{brand}/ai_answer_audit/manual_visibility_observation_summary.md",
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

const OPTIONAL_TEXT_INPUTS = [
  "docs/SOURCE_STATUS_POLICY.md",
];

const GAP_TYPES = [
  "brand_owned_educational_asset_gap",
  "routine_based_content_gap",
  "safe_claim_framing_gap",
  "citation_ready_source_gap",
  "product_page_support_gap",
  "faq_cluster_gap",
  "email_education_gap",
  "social_video_brief_gap",
];

const CLAIM_SAFETY_TERMS = [
  "photobiomodulation",
  "collagen production",
  "cellular turnover",
  "reducing inflammation",
  "accelerating physical recovery",
  "joint inflammation",
  "melatonin production",
  "biological benefits are cumulative",
  "muscle recovery",
  "soreness",
  "joint comfort",
  "reduced redness",
  "hair and scalp support",
  "sleep",
  "light-sensitive medications",
  "pregnancy",
];

const SAFE_DIRECTION_NOTES = [
  "Use routine-based language.",
  "Use wellness framing.",
  "Avoid treatment language.",
  "Avoid guaranteed results.",
  "Keep results variable.",
  "Require source review before scientific claims.",
];

const ASSET_CANDIDATES = [
  {
    asset_type: "FAQ cluster",
    purpose: "Answer routine-based home wellness questions in brand-owned language.",
    source_observation: "Observed surfaces answered the routine prompt without mentioning or recommending the brand.",
    claim_risk_level: "medium",
  },
  {
    asset_type: "Educational guide",
    purpose: "Create a brand-owned guide around red and near-infrared light in home wellness routines.",
    source_observation: "Observed surfaces produced stable category framing but no brand-owned source was cited.",
    claim_risk_level: "medium",
  },
  {
    asset_type: "Shopify product-page routine section",
    purpose: "Add a safe routine-based explanation on relevant product pages after review.",
    source_observation: "The prompt maps to product-page support needs, but no customer-facing copy is generated in this phase.",
    claim_risk_level: "medium",
  },
  {
    asset_type: "Email education flow",
    purpose: "Educate subscribers about routine-building without making unverified claims.",
    source_observation: "The observed category framing suggests an education sequence candidate, not final email copy.",
    claim_risk_level: "medium",
  },
  {
    asset_type: "Social video brief",
    purpose: "Turn the prompt into a short educational video angle after claim review.",
    source_observation: "The observed framing can inform a future brief, but no video script is generated.",
    claim_risk_level: "medium",
  },
  {
    asset_type: "Citation-ready source page",
    purpose: "Prepare a source-reviewed page that can explain routine use without overclaiming.",
    source_observation: "Observed answers contained no citations and no source URLs.",
    claim_risk_level: "high",
  },
  {
    asset_type: "Claim-safe terminology page",
    purpose: "Define safer terminology around red and near-infrared light for future review workflows.",
    source_observation: "Gemini and Perplexity included terms that require claim review before reuse.",
    claim_risk_level: "high",
  },
  {
    asset_type: "Product routine support block",
    purpose: "Support future product pages with owner-reviewed routine context.",
    source_observation: "Product support should stay candidate-only until product facts and claims are reviewed.",
    claim_risk_level: "medium",
  },
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveTemplate(template, brandId) {
  return template.replace("{brand}", brandId);
}

function outputDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "content_gap");
}

function snapshotDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "ai_answer_audit", "manual_snapshots");
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

function listSnapshotFiles(brandId) {
  const dir = snapshotDir(brandId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".snapshot.json"))
    .sort()
    .map((file) => path.join(dir, file));
}

function readSnapshots(brandId) {
  return listSnapshotFiles(brandId).map((filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      return {
        audit_id: "",
        parse_error: error.message,
        file_path: filePath,
      };
    }
  });
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
}

function withCandidateBoundaries(candidate) {
  return {
    ...candidate,
    source_review_required: true,
    manual_review_required: true,
    customer_facing_content_generated: false,
  };
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

  for (const template of OPTIONAL_TEXT_INPUTS) {
    const relativePath = resolveTemplate(template, brandId);
    const result = readTextIfExists(relativePath);
    textInputs[relativePath] = {
      exists: result.exists,
      path: relativePath,
      optional: true,
    };
  }

  return {
    jsonInputs,
    textInputs,
    missingInputs,
    parseErrors,
    snapshots: readSnapshots(brandId),
  };
}

function buildPromptGapDiagnoses(visibilityReport) {
  const promptObservations = visibilityReport.prompt_observations || [];
  return promptObservations.map((observation) => ({
    prompt_id: observation.prompt_id,
    prompt_text: observation.prompt_text,
    observation_classification: observation.observation_classification,
    brand_mentioned: (observation.brand_mentioned_on_surfaces || []).length > 0,
    brand_recommended: (observation.brand_recommended_on_surfaces || []).length > 0,
    competitors_mentioned: observation.competitors_mentioned || [],
    citations_present: observation.citations_present === true,
    gap_detected: observation.observation_classification === "content_opportunity_sample",
    gap_type: "brand_owned_educational_asset_gap",
    diagnosis: "Observed AI surfaces answered the category routine prompt without mentioning or recommending the brand, which indicates a review-only need for brand-owned, claim-safe and citation-ready educational assets.",
    recommended_asset_candidates: ASSET_CANDIDATES.map((candidate) => candidate.asset_type),
    claim_risk_constraints: CLAIM_SAFETY_TERMS,
    manual_review_required: true,
  }));
}

function buildSurfaceGapInsights(visibilityReport) {
  return (visibilityReport.surface_framing_summary || []).map((item) => {
    const surface = item.ai_surface;
    if (surface === "chatgpt") {
      return {
        ai_surface: surface,
        insight: "Provides conservative home wellness framing suitable for safer educational direction.",
        risk_level: item.claim_risk_level || "medium-low",
      };
    }
    if (surface === "gemini") {
      return {
        ai_surface: surface,
        insight: "Provides scientific and physiological framing but includes higher-risk claim language.",
        risk_level: item.claim_risk_level || "high",
      };
    }
    if (surface === "perplexity") {
      return {
        ai_surface: surface,
        insight: "Provides practical setup, safety and expectation-management framing.",
        risk_level: item.claim_risk_level || "medium-high",
      };
    }
    return {
      ai_surface: surface,
      insight: "Requires manual interpretation before future asset planning.",
      risk_level: item.claim_risk_level || "medium",
    };
  });
}

function buildSummaryMarkdown(report) {
  const assetList = report.recommended_asset_candidates
    .map((candidate) => `- ${candidate.asset_type}: ${candidate.purpose}`)
    .join("\n");
  const constraints = report.claim_safety_constraints.must_not_use_as_claims
    .map((term) => `- ${term}`)
    .join("\n");

  return `# Content Gap Diagnosis Summary

This is a review-only diagnosis.

It is based on Phase 8G observation.

It does not generate final SEO content.

It does not generate customer-facing copy.

It does not generate content opportunity scores.

It does not prove population-level AI visibility.

中文说明：
这是基于 Phase 8G 观察结果的内容缺口诊断，只用于 owner review，不生成最终 SEO 内容，不生成用户可见文案，不生成内容机会评分，也不证明总体 AI visibility。

Diagnosed prompt: ${report.diagnosis_scope.prompt_ids_diagnosed.join(", ")}

Observation: brand not mentioned / recommended

Classification: ${report.prompt_gap_diagnoses[0] ? report.prompt_gap_diagnoses[0].observation_classification : ""}

Primary gap: ${report.content_gap_summary.primary_gap_type}

Recommended asset candidates:

${assetList}

Claim risk constraints:

${constraints}

Recommended next step: Phase 8I Content Opportunity Scorer only after owner review.

中文说明：
下一步只有在 owner review 后，才建议进入 Phase 8I Content Opportunity Scorer。本阶段不生成正文内容。
`;
}

function buildChecklistMarkdown() {
  return `# Content Gap Review Checklist

This checklist is for Phase 8H review-only content gap diagnosis.

中文说明：
此清单用于 Phase 8H review-only 内容缺口诊断。

- [ ] Confirm diagnosis is based on Phase 8G observation
- [ ] Confirm no SEO content was generated
- [ ] Confirm no customer-facing copy was generated
- [ ] Confirm no content opportunity score was generated
- [ ] Confirm no final visibility score was generated
- [ ] Confirm no AI answer was treated as verified fact
- [ ] Confirm recommended assets are only candidates
- [ ] Confirm claim risk constraints were carried forward
- [ ] Confirm Gemini high-risk terms were not converted into claims
- [ ] Confirm Perplexity safety-related language was not reused as advice
- [ ] Confirm manual_review_required remains true
- [ ] Confirm publish_ready remains false
- [ ] Confirm no Shopify API was used
- [ ] Confirm no auto-publishing happened
- [ ] Confirm owner review is required before Phase 8I

中文说明：
请确认本阶段只输出诊断和候选资产，不输出 SEO 正文、用户可见文案、Shopify 文案、邮件正文或社媒视频脚本。
`;
}

function buildContentGapDiagnosis(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const inputs = loadInputs(brandId);
  const visibilityReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_visibility_observation_report.json"] || {};
  const importGateReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json"] || {};
  const manualAuditReport = inputs.jsonInputs["outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json"] || {};
  const observationScope = visibilityReport.observation_scope || {};
  const visibilityObservation = visibilityReport.visibility_observation || {};
  const promptGapDiagnoses = buildPromptGapDiagnoses(visibilityReport);

  const report = {
    brand_id: brandId,
    phase: "8H",
    report_type: "content_gap_diagnosis",
    decision: "needs_review",
    source_files: {
      ...Object.fromEntries(Object.entries(inputs.jsonInputs).filter(([, value]) => value && value.path)),
      ...Object.fromEntries(Object.entries(inputs.textInputs).filter(([, value]) => value && value.path)),
      "outputs/{brand}/ai_answer_audit/manual_snapshots/*.snapshot.json": {
        exists: inputs.snapshots.length > 0,
        snapshots_loaded: inputs.snapshots.length,
      },
    },
    missing_inputs: inputs.missingInputs,
    parse_errors: inputs.parseErrors,
    upstream_decisions: {
      manual_visibility_observation: visibilityReport.decision || "unknown",
      manual_snapshot_import_gate: importGateReport.decision || "unknown",
      manual_ai_answer_audit: manualAuditReport.decision || "unknown",
    },
    diagnosis_scope: {
      diagnosis_only: true,
      source_observation_phase: "8G",
      snapshots_observed: observationScope.snapshots_observed || inputs.snapshots.length,
      prompt_ids_diagnosed: observationScope.prompt_ids_observed || [],
      ai_surfaces_observed: observationScope.ai_surfaces_observed || [],
      statistically_representative: false,
      population_level_claim: false,
    },
    content_gap_summary: {
      content_gap_detected: true,
      primary_gap_type: "brand_owned_educational_asset_gap",
      secondary_gap_types: GAP_TYPES.filter((gapType) => gapType !== "brand_owned_educational_asset_gap"),
      reason: "Observed AI surfaces produced stable category framing, but the brand was not mentioned or recommended.",
    },
    prompt_gap_diagnoses: promptGapDiagnoses,
    recommended_asset_candidates: ASSET_CANDIDATES.map(withCandidateBoundaries),
    surface_gap_insights: buildSurfaceGapInsights(visibilityReport),
    claim_safety_constraints: {
      must_not_use_as_claims: CLAIM_SAFETY_TERMS,
      safe_direction_notes: SAFE_DIRECTION_NOTES,
      source_review_required: true,
      claim_validator_required: true,
    },
    observation_counts: {
      brand_mentions: visibilityObservation.brand_mentions || 0,
      brand_recommendations: visibilityObservation.brand_recommendations || 0,
      competitor_mentions: visibilityObservation.competitor_mentions || 0,
      citations_present: visibilityObservation.citations_present || 0,
      source_urls_present: visibilityObservation.source_urls_present || 0,
    },
    risk_sources: {
      snapshots_with_claim_risk_notes: visibilityReport.risk_observation ? visibilityReport.risk_observation.snapshots_with_claim_risk_notes : 0,
      total_claim_risk_notes: visibilityReport.risk_observation ? visibilityReport.risk_observation.total_claim_risk_notes : 0,
      high_risk_surfaces: visibilityReport.risk_observation ? visibilityReport.risk_observation.high_risk_surfaces : [],
      medium_risk_surfaces: visibilityReport.risk_observation ? visibilityReport.risk_observation.medium_risk_surfaces : [],
      risk_notes_carried_forward: visibilityReport.risk_observation ? visibilityReport.risk_observation.risk_notes_summary : [],
    },
    boundary_status: {
      content_generated: false,
      content_opportunity_score_generated: false,
      final_visibility_score_generated: false,
      seo_content_generated: false,
      blog_body_generated: false,
      shopify_content_generated: false,
      email_copy_generated: false,
      social_video_script_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
      customer_facing_claims_generated: false,
      ai_answers_treated_as_verified_fact: false,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "Content Gap Diagnosis is review-only and must not be treated as final SEO content, customer-facing copy, content opportunity score or visibility score.",
    ],
  };

  const dir = outputDir(brandId);
  writeJson(path.join(dir, "content_gap_diagnosis_report.json"), report);
  writeText(path.join(dir, "content_gap_diagnosis_summary.md"), buildSummaryMarkdown(report));
  writeText(path.join(dir, "content_gap_review_checklist.md"), buildChecklistMarkdown());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildContentGapDiagnosis(brandId), null, 2)}\n`);
}

module.exports = {
  buildContentGapDiagnosis,
};
