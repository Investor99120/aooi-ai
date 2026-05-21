const fs = require("fs");
const path = require("path");
const { parseYamlList } = require("./prompt_universe_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const AI_SURFACES = [
  {
    surface: "ChatGPT",
    future_test_type: "manual_prompt_test",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "depends_on_answer_mode",
    login_or_access_notes: "manual reviewer access required in future phase",
    risk_notes: "do not treat manual answer as stable ranking evidence",
    current_status: "not_implemented",
  },
  {
    surface: "Gemini",
    future_test_type: "manual_prompt_test",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "depends_on_answer_mode",
    login_or_access_notes: "manual reviewer access required in future phase",
    risk_notes: "do not infer Google AI Overview visibility from Gemini alone",
    current_status: "not_implemented",
  },
  {
    surface: "Perplexity",
    future_test_type: "manual_prompt_test",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "yes_when_sources_are_shown",
    login_or_access_notes: "manual reviewer access required in future phase",
    risk_notes: "citation quality must be reviewed manually",
    current_status: "not_implemented",
  },
  {
    surface: "Google AI Overview",
    future_test_type: "manual_search_observation",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "yes_when_overview_is_available",
    login_or_access_notes: "availability may vary by location, account and query",
    risk_notes: "do not claim visibility from a single observation",
    current_status: "not_implemented",
  },
  {
    surface: "Google AI Mode",
    future_test_type: "manual_prompt_test",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "depends_on_interface",
    login_or_access_notes: "availability may vary by account and region",
    risk_notes: "do not mix AI Mode output with organic ranking claims",
    current_status: "not_implemented",
  },
  {
    surface: "Future AI Shopping Agent",
    future_test_type: "future_manual_product_recommendation_test",
    manual_test_allowed: false,
    automated_test_allowed_future: false,
    citation_capture_possible: "unknown",
    login_or_access_notes: "future surface only",
    risk_notes: "planning placeholder, not an active channel",
    current_status: "not_implemented",
  },
  {
    surface: "Generic AI Search",
    future_test_type: "manual_prompt_test",
    manual_test_allowed: true,
    automated_test_allowed_future: false,
    citation_capture_possible: "depends_on_surface",
    login_or_access_notes: "surface-specific notes required in future audit",
    risk_notes: "record exact surface before storing any future answer snapshot",
    current_status: "not_implemented",
  },
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
      content: fs.readFileSync(fullPath, "utf8"),
    };
  } catch (error) {
    return {
      ok: false,
      relative_path: relativePath,
      content: "",
      error: error.message,
    };
  }
}

function readJson(relativePath) {
  const file = readFile(relativePath);
  if (!file.ok) return { ok: false, relative_path: relativePath, value: null, error: file.error };
  try {
    return { ok: true, relative_path: relativePath, value: JSON.parse(file.content) };
  } catch (error) {
    return { ok: false, relative_path: relativePath, value: null, error: error.message };
  }
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(ROOT_DIR, relativePath), { recursive: true });
}

