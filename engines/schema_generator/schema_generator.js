const fs = require("fs");
const path = require("path");
const { validateClaim } = require("../compliance_checker/claim_validator");
const { validateSourceStatus } = require("../source_status_validator/source_status_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";
const SAFE_SOURCE_STATUSES = new Set(["verified", "owner_defined"]);
const EXCLUDED_SCHEMA_TYPES = [
  "Product",
  "FAQPage",
  "HowTo",
  "Article",
  "OfferShippingDetails",
  "MerchantReturnPolicy",
];
const BLOCKED_SCHEMA_KEYS = new Set([
  "aggregateRating",
  "review",
  "offers",
  "shippingDetails",
  "hasMerchantReturnPolicy",
  "award",
  "certification",
  "medicalSpecialty",
]);

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

function normaliseScalar(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function parseSimpleYaml(yaml) {
  const root = {};
  const stack = [{ indent: -1, value: root }];

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (!line.trim()) continue;

    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();

    if (content.startsWith("- ")) {
      const parent = stack[stack.length - 1].value;
      if (Array.isArray(parent)) {
        parent.push(normaliseScalar(content.slice(2)));
      }
      continue;
    }

    const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
    if (!match) continue;

    const key = normaliseScalar(match[1]);
    const rawValue = match[2] || "";
    const parent = stack[stack.length - 1].value;

    if (rawValue.trim() === "") {
      const nextValue = {};
      parent[key] = nextValue;
      stack.push({ indent, value: nextValue });
    } else {
      parent[key] = normaliseScalar(rawValue);
    }
  }

  return root;
}

function requiredValue(profile, key, skippedFields, notes) {
  const value = profile[key];
  if (!value) {
    skippedFields.push(key);
    notes.push(`Missing required brand_profile.yml field: ${key}`);
    return null;
  }
  return value;
}

function getDescription(profile) {
  if (profile.brand_positioning && profile.brand_positioning.long) {
    return profile.brand_positioning.long;
  }
  if (profile.brand_entity_definition && profile.brand_entity_definition.ai_summary_target) {
    return profile.brand_entity_definition.ai_summary_target;
  }
  return "";
}

function assertNoBlockedKeys(schema) {
  const serialized = JSON.stringify(schema);
  for (const key of BLOCKED_SCHEMA_KEYS) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Blocked schema key found: ${key}`);
    }
  }
}

function buildOrganizationSchema({ name, url, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    description,
    brand: {
      "@type": "Brand",
      name,
      url,
    },
  };
}

function buildBrandSchema({ name, url, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name,
    url,
    description,
  };
}

function buildWebsiteSchema({ name, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    publisher: {
      "@type": "Organization",
      name,
      url,
    },
  };
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function reportPath(brandId, fileName) {
  return path.join(ROOT_DIR, "outputs", brandId, "jsonld", fileName);
}

function buildClaimSummary(claimCheck) {
  return {
    decision: claimCheck.decision,
    risk_level: claimCheck.risk_level,
    matched_terms: claimCheck.matched_terms,
    risk_categories: claimCheck.risk_categories,
    manual_review_required: claimCheck.manual_review_required,
  };
}

function buildSourceStatusSummary(sourceStatusCheck) {
  return {
    decision: sourceStatusCheck.decision,
    risk_level: sourceStatusCheck.risk_level,
    source_status_summary: sourceStatusCheck.source_status_summary || {},
    schema_ready_summary: sourceStatusCheck.schema_ready_summary || {},
    manual_review_required: sourceStatusCheck.manual_review_required,
  };
}

function blockedFieldsFromSourceStatus(sourceStatusCheck) {
  return (sourceStatusCheck.findings || []).map((finding) => ({
    path: finding.path,
    reason: finding.category,
    source_status: finding.source_status,
    severity: finding.severity,
    message: finding.message,
  }));
}

function buildExcludedSchemaBlocks() {
  return EXCLUDED_SCHEMA_TYPES.map((schemaType) => ({
    path: schemaType,
    reason: "excluded_schema_type",
    source_status: null,
    severity: "blocked",
    message: `${schemaType} schema is excluded in Phase 4A and Phase 4A.1.`,
  }));
}

function buildReviewChecklist() {
  return `# Schema Review Checklist

- [ ] Confirm JSON parses correctly.
- [ ] Confirm no Chinese descriptions inside JSON-LD.
- [ ] Confirm no Product Schema.
- [ ] Confirm no FAQPage Schema.
- [ ] Confirm no Review or aggregateRating.
- [ ] Confirm no medical claims.
- [ ] Confirm no warranty, delivery or certification claims unless verified.
- [ ] Confirm final publishing is manual.
- [ ] Confirm Publishing Safety Policy is followed.
`;
}

function writeReports(brandId, report, blockedFieldsReport) {
  writeJson(reportPath(brandId, "schema_generation_report.json"), report);
  writeJson(reportPath(brandId, "blocked_fields_report.json"), blockedFieldsReport);
  writeText(reportPath(brandId, "schema_review_checklist.md"), buildReviewChecklist());
}

function baseBlockedFieldsReport(brandId, mode, blockedFields) {
  return {
    brand_id: brandId,
    mode,
    blocked_fields: blockedFields,
    reasons_supported: [
      "unverified",
      "needs_owner_confirmation",
      "needs_research",
      "missing_source_status",
      "claim_risk",
      "excluded_schema_type",
      "unsupported_phase_scope",
    ],
    notes: [
      "Blocked fields must not be exported to customer-facing schema outputs.",
      "Excluded schema types remain out of scope for Phase 4A and Phase 4A.1.",
    ],
  };
}

function generateSchemas(brandIdInput = DEFAULT_BRAND_ID, options = {}) {
  const brandId = safeBrandId(brandIdInput);
  const mode = options.dryRun ? "dry_run" : "normal";
  const notes = [];
  const skippedFields = [];
  const generatedFiles = [];

  const requiredFiles = [
    readFile(`brands/${brandId}/brand_profile.yml`),
    readFile("docs/SOURCE_STATUS_POLICY.md"),
    readFile("validation/rules.yml"),
    readFile("publishing/modes.yml"),
  ];

  const missingFiles = requiredFiles.filter((file) => !file.ok);
  if (missingFiles.length > 0) {
    const blockedFields = missingFiles.map((file) => ({
      path: file.path,
      reason: "missing_source_status",
      source_status: null,
      severity: "blocked",
      message: `Could not read required file: ${file.path}`,
    }));
    const report = {
      brand_id: brandId,
      mode,
      decision: "blocked",
      generated_files: [],
      excluded_schema_types: EXCLUDED_SCHEMA_TYPES,
      skipped_fields: missingFiles.map((file) => file.path),
      blocked_fields: blockedFields,
      claim_validator_summary: {},
      source_status_summary: {},
      manual_review_required: true,
      publish_ready: false,
      notes: missingFiles.map((file) => `Could not read required file: ${file.path}`),
    };
    writeReports(brandId, report, baseBlockedFieldsReport(brandId, mode, blockedFields));
    return report;
  }

  const profile = parseSimpleYaml(requiredFiles[0].content);
  const profileSourceStatus = profile.source_status;
  if (!SAFE_SOURCE_STATUSES.has(profileSourceStatus)) {
    const blockedFields = [{
      path: "brand_profile.source_status",
      reason: "missing_source_status",
      source_status: profileSourceStatus || null,
      severity: "blocked",
      message: "brand_profile.yml source_status must be verified or owner_defined.",
    }];
    const report = {
      brand_id: brandId,
      mode,
      decision: "blocked",
      generated_files: [],
      excluded_schema_types: EXCLUDED_SCHEMA_TYPES,
      skipped_fields: ["brand_profile.source_status"],
      blocked_fields: blockedFields,
      claim_validator_summary: {},
      source_status_summary: {},
      manual_review_required: true,
      publish_ready: false,
      notes: [`brand_profile.yml source_status must be verified or owner_defined. Found: ${profileSourceStatus || "missing"}`],
    };
    writeReports(brandId, report, baseBlockedFieldsReport(brandId, mode, blockedFields));
    return report;
  }

  const name = requiredValue(profile, "brand_name", skippedFields, notes);
  const url = requiredValue(profile, "brand_domain", skippedFields, notes);
  const description = getDescription(profile);
  if (!description) {
    skippedFields.push("description");
    notes.push("Missing safe brand description.");
  }

  if (!name || !url || !description) {
    const blockedFields = skippedFields.map((field) => ({
      path: field,
      reason: "missing_source_status",
      source_status: null,
      severity: "needs_review",
      message: "Required schema field is missing and needs manual review.",
    }));
    const report = {
      brand_id: brandId,
      mode,
      decision: "needs_review",
      generated_files: [],
      excluded_schema_types: EXCLUDED_SCHEMA_TYPES,
      skipped_fields: skippedFields,
      blocked_fields: blockedFields,
      claim_validator_summary: {},
      source_status_summary: {},
      manual_review_required: true,
      publish_ready: false,
      notes,
    };
    writeReports(brandId, report, baseBlockedFieldsReport(brandId, mode, blockedFields));
    return report;
  }

  const claimCheck = validateClaim(description, { brandId });
  if (claimCheck.decision === "blocked") {
    const blockedFields = [{
      path: "description",
      reason: "claim_risk",
      source_status: profileSourceStatus,
      severity: "blocked",
      message: "Description failed Claim Validator.",
    }];
    const report = {
      brand_id: brandId,
      mode,
      decision: "blocked",
      generated_files: [],
      excluded_schema_types: EXCLUDED_SCHEMA_TYPES,
      skipped_fields: ["description"],
      blocked_fields: blockedFields,
      claim_validator_summary: buildClaimSummary(claimCheck),
      source_status_summary: {},
      manual_review_required: true,
      publish_ready: false,
      notes: [
        "Description failed Claim Validator.",
        ...claimCheck.notes,
      ],
    };
    writeReports(brandId, report, baseBlockedFieldsReport(brandId, mode, blockedFields));
    return report;
  }
  if (claimCheck.decision === "needs_review") {
    notes.push("Description requires manual review according to Claim Validator.");
  }

  const sourceStatusCheck = validateSourceStatus({ brandId, target: "schema_candidate" });
  if (sourceStatusCheck.decision !== "pass") {
    notes.push(`Source Status Validator returned ${sourceStatusCheck.decision}; generated files are review-mode candidates only and must not be published.`);
  }
  const sourceStatusBlockedFields = blockedFieldsFromSourceStatus(sourceStatusCheck);
  const excludedSchemaBlocks = buildExcludedSchemaBlocks();
  const blockedFields = [
    ...sourceStatusBlockedFields,
    ...excludedSchemaBlocks,
  ];

  const schemas = {
    "organization.schema.json": buildOrganizationSchema({ name, url, description }),
    "brand.schema.json": buildBrandSchema({ name, url, description }),
    "website.schema.json": buildWebsiteSchema({ name, url }),
  };

  const outputDir = path.join(ROOT_DIR, "outputs", brandId, "jsonld");
  for (const [fileName, schema] of Object.entries(schemas)) {
    assertNoBlockedKeys(schema);
    const filePath = path.join(outputDir, fileName);
    if (!options.dryRun) {
      writeJson(filePath, schema);
    }
    generatedFiles.push(path.relative(ROOT_DIR, filePath));
  }

  const decision = sourceStatusCheck.decision === "blocked" ? "needs_review" : "needs_review";
  const report = {
    brand_id: brandId,
    mode,
    decision,
    generated_files: options.dryRun ? [] : generatedFiles,
    excluded_schema_types: EXCLUDED_SCHEMA_TYPES,
    skipped_fields: skippedFields,
    blocked_fields: blockedFields,
    claim_validator_summary: buildClaimSummary(claimCheck),
    source_status_summary: buildSourceStatusSummary(sourceStatusCheck),
    manual_review_required: true,
    publish_ready: false,
    notes: [
      ...notes,
      options.dryRun
        ? "Dry run mode did not write schema candidate files."
        : "Normal mode wrote schema candidate files.",
      "Phase 4A generated Organization, Brand, and WebSite schema candidates only.",
      "Product, FAQPage, HowTo, Article, OfferShippingDetails, and MerchantReturnPolicy schema are excluded in Phase 4A and Phase 4A.1.",
      "Generated JSON-LD files require manual review and must not be auto-published.",
    ],
  };
  writeReports(brandId, report, baseBlockedFieldsReport(brandId, mode, blockedFields));
  return report;
}

function runCli() {
  const args = process.argv.slice(2);
  const brandId = args.find((arg) => !arg.startsWith("--")) || DEFAULT_BRAND_ID;
  const dryRun = args.includes("--dry-run");
  const summary = generateSchemas(brandId, { dryRun });
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  generateSchemas,
};
