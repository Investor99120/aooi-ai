const fs = require("fs");
const path = require("path");
const { parseYamlList } = require("../prompt_universe/prompt_universe_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";
const SELECTED_SURFACES = ["chatgpt", "gemini", "perplexity"];

const REQUIRED_FILES = [
  "prompt_universe/monitoring_readiness/priority_prompt_list.md",
  "prompt_universe/monitoring_readiness/ai_surface_matrix.md",
  "prompt_universe/monitoring_readiness/manual_answer_snapshot_template.md",
  "prompt_universe/monitoring_readiness/prompt_monitoring_readiness_report.json",
  "ai_answer_audit/manual_ai_answer_audit_report.json",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
}

function readFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  try {
    return { ok: true, relative_path: relativePath, content: fs.readFileSync(fullPath, "utf8") };
  } catch (error) {
    return { ok: false, relative_path: relativePath, content: "", error: error.message };
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

function selectPrompts(prompts) {
  const selected = [];
  const pick = (predicate) => {
    const found = prompts.find((prompt) => !selected.includes(prompt) && predicate(prompt));
    if (found) selected.push(found);
  };

  pick((prompt) => normalise(prompt.funnel_stage) === "bofu" || normalise(prompt.intent_cluster) === "purchase_decision");
  pick((prompt) => normalise(prompt.prompt_type) === "trust_objection" || normalise(prompt.intent_cluster) === "home_use_safety");
  pick((prompt) => ["comparison", "alternative"].includes(normalise(prompt.prompt_type)) || normalise(prompt.intent_cluster).includes("comparison"));
  pick((prompt) => normalise(prompt.prompt_type) === "routine_based");
  pick((prompt) => normalise(prompt.prompt_type) === "product_fit");

  for (const prompt of prompts) {
    if (selected.length >= 5) break;
    if (!selected.includes(prompt)) selected.push(prompt);
  }

  return selected.slice(0, 5);
}

function templateId(promptId, surface) {
  return `${promptId}_${surface}`;
}

function snapshotTemplate(brandId, prompt, surface) {
  return {
    audit_id: `manual_audit_batch_001_${templateId(prompt.id, surface)}`,
    brand_id: brandId,
    prompt_id: prompt.id,
    prompt_text: prompt.prompt,
    ai_surface: surface,
    test_date: "",
    test_location_or_market: "UK",
    answer_snapshot: "",
    brand_mentioned: null,
    brand_recommended: null,
    brand_position: null,
    competitors_mentioned: [],
    citations: [],
    source_urls: [],
    answer_framing: "",
    claim_risk_notes: [],
    brand_understanding_notes: [],
    manual_reviewer: "",
    review_status: "needs_review",
    contains_real_ai_answer: false,
    ai_platform_calls_used_by_system: false,
    scraping_used_by_system: false,
    manual_review_required: true,
  };
}

function buildCollectionPlan(brandId, selectedPrompts) {
  let markdown = "# Manual Snapshot Collection Plan\n\n";
  markdown += "This is a manual collection plan.\n\n";
  markdown += "It does not call AI platforms.\n\n";
  markdown += "It does not scrape answers.\n\n";
  markdown += "It does not prove AI visibility.\n\n";
  markdown += "It prepares 15 manual snapshot templates for future human testing.\n\n";
  markdown += "中文描述：\n这是人工采集计划，不调用 AI 平台，不抓取回答，不证明 AI 可见度，只准备 15 个未来人工测试用的 snapshot 模板。\n\n";
  markdown += `Brand: ${brandId}\n\n`;
  markdown += "## Selected Prompts\n\n";
  for (const prompt of selectedPrompts) {
    markdown += `- ${prompt.id}: ${prompt.prompt} (${prompt.prompt_type}, ${prompt.funnel_stage}, ${prompt.commercial_intent})\n`;
  }
  markdown += "\n## Selected AI Surfaces\n\n";
  markdown += "- ChatGPT\n- Gemini\n- Perplexity\n\n";
  markdown += "Google AI Overview and Google AI Mode are future surfaces because access and regional triggering can be unstable.\n\n";
  markdown += "中文描述：\nGoogle AI Overview 和 Google AI Mode 暂列为未来 surfaces，因为访问和地区触发条件可能不稳定。\n\n";
  markdown += "## Manual Collection Steps\n\n";
  markdown += "1. Open one AI surface manually.\n";
  markdown += "2. Paste the prompt exactly as written in the template.\n";
  markdown += "3. Copy the answer manually into `answer_snapshot`.\n";
  markdown += "4. Fill `test_date` and keep `test_location_or_market` as UK unless testing another market.\n";
  markdown += "5. Mark `brand_mentioned` and `brand_recommended` as true or false.\n";
  markdown += "6. Record `competitors_mentioned`, `citations` and `source_urls` when present.\n";
  markdown += "7. Add risky medical, authority or factual issues to `claim_risk_notes`.\n";
  markdown += "8. Keep `manual_review_required: true`.\n\n";
  markdown += "AI answers are not verified facts.\n\n";
  markdown += "中文描述：\nAI 回答不是已验证事实。\n";
  return markdown;
}

function buildMatrix(selectedPrompts) {
  let markdown = "# Selected Prompt Surface Matrix\n\n";
  markdown += "This matrix is for manual testing preparation only.\n\n";
  markdown += "中文描述：\n此矩阵仅用于人工测试准备。\n\n";
  markdown += "| snapshot_template_id | prompt_id | prompt_text | prompt_type | funnel_stage | commercial_intent | claim_risk_level | ai_surface | manual_test_required | review_status |\n";
  markdown += "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n";
  for (const prompt of selectedPrompts) {
    for (const surface of SELECTED_SURFACES) {
      markdown += `| ${templateId(prompt.id, surface)} | ${prompt.id} | ${prompt.prompt} | ${prompt.prompt_type} | ${prompt.funnel_stage} | ${prompt.commercial_intent} | ${prompt.claim_risk_level} | ${surface} | true | needs_review |\n`;
    }
  }
  return markdown;
}

function buildTemplatesReadme() {
  return `# Snapshot Templates

These JSON files are empty manual snapshot templates.

中文描述：
这些 JSON 文件是空白人工 snapshot 模板。

Do not treat them as real AI answers. Fill one file only after manually testing one prompt on one AI surface.

中文描述：
不要把它们当作真实 AI 回答。只有在人工测试某个 prompt 和某个平台后，才填写对应文件。
`;
}

function buildChecklist() {
  return `# Manual Snapshot Collection Checklist

This checklist is for manual collection only.

中文描述：
此清单仅用于人工采集。

- [ ] Confirm AI answer was collected manually.
- [ ] Confirm no system AI call was used.
- [ ] Confirm no scraping was used.
- [ ] Confirm answer_snapshot was pasted manually.
- [ ] Confirm test_date was filled.
- [ ] Confirm ai_surface was filled.
- [ ] Confirm brand_mentioned was marked true / false.
- [ ] Confirm brand_recommended was marked true / false.
- [ ] Confirm competitors_mentioned was reviewed.
- [ ] Confirm citations and source_urls were recorded if present.
- [ ] Confirm risky medical or authority claims were noted.
- [ ] Confirm AI answer is not treated as verified fact.
- [ ] Confirm manual_review_required remains true.
- [ ] Confirm no visibility score is generated in this phase.

中文描述：
请确认回答由人工采集，系统没有调用 AI 或抓取；AI 回答不能当作已验证事实，本阶段不生成 visibility score。
`;
}

function buildManualSnapshotPack(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const outputDir = `outputs/${brandId}/ai_answer_audit/manual_snapshot_pack`;
  const templatesDir = `${outputDir}/snapshot_templates`;
  const sourceFiles = {};

  const requiredPaths = [
    ...REQUIRED_FILES.map((file) => `outputs/${brandId}/${file}`),
    `brands/${brandId}/prompt_universe.yml`,
    `brands/${brandId}/prompt_clusters.yml`,
  ];
  for (const file of requiredPaths) {
    const status = readFile(file);
    sourceFiles[file] = { exists: status.ok, error: status.ok ? null : status.error };
  }

  const missingFiles = Object.entries(sourceFiles).filter(([, status]) => !status.exists).map(([file]) => file);
  const promptFile = readFile(`brands/${brandId}/prompt_universe.yml`);
  const prompts = promptFile.ok ? parseYamlList(promptFile.content, "prompts") : [];
  const selectedPrompts = selectPrompts(prompts);
  const templateFiles = [];

  writeText(`${outputDir}/manual_snapshot_collection_plan.md`, buildCollectionPlan(brandId, selectedPrompts));
  writeText(`${outputDir}/selected_prompt_surface_matrix.md`, buildMatrix(selectedPrompts));
  writeText(`${templatesDir}/README.md`, buildTemplatesReadme());
  writeText(`${outputDir}/manual_snapshot_collection_checklist.md`, buildChecklist());

  for (const prompt of selectedPrompts) {
    for (const surface of SELECTED_SURFACES) {
      const fileName = `${templateId(prompt.id, surface)}.snapshot.template.json`;
      const relativePath = `${templatesDir}/${fileName}`;
      writeJson(relativePath, snapshotTemplate(brandId, prompt, surface));
      templateFiles.push(relativePath);
    }
  }

  const manifest = {
    brand_id: brandId,
    phase: "8E",
    batch_id: `${brandId}_manual_audit_batch_001`,
    selected_prompt_count: selectedPrompts.length,
    selected_surface_count: SELECTED_SURFACES.length,
    snapshot_template_count: templateFiles.length,
    contains_real_ai_answers: false,
    ai_platform_calls_used_by_system: false,
    scraping_used_by_system: false,
    visibility_score_generated: false,
    manual_review_required: true,
    selected_surfaces: SELECTED_SURFACES,
    template_files: templateFiles,
    notes: [
      "Snapshot templates are empty. They do not contain real AI answers.",
    ],
  };
  writeJson(`${outputDir}/manual_snapshot_batch_manifest.json`, manifest);

  const report = {
    brand_id: brandId,
    phase: "8E",
    decision: missingFiles.length > 0 ? "blocked" : "needs_review",
    risk_level: missingFiles.length > 0 ? "high" : "medium",
    selected_prompt_count: selectedPrompts.length,
    selected_surface_count: SELECTED_SURFACES.length,
    snapshot_template_count: templateFiles.length,
    outputs_generated: [
      `${outputDir}/manual_snapshot_collection_plan.md`,
      `${outputDir}/selected_prompt_surface_matrix.md`,
      `${outputDir}/manual_snapshot_batch_manifest.json`,
      `${templatesDir}/README.md`,
      ...templateFiles,
      `${outputDir}/manual_snapshot_collection_checklist.md`,
      `${outputDir}/manual_snapshot_pack_report.json`,
    ],
    boundary_status: {
      contains_real_ai_answers: false,
      ai_platform_calls_used_by_system: false,
      scraping_used_by_system: false,
      automated_monitoring_run: false,
      visibility_score_generated: false,
      seo_content_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
    },
    manual_review_required: true,
    publish_ready: false,
    missing_files: missingFiles,
    notes: [
      "Manual snapshot pack created with empty templates only.",
    ],
  };
  writeJson(`${outputDir}/manual_snapshot_pack_report.json`, report);
  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildManualSnapshotPack(brandId), null, 2)}\n`);
}

module.exports = {
  buildManualSnapshotPack,
};