function writeText(relativePath, content) {
  ensureDir(path.dirname(relativePath));
  fs.writeFileSync(path.join(ROOT_DIR, relativePath), content);
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function normalise(value) {
  return String(value === undefined || value === null ? "" : value).trim().toLowerCase();
}

function isBlockedPrompt(prompt, blockedIds) {
  return blockedIds.has(prompt.id) || normalise(prompt.decision) === "blocked";
}

function promptNeedsReview(prompt, validationReport) {
  if (normalise(prompt.claim_risk_level) === "high") return true;
  if (normalise(prompt.source_status) === "needs_research") return true;
  if (normalise(prompt.source_status) === "needs_owner_confirmation") return true;
  if (normalise(prompt.content_generation_eligible) === "needs_review") return true;
  return (validationReport.matched_risk_terms || []).length > 0 && normalise(prompt.prompt).includes("medical device");
}

function priorityBucket(prompt) {
  const intent = normalise(prompt.intent_cluster);
  const type = normalise(prompt.prompt_type);
  const funnel = normalise(prompt.funnel_stage);
  if (funnel === "bofu" || intent === "purchase_decision") return "A. High Priority BOFU / Purchase Decision Prompts";
  if (type === "trust_objection" || intent === "trust_and_claim_boundaries") return "B. Trust Objection Prompts";
  if (intent === "uk_market_research" || type === "local_market") return "C. UK Local Market Prompts";
  if (type === "comparison" || type === "alternative" || intent === "competitor_alternatives" || intent === "product_comparison") {
    return "D. Comparison / Alternative Prompts";
  }
  if (type === "routine_based" || intent === "routine_and_lifestyle") return "E. Routine-Based Prompts";
  return "F. Education / TOFU Prompts";
}

function buildPriorityPromptList(brandId, prompts, blockedIds, validationReport) {
  const groups = new Map();
  for (const prompt of prompts) {
    if (isBlockedPrompt(prompt, blockedIds)) continue;
    const bucket = priorityBucket(prompt);
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket).push(prompt);
  }

  const orderedBuckets = [
    "A. High Priority BOFU / Purchase Decision Prompts",
    "B. Trust Objection Prompts",
    "C. UK Local Market Prompts",
    "D. Comparison / Alternative Prompts",
    "E. Routine-Based Prompts",
    "F. Education / TOFU Prompts",
  ];

  let markdown = `# ${brandId} Priority Prompt List\n\n`;
  markdown += "This is a monitoring readiness list, not AI visibility evidence.\n\n";
  markdown += "中文描述：\n这是未来监测准备清单，不是 AI 可见度证据。\n\n";
  markdown += "No search volume, AI exposure, AI recommendation status or competitor share of voice is claimed here.\n\n";
  markdown += "中文描述：\n这里不声明搜索量、AI 曝光、AI 推荐状态或竞品声量。\n\n";

  for (const bucket of orderedBuckets) {
    const items = groups.get(bucket) || [];
    markdown += `## ${bucket}\n\n`;
    if (items.length === 0) {
      markdown += "No prompt candidates in this group.\n\n";
      continue;
    }
    for (const prompt of items) {
      const reviewStatus = promptNeedsReview(prompt, validationReport) ? "needs_review" : "candidate";
      markdown += `### ${prompt.id}\n\n`;
      markdown += `Prompt: ${prompt.prompt}\n\n`;
      markdown += `Cluster: ${prompt.intent_cluster}\n\n`;
      markdown += `Funnel stage: ${prompt.funnel_stage}\n\n`;
      markdown += `Commercial intent: ${prompt.commercial_intent}\n\n`;
      markdown += `Claim risk level: ${prompt.claim_risk_level}\n\n`;
      markdown += `Source status: ${prompt.source_status}\n\n`;
      markdown += `Monitoring readiness: ${reviewStatus}\n\n`;
    }
  }

  return markdown;
}

function buildAiSurfaceMatrix() {
  let markdown = "# AI Surface Matrix\n\n";
  markdown += "Phase 8C does not call these AI surfaces.\n\n";
  markdown += "中文描述：\nPhase 8C 不调用这些 AI 平台。\n\n";
  markdown += "| surface | future_test_type | manual_test_allowed | automated_test_allowed_future | citation_capture_possible | login_or_access_notes | risk_notes | current_status |\n";
  markdown += "| --- | --- | --- | --- | --- | --- | --- | --- |\n";
  for (const surface of AI_SURFACES) {
    markdown += `| ${surface.surface} | ${surface.future_test_type} | ${surface.manual_test_allowed} | ${surface.automated_test_allowed_future} | ${surface.citation_capture_possible} | ${surface.login_or_access_notes} | ${surface.risk_notes} | ${surface.current_status} |\n`;
  }
  return markdown;
}

