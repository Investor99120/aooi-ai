const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_OUTPUT_FILES = [
  "faq_drafts_review.md",
  "faq_draft_generation_report.json",
  "blocked_faq_drafts_report.json",
  "faq_draft_review_checklist.md",
];

const REQUIRED_POLICY_FILES = [
  "claim_blacklist.md",
];

const REQUIRED_GLOBAL_FILES = [
  "docs/SOURCE_STATUS_POLICY.md",
  "publishing/modes.yml",
  "validation/rules.yml",
];

const RISK_TERMS = [
  "cure",
  "treat",
  "diagnose",
  "guaranteed results",
  "guaranteed pain relief",
  "insomnia treatment",
  "arthritis treatment",
  "fake reviews",
  "fake trustpilot",
  "fake reddit",
  "invented nhs association",
  "invented doctor recommendation",
  "unverified certification",
  "unverified delivery",
  "unverified warranty",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function readFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return { ok: true, path: fullPath, content: fs.readFileSync(fullPath, "utf8") };
  } catch (error) {
    return { ok: false, path: fullPath, content: "", error: error.message };
  }
}

function parseJson(file) {
  try {
    return { ok: true, data: JSON.parse(file.content) };
  } catch (error) {
    return { ok: false, data: null, error: error.message };
  }
}

