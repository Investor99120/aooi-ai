const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_FIELDS = [
  "audit_id",
  "brand_id",
  "prompt_id",
  "prompt_text",
  "ai_surface",
  "test_date",
  "test_location_or_market",
  "answer_snapshot",
  "brand_mentioned",
  "brand_recommended",
  "brand_position",
  "competitors_mentioned",
  "citations",
  "source_urls",
  "answer_framing",
  "claim_risk_notes",
  "brand_understanding_notes",
  "manual_reviewer",
  "review_status",
  "contains_real_ai_answer",
  "ai_platform_calls_used_by_system",
  "scraping_used_by_system",
  "manual_review_required",
];

const BLOCKING_MISSING_FIELDS = [
  "audit_id",
  "prompt_id",
  "prompt_text",
  "ai_surface",
  "answer_snapshot",
];

const REQUIRED_FILLED_STRING_FIELDS = [
  "audit_id",
  "brand_id",
  "prompt_id",
  "prompt_text",
  "ai_surface",
  "test_date",
  "test_location_or_market",
  "answer_snapshot",
  "answer_framing",
  "manual_reviewer",
  "review_status",
];

const ALLOWED_AI_SURFACES = [
  "chatgpt",
  "gemini",
  "perplexity",
  "google_ai_overview",
  "google_ai_mode",
  "claude",
  "copilot",
  "generic_ai_search",
];

