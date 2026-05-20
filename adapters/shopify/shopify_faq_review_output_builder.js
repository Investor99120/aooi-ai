const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_FILES = [
  "faq_export_candidate.md",
  "faq_export_candidate_review.md",
  "faq_export_candidate_report.json",
  "faq_export_blocked_items_report.json",
];

const REQUIRED_GLOBAL_FILES = [
  "publishing/modes.yml",
  "docs/PUBLISHING_SAFETY_POLICY.md",
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

function loadReviewPhrases() {
  const file = readFile("engines/faq_generator/templates/faq_review_phrases.md");
  const phrases = {};
  if (!file.ok) return phrases;
  for (const line of file.content.split(/\r?\n/)) {
    const match = line.match(/^([a-zA-Z0-9_.-]+):\s*(.+)$/);
    if (match) phrases[match[1]] = match[2];
  }
  return phrases;
}

function outputPath(brandId, fileName) {
  return path.join(ROOT_DIR, "outputs", brandId, "shopify", fileName);
}

function writeText(brandId, fileName, content) {
  const target = outputPath(brandId, fileName);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return path.relative(ROOT_DIR, target);
}

function writeJson(brandId, fileName, data) {
  return writeText(brandId, fileName, `${JSON.stringify(data, null, 2)}\n`);
}

function extractFaqSections(markdown) {
  const sections = [];
  const lines = markdown.split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { question: line.slice(3).trim(), answerLines: [] };
      continue;
    }
    if (current) current.answerLines.push(line);
  }
  if (current) sections.push(current);

  return sections.map((section) => ({
    question: section.question,
    answer: section.answerLines.join("\n").trim(),
  })).filter((section) => section.question && section.answer);
}

