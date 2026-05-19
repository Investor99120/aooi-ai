const fs = require("fs");
const path = require("path");
const { validateClaim } = require("../compliance_checker/claim_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_FILES = [
  "claim_whitelist.md",
  "claim_blacklist.md",
];

const GLOBAL_REQUIRED_FILES = [
  "docs/SOURCE_STATUS_POLICY.md",
  "validation/rules.yml",
  "publishing/modes.yml",
];

const REQUIRED_FIELDS = [
  "id",
  "question",
  "answer_draft",
  "intent_cluster",
  "emotional_cluster",
  "trust_objection",
  "funnel_stage",
  "claim_risk_level",
  "source_status",
  "source_notes",
  "schema_eligible",
  "shopify_block_eligible",
  "requires_claim_validator",
  "requires_source_status_validator",
  "manual_review_required",
  "publishing_mode",
  "decision",
  "owner_notes",
];

const OPTIONAL_FIELDS = new Set(["last_reviewed_at"]);
const ALLOWED_SOURCE_STATUSES = new Set([
  "verified",
  "owner_defined",
  "unverified",
  "needs_owner_confirmation",
  "needs_research",
]);
const BLOCKED_SOURCE_STATUSES = new Set([
  "unverified",
  "needs_owner_confirmation",
  "needs_research",
]);
const ALLOWED_ELIGIBILITY_VALUES = new Set(["no", "false", "candidate", "needs_review", "blocked"]);
const ALLOWED_DECISIONS = new Set([
  "draft_candidate",
  "needs_review",
  "blocked",
  "approved_for_draft",
  "approved_for_export",
]);
const FACT_DEPENDENT_PATTERNS = [
  "delivery",
  "shipping",
  "ship",
  "warranty",
  "certification",
  "certified",
  "trustpilot",
  "reddit",
  "youtube",
  "tiktok",
  "review",
  "warehouse",
  "uk plug",
  "minutes",
  "wavelength",
  "led",
  "manual",
  "safety",
];

function readFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return {
      ok: true,
      path: fullPath,
      content: fs.readFileSync(fullPath, "utf8"),
    };
  } catch (error) {
    return {
      ok: false,
      path: fullPath,
      content: "",
      error: error.message,
    };
  }
}

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function stripComment(line) {
  const hashIndex = line.indexOf("#");
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function parseScalar(value) {
  const raw = String(value || "").trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  return raw.replace(/^["']|["']$/g, "");
}

function normalise(value) {
  return String(value === null || value === undefined ? "" : value).trim().toLowerCase();
}

function parseFaqBank(yaml) {
  const root = {};
  const faqs = [];
  let inFaqs = false;
  let current = null;

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();

    if (indent === 0 && content === "faqs:") {
      inFaqs = true;
      continue;
    }

    if (!inFaqs && indent === 0) {
      const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
      if (match) root[match[1].trim()] = parseScalar(match[2]);
      continue;
    }

    if (inFaqs && content.startsWith("- ")) {
      current = {};
      faqs.push(current);
      const rest = content.slice(2).trim();
      if (rest) {
        const match = rest.match(/^([^:]+):(?:\s*(.*))?$/);
        if (match) current[match[1].trim()] = parseScalar(match[2]);
      }
      continue;
    }

    if (inFaqs && current && indent >= 4) {
      const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
      if (match) current[match[1].trim()] = parseScalar(match[2]);
    }
  }

  return { root, faqs };
}

function increment(summary, key) {
  const safeKey = String(key === undefined || key === null || key === "" ? "missing" : key);
  summary[safeKey] = (summary[safeKey] || 0) + 1;
}

function hasFactDependentPattern(text) {
  const lower = normalise(text);
  return FACT_DEPENDENT_PATTERNS.some((pattern) => lower.includes(pattern));
}

function normaliseEligibility(value) {
  const normalised = normalise(value);
  if (normalised === "false") return "no";
  return normalised;
}

function addEntryIssue(collection, entry, severity, reason, message) {
  collection.push({
    id: entry.id || "unknown",
    severity,
    reason,
    message,
  });
}

function finalDecision(blockedEntries, needsReviewEntries) {
  if (blockedEntries.length > 0) return "blocked";
  if (needsReviewEntries.length > 0) return "needs_review";
  return "needs_review";
}

function riskLevel(decision) {
  if (decision === "blocked") return "high";
  if (decision === "needs_review") return "medium";
  return "low";
}

function validateFaqBank(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const notes = [];
  const checkedFiles = [
    readFile(`brands/${brandId}/faq_bank.yml`),
    ...REQUIRED_FILES.map((file) => readFile(`brands/${brandId}/${file}`)),
    ...GLOBAL_REQUIRED_FILES.map(readFile),
  ];

  const missingInputFiles = checkedFiles.filter((file) => !file.ok);
  if (missingInputFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      total_entries: 0,
      decision_summary: {},
      source_status_summary: {},
      claim_risk_summary: {},
      schema_eligibility_summary: {},
      shopify_block_eligibility_summary: {},
      missing_required_fields: missingInputFiles.map((file) => ({
        file: file.path,
        reason: file.error,
      })),
      blocked_entries: [],
      needs_review_entries: [],
      eligibility_conflicts: [],
      manual_review_required: true,
      publish_ready: false,
      notes: [
        "Required FAQ validation inputs could not be fully loaded.",
        ...missingInputFiles.map((file) => `Missing or unreadable file: ${file.path}`),
      ],
    };
    writeReport(brandId, report);
    return report;
  }

  const { faqs } = parseFaqBank(checkedFiles[0].content);
  const decisionSummary = {};
  const sourceStatusSummary = {};
  const claimRiskSummary = {};
  const schemaEligibilitySummary = {};
  const shopifyBlockEligibilitySummary = {};
  const missingRequiredFields = [];
  const blockedEntries = [];
  const needsReviewEntries = [];
  const eligibilityConflicts = [];

  for (const entry of faqs) {
    const entryId = entry.id || "unknown";
    increment(decisionSummary, entry.decision);
    increment(sourceStatusSummary, entry.source_status);
    increment(claimRiskSummary, entry.claim_risk_level);
    increment(schemaEligibilitySummary, normaliseEligibility(entry.schema_eligible));
    increment(shopifyBlockEligibilitySummary, normaliseEligibility(entry.shopify_block_eligible));

    for (const field of REQUIRED_FIELDS) {
      if (!(field in entry) || entry[field] === "") {
        missingRequiredFields.push({ id: entryId, field });
        addEntryIssue(needsReviewEntries, entry, "needs_review", "missing_required_field", `Missing required field: ${field}`);
      }
    }

    for (const field of Object.keys(entry)) {
      if (!REQUIRED_FIELDS.includes(field) && !OPTIONAL_FIELDS.has(field)) {
        addEntryIssue(needsReviewEntries, entry, "needs_review", "unsupported_field", `Unsupported field found: ${field}`);
      }
    }

    if (!entry.answer_draft) {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "empty_answer_draft", "answer_draft cannot be empty.");
    } else {
      const claimCheck = validateClaim(entry.answer_draft, { brandId });
      if (claimCheck.decision === "blocked") {
        addEntryIssue(blockedEntries, entry, "blocked", "claim_validator_blocked", "Claim Validator blocked answer_draft.");
      } else if (claimCheck.decision === "needs_review") {
        addEntryIssue(needsReviewEntries, entry, "needs_review", "claim_validator_needs_review", "Claim Validator requires review for answer_draft.");
      }
    }

    if (!entry.source_status || !ALLOWED_SOURCE_STATUSES.has(entry.source_status)) {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "invalid_source_status", "source_status is missing or unsupported.");
    }
    if (BLOCKED_SOURCE_STATUSES.has(entry.source_status)) {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "blocked_source_status", `${entry.source_status} cannot be exported as a customer-facing answer.`);
    }
    if (hasFactDependentPattern(entry.answer_draft) && entry.source_status !== "verified" && entry.source_status !== "owner_defined") {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "unverified_fact_dependent_answer", "Fact-dependent answer requires verified or owner-reviewed support before export.");
    }

    const schemaEligibility = normaliseEligibility(entry.schema_eligible);
    const shopifyEligibility = normaliseEligibility(entry.shopify_block_eligible);
    if (!ALLOWED_ELIGIBILITY_VALUES.has(schemaEligibility)) {
      eligibilityConflicts.push({ id: entryId, field: "schema_eligible", value: entry.schema_eligible, reason: "unsupported_eligibility_value" });
    }
    if (!ALLOWED_ELIGIBILITY_VALUES.has(shopifyEligibility)) {
      eligibilityConflicts.push({ id: entryId, field: "shopify_block_eligible", value: entry.shopify_block_eligible, reason: "unsupported_eligibility_value" });
    }
    if (entry.decision === "blocked" && schemaEligibility === "candidate") {
      eligibilityConflicts.push({ id: entryId, field: "schema_eligible", value: entry.schema_eligible, reason: "blocked_decision_conflicts_with_candidate_schema" });
    }
    if (entry.decision === "blocked" && shopifyEligibility === "candidate") {
      eligibilityConflicts.push({ id: entryId, field: "shopify_block_eligible", value: entry.shopify_block_eligible, reason: "blocked_decision_conflicts_with_candidate_shopify_block" });
    }
    if (shopifyEligibility === "candidate" && ["needs_owner_confirmation", "needs_research"].includes(entry.source_status)) {
      eligibilityConflicts.push({ id: entryId, field: "shopify_block_eligible", value: entry.shopify_block_eligible, reason: "candidate_shopify_block_requires_confirmed_source_status" });
    }
    if (entry.claim_risk_level === "high" && schemaEligibility === "candidate") {
      eligibilityConflicts.push({ id: entryId, field: "schema_eligible", value: entry.schema_eligible, reason: "high_claim_risk_conflicts_with_schema_candidate" });
    }
    if (entry.claim_risk_level === "high" && shopifyEligibility === "candidate") {
      eligibilityConflicts.push({ id: entryId, field: "shopify_block_eligible", value: entry.shopify_block_eligible, reason: "high_claim_risk_conflicts_with_shopify_candidate" });
    }
    if (entry.manual_review_required !== true) {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "manual_review_required_not_true", "manual_review_required must be true in Phase 5A.1.");
    }
    if (entry.publishing_mode !== "review_mode") {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "publishing_mode_not_review_mode", "publishing_mode must remain review_mode in Phase 5A.1.");
    }
    if (!ALLOWED_DECISIONS.has(entry.decision)) {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "unsupported_decision", "FAQ decision is not supported.");
    }
    if (entry.decision === "approved_for_export") {
      addEntryIssue(needsReviewEntries, entry, "needs_review", "approved_for_export_not_allowed", "approved_for_export is not allowed without complete validation and manual review.");
    }
    if (entry.decision === "blocked") {
      addEntryIssue(blockedEntries, entry, "blocked", "entry_decision_blocked", "Entry decision is blocked.");
    }
  }

  if (eligibilityConflicts.length > 0) {
    for (const conflict of eligibilityConflicts) {
      const entry = faqs.find((candidate) => candidate.id === conflict.id) || { id: conflict.id };
      addEntryIssue(needsReviewEntries, entry, "needs_review", "eligibility_conflict", conflict.reason);
    }
  }

  const uniqueBlocked = dedupeEntries(blockedEntries);
  const uniqueNeedsReview = dedupeEntries(needsReviewEntries);
  const decision = finalDecision(uniqueBlocked, uniqueNeedsReview);
  const report = {
    brand_id: brandId,
    decision,
    risk_level: riskLevel(decision),
    total_entries: faqs.length,
    decision_summary: decisionSummary,
    source_status_summary: sourceStatusSummary,
    claim_risk_summary: claimRiskSummary,
    schema_eligibility_summary: schemaEligibilitySummary,
    shopify_block_eligibility_summary: shopifyBlockEligibilitySummary,
    missing_required_fields: missingRequiredFields,
    blocked_entries: uniqueBlocked,
    needs_review_entries: uniqueNeedsReview,
    eligibility_conflicts: eligibilityConflicts,
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "FAQ Bank Validator is a safety gate before FAQ Draft Generator.",
      "FAQPage Schema, Shopify FAQ Block, and final FAQ output are not generated in Phase 5A.1.",
      "publish_ready remains false until validation gates and manual review are complete.",
      ...notes,
    ],
  };
  writeReport(brandId, report);
  return report;
}

function dedupeEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.id}|${entry.reason}|${entry.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function writeReport(brandId, report) {
  const outputPath = path.join(ROOT_DIR, "outputs", brandId, "faq", "faq_bank_validation_report.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = validateFaqBank(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateFaqBank,
};
