const fs = require("fs");
const path = require("path");
const { validateClaim } = require("../compliance_checker/claim_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";
const BLOCKED_SOURCE_STATUSES = new Set(["unverified", "needs_owner_confirmation", "needs_research"]);

const REQUIRED_FILES = [
  "faq_drafts_review.md",
  "faq_draft_generation_report.json",
  "blocked_faq_drafts_report.json",
  "faq_draft_review_gate_report.json",
];

const REQUIRED_BRAND_FILES = [
  "faq_bank.yml",
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

const FACT_DEPENDENT_PATTERNS = [
  "shipping",
  "delivery",
  "warranty",
  "certification",
  "certified",
  "review",
  "trustpilot",
  "reddit",
  "youtube",
  "tiktok",
  "warehouse",
  "wavelength",
  "led",
  "irradiance",
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

function stripComment(line) {
  const hashIndex = line.indexOf("#");
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function parseScalar(value) {
  const raw = String(value || "").trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  return raw.replace(/^["']|["']$/g, "");
}

function parseFaqBank(yaml) {
  const faqs = [];
  let inFaqs = false;
  let current = null;
  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();
    if (indent === 0 && content === "faqs:") {
      inFaqs = true;
      continue;
    }
    if (inFaqs && content.startsWith("- ")) {
      current = {};
      faqs.push(current);
      const rest = content.slice(2).trim();
      if (rest) {
        const match = rest.match(/^([^:]+):(?:\s*(.*))?$/);
        if (match) current[match[1].trim()] = parseScalar(match[2]);
      }
      continue;
    }
    if (inFaqs && current && indent >= 4) {
      const match = content.match(/^([^:]+):(?:\s*(.*))?$/);
      if (match) current[match[1].trim()] = parseScalar(match[2]);
    }
  }
  return faqs;
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

function hasFactDependentPattern(text) {
  const lower = String(text || "").toLowerCase();
  return FACT_DEPENDENT_PATTERNS.some((pattern) => lower.includes(pattern));
}

function outputPath(brandId, fileName) {
  return path.join(ROOT_DIR, "outputs", brandId, "faq", "export_candidate", fileName);
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

function cleanCandidateMarkdown(brandId, entries) {
  const title = brandId === "friendredlight" ? "FriendRedLight" : brandId;
  const lines = [
    `# ${title} FAQ Export Candidate`,
    "",
    "Status: Export Candidate Only",
    "Manual approval required before publication.",
    "Not a final customer-facing FAQ page.",
    "Not a Shopify FAQ Block.",
    "Not FAQPage Schema.",
    "",
  ];
  for (const entry of entries) {
    lines.push(`## ${entry.question}`);
    lines.push("");
    lines.push(entry.answer_draft);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function reviewCandidateMarkdown(brandId, entries, blockedItems, phrases) {
  const title = brandId === "friendredlight" ? "FriendRedLight" : brandId;
  const lines = [
    `# ${title} FAQ Export Candidate Review`,
    "",
    "This is an owner review version. It is not the final export.",
    "",
    phrases.label_zh || "Chinese review note:",
    phrases.export_review_intro || "Owner review translation needed.",
    "",
    "Chinese descriptions must not enter the final customer-facing export.",
    "",
    phrases.label_zh || "Chinese review note:",
    phrases.export_review_boundary || "Owner review translation needed.",
    "",
  ];
  for (const entry of entries) {
    lines.push(`## ${entry.question}`);
    lines.push("");
    lines.push(entry.answer_draft);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(phrases[`question.${entry.id}`] || phrases.question_fallback || "Owner review translation needed.");
    lines.push("");
    lines.push("Review Status:");
    lines.push("manual_review_required");
    lines.push("");
  }
  lines.push("## Blocked Or Excluded Items");
  lines.push("");
  for (const item of blockedItems) {
    lines.push(`- ${item.id}: ${item.question}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function approvalChecklist() {
  const phrases = loadReviewPhrases();
  return `# FAQ Export Approval Checklist

- [ ] Confirm this is not a final FAQ page.
- [ ] Confirm this is not FAQPage Schema.
- [ ] Confirm this is not Shopify FAQ Block.
- [ ] Confirm no Chinese descriptions in clean export candidate.
- [ ] Confirm no medicalised claims.
- [ ] Confirm no cure / treat / diagnose language.
- [ ] Confirm no guaranteed results.
- [ ] Confirm no fake reviews or fake authority.
- [ ] Confirm no invented NHS association.
- [ ] Confirm no unverified product specifications.
- [ ] Confirm no unverified delivery, warranty or certification claims.
- [ ] Confirm blocked FAQs are excluded.
- [ ] Confirm manual approval is required.
- [ ] Confirm final publishing is manual.
- [ ] Confirm Publishing Safety Policy is followed.

${phrases.label_zh || "Chinese review note:"}
${phrases.export_approval_note || "Owner review translation needed."}
`;
}

function blockedItem(entry, reason) {
  return {
    id: entry.id,
    question: entry.question,
    reason,
    recommended_next_action: [
      "keep item out of clean export candidate",
      "complete manual review",
      "confirm source status before export",
      "rerun FAQ review gates before future adapter output",
    ],
  };
}

function buildFaqExportCandidates(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const outputFiles = REQUIRED_FILES.map((file) => readFile(`outputs/${brandId}/faq/${file}`));
  const brandFiles = REQUIRED_BRAND_FILES.map((file) => readFile(`brands/${brandId}/${file}`));
  const globalFiles = REQUIRED_GLOBAL_FILES.map(readFile);
  const allRequired = [...outputFiles, ...brandFiles, ...globalFiles];
  const missingFiles = allRequired.filter((file) => !file.ok);

  if (missingFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      total_review_drafts: 0,
      export_candidates: 0,
      blocked_items: 0,
      needs_review_items: 0,
      export_candidate_ids: [],
      blocked_candidate_ids: [],
      source_files: allRequired.map((file) => file.path),
      manual_review_required: true,
      publish_ready: false,
      shopify_block_ready: false,
      faqpage_schema_ready: false,
      generated_files: [],
      notes: missingFiles.map((file) => `Missing required file: ${file.path}`),
    };
    writeJson(brandId, "faq_export_candidate_report.json", report);
    return report;
  }

  const draftGenerationReport = parseJson(outputFiles[1]).data || {};
  const blockedDraftReport = parseJson(outputFiles[2]).data || {};
  const reviewGateReport = parseJson(outputFiles[3]).data || {};
  const faqs = parseFaqBank(brandFiles[0].content);
  const blockedIds = new Set([
    ...(blockedDraftReport.blocked_entries || []).map((entry) => entry.id),
    ...((reviewGateReport.blocked_faq_boundary || {}).blocked_candidate_ids || []),
  ]);
  const phrases = loadReviewPhrases();
  const exportCandidates = [];
  const blockedItems = [];
  const needsReviewItems = [];

  for (const entry of faqs) {
    const reasons = [];
    if (blockedIds.has(entry.id)) reasons.push("blocked FAQ cannot enter export candidate");
    if (entry.decision === "blocked") reasons.push("decision is blocked");
    if (entry.claim_risk_level === "high") reasons.push("high claim risk");
    if (!entry.answer_draft) reasons.push("answer_draft is empty");
    if (BLOCKED_SOURCE_STATUSES.has(entry.source_status)) reasons.push("source status requires review before export");
    if (hasFactDependentPattern(entry.answer_draft) && entry.source_status !== "verified" && entry.source_status !== "owner_defined") {
      reasons.push("unverified product logistics warranty certification or policy-dependent claim");
    }
    const claimCheck = validateClaim(entry.answer_draft || "", { brandId });
    if (claimCheck.decision === "blocked") reasons.push("Claim Validator blocked answer_draft");
    if (claimCheck.decision === "needs_review") reasons.push("Claim Validator requires review");
    const riskTerms = matchedRiskTerms(entry.answer_draft || "");
    if (riskTerms.length > 0) reasons.push(`matched risk terms: ${riskTerms.join(", ")}`);
    if (hasChinese(entry.answer_draft || "")) reasons.push("answer_draft contains Chinese text");

    if (reasons.length > 0) {
      const item = blockedItem(entry, reasons);
      if (reasons.some((reason) => reason.includes("blocked") || reason.includes("high claim"))) {
        blockedItems.push(item);
      } else {
        needsReviewItems.push(item);
      }
      continue;
    }
    exportCandidates.push(entry);
  }

  const cleanMarkdown = cleanCandidateMarkdown(brandId, exportCandidates);
  const cleanRiskTerms = matchedRiskTerms(cleanMarkdown);
  if (hasChinese(cleanMarkdown) || cleanRiskTerms.length > 0) {
    for (const entry of exportCandidates) {
      blockedItems.push(blockedItem(entry, ["clean export candidate failed final safety check"]));
    }
    exportCandidates.length = 0;
  }

  const generatedFiles = [];
  generatedFiles.push(writeText(brandId, "faq_export_candidate.md", cleanCandidateMarkdown(brandId, exportCandidates)));
  generatedFiles.push(writeText(brandId, "faq_export_candidate_review.md", reviewCandidateMarkdown(brandId, exportCandidates, [...blockedItems, ...needsReviewItems], phrases)));
  generatedFiles.push(writeJson(brandId, "faq_export_blocked_items_report.json", {
    brand_id: brandId,
    blocked_items: [...blockedItems, ...needsReviewItems],
    notes: [
      "Items in this report are excluded from the clean export candidate.",
      "No final FAQ page, FAQPage Schema, Shopify FAQ Block or automatic publishing is generated in Phase 5C.",
    ],
  }));
  generatedFiles.push(writeText(brandId, "faq_export_approval_checklist.md", approvalChecklist()));

  const report = {
    brand_id: brandId,
    decision: "needs_review",
    risk_level: blockedItems.length > 0 ? "medium" : "medium",
    total_review_drafts: draftGenerationReport.drafts_generated || 0,
    export_candidates: exportCandidates.length,
    blocked_items: blockedItems.length,
    needs_review_items: needsReviewItems.length,
    export_candidate_ids: exportCandidates.map((entry) => entry.id),
    blocked_candidate_ids: [...blockedItems, ...needsReviewItems].map((entry) => entry.id),
    source_files: allRequired.map((file) => path.relative(ROOT_DIR, file.path)),
    manual_review_required: true,
    publish_ready: false,
    shopify_block_ready: false,
    faqpage_schema_ready: false,
    generated_files: [],
    notes: [
      "FAQ Export Candidate Pack is not final publication.",
      "Clean export candidate excludes Chinese review descriptions and blocked FAQ items.",
      "No FAQPage Schema, Shopify FAQ Block, final FAQ page or automatic publishing is generated.",
    ],
  };
  const reportPath = writeJson(brandId, "faq_export_candidate_report.json", {
    ...report,
    generated_files: [...generatedFiles, `outputs/${brandId}/faq/export_candidate/faq_export_candidate_report.json`],
  });
  return {
    ...report,
    generated_files: [...generatedFiles, reportPath],
  };
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = buildFaqExportCandidates(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildFaqExportCandidates,
};
