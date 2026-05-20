const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const PACKAGE_FILES = [
  {
    key: "clean_manual_copy_candidate",
    file_name: "shopify_faq_block_clean.md",
    purpose: "Clean UK English manual-copy candidate for future human Shopify entry",
    customer_facing: false,
    machine_readable: false,
    may_contain_chinese: false,
  },
  {
    key: "owner_review_output",
    file_name: "shopify_faq_block_review.md",
    purpose: "Owner review output with bilingual notes allowed",
    customer_facing: false,
    machine_readable: false,
    may_contain_chinese: true,
  },
  {
    key: "adapter_output_report",
    file_name: "shopify_faq_output_report.json",
    purpose: "Machine-readable adapter output report",
    customer_facing: false,
    machine_readable: true,
    may_contain_chinese: false,
  },
  {
    key: "blocked_items_report",
    file_name: "shopify_faq_blocked_items_report.json",
    purpose: "Machine-readable blocked and excluded items report",
    customer_facing: false,
    machine_readable: true,
    may_contain_chinese: false,
  },
  {
    key: "manual_publish_checklist",
    file_name: "shopify_manual_publish_checklist.md",
    purpose: "Human manual publish checklist for future owner review",
    customer_facing: false,
    machine_readable: false,
    may_contain_chinese: true,
  },
  {
    key: "manual_review_gate_report",
    file_name: "shopify_manual_review_gate_report.json",
    purpose: "Machine-readable Phase 6B review gate report",
    customer_facing: false,
    machine_readable: true,
    may_contain_chinese: false,
  },
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function outputPath(brandId, fileName) {
  return path.join(ROOT_DIR, "outputs", brandId, "shopify", fileName);
}

function readOutputFile(brandId, fileName) {
  const fullPath = outputPath(brandId, fileName);
  try {
    return { ok: true, path: fullPath, content: fs.readFileSync(fullPath, "utf8") };
  } catch (error) {
    return { ok: false, path: fullPath, content: "", error: error.message };
  }
}

function writeOutputFile(brandId, fileName, content) {
  const target = outputPath(brandId, fileName);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return path.relative(ROOT_DIR, target);
}

function writeJson(brandId, fileName, data) {
  return writeOutputFile(brandId, fileName, `${JSON.stringify(data, null, 2)}\n`);
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

function loadReviewPhrase(key, fallback) {
  const file = path.join(ROOT_DIR, "engines", "faq_generator", "templates", "faq_review_phrases.md");
  try {
    const content = fs.readFileSync(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([a-zA-Z0-9_.-]+):\s*(.+)$/);
      if (match && match[1] === key) return match[2];
    }
  } catch (_error) {
    return fallback;
  }
  return fallback;
}

function packageItem(brandId, definition) {
  const file = readOutputFile(brandId, definition.file_name);
  const jsonParse = definition.machine_readable && file.ok ? parseJson(file) : { ok: null, data: null };
  const containsChinese = file.ok ? hasChinese(file.content) : false;
  const relativePath = path.relative(ROOT_DIR, file.path);
  const issues = [];

  if (!file.ok) issues.push("missing package file");
  if (definition.machine_readable && file.ok && !jsonParse.ok) issues.push("machine-readable file does not parse as JSON");
  if (!definition.may_contain_chinese && containsChinese) issues.push("file contains Chinese descriptions where not allowed");

  return {
    key: definition.key,
    path: relativePath,
    purpose: definition.purpose,
    exists: file.ok,
    customer_facing: definition.customer_facing,
    machine_readable: definition.machine_readable,
    may_contain_chinese: definition.may_contain_chinese,
    contains_chinese: containsChinese,
    json_parse_ok: jsonParse.ok,
    issues,
  };
}

function manifestMarkdown(brandId, items, gateReport, outputReport) {
  const zhNote = loadReviewPhrase(
    "shopify_manifest_note",
    "This manifest is for owner review only.",
  );
  const zhLabel = loadReviewPhrase("label_zh", "Chinese review note:");
  const boundaryNote = loadReviewPhrase(
    "shopify_manifest_boundary_note",
    "This manifest is a read-only owner review index and does not create or change Shopify content.",
  );
  const lines = [
    "# Shopify Manual Package Manifest",
    "",
    "Status: Read-Only Delivery Manifest",
    "Manual review required before any future publication.",
    "Not auto-published.",
    "No Shopify API was used.",
    "No live Shopify theme was modified.",
    "Not a final Shopify page.",
    "Not FAQPage Schema.",
    "Not Product Schema.",
    "",
    zhLabel,
    zhNote,
    "",
    `Brand: ${brandId}`,
    `Package source: outputs/${brandId}/shopify/`,
    "",
    "## Included Files",
    "",
  ];

  for (const item of items) {
    lines.push(`### ${item.key}`);
    lines.push("");
    lines.push(`Path: ${item.path}`);
    lines.push(`Purpose: ${item.purpose}`);
    lines.push(`Exists: ${item.exists}`);
    lines.push(`Customer-facing: ${item.customer_facing}`);
    lines.push(`Machine-readable: ${item.machine_readable}`);
    lines.push(`Chinese allowed: ${item.may_contain_chinese}`);
    lines.push(`Issues: ${item.issues.length === 0 ? "none" : item.issues.join("; ")}`);
    lines.push("");
  }

  lines.push("## Gate Summary");
  lines.push("");
  lines.push(`Shopify output decision: ${outputReport.decision || "unknown"}`);
  lines.push(`Manual review gate decision: ${gateReport.decision || "unknown"}`);
  lines.push(`Publish ready: ${gateReport.publish_ready === true}`);
  lines.push(`Manual review required: ${gateReport.manual_review_required === true}`);
  lines.push(`Shopify API used: ${gateReport.shopify_api_used === true}`);
  lines.push(`Auto publish used: ${gateReport.auto_publish_used === true}`);
  lines.push(`Live theme modified: ${gateReport.live_theme_modified === true}`);
  lines.push(`FAQPage Schema generated: ${gateReport.faqpage_schema_generated === true}`);
  lines.push(`Product Schema generated: ${gateReport.product_schema_generated === true}`);
  lines.push("");
  lines.push("## Manual Boundary");
  lines.push("");
  lines.push("This manifest is only a read-only delivery index for owner review. It does not create or change Shopify content.");
  lines.push("");
  lines.push(zhLabel);
  lines.push(boundaryNote);
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildShopifyManualPackageManifest(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const items = PACKAGE_FILES.map((definition) => packageItem(brandId, definition));
  const outputReportFile = readOutputFile(brandId, "shopify_faq_output_report.json");
  const gateReportFile = readOutputFile(brandId, "shopify_manual_review_gate_report.json");
  const outputReportResult = outputReportFile.ok ? parseJson(outputReportFile) : { ok: false, data: {} };
  const gateReportResult = gateReportFile.ok ? parseJson(gateReportFile) : { ok: false, data: {} };
  const outputReport = outputReportResult.data || {};
  const gateReport = gateReportResult.data || {};
  const itemIssues = items.flatMap((item) => item.issues.map((issue) => `${item.key}: ${issue}`));
  const boundaryIssues = [];

  if (gateReport.publish_ready !== false) boundaryIssues.push("publish_ready is not false");
  if (gateReport.manual_review_required !== true) boundaryIssues.push("manual_review_required is not true");
  if (gateReport.shopify_api_used !== false) boundaryIssues.push("shopify_api_used is not false");
  if (gateReport.auto_publish_used !== false) boundaryIssues.push("auto_publish_used is not false");
  if (gateReport.live_theme_modified !== false) boundaryIssues.push("live_theme_modified is not false");
  if (gateReport.faqpage_schema_generated !== false) boundaryIssues.push("faqpage_schema_generated is not false");
  if (gateReport.product_schema_generated !== false) boundaryIssues.push("product_schema_generated is not false");

  const generatedFiles = [];
  const manifestPath = writeOutputFile(brandId, "shopify_manual_package_manifest.md", manifestMarkdown(brandId, items, gateReport, outputReport));
  generatedFiles.push(manifestPath);

  const allIssues = [...itemIssues, ...boundaryIssues];
  const report = {
    brand_id: brandId,
    decision: allIssues.length > 0 ? "needs_review" : "needs_review",
    risk_level: allIssues.length > 0 ? "medium" : "low",
    package_source: `outputs/${brandId}/shopify/`,
    manifest_file: manifestPath,
    included_files: items,
    package_summary: {
      total_files_expected: PACKAGE_FILES.length,
      total_files_found: items.filter((item) => item.exists).length,
      machine_readable_files: items.filter((item) => item.machine_readable).length,
      human_review_files: items.filter((item) => !item.machine_readable).length,
      files_with_issues: items.filter((item) => item.issues.length > 0).length,
    },
    safety_summary: {
      publish_ready: false,
      manual_review_required: true,
      shopify_api_used: false,
      auto_publish_used: false,
      live_theme_modified: false,
      faqpage_schema_generated: false,
      product_schema_generated: false,
      creates_new_shopify_content: false,
      read_only_manifest_only: true,
    },
    boundary_issues: boundaryIssues,
    manual_review_required: true,
    publish_ready: false,
    shopify_api_used: false,
    auto_publish_used: false,
    live_theme_modified: false,
    faqpage_schema_generated: false,
    product_schema_generated: false,
    generated_files: [],
    notes: [
      "Phase 6C creates a read-only manifest for existing Shopify manual-review outputs only.",
      "It does not create new Shopify content, connect to Shopify API, auto-publish, modify live themes, generate final Shopify pages, FAQPage Schema or Product Schema.",
    ],
  };

  const reportPath = writeJson(brandId, "shopify_manual_package_manifest_report.json", {
    ...report,
    generated_files: [manifestPath, `outputs/${brandId}/shopify/shopify_manual_package_manifest_report.json`],
  });

  return {
    ...report,
    generated_files: [manifestPath, reportPath],
  };
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = buildShopifyManualPackageManifest(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildShopifyManualPackageManifest,
};
