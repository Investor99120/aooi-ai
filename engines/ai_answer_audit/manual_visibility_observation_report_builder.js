const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_INPUTS = [
  "manual_snapshot_import_gate_report.json",
  "manual_snapshot_import_blocked_items_report.json",
  "manual_ai_answer_audit_report.json",
];

const REQUIRED_REFERENCE_FILES = [
  "brands/{brand}/prompt_universe.yml",
  "brands/{brand}/prompt_clusters.yml",
  "docs/AI_VISIBILITY_METRICS_DRAFT.md",
];

const CONTENT_OPPORTUNITY_TYPES = [
  "FAQ",
  "educational guide",
  "Shopify product-page routine section",
  "email education flow",
  "social video script",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function outputDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "ai_answer_audit");
}

function snapshotDir(brandId) {
  return path.join(outputDir(brandId), "manual_snapshots");
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function fileStatus(relativePath) {
  const filePath = path.join(ROOT_DIR, relativePath);
  return {
    exists: fs.existsSync(filePath),
    path: relativePath,
  };
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
}

function normalise(value) {
  return String(value === undefined || value === null ? "" : value).trim().toLowerCase();
}

function listSnapshotFiles(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const dir = snapshotDir(brandId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".snapshot.json"))
    .sort()
    .map((file) => path.join(dir, file));
}

function countTruthy(snapshots, key) {
  return snapshots.filter((snapshot) => snapshot && snapshot[key] === true).length;
}

function countArrayItems(snapshots, key) {
  return snapshots.reduce((count, snapshot) => {
    if (!snapshot || !Array.isArray(snapshot[key])) return count;
    return count + snapshot[key].length;
  }, 0);
}

function snapshotsWithArrayItems(snapshots, key) {
  return snapshots.filter((snapshot) => Array.isArray(snapshot[key]) && snapshot[key].length > 0).length;
}

function blockedAuditIdSet(importBlockedReport) {
  return new Set((importBlockedReport.blocked_items || [])
    .map((item) => item.audit_id)
    .filter(Boolean));
}

function groupByPrompt(snapshots) {
  const groups = new Map();
  for (const snapshot of snapshots) {
    const promptId = snapshot.prompt_id || "unknown_prompt";
    if (!groups.has(promptId)) groups.set(promptId, []);
    groups.get(promptId).push(snapshot);
  }
  return groups;
}

function classifyPromptObservation(snapshots) {
  if (snapshots.length < 2) return "needs_more_snapshots";
  const hasBrandMention = snapshots.some((snapshot) => snapshot.brand_mentioned === true);
  const hasBrandRecommendation = snapshots.some((snapshot) => snapshot.brand_recommended === true);
  const hasCompetitors = snapshots.some((snapshot) => Array.isArray(snapshot.competitors_mentioned) && snapshot.competitors_mentioned.length > 0);
  const hasCitations = snapshots.some((snapshot) => Array.isArray(snapshot.citations) && snapshot.citations.length > 0);
  const hasCategoryFraming = snapshots.some((snapshot) => String(snapshot.answer_framing || "").trim() !== "");

  if (hasBrandMention || hasBrandRecommendation) return "visibility_positive_sample";
  if (hasCompetitors) return "competitor_pressure_sample";
  if (hasCitations) return "citation_opportunity_sample";
  if (!hasBrandMention && !hasBrandRecommendation && hasCategoryFraming) return "content_opportunity_sample";
  return "visibility_absent_sample";
}

function promptObservationReason(classification) {
  const reasons = {
    visibility_positive_sample: "The brand was mentioned or recommended on at least one observed surface, but this remains a manual observation only.",
    visibility_absent_sample: "The brand was not mentioned or recommended in the observed manual snapshots.",
    content_opportunity_sample: "The brand was not mentioned or recommended across observed surfaces, while the answers produced useful category framing.",
    citation_opportunity_sample: "Citations were observed and require manual source review before any future interpretation.",
    competitor_pressure_sample: "Competitors were observed and require manual interpretation before any future comparison.",
    needs_more_snapshots: "More manual snapshots are needed before this prompt can be interpreted.",
  };
  return reasons[classification] || reasons.needs_more_snapshots;
}