function buildManualSnapshotTemplate(brandId) {
  return `# Manual Answer Snapshot Template\n\nThis template is for future manual audit only. It contains no real AI answer data in Phase 8C.\n\n中文描述：\n这个模板只用于未来人工审计。Phase 8C 不包含真实 AI 回答数据。\n\n- audit_id:\n- brand_id: ${brandId}\n- prompt_id:\n- prompt_text:\n- ai_surface:\n- test_date:\n- test_location_or_market:\n- answer_snapshot:\n- brand_mentioned:\n- brand_recommended:\n- brand_position:\n- competitors_mentioned:\n- citations:\n- source_urls:\n- answer_framing:\n- claim_risk_notes:\n- brand_understanding_notes:\n- manual_reviewer:\n- review_status:\n`;
}

function buildChecklist() {
  return `# Prompt Monitoring Readiness Checklist\n\nThis checklist is for internal review only. It is not AI answer monitoring.\n\n中文描述：\n此清单仅用于内部审核，不是 AI answer monitoring。\n\n- [ ] Confirm this is not AI answer monitoring.\n- [ ] Confirm no AI platform was called.\n- [ ] Confirm no scraping was used.\n- [ ] Confirm no real AI answers were stored.\n- [ ] Confirm no visibility score was generated.\n- [ ] Confirm no SEO content was generated.\n- [ ] Confirm no Shopify API was used.\n- [ ] Confirm no publishing happened.\n- [ ] Confirm priority prompts are monitoring candidates only.\n- [ ] Confirm competitor prompts are planning candidates only.\n- [ ] Confirm no search volume was invented.\n- [ ] Confirm no share of voice was invented.\n- [ ] Confirm future manual audit is required.\n\n中文描述：\n请确认这些文件只是未来人工 AI 回答审计的准备材料，不代表已经监测、不代表有真实 AI 回答、不代表可见度分数。\n`;
}

function buildMentionTemplate(brandId) {
  return {
    brand_id: brandId,
    template_type: "mention_extraction_template",
    phase: "8C",
    contains_real_ai_answer: false,
    fields: {
      prompt_id: "",
      ai_surface: "",
      brand_mentioned: null,
      brand_recommended: null,
      brand_position: null,
      competitors_mentioned: [],
      share_of_voice_candidate: null,
      answer_framing: "",
      notes: [],
    },
    ai_platform_calls_used: false,
    scraping_used: false,
    manual_review_required: true,
  };
}

function buildCitationTemplate(brandId) {
  return {
    brand_id: brandId,
    template_type: "citation_recording_template",
    phase: "8C",
    contains_real_citations: false,
    fields: {
      prompt_id: "",
      ai_surface: "",
      citations_present: null,
      brand_owned_sources: [],
      third_party_sources: [],
      competitor_sources: [],
      source_quality_notes: [],
      outdated_source_risk: null,
    },
    ai_platform_calls_used: false,
    scraping_used: false,
    manual_review_required: true,
  };
}

function buildRiskTemplate(brandId) {
  return {
    brand_id: brandId,
    template_type: "risk_annotation_template",
    phase: "8C",
    contains_real_ai_answer: false,
    risk_fields: {
      medical_claim_risk: null,
      fake_review_risk: null,
      invented_authority_risk: null,
      wrong_brand_description_risk: null,
      competitor_overclaim_risk: null,
      unverified_product_fact_risk: null,
      bilingual_leakage_risk: null,
    },
    manual_review_required: true,
    notes: [],
  };
}

