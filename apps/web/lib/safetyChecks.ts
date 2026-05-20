import { getAllDashboardFiles, getFaqData, getSchemaData, getShopifyData, machineReadableLeaksChinese, missingFiles } from "./dashboardData";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function jsonData(fileName: string) {
  const file = getAllDashboardFiles().find((item) => item.path.endsWith(fileName));
  return asRecord(file?.data);
}

export function getSafetySummary() {
  const shopifyReport = jsonData("shopify_faq_output_report.json");
  const shopifyGate = jsonData("shopify_manual_review_gate_report.json");
  const manifestReport = jsonData("shopify_manual_package_manifest_report.json");
  const faqDraftReport = jsonData("faq_draft_generation_report.json");
  const faqExportReport = jsonData("faq_export_candidate_report.json");
  const schemaReport = jsonData("schema_generation_report.json");
  const allFiles = getAllDashboardFiles();
  const missing = missingFiles(allFiles);
  const chineseLeaks = machineReadableLeaksChinese(allFiles);

  return {
    publishReady: booleanValue(shopifyGate.publish_ready, booleanValue(shopifyReport.publish_ready, false)),
    manualReviewRequired: booleanValue(shopifyGate.manual_review_required, true),
    shopifyApiUsed: booleanValue(shopifyGate.shopify_api_used, false),
    autoPublishUsed: booleanValue(shopifyGate.auto_publish_used, false),
    liveThemeModified: booleanValue(shopifyGate.live_theme_modified, false),
    faqpageSchemaGenerated: booleanValue(shopifyGate.faqpage_schema_generated, false),
    productSchemaGenerated: booleanValue(shopifyGate.product_schema_generated, false),
    blockedCounts: {
      faqDrafts: numberValue(faqDraftReport.blocked_drafts),
      faqExport: numberValue(faqExportReport.blocked_items),
      shopify: numberValue(shopifyReport.blocked_items),
    },
    needsReviewCounts: {
      faqDrafts: numberValue(faqDraftReport.needs_review_drafts),
      faqExport: numberValue(faqExportReport.needs_review_items),
      shopify: numberValue(shopifyReport.needs_review_items),
    },
    riskLevels: {
      schema: String(schemaReport.risk_level || "unknown"),
      faqDrafts: String(faqDraftReport.risk_level || "unknown"),
      faqExport: String(faqExportReport.risk_level || "unknown"),
      shopify: String(shopifyReport.risk_level || "unknown"),
      shopifyGate: String(shopifyGate.risk_level || "unknown"),
      manifest: String(manifestReport.risk_level || "unknown"),
    },
    missingFiles: missing.map((item) => item.path),
    machineReadableChineseLeaks: chineseLeaks.map((item) => item.path),
    schemaFiles: getSchemaData(),
    faqFiles: getFaqData(),
    shopifyFiles: getShopifyData(),
  };
}