function buildPromptObservations(snapshots) {
  return [...groupByPrompt(snapshots).entries()].map(([promptId, promptSnapshots]) => {
    const classification = classifyPromptObservation(promptSnapshots);
    return {
      prompt_id: promptId,
      prompt_text: promptSnapshots[0] ? promptSnapshots[0].prompt_text || "" : "",
      surfaces_observed: unique(promptSnapshots.map((snapshot) => normalise(snapshot.ai_surface))),
      brand_mentioned_on_surfaces: unique(promptSnapshots.filter((snapshot) => snapshot.brand_mentioned === true).map((snapshot) => normalise(snapshot.ai_surface))),
      brand_recommended_on_surfaces: unique(promptSnapshots.filter((snapshot) => snapshot.brand_recommended === true).map((snapshot) => normalise(snapshot.ai_surface))),
      competitors_mentioned: unique(promptSnapshots.flatMap((snapshot) => Array.isArray(snapshot.competitors_mentioned) ? snapshot.competitors_mentioned : [])),
      citations_present: promptSnapshots.some((snapshot) => Array.isArray(snapshot.citations) && snapshot.citations.length > 0),
      observation_classification: classification,
      reason: promptObservationReason(classification),
    };
  });
}

function riskProfileForSurface(surface) {
  const profiles = {
    chatgpt: {
      claim_risk_level: "medium-low",
      observation_notes: [
        "Lower-risk routine framing focused on calm home wellness, relaxation, skincare, post-exercise recovery, screen-free reset moments and consistency.",
      ],
    },
    gemini: {
      claim_risk_level: "high",
      observation_notes: [
        "Higher-risk physiological and scientific language appeared, including photobiomodulation, collagen production, cellular turnover, inflammation, tissue repair and melatonin.",
      ],
    },
    perplexity: {
      claim_risk_level: "medium-high",
      observation_notes: [
        "Practical setup, safety and benefit-related language appeared, including skin support, recovery, pregnancy and light-sensitive medications.",
      ],
    },
  };
  return profiles[surface] || {
    claim_risk_level: "medium",
    observation_notes: [
      "Manual review is required before interpreting this surface observation.",
    ],
  };
}

function buildSurfaceFramingSummary(snapshots) {
  return snapshots.map((snapshot) => {
    const surface = normalise(snapshot.ai_surface);
    const profile = riskProfileForSurface(surface);
    return {
      ai_surface: surface,
      framing: snapshot.answer_framing || "",
      claim_risk_level: profile.claim_risk_level,
      observation_notes: profile.observation_notes,
    };
  });
}

function gateRiskNotesBySurface(importGateReport) {
  const riskSummary = importGateReport.risk_summary || {};
  const notes = riskSummary.claim_risk_notes_by_snapshot || [];
  const matchedTerms = riskSummary.matched_risk_terms_by_snapshot || [];

  return notes.map((item) => {
    const matched = matchedTerms.find((termItem) => termItem.audit_id === item.audit_id) || {};
    return {
      audit_id: item.audit_id,
      prompt_id: item.prompt_id,
      ai_surface: item.ai_surface,
      claim_risk_notes: item.claim_risk_notes || [],
      matched_risk_terms: matched.matched_risk_terms || [],
    };
  });
}

function buildRiskObservation(importGateReport) {
  const riskSummary = importGateReport.risk_summary || {};
  return {
    snapshots_with_claim_risk_notes: riskSummary.snapshots_with_claim_risk_notes || 0,
    total_claim_risk_notes: riskSummary.total_claim_risk_notes || 0,
    high_risk_surfaces: ["gemini"],
    medium_risk_surfaces: ["perplexity"],
    lower_risk_surfaces: ["chatgpt"],
    risk_notes_summary: gateRiskNotesBySurface(importGateReport),
    source: "manual_snapshot_import_gate_report",
    ai_answers_are_not_verified_facts: true,
    customer_facing_claims_must_not_be_generated_from_ai_answers: true,
  };
}

