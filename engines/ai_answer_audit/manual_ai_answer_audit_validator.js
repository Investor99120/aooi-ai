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
  "answer_snapshot",
  "brand_mentioned",
  "brand_recommended",
  "competitors_mentioned",
  "citations",
  "review_status",
  "manual_review_required",
];

const RISK_TERMS = [
  "cure",
  "treat",
  "diagnose",
  "guaranteed results",
  "guaranteed pain relief",
  "insomnia treatment",
  "arthritis treatment",
  "nhs approved",
  "doctor recommended",
  "clinically proven to cure",
  "medical device",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function snapshotDir(brandId) {
  return path.join(ROOT_DIR, "outputs", brandId, "ai_answer_audit", "manual_snapshots");
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

function listSnapshotFiles(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const dir = snapshotDir(brandId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file));
}

function normalise(value) {
  return String(value === undefined || value === null ? "" : value).trim().toLowerCase();
}

function termRegex(term) {
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

function matchedRiskTerms(snapshot) {
  const text = [
    snapshot.answer_snapshot,
    snapshot.answer_framing,
    ...(Array.isArray(snapshot.claim_risk_notes) ? snapshot.claim_risk_notes : []),
    ...(Array.isArray(snapshot.brand_understanding_notes) ? snapshot.brand_understanding_notes : []),
  ].join(" ");
  return RISK_TERMS.filter((term) => termRegex(term).test(text));
}

function validateSnapshot(snapshot, filePath = "") {
  const issues = [];
  const blockedReasons = [];
  const needsReviewReasons = [];

  for (const field of REQUIRED_FIELDS) {
    if (snapshot[field] === undefined || snapshot[field] === null || snapshot[field] === "") {
      const message = `${field} is required.`;
      if (field === "audit_id" || field === "prompt_id") blockedReasons.push(message);
      else needsReviewReasons.push(message);
      issues.push({ field, message });
    }
  }

  if (snapshot.answer_snapshot !== undefined && normalise(snapshot.answer_snapshot) === "") {
    needsReviewReasons.push("answer_snapshot is empty.");
  }

  if (snapshot.ai_platform_calls_used_by_system !== false) {
    blockedReasons.push("ai_platform_calls_used_by_system must remain false.");
  }

  if (snapshot.scraping_used_by_system !== false) {
    blockedReasons.push("scraping_used_by_system must remain false.");
  }

  if (snapshot.manual_review_required !== true) {
    needsReviewReasons.push("manual_review_required must remain true.");
  }

  if (normalise(snapshot.review_status) === "approved") {
    blockedReasons.push("review_status cannot be approved in Phase 8D.");
  }

  const riskTerms = matchedRiskTerms(snapshot);
  if (riskTerms.length > 0) {
    needsReviewReasons.push("Risk terms found in manual answer snapshot.");
  }

  let decision = "pass";
  if (blockedReasons.length > 0) decision = "blocked";
  else if (needsReviewReasons.length > 0 || riskTerms.length > 0) decision = "needs_review";

  return {
    file_path: filePath,
    audit_id: snapshot.audit_id || "",
    prompt_id: snapshot.prompt_id || "",
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    matched_risk_terms: riskTerms,
    issues,
    blocked_reasons: blockedReasons,
    needs_review_reasons: needsReviewReasons,
  };
}

function validateManualSnapshots(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const files = listSnapshotFiles(brandId);
  const results = [];
  const parseErrors = [];

  for (const filePath of files) {
    const parsed = readJsonFile(filePath);
    if (!parsed.ok) {
      parseErrors.push({ file_path: filePath, error: parsed.error });
      continue;
    }
    results.push(validateSnapshot(parsed.value, filePath));
  }

  const blocked = results.filter((result) => result.decision === "blocked");
  const needsReview = results.filter((result) => result.decision === "needs_review");
  let decision = "pass";
  if (files.length === 0 || parseErrors.length > 0 || blocked.length > 0) decision = files.length === 0 ? "needs_review" : "blocked";
  else if (needsReview.length > 0) decision = "needs_review";

  return {
    brand_id: brandId,
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    snapshot_files_found: files.length,
    snapshots_validated: results.length,
    snapshots_valid: results.filter((result) => result.decision === "pass").length,
    snapshots_needs_review: needsReview.length,
    snapshots_blocked: blocked.length,
    parse_errors: parseErrors,
    results,
    manual_review_required: true,
    ai_platform_calls_used_by_system: false,
    scraping_used_by_system: false,
    notes: files.length === 0 ? ["No manual snapshots found."] : [],
  };
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(validateManualSnapshots(brandId), null, 2)}\n`);
}

module.exports = {
  validateManualSnapshots,
  validateSnapshot,
  listSnapshotFiles,
};
