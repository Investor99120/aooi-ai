const fs = require("fs");
const path = require("path");
const { validateClaim } = require("../compliance_checker/claim_validator");
const { validateSourceStatus } = require("../source_status_validator/source_status_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";
const SAFE_SOURCE_STATUSES = new Set(["verified", "owner_defined"]);
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

function generateSchemas(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
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
    return {
      brand_id: brandId,
      decision: "blocked",
      generated_files: [],
      skipped_fields: missingFiles.map((file) => file.path),
      manual_review_required: true,
      notes: missingFiles.map((file) => `Could not read required file: ${file.path}`),
    };
  }

  const profile = parseSimpleYaml(requiredFiles[0].content);
  const profileSourceStatus = profile.source_status;
  if (!SAFE_SOURCE_STATUSES.has(profileSourceStatus)) {
    return {
      brand_id: brandId,
      decision: "blocked",
      generated_files: [],
      skipped_fields: ["brand_profile.source_status"],
      manual_review_required: true,
      notes: [`brand_profile.yml source_status must be verified or owner_defined. Found: ${profileSourceStatus || "missing"}`],
    };
  }

  const name = requiredValue(profile, "brand_name", skippedFields, notes);
  const url = requiredValue(profile, "brand_domain", skippedFields, notes);
  const description = getDescription(profile);
  if (!description) {
    skippedFields.push("description");
    notes.push("Missing safe brand description.");
  }

  if (!name || !url || !description) {
    return {
      brand_id: brandId,
      decision: "needs_review",
      generated_files: [],
      skipped_fields: skippedFields,
      manual_review_required: true,
      notes,
    };
  }

  const claimCheck = validateClaim(description, { brandId });
  if (claimCheck.decision === "blocked") {
    return {
      brand_id: brandId,
      decision: "blocked",
      generated_files: [],
      skipped_fields: ["description"],
      manual_review_required: true,
      notes: [
        "Description failed Claim Validator.",
        ...claimCheck.notes,
      ],
    };
  }
  if (claimCheck.decision === "needs_review") {
    notes.push("Description requires manual review according to Claim Validator.");
  }

  const sourceStatusCheck = validateSourceStatus({ brandId, target: "schema_candidate" });
  if (sourceStatusCheck.decision !== "pass") {
    notes.push(`Source Status Validator returned ${sourceStatusCheck.decision}; generated files are review-mode candidates only and must not be published.`);
  }

  const schemas = {
    "organization.schema.json": buildOrganizationSchema({ name, url, description }),
    "brand.schema.json": buildBrandSchema({ name, url, description }),
    "website.schema.json": buildWebsiteSchema({ name, url }),
  };

  const outputDir = path.join(ROOT_DIR, "outputs", brandId, "jsonld");
  for (const [fileName, schema] of Object.entries(schemas)) {
    assertNoBlockedKeys(schema);
    const filePath = path.join(outputDir, fileName);
    writeJson(filePath, schema);
    generatedFiles.push(path.relative(ROOT_DIR, filePath));
  }

  const decision = claimCheck.decision === "pass" ? "needs_review" : "needs_review";
  return {
    brand_id: brandId,
    decision,
    generated_files: generatedFiles,
    skipped_fields: skippedFields,
    manual_review_required: true,
    notes: [
      ...notes,
      "Phase 4A generated Organization, Brand, and WebSite schema candidates only.",
      "Product, FAQPage, HowTo, Article, OfferShippingDetails, and MerchantReturnPolicy schema are excluded in Phase 4A.",
      "Generated JSON-LD files require manual review and must not be auto-published.",
    ],
  };
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const summary = generateSchemas(brandId);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  generateSchemas,
};