function buildReadinessPack(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const outputDir = `outputs/${brandId}/prompt_universe/monitoring_readiness`;
  const requiredFiles = [
    `brands/${brandId}/prompt_universe.yml`,
    `brands/${brandId}/prompt_clusters.yml`,
    `brands/${brandId}/competitor_prompt_map.yml`,
    `outputs/${brandId}/prompt_universe/prompt_universe_validation_report.json`,
    `outputs/${brandId}/prompt_universe/prompt_universe_blocked_items_report.json`,
    "docs/PROMPT_UNIVERSE_POLICY.md",
    "docs/PROMPT_UNIVERSE_FIELD_GUIDE.md",
    "docs/AI_VISIBILITY_METRICS_DRAFT.md",
  ];

  const sourceFiles = {};
  const fileResults = Object.fromEntries(requiredFiles.map((file) => {
    const result = file.endsWith(".json") ? readJson(file) : readFile(file);
    sourceFiles[file] = {
      exists: result.ok,
      error: result.ok ? null : result.error,
    };
    return [file, result];
  }));

  const missingFiles = Object.entries(sourceFiles)
    .filter(([, status]) => !status.exists)
    .map(([file]) => file);

  const promptFile = fileResults[`brands/${brandId}/prompt_universe.yml`];
  const prompts = promptFile.ok ? parseYamlList(promptFile.content, "prompts") : [];
  const validationReportResult = fileResults[`outputs/${brandId}/prompt_universe/prompt_universe_validation_report.json`];
  const validationReport = validationReportResult.ok ? validationReportResult.value : {};
  const blockedReportResult = fileResults[`outputs/${brandId}/prompt_universe/prompt_universe_blocked_items_report.json`];
  const blockedItems = blockedReportResult.ok ? (blockedReportResult.value.blocked_items || []) : [];
  const blockedIds = new Set(blockedItems.map((item) => item.id));

  const priorityPrompts = prompts.filter((prompt) => !isBlockedPrompt(prompt, blockedIds));
  const needsReviewPrompts = priorityPrompts.filter((prompt) => promptNeedsReview(prompt, validationReport));

  const generatedFiles = [
    `${outputDir}/priority_prompt_list.md`,
    `${outputDir}/ai_surface_matrix.md`,
    `${outputDir}/manual_answer_snapshot_template.md`,
    `${outputDir}/mention_extraction_template.json`,
    `${outputDir}/citation_recording_template.json`,
    `${outputDir}/risk_annotation_template.json`,
    `${outputDir}/prompt_monitoring_readiness_report.json`,
    `${outputDir}/prompt_monitoring_readiness_checklist.md`,
  ];

  writeText(`${outputDir}/priority_prompt_list.md`, buildPriorityPromptList(brandId, prompts, blockedIds, validationReport));
  writeText(`${outputDir}/ai_surface_matrix.md`, buildAiSurfaceMatrix());
  writeText(`${outputDir}/manual_answer_snapshot_template.md`, buildManualSnapshotTemplate(brandId));
  writeJson(`${outputDir}/mention_extraction_template.json`, buildMentionTemplate(brandId));
  writeJson(`${outputDir}/citation_recording_template.json`, buildCitationTemplate(brandId));
  writeJson(`${outputDir}/risk_annotation_template.json`, buildRiskTemplate(brandId));
  writeText(`${outputDir}/prompt_monitoring_readiness_checklist.md`, buildChecklist());

  const decision = missingFiles.length > 0 ? "blocked" : needsReviewPrompts.length > 0 ? "needs_review" : "pass";
  const report = {
    brand_id: brandId,
    decision,
    risk_level: decision === "blocked" ? "high" : decision === "needs_review" ? "medium" : "low",
    phase: "8C",
    source_files: sourceFiles,
    readiness_summary: {
      total_prompts_checked: prompts.length,
      priority_prompts_selected: priorityPrompts.length,
      needs_review_prompts: needsReviewPrompts.length,
      blocked_prompts_excluded: blockedItems.length,
      ai_surfaces_listed: AI_SURFACES.length,
    },
    outputs_generated: generatedFiles,
    monitoring_status: {
      ai_answer_monitoring_run: false,
      ai_platform_calls_used: false,
      scraping_used: false,
      visibility_measured: false,
      real_ai_answers_stored: false,
    },
    non_generation_status: {
      seo_content_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
      faqpage_schema_generated: false,
      product_schema_generated: false,
    },
    template_status: {
      manual_answer_snapshot_template_created: true,
      mention_extraction_template_created: true,
      citation_recording_template_created: true,
      risk_annotation_template_created: true,
    },
    manual_review_required: true,
    notes: missingFiles.length > 0
      ? ["Missing source files prevent a pass decision. No real monitoring has been run."]
      : ["Readiness pack created from prompt candidates only. No real monitoring has been run."],
  };

  writeJson(`${outputDir}/prompt_monitoring_readiness_report.json`, report);
  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  const report = buildReadinessPack(brandId);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

module.exports = {
  buildReadinessPack,
};
