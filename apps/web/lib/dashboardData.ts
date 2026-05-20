import {
  FileReadResult,
  hasChineseText,
  safeReadJsonFile,
  safeReadTextFile,
  safeReadYamlLikeFile,
} from "./fileReaders";

export const brandId = "friendredlight";
export const brandName = "FriendRedLight";
export const currentStage = "Phase 7B Minimal File-Based Internal Dashboard";

export type DashboardFile = FileReadResult<unknown> & {
  fileType: "json" | "yaml" | "markdown" | "jsonld";
  machineReadable: boolean;
  chineseAllowed: boolean;
  customerFacingAllowed: boolean;
};

function file(
  filePath: string,
  fileType: DashboardFile["fileType"],
  machineReadable: boolean,
  chineseAllowed: boolean,
  customerFacingAllowed = false,
): DashboardFile {
  const result = fileType === "json" || fileType === "jsonld"
    ? safeReadJsonFile(filePath)
    : fileType === "yaml"
      ? safeReadYamlLikeFile(filePath)
      : safeReadTextFile(filePath);

  return {
    ...result,
    fileType,
    machineReadable,
    chineseAllowed,
    customerFacingAllowed,
  };
}

export function getBrandData() {
  return [
    file(`brands/${brandId}/brand_profile.yml`, "yaml", true, false),
    file(`brands/${brandId}/product_facts.yml`, "yaml", true, false),
    file(`brands/${brandId}/semantic_map.yml`, "yaml", true, false),
    file(`brands/${brandId}/uk_localisation.md`, "markdown", false, true),
    file(`brands/${brandId}/claim_whitelist.md`, "markdown", false, true),
    file(`brands/${brandId}/claim_blacklist.md`, "markdown", false, true),
    file(`brands/${brandId}/faq_bank.yml`, "yaml", true, false),
  ];
}

export function getSchemaData() {
  return [
    file(`outputs/${brandId}/jsonld/organization.schema.json`, "jsonld", true, false, true),
    file(`outputs/${brandId}/jsonld/brand.schema.json`, "jsonld", true, false, true),
    file(`outputs/${brandId}/jsonld/website.schema.json`, "jsonld", true, false, true),
    file(`outputs/${brandId}/jsonld/schema_generation_report.json`, "json", true, false),
    file(`outputs/${brandId}/jsonld/blocked_fields_report.json`, "json", true, false),
    file(`outputs/${brandId}/jsonld/schema_review_checklist.md`, "markdown", false, true),
  ];
}

export function getFaqData() {
  return [
    file(`outputs/${brandId}/faq/faq_bank_validation_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/faq_draft_generation_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/faq_draft_review_gate_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/faq_drafts_review.md`, "markdown", false, true),
    file(`outputs/${brandId}/faq/blocked_faq_drafts_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/export_candidate/faq_export_candidate.md`, "markdown", false, false, true),
    file(`outputs/${brandId}/faq/export_candidate/faq_export_candidate_review.md`, "markdown", false, true),
    file(`outputs/${brandId}/faq/export_candidate/faq_export_candidate_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/export_candidate/faq_export_blocked_items_report.json`, "json", true, false),
    file(`outputs/${brandId}/faq/export_candidate/faq_export_approval_checklist.md`, "markdown", false, true),
  ];
}

export function getShopifyData() {
  return [
    file(`outputs/${brandId}/shopify/shopify_faq_block_clean.md`, "markdown", false, false, true),
    file(`outputs/${brandId}/shopify/shopify_faq_block_review.md`, "markdown", false, true),
    file(`outputs/${brandId}/shopify/shopify_faq_output_report.json`, "json", true, false),
    file(`outputs/${brandId}/shopify/shopify_faq_blocked_items_report.json`, "json", true, false),
    file(`outputs/${brandId}/shopify/shopify_manual_publish_checklist.md`, "markdown", false, true),
    file(`outputs/${brandId}/shopify/shopify_manual_review_gate_report.json`, "json", true, false),
    file(`outputs/${brandId}/shopify/shopify_manual_package_manifest.md`, "markdown", false, true),
    file(`outputs/${brandId}/shopify/shopify_manual_package_manifest_report.json`, "json", true, false),
  ];
}

export function getPublishingData() {
  return [
    file("publishing/modes.yml", "yaml", true, false),
    file("docs/PUBLISHING_SAFETY_POLICY.md", "markdown", false, true),
    file("docs/DASHBOARD_SAFETY_BOUNDARIES.md", "markdown", false, true),
  ];
}

export function getAllDashboardFiles() {
  return [
    ...getBrandData(),
    ...getSchemaData(),
    ...getFaqData(),
    ...getShopifyData(),
    ...getPublishingData(),
  ];
}

export function machineReadableLeaksChinese(files: DashboardFile[]) {
  return files.filter((item) => item.machineReadable && hasChineseText(item.content));
}

export function missingFiles(files: DashboardFile[]) {
  return files.filter((item) => !item.exists);
}