function includesPhrase(text, phrase) {
  const startsWord = /^[a-z0-9]/i.test(phrase);
  const endsWord = /[a-z0-9]$/i.test(phrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${prefix}${escaped}${suffix}`, "i").test(text);
}

function hasChinese(text) {
  return /[\u3400-\u9fff]/.test(text);
}

function findForbiddenOutputs(brandId) {
  const faqDir = path.join(ROOT_DIR, "outputs", brandId, "faq");
  const found = [];
  if (!fs.existsSync(faqDir)) return found;
  for (const fileName of fs.readdirSync(faqDir)) {
    const lower = fileName.toLowerCase();
    if (
      lower.includes("faqpage") ||
      lower.includes("shopify") ||
      lower.includes("final") ||
      lower.endsWith(".html") ||
      lower.endsWith(".liquid")
    ) {
      found.push(path.relative(ROOT_DIR, path.join(faqDir, fileName)));
    }
  }
  return found;
}

function writeReport(brandId, report) {
  const outputPath = path.join(ROOT_DIR, "outputs", brandId, "faq", "faq_draft_review_gate_report.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function gateDecision(issues) {
  if (issues.some((issue) => issue.severity === "blocked")) return "blocked";
  return "needs_review";
}

function gateRiskLevel(decision) {
  return decision === "blocked" ? "high" : "medium";
}

function validateFaqDraftReviewGate(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const notes = [];
  const issues = [];

  const outputFiles = Object.fromEntries(
    REQUIRED_OUTPUT_FILES.map((fileName) => [
      fileName,
      readFile(`outputs/${brandId}/faq/${fileName}`),
    ]),
  );
  const policyFiles = [
    ...REQUIRED_POLICY_FILES.map((fileName) => readFile(`brands/${brandId}/${fileName}`)),
    ...REQUIRED_GLOBAL_FILES.map(readFile),
  ];
  const allFiles = [...Object.values(outputFiles), ...policyFiles];
  const missingFiles = allFiles.filter((file) => !file.ok).map((file) => file.path);

  if (missingFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      checked_files: checkedFiles(outputFiles, policyFiles),
      review_mode_boundary: {},
      json_report_boundary: {},
      blocked_faq_boundary: {},
      claim_safety_boundary: {},
      output_boundary: {},
      bilingual_boundary: {},
      matched_risk_terms: [],
      missing_files: missingFiles,
      manual_review_required: true,
      publish_ready: false,
      notes: ["Required review gate files are missing or unreadable."],
    };
    writeReport(brandId, report);
    return report;
  }

  const reviewMarkdown = outputFiles["faq_drafts_review.md"].content;
  const generationReportFile = outputFiles["faq_draft_generation_report.json"];
  const blockedReportFile = outputFiles["blocked_faq_drafts_report.json"];
  const generationJson = parseJson(generationReportFile);
  const blockedJson = parseJson(blockedReportFile);

  if (!generationJson.ok) issues.push({ severity: "blocked", reason: "generation_report_invalid_json" });
  if (!blockedJson.ok) issues.push({ severity: "blocked", reason: "blocked_report_invalid_json" });

  const generationReport = generationJson.data || {};
  const blockedReport = blockedJson.data || {};
  const markdownStatesReviewOnly = /owner review only/i.test(reviewMarkdown) && /not final customer-facing FAQ output/i.test(reviewMarkdown);
  const markdownClaimsFinal = /ready to publish|final customer-facing FAQ page|publish-ready/i.test(reviewMarkdown);
  if (!markdownStatesReviewOnly) issues.push({ severity: "needs_review", reason: "review_mode_statement_missing" });
  if (markdownClaimsFinal) issues.push({ severity: "blocked", reason: "markdown_claims_publish_ready" });

  if (generationReport.publish_ready !== false) issues.push({ severity: "blocked", reason: "publish_ready_not_false" });
  if (generationReport.manual_review_required !== true) issues.push({ severity: "needs_review", reason: "manual_review_required_not_true" });
  if (hasChinese(generationReportFile.content) || hasChinese(blockedReportFile.content)) {
    issues.push({ severity: "blocked", reason: "json_report_contains_chinese" });
  }

  const blockedEntries = blockedReport.blocked_entries || [];
  const blockedQuestionsInMarkdown = [];
  for (const entry of blockedEntries) {
    if (entry.question && reviewMarkdown.includes(entry.question)) {
      blockedQuestionsInMarkdown.push(entry.id || entry.question);
    }
  }
  if (blockedQuestionsInMarkdown.length > 0) {
    issues.push({ severity: "blocked", reason: "blocked_faq_present_in_normal_draft" });
  }
  if (blockedEntries.length !== (generationReport.blocked_drafts || 0)) {
    issues.push({ severity: "needs_review", reason: "blocked_report_count_mismatch" });
  }

  const matchedRiskTerms = RISK_TERMS.filter((term) => includesPhrase(reviewMarkdown, term));
  if (matchedRiskTerms.length > 0) {
    issues.push({ severity: "blocked", reason: "risk_terms_found_in_review_markdown" });
  }

  const forbiddenOutputs = findForbiddenOutputs(brandId);
  if (forbiddenOutputs.length > 0) {
    issues.push({ severity: "blocked", reason: "forbidden_output_file_found" });
  }

  const decision = gateDecision(issues);
  const report = {
    brand_id: brandId,
    decision,
    risk_level: gateRiskLevel(decision),
    checked_files: checkedFiles(outputFiles, policyFiles),
    review_mode_boundary: {
      faq_drafts_review_exists: outputFiles["faq_drafts_review.md"].ok,
      markdown_may_include_chinese: true,
      states_review_mode_only: markdownStatesReviewOnly,
      claims_final_customer_facing: markdownClaimsFinal,
    },
    json_report_boundary: {
      generation_report_parses: generationJson.ok,
      blocked_report_parses: blockedJson.ok,
      json_reports_contain_chinese: hasChinese(generationReportFile.content) || hasChinese(blockedReportFile.content),
      publish_ready_false: generationReport.publish_ready === false,
      manual_review_required_true: generationReport.manual_review_required === true,
    },
    blocked_faq_boundary: {
      blocked_candidate_ids: (blockedEntries || []).map((entry) => entry.id),
      blocked_questions_in_normal_draft: blockedQuestionsInMarkdown,
      blocked_entries_reported: blockedEntries.length,
    },
    claim_safety_boundary: {
      matched_risk_terms: matchedRiskTerms,
      risky_terms_found: matchedRiskTerms.length > 0,
    },
    output_boundary: {
      forbidden_outputs_found: forbiddenOutputs,
      faqpage_schema_absent: forbiddenOutputs.every((file) => !file.toLowerCase().includes("faqpage")),
      shopify_faq_block_absent: forbiddenOutputs.every((file) => !file.toLowerCase().includes("shopify")),
      final_faq_page_absent: forbiddenOutputs.every((file) => !file.toLowerCase().includes("final")),
    },
    bilingual_boundary: {
      markdown_contains_chinese: hasChinese(reviewMarkdown),
      json_reports_contain_chinese: hasChinese(generationReportFile.content) || hasChinese(blockedReportFile.content),
      machine_readable_outputs_clean: !(hasChinese(generationReportFile.content) || hasChinese(blockedReportFile.content)),
    },
    matched_risk_terms: matchedRiskTerms,
    missing_files: [],
    manual_review_required: true,
    publish_ready: false,
    notes: [
      "FAQ Draft Review Gate checks review-mode outputs only.",
      "It does not generate new FAQ drafts, FAQPage Schema, Shopify FAQ Block, final FAQ pages or automatic publishing.",
      ...issues.map((issue) => issue.reason),
      ...notes,
    ],
  };
  writeReport(brandId, report);
  return report;
}

function checkedFiles(outputFiles, policyFiles) {
  const result = {};
  for (const [name, file] of Object.entries(outputFiles)) {
    result[name] = file.ok;
  }
  for (const file of policyFiles) {
    result[path.relative(ROOT_DIR, file.path)] = file.ok;
  }
  return result;
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = validateFaqDraftReviewGate(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateFaqDraftReviewGate,
};