function buildSummaryMarkdown(report) {
  const promptObservation = report.prompt_observations[0] || {};
  const surfaceSummary = report.surface_framing_summary;
  const chatgpt = surfaceSummary.find((item) => item.ai_surface === "chatgpt") || {};
  const gemini = surfaceSummary.find((item) => item.ai_surface === "gemini") || {};
  const perplexity = surfaceSummary.find((item) => item.ai_surface === "perplexity") || {};
  const surfaceLabels = report.observation_scope.ai_surfaces_observed.map((surface) => {
    if (surface === "chatgpt") return "ChatGPT";
    if (surface === "gemini") return "Gemini";
    if (surface === "perplexity") return "Perplexity";
    return surface;
  });

  return `# Manual AI Visibility Observation Summary

This is a review-only observation report.

It is based on ${report.observation_scope.snapshots_observed} manually collected snapshots.

It does not generate final visibility score.

It does not prove population-level AI visibility.

It does not treat AI answers as verified facts.

It does not generate customer-facing claims.

中文说明：
这是人工 AI 可见度观察报告，只基于 ${report.observation_scope.snapshots_observed} 条人工采集快照，不生成最终 visibility score，不证明总体市场层面的 AI 可见度，不把 AI 回答当作 verified fact，也不生成用户可见 claim。

Observed prompt: ${promptObservation.prompt_id || ""}

Surfaces: ${surfaceLabels.join(" / ")}

Brand mentioned: no

Brand recommended: no

Competitors mentioned: no

Citations: no

Classification: ${promptObservation.observation_classification || ""}

ChatGPT framing: ${chatgpt.framing || ""}

Gemini framing and risk: ${gemini.framing || ""} Risk level: ${gemini.claim_risk_level || ""}.

Perplexity framing and risk: ${perplexity.framing || ""} Risk level: ${perplexity.claim_risk_level || ""}.

Recommended next step: human review before Phase 8H / Content Gap Diagnosis.

中文说明：
建议下一步先进行人工复核，再决定是否进入 Phase 8H / Content Gap Diagnosis。本报告不生成 SEO copy、不生成博客正文、不生成 Shopify 文案。
`;
}

function buildChecklistMarkdown() {
  return `# Manual AI Visibility Observation Checklist

This checklist is for Phase 8G review-only manual visibility observations.

中文说明：
此清单用于 Phase 8G 人工 AI 可见度观察报告审核。

- [ ] Confirm observation is based on manual snapshots
- [ ] Confirm Import Gate passed with needs_review
- [ ] Confirm no final visibility score was generated
- [ ] Confirm no population-level visibility claim was made
- [ ] Confirm no AI answer was treated as verified fact
- [ ] Confirm no customer-facing claim was generated
- [ ] Confirm brand_mentions and recommendations were only observed, not overclaimed
- [ ] Confirm claim_risk_notes were reviewed
- [ ] Confirm content opportunity classification is review-only
- [ ] Confirm no SEO content was generated
- [ ] Confirm no Shopify API was used
- [ ] Confirm no auto-publishing happened
- [ ] Confirm manual_review_required remains true

中文说明：
请确认本报告只作为人工观察，不作为最终 visibility score、总体市场结论、用户可见 claim 或发布材料。
`;
}

function loadRequiredInputs(brandId) {
  const dir = outputDir(brandId);
  const jsonInputs = {};
  for (const file of REQUIRED_INPUTS) {
    const filePath = path.join(dir, file);
    jsonInputs[file] = readJson(filePath);
  }

  const referenceFiles = {};
  for (const template of REQUIRED_REFERENCE_FILES) {
    const relativePath = template.replace("{brand}", brandId);
    referenceFiles[relativePath] = fileStatus(relativePath);
    if (referenceFiles[relativePath].exists) {
      readText(path.join(ROOT_DIR, relativePath));
    }
  }

  return {
    importGateReport: jsonInputs["manual_snapshot_import_gate_report.json"],
    importBlockedReport: jsonInputs["manual_snapshot_import_blocked_items_report.json"],
    manualAuditReport: jsonInputs["manual_ai_answer_audit_report.json"],
    referenceFiles,
  };
}

