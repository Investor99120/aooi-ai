const fs = require("fs");
const path = require("path");
const { validateManualSnapshots, listSnapshotFiles } = require("./manual_ai_answer_audit_validator");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DEFAULT_BRAND_ID = "friendredlight";

const REQUIRED_SOURCE_FILES = [
  "prompt_universe/monitoring_readiness/priority_prompt_list.md",
  "prompt_universe/monitoring_readiness/ai_surface_matrix.md",
  "prompt_universe/monitoring_readiness/manual_answer_snapshot_template.md",
  "prompt_universe/monitoring_readiness/mention_extraction_template.json",
  "prompt_universe/monitoring_readiness/citation_recording_template.json",
  "prompt_universe/monitoring_readiness/risk_annotation_template.json",
];

function safeBrandId(brandId) {
  return String(brandId || DEFAULT_BRAND_ID).replace(/[^a-zA-Z0-9_-]/g, "");
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

function fileStatus(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  return {
    exists: fs.existsSync(fullPath),
    path: relativePath,
  };
}

function readSnapshot(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return null;
  }
}

function countTruthy(snapshots, key) {
  return snapshots.filter((snapshot) => snapshot && snapshot[key] === true).length;
}

function countArrayItems(snapshots, key) {
  return snapshots.reduce((count, snapshot) => {
    if (!snapshot || !Array.isArray(snapshot[key])) return count;
    return count + snapshot[key].length;
  }, 0);
}

function buildSummaryMarkdown(brandId, report) {
  let markdown = "# Manual AI Answer Audit Summary\n\n";
  markdown += "This is a manual audit framework.\n\n";
  markdown += "It does not call AI platforms.\n\n";
  markdown += "It does not scrape external data.\n\n";
  markdown += "It does not generate AI visibility score.\n\n";
  markdown += "It does not prove GEO exposure.\n\n";
  markdown += "It only summarises manually provided snapshots.\n\n";
  markdown += "中文描述：\n这是人工 AI 回答审计框架，不调用 AI 平台，不抓取外部数据，不生成 AI visibility score，也不证明 GEO 曝光，只总结人工提供的回答快照。\n\n";
  markdown += `Brand: ${brandId}\n\n`;
  markdown += `Decision: ${report.decision}\n\n`;
  markdown += `Snapshots found: ${report.snapshot_summary.snapshots_found}\n\n`;
  if (report.snapshot_summary.snapshots_found === 0) {
    markdown += "No manual AI answer snapshots were found.\n\n";
    markdown += "中文描述：\n当前没有发现人工 AI 回答快照。\n\n";
  }
  markdown += `Brand mentions: ${report.mention_summary.brand_mentions}\n\n`;
  markdown += `Brand recommendations: ${report.mention_summary.brand_recommendations}\n\n`;
  markdown += `Competitor mentions: ${report.mention_summary.competitor_mentions}\n\n`;
  markdown += `Citations present: ${report.mention_summary.citations_present}\n`;
  return markdown;
}

function buildChecklist() {
  return `# Manual AI Answer Audit Checklist

This checklist is for review-mode manual AI answer audits only.

中文描述：
此清单仅用于 review-mode 人工 AI 回答审计。

- [ ] Confirm snapshots were manually provided.
- [ ] Confirm no AI platform was called by the system.
- [ ] Confirm no scraping was used.
- [ ] Confirm no automated monitoring was run.
- [ ] Confirm no visibility score was generated.
- [ ] Confirm AI answers are not treated as verified facts.
- [ ] Confirm citations require source review.
- [ ] Confirm competitor mentions are not treated as share of voice yet.
- [ ] Confirm risky medical or authority claims are flagged.
- [ ] Confirm manual review remains required.
- [ ] Confirm no publishing happened.

中文描述：
请确认所有快照来自人工提供，系统没有调用 AI 平台或抓取外部数据；AI 回答不能直接当作已验证事实，citation 和竞品提及仍需后续审核。
`;
}

function buildManualSnapshotsReadme(brandId) {
  return `# Manual Snapshots

This folder is for future manually collected AI answer snapshots for ${brandId}.

中文描述：
此文件夹用于未来存放 ${brandId} 的人工 AI 回答快照。

## How To Add A Snapshot

- Copy one AI answer manually.
- Create one JSON file per answer.
- Follow \`engines/ai_answer_audit/examples/manual_answer_snapshot.example.json\`.
- Do not paste private user data.
- Do not treat AI answer as verified fact.
- Keep \`manual_review_required: true\`.

中文描述：
请人工复制单条 AI 回答，每条回答一个 JSON 文件；不要粘贴隐私数据，不要把 AI 回答当作已验证事实，并保持 \`manual_review_required: true\`。
`;
}