const RISK_TERMS = [
  "cure",
  "treat",
  "diagnose",
  "guaranteed results",
  "guaranteed pain relief",
  "insomnia treatment",
  "arthritis treatment",
  "NHS approved",
  "doctor recommended",
  "clinically proven to cure",
  "medical device",
  "inflammation",
  "reducing inflammation",
  "joint inflammation",
  "collagen production",
  "cellular turnover",
  "melatonin",
  "soreness",
  "pregnancy",
  "light-sensitive medications",
  "tissue repair",
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

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function normalise(value) {
  return String(value === undefined || value === null ? "" : value).trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
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

function readJsonFile(filePath) {
  try {
    return {
      ok: true,
      value: JSON.parse(fs.readFileSync(filePath, "utf8")),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: error.message,
    };
  }
}

function termMatches(term, text) {
  const haystack = normalise(text);
  const needle = normalise(term);
  if (!needle) return false;
  return haystack.includes(needle);
}

function scanRiskTerms(snapshot) {
  const text = [
    snapshot.answer_snapshot,
    snapshot.answer_framing,
    ...(Array.isArray(snapshot.claim_risk_notes) ? snapshot.claim_risk_notes : []),
  ].join(" ");

  return RISK_TERMS.filter((term) => termMatches(term, text)).map((term) => normalise(term));
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

function hasVerifiedStatusBasedOnlyOnAiAnswer(snapshot, statusKey) {
  if (normalise(snapshot[statusKey]) !== "verified") return false;

  const explicitAiOnlyFlags = [
    "based_only_on_ai_answer",
    "source_status_based_only_on_ai_answer",
    "fact_status_based_only_on_ai_answer",
  ];
  if (explicitAiOnlyFlags.some((key) => snapshot[key] === true)) return true;

  const basisText = [
    snapshot.source_status_basis,
    snapshot.fact_status_basis,
    snapshot.verification_basis,
    snapshot.source_basis,
    snapshot.fact_basis,
  ].join(" ");
  if (/(ai answer|answer snapshot|answer_snapshot|manual snapshot|ai_answer)/i.test(basisText)) {
    return true;
  }

  const hasNonAiEvidence = (
    (Array.isArray(snapshot.source_urls) && snapshot.source_urls.length > 0) ||
    (Array.isArray(snapshot.citations) && snapshot.citations.length > 0)
  );
  return !hasNonAiEvidence;
}

function validateSnapshot(snapshot, filePath = "") {
  const issues = [];
  const blockedReasons = [];
  const needsReviewReasons = [];

  for (const field of REQUIRED_FIELDS) {
    if (!hasOwn(snapshot, field)) {
      const issue = {
        field,
        message: `${field} is required for manual snapshot import.`,
      };
      issues.push(issue);
      if (BLOCKING_MISSING_FIELDS.includes(field)) blockedReasons.push(issue.message);
      else needsReviewReasons.push(issue.message);
    }
  }

  for (const field of REQUIRED_FILLED_STRING_FIELDS) {
    if (hasOwn(snapshot, field) && isBlank(snapshot[field])) {
      const issue = {
        field,
        message: `${field} must be filled for manual snapshot import.`,
      };
      issues.push(issue);
      if (BLOCKING_MISSING_FIELDS.includes(field)) blockedReasons.push(issue.message);
      else needsReviewReasons.push(issue.message);
    }
  }

  if (isBlank(snapshot.answer_snapshot)) {
    blockedReasons.push("answer_snapshot must be filled before import.");
  }

  if (!ALLOWED_AI_SURFACES.includes(normalise(snapshot.ai_surface))) {
    blockedReasons.push("ai_surface is not an allowed import surface.");
  }

  if (snapshot.contains_real_ai_answer !== true) {
    blockedReasons.push("contains_real_ai_answer must be true for an imported manual snapshot.");
  }

  if (snapshot.ai_platform_calls_used_by_system !== false) {
    blockedReasons.push("ai_platform_calls_used_by_system must remain false.");
  }

  if (snapshot.scraping_used_by_system !== false) {
    blockedReasons.push("scraping_used_by_system must remain false.");
  }

  if (snapshot.manual_review_required !== true) {
    blockedReasons.push("manual_review_required must remain true.");
  }

  if (normalise(snapshot.review_status) !== "needs_review") {
    blockedReasons.push("review_status must remain needs_review.");
  }

  if (snapshot.publish_ready === true) {
    blockedReasons.push("publish_ready must not be true for imported manual snapshots.");
  }

  if (snapshot.visibility_score_generated === true) {
    blockedReasons.push("visibility_score_generated must not be true for imported manual snapshots.");
  }

  if (snapshot.automated_monitoring_run === true) {
    blockedReasons.push("automated_monitoring_run must not be true for imported manual snapshots.");
  }

  if (hasOwn(snapshot, "final_visibility_score") && snapshot.final_visibility_score !== null && snapshot.final_visibility_score !== undefined) {
    blockedReasons.push("final_visibility_score must remain absent or null.");
  }

  const verifiedFactFlags = [
    "ai_answer_is_verified_fact",
    "used_as_verified_fact",
    "customer_facing_claim_ready",
  ];
  for (const flag of verifiedFactFlags) {
    if (snapshot[flag] === true) {
      blockedReasons.push(`${flag} must not be true for an AI answer observation.`);
    }
  }

  if (hasVerifiedStatusBasedOnlyOnAiAnswer(snapshot, "source_status")) {
    blockedReasons.push("source_status must not be verified when based only on an AI answer.");
  }

  if (hasVerifiedStatusBasedOnlyOnAiAnswer(snapshot, "fact_status")) {
    blockedReasons.push("fact_status must not be verified when based only on an AI answer.");
  }

  if (typeof snapshot.brand_mentioned !== "boolean") {
    needsReviewReasons.push("brand_mentioned must be boolean true or false.");
  }

  if (typeof snapshot.brand_recommended !== "boolean") {
    needsReviewReasons.push("brand_recommended must be boolean true or false.");
  }

  const requiredArrayFields = [
    "competitors_mentioned",
    "citations",
    "source_urls",
    "claim_risk_notes",
    "brand_understanding_notes",
  ];
  for (const field of requiredArrayFields) {
    if (!Array.isArray(snapshot[field])) {
      blockedReasons.push(`${field} must be an array.`);
    }
  }

  const claimRiskNotes = Array.isArray(snapshot.claim_risk_notes) ? snapshot.claim_risk_notes.filter((note) => !isBlank(note)) : [];
  if (claimRiskNotes.length > 0) {
    needsReviewReasons.push("claim_risk_notes require manual review before any future observation report.");
  }

  const matchedRiskTerms = unique(scanRiskTerms(snapshot));
  if (matchedRiskTerms.length > 0) {
    needsReviewReasons.push("Risk terms found in answer_snapshot, answer_framing or claim_risk_notes.");
  }

  if (snapshot.manual_review_required === true) {
    needsReviewReasons.push("manual_review_required remains true.");
  }

  if (snapshot.brand_mentioned === true || snapshot.brand_recommended === true || (Array.isArray(snapshot.citations) && snapshot.citations.length > 0)) {
    needsReviewReasons.push("Brand, recommendation or citation observations require manual interpretation.");
  }

  let decision = "pass";
  if (blockedReasons.length > 0) decision = "blocked";
  else if (needsReviewReasons.length > 0) decision = "needs_review";

  return {
    file_path: filePath,
    audit_id: snapshot.audit_id || "",
    brand_id: snapshot.brand_id || "",
    prompt_id: snapshot.prompt_id || "",
    ai_surface: normalise(snapshot.ai_surface),
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    issues,
    blocked_reasons: unique(blockedReasons),
    needs_review_reasons: unique(needsReviewReasons),
    claim_risk_notes: claimRiskNotes,
    matched_risk_terms: matchedRiskTerms,
  };
}

function buildRiskSummary(results) {
  const claimRiskNotesBySnapshot = results
    .filter((result) => result.claim_risk_notes.length > 0)
    .map((result) => ({
      audit_id: result.audit_id,
      prompt_id: result.prompt_id,
      ai_surface: result.ai_surface,
      claim_risk_notes: result.claim_risk_notes,
    }));

  const matchedRiskTermsBySnapshot = results
    .filter((result) => result.matched_risk_terms.length > 0)
    .map((result) => ({
      audit_id: result.audit_id,
      prompt_id: result.prompt_id,
      ai_surface: result.ai_surface,
      matched_risk_terms: result.matched_risk_terms,
    }));

  return {
    snapshots_with_claim_risk_notes: claimRiskNotesBySnapshot.length,
    total_claim_risk_notes: claimRiskNotesBySnapshot.reduce((count, item) => count + item.claim_risk_notes.length, 0),
    claim_risk_notes_by_snapshot: claimRiskNotesBySnapshot,
    matched_risk_terms: unique(results.flatMap((result) => result.matched_risk_terms)),
    matched_risk_terms_by_snapshot: matchedRiskTermsBySnapshot,
    high_risk_snapshot_ids: unique(results
      .filter((result) => result.decision === "blocked" || result.claim_risk_notes.length > 0 || result.matched_risk_terms.length > 0)
      .map((result) => result.audit_id)),
    risk_aggregation_source: ["claim_risk_notes", "term_scan"],
  };
}

function buildChecklist() {
  return `# Manual Snapshot Import Gate Checklist

This checklist is for Phase 8F review-mode manual snapshot imports only.

中文描述：
此清单用于 Phase 8F 人工 AI 回答快照导入门禁审核。

- [ ] Confirm manual snapshots exist
- [ ] Confirm answer_snapshot is filled
- [ ] Confirm contains_real_ai_answer is true
- [ ] Confirm test_date is filled
- [ ] Confirm ai_surface is valid
- [ ] Confirm brand_mentioned is true/false
- [ ] Confirm brand_recommended is true/false
- [ ] Confirm competitors_mentioned is array
- [ ] Confirm citations and source_urls are arrays
- [ ] Confirm no system AI platform calls
- [ ] Confirm no scraping
- [ ] Confirm no automated monitoring
- [ ] Confirm no visibility score
- [ ] Confirm AI answers are observations only
- [ ] Confirm AI answers are not verified facts
- [ ] Confirm claim_risk_notes are aggregated
- [ ] Confirm manual_review_required remains true
- [ ] Confirm publish_ready remains false
- [ ] Confirm no Shopify API
- [ ] Confirm no SEO content generated

中文描述：
导入门禁只判断人工 snapshots 是否可进入未来 observation report。它不会调用 AI 平台、不会抓取外部数据、不会生成 visibility score、不会生成 SEO 内容、不会连接 Shopify API，也不会自动发布。
`;
}

function buildManualSnapshotImportGate(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const files = listSnapshotFiles(brandId);
  const parseErrors = [];
  const snapshots = [];
  const results = [];

  for (const filePath of files) {
    const parsed = readJsonFile(filePath);
    if (!parsed.ok) {
      parseErrors.push({
        file_path: filePath,
        error: parsed.error,
      });
      continue;
    }
    snapshots.push(parsed.value);
    results.push(validateSnapshot(parsed.value, filePath));
  }

  const blockedResults = results.filter((result) => result.decision === "blocked");
  const needsReviewResults = results.filter((result) => result.decision === "needs_review");
  const readyResults = results.filter((result) => result.decision !== "blocked");
  const riskSummary = buildRiskSummary(results);

  let decision = "pass";
  if (files.length === 0 || parseErrors.length > 0 || blockedResults.length > 0) {
    decision = files.length === 0 && parseErrors.length === 0 && blockedResults.length === 0 ? "needs_review" : "blocked";
  } else if (needsReviewResults.length > 0 || riskSummary.total_claim_risk_notes > 0 || riskSummary.matched_risk_terms.length > 0) {
    decision = "needs_review";
  }

  const report = {
    brand_id: brandId,
    phase: "8F",
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    snapshots_checked: files.length,
    snapshots_ready_for_audit: readyResults.length,
    snapshots_needs_review: needsReviewResults.length,
    snapshots_blocked: blockedResults.length + parseErrors.length,
    ai_surfaces_detected: unique(results.map((result) => result.ai_surface)),
    mention_summary: {
      brand_mentions: countTruthy(snapshots, "brand_mentioned"),
      brand_recommendations: countTruthy(snapshots, "brand_recommended"),
      competitor_mentions: countArrayItems(snapshots, "competitors_mentioned"),
      citations_present: snapshots.filter((snapshot) => Array.isArray(snapshot.citations) && snapshot.citations.length > 0).length,
    },
    risk_summary: riskSummary,
    boundary_status: {
      manual_snapshots_only: true,
      ai_platform_calls_used_by_system: false,
      scraping_used_by_system: false,
      automated_monitoring_run: false,
      visibility_score_generated: false,
      seo_content_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
    },
    fact_safety: {
      ai_answers_treated_as_verified_fact: false,
      customer_facing_claims_generated: false,
      final_visibility_score_generated: false,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "AI answer snapshots are observations only and must not be treated as verified product facts, customer-facing claims or final visibility metrics.",
    ],
  };

  if (files.length === 0) {
    report.notes.push("No manual snapshots were found for import.");
  }
  if (parseErrors.length > 0) {
    report.notes.push("One or more manual snapshot files could not be parsed.");
  }

  const blockedItems = {
    brand_id: brandId,
    phase: "8F",
    blocked_items: [
      ...parseErrors.map((error) => ({
        file_path: error.file_path,
        audit_id: "",
        prompt_id: "",
        ai_surface: "",
        reasons: [`JSON parse error: ${error.error}`],
        recommended_next_action: "Fix JSON before importing this manual snapshot.",
      })),
      ...blockedResults.map((result) => ({
        file_path: result.file_path,
        audit_id: result.audit_id,
        prompt_id: result.prompt_id,
        ai_surface: result.ai_surface,
        reasons: result.blocked_reasons,
        matched_risk_terms: result.matched_risk_terms,
        recommended_next_action: "Keep this snapshot out of future observation reports until corrected.",
      })),
    ],
    needs_review_items: needsReviewResults.map((result) => ({
      file_path: result.file_path,
      audit_id: result.audit_id,
      prompt_id: result.prompt_id,
      ai_surface: result.ai_surface,
      reasons: result.needs_review_reasons,
      claim_risk_notes: result.claim_risk_notes,
      matched_risk_terms: result.matched_risk_terms,
      recommended_next_action: "Keep this snapshot review-only and manually interpret it before any future observation report.",
    })),
    notes: [
      "Manual snapshot import is review-only and does not generate observation reports or visibility scores.",
    ],
  };

  const dir = outputDir(brandId);
  writeJson(path.join(dir, "manual_snapshot_import_gate_report.json"), report);
  writeJson(path.join(dir, "manual_snapshot_import_blocked_items_report.json"), blockedItems);
  writeText(path.join(dir, "manual_snapshot_import_checklist.md"), buildChecklist());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildManualSnapshotImportGate(brandId), null, 2)}\n`);
}

module.exports = {
  buildManualSnapshotImportGate,
  validateSnapshot,
  listSnapshotFiles,
  scanRiskTerms,
};