function cleanShopifyMarkdown(sections) {
  const lines = [
    "# Shopify FAQ Block Clean Candidate",
    "",
    "Status: Manual-Copy Candidate Only",
    "Manual approval required before publication.",
    "Not auto-published.",
    "Not a live Shopify section.",
    "Not FAQPage Schema.",
    "",
  ];

  for (const section of sections) {
    lines.push(`## ${section.question}`);
    lines.push("");
    lines.push(section.answer);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function reviewShopifyMarkdown(sections, sourceReviewContent, exportReport, blockedReport, phrases) {
  const lines = [
    "# Shopify FAQ Block Review Candidate",
    "",
    "This is an owner review version. It is not final Shopify output.",
    "",
    phrases.label_zh || "Chinese review note:",
    phrases.shopify_review_intro || "Owner review translation needed.",
    "",
    "Chinese descriptions must not enter the final Shopify customer-facing output.",
    "",
    phrases.label_zh || "Chinese review note:",
    phrases.shopify_review_boundary || "Owner review translation needed.",
    "",
    "Source Package:",
    "outputs/{brand}/faq/export_candidate/",
    "",
    "Publishing Safety Reminder:",
    "No Shopify API was used. No live theme was modified. Final publishing remains manual.",
    "",
  ];

  for (const section of sections) {
    lines.push(`## ${section.question}`);
    lines.push("");
    lines.push(section.answer);
    lines.push("");
    lines.push("Review Status:");
    lines.push("manual_review_required");
    lines.push("");
  }

  lines.push("## Source Export Report Summary");
  lines.push("");
  lines.push(`- export_candidates: ${exportReport.export_candidates || 0}`);
  lines.push(`- blocked_items: ${exportReport.blocked_items || 0}`);
  lines.push(`- needs_review_items: ${exportReport.needs_review_items || 0}`);
  lines.push(`- publish_ready: ${exportReport.publish_ready === true}`);
  lines.push("");
  lines.push("## Blocked Or Excluded Items");
  lines.push("");
  for (const item of blockedReport.blocked_items || []) {
    lines.push(`- ${item.id || "unknown"}: ${item.question || "unknown question"}`);
  }
  lines.push("");
  lines.push("## Source Review Notes");
  lines.push("");
  lines.push(sourceReviewContent.trim());
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function manualPublishChecklist() {
  const phrases = loadReviewPhrases();
  return `# Shopify Manual Publish Checklist

- [ ] Confirm this is not auto-published.
- [ ] Confirm no Shopify API was used.
- [ ] Confirm no live theme was modified.
- [ ] Confirm this is not a final Shopify page.
- [ ] Confirm this is not FAQPage Schema.
- [ ] Confirm this is not Product Schema.
- [ ] Confirm clean output has no Chinese descriptions.
- [ ] Confirm no medicalised claims.
- [ ] Confirm no cure / treat / diagnose language.
- [ ] Confirm no guaranteed results.
- [ ] Confirm no fake reviews or fake authority.
- [ ] Confirm no invented NHS association.
- [ ] Confirm no unverified product specifications.
- [ ] Confirm no unverified delivery, warranty or certification claims.
- [ ] Confirm blocked FAQ items are excluded.
- [ ] Confirm final Shopify publishing is manual.
- [ ] Confirm Publishing Safety Policy is followed.

${phrases.label_zh || "Chinese review note:"}
${phrases.shopify_manual_publish_note || "Owner review translation needed."}
`;
}

function buildBlockedReport(brandId, exportBlockedReport, extraReasons = []) {
  const blockedItems = (exportBlockedReport.blocked_items || []).map((item) => ({
    id: item.id || "",
    question: item.question || "",
    reason: item.reason || ["blocked in FAQ export candidate pack"],
    recommended_next_action: item.recommended_next_action || [
      "keep item out of clean Shopify output",
      "complete manual review",
      "rerun upstream FAQ gates before Shopify adapter output",
    ],
  }));

  for (const reason of extraReasons) {
    blockedItems.push({
      id: "",
      question: "",
      reason: [reason],
      recommended_next_action: [
        "do not use clean Shopify output",
        "fix the adapter review output issue",
        "rerun Shopify FAQ review output builder",
      ],
    });
  }

  return {
    brand_id: brandId,
    blocked_items: blockedItems,
    notes: [
      "Blocked or excluded items must not be copied into Shopify clean output.",
      "Phase 6A does not use Shopify API, auto-publish or modify live themes.",
    ],
  };
}

function buildShopifyFaqReviewOutput(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const exportFiles = REQUIRED_FILES.map((file) => readFile(`outputs/${brandId}/faq/export_candidate/${file}`));
  const globalFiles = REQUIRED_GLOBAL_FILES.map(readFile);
  const claimBlacklist = readFile(`brands/${brandId}/claim_blacklist.md`);
  const allRequired = [...exportFiles, ...globalFiles, claimBlacklist];
  const missingFiles = allRequired.filter((file) => !file.ok);

  if (missingFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      source_package: `outputs/${brandId}/faq/export_candidate/`,
      clean_output_file: "",
      review_output_file: "",
      total_export_candidates: 0,
      shopify_clean_items: 0,
      blocked_items: 0,
      needs_review_items: 0,
      manual_review_required: true,
      publish_ready: false,
      shopify_api_used: false,
      auto_publish_used: false,
      live_theme_modified: false,
      faqpage_schema_generated: false,
      product_schema_generated: false,
      generated_files: [],
      notes: missingFiles.map((file) => `Missing required file: ${file.path}`),
    };
    writeJson(brandId, "shopify_faq_output_report.json", report);
    return report;
  }

  const exportReportResult = parseJson(exportFiles[2]);
  const blockedReportResult = parseJson(exportFiles[3]);
  const exportReport = exportReportResult.data || {};
  const exportBlockedReport = blockedReportResult.data || {};
  const sections = extractFaqSections(exportFiles[0].content);
  const phrases = loadReviewPhrases();
  const cleanMarkdown = cleanShopifyMarkdown(sections);
  const riskTerms = matchedRiskTerms(cleanMarkdown);
  const extraBlockReasons = [];

  if (!exportReportResult.ok) extraBlockReasons.push("FAQ export candidate report could not be parsed");
  if (!blockedReportResult.ok) extraBlockReasons.push("FAQ export blocked items report could not be parsed");
  if (hasChinese(cleanMarkdown)) extraBlockReasons.push("clean Shopify output contains Chinese descriptions");
  if (riskTerms.length > 0) extraBlockReasons.push(`clean Shopify output matched risk terms: ${riskTerms.join(", ")}`);
  if (exportReport.publish_ready === true) extraBlockReasons.push("upstream export candidate unexpectedly marked publish_ready true");
  if (exportReport.shopify_block_ready === true) extraBlockReasons.push("upstream export candidate unexpectedly marked shopify_block_ready true");
  if (exportReport.faqpage_schema_ready === true) extraBlockReasons.push("upstream export candidate unexpectedly marked faqpage_schema_ready true");

  const generatedFiles = [];
  let cleanOutputFile = "";
  if (extraBlockReasons.length === 0) {
    cleanOutputFile = writeText(brandId, "shopify_faq_block_clean.md", cleanMarkdown);
    generatedFiles.push(cleanOutputFile);
  }
  const reviewOutputFile = writeText(
    brandId,
    "shopify_faq_block_review.md",
    reviewShopifyMarkdown(sections, exportFiles[1].content, exportReport, exportBlockedReport, phrases),
  );
  generatedFiles.push(reviewOutputFile);

  const blockedReport = buildBlockedReport(brandId, exportBlockedReport, extraBlockReasons);
  const blockedReportPath = writeJson(brandId, "shopify_faq_blocked_items_report.json", blockedReport);
  generatedFiles.push(blockedReportPath);

  const checklistPath = writeText(brandId, "shopify_manual_publish_checklist.md", manualPublishChecklist());
  generatedFiles.push(checklistPath);

  const blockedItemsCount = exportReport.blocked_items || 0;
  const needsReviewItemsCount = exportReport.needs_review_items || 0;
  const report = {
    brand_id: brandId,
    decision: extraBlockReasons.length > 0 ? "blocked" : "needs_review",
    risk_level: extraBlockReasons.length > 0 ? "high" : "medium",
    source_package: `outputs/${brandId}/faq/export_candidate/`,
    clean_output_file: cleanOutputFile,
    review_output_file: reviewOutputFile,
    total_export_candidates: exportReport.export_candidates || sections.length,
    shopify_clean_items: extraBlockReasons.length > 0 ? 0 : sections.length,
    blocked_items: blockedItemsCount,
    needs_review_items: needsReviewItemsCount,
    manual_review_required: true,
    publish_ready: false,
    shopify_api_used: false,
    auto_publish_used: false,
    live_theme_modified: false,
    faqpage_schema_generated: false,
    product_schema_generated: false,
    generated_files: [],
    notes: [
      "Shopify FAQ output is a manual-copy candidate only.",
      "No Shopify API was used.",
      "No auto-publishing or live theme modification was performed.",
      "No FAQPage Schema, Product Schema or final Shopify page was generated.",
    ],
  };

  const reportPath = writeJson(brandId, "shopify_faq_output_report.json", {
    ...report,
    generated_files: [...generatedFiles, `outputs/${brandId}/shopify/shopify_faq_output_report.json`],
  });

  return {
    ...report,
    generated_files: [...generatedFiles, reportPath],
  };
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = buildShopifyFaqReviewOutput(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildShopifyFaqReviewOutput,
};
