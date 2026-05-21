const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_PROMPT_FIELDS = [
  "id",
  "prompt",
  "prompt_type",
  "market",
  "language",
  "target_ai_surface",
  "intent_cluster",
  "emotional_cluster",
  "trust_objection",
  "funnel_stage",
  "commercial_intent",
  "content_opportunity_type",
  "related_product_category",
  "related_product",
  "competitor_context",
  "claim_risk_level",
  "source_status",
  "monitoring_eligible",
  "content_generation_eligible",
  "manual_review_required",
  "owner_notes",
];

const REQUIRED_CLUSTER_FIELDS = [
  "cluster_id",
  "description",
  "funnel_stage",
  "primary_intent",
  "emotional_driver",
  "claim_risk_level",
  "recommended_content_assets",
  "future_monitoring_priority",
  "source_status",
  "manual_review_required",
];

const REQUIRED_COMPETITOR_FIELDS = [
  "id",
  "competitor_context",
  "prompt_angle",
  "reason_for_monitoring",
  "risk_note",
  "source_status",
  "manual_review_required",
];

const GLOBAL_REQUIRED_FILES = [
  "docs/PROMPT_UNIVERSE_POLICY.md",
  "docs/PROMPT_UNIVERSE_FIELD_GUIDE.md",
  "validation/rules.yml",
  "docs/SOURCE_STATUS_POLICY.md",
];

const MACHINE_READABLE_FILES = [
  "brands/{brand}/prompt_universe.yml",
  "brands/{brand}/prompt_clusters.yml",
  "brands/{brand}/competitor_prompt_map.yml",
  "engines/prompt_universe/tests/prompt_universe_schema.test_cases.json",
  "engines/prompt_universe/tests/prompt_universe_validator.test_cases.json",
  "engines/prompt_universe/examples/prompt_universe_entry.example.yml",
  "engines/prompt_universe/examples/prompt_universe_validation_result.example.json",
];

const RISK_TERMS = [
  { term: "cure", severity: "blocked" },
  { term: "treat", severity: "blocked" },
  { term: "diagnose", severity: "blocked" },
  { term: "guaranteed results", severity: "blocked" },
  { term: "guaranteed pain relief", severity: "blocked" },
  { term: "insomnia treatment", severity: "blocked" },
  { term: "arthritis treatment", severity: "blocked" },
  { term: "nhs approved", severity: "blocked" },
  { term: "doctor recommended", severity: "blocked" },
  { term: "clinically proven to cure", severity: "blocked" },
  { term: "medical device", severity: "needs_review" },
];

const FACT_CLAIM_PATTERNS = [
  "search volume",
  "ranking",
  "ranked",
  "ai visibility verified",
  "ai already recommends",
  "already recommends",
  "share of voice",
  "market share",
  "visibility score",
  "recommendation rate",
  "mention rate",
  "outperforms",
  "beats",
  "leading brand",
  "most recommended",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function readFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return {
      ok: true,
      relative_path: relativePath,
      path: fullPath,
      content: fs.readFileSync(fullPath, "utf8"),
    };
  } catch (error) {
    return {
      ok: false,
      relative_path: relativePath,
      path: fullPath,
      content: "",
      error: error.message,
    };
  }
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(ROOT_DIR, relativePath), { recursive: true });
}

function writeJson(relativePath, data) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  ensureDir(path.dirname(relativePath));
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  ensureDir(path.dirname(relativePath));
  fs.writeFileSync(fullPath, text);
}

function parseScalar(value) {
  const raw = String(value || "").trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }
  return stripQuotes(raw);
}