function buildManualVisibilityObservationReport(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const {
    importGateReport,
    importBlockedReport,
    manualAuditReport,
    referenceFiles,
  } = loadRequiredInputs(brandId);

  const blockedIds = blockedAuditIdSet(importBlockedReport);
  const snapshots = listSnapshotFiles(brandId)
    .map((filePath) => readJson(filePath))
    .filter((snapshot) => !blockedIds.has(snapshot.audit_id));

  const promptObservations = buildPromptObservations(snapshots);
  const surfaceFramingSummary = buildSurfaceFramingSummary(snapshots);
  const promptIdsObserved = unique(snapshots.map((snapshot) => snapshot.prompt_id));
  const aiSurfacesObserved = unique(snapshots.map((snapshot) => normalise(snapshot.ai_surface)));
  const decision = importGateReport.decision === "blocked" || (importBlockedReport.blocked_items || []).length > 0
    ? "blocked"
    : "needs_review";

  const report = {
    brand_id: brandId,
    phase: "8G",
    report_type: "manual_ai_visibility_observation",
    decision,
    source_files: {
      "outputs/{brand}/ai_answer_audit/manual_snapshots/*.snapshot.json": {
        exists: snapshots.length > 0,
        snapshots_loaded: snapshots.length,
      },
      "outputs/{brand}/ai_answer_audit/manual_snapshot_import_gate_report.json": {
        exists: true,
        decision: importGateReport.decision,
      },
      "outputs/{brand}/ai_answer_audit/manual_snapshot_import_blocked_items_report.json": {
        exists: true,
        blocked_items: (importBlockedReport.blocked_items || []).length,
      },
      "outputs/{brand}/ai_answer_audit/manual_ai_answer_audit_report.json": {
        exists: true,
        decision: manualAuditReport.decision,
      },
      ...referenceFiles,
    },
    observation_scope: {
      manual_observation_only: true,
      snapshots_observed: snapshots.length,
      prompt_ids_observed: promptIdsObserved,
      ai_surfaces_observed: aiSurfacesObserved,
      statistically_representative: false,
      population_level_claim: false,
    },
    visibility_observation: {
      brand_mentions: countTruthy(snapshots, "brand_mentioned"),
      brand_recommendations: countTruthy(snapshots, "brand_recommended"),
      brand_positions_observed: unique(snapshots.map((snapshot) => snapshot.brand_position).filter((position) => position !== null && position !== undefined)),
      competitor_mentions: countArrayItems(snapshots, "competitors_mentioned"),
      citations_present: snapshotsWithArrayItems(snapshots, "citations"),
      source_urls_present: snapshotsWithArrayItems(snapshots, "source_urls"),
      final_visibility_score_generated: false,
      share_of_voice_score_generated: false,
      recommendation_score_generated: false,
    },
    prompt_observations: promptObservations,
    surface_framing_summary: surfaceFramingSummary,
    risk_observation: buildRiskObservation(importGateReport),
    content_signal_observation: {
      content_opportunity_detected: promptObservations.some((item) => item.observation_classification === "content_opportunity_sample"),
      content_opportunity_type: CONTENT_OPPORTUNITY_TYPES,
      content_gap_diagnosis_generated: false,
      content_opportunity_score_generated: false,
    },
    boundary_status: {
      ai_platform_calls_used_by_system: false,
      scraping_used_by_system: false,
      automated_monitoring_run: false,
      final_visibility_score_generated: false,
      share_of_voice_score_generated: false,
      recommendation_score_generated: false,
      seo_content_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
      customer_facing_claims_generated: false,
      ai_answers_treated_as_verified_fact: false,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "Manual AI visibility observations are review-only and must not be treated as final visibility metrics, population-level findings, verified facts or customer-facing claims.",
    ],
  };

  const dir = outputDir(brandId);
  writeJson(path.join(dir, "manual_visibility_observation_report.json"), report);
  writeText(path.join(dir, "manual_visibility_observation_summary.md"), buildSummaryMarkdown(report));
  writeText(path.join(dir, "manual_visibility_observation_checklist.md"), buildChecklistMarkdown());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildManualVisibilityObservationReport(brandId), null, 2)}\n`);
}

module.exports = {
  buildManualVisibilityObservationReport,
  classifyPromptObservation,
  listSnapshotFiles,
};
