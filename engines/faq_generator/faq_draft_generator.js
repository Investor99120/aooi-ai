const fs = require("fs");
const path = require("path");
const { validateClaim } = require("../compliance_checker/claim_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";
const REQUIRED_GLOBAL_FILES = [
  "docs/SOURCE_STATUS_POLICY.md",
  "validation/rules.yml",
  "publishing/modes.yml",
];
const REQUIRED_BRAND_FILES = [
  "faq_bank.yml",
  "claim_whitelist.md",
  "claim_blacklist.md",
  "semantic_map.yml",
];
const BLOCKED_SOURCE_STATUSES = new Set(["unverified", "needs_owner_confirmation", "needs_research"]);

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
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

function readFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return { ok: true, path: fullPath, content: fs.readFileSync(fullPath, "utf8") };
  } catch (error) {
    return { ok: false, path: fullPath, content: "", error: error.message };
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

function loadValidationReport(brandId) {
  const report = readFile(`outputs/${brandId}/faq/faq_bank_validation_report.json`);
  if (!report.ok) return null;
  try {
    return JSON.parse(report.content);
  } catch (_error) {
    return null;
  }
}

function outputPath(brandId, fileName) {
  return path.join(ROOT_DIR, "outputs", brandId, "faq", fileName);
}

function writeJson(brandId, fileName, data) {
  const filePath = outputPath(brandId, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return path.relative(ROOT_DIR, filePath);
}

function writeText(brandId, fileName, content) {
  const filePath = outputPath(brandId, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return path.relative(ROOT_DIR, filePath);
}

function reviewStatusFor(entry, claimDecision) {
  if (entry.decision === "blocked") return "blocked";
  if (claimDecision === "blocked") return "blocked";
  if (entry.decision === "needs_review") return "needs_review";
  if (claimDecision === "needs_review") return "needs_review";
  if (entry.claim_risk_level === "high") return "needs_review";
  if (BLOCKED_SOURCE_STATUSES.has(entry.source_status)) return "needs_review";
  return "draft_candidate";
}

function recommendedActions(entry, claimDecision) {
  const actions = ["keep output in review mode", "manual review required"];
  if (claimDecision !== "pass") actions.push("revise answer_draft and rerun Claim Validator");
  if (BLOCKED_SOURCE_STATUSES.has(entry.source_status)) actions.push("confirm source facts before export");
  if (entry.claim_risk_level === "high") actions.push("compliance review required");
  if (entry.decision === "blocked") actions.push("do not generate normal review draft");
  return actions;
}

function markdownForDrafts(brandId, drafts, phrases) {
  const lines = [`# ${brandId === "friendredlight" ? "FriendRedLight" : brandId} FAQ Drafts Review`, ""];
  lines.push("These drafts are for owner review only. They are not final customer-facing FAQ output.");
  lines.push("");
  lines.push(phrases.label_zh || "Chinese review note:");
  lines.push(phrases.review_intro || "Owner review translation needed.");
  lines.push("");
  drafts.forEach((draft, index) => {
    lines.push(`## FAQ ${index + 1}`);
    lines.push("");
    lines.push("Question:");
    lines.push(draft.question);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(phrases[`question.${draft.id}`] || phrases.question_fallback || "Owner review translation needed.");
    lines.push("");
    lines.push("Draft Answer:");
    lines.push(draft.answer);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(draft.zh_description);
    lines.push("");
    lines.push("Review Status:");
    lines.push(draft.review_status);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(draft.review_status === "needs_review" ? phrases.status_needs_review : phrases.status_draft_candidate);
    lines.push("");
    lines.push("Claim Validator:");
    lines.push(draft.claim_validator_decision);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(draft.claim_validator_decision === "pass" ? phrases.claim_pass : phrases.claim_needs_review);
    lines.push("");
    lines.push("Source Status:");
    lines.push(draft.source_status);
    lines.push("");
    lines.push(phrases.label_zh || "Chinese review note:");
    lines.push(BLOCKED_SOURCE_STATUSES.has(draft.source_status) ? phrases.source_blocked : phrases.source_reviewable);
    lines.push("");
  });
  lines.push("Final export note:");
  lines.push("No FAQPage Schema, Shopify FAQ Block, final FAQ page or automatic publishing is generated in Phase 5B.");
  lines.push("");
  lines.push(phrases.label_zh || "Chinese review note:");
  lines.push(phrases.final_export_note || "Owner review translation needed.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function checklistMarkdown() {
  const phrases = loadReviewPhrases();
  return `# FAQ Draft Review Checklist

- [ ] Confirm no medicalised claims.
- [ ] Confirm no cure / treat / diagnose language.
- [ ] Confirm no guaranteed results.
- [ ] Confirm no fake reviews or fake authority.
- [ ] Confirm no invented NHS association.
- [ ] Confirm no unverified product specifications.
- [ ] Confirm no unverified delivery, warranty or certification claims.
- [ ] Confirm all drafts are review-mode only.
- [ ] Confirm no FAQPage Schema generated.
- [ ] Confirm no Shopify FAQ Block generated.
- [ ] Confirm no automatic publishing.
- [ ] Confirm final export remains target-market language only.
- [ ] Confirm Publishing Safety Policy is followed.

${phrases.label_zh || "Chinese review note:"}
${phrases.checklist_note || "Owner review translation needed."}
`;
}

function generateFaqDrafts(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const requiredFiles = [
    ...REQUIRED_BRAND_FILES.map((file) => readFile(`brands/${brandId}/${file}`)),
    ...REQUIRED_GLOBAL_FILES.map(readFile),
  ];
  const missingFiles = requiredFiles.filter((file) => !file.ok);
  if (missingFiles.length > 0) {
    const report = {
      brand_id: brandId,
      decision: "blocked",
      risk_level: "high",
      total_faq_candidates: 0,
      drafts_generated: 0,
      blocked_drafts: 0,
      needs_review_drafts: 0,
      draft_candidate_ids: [],
      blocked_candidate_ids: [],
      claim_validator_summary: {},
      source_status_summary: {},
      publishing_mode: "review_mode",
      manual_review_required: true,
      publish_ready: false,
      generated_files: [],
      notes: missingFiles.map((file) => `Missing required file: ${file.path}`),
    };
    writeJson(brandId, "faq_draft_generation_report.json", report);
    return report;
  }

  const faqs = parseFaqBank(requiredFiles[0].content);
  const phrases = loadReviewPhrases();
  const validationReport = loadValidationReport(brandId);
  const validationNeedsReview = new Set((validationReport?.needs_review_entries || []).map((entry) => entry.id));
  const validationBlocked = new Set((validationReport?.blocked_entries || []).map((entry) => entry.id));
  const drafts = [];
  const blockedEntries = [];
  const claimSummary = {};
  const sourceStatusSummary = {};

  for (const entry of faqs) {
    sourceStatusSummary[entry.source_status || "missing"] = (sourceStatusSummary[entry.source_status || "missing"] || 0) + 1;
    if (entry.decision === "blocked" || validationBlocked.has(entry.id)) {
      blockedEntries.push({
        id: entry.id,
        question: entry.question,
        reason: ["decision is blocked"],
        claim_validator_decision: "not_run",
        source_status: entry.source_status || "missing",
        recommended_next_action: recommendedActions(entry, "blocked"),
      });
      continue;
    }

    const claimCheck = validateClaim(entry.answer_draft || "", { brandId });
    claimSummary[claimCheck.decision] = (claimSummary[claimCheck.decision] || 0) + 1;
    if (claimCheck.decision === "blocked") {
      blockedEntries.push({
        id: entry.id,
        question: entry.question,
        reason: ["risky answer_draft"],
        claim_validator_decision: claimCheck.decision,
        source_status: entry.source_status || "missing",
        recommended_next_action: recommendedActions(entry, claimCheck.decision),
      });
      continue;
    }

    const status = validationNeedsReview.has(entry.id) ? "needs_review" : reviewStatusFor(entry, claimCheck.decision);
    drafts.push({
      id: entry.id,
      question: entry.question,
      answer: entry.answer_draft,
      zh_description: zhDescriptionFor(entry, phrases),
      review_status: status,
      claim_validator_decision: claimCheck.decision,
      source_status: entry.source_status || "missing",
    });
  }

  const generatedFiles = [];
  generatedFiles.push(writeText(brandId, "faq_drafts_review.md", markdownForDrafts(brandId, drafts, phrases)));
  generatedFiles.push(writeJson(brandId, "blocked_faq_drafts_report.json", {
    brand_id: brandId,
    blocked_entries: blockedEntries,
    notes: [
      "Blocked FAQ candidates are not included in normal review drafts.",
      "No FAQPage Schema, Shopify FAQ Block, final FAQ page or automatic publishing is generated in Phase 5B.",
    ],
  }));
  generatedFiles.push(writeText(brandId, "faq_draft_review_checklist.md", checklistMarkdown()));

  const report = {
    brand_id: brandId,
    decision: blockedEntries.length > 0 ? "needs_review" : "needs_review",
    risk_level: blockedEntries.length > 0 ? "medium" : "medium",
    total_faq_candidates: faqs.length,
    drafts_generated: drafts.length,
    blocked_drafts: blockedEntries.length,
    needs_review_drafts: drafts.filter((draft) => draft.review_status === "needs_review").length,
    draft_candidate_ids: drafts.map((draft) => draft.id),
    blocked_candidate_ids: blockedEntries.map((entry) => entry.id),
    claim_validator_summary: claimSummary,
    source_status_summary: sourceStatusSummary,
    publishing_mode: "review_mode",
    manual_review_required: true,
    publish_ready: false,
    generated_files: [],
    notes: [
      "FAQ Draft Generator created review-mode drafts only.",
      "No final FAQ page, FAQPage Schema, Shopify FAQ Block or automatic publishing was generated.",
    ],
  };
  const reportPath = writeJson(brandId, "faq_draft_generation_report.json", {
    ...report,
    generated_files: [...generatedFiles, `outputs/${brandId}/faq/faq_draft_generation_report.json`],
  });
  return {
    ...report,
    generated_files: [...generatedFiles, reportPath],
  };
}

function zhDescriptionFor(entry, phrases) {
  if (entry.source_status === "needs_owner_confirmation") {
    return phrases.answer_needs_owner_confirmation || "Owner review translation needed.";
  }
  if (entry.claim_risk_level === "high") {
    return phrases.answer_high_risk || "Owner review translation needed.";
  }
  return phrases.answer_reviewable || "Owner review translation needed.";
}

function runCli() {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = generateFaqDrafts(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  generateFaqDrafts,
};
