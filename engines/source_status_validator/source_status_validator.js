const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");

const DEFAULT_OPTIONS = {
  brandId: "friendredlight",
  target: "customer_facing",
};

const ALLOWED_STATUSES = new Set([
  "verified",
  "owner_defined",
  "unverified",
  "needs_owner_confirmation",
  "needs_research",
]);

const BLOCKED_FINAL_STATUSES = new Set([
  "unverified",
  "needs_owner_confirmation",
  "needs_research",
]);

const PRODUCT_FACT_PATH_HINTS = [
  "verified_product_facts",
  "unverified_fields",
  "product_catalog",
  "delivery_policy",
  "returns_policy",
  "warranty_policy",
  "certifications",
  "delivery_timeline",
  "returns_window",
  "warranty_length",
  "schema_ready_fields",
  "OfferShippingDetails",
  "MerchantReturnPolicy",
  "Product",
];

function readRequiredFile(relativePath) {
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
  return String(brandId || DEFAULT_OPTIONS.brandId).replace(/[^a-zA-Z0-9_-]/g, "");
}

function normaliseScalar(value) {
  return String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseYamlScalar(value) {
  const normalised = normaliseScalar(value);
  if (normalised === "true") return true;
  if (normalised === "false") return false;
  if (normalised === "null") return null;
  return normalised;
}

function stripComment(line) {
  const hashIndex = line.indexOf("#");
  if (hashIndex === -1) return line;
  return line.slice(0, hashIndex);
}

function pathToString(parts) {
  return parts.filter(Boolean).join(".");
}

function isProductFactPath(pathString) {
  return PRODUCT_FACT_PATH_HINTS.some((hint) => pathString.includes(hint));
}

function parseProductFactsYaml(yaml) {
  const nodes = new Map();
  const stack = [];
  const listCounters = new Map();

  function getNode(nodePath) {
    if (!nodes.has(nodePath)) {
      nodes.set(nodePath, {
        path: nodePath,
        source_status: undefined,
        schema_ready: undefined,
        values: {},
      });
    }
    return nodes.get(nodePath);
  }

  for (const rawLine of yaml.split(/\r?\n/)) {
    const withoutComment = stripComment(rawLine);
    if (!withoutComment.trim()) continue;

    const indent = withoutComment.match(/^\s*/)[0].length;
    let content = withoutComment.trim();

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (content.startsWith("- ")) {
      const parentPath = pathToString(stack.map((item) => item.key));
      const currentIndex = (listCounters.get(parentPath) || 0) + 1;
      listCounters.set(parentPath, currentIndex);
      const itemKey = `[${currentIndex}]`;
      stack.push({ indent, key: itemKey });
      content = content.slice(2).trim();
    }

    const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
    if (!match) continue;

    const key = normaliseScalar(match[1]);
    const rawValue = match[2] || "";
    const hasInlineValue = rawValue.trim() !== "";
    const parentPath = pathToString(stack.map((item) => item.key));
    const nodePath = parentPath || "root";
    const node = getNode(nodePath);

    if (hasInlineValue) {
      const value = parseYamlScalar(rawValue);
      node.values[key] = value;
      if (key === "source_status") node.source_status = String(value);
      if (key === "schema_ready") node.schema_ready = value === true;
    } else {
      const childPath = pathToString([...stack.map((item) => item.key), key]);
      getNode(childPath);
      stack.push({ indent, key });
    }
  }

  return Array.from(nodes.values());
}

function addFinding(findings, severity, category, pathValue, message, sourceStatus) {
  findings.push({
    severity,
    category,
    path: pathValue,
    source_status: sourceStatus || null,
    message,
  });
}

function validateNodes(nodes) {
  const findings = [];
  const statusSummary = {};
  const schemaReadySummary = {
    total: 0,
    verified: 0,
    blocked: 0,
  };

  for (const node of nodes) {
    if (node.source_status) {
      statusSummary[node.source_status] = (statusSummary[node.source_status] || 0) + 1;
    }

    if (node.source_status && !ALLOWED_STATUSES.has(node.source_status)) {
      addFinding(
        findings,
        "needs_review",
        "unknown_source_status",
        node.path,
        `Unknown source_status "${node.source_status}" is not defined in the source status policy.`,
        node.source_status,
      );
    }

    if (node.schema_ready === true) {
      schemaReadySummary.total += 1;
      if (node.source_status === "verified") {
        schemaReadySummary.verified += 1;
      } else {
        schemaReadySummary.blocked += 1;
        addFinding(
          findings,
          "blocked",
          "schema_ready_not_verified",
          node.path,
          "schema_ready fields must have source_status verified before schema output or adapter export.",
          node.source_status,
        );
      }
    }

    if (BLOCKED_FINAL_STATUSES.has(node.source_status)) {
      addFinding(
        findings,
        "blocked",
        "blocked_customer_facing_status",
        node.path,
        `${node.source_status} cannot be used in customer-facing outputs, schema outputs, or adapter exports.`,
        node.source_status,
      );
    }

    if (node.source_status === "owner_defined" && isProductFactPath(node.path)) {
      addFinding(
        findings,
        "needs_review",
        "owner_defined_product_fact_boundary",
        node.path,
        "owner_defined can support positioning and strategy, but must not automatically become a product fact.",
        node.source_status,
      );
    }

    if (
      isProductFactPath(node.path) &&
      node.schema_ready !== undefined &&
      !node.source_status
    ) {
      addFinding(
        findings,
        "blocked",
        "missing_source_status",
        node.path,
        "Product facts and schema candidates require source_status metadata.",
        null,
      );
    }
  }

  return {
    findings,
    statusSummary,
    schemaReadySummary,
  };
}

function finalDecision(findings, fileLoadOk) {
  if (!fileLoadOk) return "needs_review";
  if (findings.some((finding) => finding.severity === "blocked")) return "blocked";
  if (findings.some((finding) => finding.severity === "needs_review")) return "needs_review";
  return "pass";
}

function riskLevel(decision) {
  if (decision === "blocked") return "high";
  if (decision === "needs_review") return "medium";
  return "low";
}

function validateSourceStatus(options = {}) {
  const settings = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const brandId = safeBrandId(settings.brandId);

  const sourceStatusPolicy = readRequiredFile("docs/SOURCE_STATUS_POLICY.md");
  const validationRules = readRequiredFile("validation/rules.yml");
  const productFacts = readRequiredFile(`brands/${brandId}/product_facts.yml`);

  const notes = [];
  const fileLoadOk = sourceStatusPolicy.ok && validationRules.ok && productFacts.ok;

  for (const file of [sourceStatusPolicy, validationRules, productFacts]) {
    if (!file.ok) {
      notes.push(`Could not read required file at ${file.path}: ${file.error}`);
    }
  }

  if (!fileLoadOk) {
    return {
      decision: "needs_review",
      risk_level: "medium",
      brand_id: brandId,
      target: settings.target,
      checked_files: {
        source_status_policy: sourceStatusPolicy.ok,
        validation_rules: validationRules.ok,
        product_facts: productFacts.ok,
      },
      source_status_summary: {},
      schema_ready_summary: {
        total: 0,
        verified: 0,
        blocked: 0,
      },
      findings: [],
      export_permissions: {
        customer_facing_outputs: false,
        schema_outputs: false,
        adapter_exports: false,
      },
      manual_review_required: true,
      notes: [
        ...notes,
        "Required source-status inputs could not be fully loaded. Conservative review required.",
      ],
    };
  }

  const nodes = parseProductFactsYaml(productFacts.content);
  const validation = validateNodes(nodes);
  const decision = finalDecision(validation.findings, fileLoadOk);

  return {
    decision,
    risk_level: riskLevel(decision),
    brand_id: brandId,
    target: settings.target,
    checked_files: {
      source_status_policy: true,
      validation_rules: true,
      product_facts: true,
    },
    source_status_summary: validation.statusSummary,
    schema_ready_summary: validation.schemaReadySummary,
    findings: validation.findings,
    export_permissions: {
      customer_facing_outputs: decision === "pass",
      schema_outputs: decision === "pass",
      adapter_exports: decision === "pass",
    },
    manual_review_required: decision !== "pass",
    notes: [
      "Default policy is blocked_when_uncertain.",
      "verified can be used for customer-facing outputs.",
      "owner_defined can support positioning and strategy, but must not automatically become product facts.",
      "unverified, needs_owner_confirmation and needs_research cannot be exported as final claims.",
      "schema_ready_fields must be verified.",
    ],
  };
}

function runCli() {
  const args = process.argv.slice(2);
  const brandId = args[0] || DEFAULT_OPTIONS.brandId;
  const target = args[1] || DEFAULT_OPTIONS.target;
  const result = validateSourceStatus({ brandId, target });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  validateSourceStatus,
};