function stripQuotes(value) {
  return String(value || "").replace(/^["']|["']$/g, "");
}

function normalise(value) {
  return String(value === null || value === undefined ? "" : value).trim().toLowerCase();
}

function parseYamlList(yaml, listKey) {
  const entries = [];
  let inList = false;
  let current = null;

  for (const rawLine of yaml.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const content = rawLine.trim();

    if (indent === 0 && content === `${listKey}:`) {
      inList = true;
      continue;
    }

    if (inList && indent === 0 && content.endsWith(":") && content !== `${listKey}:`) {
      inList = false;
      current = null;
      continue;
    }

    if (!inList) continue;

    if (content.startsWith("- ")) {
      current = {};
      entries.push(current);
      const rest = content.slice(2).trim();
      if (rest) addKeyValue(current, rest);
      continue;
    }

    if (current && indent >= 4) {
      addKeyValue(current, content);
    }
  }

  return entries;
}

function addKeyValue(target, content) {
  const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
  if (!match) return;
  target[match[1].trim()] = parseScalar(match[2]);
}

function increment(summary, key) {
  const safeKey = String(key === undefined || key === null || key === "" ? "missing" : key);
  summary[safeKey] = (summary[safeKey] || 0) + 1;
}

function containsChinese(text) {
  return /[\u3400-\u9fff]|中文描述/.test(String(text || ""));
}

function termRegex(term) {
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

function findRiskTerms(text) {
  const matches = [];
  for (const risk of RISK_TERMS) {
    if (termRegex(risk.term).test(text)) matches.push(risk);
  }
  return matches;
}

function findFactClaims(text) {
  const lower = normalise(text);
  return FACT_CLAIM_PATTERNS.filter((pattern) => {
    const index = lower.indexOf(pattern);
    if (index === -1) return false;
    const before = lower.slice(Math.max(0, index - 80), index);
    if (/(do not claim|does not prove|cannot claim|not state|do not state|without claiming|avoid claiming|no )/.test(before)) {
      return false;
    }
    return true;
  });
}

function addIssue(issues, item, itemType, severity, reason, message, matchedTerms = []) {
  issues.push({
    id: item.id || item.cluster_id || "unknown",
    item_type: itemType,
    severity,
    reason,
    message,
    matched_terms: matchedTerms,
  });
}

function validateRequiredFields(item, requiredFields, itemType, issues, missingFields) {
  for (const field of requiredFields) {
    const value = item[field];
    if (value === undefined || value === null || value === "") {
      const severity = field === "id" || field === "prompt" || field === "source_status" ? "blocked" : "needs_review";
      addIssue(issues, item, itemType, severity, "missing_required_field", `${field} is required.`);
      missingFields.push({
        id: item.id || item.cluster_id || "unknown",
        item_type: itemType,
        field,
      });
    }
  }
}

function validatePromptEntry(prompt, issues, matchedRiskTerms) {
  validateRequiredFields(prompt, REQUIRED_PROMPT_FIELDS, "prompt", issues, matchedRiskTerms.missingFields);

  if (prompt.manual_review_required !== true) {
    addIssue(issues, prompt, "prompt", "needs_review", "manual_review_required_not_true", "manual_review_required must remain true.");
  }

  if (normalise(prompt.monitoring_eligible) === "monitored") {
    addIssue(issues, prompt, "prompt", "blocked", "monitoring_status_not_allowed", "monitoring_eligible cannot be monitored in Phase 8B.");
  }

  if (normalise(prompt.content_generation_eligible) === "approved") {
    addIssue(issues, prompt, "prompt", "blocked", "content_generation_approval_not_allowed", "content_generation_eligible cannot be approved in Phase 8B.");
  }

  if (normalise(prompt.source_status) === "verified" && !prompt.source_notes && !prompt.proof_reference) {
    addIssue(issues, prompt, "prompt", "needs_review", "verified_without_source_notes", "verified prompt entries need source notes or a proof reference.");
  }

  const combinedText = `${prompt.prompt || ""} ${prompt.owner_notes || ""} ${prompt.trust_objection || ""}`;
  const risks = findRiskTerms(combinedText);
  for (const risk of risks) {
    matchedRiskTerms.terms.push(risk.term);
    addIssue(issues, prompt, "prompt", risk.severity, "claim_risk_term", `Matched risk term: ${risk.term}.`, [risk.term]);
  }

  const factClaims = findFactClaims(combinedText);
  for (const claim of factClaims) {
    addIssue(issues, prompt, "prompt", "blocked", "unsupported_visibility_or_demand_claim", `Prompt candidate cannot claim ${claim}.`, [claim]);
  }
}

function validateCluster(cluster, issues, missingFields) {
  validateRequiredFields(cluster, REQUIRED_CLUSTER_FIELDS, "cluster", issues, missingFields);

  if (cluster.manual_review_required !== true) {
    addIssue(issues, cluster, "cluster", "needs_review", "manual_review_required_not_true", "manual_review_required must remain true.");
  }

  const combinedText = `${cluster.description || ""} ${cluster.recommended_content_assets || ""} ${cluster.future_monitoring_priority || ""}`;
  const factClaims = findFactClaims(combinedText);
  for (const claim of factClaims) {
    addIssue(issues, cluster, "cluster", "blocked", "unsupported_market_or_visibility_claim", `Cluster cannot claim ${claim}.`, [claim]);
  }
}

function validateCompetitorPrompt(item, issues, missingFields, competitorFindings) {
  validateRequiredFields(item, REQUIRED_COMPETITOR_FIELDS, "competitor_prompt", issues, missingFields);

  if (item.manual_review_required !== true) {
    addIssue(issues, item, "competitor_prompt", "needs_review", "manual_review_required_not_true", "manual_review_required must remain true.");
  }

  if (normalise(item.source_status) !== "needs_research" && !item.source_notes && !item.proof_reference) {
    const finding = {
      id: item.id || "unknown",
      finding: "competitor_context_requires_research_or_source",
      source_status: item.source_status || "missing",
    };
    competitorFindings.push(finding);
    addIssue(issues, item, "competitor_prompt", "needs_review", finding.finding, "Competitor context must remain planning-focused unless sourced.");
  }

  const combinedText = `${item.competitor_context || ""} ${item.prompt_angle || ""} ${item.reason_for_monitoring || ""} ${item.risk_note || ""}`;
  const factClaims = findFactClaims(combinedText);
  for (const claim of factClaims) {
    const finding = {
      id: item.id || "unknown",
      finding: "unsupported_competitor_fact_claim",
      matched_term: claim,
    };
    competitorFindings.push(finding);
    addIssue(issues, item, "competitor_prompt", "blocked", finding.finding, `Competitor prompt map cannot claim ${claim}.`, [claim]);
  }
}

function summariseIssues(items, issues, itemType) {
  const summary = { total: items.length, pass: 0, needs_review: 0, blocked: 0 };
  for (const item of items) {
    const id = item.id || item.cluster_id || "unknown";
    const itemIssues = issues.filter((issue) => issue.id === id && issue.item_type === itemType);
    if (itemIssues.some((issue) => issue.severity === "blocked")) summary.blocked += 1;
    else if (itemIssues.length > 0) summary.needs_review += 1;
    else summary.pass += 1;
  }
  return summary;
}

function promptSummary(prompts, issues) {
  const summary = summariseIssues(prompts, issues, "prompt");
  return {
    total_prompts: summary.total,
    pass: summary.pass,
    needs_review: summary.needs_review,
    blocked: summary.blocked,
  };
}

function buildMachineReadableBoundary(brandId, generatedJsonTexts = []) {
  const files = MACHINE_READABLE_FILES.map((file) => file.replace("{brand}", brandId));
  const findings = {};
  let hasChinese = false;

  for (const file of files) {
    const result = readFile(file);
    if (!result.ok) {
      findings[file] = { exists: false, contains_chinese: false };
      continue;
    }
    const fileHasChinese = containsChinese(result.content);
    findings[file] = { exists: true, contains_chinese: fileHasChinese };
    hasChinese = hasChinese || fileHasChinese;
  }

  generatedJsonTexts.forEach((text, index) => {
    const key = `generated_report_${index + 1}`;
    const fileHasChinese = containsChinese(text);
    findings[key] = { exists: true, contains_chinese: fileHasChinese };
    hasChinese = hasChinese || fileHasChinese;
  });

  return {
    pass: !hasChinese,
    files: findings,
  };
}

function buildChecklist() {
  return `# Prompt Universe Review Checklist

## Review Status

This checklist is for internal review only. It is not customer-facing content.

中文描述：
此清单仅用于内部审核，不是用户可见内容。

- [ ] Confirm prompt candidates are not SEO content.
- [ ] Confirm prompt candidates are not AI answer results.
- [ ] Confirm prompt candidates do not prove demand.
- [ ] Confirm prompt candidates do not prove AI visibility.
- [ ] Confirm monitoring_eligible: candidate does not mean monitored.
- [ ] Confirm competitor_context does not become market fact.
- [ ] Confirm no medicalised claim is used as content direction.
- [ ] Confirm no search volume is invented.
- [ ] Confirm no AI ranking is invented.
- [ ] Confirm no competitor share of voice is invented.
- [ ] Confirm manual review is required before future monitoring or content generation.
- [ ] Confirm no AI platform was called.
- [ ] Confirm no scraping was used.
- [ ] Confirm no Shopify API was used.
- [ ] Confirm no publishing happened.

中文描述：
请确认 prompt candidates 不是 SEO 内容、不是 AI 回答结果、不证明需求或 AI 可见度；竞品语境不能变成市场事实；未来监测或内容生成前仍需人工审核。
`;
}

function validatePromptUniverse(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const outputDir = `outputs/${brandId}/prompt_universe`;
  const notes = [];
  const missingFields = [];
  const issues = [];
  const competitorBoundaryFindings = [];
  const matchedRisk = { terms: [], missingFields };

  const requiredFiles = [
    `brands/${brandId}/prompt_universe.yml`,
    `brands/${brandId}/prompt_clusters.yml`,
    `brands/${brandId}/competitor_prompt_map.yml`,
    ...GLOBAL_REQUIRED_FILES,
  ];

  const checkedFiles = {};
  const fileResults = requiredFiles.map((file) => {
    const result = readFile(file);
    checkedFiles[file] = {
      exists: result.ok,
      error: result.ok ? null : result.error,
    };
    return result;
  });

  const missingFiles = fileResults.filter((file) => !file.ok).map((file) => file.relative_path);
  if (missingFiles.length > 0) {
    notes.push("Missing required files prevent a pass decision.");
  }

  const promptFile = fileResults[0];
  const clusterFile = fileResults[1];
  const competitorFile = fileResults[2];

  const prompts = promptFile.ok ? parseYamlList(promptFile.content, "prompts") : [];
  const clusters = clusterFile.ok ? parseYamlList(clusterFile.content, "clusters") : [];
  const competitorPrompts = competitorFile.ok ? parseYamlList(competitorFile.content, "prompt_angles") : [];

  prompts.forEach((prompt) => validatePromptEntry(prompt, issues, matchedRisk));
  clusters.forEach((cluster) => validateCluster(cluster, issues, missingFields));
  competitorPrompts.forEach((item) => validateCompetitorPrompt(item, issues, missingFields, competitorBoundaryFindings));

  const sourceStatusSummary = {};
  const monitoringEligibilitySummary = {};
  const contentGenerationEligibilitySummary = {};
  prompts.forEach((prompt) => {
    increment(sourceStatusSummary, prompt.source_status);
    increment(monitoringEligibilitySummary, prompt.monitoring_eligible);
    increment(contentGenerationEligibilitySummary, prompt.content_generation_eligible);
  });
  clusters.forEach((cluster) => increment(sourceStatusSummary, cluster.source_status));
  competitorPrompts.forEach((item) => increment(sourceStatusSummary, item.source_status));

  const blockedIssues = issues.filter((issue) => issue.severity === "blocked");
  const needsReviewIssues = issues.filter((issue) => issue.severity !== "blocked");
  const blockedItems = blockedIssues.map((issue) => ({
    id: issue.id,
    item_type: issue.item_type,
    reason: [issue.reason, issue.message],
    matched_terms: issue.matched_terms || [],
    recommended_next_action: [
      "Keep this item out of monitoring and content generation until corrected.",
      "Review source status, wording and boundary notes.",
    ],
  }));

  const generatedJsonPreview = [
    JSON.stringify({ issues, blockedItems }),
  ];
  const machineReadableBoundary = buildMachineReadableBoundary(brandId, generatedJsonPreview);
  if (!machineReadableBoundary.pass) {
    notes.push("Machine-readable files contain Chinese descriptions.");
  }

  let decision = "pass";
  if (missingFiles.length > 0 || blockedIssues.length > 0 || !machineReadableBoundary.pass) decision = "blocked";
  else if (needsReviewIssues.length > 0) decision = "needs_review";

  const report = {
    brand_id: brandId,
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    checked_files: checkedFiles,
    prompt_summary: promptSummary(prompts, issues),
    cluster_summary: {
      total_clusters: clusters.length,
      needs_review: summariseIssues(clusters, issues, "cluster").needs_review,
      blocked: summariseIssues(clusters, issues, "cluster").blocked,
    },
    competitor_prompt_summary: {
      total_prompt_angles: competitorPrompts.length,
      needs_review: summariseIssues(competitorPrompts, issues, "competitor_prompt").needs_review,
      blocked: summariseIssues(competitorPrompts, issues, "competitor_prompt").blocked,
    },
    source_status_summary: sourceStatusSummary,
    monitoring_eligibility_summary: monitoringEligibilitySummary,
    content_generation_eligibility_summary: contentGenerationEligibilitySummary,
    matched_risk_terms: [...new Set(matchedRisk.terms)],
    missing_fields: missingFields,
    competitor_boundary_findings: competitorBoundaryFindings,
    machine_readable_boundary: machineReadableBoundary,
    manual_review_required: true,
    ai_platform_calls_used: false,
    scraping_used: false,
    shopify_api_used: false,
    auto_publish_used: false,
    seo_content_generated: false,
    faqpage_schema_generated: false,
    product_schema_generated: false,
    notes,
  };

  const blockedReport = {
    brand_id: brandId,
    blocked_items: blockedItems,
    notes: blockedItems.length > 0
      ? ["Blocked items must not enter AI monitoring or content generation."]
      : ["No blocked prompt universe items were found by this rule-based validator."],
  };

  writeJson(`${outputDir}/prompt_universe_validation_report.json`, report);
  writeJson(`${outputDir}/prompt_universe_blocked_items_report.json`, blockedReport);
  writeText(`${outputDir}/prompt_universe_review_checklist.md`, buildChecklist());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = validatePromptUniverse(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

module.exports = {
  validatePromptUniverse,
  parseYamlList,
};