function buildManualAudit(brandIdInput = DEFAULT_BRAND_ID) {
  const brandId = safeBrandId(brandIdInput);
  const outputDir = `outputs/${brandId}/ai_answer_audit`;
  const manualDir = `${outputDir}/manual_snapshots`;

  writeText(`${manualDir}/README.md`, buildManualSnapshotsReadme(brandId));

  const sourceFiles = {};
  for (const file of REQUIRED_SOURCE_FILES) {
    const relativePath = `outputs/${brandId}/${file}`;
    sourceFiles[relativePath] = fileStatus(relativePath);
  }

  const validation = validateManualSnapshots(brandId);
  const snapshotFiles = listSnapshotFiles(brandId);
  const snapshots = snapshotFiles.map(readSnapshot).filter(Boolean);
  const matchedRiskTerms = [...new Set(validation.results.flatMap((result) => result.matched_risk_terms || []))];

  const report = {
    brand_id: brandId,
    phase: "8D",
    decision: validation.decision,
    risk_level: validation.risk_level,
    source_files: sourceFiles,
    snapshot_summary: {
      snapshots_found: validation.snapshot_files_found,
      snapshots_valid: validation.snapshots_valid,
      snapshots_needs_review: validation.snapshots_needs_review,
      snapshots_blocked: validation.snapshots_blocked,
    },
    mention_summary: {
      brand_mentions: countTruthy(snapshots, "brand_mentioned"),
      brand_recommendations: countTruthy(snapshots, "brand_recommended"),
      competitor_mentions: countArrayItems(snapshots, "competitors_mentioned"),
      citations_present: snapshots.filter((snapshot) => Array.isArray(snapshot.citations) && snapshot.citations.length > 0).length,
    },
    risk_summary: {
      matched_risk_terms: matchedRiskTerms,
      wrong_brand_description_risk: 0,
      invented_authority_risk: matchedRiskTerms.filter((term) => ["nhs approved", "doctor recommended"].includes(term)).length,
      medical_claim_risk: matchedRiskTerms.length,
      unverified_fact_risk: 0,
    },
    monitoring_boundary: {
      manual_audit_only: true,
      ai_platform_calls_used_by_system: false,
      scraping_used_by_system: false,
      visibility_score_generated: false,
      automated_monitoring_run: false,
    },
    non_generation_boundary: {
      seo_content_generated: false,
      shopify_api_used: false,
      auto_publish_used: false,
      faqpage_schema_generated: false,
      product_schema_generated: false,
    },
    manual_review_required: true,
    publish_ready: false,
    notes: validation.snapshot_files_found === 0
      ? ["No manual snapshots found. Manual audit report is a readiness shell only."]
      : ["Manual snapshots were summarised as review-only observations."],
  };

  const blockedItems = {
    brand_id: brandId,
    blocked_items: validation.results
      .filter((result) => result.decision === "blocked")
      .map((result) => ({
        audit_id: result.audit_id,
        prompt_id: result.prompt_id,
        reason: result.blocked_reasons,
        matched_terms: result.matched_risk_terms,
        recommended_next_action: [
          "Keep this snapshot out of any future visibility summary until corrected.",
          "Review required fields, source handling and risk terms.",
        ],
      })),
    notes: validation.snapshot_files_found === 0
      ? ["No manual snapshots found."]
      : ["Blocked manual snapshots must not be used for future visibility summaries."],
  };

  writeJson(`${outputDir}/manual_ai_answer_audit_report.json`, report);
  writeText(`${outputDir}/manual_ai_answer_audit_summary.md`, buildSummaryMarkdown(brandId, report));
  writeJson(`${outputDir}/manual_ai_answer_audit_blocked_items_report.json`, blockedItems);
  writeText(`${outputDir}/manual_ai_answer_audit_checklist.md`, buildChecklist());

  return report;
}

if (require.main === module) {
  const brandId = process.argv[2] || DEFAULT_BRAND_ID;
  process.stdout.write(`${JSON.stringify(buildManualAudit(brandId), null, 2)}\n`);
}

module.exports = {
  buildManualAudit,
};
