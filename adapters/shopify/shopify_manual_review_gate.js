const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_SHOPIFY_FILES = [
  "shopify_faq_block_clean.md",
  "shopify_faq_block_review.md",
  "shopify_faq_output_report.json",
  "shopify_faq_blocked_items_report.json",
  "shopify_manual_publish_checklist.md",
];

const REQUIRED_GLOBAL_FILES = [
  "publishing/modes.yml",
  "docs/PUBLISHING_SAFETY_POLICY.md",
];

const REQUIRED_BRAND_FILES = [
  "claim_blacklist.md",
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

function hasChinese(text) {
  return /[\u3400-\u9fff]/.test(text);
}

function includesPhrase(text, phrase) {
  const startsWord = /^[a-z0-9]/i.test(phrase);
  const endsWord = /[a-z0-9]$/i.test(phrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${prefix}${escaped}${suffix}`, "i").test(text);
}

function matchedRiskTerms(text) {
  return RISK_TERMS.filter((term) => includesPhrase(text, term));
}

function containsAll(text, phrases) {
  return phrases.every((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
}

function checkedFiles(shopifyFiles, globalFiles, brandFiles) {
  const result = {};
  for (const [name, file] of Object.entries(shopifyFiles)) {
    result[name] = file.ok;
  }
  for (const file of [...globalFiles, ...brandFiles]) {
    result[path.relative(ROOT_DIR, file.path)] = file.ok;
  }
  return result;
}

function writeReport(brandId, report) {
  const outputPath = path.join(ROOT_DIR, "outputs", brandId, "shopify", "shopify_manual_review_gate_report.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function findForbiddenOutputs(brandId) {
  const shopifyDir = path.join(ROOT_DIR, "outputs", brandId, "shopify");
  const found = [];
  if (!fs.existsSync(shopifyDir)) return found;

  for (const fileName of fs.readdirSync(shopifyDir)) {
    const lower = fileName.toLowerCase();
    if (
      lower.includes("faqpage") ||
      lower.includes("product_schema") ||
      lower.includes("product.schema") ||
      lower.includes("final") ||
      lower.endsWith(".html") ||
      lower.endsWith(".liquid")
    ) {
      found.push(path.relative(ROOT_DIR, path.join(shopifyDir, fileName)));
    }
  }
  return found;
}

function gateDecision(issues) {
  if (issues.some((issue) => issue.severity === "blocked")) return "blocked";
  if (issues.length > 0) return "needs_review";
  return "needs_review";
}

function gateRiskLevel(decision, issues) {
  if (decision === "blocked") return "high";
  return issues.length > 0 ? "medium" : "low";
}

function validateShopifyManualReviewGate(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const issues = [];
  const notes = [];

  const shopifyFiles = Object.fromEntries(
    REQUIRED_SHOPIFY_FILES.map((fileName) => [
      fileName,
      readFile(`outputs/${brandId}/shopify/${fileName}`),
    ]),
  );
  const globalFiles = REQUIRED_GLOBAL_FILES.map(readFile);
  const brandFiles = REQUIRED_BRAND_FILES.map((fileName) => readFile(`brands/${brandId}/${fileName}`));
  const allFiles = [...Object.values(shopifyFiles), ...globalFiles, ...brandFiles];
  const missingFiles = allFiles.filter((file) => !file.ok).map((file) => file.path);

  if (missingFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      checked_files: checkedFiles(shopifyFiles, globalFiles, brandFiles),
      clean_output_boundary: {},
      review_output_boundary: {},
      json_report_boundary: {},
      claim_safety_boundary: {},
      output_boundary: {},
      manual_publish_checklist_boundary: {},
      matched_risk_terms: [],
      missing_files: missingFiles,
      blocked_items_found_in_clean_output: [],
      manual_review_required: true,
      publish_ready: false,
      shopify_api_used: false,
      auto_publish_used: false,
      live_theme_modified: false,
      faqpage_schema_generated: false,
      product_schema_generated: false,
      notes: ["Required Shopify manual review gate files are missing or unreadable."],
    };
    writeReport(brandId, report);
    return report;
  }

  const cleanOutput = shopifyFiles["shopify_faq_block_clean.md"].content;
  const reviewOutput = shopifyFiles["shopify_faq_block_review.md"].content;
  const checklist = shopifyFiles["shopify_manual_publish_checklist.md"].content;
  const outputReportFile = shopifyFiles["shopify_faq_output_report.json"];
  const blockedReportFile = shopifyFiles["shopify_faq_blocked_items_report.json"];
  const outputReportJson = parseJson(outputReportFile);
  const blockedReportJson = parseJson(blockedReportFile);
  const outputReport = outputReportJson.data || {};
  const blockedReport = blockedReportJson.data || {};

  if (!outputReportJson.ok) issues.push({ severity: "blocked", reason: "shopify_output_report_invalid_json" });
  if (!blockedReportJson.ok) issues.push({ severity: "blocked", reason: "shopify_blocked_items_report_invalid_json" });

  const cleanContainsChinese = hasChinese(cleanOutput);
  const cleanStatesManualCopy = /manual-copy candidate only/i.test(cleanOutput);
  const cleanStatesManualApproval = /manual approval required before publication/i.test(cleanOutput);
  const cleanStatesNotAutoPublished = /not auto-published/i.test(cleanOutput);
  const cleanStatesNotLiveSection = /not a live shopify section/i.test(cleanOutput);
  const cleanStatesNotFaqPageSchema = /not faqpage schema/i.test(cleanOutput);
  const cleanContainsReviewNotes = /review status|source package|publishing safety reminder|owner review/i.test(cleanOutput);

  if (cleanContainsChinese) issues.push({ severity: "blocked", reason: "clean_output_contains_chinese" });
  if (!cleanStatesManualCopy) issues.push({ severity: "needs_review", reason: "clean_output_missing_manual_copy_boundary" });
  if (!cleanStatesManualApproval) issues.push({ severity: "needs_review", reason: "clean_output_missing_manual_approval_boundary" });
  if (!cleanStatesNotAutoPublished) issues.push({ severity: "needs_review", reason: "clean_output_missing_not_auto_published_boundary" });
  if (!cleanStatesNotLiveSection) issues.push({ severity: "needs_review", reason: "clean_output_missing_not_live_section_boundary" });
  if (!cleanStatesNotFaqPageSchema) issues.push({ severity: "needs_review", reason: "clean_output_missing_not_faqpage_schema_boundary" });
  if (cleanContainsReviewNotes) issues.push({ severity: "needs_review", reason: "clean_output_contains_review_only_notes" });

  const blockedItemsFoundInCleanOutput = [];
  for (const item of blockedReport.blocked_items || []) {
    if (item.question && cleanOutput.includes(item.question)) {
      blockedItemsFoundInCleanOutput.push(item.id || item.question);
    }
  }
  if (blockedItemsFoundInCleanOutput.length > 0) {
    issues.push({ severity: "blocked", reason: "blocked_items_found_in_clean_output" });
  }

  const reviewMayContainChinese = hasChinese(reviewOutput);
  const reviewStatesOwnerReview = /owner review version/i.test(reviewOutput);
  const reviewStatesNotFinal = /not final shopify output/i.test(reviewOutput);
  const reviewStatesChineseBoundary = /chinese descriptions must not enter the final shopify customer-facing output/i.test(reviewOutput);
  if (!reviewStatesOwnerReview) issues.push({ severity: "needs_review", reason: "review_output_missing_owner_review_boundary" });
  if (!reviewStatesNotFinal) issues.push({ severity: "needs_review", reason: "review_output_missing_not_final_boundary" });
  if (!reviewStatesChineseBoundary) issues.push({ severity: "needs_review", reason: "review_output_missing_chinese_boundary" });

  const jsonContainsChinese = hasChinese(outputReportFile.content) || hasChinese(blockedReportFile.content);
  if (jsonContainsChinese) issues.push({ severity: "blocked", reason: "json_report_contains_chinese" });
  if (outputReport.publish_ready !== false) issues.push({ severity: "blocked", reason: "publish_ready_not_false" });
  if (outputReport.manual_review_required !== true) issues.push({ severity: "needs_review", reason: "manual_review_required_not_true" });
  if (outputReport.shopify_api_used !== false) issues.push({ severity: "blocked", reason: "shopify_api_used_not_false" });
  if (outputReport.auto_publish_used !== false) issues.push({ severity: "blocked", reason: "auto_publish_used_not_false" });
  if (outputReport.live_theme_modified !== false) issues.push({ severity: "blocked", reason: "live_theme_modified_not_false" });
  if (outputReport.faqpage_schema_generated !== false) issues.push({ severity: "blocked", reason: "faqpage_schema_generated_not_false" });
  if (outputReport.product_schema_generated !== false) issues.push({ severity: "blocked", reason: "product_schema_generated_not_false" });

  const matchedTerms = matchedRiskTerms(cleanOutput);
  if (matchedTerms.length > 0) issues.push({ severity: "blocked", reason: "risk_terms_found_in_clean_output" });

  const forbiddenOutputs = findForbiddenOutputs(brandId);
  if (forbiddenOutputs.length > 0) issues.push({ severity: "blocked", reason: "forbidden_shopify_output_found" });

  const checklistRequirements = {
    includes_manual_approval: /manual|approval|publishing is manual/i.test(checklist),
    includes_no_auto_publish: /not auto-published|no auto-publish/i.test(checklist),
    includes_no_shopify_api: /no shopify api/i.test(checklist),
    includes_no_live_theme: /no live theme|live theme was modified/i.test(checklist),
    includes_no_faqpage_schema: /not faqpage schema|no faqpage schema/i.test(checklist),
    includes_no_product_schema: /not product schema|no product schema/i.test(checklist),
    includes_no_chinese_in_clean: /no chinese descriptions/i.test(checklist),
    includes_no_medicalised_claims: /no medicalised claims/i.test(checklist),
    includes_no_fake_reviews: /no fake reviews or fake authority/i.test(checklist),
    includes_no_unverified_policy_claims: /no unverified delivery, warranty or certification claims/i.test(checklist),
  };
  for (const [key, value] of Object.entries(checklistRequirements)) {
    if (!value) issues.push({ severity: "needs_review", reason: `checklist_missing_${key}` });
  }

  const decision = gateDecision(issues);
  const report = {
    brand_id: brandId,
    decision,
    risk_level: gateRiskLevel(decision, issues),
    checked_files: checkedFiles(shopifyFiles, globalFiles, brandFiles),
    clean_output_boundary: {
      exists: shopifyFiles["shopify_faq_block_clean.md"].ok,
      contains_chinese_descriptions: cleanContainsChinese,
      states_manual_copy_candidate_only: cleanStatesManualCopy,
      states_manual_approval_required: cleanStatesManualApproval,
      states_not_auto_published: cleanStatesNotAutoPublished,
      states_not_live_shopify_section: cleanStatesNotLiveSection,
      states_not_faqpage_schema: cleanStatesNotFaqPageSchema,
      contains_blocked_items: blockedItemsFoundInCleanOutput.length > 0,
      contains_review_only_notes: cleanContainsReviewNotes,
    },
    review_output_boundary: {
      exists: shopifyFiles["shopify_faq_block_review.md"].ok,
      may_contain_chinese_descriptions: true,
      contains_chinese_descriptions: reviewMayContainChinese,
      states_owner_review_only: reviewStatesOwnerReview,
      states_not_final_shopify_content: reviewStatesNotFinal,
      states_chinese_descriptions_excluded_from_final_copy: reviewStatesChineseBoundary,
    },
    json_report_boundary: {
      output_report_parses: outputReportJson.ok,
      blocked_items_report_parses: blockedReportJson.ok,
      json_reports_contain_chinese: jsonContainsChinese,
      publish_ready_false: outputReport.publish_ready === false,
      manual_review_required_true: outputReport.manual_review_required === true,
      shopify_api_used_false: outputReport.shopify_api_used === false,
      auto_publish_used_false: outputReport.auto_publish_used === false,
      live_theme_modified_false: outputReport.live_theme_modified === false,
      faqpage_schema_generated_false: outputReport.faqpage_schema_generated === false,
      product_schema_generated_false: outputReport.product_schema_generated === false,
    },
    claim_safety_boundary: {
      matched_risk_terms: matchedTerms,
      risky_terms_found: matchedTerms.length > 0,
    },
    output_boundary: {
      forbidden_outputs_found: forbiddenOutputs,
      final_shopify_page_absent: forbiddenOutputs.every((file) => !file.toLowerCase().includes("final") && !file.endsWith(".html")),
      live_shopify_section_absent: forbiddenOutputs.every((file) => !file.endsWith(".liquid")),
      shopify_api_output_absent: outputReport.shopify_api_used === false,
      faqpage_schema_absent: outputReport.faqpage_schema_generated === false && forbiddenOutputs.every((file) => !file.toLowerCase().includes("faqpage")),
      product_schema_absent: outputReport.product_schema_generated === false && forbiddenOutputs.every((file) => !file.toLowerCase().includes("product")),
      auto_published_content_absent: outputReport.auto_publish_used === false,
      live_theme_modification_absent: outputReport.live_theme_modified === false,
    },
    manual_publish_checklist_boundary: checklistRequirements,
    matched_risk_terms: matchedTerms,
    missing_files: [],
    blocked_items_found_in_clean_output: blockedItemsFoundInCleanOutput,
    manual_review_required: true,
    publish_ready: false,
    shopify_api_used: false,
    auto_publish_used: false,
    live_theme_modified: false,
    faqpage_schema_generated: false,
    product_schema_generated: false,
    notes: [
      "Shopify Manual Review Gate validates Phase 6A outputs only.",
      "It does not generate new Shopify content, connect to Shopify API, auto-publish, modify live themes, generate final Shopify pages, FAQPage Schema or Product Schema.",
      ...issues.map((issue) => issue.reason),
      ...notes,
    ],
  };

  writeReport(brandId, report);
  return report;
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = validateShopifyManualReviewGate(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateShopifyManualReviewGate,
};
